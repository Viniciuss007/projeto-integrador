const categoriaModel = require('../models/categoriaModel');
const HttpError = require('../utils/HttpError');

// Esta consulta ainda não tem regras de negócio adicionais.
// Retornamos a Promise do model para o controller aguardar com await.
function listar() {
  return categoriaModel.listar();
}

function validarId(valor) {
  const id = Number(valor);
  if (Number.isInteger(id) === false || id < 1 || id > 2147483647 || String(id) !== String(valor)) {
    throw new HttpError(400, 'O ID deve ser um número inteiro positivo válido.');
  }
  return id;
}

function validarDados(dados) {
  if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new HttpError(400, 'Envie nome e descricao em um objeto JSON.');
  }
  if (typeof dados.nome !== 'string' || dados.nome.trim() === '') {
    throw new HttpError(400, 'O nome é obrigatório e deve ser um texto.');
  }
  if (typeof dados.descricao !== 'string' || dados.descricao.trim() === '') {
    throw new HttpError(400, 'O campo descricao é obrigatório e deve ser um texto.');
  }
  const nome = dados.nome.trim();
  const descricao = dados.descricao.trim();
  if (Array.from(nome).length > 15) {
    throw new HttpError(400, 'O nome deve ter no máximo 15 caracteres.');
  }
  if (Array.from(descricao).length > 100) {
    throw new HttpError(400, 'O campo descricao deve ter no máximo 100 caracteres.');
  }
  return { nome: nome, descricao: descricao };
}

async function buscarPorId(valor) {
  const registro = await categoriaModel.buscarPorId(validarId(valor));
  if (registro === undefined) {
    throw new HttpError(404, 'Categoria não encontrada.');
  }
  return registro;
}

async function criar(dados) {
  const registro = validarDados(dados);
  const id = await categoriaModel.criar(registro);
  return { id: id, nome: registro.nome, descricao: registro.descricao };
}

async function atualizar(valor, dados) {
  const id = validarId(valor);
  const registro = validarDados(dados);
  const encontrados = await categoriaModel.atualizar(id, registro);
  if (encontrados === 0) {
    throw new HttpError(404, 'Categoria não encontrada.');
  }
  return { id: id, nome: registro.nome, descricao: registro.descricao };
}

async function excluir(valor) {
  const excluidos = await categoriaModel.excluir(validarId(valor));
  if (excluidos === 0) {
    throw new HttpError(404, 'Categoria não encontrada.');
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
