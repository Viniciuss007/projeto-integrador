const chamadoService = require('../services/chamadoService');

// O controller recebe a requisição e envia a resposta HTTP.
async function listar(req, res) {
  try {
    const chamados = await chamadoService.listar();
    return res.status(200).json(chamados);
  } catch (error) {
    console.error('Erro ao consultar chamados:', error.code || error.message);
    return res.status(500).json({ mensagem: 'Não foi possível consultar os chamados.' });
  }
}

async function buscarPorId(req, res) {
  const chamado = await chamadoService.buscarPorId(req.params.id);
  return res.status(200).json(chamado);
}

async function criar(req, res) {
  const chamado = await chamadoService.criar(req.body);
  return res.status(201).location('/chamados/' + chamado.id).json(chamado);
}

async function atualizar(req, res) {
  const chamado = await chamadoService.atualizar(req.params.id, req.body);
  return res.status(200).json(chamado);
}

async function excluir(req, res) {
  await chamadoService.excluir(req.params.id);
  return res.status(204).send();
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
