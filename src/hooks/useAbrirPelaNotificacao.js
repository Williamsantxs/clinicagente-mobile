// CUSTOM HOOK: quando o usuário toca numa notificação de lembrete,
// abre a tela da consulta correspondente.
//
// Dois casos:
//  1. App fechado → o toque ABRE o app. getLastNotificationResponse() conta
//     qual notificação foi tocada.
//  2. App aberto/em segundo plano → o listener avisa na hora.
//
// O endereço fica "pendente" até o app estar pronto (logado e desbloqueado);
// só então navega. Sem isso, a navegação tentaria acontecer atrás da tela de
// bloqueio ou antes do login.

import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { notificacoesDisponiveis } from '../services/notificacoes';

const urlDaResposta = (resposta) => {
  const url = resposta?.notification?.request?.content?.data?.url;
  return typeof url === 'string' ? url : null;
};

export function useAbrirPelaNotificacao(pronto) {
  const [urlPendente, setUrlPendente] = useState(null);

  useEffect(() => {
    if (!notificacoesDisponiveis) return;
    const inicial = urlDaResposta(Notifications.getLastNotificationResponse());
    if (inicial) setUrlPendente(inicial);

    const assinatura = Notifications.addNotificationResponseReceivedListener((resposta) => {
      const url = urlDaResposta(resposta);
      if (url) setUrlPendente(url);
    });
    return () => assinatura.remove(); // cleanup: para de escutar ao desmontar
  }, []);

  useEffect(() => {
    if (!pronto || !urlPendente) return;
    // setTimeout: espera a pilha de telas terminar de montar antes de navegar
    const t = setTimeout(() => {
      router.push(urlPendente);
      setUrlPendente(null);
    }, 50);
    return () => clearTimeout(t);
  }, [pronto, urlPendente]);
}
