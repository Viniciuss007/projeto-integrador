const express = require('express');
const categoriaRoutes = require('./routes/categoriaRoutes');
const tecnicoRoutes = require('./routes/tecnicoRoutes');

const app = express();

app.use(express.json());
app.use('/categorias', categoriaRoutes);
app.use('/tecnicos', tecnicoRoutes);

module.exports = app;
