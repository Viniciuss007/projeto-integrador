const categoriaService = require('../services/categoriaService');

// O controller recebe a requisição e envia a resposta HTTP.
async function listar(req, res) {
  try {
    const categorias = await categoriaService.listar();
    return res.status(200).json(categorias);
  } catch (error) {
    console.error('Erro ao consultar categorias:', error.code || error.message);
    return res.status(500).json({ mensagem: 'Não foi possível consultar as categorias.' });
  }
}

module.exports = { listar };
