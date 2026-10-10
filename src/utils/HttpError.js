// Representa um erro esperado, com mensagem que pode ser enviada ao cliente.
class HttpError extends Error {
  constructor(status, mensagem) {
    super(mensagem);
    this.status = status;
  }
}

module.exports = HttpError;
