// BIOMETRIA — impressão digital ou reconhecimento facial do próprio aparelho.
// O app nunca vê a digital: ele só pergunta ao sistema "é o dono?" e recebe sim/não.

import { Platform } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';

// Verifica se o aparelho TEM o sensor e se o usuário CADASTROU uma digital/rosto.
export async function biometriaDisponivel() {
  if (Platform.OS === 'web') return false;
  const temSensor = await LocalAuthentication.hasHardwareAsync();
  const cadastrada = await LocalAuthentication.isEnrolledAsync();
  return temSensor && cadastrada;
}

export async function autenticar(motivo = 'Confirme sua identidade') {
  if (Platform.OS === 'web') return false;
  const resultado = await LocalAuthentication.authenticateAsync({
    promptMessage: motivo,
    cancelLabel: 'Cancelar',
    fallbackLabel: 'Usar senha do aparelho',
  });
  return resultado.success;
}
