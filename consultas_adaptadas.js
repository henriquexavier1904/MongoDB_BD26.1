// ============================================================
//  CONSULTAS ADAPTADAS — SQL → MongoDB
//  Domínio: Sistema de Campeonato de Futebol
//  Execute no VSCode Playground ou com: mongosh consultas_adaptadas.js
// ============================================================

use("campeonato_futebol");

// ─────────────────────────────────────────────────────────────
// CONSULTA 1 — GROUP BY / HAVING
// Times com mais de 1 cartão recebido pelos seus jogadores
//
// SQL equivalente:
//   SELECT t.Nome, COUNT(r.CPF) AS total_cartoes
//   FROM Equipe t JOIN Jogador j ... JOIN Recebe r ...
//   GROUP BY t.COD, t.Nome HAVING COUNT(r.CPF) > 1
//
// Estratégia MongoDB:
//   - $unwind expande o array cartoes[] de cada partida
//   - $lookup traz o time do jogador via membrosEquipe
//   - $group agrupa por time e conta cartões
//   - $match filtra grupos com total > 1 (equivalente ao HAVING)
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 1: Times com mais de 1 cartão recebido ──");

db.partidas.aggregate([
  // Expande cada cartão em um documento separado
  { $unwind: "$cartoes" },

  // Busca o time do jogador que recebeu o cartão
  {
    $lookup: {
      from: "membrosEquipe",
      localField: "cartoes.jogador_id",
      foreignField: "_id",
      as: "jogador"
    }
  },
  { $unwind: "$jogador" },

  // Busca o nome do time do jogador
  {
    $lookup: {
      from: "times",
      localField: "jogador.timeAtual_id",
      foreignField: "_id",
      as: "time"
    }
  },
  { $unwind: "$time" },

  // Agrupa por time contando cartões (equivalente ao GROUP BY + COUNT)
  {
    $group: {
      _id: "$time._id",
      time_nome: { $first: "$time.nome" },
      total_cartoes: { $sum: 1 }
    }
  },

  // Filtra times com mais de 1 cartão (equivalente ao HAVING)
  { $match: { total_cartoes: { $gt: 1 } } },

  { $project: { _id: 0, time_nome: 1, total_cartoes: 1 } },
  { $sort: { total_cartoes: -1 } }
]).toArray();


// ─────────────────────────────────────────────────────────────
// CONSULTA 2 — INNER JOIN
// Detalhes das partidas com mandante, visitante, placar,
// campeonato e rodada
//
// SQL equivalente:
//   SELECT p.ID, tm.Nome, tv.Nome, placar, c.Nome, rodada, data
//   FROM Partida p
//   INNER JOIN Equipe tm ... INNER JOIN Equipe tv ...
//   INNER JOIN Rodada r ... INNER JOIN Campeonato c ...
//
// Estratégia MongoDB:
//   - Partida já possui campeonato_id e numeroRodada diretamente
//   - $lookup duplo para trazer nomes de times e campeonato
//   - $concat monta o placar no formato "M x V"
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 2: Detalhes das partidas (INNER JOIN) ──");

db.partidas.aggregate([
  // Join com time mandante
  {
    $lookup: {
      from: "times",
      localField: "timeMandante_id",
      foreignField: "_id",
      as: "mandante"
    }
  },
  // Join com time visitante
  {
    $lookup: {
      from: "times",
      localField: "timeVisitante_id",
      foreignField: "_id",
      as: "visitante"
    }
  },
  // Join com campeonato
  {
    $lookup: {
      from: "campeonatos",
      localField: "campeonato_id",
      foreignField: "_id",
      as: "campeonato"
    }
  },

  {
    $project: {
      _id: 0,
      partida_id:   "$idPartida",
      mandante:     { $arrayElemAt: ["$mandante.nome",    0] },
      visitante:    { $arrayElemAt: ["$visitante.nome",   0] },
      placar: {
        $concat: [
          { $toString: "$placarMandante" }, " x ",
          { $toString: "$placarVisitante" }
        ]
      },
      campeonato:   { $arrayElemAt: ["$campeonato.nome",  0] },
      rodada:       "$numeroRodada",
      data_partida: "$data"
    }
  },

  { $sort: { data_partida: 1 } }
]).toArray();


// ─────────────────────────────────────────────────────────────
// CONSULTA 3 — LEFT OUTER JOIN
// Todos os jogadores com seus times e detalhes dos cartões
// recebidos — incluindo jogadores sem nenhum cartão
//
// SQL equivalente:
//   SELECT m.Nome, t.Nome, r.Minuto, r.Motivo, c.Jogos_Suspensao
//   FROM Jogador j JOIN Membro_da_Equipe m ... JOIN Equipe t ...
//   LEFT OUTER JOIN Recebe r ... LEFT OUTER JOIN Cartao c ...
//
// Estratégia MongoDB:
//   - Parte de membrosEquipe filtrando jogadores
//   - $lookup no array cartoes[] das partidas (pipeline lookup)
//   - $unwind com preserveNullAndEmptyArrays: true
//     → equivalente ao LEFT OUTER JOIN (preserva jogadores sem cartão)
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 3: Jogadores e cartões (LEFT OUTER JOIN) ──");

db.membrosEquipe.aggregate([
  // Apenas jogadores
  { $match: { tipo: "jogador" } },

  // Join com o time
  {
    $lookup: {
      from: "times",
      localField: "timeAtual_id",
      foreignField: "_id",
      as: "time"
    }
  },

  // Busca cartões deste jogador em todas as partidas (pipeline lookup)
  {
    $lookup: {
      from: "partidas",
      let: { jid: "$_id" },
      pipeline: [
        { $unwind: "$cartoes" },
        { $match: { $expr: { $eq: ["$cartoes.jogador_id", "$$jid"] } } },
        {
          $project: {
            _id: 0,
            minuto_cartao: "$cartoes.minuto",
            motivo:        "$cartoes.motivo",
            cor:           "$cartoes.cor"
          }
        }
      ],
      as: "cartoes_recebidos"
    }
  },

  // LEFT OUTER: preserva jogadores sem cartão (array vazio → null)
  {
    $unwind: {
      path: "$cartoes_recebidos",
      preserveNullAndEmptyArrays: true   // equivalente ao LEFT OUTER JOIN
    }
  },

  {
    $project: {
      _id: 0,
      jogador:       "$nome",
      time_nome:     { $arrayElemAt: ["$time.nome", 0] },
      minuto_cartao: { $ifNull: ["$cartoes_recebidos.minuto_cartao", null] },
      motivo:        { $ifNull: ["$cartoes_recebidos.motivo",        null] },
      cor:           { $ifNull: ["$cartoes_recebidos.cor",           null] }
    }
  },

  { $sort: { jogador: 1 } }
]).toArray();


// ─────────────────────────────────────────────────────────────
// CONSULTA 4 — SEMI-JUNÇÃO (EXISTS)
// Campeonatos que possuem pelo menos um patrocinador registrado
//
// SQL equivalente:
//   SELECT c.COD, c.Nome, c.Tipo, c.Data_Inicio, c.Data_Fim
//   FROM Campeonato c
//   WHERE EXISTS (SELECT * FROM Patrocina p WHERE p.COD = c.COD)
//
// Estratégia MongoDB:
//   - $lookup traz os patrocínios de cada campeonato
//   - $match filtra apenas campeonatos onde o array resultante
//     não está vazio (equivalente ao EXISTS)
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 4: Campeonatos com patrocinador (EXISTS) ──");

db.campeonatos.aggregate([
  // Busca patrocínios vinculados a cada campeonato
  {
    $lookup: {
      from: "patrocinios",
      localField: "_id",
      foreignField: "campeonato_id",
      as: "patrocinios"
    }
  },

  // EXISTS → array de patrocínios não pode estar vazio
  { $match: { "patrocinios.0": { $exists: true } } },

  {
    $project: {
      _id: 0,
      cod:        "$cod",
      nome:       "$nome",
      tipo:       "$tipo",
      dataInicio: "$dataInicio",
      dataFim:    "$dataFim"
    }
  }
]).toArray();


// ─────────────────────────────────────────────────────────────
// CONSULTA 5 — ANTI-JUNÇÃO (NOT EXISTS)
// Jogadores que NUNCA receberam nenhum cartão
//
// SQL equivalente:
//   SELECT m.CPF, m.Nome, t.Nome, j.Numero_Camisa
//   FROM Jogador j JOIN Membro_da_Equipe m ... JOIN Equipe t ...
//   WHERE NOT EXISTS (SELECT * FROM Recebe r WHERE r.CPF = j.CPF)
//
// Estratégia MongoDB:
//   - $lookup traz cartões de cada jogador (pipeline lookup)
//   - $match filtra jogadores com array de cartões VAZIO
//     (equivalente ao NOT EXISTS)
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 5: Jogadores sem cartão (NOT EXISTS) ──");

db.membrosEquipe.aggregate([
  { $match: { tipo: "jogador" } },

  // Busca qualquer cartão deste jogador em partidas
  {
    $lookup: {
      from: "partidas",
      let: { jid: "$_id" },
      pipeline: [
        { $unwind: "$cartoes" },
        { $match: { $expr: { $eq: ["$cartoes.jogador_id", "$$jid"] } } },
        { $limit: 1 }   // basta encontrar 1 para saber que tem cartão
      ],
      as: "cartoes_encontrados"
    }
  },

  // NOT EXISTS → array de cartões encontrados deve estar vazio
  { $match: { "cartoes_encontrados": { $size: 0 } } },

  // Join com o time para trazer o nome
  {
    $lookup: {
      from: "times",
      localField: "timeAtual_id",
      foreignField: "_id",
      as: "time"
    }
  },

  {
    $project: {
      _id: 0,
      cpf:          "$cpf",
      nome:         "$nome",
      time_nome:    { $arrayElemAt: ["$time.nome", 0] },
      numeroCamisa: "$numeroCamisa"
    }
  },

  { $sort: { nome: 1 } }
]).toArray();


// ─────────────────────────────────────────────────────────────
// CONSULTA 6 — SUBCONSULTA ESCALAR
// Partidas com público acima da média geral
//
// SQL equivalente:
//   SELECT p.ID, tm.Nome, tv.Nome, p.Publico,
//          (SELECT AVG(Publico) FROM Partida) AS media_publico
//   FROM Partida p ...
//   WHERE p.Publico > (SELECT AVG(Publico) FROM Partida)
//
// Estratégia MongoDB:
//   - $facet calcula a média e lista partidas em paralelo
//   - $set injeta a média em cada documento (equivale à subconsulta escalar)
//   - $match filtra pelo público acima da média
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 6: Partidas com público acima da média (subconsulta escalar) ──");

db.partidas.aggregate([
  // Calcula a média de público em um ramo paralelo
  {
    $facet: {
      media: [
        { $group: { _id: null, valor: { $avg: "$publico" } } }
      ],
      partidas: [
        { $match: {} }   // todas as partidas
      ]
    }
  },

  // Combina os dois ramos: injeta a média em cada partida
  {
    $project: {
      partidas: {
        $map: {
          input: "$partidas",
          as: "p",
          in: {
            $mergeObjects: [
              "$$p",
              { media_publico: { $arrayElemAt: ["$media.valor", 0] } }
            ]
          }
        }
      }
    }
  },

  // Desaninha o array de partidas
  { $unwind: "$partidas" },
  { $replaceRoot: { newRoot: "$partidas" } },

  // Filtra partidas acima da média (equivalente ao WHERE > subconsulta)
  {
    $match: {
      $expr: { $gt: ["$publico", "$media_publico"] }
    }
  },

  // Join com times
  {
    $lookup: {
      from: "times",
      localField: "timeMandante_id",
      foreignField: "_id",
      as: "mandante"
    }
  },
  {
    $lookup: {
      from: "times",
      localField: "timeVisitante_id",
      foreignField: "_id",
      as: "visitante"
    }
  },

  {
    $project: {
      _id: 0,
      partida_id:    "$idPartida",
      mandante:      { $arrayElemAt: ["$mandante.nome",  0] },
      visitante:     { $arrayElemAt: ["$visitante.nome", 0] },
      publico:       1,
      media_publico: { $round: ["$media_publico", 0] }
    }
  },

  { $sort: { publico: -1 } }
]).toArray();


// ─────────────────────────────────────────────────────────────
// CONSULTA 7 — SUBCONSULTA DE LINHA
// Partidas com o mesmo placar da partida de maior público
//
// SQL equivalente:
//   WHERE (p.Placar_M, p.Placar_V) IN (
//     SELECT Placar_M, Placar_V FROM Partida
//     WHERE Publico = (SELECT MAX(Publico) FROM Partida)
//   )
//
// Estratégia MongoDB:
//   - 1ª etapa: encontra o maior público e o placar correspondente
//   - 2ª etapa: filtra partidas que batem o mesmo par (M, V)
//     equivale ao IN com subconsulta de linha (par de colunas)
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 7: Partidas com mesmo placar da de maior público (subconsulta de linha) ──");

// Etapa 1: descobrir o placar da partida com maior público
const partidaMaiorPublico = db.partidas.findOne(
  {},
  { placarMandante: 1, placarVisitante: 1, publico: 1 },
  { sort: { publico: -1 } }
);

const placarRefM = partidaMaiorPublico.placarMandante;
const placarRefV = partidaMaiorPublico.placarVisitante;

print(`  → Placar de referência (maior público ${partidaMaiorPublico.publico}): ${placarRefM} x ${placarRefV}`);

// Etapa 2: buscar todas as partidas com esse mesmo placar
db.partidas.aggregate([
  // Filtra pelo mesmo par de placares (equivale ao IN com subconsulta de linha)
  {
    $match: {
      placarMandante:  placarRefM,
      placarVisitante: placarRefV
    }
  },

  // Join com times
  {
    $lookup: {
      from: "times",
      localField: "timeMandante_id",
      foreignField: "_id",
      as: "mandante"
    }
  },
  {
    $lookup: {
      from: "times",
      localField: "timeVisitante_id",
      foreignField: "_id",
      as: "visitante"
    }
  },

  {
    $project: {
      _id: 0,
      partida_id:      "$idPartida",
      data:            "$data",
      placarMandante:  1,
      placarVisitante: 1,
      publico:         1,
      mandante:  { $arrayElemAt: ["$mandante.nome",  0] },
      visitante: { $arrayElemAt: ["$visitante.nome", 0] }
    }
  },

  { $sort: { data: 1 } }
]).toArray();


// ─────────────────────────────────────────────────────────────
// CONSULTA 8 — SUBCONSULTA DE TABELA (IN)
// Times que possuem jogadores punidos com cartão
// que geram ao menos 1 jogo de suspensão
//
// SQL equivalente:
//   SELECT t.COD, t.Nome FROM Equipe t
//   WHERE t.COD IN (
//     SELECT j.COD FROM Jogador j JOIN Recebe r ... JOIN Cartao c ...
//     WHERE c.Jogos_Suspensao >= 1
//   )
//
// Estratégia MongoDB:
//   No modelo de agregados, a suspensão (Jogos_Suspensão) está no
//   campo cor do cartão — Vermelho implica suspensão.
//   Equivalência: cartão Vermelho → Jogos_Suspensao >= 1
//
//   - Encontra jogadores que receberam cartão Vermelho
//   - Extrai seus times
//   - $match nos times com $in (equivale ao IN com subconsulta de tabela)
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 8: Times com jogadores suspensos (subconsulta de tabela / IN) ──");

// Etapa 1: coletar IDs dos times de jogadores com cartão vermelho
const jogadoresSuspensos = db.partidas.aggregate([
  { $unwind: "$cartoes" },
  { $match: { "cartoes.cor": "Vermelho" } },   // Vermelho → suspensão
  {
    $lookup: {
      from: "membrosEquipe",
      localField: "cartoes.jogador_id",
      foreignField: "_id",
      as: "jogador"
    }
  },
  { $unwind: "$jogador" },
  { $group: { _id: "$jogador.timeAtual_id" } }  // IDs únicos dos times
]).toArray();

const timeIdsComSuspensos = jogadoresSuspensos.map(d => d._id);

// Etapa 2: filtrar times por esses IDs (equivale ao WHERE t.COD IN (...))
db.times.find(
  { _id: { $in: timeIdsComSuspensos } },
  { _id: 0, cod: 1, nome: 1, "enderecoArena.cidade": 1 }
).toArray();


// ─────────────────────────────────────────────────────────────
// CONSULTA 9 — OPERAÇÃO DE CONJUNTO (UNION)
// Lista única de técnicos e jogadores com identificação da função
//
// SQL equivalente:
//   SELECT m.CPF, m.Nome, 'Tecnico' AS funcao FROM Membro_da_Equipe m
//   JOIN Tecnico tc ON tc.CPF = m.CPF
//   UNION
//   SELECT m.CPF, m.Nome, 'Jogador' AS funcao FROM Membro_da_Equipe m
//   JOIN Jogador j ON j.CPF = m.CPF
//   ORDER BY funcao, Nome
//
// Estratégia MongoDB:
//   O campo discriminador `tipo` unifica as duas entidades na
//   mesma coleção, dispensando o UNION — basta projetar o campo
//   `tipo` como `funcao` com $toUpper para formatar.
//   Um único $project substitui as duas metades do UNION.
// ─────────────────────────────────────────────────────────────
print("\n── CONSULTA 9: Lista unificada de membros com função (UNION) ──");

db.membrosEquipe.aggregate([
  // Projeta o campo tipo como funcao (Tecnico / Jogador) com capitalização
  {
    $project: {
      _id: 0,
      cpf:  "$cpf",
      nome: "$nome",
      funcao: {
        $switch: {
          branches: [
            { case: { $eq: ["$tipo", "tecnico"] }, then: "Tecnico" },
            { case: { $eq: ["$tipo", "jogador"] }, then: "Jogador" }
          ],
          default: "Desconhecido"
        }
      }
    }
  },

  // ORDER BY funcao, Nome
  { $sort: { funcao: 1, nome: 1 } }
]).toArray();
