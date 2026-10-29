const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { randomUUID } = require('node:crypto');
const app = require('../src/app');
const db = require('../src/config/database');

// Execução opcional com TEST_MYSQL=1. Os dados temporários são revertidos.
test('Chamados com MySQL real, JOIN e rollback', { skip: process.env.TEST_MYSQL !== '1' }, async (t) => {
  const connection = await db.getConnection();
  let server;
  t.after(async () => {
    try {
      if (server) await new Promise(resolve => server.close(resolve));
      await connection.rollback();
    } finally {
      connection.release();
      await db.end();
    }
  });
  const [tables] = await connection.query('SHOW TABLE STATUS');
  for (const nome of ['solicitantes', 'categorias', 'tecnicos', 'chamados']) {
    assert.equal(tables.find(table => table.Name === nome)?.Engine, 'InnoDB');
  }
  await connection.beginTransaction();
  t.mock.method(db, 'execute', (sql, params) => connection.execute(sql, params));
  const email = randomUUID().slice(0, 12) + '@example.com';
  const [solicitante] = await connection.execute(
    'INSERT INTO solicitantes (nome, email, setor) VALUES (?, ?, ?)', ['Teste Sprint 3', email, 'TI']
  );
  const [categoria] = await connection.execute(
    'INSERT INTO categorias (nome, descricao) VALUES (?, ?)', ['Teste Sprint 3', 'Categoria temporária']
  );
  const [tecnico] = await connection.execute(
    'INSERT INTO tecnicos (nome, email) VALUES (?, ?)', ['Técnico Teste', email]
  );
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const url = 'http://127.0.0.1:' + server.address().port + '/chamados';
  const dados = {
    titulo: "PC d'Ana não liga", descricao: 'Teste temporário.', prioridade: ' alta ',
    solicitante_id: solicitante.insertId, categoria_id: categoria.insertId,
    status: 'concluido', tecnico_id: tecnico.insertId
  };
  async function enviar(method, path, body, status) {
    const res = await fetch(url + path, {
      method, headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body)
    });
    const json = await res.json();
    assert.equal(res.status, status, JSON.stringify(json));
    return json;
  }
  const criado = await enviar('POST', '', dados, 201);
  assert.equal(criado.status, 'ABERTO');
  assert.equal(criado.tecnico_nome, null);
  assert.equal(criado.tecnico_id, null);
  assert.equal(criado.solicitante_nome, 'Teste Sprint 3');
  assert.equal(criado.setor, 'TI');
  assert.equal(criado.categoria_nome, 'Teste Sprint 3');
  assert.equal(criado.prioridade, 'ALTA');
  assert.equal(criado.titulo, dados.titulo);
  assert.ok(criado.criado_em);
  assert.deepEqual(await enviar('GET', '/' + criado.id, undefined, 200), criado);
  assert.ok((await enviar('GET', '', undefined, 200)).some(ch => ch.id === criado.id));

  // Confere a consulta dos valores válidos usando apenas o chamado temporário.
  for (const prioridade of ['BAIXA', 'MEDIA', 'ALTA']) {
    await connection.execute('UPDATE chamados SET pioridade = ? WHERE id = ?', [prioridade, criado.id]);
    assert.equal((await enviar('GET', '/' + criado.id, undefined, 200)).prioridade, prioridade);
  }
  for (const status of ['ABERTO', 'EM_ANDAMENTO', 'CONCLUIDO']) {
    await connection.execute('UPDATE chamados SET status = ? WHERE id = ?', [status, criado.id]);
    assert.equal((await enviar('GET', '/' + criado.id, undefined, 200)).status, status);
  }
  // Valores inválidos são rejeitados pelo service antes de chegar ao banco.
  await enviar('POST', '', { ...dados, prioridade: 'URGENTE' }, 400);
  await enviar('POST', '', { ...dados, status: 'FECHADO' }, 400);

  // Apenas na preparação do teste: simula um técnico já atribuído.
  await connection.execute('UPDATE chamados SET tecnico_id = ? WHERE id = ?', [tecnico.insertId, criado.id]);
  const comTecnico = await enviar('GET', '/' + criado.id, undefined, 200);
  assert.equal(comTecnico.tecnico_nome, 'Técnico Teste');

  // IDs conhecidos, criados e removidos nesta transação, sem tocar em dados existentes.
  await connection.execute('DELETE FROM chamados WHERE id = ?', [criado.id]);
  await enviar('GET', '/' + criado.id, undefined, 404);
  await connection.execute('DELETE FROM categorias WHERE id = ?', [categoria.insertId]);
  await enviar('POST', '', dados, 400);
  await connection.execute('DELETE FROM solicitantes WHERE id = ?', [solicitante.insertId]);
  await enviar('POST', '', dados, 400);
  await enviar('POST', '', { titulo: 'Incompleto' }, 400);
  await enviar('GET', '/abc', undefined, 400);
});
