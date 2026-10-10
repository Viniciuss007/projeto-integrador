const database = require('../config/database');

async function listar() {
  const [solicitantes] = await database.execute(
    'SELECT id, nome, email, setor FROM solicitantes ORDER BY id'
  );
  return solicitantes;
}

async function buscarPorId(id) {
  const [solicitantes] = await database.execute(
    'SELECT id, nome, email, setor FROM solicitantes WHERE id = ?',
    [id]
  );
  return solicitantes[0];
}

async function criar({ nome, email, setor }) {
  // Os valores são enviados separadamente: não concatene dados no SQL.
  const [resultado] = await database.execute(
    'INSERT INTO solicitantes (nome, email, setor) VALUES (?, ?, ?)',
    [nome, email, setor]
  );
  return resultado.insertId;
}

async function atualizar(id, { nome, email, setor }) {
  const [resultado] = await database.execute(
    'UPDATE solicitantes SET nome = ?, email = ?, setor = ? WHERE id = ?',
    [nome, email, setor, id]
  );
  // O MySQL2 usa FOUND_ROWS por padrão: conta também valores já iguais.
  return resultado.affectedRows;
}

async function excluir(id) {
  const [resultado] = await database.execute(
    'DELETE FROM solicitantes WHERE id = ?',
    [id]
  );
  return resultado.affectedRows;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
