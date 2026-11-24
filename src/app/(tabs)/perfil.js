// ABA PERFIL — dados do paciente, configurações nativas (biometria e
// lembretes), teste de notificação e logout.

import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useConsultas } from '../../context/ConsultasContext';
import { Botao, Campo, Cartao } from '../../components/ui';
import { avisar, confirmar } from '../../utils/alerta';
import { autenticar, biometriaDisponivel } from '../../services/biometria';
import { notificacaoDeTeste, notificacoesDisponiveis, pedirPermissao } from '../../services/notificacoes';
import { vibrar } from '../../services/haptics';
import { contatoClinica } from '../../data/clinica';
import { cores, espaco } from '../../theme';

export default function Perfil() {
  const { usuario, config, alterarConfig, atualizarPerfil, sair } = useAuth();
  const { proximas, historico } = useConsultas();
  const [editando, setEditando] = useState(false);
  const [nome, setNome] = useState(usuario.nome);
  const [telefone, setTelefone] = useState(usuario.telefone);
  const [temBiometria, setTemBiometria] = useState(false);

  // Descobre uma vez se o aparelho tem leitor de digital/rosto cadastrado
  useEffect(() => {
    biometriaDisponivel().then(setTemBiometria).catch(() => setTemBiometria(false));
  }, []);

  async function salvar() {
    await atualizarPerfil({ nome: nome.trim() || usuario.nome, telefone: telefone.trim() });
    setEditando(false);
  }

  async function alternarBiometria(ligar) {
    vibrar();
    if (ligar) {
      // Pede a digital AGORA para ter certeza que funciona antes de ativar
      const ok = await autenticar('Confirme para ativar o desbloqueio');
      if (!ok) return;
    }
    await alterarConfig({ biometria: ligar });
  }

  async function alternarLembretes(ligar) {
    vibrar();
    if (ligar && !(await pedirPermissao())) {
      avisar('Permissão negada', 'Ative as notificações do ClinicAgente nas configurações do celular.');
      return;
    }
    await alterarConfig({ lembretes: ligar });
  }

  async function testarNotificacao() {
    const ok = await notificacaoDeTeste(proximas[0]?.id);
    if (ok) avisar('Notificação agendada', 'Ela chega em 5 segundos. Pode até minimizar o app.');
    else avisar('Sem permissão', 'Ative as notificações nas configurações do celular.');
  }

  async function handleSair() {
    const ok = await confirmar('Sair da conta', 'Você precisará entrar de novo para ver suas consultas.', 'Sair');
    if (ok) await sair(); // o _layout raiz leva de volta ao login sozinho
  }

  const realizadas = historico.filter((c) => c.status !== 'cancelada').length;
  const ehWeb = Platform.OS === 'web';

  return (
    <ScrollView contentContainerStyle={{ padding: espaco.lg }}>
      <View style={s.topo}>
        <View style={s.avatar}>
          <Ionicons name="person" size={36} color="#fff" />
        </View>
        <Text style={s.nome}>{usuario.nome}</Text>
        <Text style={s.email}>{usuario.email}</Text>
      </View>

      <View style={s.numeros}>
        <Numero valor={proximas.length} rotulo="Agendadas" />
        <Numero valor={realizadas} rotulo="Realizadas" />
      </View>

      <Cartao style={{ marginTop: espaco.lg }}>
        {editando ? (
          <>
            <Campo rotulo="Nome" value={nome} onChangeText={setNome} />
            <Campo rotulo="Telefone" value={telefone} onChangeText={setTelefone} keyboardType="phone-pad" />
            <View style={{ flexDirection: 'row', gap: espaco.sm }}>
              <View style={{ flex: 1 }}><Botao titulo="Cancelar" variante="contorno" onPress={() => setEditando(false)} /></View>
              <View style={{ flex: 1 }}><Botao titulo="Salvar" onPress={salvar} /></View>
            </View>
          </>
        ) : (
          <>
            <Info icone="person-outline" rotulo="Nome" valor={usuario.nome} />
            <Info icone="call-outline" rotulo="Telefone" valor={usuario.telefone || '—'} />
            <Info icone="mail-outline" rotulo="E-mail" valor={usuario.email} />
            {usuario.endereco ? <Info icone="home-outline" rotulo="Endereço" valor={usuario.endereco} /> : null}
            <View style={{ marginTop: espaco.md }}>
              <Botao titulo="Editar dados" variante="secundario" icone="create-outline" onPress={() => setEditando(true)} />
            </View>
          </>
        )}
      </Cartao>

      {/* Recursos nativos do celular */}
      <Cartao style={{ marginTop: espaco.md }}>
        <Text style={s.cartaoTitulo}>Segurança e lembretes</Text>
        <Opcao
          icone="finger-print"
          titulo="Desbloquear com biometria"
          descricao={
            ehWeb ? 'Disponível apenas no celular.'
              : temBiometria ? 'Pede digital ou rosto ao abrir o app.'
              : 'Nenhuma digital/rosto cadastrado neste aparelho.'
          }
          valor={config.biometria}
          aoMudar={alternarBiometria}
          desabilitado={!temBiometria}
        />
        <Opcao
          icone="notifications-outline"
          titulo="Lembretes de consulta"
          descricao={ehWeb ? 'Disponível apenas no celular.' : 'Avisa 24h antes (ou 1h antes, se marcar em cima da hora).'}
          valor={config.lembretes}
          aoMudar={alternarLembretes}
          desabilitado={!notificacoesDisponiveis}
        />
        {notificacoesDisponiveis ? (
          <View style={{ marginTop: espaco.sm }}>
            <Botao titulo="Testar notificação (5 s)" variante="contorno" icone="paper-plane-outline" onPress={testarNotificacao} />
          </View>
        ) : null}
      </Cartao>

      <Cartao style={{ marginTop: espaco.md }}>
        <Text style={s.cartaoTitulo}>Contato da clínica</Text>
        <Info icone="call-outline" rotulo="Telefone" valor={contatoClinica.telefone} />
        <Info icone="location-outline" rotulo="Endereço" valor={contatoClinica.endereco} />
      </Cartao>

      <View style={{ marginTop: espaco.lg }}>
        <Botao titulo="Sair da conta" variante="perigo" icone="log-out-outline" onPress={handleSair} />
      </View>
      <Text style={s.versao}>ClinicAgente Mobile · v1.0.0</Text>
    </ScrollView>
  );
}

function Opcao({ icone, titulo, descricao, valor, aoMudar, desabilitado }) {
  return (
    <View style={s.opcao}>
      <Ionicons name={icone} size={22} color={desabilitado ? cores.textoSuave : cores.primaria} />
      <View style={{ flex: 1, marginHorizontal: 12 }}>
        <Text style={[s.infoValor, desabilitado && { color: cores.textoSuave }]}>{titulo}</Text>
        <Text style={s.infoRotulo}>{descricao}</Text>
      </View>
      <Switch
        value={valor && !desabilitado}
        onValueChange={aoMudar}
        disabled={desabilitado}
        trackColor={{ true: cores.primaria, false: cores.borda }}
        thumbColor="#fff"
      />
    </View>
  );
}

function Numero({ valor, rotulo }) {
  return (
    <Cartao style={{ flex: 1, alignItems: 'center' }}>
      <Text style={s.numero}>{valor}</Text>
      <Text style={s.email}>{rotulo}</Text>
    </Cartao>
  );
}

function Info({ icone, rotulo, valor }) {
  return (
    <View style={s.info}>
      <Ionicons name={icone} size={18} color={cores.primaria} />
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text style={s.infoRotulo}>{rotulo}</Text>
        <Text style={s.infoValor}>{valor}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  topo: { alignItems: 'center' },
  avatar: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: cores.primaria,
    alignItems: 'center', justifyContent: 'center', marginBottom: espaco.sm + 4,
  },
  nome: { fontSize: 22, fontWeight: '800', color: cores.texto },
  email: { fontSize: 14, color: cores.textoSuave, marginTop: 2 },
  numeros: { flexDirection: 'row', gap: espaco.sm + 4, marginTop: espaco.lg },
  numero: { fontSize: 26, fontWeight: '800', color: cores.primaria },
  cartaoTitulo: { fontSize: 16, fontWeight: '700', color: cores.texto, marginBottom: 4 },
  info: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  opcao: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  infoRotulo: { fontSize: 12, color: cores.textoSuave },
  infoValor: { fontSize: 15, color: cores.texto, fontWeight: '500' },
  versao: { textAlign: 'center', color: cores.textoSuave, fontSize: 12, marginTop: espaco.lg },
});
