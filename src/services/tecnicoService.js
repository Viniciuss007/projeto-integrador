const tecnicoModel = require('../models/tecnicoModel');
const HttpError = require('../utils/HttpError');

// Esta consulta ainda não tem regras de negócio adicionais.
// Retornamos a Promise do model para o controller aguardar com await.
function listar() {
  return tecnicoModel.listar();
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
    throw new HttpError(400, 'Envie nome e email em um objeto JSON.');
  }
  if (typeof dados.nome !== 'string' || dados.nome.trim() === '') {
    throw new HttpError(400, 'O nome é obrigatório e deve ser um texto.');
  }
  if (typeof dados.email !== 'string' || dados.email.trim() === '') {
    throw new HttpError(400, 'O campo email é obrigatório e deve ser um texto.');
  }
  const nome = dados.nome.trim();
  const email = dados.email.trim();
  if (Array.from(nome).length > 30) {
    throw new HttpError(400, 'O nome deve ter no máximo 30 caracteres.');
  }
  if (Array.from(email).length > 40) {
    throw new HttpError(400, 'O campo email deve ter no máximo 40 caracteres.');
  }
  const partes = email.split('@');
  if (partes.length !== 2 || partes[0] === '') {
    throw new HttpError(400, 'Informe um email válido.');
  }
  const dominio = partes[1];
  if (dominio.indexOf('.') < 1 || dominio.endsWith('.')) {
    throw new HttpError(400, 'Informe um email válido.');
  }
  for (const caractere of email) {
    if (caractere.trim() === '') {
      throw new HttpError(400, 'O email não pode conter espaços.');
    }
  }
  return { nome: nome, email: email };
}

async function buscarPorId(valor) {
  const registro = await tecnicoModel.buscarPorId(validarId(valor));
  if (registro === undefined) {
    throw new HttpError(404, 'Técnico não encontrado.');
  }
  return registro;
}

async function criar(dados) {
  const registro = validarDados(dados);
  const id = await tecnicoModel.criar(registro);
  return { id: id, nome: registro.nome, email: registro.email };
}

async function atualizar(valor, dados) {
  const id = validarId(valor);
  const registro = validarDados(dados);
  const encontrados = await tecnicoModel.atualizar(id, registro);
  if (encontrados === 0) {
    throw new HttpError(404, 'Técnico não encontrado.');
  }
  return { id: id, nome: registro.nome, email: registro.email };
}

async function excluir(valor) {
  const excluidos = await tecnicoModel.excluir(validarId(valor));
  if (excluidos === 0) {
    throw new HttpError(404, 'Técnico não encontrado.');
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
