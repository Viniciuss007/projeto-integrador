# Helpdesk API

API desenvolvida para o projeto de estudos de um sistema de helpdesk. Por enquanto, permite consultar as categorias e os técnicos cadastrados no banco de dados.

## Tecnologias utilizadas

- Node.js
- Express
- MySQL
- MySQL2 e dotenv

## Como executar

É necessário ter Node.js 20 ou superior e MySQL instalados.

1. Abra o terminal na pasta do projeto e instale as dependências:

   ```powershell
   npm install
   ```

2. Se ainda não tiver um arquivo `.env`, copie o exemplo:

   ```powershell
   Copy-Item .env.example .env
   ```

3. No `.env`, configure o host, a porta, o usuário, a senha e o nome do banco de dados.

4. Se o banco ainda não estiver criado, execute o arquivo `database/helpdesk.sql` no MySQL Workbench. Esse arquivo cria o banco e as tabelas, mas não insere registros.

5. Inicie a API:

   ```powershell
   npm start
   ```

Mantenha o terminal aberto. Se alterar o código, pare o servidor com `Ctrl+C` e execute `npm start` novamente.

## Rotas disponíveis

| Método | Rota | Descrição |
| --- | --- | --- |
| GET | `/categorias` | Consulta as categorias cadastradas |
| GET | `/tecnicos` | Consulta os técnicos cadastrados |

Com a configuração padrão, a API fica disponível em `http://localhost:3000`.

Para testar as consultas, use o navegador, o Postman ou o arquivo `requests/api.rest` com a extensão REST Client do VS Code.

As respostas são listas em JSON. Se a tabela estiver vazia, a API retorna `[]`.
