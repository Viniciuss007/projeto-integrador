const tecnicoService = require('../services/tecnicoService');

// O controller recebe a requisição e envia a resposta HTTP.
async function listar(req, res) {
  try {
    const tecnicos = await tecnicoService.listar();
    return res.status(200).json(tecnicos);
  } catch (error) {
    console.error('Erro ao consultar técnicos:', error.code || error.message);
    return res.status(500).json({ mensagem: 'Não foi possível consultar os técnicos.' });
  }
}

module.exports = { listar };
