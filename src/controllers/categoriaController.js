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

async function buscarPorId(req, res) {
  const registro = await categoriaService.buscarPorId(req.params.id);
  return res.status(200).json(registro);
}

async function criar(req, res) {
  const registro = await categoriaService.criar(req.body);
  return res.status(201).location('/categorias/' + registro.id).json(registro);
}

async function atualizar(req, res) {
  const registro = await categoriaService.atualizar(req.params.id, req.body);
  return res.status(200).json(registro);
}

async function excluir(req, res) {
  await categoriaService.excluir(req.params.id);
  return res.status(204).send();
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
