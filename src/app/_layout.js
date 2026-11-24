// LAYOUT RAIZ — o primeiro arquivo que o Expo Router carrega.
//
// Ele faz duas coisas:
// 1. Envolve o app inteiro com os Providers (Auth e Consultas), para que
//    qualquer tela consiga usar useAuth() e useConsultas().
// 2. Define o navegador principal (Stack = pilha de telas) e PROTEGE as rotas:
//    - sem login  → só existem "login" e "cadastro"
//    - com login  → existem as abas, os detalhes e o fluxo de agendamento
//    Isso é feito com <Stack.Protected guard={...}>. Quando o guard muda
//    (ex.: usuário fez login), o Expo Router redireciona sozinho.
// 3. Se a biometria estiver ativa, mostra a TelaBloqueio no lugar de tudo.
// 4. Escuta toques em notificações para abrir a consulta certa.

import { ActivityIndicator, View } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from '../context/AuthContext';
import { ConsultasProvider } from '../context/ConsultasContext';
import { TelaBloqueio } from '../components/TelaBloqueio';
import { useAbrirPelaNotificacao } from '../hooks/useAbrirPelaNotificacao';
import { cores } from '../theme';

function NavegadorRaiz() {
  const { usuario, carregando, bloqueado } = useAuth();
  const logado = !!usuario;

  // Hooks SEMPRE no topo, antes de qualquer "return" (regra dos hooks do React)
  useAbrirPelaNotificacao(logado && !bloqueado && !carregando);

  // Enquanto lê a sessão salva no aparelho, mostra um carregando
  // (evita "piscar" a tela de login para quem já estava logado).
  if (carregando) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
        <ActivityIndicator size="large" color={cores.primaria} />
      </View>
    );
  }

  if (bloqueado) return <TelaBloqueio />;

  return (
    <Stack
      screenOptions={{
        headerTintColor: cores.primariaEscura,
        headerTitleStyle: { fontWeight: '700' },
        headerStyle: { backgroundColor: cores.superficie },
        contentStyle: { backgroundColor: cores.fundo },
        headerBackButtonDisplayMode: 'minimal',
      }}
    >
      {/* Rotas da área logada */}
      <Stack.Protected guard={logado}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="consulta/[id]" options={{ title: 'Detalhes da consulta' }} />
        <Stack.Screen name="dentista/[id]" options={{ title: 'Dentista' }} />
        <Stack.Screen name="clinica" options={{ title: 'Como chegar' }} />
        {/* Câmera em tela cheia para ler o QR Code da recepção */}
        <Stack.Screen name="checkin/[id]" options={{ title: 'Check-in', presentation: 'fullScreenModal', headerShown: false }} />
        {/* O agendamento abre como MODAL (sobe de baixo) e tem a sua própria pilha */}
        <Stack.Screen name="agendar" options={{ presentation: 'modal', headerShown: false }} />
      </Stack.Protected>

      {/* Rotas públicas (só aparecem para quem NÃO está logado) */}
      <Stack.Protected guard={!logado}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="cadastro" options={{ title: 'Criar conta' }} />
      </Stack.Protected>
    </Stack>
  );
}

export default function LayoutRaiz() {
  return (
    <AuthProvider>
      <ConsultasProvider>
        <StatusBar style="dark" />
        <NavegadorRaiz />
      </ConsultasProvider>
    </AuthProvider>
  );
}
