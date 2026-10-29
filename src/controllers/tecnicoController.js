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

async function buscarPorId(req, res) {
  const registro = await tecnicoService.buscarPorId(req.params.id);
  return res.status(200).json(registro);
}

async function criar(req, res) {
  const registro = await tecnicoService.criar(req.body);
  return res.status(201).location('/tecnicos/' + registro.id).json(registro);
}

async function atualizar(req, res) {
  const registro = await tecnicoService.atualizar(req.params.id, req.body);
  return res.status(200).json(registro);
}

async function excluir(req, res) {
  await tecnicoService.excluir(req.params.id);
  return res.status(204).send();
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
