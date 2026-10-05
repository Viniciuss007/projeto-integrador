const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const app = require('../src/app');
const database = require('../src/config/database');

// Testa HTTP de verdade, simulando apenas o MySQL para não alterar seu banco.
test('consultas de categorias e técnicos', async (t) => {
  const server = app.listen(0, '127.0.0.1');
  t.after(async () => {
    await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
    await database.end();
  });
  await once(server, 'listening');
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  const casos = [
    { rota: '/categorias', dados: [{ id: 1, nome: 'Hardware', descricao: 'Equipamentos' }], mensagem: 'Não foi possível consultar as categorias.' },
    { rota: '/tecnicos', dados: [{ id: 1, nome: 'Ana', email: 'ana@example.com' }], mensagem: 'Não foi possível consultar os técnicos.' },
  ];

  for (const caso of casos) {
    await t.test(`${caso.rota}: registros cadastrados`, async (t) => {
      t.mock.method(database, 'query', async () => [caso.dados, []]);
      const resposta = await fetch(baseUrl + caso.rota);
      assert.equal(resposta.status, 200);
      assert.match(resposta.headers.get('content-type'), /application\/json/);
      assert.deepEqual(await resposta.json(), caso.dados);
    });

    await t.test(`${caso.rota}: tabela vazia`, async (t) => {
      t.mock.method(database, 'query', async () => [[], []]);
      const resposta = await fetch(baseUrl + caso.rota);
      assert.equal(resposta.status, 200);
      assert.deepEqual(await resposta.json(), []);
    });

    await t.test(`${caso.rota}: falha no banco`, async (t) => {
      t.mock.method(database, 'query', async () => { throw new Error('Detalhe interno do banco'); });
      t.mock.method(console, 'error', () => {});
      const resposta = await fetch(baseUrl + caso.rota);
      assert.equal(resposta.status, 500);
      assert.deepEqual(await resposta.json(), { mensagem: caso.mensagem });
    });
  }
});
