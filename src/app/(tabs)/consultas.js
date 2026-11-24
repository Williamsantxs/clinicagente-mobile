// ABA CONSULTAS — lista as próximas e o histórico, com um seletor no topo.
// Usa FlatList (lista otimizada do React Native: só renderiza o que aparece na tela).

import { useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { useConsultas } from '../../context/ConsultasContext';
import { ConsultaCard } from '../../components/ConsultaCard';
import { Botao, EstadoVazio } from '../../components/ui';
import { cores, espaco, raio } from '../../theme';

export default function Consultas() {
  const { proximas, historico, recarregar } = useConsultas();
  const [filtro, setFiltro] = useState('proximas');
  const [atualizando, setAtualizando] = useState(false);

  // Gesto "puxar para atualizar": arrasta a lista para baixo e solta
  async function aoPuxar() {
    setAtualizando(true);
    await recarregar();
    setAtualizando(false);
  }
  const lista = filtro === 'proximas' ? proximas : historico;

  return (
    <View style={{ flex: 1 }}>
      <View style={s.seletor}>
        <Opcao ativa={filtro === 'proximas'} texto={`Próximas (${proximas.length})`} onPress={() => setFiltro('proximas')} />
        <Opcao ativa={filtro === 'historico'} texto={`Histórico (${historico.length})`} onPress={() => setFiltro('historico')} />
      </View>

      <FlatList
        data={lista}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoPuxar} colors={[cores.primaria]} tintColor={cores.primaria} />}
        renderItem={({ item }) => <ConsultaCard consulta={item} />}
        contentContainerStyle={{ padding: espaco.lg, paddingTop: espaco.sm, flexGrow: 1 }}
        ListEmptyComponent={
          filtro === 'proximas' ? (
            <EstadoVazio icone="calendar-outline" titulo="Nenhuma consulta futura" texto="Agende pelo botão abaixo ou pelo + no topo.">
              <Botao titulo="Agendar consulta" icone="add" onPress={() => router.push('/agendar')} />
            </EstadoVazio>
          ) : (
            <EstadoVazio icone="time-outline" titulo="Sem histórico ainda" texto="Consultas realizadas e canceladas aparecem aqui." />
          )
        }
      />
    </View>
  );
}

function Opcao({ ativa, texto, onPress }) {
  return (
    <Pressable onPress={onPress} style={[s.opcao, ativa && s.opcaoAtiva]}>
      <Text style={[s.opcaoTexto, ativa && { color: '#fff' }]}>{texto}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  seletor: {
    flexDirection: 'row', margin: espaco.lg, marginBottom: espaco.sm, padding: 4,
    backgroundColor: cores.primariaClara, borderRadius: raio.md,
  },
  opcao: { flex: 1, paddingVertical: 10, borderRadius: raio.sm, alignItems: 'center' },
  opcaoAtiva: { backgroundColor: cores.primaria },
  opcaoTexto: { fontWeight: '600', color: cores.primariaEscura },
});
