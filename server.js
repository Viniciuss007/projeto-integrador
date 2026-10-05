const app = require('./src/app');

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`API disponível em http://localhost:${port}`);
});
