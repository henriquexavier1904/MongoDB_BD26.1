1. times{!Time, < EnderecoArena >, < Rival >}
   1. Time(#_id, -cod, -nome)
   2. EnderecoArena(cidade, endereco)
   3. Rival(time_id, apelidoClassico)
   4. EMB(Time, <EnderecoArena>)
   5. EMB(Time, [-Rival])
   6. REF(Rival, Time)

2. campeonatos{!Campeonato, < Rodada >}
   1. Campeonato(#_id, -cod, nome, dataInicio, dataFim, tipo)
   2. Rodada(#numero)
   3. EMB(Campeonato, [+Rodada])

3. partidas{!Partida, < Cartao >}
   1. Partida(#_id, idPartida, data, placarMandante,
              placarVisitante, publico, arbitro,
              timeMandante_id, timeVisitante_id,
              campeonato_id, numeroRodada)
   2. Cartao(jogador_id, cor, #minuto, motivo)
   3. EMB(Partida, [+Cartao])
   4. REF(Partida, times)       // timeMandante_id
   5. REF(Partida, times)       // timeVisitante_id
   6. REF(Partida, campeonatos) // campeonato_id
