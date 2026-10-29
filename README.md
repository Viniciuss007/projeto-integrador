# Helpdesk API

API desenvolvida para o projeto de estudos de um sistema de helpdesk. Permite consultar categorias e técnicos, realizar o CRUD completo de solicitantes e criar e consultar chamados.

O projeto utiliza arquitetura em camadas: routes, controllers, services e models. Veja o [guia da sprint 3](docs/sprint3.md) para o fluxo de chamados e as consultas com JOIN.

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
| GET | `/solicitantes` | Lista os solicitantes |
| GET | `/solicitantes/:id` | Busca um solicitante pelo ID |
| POST | `/solicitantes` | Cadastra um solicitante |
| PUT | `/solicitantes/:id` | Atualiza um solicitante |
| DELETE | `/solicitantes/:id` | Exclui um solicitante |
| POST | `/chamados` | Cria um chamado com status ABERTO |
| GET | `/chamados` | Lista chamados com os dados relacionados |
| GET | `/chamados/:id` | Busca um chamado pelo ID |

Com a configuração padrão, a API fica disponível em `http://localhost:3000`.

POST e PUT de solicitantes exigem `nome`, `email` e `setor` em JSON, com limites de 30, 40 e 15 caracteres, respectivamente. O email deve ter formato válido e ser único.

O POST de chamados exige `titulo`, `descricao`, `prioridade`, `solicitante_id` e `categoria_id`. Os vínculos são verificados antes do cadastro. O status inicial é sempre `ABERTO`; as consultas incluem nome do solicitante, setor, categoria e técnico, quando houver.

Prioridades permitidas: `BAIXA`, `MEDIA` e `ALTA`. Status permitidos: `ABERTO`, `EM_ANDAMENTO` e `CONCLUIDO`. A validação e a padronização em maiúsculas ficam no service, sem restrições extras no banco.

As consultas e atualizações retornam `200`, o cadastro retorna `201` e a exclusão retorna `204`, sem corpo. Listagens vazias retornam `[]`.

Dados inválidos retornam `400`; registros não encontrados, `404`; email duplicado ou exclusão de solicitante com chamados vinculados, `409`.

## Como testar

Use o Postman ou a extensão REST Client do VS Code. As requisições estão separadas na pasta `requests`:

- `categorias.rest`: consulta de categorias.
- `tecnicos.rest`: consulta de técnicos.
- `solicitantes.rest`: CRUD de solicitantes e exemplos de erros.
- `chamados.rest`: criação, listagem e busca de chamados.

Cada arquivo possui uma variável `@baseUrl`. Em `solicitantes.rest`, altere `@id` para escolher o registro usado na busca, atualização e exclusão.

Em `chamados.rest`, configure `@id` para buscar um chamado e `@solicitanteId` e `@categoriaId` com IDs existentes para o cadastro. Execute `npm test` para verificar as rotas de chamados com o banco simulado; o teste com MySQL real está explicado no guia da sprint 3.
