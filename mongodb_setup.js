// ── 0. Selecionar / criar o banco ───────────────────────────
use("campeonato_futebol");

// Limpar coleções se já existirem (útil para re-execução)
db.membrosEquipe.drop();
db.times.drop();
db.campeonatos.drop();
db.partidas.drop();
db.empresas.drop();
db.patrocinios.drop();

print("✓ Banco selecionado: campeonato_futebol");

// ============================================================
//  1. ÍNDICES
// ============================================================

// membrosEquipe
db.membrosEquipe.createIndex({ cpf: 1 },           { unique: true, name: "idx_cpf_unique" });
db.membrosEquipe.createIndex({ timeAtual_id: 1 },  { name: "idx_timeAtual" });
db.membrosEquipe.createIndex({ tipo: 1 },          { name: "idx_tipo" });

// times
db.times.createIndex({ cod: 1 },                  { unique: true, name: "idx_cod_unique" });
db.times.createIndex({ "rivais.time_id": 1 },     { name: "idx_rivais_time" });

// campeonatos
db.campeonatos.createIndex({ cod: 1 },            { unique: true, name: "idx_cod_unique" });
db.campeonatos.createIndex({ tipo: 1 },           { name: "idx_tipo" });
db.campeonatos.createIndex({ dataInicio: 1, dataFim: 1 }, { name: "idx_periodo" });

// partidas
db.partidas.createIndex({ campeonato_id: 1, numeroRodada: 1 }, { name: "idx_camp_rodada" });
db.partidas.createIndex({ timeMandante_id: 1 },   { name: "idx_mandante" });
db.partidas.createIndex({ timeVisitante_id: 1 },  { name: "idx_visitante" });
db.partidas.createIndex({ data: 1 },              { name: "idx_data" });
db.partidas.createIndex({ "cartoes.jogador_id": 1 }, { name: "idx_cartoes_jogador" });

// empresas
db.empresas.createIndex({ cnpj: 1 },              { unique: true, name: "idx_cnpj_unique" });

// patrocinios
db.patrocinios.createIndex({ campeonato_id: 1 },  { name: "idx_campeonato" });
db.patrocinios.createIndex({ empresa_id: 1 },     { name: "idx_empresa" });
db.patrocinios.createIndex(
  { campeonato_id: 1, empresa_id: 1, data: 1 },
  { unique: true, name: "idx_patrocinio_unique" }
);

print("✓ Índices criados");

// ============================================================
//  2. INSERÇÃO DE DADOS — times (5 times)
// ============================================================

const timeSCR   = ObjectId();
const timeSEC   = ObjectId();
const timeNAU   = ObjectId();
const timeSANTA = ObjectId();
const timeCEAR  = ObjectId();

db.times.insertMany([
  {
    _id: timeSCR,
    cod: "SCR",
    nome: "Sport Club do Recife",
    enderecoArena: {
      cidade: "Recife",
      endereco: "Av. Agamenon Magalhães, 3900 - Ilha do Retiro"
    },
    rivais: [
      { time_id: timeSEC,  apelidoClassico: "Clássico dos Clássicos" },
      { time_id: timeNAU,  apelidoClassico: "Clássico das Emoções" }
    ]
  },
  {
    _id: timeSEC,
    cod: "SEC",
    nome: "Santa Cruz Futebol Clube",
    enderecoArena: {
      cidade: "Recife",
      endereco: "R. Padre Carapuceiro, 1030 - Arruda"
    },
    rivais: [
      { time_id: timeSCR,  apelidoClassico: "Clássico dos Clássicos" },
      { time_id: timeNAU,  apelidoClassico: "Clássico da Saudade" }
    ]
  },
  {
    _id: timeNAU,
    cod: "NAU",
    nome: "Náutico Capibaribe",
    enderecoArena: {
      cidade: "Recife",
      endereco: "Av. Mário Melo, 85 - Campo Grande"
    },
    rivais: [
      { time_id: timeSCR,  apelidoClassico: "Clássico das Emoções" },
      { time_id: timeSEC,  apelidoClassico: "Clássico da Saudade" }
    ]
  },
  {
    _id: timeSANTA,
    cod: "SAL",
    nome: "Salgueiro Atlético Clube",
    enderecoArena: {
      cidade: "Salgueiro",
      endereco: "Estádio Cornélio de Barros - Centro"
    },
    rivais: []
  },
  {
    _id: timeCEAR,
    cod: "CEA",
    nome: "Ceará Sporting Club",
    enderecoArena: {
      cidade: "Fortaleza",
      endereco: "Av. Alberto Craveiro, 2901 - Castelão"
    },
    rivais: []
  }
]);

print("✓ times inseridos: " + db.times.countDocuments());

// ============================================================
//  3. INSERÇÃO — membrosEquipe (10 membros: 8 jogadores + 2 técnicos)
// ============================================================

const jog1  = ObjectId(); // Sport
const jog2  = ObjectId(); // Sport
const jog3  = ObjectId(); // Santa Cruz
const jog4  = ObjectId(); // Santa Cruz
const jog5  = ObjectId(); // Náutico
const jog6  = ObjectId(); // Salgueiro
const jog7  = ObjectId(); // Ceará
const jog8  = ObjectId(); // Ceará
const tec1  = ObjectId(); // Sport  (técnico)
const tec2  = ObjectId(); // Náutico (técnico)

db.membrosEquipe.insertMany([
  // ── Jogadores Sport ──
  {
    _id: jog1,
    cpf: "111.222.333-01",
    nome: "Carlos Eduardo Menezes",
    salario: 18000,
    dataNascimento: new Date("1998-04-22"),
    dataContratacao: new Date("2022-01-15"),
    tipo: "jogador",
    timeAtual_id: timeSCR,
    numeroCamisa: 10,
    posicoes: ["Atacante", "Meia-ofensivo"],
    dataEntrou: new Date("2022-01-15")
  },
  {
    _id: jog2,
    cpf: "111.222.333-02",
    nome: "Rafael Souza Lima",
    salario: 9500,
    dataNascimento: new Date("2000-11-03"),
    dataContratacao: new Date("2023-07-01"),
    tipo: "jogador",
    timeAtual_id: timeSCR,
    numeroCamisa: 4,
    posicoes: ["Zagueiro"],
    dataEntrou: new Date("2023-07-01")
  },
  // ── Jogadores Santa Cruz ──
  {
    _id: jog3,
    cpf: "222.333.444-01",
    nome: "Diego Ferreira Santos",
    salario: 12000,
    dataNascimento: new Date("1996-08-17"),
    dataContratacao: new Date("2021-02-01"),
    tipo: "jogador",
    timeAtual_id: timeSEC,
    numeroCamisa: 9,
    posicoes: ["Centroavante"],
    dataEntrou: new Date("2021-02-01")
  },
  {
    _id: jog4,
    cpf: "222.333.444-02",
    nome: "André Luís Costa",
    salario: 7800,
    dataNascimento: new Date("2001-03-29"),
    dataContratacao: new Date("2024-01-10"),
    tipo: "jogador",
    timeAtual_id: timeSEC,
    numeroCamisa: 22,
    posicoes: ["Lateral-direito", "Ala"],
    dataEntrou: new Date("2024-01-10")
  },
  // ── Jogador Náutico ──
  {
    _id: jog5,
    cpf: "333.444.555-01",
    nome: "Marcos Antônio Alves",
    salario: 8200,
    dataNascimento: new Date("1999-06-05"),
    dataContratacao: new Date("2022-08-20"),
    tipo: "jogador",
    timeAtual_id: timeNAU,
    numeroCamisa: 8,
    posicoes: ["Volante", "Meia-central"],
    dataEntrou: new Date("2022-08-20")
  },
  // ── Jogador Salgueiro ──
  {
    _id: jog6,
    cpf: "444.555.666-01",
    nome: "Paulo Henrique Rocha",
    salario: 5500,
    dataNascimento: new Date("1997-12-11"),
    dataContratacao: new Date("2023-01-05"),
    tipo: "jogador",
    timeAtual_id: timeSANTA,
    numeroCamisa: 7,
    posicoes: ["Ponta-direita"],
    dataEntrou: new Date("2023-01-05")
  },
  // ── Jogadores Ceará ──
  {
    _id: jog7,
    cpf: "555.666.777-01",
    nome: "Gustavo Henrique Nobre",
    salario: 22000,
    dataNascimento: new Date("1995-01-30"),
    dataContratacao: new Date("2020-06-15"),
    tipo: "jogador",
    timeAtual_id: timeCEAR,
    numeroCamisa: 1,
    posicoes: ["Goleiro"],
    dataEntrou: new Date("2020-06-15")
  },
  {
    _id: jog8,
    cpf: "555.666.777-02",
    nome: "Leonardo Barbosa Pinto",
    salario: 15000,
    dataNascimento: new Date("1997-09-14"),
    dataContratacao: new Date("2021-12-01"),
    tipo: "jogador",
    timeAtual_id: timeCEAR,
    numeroCamisa: 6,
    posicoes: ["Zagueiro", "Lateral-esquerdo"],
    dataEntrou: new Date("2021-12-01")
  },
  // ── Técnicos ──
  {
    _id: tec1,
    cpf: "666.777.888-01",
    nome: "Roberto Carlos Fernandes",
    salario: 48000,
    dataNascimento: new Date("1968-07-22"),
    dataContratacao: new Date("2023-12-01"),
    tipo: "tecnico",
    timeAtual_id: timeSCR,
    especialidade: "Futebol ofensivo e pressão alta"
  },
  {
    _id: tec2,
    cpf: "666.777.888-02",
    nome: "Sergio Motta Cavalcanti",
    salario: 32000,
    dataNascimento: new Date("1972-03-18"),
    dataContratacao: new Date("2024-02-01"),
    tipo: "tecnico",
    timeAtual_id: timeNAU,
    especialidade: "Marcação zonal e contra-ataque"
  }
]);

print("✓ membrosEquipe inseridos: " + db.membrosEquipe.countDocuments());

// ============================================================
//  4. INSERÇÃO — campeonatos (2 campeonatos com rodadas)
// ============================================================

const campPE   = ObjectId();
const campCopa = ObjectId();

db.campeonatos.insertMany([
  {
    _id: campPE,
    cod: "CAMPE-PE-2025",
    nome: "Campeonato Pernambucano 2025",
    dataInicio: new Date("2025-01-18"),
    dataFim:    new Date("2025-04-27"),
    tipo: "Estadual",
    rodadas: [
      { numero: 1 },
      { numero: 2 },
      { numero: 3 },
      { numero: 4 },
      { numero: 5 }
    ]
  },
  {
    _id: campCopa,
    cod: "COPA-NE-2025",
    nome: "Copa do Nordeste 2025",
    dataInicio: new Date("2025-02-05"),
    dataFim:    new Date("2025-05-18"),
    tipo: "Regional",
    rodadas: [
      { numero: 1 },
      { numero: 2 },
      { numero: 3 }
    ]
  }
]);

print("✓ campeonatos inseridos: " + db.campeonatos.countDocuments());

// ============================================================
//  5. INSERÇÃO — empresas (3 patrocinadores)
// ============================================================

const empBebidas  = ObjectId();
const empBanco    = ObjectId();
const empTelecom  = ObjectId();

db.empresas.insertMany([
  {
    _id: empBebidas,
    cnpj: "12.345.678/0001-99",
    nome: "Bebidas do Nordeste S.A."
  },
  {
    _id: empBanco,
    cnpj: "23.456.789/0001-88",
    nome: "Banco Regional do Desenvolvimento"
  },
  {
    _id: empTelecom,
    cnpj: "34.567.890/0001-77",
    nome: "TelecomNE Telecomunicações Ltda."
  }
]);

print("✓ empresas inseridas: " + db.empresas.countDocuments());

// ============================================================
//  6. INSERÇÃO — partidas (6 partidas em 2 campeonatos)
// ============================================================

const pid1 = ObjectId();
const pid2 = ObjectId();
const pid3 = ObjectId();
const pid4 = ObjectId();
const pid5 = ObjectId();
const pid6 = ObjectId();

db.partidas.insertMany([
  // ── Campeonato PE — Rodada 1 ──
  {
    _id: pid1,
    idPartida: "PE2025-R1-01",
    data: new Date("2025-01-18T16:00:00Z"),
    placarMandante:  2,
    placarVisitante: 0,
    publico: 18400,
    arbitro: "João Batista Ferreira",
    timeMandante_id:  timeSCR,
    timeVisitante_id: timeSANTA,
    campeonato_id: campPE,
    numeroRodada: 1,
    cartoes: [
      {
        jogador_id: jog6,
        cor: "Amarelo",
        minuto: 28,
        motivo: "Falta em contra-ataque"
      }
    ]
  },
  {
    _id: pid2,
    idPartida: "PE2025-R1-02",
    data: new Date("2025-01-19T19:00:00Z"),
    placarMandante:  1,
    placarVisitante: 1,
    publico: 12300,
    arbitro: "Marcos Rogério Andrade",
    timeMandante_id:  timeSEC,
    timeVisitante_id: timeNAU,
    campeonato_id: campPE,
    numeroRodada: 1,
    cartoes: [
      {
        jogador_id: jog3,
        cor: "Amarelo",
        minuto: 55,
        motivo: "Simulação"
      },
      {
        jogador_id: jog5,
        cor: "Vermelho",
        minuto: 88,
        motivo: "Agressão a adversário"
      }
    ]
  },
  // ── Campeonato PE — Rodada 2 ──
  {
    _id: pid3,
    idPartida: "PE2025-R2-01",
    data: new Date("2025-01-25T16:00:00Z"),
    placarMandante:  3,
    placarVisitante: 1,
    publico: 22100,
    arbitro: "João Batista Ferreira",
    timeMandante_id:  timeSCR,
    timeVisitante_id: timeSEC,
    campeonato_id: campPE,
    numeroRodada: 2,
    cartoes: [
      {
        jogador_id: jog1,
        cor: "Amarelo",
        minuto: 34,
        motivo: "Reclamação"
      },
      {
        jogador_id: jog4,
        cor: "Amarelo",
        minuto: 61,
        motivo: "Falta violenta"
      },
      {
        jogador_id: jog4,
        cor: "Vermelho",
        minuto: 74,
        motivo: "Segundo cartão amarelo"
      }
    ]
  },
  // ── Campeonato PE — Rodada 3 ──
  {
    _id: pid4,
    idPartida: "PE2025-R3-01",
    data: new Date("2025-02-01T19:30:00Z"),
    placarMandante:  0,
    placarVisitante: 2,
    publico: 9800,
    arbitro: "Sandro Pereira Costa",
    timeMandante_id:  timeNAU,
    timeVisitante_id: timeSCR,
    campeonato_id: campPE,
    numeroRodada: 3,
    cartoes: [
      {
        jogador_id: jog2,
        cor: "Amarelo",
        minuto: 45,
        motivo: "Atraso na reposição"
      }
    ]
  },
  // ── Copa do Nordeste — Rodada 1 ──
  {
    _id: pid5,
    idPartida: "COPANE2025-R1-01",
    data: new Date("2025-02-08T20:00:00Z"),
    placarMandante:  2,
    placarVisitante: 2,
    publico: 31500,
    arbitro: "Carlos Alberto Nunes",
    timeMandante_id:  timeCEAR,
    timeVisitante_id: timeSCR,
    campeonato_id: campCopa,
    numeroRodada: 1,
    cartoes: [
      {
        jogador_id: jog7,
        cor: "Amarelo",
        minuto: 12,
        motivo: "Tempo perdido"
      },
      {
        jogador_id: jog1,
        cor: "Amarelo",
        minuto: 67,
        motivo: "Entrada dura"
      }
    ]
  },
  // ── Copa do Nordeste — Rodada 2 ──
  {
    _id: pid6,
    idPartida: "COPANE2025-R2-01",
    data: new Date("2025-02-15T16:00:00Z"),
    placarMandante:  1,
    placarVisitante: 0,
    publico: 15200,
    arbitro: "Marcos Rogério Andrade",
    timeMandante_id:  timeSCR,
    timeVisitante_id: timeCEAR,
    campeonato_id: campCopa,
    numeroRodada: 2,
    cartoes: []
  }
]);

print("✓ partidas inseridas: " + db.partidas.countDocuments());

// ============================================================
//  7. INSERÇÃO — patrocinios (4 patrocínios com ações)
// ============================================================

db.patrocinios.insertMany([
  {
    campeonato_id: campPE,
    empresa_id:    empBebidas,
    data:  new Date("2025-01-05"),
    valor: 750000,
    acoesPromocionais: [
      {
        cod: "AP-001",
        tipo: "Banner",
        descricao: "Painéis de LED na arena durante toda a fase de grupos",
        data: new Date("2025-01-18")
      },
      {
        cod: "AP-002",
        tipo: "Ativação",
        descricao: "Stand de degustação no hall de entrada nos jogos de final de semana",
        data: new Date("2025-02-01")
      }
    ]
  },
  {
    campeonato_id: campPE,
    empresa_id:    empBanco,
    data:  new Date("2025-01-08"),
    valor: 400000,
    acoesPromocionais: [
      {
        cod: "AP-003",
        tipo: "Digital",
        descricao: "Patrocínio exclusivo das transmissões ao vivo nas redes sociais",
        data: new Date("2025-01-18")
      }
    ]
  },
  {
    campeonato_id: campCopa,
    empresa_id:    empTelecom,
    data:  new Date("2025-01-20"),
    valor: 1200000,
    acoesPromocionais: [
      {
        cod: "AP-004",
        tipo: "Naming Rights",
        descricao: "Nome do patrocinador incluído no título da competição",
        data: new Date("2025-02-05")
      },
      {
        cod: "AP-005",
        tipo: "Banner",
        descricao: "Placas estáticas em todas as arenas participantes",
        data: new Date("2025-02-05")
      },
      {
        cod: "AP-006",
        tipo: "Digital",
        descricao: "Campanha de mídia social integrada ao app do campeonato",
        data: new Date("2025-02-08")
      }
    ]
  },
  {
    campeonato_id: campCopa,
    empresa_id:    empBebidas,
    data:  new Date("2025-01-22"),
    valor: 600000,
    acoesPromocionais: [
      {
        cod: "AP-007",
        tipo: "Ativação",
        descricao: "Zona de experiência de marca no estádio nas semifinais e final",
        data: new Date("2025-04-20")
      }
    ]
  }
]);

print("✓ patrocinios inseridos: " + db.patrocinios.countDocuments());

// ============================================================
//  RESUMO FINAL
// ============================================================

print("\n══════════════════════════════════════════");
print("  BANCO: campeonato_futebol — Carga OK");
print("══════════════════════════════════════════");
print("  membrosEquipe : " + db.membrosEquipe.countDocuments());
print("  times         : " + db.times.countDocuments());
print("  campeonatos   : " + db.campeonatos.countDocuments());
print("  partidas      : " + db.partidas.countDocuments());
print("  empresas      : " + db.empresas.countDocuments());
print("  patrocinios   : " + db.patrocinios.countDocuments());
print("══════════════════════════════════════════\n");
