const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../src/app');
const db = require('../src/config/database');

const dados = { titulo: 'Computador não liga', descricao: 'Não inicia.', prioridade: 'ALTA', solicitante_id: 1, categoria_id: 2 };
const registro = { id: 3, ...dados, status: 'ABERTO', solicitante_nome: 'Ana', setor: 'TI', categoria_nome: 'Hardware', tecnico_id: null, tecnico_nome: null };

test('Rotas de chamados', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    await new Promise(resolve => server.close(resolve));
    await db.end();
  });
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port + '/chamados';
  const enviar = (method, path, body) => fetch(url + path, {
    method, headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });

  for (const linhas of [[], [registro]]) {
    await t.test('GET lista: ' + linhas.length + ' registros', async (t) => {
      t.mock.method(db, 'execute', async () => [linhas]);
      const res = await enviar('GET', '');
      assert.equal(res.status, 200);
      assert.deepEqual(await res.json(), linhas);
    });
  }
  await t.test('GET por ID parametrizado e dados relacionados', async (t) => {
    t.mock.method(db, 'execute', async (sql, params) => {
      assert.match(sql, /WHERE ch.id = \?/);
      assert.deepEqual(params, [3]);
      return [[registro]];
    });
    const res = await enviar('GET', '/3');
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), registro);
  });
  await t.test('GET inexistente retorna 404', async (t) => {
    t.mock.method(db, 'execute', async () => [[]]);
    assert.equal((await enviar('GET', '/3')).status, 404);
  });

  await t.test('POST parametrizado mantém ABERTO mesmo recebendo outro status válido', async (t) => {
    let consultas = 0;
    const titulo = "Teste'); DROP TABLE x; --";
    t.mock.method(db, 'execute', async (sql, params) => {
      consultas++;
      if (sql.includes('FROM solicitantes WHERE')) return [[{ id: 1 }]];
      if (sql.includes('FROM categorias WHERE')) return [[{ id: 2 }]];
      if (sql.includes('INSERT INTO chamados')) {
        assert.ok(!sql.includes(titulo));
        assert.ok(sql.includes("'ABERTO', NULL"));
        assert.deepEqual(params, [titulo, dados.descricao, 'ALTA', 1, 2]);
        return [{ insertId: 3 }];
      }
      assert.deepEqual(params, [3]);
      return [[{ ...registro, titulo }]];
    });
    const res = await enviar('POST', '', { ...dados, titulo, status: 'CONCLUIDO', tecnico_id: 99 });
    assert.equal(res.status, 201);
    assert.equal(res.headers.get('location'), '/chamados/3');
    const body = await res.json();
    assert.equal(body.status, 'ABERTO');
    assert.equal(body.tecnico_id, null);
    assert.equal(consultas, 4);
  });

  for (const campo of ['solicitante', 'categoria']) {
    await t.test('POST: ' + campo + ' inexistente não insere', async (t) => {
      const consulta = t.mock.method(db, 'execute', async (sql) => {
        assert.ok(!sql.includes('INSERT'));
        if (campo === 'solicitante') return [[]];
        if (sql.includes('FROM solicitantes')) return [[{ id: 1 }]];
        return [[]];
      });
      const res = await enviar('POST', '', dados);
      assert.equal(res.status, 400);
      assert.match((await res.json()).mensagem, new RegExp(campo));
      assert.equal(consulta.mock.callCount(), campo === 'solicitante' ? 1 : 2);
    });
  }

  const invalidos = [undefined, null, [], {}, { ...dados, titulo: 'a'.repeat(51) }, { ...dados, prioridade: 'a'.repeat(11) }, { ...dados, descricao: 'á'.repeat(32768) }];
  for (const prioridade of ['URGENTE', 'NORMAL', 'MÉDIA', '1']) {
    invalidos.push({ ...dados, prioridade });
  }
  for (const status of ['FECHADO', 'CANCELADO', '', '   ', null, 1, true, {}]) {
    invalidos.push({ ...dados, status });
  }

  for (const prioridade of ['BAIXA', 'MEDIA', 'ALTA', ' baixa ', 'Media', 'alta']) {
    await t.test('POST normaliza prioridade: ' + prioridade, async (t) => {
      const esperada = prioridade.trim().toUpperCase();
      t.mock.method(db, 'execute', async (sql, params) => {
        if (sql.includes('INSERT INTO chamados')) {
          assert.equal(params[2], esperada);
          return [{ insertId: 3 }];
        }
        if (sql.includes('FROM chamados')) return [[{ ...registro, prioridade: esperada }]];
        return [[{ id: 1 }]];
      });
      const res = await enviar('POST', '', { ...dados, prioridade });
      assert.equal(res.status, 201);
      assert.equal((await res.json()).prioridade, esperada);
    });
  }
  for (const status of ['ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO', ' aberto ', 'em_andamento', 'concluido']) {
    await t.test('POST valida status e cria ABERTO: ' + status, async (t) => {
      t.mock.method(db, 'execute', async sql => {
        if (sql.includes('INSERT INTO chamados')) {
          assert.ok(sql.includes("'ABERTO', NULL"));
          return [{ insertId: 3 }];
        }
        if (sql.includes('FROM chamados')) return [[registro]];
        return [[{ id: 1 }]];
      });
      const res = await enviar('POST', '', { ...dados, status });
      assert.equal(res.status, 201);
      assert.equal((await res.json()).status, 'ABERTO');
    });
  }
  for (const campo of ['titulo', 'descricao', 'prioridade', 'solicitante_id', 'categoria_id']) {
    const ausente = { ...dados };
    delete ausente[campo];
    invalidos.push(ausente);
    for (const valor of ['', '   ', null, {}, true]) invalidos.push({ ...dados, [campo]: valor });
  }
  for (const [i, body] of invalidos.entries()) {
    await t.test('POST: dados inválidos ' + i, async (t) => {
      const consulta = t.mock.method(db, 'execute', async () => { throw new Error('Não deveria acessar o banco'); });
      assert.equal((await enviar('POST', '', body)).status, 400);
      assert.equal(consulta.mock.callCount(), 0);
    });
  }
  for (const id of ['abc', '0', '-1', '1.5', '1e2', '2147483648', '1%20OR%201=1']) {
    await t.test('GET: ID inválido ' + id, async (t) => {
      const consulta = t.mock.method(db, 'execute', async () => [[]]);
      assert.equal((await enviar('GET', '/' + id)).status, 400);
      assert.equal(consulta.mock.callCount(), 0);
    });
  }
  for (const method of ['GET', 'POST']) {
    await t.test(method + ': falha interna retorna 500', async (t) => {
      t.mock.method(db, 'execute', async () => { throw new Error('Detalhes internos'); });
      t.mock.method(console, 'error', () => {});
      const res = await enviar(method, '', method === 'POST' ? dados : undefined);
      assert.equal(res.status, 500);
      assert.deepEqual(await res.json(), { mensagem: 'Não foi possível concluir a operação.' });
    });
  }
  await t.test('Vínculo removido durante o cadastro retorna 409', async (t) => {
    t.mock.method(db, 'execute', async sql => {
      if (sql.includes('INSERT')) throw Object.assign(new Error('FK'), { code: 'ER_NO_REFERENCED_ROW_2' });
      return [[{ id: 1 }]];
    });
    assert.equal((await enviar('POST', '', dados)).status, 409);
  });
});
