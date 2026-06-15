# MongoDB_BD26.1
MongoDB adaptation of the EER project developed.
# Minimundo — Sistema de Campeonato de Futebol

O sistema gerencia as informações relacionadas à organização e acompanhamento de **campeonatos de futebol**, abrangendo times, membros da equipe, partidas, patrocinadores e ações promocionais.

---

## Times e Membros da Equipe

Cada **time** possui um código identificador único, um nome oficial e o endereço completo de sua arena, composto por cidade e logradouro. Um time pode estabelecer **rivalidades históricas** com outros times, sendo cada rivalidade identificada pelo apelido popular do clássico entre os dois clubes — por exemplo, "Clássico dos Clássicos" entre Sport e Santa Cruz.

Todo indivíduo vinculado a um time é tratado como um **membro da equipe**, possuindo CPF, nome, salário, data de nascimento e data de contratação. Um membro da equipe é classificado obrigatoriamente como **jogador** ou **técnico** — nunca os dois ao mesmo tempo e nunca nenhum dos dois. Essa classificação é total e disjunta.

Um **jogador** possui, além dos atributos comuns, um número de camisa, a data em que ingressou no time e uma lista de posições em que pode atuar — como atacante, meia ou zagueiro —, podendo ocupar mais de uma posição. Um **técnico** possui uma especialidade, que descreve sua abordagem tática ou área de atuação. Cada membro da equipe pertence a exatamente um time por vez, e um time pode contar com múltiplos membros.

---

## Campeonatos e Rodadas

Um **campeonato** é identificado por um código único e possui nome, data de início, data de encerramento e tipo — como estadual, regional ou nacional. Cada campeonato é dividido em **rodadas**, identificadas por um número sequencial dentro do campeonato. Uma rodada não existe de forma independente: ela pertence obrigatoriamente a um campeonato e deixa de existir caso o campeonato seja removido.

---

## Partidas

Cada **partida** é disputada entre dois times — o **mandante** e o **visitante** — dentro de uma rodada específica de um campeonato. Uma partida possui identificador próprio, data de realização, placar do time mandante, placar do time visitante, número de espectadores presentes e nome do árbitro responsável.

Durante uma partida, jogadores podem **receber cartões**. Cada ocorrência de cartão é registrada com a cor — amarelo ou vermelho —, o minuto em que foi aplicado e o motivo. Um mesmo jogador pode receber mais de um cartão em partidas distintas, e uma mesma partida pode ter cartões de jogadores diferentes. O cartão vermelho implica suspensão automática do jogador nas partidas seguintes.

---

## Patrocínios e Ações Promocionais

**Empresas** podem patrocinar campeonatos. Cada empresa possui CNPJ único e nome. O vínculo entre uma empresa e um campeonato é chamado de **patrocínio**, que registra a data de assinatura e o valor financeiro investido. Uma empresa pode patrocinar múltiplos campeonatos, e um campeonato pode ter múltiplos patrocinadores.

Cada patrocínio pode conter uma ou mais **ações promocionais**, que representam as iniciativas de marketing vinculadas àquele contrato — como painéis de LED na arena, stands de degustação, patrocínio de transmissões digitais ou naming rights. Cada ação possui código, tipo, descrição e data de realização. Uma ação promocional só existe no contexto de um patrocínio específico.

---

## Restrições e Regras de Negócio

- Todo membro da equipe é obrigatoriamente jogador ou técnico, nunca os dois.
- Um jogador pode atuar em mais de uma posição.
- Uma rodada não existe sem seu campeonato.
- O registro de cartão exige a identificação do jogador, da partida e da cor do cartão.
- Uma ação promocional não existe independentemente de um patrocínio.
- Um time pode rivalizar com vários outros times, e cada rivalidade possui um apelido de clássico que é atributo da própria relação.
