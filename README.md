# Helpdesk API — consultas da sprint 1

## Executar

Requer Node.js 20 ou superior e MySQL disponível.

1. No terminal do VS Code, dentro da pasta do projeto, execute `npm install`.
2. Copie `.env.example` para `.env` (no PowerShell: `Copy-Item .env.example .env`). Se já existir um `.env`, edite-o sem sobrescrever suas configurações.
3. Ajuste no `.env` o usuário e a senha do seu MySQL (`DB_USER` e `DB_PASSWORD`). Confira também host, porta e nome do banco.
4. Se o banco ainda não existir, execute `database/helpdesk.sql` no MySQL Workbench ou outro cliente MySQL. Se já existir, confira se as tabelas estão criadas; não é necessário recriar o banco.
5. Execute `npm start` e mantenha o terminal aberto. Para reiniciar automaticamente ao editar código, use `npm run dev`.
6. Abra `http://localhost:3000/categorias` e `http://localhost:3000/tecnicos` no navegador. Se mudar `PORT`, ajuste os endereços.

Você também pode usar Postman ou o arquivo `requests/api.rest` com a extensão REST Client do VS Code.

## O que é um endpoint?

É um ponto de acesso à API, identificado pelo método HTTP e pelo caminho. Em `GET /categorias`, GET indica uma consulta e `/categorias` identifica o recurso consultado. A URL completa local é `http://localhost:3000/categorias`.

O fluxo é: cliente → route → controller → service → model → MySQL. Os dados retornam pelas camadas até o controller enviar o JSON.

| Endpoint | Campos retornados | Sucesso |
| --- | --- | --- |
| GET /categorias | id, nome, descricao | 200 com uma lista JSON |
| GET /tecnicos | id, nome, email | 200 com uma lista JSON |

Sem registros, a resposta é `[]` com status 200. Se o banco falhar, a resposta é status 500 com uma mensagem. As consultas não cadastram nem alteram registros. O SQL inicial cria tabelas, mas não insere dados.

Exemplo ilustrativo de resposta de `/categorias`, caso esse registro esteja cadastrado:

```json
[{ "id": 1, "nome": "Hardware", "descricao": "Equipamentos" }]
```

## Entendendo o código

O projeto usa arquitetura em camadas:

| Camada | Responsabilidade | Exemplo |
| --- | --- | --- |
| Routes | Associa método e caminho ao controller | `src/routes/categoriaRoutes.js` |
| Controllers | Recebe a requisição, chama o service e envia status e JSON | `src/controllers/categoriaController.js` |
| Services | Concentra regras de negócio e chama o model | `src/services/categoriaService.js` |
| Models | Executa o SQL e retorna os dados | `src/models/categoriaModel.js` |
| Config | Configura a conexão com o MySQL | `src/config/database.js` |

Técnicos segue a mesma divisão, com os arquivos `tecnicoRoutes.js`, `tecnicoController.js`, `tecnicoService.js` e `tecnicoModel.js`.

O `src/app.js` configura o Express e registra os prefixos das rotas. Por exemplo, `app.use('/categorias', categoriaRoutes)` junto com `router.get('/', categoriaController.listar)` define `GET /categorias`.

No model de categorias, a consulta é:

```js
const [categorias] = await database.query(
  'SELECT id, nome, descricao FROM categorias ORDER BY id'
);
return categorias;
```

- `req` representa a requisição recebida. Estas consultas não precisam de parâmetros.
- `res` representa a resposta que será enviada ao cliente.
- `async` marca uma função assíncrona: ela retorna uma Promise e permite usar `await` em seu corpo.
- Uma Promise representa um resultado que pode ficar pronto no futuro ou falhar. A consulta ao banco retorna uma Promise.
- `await` suspende a continuação dessa função até a consulta terminar. Enquanto aguarda a comunicação com o MySQL, o Node.js pode atender outras requisições. Se a Promise falhar, o erro vai para o `catch`.
- `const [categorias]` é desestruturação de array. O MySQL2 retorna `[linhas, metadados]`; aqui pegamos apenas as linhas e damos a elas o nome `categorias`.
- `SELECT` escolhe os campos, `FROM` indica a tabela e `ORDER BY id` ordena pelo identificador em ordem crescente.
- `res.status(200).json(categorias)` envia a lista no formato JSON, com status de sucesso.
- `return` encerra a execução da função após enviar a resposta.
- `try/catch` trata erros. O detalhe técnico fica no terminal e o cliente recebe uma mensagem simples com status 500.

O service retorna a Promise do model diretamente, pois ainda não há regras de negócio adicionais nesta consulta. Não é necessário escrever `async/await` em toda função que encaminha uma Promise.

O controller usa `await categoriaService.listar()` para obter a lista e depois `res.status(200).json(categorias)` para responder. O `try/catch` fica no controller: se a consulta falhar, o erro se propaga pelo service até ser tratado ali. Models e services não usam `req` nem `res`, pois não são responsáveis pelo protocolo HTTP.

`src/config/database.js` carrega o `.env` e cria um pool, um conjunto de conexões reutilizáveis com o MySQL. `server.js` inicia o servidor na porta configurada. `package.json` declara dependências e comandos npm; o arquivo vazio `.package.json` que já existia não é utilizado pelo npm.

## Verificação

Execute `npm test`. Os testes fazem requisições HTTP às duas rotas, atravessando routes, controllers, services e models, e verificam listas com dados, listas vazias e erros de consulta. Apenas o MySQL é simulado nesses testes: eles não comprovam que seu banco local está configurado. Para verificar a integração real, configure o `.env`, inicie o MySQL e acesse os endpoints.

Se ocorrer erro 500, confira a mensagem no terminal, as credenciais no `.env` e a existência do banco e das tabelas.

Referências: [Express](https://expressjs.com/en/5x/api/) e [MySQL2](https://sidorares.github.io/node-mysql2/docs).
