const solicitanteService = require('../services/solicitanteService');

// No Express 5, erros em funções async são encaminhados ao middleware de erros.
async function listar(req, res) {
  const solicitantes = await solicitanteService.listar();
  return res.status(200).json(solicitantes);
}

async function buscarPorId(req, res) {
  const solicitante = await solicitanteService.buscarPorId(req.params.id);
  return res.status(200).json(solicitante);
}

async function criar(req, res) {
  const solicitante = await solicitanteService.criar(req.body);
  return res.status(201).location('/solicitantes/' + solicitante.id).json(solicitante);
}

async function atualizar(req, res) {
  const solicitante = await solicitanteService.atualizar(req.params.id, req.body);
  return res.status(200).json(solicitante);
}

async function excluir(req, res) {
  await solicitanteService.excluir(req.params.id);
  return res.status(204).send();
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
