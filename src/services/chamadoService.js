const chamadoModel = require('../models/chamadoModel');
const solicitanteModel = require('../models/solicitante.Model');
const categoriaModel = require('../models/categoriaModel');
const tecnicoModel = require('../models/tecnicoModel');
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
      throw new HttpError(400, 'O status deve ser ABERTO, EM_ATENDIMENTO ou CONCLUIDO.');
    }
    const status = dados.status.trim().toUpperCase();
    if (status !== 'ABERTO' && status !== 'EM_ATENDIMENTO' && status !== 'CONCLUIDO') {
      throw new HttpError(400, 'O status deve ser ABERTO, EM_ATENDIMENTO ou CONCLUIDO.');
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

async function atualizar(valor, dados) {
  const id = validarId(valor, 'id');
  if (dados === null || typeof dados !== 'object' || Array.isArray(dados)) {
    throw new HttpError(400, 'Envie os campos da atualização em um objeto JSON.');
  }
  const campos = Object.keys(dados);
  if (campos.length === 0) {
    throw new HttpError(400, 'Informe prioridade, tecnico_id, status ou solucao para atualizar.');
  }
  for (const campo of campos) {
    if (campo !== 'prioridade' && campo !== 'tecnico_id' && campo !== 'status' && campo !== 'solucao') {
      throw new HttpError(400, 'Campo não permitido na atualização: ' + campo);
    }
  }

  const atual = await chamadoModel.buscarPorId(id);
  if (atual === undefined) {
    throw new HttpError(404, 'Chamado não encontrado.');
  }

  // Começa com os valores atuais e troca apenas os campos enviados.
  let prioridade = atual.prioridade;
  let tecnicoId = atual.tecnico_id;
  let status = atual.status;
  let solucao = atual.solucao;

  if (dados.prioridade !== undefined) {
    if (typeof dados.prioridade !== 'string') {
      throw new HttpError(400, 'A prioridade deve ser BAIXA, MEDIA ou ALTA.');
    }
    prioridade = dados.prioridade.trim().toUpperCase();
  }
  if (prioridade !== 'BAIXA' && prioridade !== 'MEDIA' && prioridade !== 'ALTA') {
    throw new HttpError(400, 'A prioridade deve ser BAIXA, MEDIA ou ALTA.');
  }

  if (dados.status !== undefined) {
    if (typeof dados.status !== 'string') {
      throw new HttpError(400, 'O status deve ser ABERTO, EM_ATENDIMENTO ou CONCLUIDO.');
    }
    status = dados.status.trim().toUpperCase();
  }
  if (status !== 'ABERTO' && status !== 'EM_ATENDIMENTO' && status !== 'CONCLUIDO') {
    throw new HttpError(400, 'O status deve ser ABERTO, EM_ATENDIMENTO ou CONCLUIDO.');
  }

  if (dados.tecnico_id !== undefined) {
    if (dados.tecnico_id === null) {
      tecnicoId = null;
    } else {
      tecnicoId = validarId(dados.tecnico_id, 'tecnico_id');
      const tecnico = await tecnicoModel.buscarPorId(tecnicoId);
      if (tecnico === undefined) {
        throw new HttpError(400, 'O técnico informado não existe.');
      }
    }
  }

  if (dados.solucao !== undefined) {
    if (dados.solucao === null) {
      solucao = null;
    } else {
      if (typeof dados.solucao !== 'string') {
        throw new HttpError(400, 'A solução deve ser um texto.');
      }
      solucao = dados.solucao.trim();
      if (Buffer.byteLength(solucao, 'utf8') > 65535) {
        throw new HttpError(400, 'A solução excede o tamanho permitido.');
      }
    }
  }

  // Valida o resultado final, inclusive os valores que já estavam salvos.
  if (status === 'EM_ATENDIMENTO' && tecnicoId === null) {
    throw new HttpError(400, 'Atribua um técnico antes de colocar o chamado em atendimento.');
  }
  if (status === 'CONCLUIDO') {
    if (typeof solucao !== 'string' || solucao.trim() === '') {
      throw new HttpError(400, 'Informe uma solução para concluir o chamado.');
    }
  }

  const alteracao = {
    prioridade: prioridade,
    tecnico_id: tecnicoId,
    status: status,
    solucao: solucao
  };
  const encontrados = await chamadoModel.atualizar(id, alteracao, atual);
  if (encontrados === 0) {
    const existente = await chamadoModel.buscarPorId(id);
    if (existente === undefined) {
      throw new HttpError(404, 'Chamado não encontrado.');
    }
    throw new HttpError(409, 'O chamado foi alterado por outra requisição. Consulte e tente novamente.');
  }
  return chamadoModel.buscarPorId(id);
}

async function excluir(valor) {
  const id = validarId(valor, 'id');
  const excluidos = await chamadoModel.excluir(id);
  if (excluidos === 0) {
    throw new HttpError(404, 'Chamado não encontrado.');
  }
}

module.exports = { listar, buscarPorId, criar, atualizar, excluir };
