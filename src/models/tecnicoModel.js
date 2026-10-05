const database = require('../config/database');

// O model concentra o acesso ao banco, sem depender de HTTP.
async function listar() {
  const [tecnicos] = await database.query(
    'SELECT id, nome, email FROM tecnicos ORDER BY id'
  );
  return tecnicos;
}

module.exports = { listar };