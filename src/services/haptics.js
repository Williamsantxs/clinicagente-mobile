// FEEDBACK TÁTIL (vibração) — recurso nativo do celular.
// Três intensidades para três situações diferentes:
//   toque   → toque comum em botão
//   sucesso → algo deu certo (agendou, fez check-in)
//   alerta  → ação destrutiva/erro (cancelar consulta, QR inválido)
// No navegador não existe motor de vibração, então simplesmente não faz nada.

import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

const ehCelular = Platform.OS !== 'web';

export function vibrar(tipo = 'toque') {
  if (!ehCelular) return;
  try {
    if (tipo === 'sucesso') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (tipo === 'alerta') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    else if (tipo === 'erro') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // aparelho sem motor de vibração: ignora
  }
}
