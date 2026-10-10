const express = require('express');
const categoriaRoutes = require('./routes/categoriaRoutes');
const tecnicoRoutes = require('./routes/tecnicoRoutes');
const solicitanteRoutes = require('./routes/solicitanteRoutes');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.use(express.json());
app.use('/categorias', categoriaRoutes);
app.use('/tecnicos', tecnicoRoutes);
app.use('/solicitantes', solicitanteRoutes);

// Deve ficar após as rotas para receber os erros do processamento.
app.use(errorHandler);

module.exports = app;
