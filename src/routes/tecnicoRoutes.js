const express = require('express');
const tecnicoController = require('../controllers/tecnicoController');

const router = express.Router();

// O prefixo /tecnicos é registrado no app.js.
router.get('/', tecnicoController.listar);
router.get('/:id', tecnicoController.buscarPorId);
router.post('/', tecnicoController.criar);
router.put('/:id', tecnicoController.atualizar);
router.delete('/:id', tecnicoController.excluir);

module.exports = router;
