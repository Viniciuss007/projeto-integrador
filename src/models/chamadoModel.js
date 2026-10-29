const database = require('../config/database');

// AS dá nomes claros aos campos da resposta.
// LEFT JOIN mantém o chamado na consulta mesmo quando não há técnico.
const consulta = `
  SELECT ch.id, ch.titulo, ch.descricao, ch.pioridade AS prioridade,
         ch.status, ch.solucao, ch.criado_em,
         ch.solicitante_id, s.nome AS solicitante_nome, s.setor,
         ch.categoria_id, c.nome AS categoria_nome,
         ch.tecnico_id, t.nome AS tecnico_nome
  FROM chamados ch
  INNER JOIN solicitantes s ON s.id = ch.solicitante_id
  INNER JOIN categorias c ON c.id = ch.categoria_id
  LEFT JOIN tecnicos t ON t.id = ch.tecnico_id
`;

async function listar() {
  const [chamados] = await database.execute(consulta + ' ORDER BY ch.id');
  return chamados;
}

async function buscarPorId(id) {
  const [chamados] = await database.execute(consulta + ' WHERE ch.id = ?', [id]);
  return chamados[0];
}

async function criar(dados) {
  // "pioridade" é o nome existente no banco; a API recebe "prioridade".
  // Status e técnico são definidos pelo sistema, não pelo corpo da requisição.
  const [resultado] = await database.execute(
    `INSERT INTO chamados
       (titulo, descricao, pioridade, solicitante_id, categoria_id, status, tecnico_id)
     VALUES (?, ?, ?, ?, ?, 'ABERTO', NULL)`,
    [dados.titulo, dados.descricao, dados.prioridade, dados.solicitante_id, dados.categoria_id]
  );
  return resultado.insertId;
}

module.exports = { listar, buscarPorId, criar };
