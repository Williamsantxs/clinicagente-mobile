// ETAPA 4 — revisar e confirmar.
// Depois de salvar, fecha o modal inteiro e abre o detalhe da consulta criada.

import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConsultas } from '../../context/ConsultasContext';
import { Botao, Campo, Cartao, Etapas, Titulo } from '../../components/ui';
import { buscarDentista, buscarServico } from '../../data/clinica';
import { formatarLongo, formatarPreco } from '../../utils/datas';
import { avisar } from '../../utils/alerta';
import { vibrar } from '../../services/haptics';
import { cores, espaco } from '../../theme';

export default function Confirmar() {
  const { servico: servicoId, dentista: dentistaId, data, horario } = useLocalSearchParams();
  const servico = buscarServico(servicoId);
  const dentista = buscarDentista(dentistaId);
  const { agendar } = useConsultas();
  const [observacao, setObservacao] = useState('');
  const [salvando, setSalvando] = useState(false);

  async function handleConfirmar() {
    setSalvando(true);
    try {
      const nova = await agendar({ servicoId, dentistaId, data, horario, observacao });
      vibrar('sucesso'); // vibração de confirmação
      // 1) volta para as abas, fechando o modal com todas as etapas
      router.dismissTo('/');
      // 2) abre o detalhe da consulta que acabou de ser criada
      router.push(`/consulta/${nova.id}`);
    } catch (e) {
      vibrar('erro');
      avisar('Não foi possível agendar', e.message);
      setSalvando(false);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: espaco.lg }} keyboardShouldPersistTaps="handled">
        <Etapas atual={4} />
        <Titulo subtitulo="Confira antes de confirmar.">Resumo</Titulo>

        <Cartao>
          <Item icone="medkit-outline" rotulo="Serviço" valor={servico.nome} />
          <Item icone="person-outline" rotulo="Dentista" valor={dentista.nome} />
          <Item icone="calendar-outline" rotulo="Data" valor={formatarLongo(data)} />
          <Item icone="time-outline" rotulo="Horário" valor={`${horario} · ${servico.duracao} min`} />
          <Item icone="cash-outline" rotulo="Valor" valor={formatarPreco(servico.preco)} ultimo />
        </Cartao>

        <View style={{ marginTop: espaco.lg }}>
          <Campo
            rotulo="Observação (opcional)"
            placeholder="Ex.: sinto sensibilidade no dente de cima"
            value={observacao}
            onChangeText={setObservacao}
            multiline
            style={{ minHeight: 90, textAlignVertical: 'top' }}
          />
        </View>
        <Text style={s.aviso}>
          Você receberá um lembrete no celular antes da consulta (se estiver ativado no Perfil). Cancelamentos podem ser
          feitos pelo app até o horário marcado.
        </Text>
      </ScrollView>

      <View style={s.rodape}>
        <Botao titulo="Confirmar agendamento" icone="checkmark-circle-outline" onPress={handleConfirmar} carregando={salvando} />
      </View>
    </View>
  );
}

function Item({ icone, rotulo, valor, ultimo }) {
  return (
    <View style={[s.item, !ultimo && s.divisor]}>
      <Ionicons name={icone} size={20} color={cores.primaria} />
      <Text style={s.rotulo}>{rotulo}</Text>
      <Text style={s.valor}>{valor}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  item: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  divisor: { borderBottomWidth: 1, borderBottomColor: cores.borda },
  rotulo: { marginLeft: 12, color: cores.textoSuave, fontSize: 14, width: 80 },
  valor: { flex: 1, textAlign: 'right', color: cores.texto, fontWeight: '600', fontSize: 15 },
  aviso: { fontSize: 12, color: cores.textoSuave },
  rodape: { padding: espaco.lg, borderTopWidth: 1, borderTopColor: cores.borda, backgroundColor: cores.superficie },
});
