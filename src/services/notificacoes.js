// NOTIFICAÇÕES LOCAIS — lembretes de consulta na bandeja do sistema.
//
// "Local" = o próprio celular agenda e dispara, sem servidor e sem internet.
// (Notificação push, que vem de um servidor, não funciona no Expo Go no Android
// desde o SDK 53 — por isso usamos só as locais.)
//
// Cada notificação leva em `data.url` o endereço da consulta. Quando o usuário
// toca nela, o _layout raiz lê esse endereço e abre a tela certa.

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export const notificacoesDisponiveis = Platform.OS !== 'web';

// Como mostrar a notificação se ela chegar com o app ABERTO
if (notificacoesDisponiveis) {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

// Pede permissão (Android 13+ e iOS exigem) e cria o canal no Android.
export async function pedirPermissao() {
  if (!notificacoesDisponiveis) return false;
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('lembretes', {
      name: 'Lembretes de consulta',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
    });
  }
  const atual = await Notifications.getPermissionsAsync();
  if (atual.granted) return true;
  const pedido = await Notifications.requestPermissionsAsync();
  return pedido.granted;
}

// Agenda o lembrete 24h antes. Se faltar menos de 24h, avisa 1h antes.
// Se faltar menos de 1h, não agenda (não faz sentido lembrar).
export async function agendarLembrete({ consultaId, servicoNome, data, horario }) {
  if (!notificacoesDisponiveis) return null;
  if (!(await pedirPermissao())) return null;

  const [a, m, d] = data.split('-').map(Number);
  const [h, min] = horario.split(':').map(Number);
  const dataConsulta = new Date(a, m - 1, d, h, min);
  const agora = Date.now();

  let quando = new Date(dataConsulta.getTime() - 24 * 60 * 60 * 1000);
  let texto = `Amanhã às ${horario}. Toque para ver os detalhes.`;
  if (quando.getTime() <= agora) {
    quando = new Date(dataConsulta.getTime() - 60 * 60 * 1000);
    texto = `Daqui a 1 hora, às ${horario}. Não esqueça de fazer o check-in na recepção!`;
  }
  if (quando.getTime() <= agora) return null;

  return Notifications.scheduleNotificationAsync({
    content: {
      title: `Lembrete: ${servicoNome} 🦷`,
      body: texto,
      data: { url: `/consulta/${consultaId}` },
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: quando, channelId: 'lembretes' },
  });
}

export async function cancelarLembrete(idNotificacao) {
  if (!notificacoesDisponiveis || !idNotificacao) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(idNotificacao);
  } catch {
    // já disparou ou não existe mais: tudo bem
  }
}

// Para a apresentação: dispara uma notificação em 5 segundos.
export async function notificacaoDeTeste(consultaId) {
  if (!notificacoesDisponiveis) return false;
  if (!(await pedirPermissao())) return false;
  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'ClinicAgente 🦷',
      body: consultaId ? 'Este é um lembrete de teste. Toque para abrir sua próxima consulta.' : 'Notificações funcionando!',
      data: consultaId ? { url: `/consulta/${consultaId}` } : {},
    },
    trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds: 5, channelId: 'lembretes' },
  });
  return true;
}
