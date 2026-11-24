import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Cartao, Selo } from './ui';
import { buscarDentista, buscarServico } from '../data/clinica';
import { formatarCurto, jaPassou } from '../utils/datas';
import { cores, espaco, raio } from '../theme';

export function statusDaConsulta(consulta) {
  if (consulta.status === 'cancelada') return { texto: 'Cancelada', tipo: 'perigo' };
  if (jaPassou(consulta)) return { texto: 'Realizada', tipo: 'sucesso' };
  if (consulta.status === 'checkin') return { texto: 'Check-in feito', tipo: 'sucesso' };
  return { texto: 'Agendada', tipo: 'info' };
}

export function ConsultaCard({ consulta }) {
  const servico = buscarServico(consulta.servicoId);
  const dentista = buscarDentista(consulta.dentistaId);
  const data = formatarCurto(consulta.data);
  const status = statusDaConsulta(consulta);

  return (
    // Toque no card → abre a rota dinâmica /consulta/[id] (empilha por cima das abas)
    <Cartao onPress={() => router.push(`/consulta/${consulta.id}`)} style={s.cartao}>
      <View style={s.data}>
        <Text style={s.semana}>{data.semana}</Text>
        <Text style={s.dia}>{data.dia}</Text>
        <Text style={s.mes}>{data.mes}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.servico}>{servico?.nome}</Text>
        <Text style={s.info}>{dentista?.nome}</Text>
        <View style={s.rodape}>
          <Ionicons name="time-outline" size={14} color={cores.textoSuave} />
          <Text style={s.info}> {consulta.horario}</Text>
          <View style={{ flex: 1 }} />
          <Selo texto={status.texto} tipo={status.tipo} />
        </View>
      </View>
    </Cartao>
  );
}

const s = StyleSheet.create({
  cartao: { flexDirection: 'row', gap: espaco.md, alignItems: 'center', marginBottom: espaco.sm + 4 },
  data: {
    width: 58, paddingVertical: 8, borderRadius: raio.md, backgroundColor: cores.primariaClara, alignItems: 'center',
  },
  semana: { fontSize: 12, color: cores.primariaEscura, fontWeight: '600' },
  dia: { fontSize: 22, color: cores.primariaEscura, fontWeight: '800' },
  mes: { fontSize: 12, color: cores.primariaEscura },
  servico: { fontSize: 16, fontWeight: '700', color: cores.texto },
  info: { fontSize: 14, color: cores.textoSuave, marginTop: 2 },
  rodape: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
});
