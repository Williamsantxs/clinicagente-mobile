// MENU INFERIOR (Bottom Tabs) — o "menu mobile" do app.
//
// A pasta se chama (tabs) com parênteses: isso é um GRUPO de rotas.
// Os parênteses NÃO entram na URL (a tela de consultas é "/consultas",
// não "/(tabs)/consultas"). O grupo serve só para organizar e para dar
// a essas 4 telas um navegador próprio: as abas.
//
// Cada <Tabs.Screen name="..."> aponta para um arquivo desta pasta.

import { Pressable } from 'react-native';
import { Tabs } from 'expo-router/js-tabs';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../../theme';

// Função que devolve o ícone certo: preenchido quando a aba está ativa,
// só contorno quando não está. Padrão comum em apps (iOS e Android).
const icone = (nome) => ({ color, focused, size }) => (
  <Ionicons name={focused ? nome : `${nome}-outline`} size={size} color={color} />
);

export default function LayoutAbas() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: cores.primaria,
        tabBarInactiveTintColor: cores.textoSuave,
        tabBarStyle: { backgroundColor: cores.superficie, borderTopColor: cores.borda },
        headerTintColor: cores.primariaEscura,
        headerTitleStyle: { fontWeight: '700' },
        sceneStyle: { backgroundColor: cores.fundo },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Início', headerShown: false, tabBarIcon: icone('home') }} />
      <Tabs.Screen
        name="consultas"
        options={{
          title: 'Consultas',
          tabBarIcon: icone('calendar'),
          // Botão "+" no cabeçalho: atalho para o fluxo de agendamento
          headerRight: () => (
            <Pressable onPress={() => router.push('/agendar')} hitSlop={12} style={{ marginRight: 16 }}>
              <Ionicons name="add-circle" size={28} color={cores.primaria} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen name="dentistas" options={{ title: 'Dentistas', tabBarIcon: icone('people') }} />
      <Tabs.Screen name="perfil" options={{ title: 'Perfil', tabBarIcon: icone('person') }} />
    </Tabs>
  );
}
