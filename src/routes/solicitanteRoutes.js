const express = require('express');
const solicitanteController = require('../controllers/solicitanteController');

const router = express.Router();

router.get('/', solicitanteController.listar);
router.get('/:id', solicitanteController.buscarPorId);
router.post('/', solicitanteController.criar);
router.put('/:id', solicitanteController.atualizar);
router.delete('/:id', solicitanteController.excluir);

module.exports = router;
