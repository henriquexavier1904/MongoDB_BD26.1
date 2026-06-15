# Descrição das Coleções — Modelo de Agregados MongoDB

> **Domínio:** Sistema de Campeonato de Futebol  
> **Paradigma:** Banco de dados orientado a documentos (MongoDB)  
> **Total de coleções:** 6  
> **Origem:** Conversão do esquema relacional (EER) para o modelo de agregados

---

## Sumário

1. [membrosEquipe](#1-membrosequipe)
2. [times](#2-times)
3. [campeonatos](#3-campeonatos)
4. [partidas](#4-partidas)
5. [empresas](#5-empresas)
6. [patrocinios](#6-patrocinios)

---

## 1. `membrosEquipe`

### Descrição geral

Coleção central da hierarquia de pessoal do sistema. Unifica em um único documento as entidades **Membro da Equipe**, **Jogador** e **Técnico**, que no modelo relacional original formam uma hierarquia de herança **total e disjunta** — ou seja, todo membro da equipe é obrigatoriamente ou um Jogador ou um Técnico, nunca os dois ao mesmo tempo e nunca nenhum dos dois.

A fusão das três entidades em uma única coleção foi adotada porque o MongoDB não possui suporte nativo a herança. O uso de um campo discriminador (`tipo`) permite identificar o subtipo de cada documento, enquanto campos condicionais — presentes apenas quando aplicáveis — carregam os atributos específicos de cada subentidade. Essa estratégia elimina a necessidade de `$lookup` entre tabelas de herança e reflete a semântica do modelo conceitual original de forma eficiente.

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | `ObjectId` | Sim | Identificador único gerado automaticamente pelo MongoDB (PK) |
| `cpf` | `String` | Sim | CPF do membro; deve ser único na coleção; indexado |
| `nome` | `String` | Sim | Nome completo do membro da equipe |
| `salario` | `Number` | Sim | Salário atual do membro, em reais |
| `dataNascimento` | `Date` | Sim | Data de nascimento |
| `dataContratacao` | `Date` | Sim | Data em que o membro foi contratado pelo clube |
| `tipo` | `String` | Sim | **Discriminador de herança.** Valores aceitos: `"jogador"` ou `"tecnico"` |
| `timeAtual_id` | `ObjectId` | Sim | Referência ao documento da coleção `times` ao qual o membro pertence atualmente |
| `numeroCamisa` | `Number` | Condicional | Número da camisa. **Presente apenas se `tipo = "jogador"`** |
| `posicoes` | `Array<String>` | Condicional | Lista de posições que o jogador pode atuar (atributo multivalorado no EER). **Presente apenas se `tipo = "jogador"`**. Ex.: `["Atacante", "Meia"]` |
| `dataEntrou` | `Date` | Condicional | Data em que o jogador ingressou no time atual. **Presente apenas se `tipo = "jogador"`** |
| `especialidade` | `String` | Condicional | Especialidade técnica do treinador. **Presente apenas se `tipo = "tecnico"`** |

### Relacionamentos

- **`timeAtual_id → times._id`** — referência ao time ao qual o membro pertence ou que treina (cardinalidade N:1). Um time possui vários membros; cada membro pertence a um único time por vez.

### Decisão de design

| Aspecto | Decisão | Justificativa |
|---|---|---|
| Herança Jogador / Técnico | Documento único com discriminador `tipo` | MongoDB não tem herança nativa; documento único elimina JOINs e mantém a semântica da herança total e disjunta |
| Atributo `posicoes` (multivalorado) | Array primitivo embedded | Cardinalidade pequena e estável; sempre acessado junto com o jogador |
| Vínculo com Time | Referência (`timeAtual_id`) | Jogador pode trocar de time; embedar jogadores dentro de `times` geraria arrays crescentes e dificultaria transferências |

### Exemplo de documento — Jogador

```json
{
  "_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0c1"),
  "cpf": "123.456.789-00",
  "nome": "Carlos Eduardo Silva",
  "salario": 18000.00,
  "dataNascimento": ISODate("1998-04-22"),
  "dataContratacao": ISODate("2022-01-15"),
  "tipo": "jogador",
  "timeAtual_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0d2"),
  "numeroCamisa": 10,
  "posicoes": ["Atacante", "Meia-ofensivo"],
  "dataEntrou": ISODate("2022-01-15")
}
```

### Exemplo de documento — Técnico

```json
{
  "_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0c2"),
  "cpf": "987.654.321-00",
  "nome": "Roberto Fernandes",
  "salario": 45000.00,
  "dataNascimento": ISODate("1970-09-10"),
  "dataContratacao": ISODate("2021-07-01"),
  "tipo": "tecnico",
  "timeAtual_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0d2"),
  "especialidade": "Futebol ofensivo e pressão alta"
}
```

### Índices recomendados

```javascript
db.membrosEquipe.createIndex({ cpf: 1 }, { unique: true })
db.membrosEquipe.createIndex({ timeAtual_id: 1 })
db.membrosEquipe.createIndex({ tipo: 1 })
```

---

## 2. `times`

### Descrição geral

Coleção que representa cada **Time** participante dos campeonatos. Armazena dados cadastrais, o endereço da arena (atributo composto no EER, convertido em subdocumento embedded) e a lista de rivais históricos (auto-relacionamento N:M *Rivaliza*, com o apelido do clássico como atributo de relacionamento).

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | `ObjectId` | Sim | Identificador único gerado pelo MongoDB (PK) |
| `cod` | `String` | Sim | Código identificador do time; deve ser único; indexado |
| `nome` | `String` | Sim | Nome oficial do time |
| `enderecoArena` | `Object` | Sim | Subdocumento com o endereço da arena (atributo composto embedded) |
| `enderecoArena.cidade` | `String` | Sim | Cidade onde a arena está localizada |
| `enderecoArena.endereco` | `String` | Sim | Logradouro completo da arena |
| `rivais` | `Array<Object>` | Não | Lista de rivais históricos do time (auto-relacionamento *Rivaliza*) |
| `rivais[].time_id` | `ObjectId` | Sim (no item) | Referência ao documento do time rival na própria coleção `times` |
| `rivais[].apelidoClassico` | `String` | Sim (no item) | Nome popular do clássico entre os dois times |

### Relacionamentos

- **`rivais[].time_id → times._id`** — auto-relacionamento N:M (*Rivaliza*). Um time pode ter vários rivais; cada entrada do array representa uma rivalidade com seu apelido de clássico.

### Decisão de design

| Aspecto | Decisão | Justificativa |
|---|---|---|
| `enderecoArena` (composto) | Subdocumento embedded | Atributo composto sem existência independente; sempre acessado junto com o time |
| `rivais[]` (N:M auto-ref) | Array de subdocumentos com `time_id` + `apelidoClassico` | Poucos rivais por time; apelido do clássico é atributo da relação, não do time |

### Exemplo de documento

```json
{
  "_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0d2"),
  "cod": "SCR",
  "nome": "Sport Club do Recife",
  "enderecoArena": {
    "cidade": "Recife",
    "endereco": "Av. Agamenon Magalhães, 3900 - Ilha do Retiro"
  },
  "rivais": [
    {
      "time_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0d3"),
      "apelidoClassico": "Clássico dos Clássicos"
    },
    {
      "time_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0d4"),
      "apelidoClassico": "Clássico das Multidões"
    }
  ]
}
```

### Índices recomendados

```javascript
db.times.createIndex({ cod: 1 }, { unique: true })
db.times.createIndex({ "rivais.time_id": 1 })
```

---

## 3. `campeonatos`

### Descrição geral

Coleção que representa cada **Campeonato** gerenciado pelo sistema. Armazena as informações gerais do torneio e embarca, como array, as **Rodadas** que o compõem.

A entidade **Rodada** é uma **entidade fraca** no modelo relacional — ela não possui existência independente e só existe no contexto de um campeonato específico, sendo identificada pelo número de rodada em conjunto com o código do campeonato (chave parcial + identificador da entidade forte). No MongoDB, essa dependência de existência é mapeada naturalmente como um array de subdocumentos dentro do próprio documento do campeonato, eliminando a necessidade de uma coleção separada e qualquer tipo de `$lookup`.

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | `ObjectId` | Sim | Identificador único gerado pelo MongoDB (PK) |
| `cod` | `String` | Sim | Código identificador do campeonato; único; indexado |
| `nome` | `String` | Sim | Nome oficial do campeonato |
| `dataInicio` | `Date` | Sim | Data de início do campeonato |
| `dataFim` | `Date` | Sim | Data de encerramento do campeonato |
| `tipo` | `String` | Sim | Categoria do campeonato. Ex.: `"Estadual"`, `"Nacional"`, `"Internacional"` |
| `rodadas` | `Array<Object>` | Sim | Lista de rodadas do campeonato (**entidade fraca embedded**) |
| `rodadas[].numero` | `Number` | Sim (no item) | Número da rodada dentro do campeonato; funciona como discriminador (chave parcial no EER) |

### Relacionamentos

- A coleção `campeonatos` é referenciada por `partidas` (via `campeonato_id`) e por `patrocinios` (via `campeonato_id`).
- As rodadas embarcadas em `rodadas[]` são referenciadas indiretamente por `partidas` via o campo escalar `numeroRodada`.

### Decisão de design

| Aspecto | Decisão | Justificativa |
|---|---|---|
| Rodadas (entidade fraca) | Array embedded `rodadas[]` | Rodada não existe sem Campeonato; cardinalidade limitada (ex.: até 38 rodadas); sempre acessada junto com o campeonato |
| Partida separada de Rodada | `partidas` como coleção própria | Alta cardinalidade, acessada por múltiplos contextos (time, jogador, campeonato); embedding em Rodada ultrapassaria o limite de 16 MB |

### Exemplo de documento

```json
{
  "_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0e1"),
  "cod": "CAMPE-PE-2025",
  "nome": "Campeonato Pernambucano 2025",
  "dataInicio": ISODate("2025-01-18"),
  "dataFim": ISODate("2025-04-27"),
  "tipo": "Estadual",
  "rodadas": [
    { "numero": 1 },
    { "numero": 2 },
    { "numero": 3 },
    { "numero": 4 }
  ]
}
```

### Índices recomendados

```javascript
db.campeonatos.createIndex({ cod: 1 }, { unique: true })
db.campeonatos.createIndex({ tipo: 1 })
db.campeonatos.createIndex({ dataInicio: 1, dataFim: 1 })
```

---

## 4. `partidas`

### Descrição geral

Coleção central das ocorrências esportivas do sistema. Cada documento representa uma **Partida** disputada entre dois times dentro de uma rodada de um campeonato. Além dos atributos diretos da partida, esta coleção incorpora o **relacionamento ternário *Recebe*** — que no modelo relacional associa um Jogador, um tipo de Cartão e uma Partida, com os atributos `Motivo` e `Minuto` — como um array de subdocumentos embedded (`cartoes[]`).

Esta é a coleção de maior cardinalidade no sistema e concentra as principais consultas analíticas (resultados por rodada, desempenho por time, histórico de cartões por jogador).

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | `ObjectId` | Sim | Identificador único gerado pelo MongoDB (PK) |
| `idPartida` | `String` | Não | Identificador legível da partida (ex.: código alfanumérico) |
| `data` | `Date` | Sim | Data e horário de realização da partida |
| `placarMandante` | `Number` | Sim | Gols marcados pelo time mandante |
| `placarVisitante` | `Number` | Sim | Gols marcados pelo time visitante |
| `publico` | `Number` | Não | Número de espectadores presentes na partida |
| `arbitro` | `String` | Não | Nome do árbitro principal da partida |
| `timeMandante_id` | `ObjectId` | Sim | Referência ao time mandante na coleção `times` |
| `timeVisitante_id` | `ObjectId` | Sim | Referência ao time visitante na coleção `times` |
| `campeonato_id` | `ObjectId` | Sim | Referência ao campeonato na coleção `campeonatos` |
| `numeroRodada` | `Number` | Sim | Número da rodada dentro do campeonato; referencia `campeonatos.rodadas[].numero` |
| `cartoes` | `Array<Object>` | Não | Lista de cartões recebidos na partida (relacionamento ternário *Recebe* embedded) |
| `cartoes[].jogador_id` | `ObjectId` | Sim (no item) | Referência ao jogador que recebeu o cartão (`membrosEquipe._id`) |
| `cartoes[].cor` | `String` | Sim (no item) | Cor do cartão. Valores: `"Amarelo"` ou `"Vermelho"` |
| `cartoes[].minuto` | `Number` | Sim (no item) | Minuto do jogo em que o cartão foi dado; funciona como discriminador |
| `cartoes[].motivo` | `String` | Não | Descrição do motivo pelo qual o cartão foi aplicado |

### Relacionamentos

- **`timeMandante_id → times._id`** — referência ao time mandante (cardinalidade 1:N).
- **`timeVisitante_id → times._id`** — referência ao time visitante (cardinalidade 1:N).
- **`campeonato_id → campeonatos._id`** — referência ao campeonato; em conjunto com `numeroRodada`, localiza a rodada embedded no campeonato (cardinalidade N:1).
- **`cartoes[].jogador_id → membrosEquipe._id`** — referência indireta dentro do array `cartoes[]`, representando o relacionamento ternário *Recebe* entre Jogador, Cartão e Partida.

### Decisão de design

| Aspecto | Decisão | Justificativa |
|---|---|---|
| `partidas` como coleção própria | Coleção independente | Alta cardinalidade; acessada por múltiplos contextos (time mandante, visitante, campeonato, jogador) |
| Referências a `times` (mandante/visitante) | Dois campos `ObjectId` | Partida referencia Times; inverter (guardar array de partidas em Times) geraria arrays ilimitados |
| Relacionamento ternário `cartoes[]` | Array embedded | Evento de jogo com cardinalidade baixa e limitada por partida; sempre consultado junto com a partida |
| `numeroRodada` como escalar | Campo `Number` | Rodada está embedded em `campeonatos`; um escalar evita redundância e é suficiente para localização |

### Exemplo de documento

```json
{
  "_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0f1"),
  "idPartida": "P-2025-001",
  "data": ISODate("2025-02-08T16:00:00Z"),
  "placarMandante": 2,
  "placarVisitante": 1,
  "publico": 22450,
  "arbitro": "João Batista Ferreira",
  "timeMandante_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0d2"),
  "timeVisitante_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0d3"),
  "campeonato_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0e1"),
  "numeroRodada": 3,
  "cartoes": [
    {
      "jogador_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0c1"),
      "cor": "Amarelo",
      "minuto": 34,
      "motivo": "Falta violenta"
    },
    {
      "jogador_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0c5"),
      "cor": "Vermelho",
      "minuto": 78,
      "motivo": "Reclamação excessiva com o árbitro"
    }
  ]
}
```

### Índices recomendados

```javascript
db.partidas.createIndex({ campeonato_id: 1, numeroRodada: 1 })
db.partidas.createIndex({ timeMandante_id: 1 })
db.partidas.createIndex({ timeVisitante_id: 1 })
db.partidas.createIndex({ data: 1 })
db.partidas.createIndex({ "cartoes.jogador_id": 1 })
```

---

## 5. `empresas`

### Descrição geral

Coleção simples que representa as **Empresas** patrocinadoras do sistema. Cada documento armazena o cadastro básico de uma empresa. Essa coleção tem existência independente e é referenciada pela coleção `patrocinios`.

A separação em coleção própria é justificada pelo fato de que uma empresa pode patrocinar múltiplos campeonatos ao longo do tempo, sendo portanto uma entidade com vida própria no domínio.

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | `ObjectId` | Sim | Identificador único gerado pelo MongoDB (PK) |
| `cnpj` | `String` | Sim | CNPJ da empresa; deve ser único na coleção; indexado |
| `nome` | `String` | Sim | Razão social ou nome fantasia da empresa |

### Relacionamentos

- Referenciada por `patrocinios` via `empresa_id` (cardinalidade 1:N — uma empresa pode ter vários patrocínios).

### Exemplo de documento

```json
{
  "_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0a1"),
  "cnpj": "12.345.678/0001-99",
  "nome": "Bebidas do Nordeste S.A."
}
```

### Índices recomendados

```javascript
db.empresas.createIndex({ cnpj: 1 }, { unique: true })
```

---

## 6. `patrocinios`

### Descrição geral

Coleção que representa a **entidade associativa *Patrocina*** do modelo relacional — o relacionamento N:M entre **Campeonato** e **Empresa**, que possui atributos próprios (`DATA` e `VALOR`) e, por isso, foi promovido a entidade no EER original.

Além dos atributos da associação, cada documento de patrocínio embarca como array as **Ações Promocionais** vinculadas a ele, correspondendo ao relacionamento *Pode Conter* (1:N) entre *Patrocina* e *Ação Promocional* no modelo original.

### Campos

| Campo | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `_id` | `ObjectId` | Sim | Identificador único gerado pelo MongoDB (PK) |
| `campeonato_id` | `ObjectId` | Sim | Referência ao campeonato patrocinado (`campeonatos._id`) |
| `empresa_id` | `ObjectId` | Sim | Referência à empresa patrocinadora (`empresas._id`) |
| `data` | `Date` | Sim | Data de assinatura ou vigência do patrocínio; funciona como discriminador (chave parcial no EER) |
| `valor` | `Number` | Sim | Valor financeiro do patrocínio, em reais |
| `acoesPromocionais` | `Array<Object>` | Não | Lista de ações promocionais vinculadas ao patrocínio (relacionamento *Pode Conter* embedded) |
| `acoesPromocionais[].cod` | `String` | Sim (no item) | Código identificador local da ação promocional |
| `acoesPromocionais[].tipo` | `String` | Sim (no item) | Tipo de ação. Ex.: `"Banner"`, `"Ativação"`, `"Digital"` |
| `acoesPromocionais[].descricao` | `String` | Não | Descrição detalhada da ação promocional |
| `acoesPromocionais[].data` | `Date` | Não | Data de realização ou vigência da ação promocional |

### Relacionamentos

- **`campeonato_id → campeonatos._id`** — referência ao campeonato patrocinado (cardinalidade N:1).
- **`empresa_id → empresas._id`** — referência à empresa patrocinadora (cardinalidade N:1).
- A combinação `(campeonato_id, empresa_id, data)` funciona como chave composta lógica, equivalente à chave primária da entidade associativa no modelo relacional.

### Decisão de design

| Aspecto | Decisão | Justificativa |
|---|---|---|
| *Patrocina* como coleção própria | Coleção independente | Entidade associativa com atributos próprios (DATA, VALOR) e filhos (*Ações Promocionais*); não pode ser reduzida a um simples array |
| `acoesPromocionais[]` embedded | Array embedded | Ação Promocional só existe no contexto de um patrocínio; cardinalidade controlada; acesso sempre conjunto |

### Exemplo de documento

```json
{
  "_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0b1"),
  "campeonato_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0e1"),
  "empresa_id": ObjectId("64a1f2e3b4c5d6e7f8a9b0a1"),
  "data": ISODate("2025-01-10"),
  "valor": 750000.00,
  "acoesPromocionais": [
    {
      "cod": "AP-001",
      "tipo": "Banner",
      "descricao": "Painéis de LED na arena durante todas as partidas da fase de grupos",
      "data": ISODate("2025-01-18")
    },
    {
      "cod": "AP-002",
      "tipo": "Ativação",
      "descricao": "Stand de degustação no hall de entrada durante os jogos eliminatórios",
      "data": ISODate("2025-03-15")
    },
    {
      "cod": "AP-003",
      "tipo": "Digital",
      "descricao": "Patrocínio exclusivo das transmissões ao vivo nas redes sociais do campeonato",
      "data": ISODate("2025-01-18")
    }
  ]
}
```

### Índices recomendados

```javascript
db.patrocinios.createIndex({ campeonato_id: 1 })
db.patrocinios.createIndex({ empresa_id: 1 })
db.patrocinios.createIndex({ campeonato_id: 1, empresa_id: 1, data: 1 }, { unique: true })
```

---

## Visão geral do modelo

### Resumo das coleções

| Coleção | Entidades do EER | Estratégia | Documentos esperados |
|---|---|---|---|
| `membrosEquipe` | Membro da Equipe, Jogador, Técnico | Herança por discriminador | Alto |
| `times` | Time | Independente + embedded (endereço, rivais) | Médio |
| `campeonatos` | Campeonato, Rodada | Independente + embedded (rodadas) | Baixo |
| `partidas` | Partida, Recebe (ternário) | Independente + array embedded (cartões) | Alto |
| `empresas` | Empresa | Independente | Baixo |
| `patrocinios` | Patrocina, Ação Promocional | Independente + embedded (ações) | Médio |

### Referências entre coleções

| De | Campo | Para | Cardinalidade |
|---|---|---|---|
| `membrosEquipe` | `timeAtual_id` | `times` | N : 1 |
| `partidas` | `timeMandante_id` | `times` | N : 1 |
| `partidas` | `timeVisitante_id` | `times` | N : 1 |
| `partidas` | `campeonato_id` | `campeonatos` | N : 1 |
| `partidas.cartoes[]` | `jogador_id` | `membrosEquipe` | N : 1 |
| `patrocinios` | `campeonato_id` | `campeonatos` | N : 1 |
| `patrocinios` | `empresa_id` | `empresas` | N : 1 |
| `times.rivais[]` | `time_id` | `times` (self) | N : M |
