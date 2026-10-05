const express = require('express');
const tecnicoController = require('../controllers/tecnicoController');

const router = express.Router();

// O prefixo /tecnicos é registrado no app.js.
router.get('/', tecnicoController.listar);

module.exports = router;
