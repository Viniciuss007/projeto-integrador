const HttpError = require('../utils/HttpError');

// Os quatro parâmetros identificam um middleware de erros do Express.
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);

  if (error instanceof HttpError) {
    return res.status(error.status).json({ mensagem: error.message });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ mensagem: 'O corpo da requisição contém JSON inválido.' });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ mensagem: 'O corpo da requisição excede o tamanho permitido.' });
  }
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ mensagem: 'Já existe um solicitante com este email.' });
  }
  if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
    return res.status(409).json({
      mensagem: 'Não é possível excluir um solicitante com chamados vinculados.'
    });
  }

  console.error('Erro na API:', error.code || error.message);
  return res.status(500).json({ mensagem: 'Não foi possível concluir a operação.' });
}

module.exports = errorHandler;
