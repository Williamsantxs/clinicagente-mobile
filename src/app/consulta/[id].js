// ROTA DINÂMICA — o [id] no nome do arquivo vira um parâmetro.
// /consulta/c-123 → esta tela recebe id = "c-123" via useLocalSearchParams().
// Uma única tela serve para QUALQUER consulta.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useConsultas } from '../../context/ConsultasContext';
import { Botao, Cartao, EstadoVazio, Selo } from '../../components/ui';
import { statusDaConsulta } from '../../components/ConsultaCard';
import { buscarDentista, buscarServico, contatoClinica } from '../../data/clinica';
import { formatarLongo, formatarPreco } from '../../utils/datas';
import { confirmar } from '../../utils/alerta';
import { vibrar } from '../../services/haptics';
import { cores, espaco } from '../../theme';

export default function DetalheConsulta() {
  const { id } = useLocalSearchParams();
  const { buscarConsulta, cancelar } = useConsultas();
  const consulta = buscarConsulta(id);

  if (!consulta) {
    return <EstadoVazio icone="alert-circle-outline" titulo="Consulta não encontrada" />;
  }

  const servico = buscarServico(consulta.servicoId);
  const dentista = buscarDentista(consulta.dentistaId);
  const status = statusDaConsulta(consulta);
  const podeCancelar = status.texto === 'Agendada';
  const podeFazerCheckin = status.texto === 'Agendada';

  async function handleCancelar() {
    const ok = await confirmar(
      'Cancelar consulta?',
      `${servico.nome} em ${formatarLongo(consulta.data)} às ${consulta.horario}.`,
      'Cancelar consulta'
    );
    if (ok) {
      vibrar('alerta');
      await cancelar(consulta.id);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ padding: espaco.lg }}>
      <Selo texto={status.texto} tipo={status.tipo} />
      <Text style={s.titulo}>{servico.nome}</Text>
      <Text style={s.data}>
        {formatarLongo(consulta.data)} · {consulta.horario}
      </Text>

      <Cartao style={{ marginTop: espaco.lg }}>
        <Linha icone="person-outline" texto={`${dentista.nome} — ${dentista.especialidade}`} />
        <Linha icone="hourglass-outline" texto={`Duração estimada: ${servico.duracao} min`} />
        <Linha icone="cash-outline" texto={`Valor: ${formatarPreco(servico.preco)}`} />
        <Linha icone="location-outline" texto={contatoClinica.endereco} />
      </Cartao>

      {consulta.observacao ? (
        <Cartao style={{ marginTop: espaco.md }}>
          <Text style={s.rotulo}>Sua observação</Text>
          <Text style={s.obs}>{consulta.observacao}</Text>
        </Cartao>
      ) : null}

      {consulta.status === 'checkin' && consulta.checkinEm ? (
        <Cartao style={[s.checkin]}>
          <Text style={s.checkinTexto}>
            ✅ Check-in feito às {new Date(consulta.checkinEm).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </Cartao>
      ) : null}

      <View style={{ marginTop: espaco.lg, gap: espaco.sm + 4 }}>
        {podeFazerCheckin && (
          <Botao titulo="Cheguei! Fazer check-in" icone="qr-code-outline" onPress={() => router.push(`/checkin/${consulta.id}`)} />
        )}
        <Botao titulo="Ver perfil do dentista" variante="secundario" icone="person-circle-outline"
          onPress={() => router.push(`/dentista/${dentista.id}`)} />
        {podeCancelar && (
          <Botao titulo="Cancelar consulta" variante="perigo" icone="close-circle-outline" onPress={handleCancelar} />
        )}
      </View>
    </ScrollView>
  );
}

function Linha({ icone, texto }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8 }}>
      <Ionicons name={icone} size={18} color={cores.primaria} />
      <Text style={{ marginLeft: 12, color: cores.texto, flex: 1, fontSize: 15 }}>{texto}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  titulo: { fontSize: 26, fontWeight: '800', color: cores.texto, marginTop: espaco.sm + 4 },
  data: { fontSize: 16, color: cores.textoSuave, marginTop: 4 },
  rotulo: { fontSize: 13, color: cores.textoSuave, marginBottom: 4 },
  obs: { fontSize: 15, color: cores.texto },
  checkin: { marginTop: espaco.md, backgroundColor: cores.sucessoClaro, borderColor: cores.sucessoClaro },
  checkinTexto: { color: cores.sucesso, fontWeight: '700', fontSize: 15 },
});
