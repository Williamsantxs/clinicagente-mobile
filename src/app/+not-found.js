// Rota especial: aparece quando o usuário abre um endereço que não existe
// (ex.: um link quebrado). Evita a tela branca.

import { View } from 'react-native';
import { Stack, router } from 'expo-router';
import { Botao, EstadoVazio } from '../components/ui';

export default function NaoEncontrada() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 24 }}>
      <Stack.Screen options={{ title: 'Ops!' }} />
      <EstadoVazio icone="help-circle-outline" titulo="Tela não encontrada" texto="Esse endereço não existe no app.">
        <Botao titulo="Voltar ao início" onPress={() => router.replace('/')} />
      </EstadoVazio>
    </View>
  );
}
