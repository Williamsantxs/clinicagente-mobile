// ABA INÍCIO — resumo: próxima consulta, atalhos e serviços.

import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { useConsultas } from '../../context/ConsultasContext';
import { Botao, Cartao, EstadoVazio } from '../../components/ui';
import { ConsultaCard } from '../../components/ConsultaCard';
import { contatoClinica, servicos } from '../../data/clinica';
import { formatarPreco, saudacao } from '../../utils/datas';
import { cores, espaco, raio } from '../../theme';

export default function Inicio() {
  const { usuario } = useAuth();
  const { proximas } = useConsultas();
  const primeiroNome = usuario?.nome.split(' ')[0];
  const proxima = proximas[0];

  return (
    <SafeAreaView edges={['top']} style={{ flex: 1, backgroundColor: cores.fundo }}>
      <ScrollView contentContainerStyle={{ padding: espaco.lg, paddingBottom: espaco.xl }}>
        <Text style={s.saudacao}>{saudacao()},</Text>
        <Text style={s.nome}>{primeiroNome} 👋</Text>

        {/* Cartão de destaque com a próxima consulta */}
        <Text style={s.secao}>Próxima consulta</Text>
        {proxima ? (
          <ConsultaCard consulta={proxima} />
        ) : (
          <Cartao>
            <EstadoVazio icone="calendar-clear-outline" titulo="Nenhuma consulta marcada" texto="Que tal agendar uma avaliação?">
              <Botao titulo="Agendar agora" icone="add" onPress={() => router.push('/agendar')} />
            </EstadoVazio>
          </Cartao>
        )}

        {/* Atalhos — mostram que as abas não são o único jeito de navegar */}
        <View style={s.atalhos}>
          <Atalho icone="add-circle-outline" texto="Agendar" onPress={() => router.push('/agendar')} />
          <Atalho icone="list-outline" texto="Minhas consultas" onPress={() => router.navigate('/consultas')} />
          <Atalho icone="people-outline" texto="Dentistas" onPress={() => router.navigate('/dentistas')} />
        </View>

        <Text style={s.secao}>Serviços</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: espaco.sm + 4 }}>
          {servicos.map((sv) => (
            <Cartao key={sv.id} style={s.servico} onPress={() => router.push(`/agendar?servico=${sv.id}`)}>
              <Ionicons name={sv.icone} size={24} color={cores.primaria} />
              <Text style={s.servicoNome}>{sv.nome}</Text>
              <Text style={s.servicoPreco}>{formatarPreco(sv.preco)}</Text>
            </Cartao>
          ))}
        </ScrollView>

        {/* Toque no cartão → tela de geolocalização "Como chegar" */}
        <Cartao style={{ marginTop: espaco.lg }} onPress={() => router.push('/clinica')}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[s.clinicaNome, { flex: 1 }]}>{contatoClinica.nome}</Text>
            <Text style={s.comoChegar}>Como chegar</Text>
            <Ionicons name="chevron-forward" size={16} color={cores.primaria} />
          </View>
          <Linha icone="location-outline" texto={contatoClinica.endereco} />
          <Linha icone="call-outline" texto={contatoClinica.telefone} />
          <Linha icone="time-outline" texto={contatoClinica.horario} />
        </Cartao>
      </ScrollView>
    </SafeAreaView>
  );
}

function Atalho({ icone, texto, onPress }) {
  return (
    <Cartao style={s.atalho} onPress={onPress}>
      <Ionicons name={icone} size={26} color={cores.primaria} />
      <Text style={s.atalhoTexto}>{texto}</Text>
    </Cartao>
  );
}

function Linha({ icone, texto }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
      <Ionicons name={icone} size={16} color={cores.textoSuave} />
      <Text style={{ marginLeft: 8, color: cores.textoSuave, flex: 1 }}>{texto}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  saudacao: { fontSize: 16, color: cores.textoSuave, marginTop: espaco.sm },
  nome: { fontSize: 28, fontWeight: '800', color: cores.texto },
  secao: { fontSize: 17, fontWeight: '700', color: cores.texto, marginTop: espaco.lg, marginBottom: espaco.sm + 4 },
  atalhos: { flexDirection: 'row', gap: espaco.sm + 4, marginTop: espaco.md },
  atalho: { flex: 1, alignItems: 'center', paddingVertical: espaco.md, gap: 6 },
  atalhoTexto: { fontSize: 13, fontWeight: '600', color: cores.texto, textAlign: 'center' },
  servico: { width: 130, gap: 6, borderRadius: raio.md },
  servicoNome: { fontSize: 14, fontWeight: '700', color: cores.texto },
  servicoPreco: { fontSize: 13, color: cores.textoSuave },
  clinicaNome: { fontSize: 16, fontWeight: '700', color: cores.texto },
  comoChegar: { fontSize: 13, fontWeight: '700', color: cores.primaria },
});
