import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Botao, Campo } from '../components/ui';
import { usuarioDemo } from '../data/clinica';
import { cores, espaco, raio } from '../theme';

export default function Login() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function handleEntrar() {
    if (!email || !senha) {
      setErro('Preencha e-mail e senha.');
      return;
    }
    setErro('');
    setEnviando(true);
    try {
      await entrar(email, senha);
      // Não precisa navegar: o _layout raiz percebe o login e troca as rotas.
    } catch (e) {
      setErro(e.message);
      setEnviando(false);
    }
  }

  function preencherDemo() {
    setEmail(usuarioDemo.email);
    setSenha(usuarioDemo.senha);
    setErro('');
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: cores.fundo }}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
          <View style={s.logo}>
            <Ionicons name="happy-outline" size={40} color="#fff" />
          </View>
          <Text style={s.marca}>ClinicAgente</Text>
          <Text style={s.slogan}>Sua consulta odontológica na palma da mão.</Text>

          <View style={{ marginTop: espaco.xl }}>
            <Campo
              rotulo="E-mail"
              value={email}
              onChangeText={setEmail}
              placeholder="voce@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />
            <Campo rotulo="Senha" value={senha} onChangeText={setSenha} placeholder="••••••" secureTextEntry />
            {erro ? <Text style={s.erro}>{erro}</Text> : null}
            <Botao titulo="Entrar" onPress={handleEntrar} carregando={enviando} />
          </View>

          <Pressable onPress={preencherDemo} style={s.demo}>
            <Ionicons name="flash-outline" size={16} color={cores.primariaEscura} />
            <Text style={s.demoTexto}>Usar conta de demonstração</Text>
          </Pressable>

          <View style={s.rodape}>
            <Text style={{ color: cores.textoSuave }}>Ainda não tem conta? </Text>
            <Link href="/cadastro" style={s.link}>Criar conta</Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: espaco.lg },
  logo: {
    width: 76, height: 76, borderRadius: raio.lg, backgroundColor: cores.primaria,
    alignItems: 'center', justifyContent: 'center', alignSelf: 'center',
  },
  marca: { fontSize: 28, fontWeight: '800', color: cores.primariaEscura, textAlign: 'center', marginTop: espaco.md },
  slogan: { fontSize: 15, color: cores.textoSuave, textAlign: 'center', marginTop: 4 },
  erro: { color: cores.perigo, marginBottom: espaco.md, textAlign: 'center' },
  demo: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: espaco.md, padding: espaco.sm + 4, borderRadius: raio.md, backgroundColor: cores.primariaClara,
  },
  demoTexto: { color: cores.primariaEscura, fontWeight: '600' },
  rodape: { flexDirection: 'row', justifyContent: 'center', marginTop: espaco.lg },
  link: { color: cores.primaria, fontWeight: '700' },
});
