const database = require('../config/database');

// O model concentra o acesso ao banco, sem depender de HTTP.
async function listar() {
  const [tecnicos] = await database.query(
    'SELECT id, nome, email FROM tecnicos ORDER BY id'
  );
  return tecnicos;
}

async function buscarPorId(id) {
  const [tecnicos] = await database.execute(
    'SELECT id, nome, email FROM tecnicos WHERE id = ?', [id]
  );
  return tecnicos[0];
}

async function criar(dados) {
  const [resultado] = await database.execute(
    'INSERT INTO tecnicos (nome, email) VALUES (?, ?)',
    [dados.nome, dados.email]
  );
  return resultado.insertId;
}

async function atualizar(id, dados) {
  const [resultado] = await database.execute(
    'UPDATE tecnicos SET nome = ?, email = ? WHERE id = ?',
    [dados.nome, dados.email, id]
  );
  return resultado.affectedRows;
}

async function excluir(id) {
  const [resultado] = await database.execute('DELETE FROM tecnicos WHERE id = ?', [id]);
  return resultado.affectedRows;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
