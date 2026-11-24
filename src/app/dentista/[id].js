// ROTA DINÂMICA do dentista. Também ajusta o título do cabeçalho
// em tempo real com <Stack.Screen options={...} /> dentro da própria tela.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { Botao, Cartao, EstadoVazio, Selo } from '../../components/ui';
import { buscarDentista, buscarServico } from '../../data/clinica';
import { iniciais } from '../../utils/texto';
import { cores, espaco } from '../../theme';

const DIAS = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export default function PerfilDentista() {
  const { id } = useLocalSearchParams();
  const dentista = buscarDentista(id);

  if (!dentista) return <EstadoVazio icone="alert-circle-outline" titulo="Dentista não encontrado" />;

  return (
    <ScrollView contentContainerStyle={{ padding: espaco.lg }}>
      <Stack.Screen options={{ title: dentista.nome }} />

      <View style={{ alignItems: 'center' }}>
        <View style={s.avatar}>
          <Text style={s.avatarTexto}>{iniciais(dentista.nome)}</Text>
        </View>
        <Text style={s.nome}>{dentista.nome}</Text>
        <Text style={s.esp}>{dentista.especialidade} · {dentista.cro}</Text>
      </View>

      <Cartao style={{ marginTop: espaco.lg }}>
        <Text style={s.secao}>Sobre</Text>
        <Text style={s.texto}>{dentista.bio}</Text>
      </Cartao>

      <Cartao style={{ marginTop: espaco.md }}>
        <Text style={s.secao}>Serviços</Text>
        <View style={s.selos}>
          {dentista.servicos.map((sid) => <Selo key={sid} texto={buscarServico(sid).nome} />)}
        </View>
        <Text style={[s.secao, { marginTop: espaco.md }]}>Dias de atendimento</Text>
        <Text style={s.texto}>{dentista.diasAtendimento.map((d) => DIAS[d]).join(', ')}</Text>
      </Cartao>

      <View style={{ marginTop: espaco.lg }}>
        <Botao
          titulo="Agendar com este dentista"
          icone="calendar-outline"
          onPress={() => router.push({ pathname: '/agendar', params: { dentista: dentista.id } })}
        />
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  avatar: { width: 88, height: 88, borderRadius: 44, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center' },
  avatarTexto: { color: '#fff', fontSize: 30, fontWeight: '800' },
  nome: { fontSize: 22, fontWeight: '800', color: cores.texto, marginTop: espaco.sm + 4 },
  esp: { fontSize: 14, color: cores.textoSuave, marginTop: 4 },
  secao: { fontSize: 15, fontWeight: '700', color: cores.texto, marginBottom: 6 },
  texto: { fontSize: 15, color: cores.textoSuave, lineHeight: 22 },
  selos: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
