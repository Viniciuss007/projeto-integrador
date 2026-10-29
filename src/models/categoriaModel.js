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

module.exports = { listar, buscarPorId };

// aqui ent depois faço os post, put e delete, mas por enquanto só o get.
