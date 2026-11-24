// ETAPA 2 — escolher o dentista (só os que fazem o serviço escolhido).

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Cartao, Etapas, Titulo } from '../../components/ui';
import { buscarServico, dentistas } from '../../data/clinica';
import { iniciais } from '../../utils/texto';
import { cores, espaco } from '../../theme';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function EscolherDentista() {
  const { servico: servicoId } = useLocalSearchParams();
  const servico = buscarServico(servicoId);
  const disponiveis = dentistas.filter((d) => d.servicos.includes(servicoId));

  return (
    <ScrollView contentContainerStyle={{ padding: espaco.lg }}>
      <Etapas atual={2} />
      <Titulo subtitulo={`Profissionais que fazem ${servico?.nome.toLowerCase()}`}>Escolha o dentista</Titulo>
      {disponiveis.map((d) => (
        <Cartao
          key={d.id}
          style={s.cartao}
          onPress={() => router.push({ pathname: '/agendar/horario', params: { servico: servicoId, dentista: d.id } })}
        >
          <View style={s.avatar}>
            <Text style={s.avatarTexto}>{iniciais(d.nome)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.nome}>{d.nome}</Text>
            <Text style={s.esp}>{d.especialidade}</Text>
            <Text style={s.dias}>Atende: {d.diasAtendimento.map((n) => DIAS[n]).join(', ')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />
        </Cartao>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cartao: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginBottom: espaco.sm + 4 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: '#fff', fontWeight: '800' },
  nome: { fontSize: 16, fontWeight: '700', color: cores.texto },
  esp: { fontSize: 14, color: cores.textoSuave },
  dias: { fontSize: 12, color: cores.primariaEscura, marginTop: 4, fontWeight: '600' },
});
