const chamadoModel = require('../models/chamadoModel');
const solicitanteModel = require('../models/solicitante.Model');
const categoriaModel = require('../models/categoriaModel');
const HttpError = require('../utils/HttpError');

function validarId(valor, campo) {
  if (typeof valor !== 'string' && typeof valor !== 'number') {
    throw new HttpError(400, campo + ' deve ser um ID inteiro positivo.');
  }
  const id = Number(valor);
  if (Number.isInteger(id) === false || id < 1 || id > 2147483647) {
    throw new HttpError(400, campo + ' deve ser um ID inteiro positivo.');
  }
  if (String(id) !== String(valor)) {
    throw new HttpError(400, campo + ' deve conter apenas os dígitos do ID.');
  }
  return id;
}

function validarDados(dados) {
  if (dados === undefined || dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new HttpError(400, 'Envie os dados do chamado em um objeto JSON.');
  }

  if (typeof dados.titulo !== 'string' || dados.titulo.trim() === '') {
    throw new HttpError(400, 'O título é obrigatório e deve ser um texto.');
  }
  if (typeof dados.descricao !== 'string' || dados.descricao.trim() === '') {
    throw new HttpError(400, 'A descrição é obrigatória e deve ser um texto.');
  }
  if (typeof dados.prioridade !== 'string' || dados.prioridade.trim() === '') {
    throw new HttpError(400, 'A prioridade é obrigatória e deve ser um texto.');
  }

  const titulo = dados.titulo.trim();
  const descricao = dados.descricao.trim();
  // Padroniza a escrita antes de conferir as opções permitidas.
  const prioridade = dados.prioridade.trim().toUpperCase();

  if (Array.from(titulo).length > 50) {
    throw new HttpError(400, 'O título deve ter no máximo 50 caracteres.');
  }
  if (prioridade !== 'BAIXA' && prioridade !== 'MEDIA' && prioridade !== 'ALTA') {
    throw new HttpError(400, 'A prioridade deve ser BAIXA, MEDIA ou ALTA.');
  }

  // O status é opcional no POST, pois o cadastro sempre usa ABERTO.
  if (dados.status !== undefined) {
    if (typeof dados.status !== 'string') {
      throw new HttpError(400, 'O status deve ser ABERTO, EM_ANDAMENTO ou CONCLUIDO.');
    }
    const status = dados.status.trim().toUpperCase();
    if (status !== 'ABERTO' && status !== 'EM_ANDAMENTO' && status !== 'CONCLUIDO') {
      throw new HttpError(400, 'O status deve ser ABERTO, EM_ANDAMENTO ou CONCLUIDO.');
    }
  }
  // A coluna TEXT do MySQL comporta até 65.535 bytes.
  if (Buffer.byteLength(descricao, 'utf8') > 65535) {
    throw new HttpError(400, 'A descrição excede o tamanho permitido.');
  }

  return {
    titulo: titulo,
    descricao: descricao,
    prioridade: prioridade,
    solicitante_id: validarId(dados.solicitante_id, 'solicitante_id'),
    categoria_id: validarId(dados.categoria_id, 'categoria_id')
  };
}

function listar() {
  return chamadoModel.listar();
}

async function buscarPorId(valor) {
  const id = validarId(valor, 'id');
  const chamado = await chamadoModel.buscarPorId(id);
  if (chamado === undefined) {
    throw new HttpError(404, 'Chamado não encontrado.');
  }
  return chamado;
}

async function criar(dados) {
  const chamado = validarDados(dados);

  // Verificamos os vínculos antes de tentar inserir.
  const solicitante = await solicitanteModel.buscarPorId(chamado.solicitante_id);
  if (solicitante === undefined) {
    throw new HttpError(400, 'O solicitante informado não existe.');
  }

  const categoria = await categoriaModel.buscarPorId(chamado.categoria_id);
  if (categoria === undefined) {
    throw new HttpError(400, 'A categoria informada não existe.');
  }

  const id = await chamadoModel.criar(chamado);
  // Busca o registro criado para retornar também os dados dos relacionamentos.
  return chamadoModel.buscarPorId(id);
}

module.exports = { listar, buscarPorId, criar };
