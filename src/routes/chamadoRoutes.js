const express = require('express');
const chamadoController = require('../controllers/chamadoController');

const router = express.Router();

// O prefixo /chamados é registrado no app.js.
router.get('/', chamadoController.listar);
router.get('/:id', chamadoController.buscarPorId);
router.post('/', chamadoController.criar);

module.exports = router;
