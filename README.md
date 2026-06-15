# MongoDB_BD26.1
MongoDB adaptation of the EER project developed.
# Minimundo — Sistema de Campeonato de Futebol
O sistema gerencia as informações relacionadas à organização e acompanhamento de campeonatos de futebol, abrangendo times, campeonatos e partidas.


Times

Cada time possui um código identificador único, um nome oficial e o endereço completo de sua arena — composto por cidade e logradouro. Um time pode estabelecer rivalidades históricas com outros times, sendo cada rivalidade identificada pelo apelido popular do clássico entre os dois clubes, como "Clássico dos Clássicos". Um time pode rivalizar com vários outros times, e cada rivalidade possui um apelido que é atributo da própria relação.


Campeonatos e Rodadas

Um campeonato é identificado por um código único e possui nome, data de início, data de encerramento e tipo — como estadual, regional ou nacional. Cada campeonato é dividido em rodadas, identificadas por um número sequencial dentro do campeonato. Uma rodada não existe de forma independente: ela pertence obrigatoriamente a um campeonato e deixa de existir caso o campeonato seja removido.


Partidas

Cada partida é disputada entre dois times — o mandante e o visitante — dentro de uma rodada específica de um campeonato. Uma partida possui identificador próprio, data de realização, placar do time mandante, placar do time visitante, número de espectadores presentes e nome do árbitro responsável.

Durante uma partida, jogadores podem receber cartões. Cada ocorrência de cartão é registrada com a identificação do jogador, a cor — amarelo ou vermelho —, o minuto em que foi aplicado e o motivo. Uma mesma partida pode ter cartões de jogadores diferentes, e um mesmo jogador pode receber cartões em partidas distintas.


Restrições e Regras de Negócio


Uma rodada não existe sem seu campeonato.
Cada partida envolve obrigatoriamente um time mandante e um time visitante distintos.
O registro de cartão exige a identificação do jogador, da partida e da cor do cartão.
Um time pode rivalizar com vários outros times; cada rivalidade possui um apelido que é atributo da relação entre os dois times.
O endereço da arena é um atributo composto do time, formado por cidade e logradouro.
