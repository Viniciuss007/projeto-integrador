const solicitanteModel = require('../models/solicitante.Model');
const HttpError = require('../utils/HttpError');

function validarId(valor) {
  const id = Number(valor);

  if (Number.isInteger(id) === false) {
    throw new HttpError(400, 'O ID deve ser um número inteiro.');
  }

  if (id < 1 || id > 2147483647) {
    throw new HttpError(400, 'O ID está fora do intervalo permitido.');
  }

  // Evita formatos como "1e2", "01" ou números com espaços.
  if (String(id) !== String(valor)) {
    throw new HttpError(400, 'Informe o ID usando apenas os dígitos do número.');
  }

  return id;
}

function validarDados(dados) {
  if (dados === undefined || dados === null) {
    throw new HttpError(400, 'Envie nome, email e setor em um objeto JSON.');
  }

  if (typeof dados !== 'object' || Array.isArray(dados)) {
    throw new HttpError(400, 'Envie nome, email e setor em um objeto JSON.');
  }

  // Primeiro conferimos os tipos para poder usar trim com segurança.
  if (typeof dados.nome !== 'string') {
    throw new HttpError(400, 'O nome é obrigatório e deve ser um texto.');
  }

  if (typeof dados.email !== 'string') {
    throw new HttpError(400, 'O email é obrigatório e deve ser um texto.');
  }

  if (typeof dados.setor !== 'string') {
    throw new HttpError(400, 'O setor é obrigatório e deve ser um texto.');
  }

  // trim remove os espaços do começo e do final do texto.
  const nome = dados.nome.trim();
  const email = dados.email.trim();
  const setor = dados.setor.trim();

  if (nome === '') {
    throw new HttpError(400, 'O nome é obrigatório.');
  }
  if (email === '') {
    throw new HttpError(400, 'O email é obrigatório.');
  }
  if (setor === '') {
    throw new HttpError(400, 'O setor é obrigatório.');
  }

  // Array.from permite contar também caracteres como emojis corretamente.
  if (Array.from(nome).length > 50) {
    throw new HttpError(400, 'O nome deve ter no máximo 50 caracteres.');
  }
  if (Array.from(email).length > 50) {
    throw new HttpError(400, 'O email deve ter no máximo 50 caracteres.');
  }
  if (Array.from(setor).length > 30) {
    throw new HttpError(400, 'O setor deve ter no máximo 30 caracteres.');
  }

  validarEmail(email);

  return { nome: nome, email: email, setor: setor };
}

function validarEmail(email) {
  // Exemplo: ana@example.com vira ["ana", "example.com"].
  const partes = email.split('@');

  if (partes.length !== 2 || partes[0] === '') {
    throw new HttpError(400, 'Informe um email válido.');
  }

  const dominio = partes[1];
  const posicaoDoPonto = dominio.indexOf('.');

  // O domínio precisa ter texto antes e depois do ponto.
  if (posicaoDoPonto < 1 || dominio.endsWith('.')) {
    throw new HttpError(400, 'Informe um email válido.');
  }

  // Não aceitamos espaços, tabulações ou quebras de linha no email.
  for (const caractere of email) {
    if (caractere.trim() === '') {
      throw new HttpError(400, 'O email não pode conter espaços.');
    }
  }
}

function listar() {
  return solicitanteModel.listar();
}

async function buscarPorId(valor) {
  const id = validarId(valor);
  const solicitante = await solicitanteModel.buscarPorId(id);

  if (solicitante === undefined) {
    throw new HttpError(404, 'Solicitante não encontrado.');
  }

  return solicitante;
}

async function criar(dados) {
  const solicitante = validarDados(dados);
  const id = await solicitanteModel.criar(solicitante);

  return {
    id: id,
    nome: solicitante.nome,
    email: solicitante.email,
    setor: solicitante.setor
  };
}

async function atualizar(valor, dados) {
  const id = validarId(valor);
  const solicitante = validarDados(dados);
  const encontrados = await solicitanteModel.atualizar(id, solicitante);

  if (encontrados === 0) {
    throw new HttpError(404, 'Solicitante não encontrado.');
  }

  return {
    id: id,
    nome: solicitante.nome,
    email: solicitante.email,
    setor: solicitante.setor
  };
}

async function excluir(valor) {
  const id = validarId(valor);
  const excluidos = await solicitanteModel.excluir(id);

  if (excluidos === 0) {
    throw new HttpError(404, 'Solicitante não encontrado.');
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
