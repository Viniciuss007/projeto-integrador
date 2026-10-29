const express = require('express');
const categoriaController = require('../controllers/categoriaController');

const router = express.Router();

// O prefixo /categorias é registrado no app.js.
router.get('/', categoriaController.listar);
router.get('/:id', categoriaController.buscarPorId);
router.post('/', categoriaController.criar);
router.put('/:id', categoriaController.atualizar);
router.delete('/:id', categoriaController.excluir);

module.exports = router;
