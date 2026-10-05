const express = require('express');
const categoriaController = require('../controllers/categoriaController');

const router = express.Router();

// O prefixo /categorias é registrado no app.js.
router.get('/', categoriaController.listar);

module.exports = router;
