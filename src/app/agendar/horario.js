// ETAPA 3 — escolher dia e horário.
// Dias: só os que o dentista atende. Horários: some os já ocupados.

import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useConsultas } from '../../context/ConsultasContext';
import { Botao, Etapas, Titulo } from '../../components/ui';
import { buscarDentista, horariosBase } from '../../data/clinica';
import { formatarCurto, formatarLongo, proximosDias } from '../../utils/datas';
import { cores, espaco, raio } from '../../theme';

export default function EscolherHorario() {
  const { servico, dentista: dentistaId } = useLocalSearchParams();
  const dentista = buscarDentista(dentistaId);
  const { horarioDisponivel } = useConsultas();

  const dias = proximosDias(dentista.diasAtendimento, 14);
  const [dia, setDia] = useState(dias[0]);
  const [horario, setHorario] = useState(null);

  function trocarDia(novo) {
    setDia(novo);
    setHorario(null); // horário de um dia não vale para outro
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: espaco.lg }}>
        <Etapas atual={3} />
        <Titulo subtitulo={dentista.nome}>Quando fica bom?</Titulo>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: espaco.sm }}>
          {dias.map((d) => {
            const f = formatarCurto(d);
            const ativo = d === dia;
            return (
              <Pressable key={d} onPress={() => trocarDia(d)} style={[s.dia, ativo && s.ativo]}>
                <Text style={[s.diaSemana, ativo && s.textoAtivo]}>{f.semana}</Text>
                <Text style={[s.diaNumero, ativo && s.textoAtivo]}>{f.dia}</Text>
                <Text style={[s.diaSemana, ativo && s.textoAtivo]}>{f.mes}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <Text style={s.legenda}>Horários em {formatarLongo(dia)}</Text>
        <View style={s.grade}>
          {horariosBase.map((h) => {
            const livre = horarioDisponivel(dentista.id, dia, h);
            const ativo = h === horario;
            return (
              <Pressable
                key={h}
                disabled={!livre}
                onPress={() => setHorario(h)}
                style={[s.horario, ativo && s.ativo, !livre && s.ocupado]}
              >
                <Text style={[s.horarioTexto, ativo && s.textoAtivo, !livre && s.ocupadoTexto]}>{h}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={s.dica}>Horários riscados já estão ocupados.</Text>
      </ScrollView>

      <View style={s.rodape}>
        <Botao
          titulo={horario ? `Continuar · ${horario}` : 'Escolha um horário'}
          desabilitado={!horario}
          onPress={() =>
            router.push({ pathname: '/agendar/confirmar', params: { servico, dentista: dentista.id, data: dia, horario } })
          }
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  dia: {
    width: 62, paddingVertical: 10, borderRadius: raio.md, alignItems: 'center',
    backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda,
  },
  diaSemana: { fontSize: 12, color: cores.textoSuave },
  diaNumero: { fontSize: 20, fontWeight: '800', color: cores.texto },
  ativo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  textoAtivo: { color: '#fff' },
  legenda: { fontSize: 15, fontWeight: '700', color: cores.texto, marginTop: espaco.lg, marginBottom: espaco.sm + 4 },
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: espaco.sm },
  horario: {
    width: '31%', paddingVertical: 12, borderRadius: raio.md, alignItems: 'center',
    backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda,
  },
  horarioTexto: { fontSize: 15, fontWeight: '600', color: cores.texto },
  ocupado: { backgroundColor: cores.fundo, borderStyle: 'dashed' },
  ocupadoTexto: { color: cores.textoSuave, textDecorationLine: 'line-through' },
  dica: { fontSize: 12, color: cores.textoSuave, marginTop: espaco.md },
  rodape: { padding: espaco.lg, borderTopWidth: 1, borderTopColor: cores.borda, backgroundColor: cores.superficie },
});
