const categoriaModel = require('../models/categoriaModel');

// Esta consulta ainda não tem regras de negócio adicionais.
// Retornamos a Promise do model para o controller aguardar com await.
function listar() {
  return categoriaModel.listar();
}

module.exports = { listar };
