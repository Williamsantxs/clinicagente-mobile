// ETAPA 1 — escolher o serviço.
// Pode receber ?dentista=d1 (vindo da tela do dentista) → mostra só os
// serviços desse dentista e pula a etapa 2.

import { useEffect, useRef } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Cartao, Etapas, Titulo } from '../../components/ui';
import { buscarDentista, servicos } from '../../data/clinica';
import { formatarPreco } from '../../utils/datas';
import { cores, espaco, raio } from '../../theme';

export default function EscolherServico() {
  const { dentista: dentistaId, servico: servicoPre } = useLocalSearchParams();
  const dentista = dentistaId ? buscarDentista(dentistaId) : null;
  const lista = dentista ? servicos.filter((s) => dentista.servicos.includes(s.id)) : servicos;
  const jaAvancou = useRef(false);

  function escolher(servicoId) {
    if (dentista) {
      router.push({ pathname: '/agendar/horario', params: { servico: servicoId, dentista: dentista.id } });
    } else {
      router.push({ pathname: '/agendar/dentista', params: { servico: servicoId } });
    }
  }

  // Veio da tela Início já com o serviço escolhido? Avança direto para a etapa 2.
  useEffect(() => {
    if (servicoPre && !jaAvancou.current) {
      jaAvancou.current = true;
      escolher(servicoPre);
    }
  }, [servicoPre]);

  return (
    <ScrollView contentContainerStyle={{ padding: espaco.lg }}>
      <Etapas atual={1} />
      <Titulo subtitulo={dentista ? `Serviços atendidos por ${dentista.nome}` : 'O que você precisa?'}>
        Escolha o serviço
      </Titulo>
      {lista.map((sv) => (
        <Cartao key={sv.id} style={s.cartao} onPress={() => escolher(sv.id)}>
          <View style={s.icone}>
            <Ionicons name={sv.icone} size={22} color={cores.primaria} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.nome}>{sv.nome}</Text>
            <Text style={s.desc}>{sv.descricao}</Text>
            <Text style={s.meta}>
              {sv.duracao} min · {formatarPreco(sv.preco)}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={cores.textoSuave} />
        </Cartao>
      ))}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  cartao: { flexDirection: 'row', alignItems: 'center', gap: espaco.md, marginBottom: espaco.sm + 4 },
  icone: {
    width: 44, height: 44, borderRadius: raio.md, backgroundColor: cores.primariaClara,
    alignItems: 'center', justifyContent: 'center',
  },
  nome: { fontSize: 16, fontWeight: '700', color: cores.texto },
  desc: { fontSize: 13, color: cores.textoSuave, marginTop: 2 },
  meta: { fontSize: 13, color: cores.primariaEscura, fontWeight: '600', marginTop: 6 },
});
