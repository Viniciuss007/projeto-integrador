# Helpdesk API

API desenvolvida para o projeto de estudos de um sistema de helpdesk. Possui CRUD de categorias, técnicos, solicitantes e chamados, incluindo atendimento, conclusão e exclusão.

O projeto utiliza arquitetura em camadas: routes, controllers, services e models. Veja o [guia da sprint 3](docs/sprint3.md) para o fluxo de chamados e as consultas com JOIN.

As regras de atualização e os exemplos de atendimento estão no [guia da sprint 4](docs/sprint4.md).

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
| GET | `/categorias/:id` | Busca uma categoria |
| POST | `/categorias` | Cadastra uma categoria |
| PUT | `/categorias/:id` | Atualiza uma categoria |
| DELETE | `/categorias/:id` | Exclui uma categoria sem chamados vinculados |
| GET | `/tecnicos` | Consulta os técnicos cadastrados |
| GET | `/tecnicos/:id` | Busca um técnico |
| POST | `/tecnicos` | Cadastra um técnico |
| PUT | `/tecnicos/:id` | Atualiza um técnico |
| DELETE | `/tecnicos/:id` | Exclui um técnico sem chamados vinculados |
| GET | `/solicitantes` | Lista os solicitantes |
| GET | `/solicitantes/:id` | Busca um solicitante pelo ID |
| POST | `/solicitantes` | Cadastra um solicitante |
| PUT | `/solicitantes/:id` | Atualiza um solicitante |
| DELETE | `/solicitantes/:id` | Exclui um solicitante |
| POST | `/chamados` | Cria um chamado com status ABERTO |
| GET | `/chamados` | Lista chamados com os dados relacionados |
| GET | `/chamados/:id` | Busca um chamado pelo ID |
| PUT | `/chamados/:id` | Atualiza prioridade, técnico, status e solução |
| DELETE | `/chamados/:id` | Exclui um chamado |

Com a configuração padrão, a API fica disponível em `http://localhost:3000`.

POST e PUT de solicitantes exigem `nome`, `email` e `setor` em JSON. O email deve ter formato válido e ser único.

POST e PUT de categorias exigem `nome` (até 15 caracteres) e `descricao` (até 100). Para técnicos, exigem `nome` (até 30) e `email` (até 40), com formato válido e único entre técnicos. No PUT desses cadastros, envie todos os campos. Esses limites respeitam o banco local, cujas colunas são menores que as declaradas no script de criação.

O POST de chamados exige `titulo`, `descricao`, `prioridade`, `solicitante_id` e `categoria_id`. Os vínculos são verificados antes do cadastro. O status inicial é sempre `ABERTO`; as consultas incluem nome do solicitante, setor, categoria e técnico, quando houver.

Prioridades permitidas: `BAIXA`, `MEDIA` e `ALTA`. Status permitidos: `ABERTO`, `EM_ATENDIMENTO` e `CONCLUIDO`. A validação e a padronização em maiúsculas ficam no service, sem restrições extras no banco.

O PUT de chamados mantém os campos não enviados. Para usar `EM_ATENDIMENTO`, é necessário um técnico cadastrado; para `CONCLUIDO`, uma solução informada. Corpo vazio e campos fora de `prioridade`, `tecnico_id`, `status` e `solucao` retornam `400`.

As consultas e atualizações retornam `200`, o cadastro retorna `201` e a exclusão retorna `204`, sem corpo. Listagens vazias retornam `[]`.

Dados inválidos retornam `400`; registros não encontrados, `404`; email duplicado ou exclusão de solicitante, categoria ou técnico com chamados vinculados, `409`. A exclusão não remove chamados em cascata.

## Como testar

Use o Postman ou a extensão REST Client do VS Code. As requisições estão separadas na pasta `requests`:

- `categorias.rest`: CRUD de categorias.
- `tecnicos.rest`: CRUD de técnicos.
- `solicitantes.rest`: CRUD de solicitantes e exemplos de erros.
- `chamados.rest`: cadastro, consultas, atualização, conclusão, exclusão e exemplos de erros.

Cada arquivo possui uma variável `@baseUrl`. Em `solicitantes.rest`, altere `@id` para escolher o registro usado na busca, atualização e exclusão.

Os arquivos de categorias e técnicos também possuem `@id`: copie o ID retornado no cadastro ou na listagem. Execute a exclusão por último.

Em `chamados.rest`, configure `@id` para consultar, atualizar ou excluir um chamado; `@solicitanteId` e `@categoriaId` para o cadastro; e `@tecnicoId` para atribuir um responsável. Execute `npm test` para os testes com banco/model simulado. O teste com MySQL real está explicado no guia da sprint 4.
