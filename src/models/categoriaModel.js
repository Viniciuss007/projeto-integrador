const database = require('../config/database');

// O model concentra o acesso ao banco, sem depender de HTTP.
async function listar() {
  const [categorias] = await database.query(
    'SELECT id, nome, descricao FROM categorias ORDER BY id'
  );
  return categorias;
}

async function buscarPorId(id) {
  const [categorias] = await database.execute(
    'SELECT id, nome, descricao FROM categorias WHERE id = ?',
    [id]
  );
  return categorias[0];
}

async function criar(dados) {
  const [resultado] = await database.execute(
    'INSERT INTO categorias (nome, descricao) VALUES (?, ?)',
    [dados.nome, dados.descricao]
  );
  return resultado.insertId;
}

async function atualizar(id, dados) {
  const [resultado] = await database.execute(
    'UPDATE categorias SET nome = ?, descricao = ? WHERE id = ?',
    [dados.nome, dados.descricao, id]
  );
  return resultado.affectedRows;
}

async function excluir(id) {
  const [resultado] = await database.execute('DELETE FROM categorias WHERE id = ?', [id]);
  return resultado.affectedRows;
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };

