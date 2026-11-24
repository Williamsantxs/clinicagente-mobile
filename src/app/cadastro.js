import { useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { formatarEndereco, useCep } from '../hooks/useCep';
import { Botao, Campo, Titulo } from '../components/ui';
import { cores, espaco } from '../theme';

const emailValido = (e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

export default function Cadastro() {
  const { cadastrar } = useAuth();
  const [form, setForm] = useState({ nome: '', email: '', telefone: '', cep: '', numero: '', senha: '', confirmacao: '' });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState('');
  const [enviando, setEnviando] = useState(false);
  // Busca o endereço na API ViaCEP sempre que o CEP tiver 8 dígitos
  const cep = useCep(form.cep);

  // Um único handler para todos os campos: atualiza só a chave que mudou.
  const alterar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function validar() {
    const e = {};
    if (form.nome.trim().length < 3) e.nome = 'Informe seu nome completo.';
    if (!emailValido(form.email)) e.email = 'E-mail inválido.';
    if (form.telefone.replace(/\D/g, '').length < 10) e.telefone = 'Telefone com DDD.';
    if (form.senha.length < 6) e.senha = 'Mínimo de 6 caracteres.';
    if (form.confirmacao !== form.senha) e.confirmacao = 'As senhas não conferem.';
    setErros(e);
    return Object.keys(e).length === 0;
  }

  async function handleCadastrar() {
    if (!validar()) return;
    setEnviando(true);
    setErroGeral('');
    try {
      const endereco = cep.endereco
        ? `${formatarEndereco(cep.endereco)}${form.numero ? `, nº ${form.numero.trim()}` : ''}`
        : '';
      await cadastrar({ ...form, endereco });
    } catch (e) {
      setErroGeral(e.message);
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={{ padding: espaco.lg }} keyboardShouldPersistTaps="handled">
        <Titulo subtitulo="Leva menos de um minuto.">Seus dados</Titulo>
        <Campo rotulo="Nome completo" value={form.nome} onChangeText={alterar('nome')} erro={erros.nome} />
        <Campo
          rotulo="E-mail" value={form.email} onChangeText={alterar('email')} erro={erros.email}
          keyboardType="email-address" autoCapitalize="none"
        />
        <Campo
          rotulo="Telefone" value={form.telefone} onChangeText={alterar('telefone')} erro={erros.telefone}
          keyboardType="phone-pad" placeholder="(12) 99999-9999"
        />
        <Campo
          rotulo="CEP (opcional)" value={form.cep} onChangeText={alterar('cep')}
          keyboardType="number-pad" maxLength={9} placeholder="11680-000"
        />
        {/* Os 3 estados da chamada à API: carregando, erro e sucesso */}
        {cep.carregando ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: -8, marginBottom: espaco.md }}>
            <ActivityIndicator size="small" color={cores.primaria} />
            <Text style={{ marginLeft: 8, color: cores.textoSuave }}>Buscando endereço…</Text>
          </View>
        ) : null}
        {cep.erro ? <Text style={{ color: cores.perigo, marginTop: -8, marginBottom: espaco.md }}>{cep.erro}</Text> : null}
        {cep.endereco ? (
          <>
            <Text style={{ color: cores.sucesso, fontWeight: '600', marginTop: -8, marginBottom: espaco.md }}>
              📍 {formatarEndereco(cep.endereco)}
            </Text>
            <Campo rotulo="Número" value={form.numero} onChangeText={alterar('numero')} keyboardType="number-pad" />
          </>
        ) : null}
        <Campo rotulo="Senha" value={form.senha} onChangeText={alterar('senha')} erro={erros.senha} secureTextEntry />
        <Campo
          rotulo="Confirmar senha" value={form.confirmacao} onChangeText={alterar('confirmacao')}
          erro={erros.confirmacao} secureTextEntry
        />
        {erroGeral ? <Text style={{ color: cores.perigo, marginBottom: espaco.md }}>{erroGeral}</Text> : null}
        <Botao titulo="Criar conta" onPress={handleCadastrar} carregando={enviando} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
