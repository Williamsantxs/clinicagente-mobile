// ABA DENTISTAS — lista a equipe. Tocar num dentista abre /dentista/[id].

import { FlatList, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Cartao } from '../../components/ui';
import { dentistas } from '../../data/clinica';
import { iniciais } from '../../utils/texto';
import { cores, espaco } from '../../theme';

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export default function Dentistas() {
  return (
    <FlatList
      data={dentistas}
      keyExtractor={(d) => d.id}
      contentContainerStyle={{ padding: espaco.lg }}
      renderItem={({ item }) => (
        <Cartao style={s.cartao} onPress={() => router.push(`/dentista/${item.id}`)}>
          <View style={s.avatar}>
            <Text style={s.avatarTexto}>{iniciais(item.nome)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.nome}>{item.nome}</Text>
            <Text style={s.esp}>{item.especialidade}</Text>
            <Text style={s.dias}>{item.diasAtendimento.map((d) => DIAS[d]).join(' · ')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />
        </Cartao>
      )}
    />
  );
}

const s = StyleSheet.create({
  cartao: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginBottom: espaco.sm + 4 },
  avatar: {
    width: 52, height: 52, borderRadius: 26, backgroundColor: cores.primaria,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarTexto: { color: '#fff', fontWeight: '800', fontSize: 17 },
  nome: { fontSize: 16, fontWeight: '700', color: cores.texto },
  esp: { fontSize: 14, color: cores.textoSuave, marginTop: 2 },
  dias: { fontSize: 12, color: cores.primariaEscura, marginTop: 4, fontWeight: '600' },
});
