// PILHA DO AGENDAMENTO (navegação ANINHADA).
//
// No _layout raiz, "agendar" abre como modal. Dentro do modal existe
// ESTA pilha, com 4 etapas. Cada etapa empilha a próxima e o botão
// "voltar" do cabeçalho volta uma etapa — sem fechar o modal.
//
// Os dados escolhidos (serviço, dentista, data, horário) passam de uma
// etapa para a outra pela URL, como parâmetros: /agendar/horario?servico=limpeza&dentista=d1

import { Pressable } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { cores } from '../../theme';

export default function LayoutAgendar() {
  return (
    <Stack
      screenOptions={{
        headerTintColor: cores.primariaEscura,
        headerTitleStyle: { fontWeight: '700' },
        contentStyle: { backgroundColor: cores.fundo },
        headerBackButtonDisplayMode: 'minimal',
        // "X" para fechar o modal inteiro de qualquer etapa
        headerRight: () => (
          <Pressable onPress={() => router.dismissTo('/')} hitSlop={12}>
            <Ionicons name="close" size={26} color={cores.textoSuave} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Serviço' }} />
      <Stack.Screen name="dentista" options={{ title: 'Dentista' }} />
      <Stack.Screen name="horario" options={{ title: 'Data e horário' }} />
      <Stack.Screen name="confirmar" options={{ title: 'Confirmar' }} />
    </Stack>
  );
}
