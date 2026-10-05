const tecnicoModel = require('../models/tecnicoModel');

// Esta consulta ainda não tem regras de negócio adicionais.
// Retornamos a Promise do model para o controller aguardar com await.
function listar() {
  return tecnicoModel.listar();
}

module.exports = { listar };
