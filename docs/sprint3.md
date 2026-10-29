# Sprint 3 — Criação e consulta de chamados

## Rotas

| Método | Caminho | Resultado |
| --- | --- | --- |
| POST | /chamados | Cria um chamado e retorna 201 com os dados e o cabeçalho Location |
| GET | /chamados | Retorna 200 com uma lista, inclusive vazia |
| GET | /chamados/:id | Retorna 200 com um chamado ou 404 se não existir |

O cadastro recebe:

```json
{
  "titulo": "Computador não liga",
  "descricao": "Ao pressionar o botão, o computador não inicia.",
  "prioridade": "ALTA",
  "solicitante_id": 1,
  "categoria_id": 1
}
```

Use IDs que já existam no banco. O status inicial será sempre ABERTO e o técnico será inicialmente nulo. tecnico_id e solucao enviados no cadastro não são usados. O status é opcional no POST; se enviado, deve ser válido, mas não altera a regra de criação com ABERTO.

Título, descrição e prioridade são textos obrigatórios. Título aceita até 50 caracteres. A prioridade aceita somente BAIXA, MEDIA e ALTA. Os status permitidos são ABERTO, EM_ANDAMENTO e CONCLUIDO. A API remove espaços nas extremidades e converte essas opções para maiúsculas antes de validar. Use MEDIA e CONCLUIDO sem acento. Descrição respeita a capacidade da coluna TEXT (65.535 bytes).

A validação das opções e a padronização em maiúsculas são feitas no service. As colunas do banco continuam como VARCHAR, sem restrições CHECK adicionais. A sprint 3 não possui uma rota para alterar status.

Dados inválidos ou solicitante/categoria inexistentes retornam 400. Um chamado não encontrado retorna 404. Se um vínculo for removido entre a validação e a gravação, a chave estrangeira protege o banco e a API retorna 409. Falhas inesperadas retornam 500.

## Como funciona cada camada

1. **app.js** registra o prefixo /chamados.
2. **chamadoRoutes.js** associa cada método e caminho a uma função do controller.
3. **chamadoController.js** lê req.body no POST e req.params.id na consulta por ID. Chama o service e envia o status HTTP e o JSON.
4. **chamadoService.js** valida os campos, consulta os models de solicitante e categoria para confirmar os vínculos e pede ao model de chamados para gravar.
5. **chamadoModel.js** executa o SQL parametrizado. Após inserir, o service consulta o ID gerado para retornar os dados completos.
6. **errorHandler.js** recebe as falhas e transforma cada uma em uma resposta HTTP.

O await espera a operação terminar antes de continuar aquela função. No Express 5, um erro lançado dentro de um controller async é encaminhado ao middleware de erros.

## Por que usar JOIN?

A tabela chamados guarda solicitante_id, mas o nome e o setor estão na tabela solicitantes. O JOIN combina os registros relacionados para retornar essas informações na mesma consulta.

```sql
FROM chamados ch
INNER JOIN solicitantes s ON s.id = ch.solicitante_id
INNER JOIN categorias c ON c.id = ch.categoria_id
LEFT JOIN tecnicos t ON t.id = ch.tecnico_id
```

- ch, s, c e t são apelidos das tabelas para encurtar o SQL.
- ON informa a condição que liga os registros: o ID da outra tabela deve corresponder à chave estrangeira do chamado.
- INNER JOIN retorna os registros que têm correspondência. Solicitante e categoria são obrigatórios no chamado.
- LEFT JOIN mantém o chamado mesmo sem correspondência na tabela de técnicos. Nesse caso, tecnico_nome será null. Um INNER JOIN com técnicos esconderia os chamados ainda não atribuídos.
- AS dá um nome ao campo retornado. Por exemplo, s.nome AS solicitante_nome evita confundir os nomes de solicitante, categoria e técnico.

As consultas retornam os dados do chamado e os campos solicitante_nome, setor, categoria_nome e tecnico_nome, além dos IDs dos vínculos.

## Por que prioridade aparece diferente no SQL?

O banco existente tem uma coluna chamada pioridade. Para não exigir uma alteração no banco nesta sprint, o INSERT utiliza esse nome e o SELECT usa ch.pioridade AS prioridade. O JSON usa sempre prioridade, com a grafia correta.

O status ABERTO é fixado no INSERT, mesmo se o banco existente ainda não tiver esse valor padrão. Isso impede que o cliente escolha outro status ao cadastrar.

## Consultas parametrizadas

O SQL utiliza ? e recebe os valores em um array separado:

```js
database.execute(consulta + ' WHERE ch.id = ?', [id]);
```

O valor de id é tratado como dado, não como um comando SQL. O trecho concatenado acima é um texto fixo; entradas do usuário não são concatenadas.

## Como testar

1. Execute npm run dev ou npm start. Reinicie uma instância antiga para carregar as alterações.
2. Abra requests/chamados.rest no REST Client.
3. Consulte solicitantes e categorias e configure @solicitanteId e @categoriaId com IDs existentes.
4. Execute o POST e copie o ID retornado para @id.
5. Execute a listagem e a busca por ID. Um chamado novo deve retornar ABERTO e tecnico_nome igual a null.
6. Experimente remover um campo obrigatório, usar um ID de chamado inexistente ou um solicitante/categoria inexistente.

O script inicial cria tabelas, mas não cadastra categorias. Se não houver categorias, cadastre uma pelo cliente MySQL antes do POST. Não foi criada uma rota de cadastro de categorias nesta sprint.

Execute npm test para os testes HTTP com o acesso ao banco simulado. O teste de integração real é opcional:

```powershell
$env:TEST_MYSQL = '1'
node --test
Remove-Item Env:TEST_MYSQL
```

O teste real cria seus próprios registros em tabelas InnoDB, verifica os JOINs com e sem técnico, cadastro, listagem, busca, validações e registros inexistentes. Usa uma transação com rollback ao final: os dados temporários são revertidos, mas os contadores de auto_increment podem avançar.
