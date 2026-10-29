const chamadoService = require('../services/chamadoService');

// O controller recebe a requisição e envia a resposta HTTP.
async function listar(req, res) {
  const chamados = await chamadoService.listar();
  return res.status(200).json(chamados);
}

async function buscarPorId(req, res) {
  const chamado = await chamadoService.buscarPorId(req.params.id);
  return res.status(200).json(chamado);
}

async function criar(req, res) {
  const chamado = await chamadoService.criar(req.body);
  return res.status(201).location('/chamados/' + chamado.id).json(chamado);
}

module.exports = { listar, buscarPorId, criar };
