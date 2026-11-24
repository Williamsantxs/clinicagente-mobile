// Context das consultas: lista, agenda, cancela e faz check-in.
// As telas só chamam agendar()/cancelar()/fazerCheckin(); quem sabe ONDE os
// dados ficam é este arquivo (hoje AsyncStorage, amanhã poderia ser o Supabase).
//
// Status possíveis de uma consulta:
//   agendada → checkin (leu o QR na recepção) → vira "realizada" quando o horário passa
//   agendada → cancelada

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { lerJSON, salvarJSON } from '../services/storage';
import { agendarLembrete, cancelarLembrete } from '../services/notificacoes';
import { useAuth } from './AuthContext';
import { chaveOrdenacao, jaPassou, paraISO } from '../utils/datas';
import { buscarServico, usuarioDemo } from '../data/clinica';

const ConsultasContext = createContext(null);
const ATIVAS = ['agendada', 'checkin'];

// Simula horários já ocupados por OUTROS pacientes, para a agenda parecer real.
// É determinístico: o mesmo dentista/dia/horário sempre dá o mesmo resultado.
function ocupadoPorOutros(dentistaId, data, horario) {
  const texto = `${dentistaId}${data}${horario}`;
  let soma = 0;
  for (let i = 0; i < texto.length; i++) soma = (soma * 31 + texto.charCodeAt(i)) % 997;
  return soma % 4 === 0; // ~25% dos horários ocupados
}

// Histórico de exemplo para o usuário demo não começar com o app vazio.
function historicoDemo() {
  const d = new Date();
  d.setDate(d.getDate() - 20);
  return [
    {
      id: 'c-demo-1',
      usuarioId: usuarioDemo.id,
      servicoId: 'avaliacao',
      dentistaId: 'd1',
      data: paraISO(d),
      horario: '09:00',
      observacao: '',
      status: 'checkin',
      lembreteId: null,
      criadaEm: d.toISOString(),
    },
  ];
}

export function ConsultasProvider({ children }) {
  const { usuario, config } = useAuth();
  const [todas, setTodas] = useState([]);

  // useCallback: a função mantém a mesma "identidade" entre renderizações,
  // então pode entrar na lista de dependências do useEffect sem causar loop.
  const recarregar = useCallback(async () => {
    let salvas = await lerJSON('consultas', null);
    if (salvas === null) {
      salvas = historicoDemo();
      await salvarJSON('consultas', salvas);
    }
    setTodas(salvas);
  }, []);

  useEffect(() => {
    recarregar();
  }, [recarregar]);

  async function persistir(lista) {
    setTodas(lista);
    await salvarJSON('consultas', lista);
  }

  // Só as consultas do paciente logado, separadas em próximas e histórico.
  // useMemo: só recalcula quando `todas` ou `usuario` mudam.
  const { proximas, historico } = useMemo(() => {
    const minhas = todas
      .filter((c) => usuario && c.usuarioId === usuario.id)
      .sort((a, b) => chaveOrdenacao(a).localeCompare(chaveOrdenacao(b)));
    return {
      proximas: minhas.filter((c) => ATIVAS.includes(c.status) && !jaPassou(c)),
      historico: minhas.filter((c) => c.status === 'cancelada' || jaPassou(c)).reverse(),
    };
  }, [todas, usuario]);

  function horarioDisponivel(dentistaId, data, horario) {
    if (ocupadoPorOutros(dentistaId, data, horario)) return false;
    return !todas.some(
      (c) => ATIVAS.includes(c.status) && c.dentistaId === dentistaId && c.data === data && c.horario === horario
    );
  }

  async function agendar({ servicoId, dentistaId, data, horario, observacao }) {
    if (!horarioDisponivel(dentistaId, data, horario)) {
      throw new Error('Esse horário acabou de ser ocupado. Escolha outro.');
    }
    const id = `c-${Date.now()}`;

    // Agenda o lembrete no celular (se o usuário deixou ligado no Perfil)
    let lembreteId = null;
    if (config.lembretes) {
      try {
        lembreteId = await agendarLembrete({ consultaId: id, servicoNome: buscarServico(servicoId).nome, data, horario });
      } catch {
        lembreteId = null; // sem lembrete, mas a consulta é salva mesmo assim
      }
    }

    const nova = {
      id,
      usuarioId: usuario.id,
      servicoId,
      dentistaId,
      data,
      horario,
      observacao: observacao?.trim() ?? '',
      status: 'agendada',
      lembreteId,
      criadaEm: new Date().toISOString(),
    };
    await persistir([...todas, nova]);
    return nova;
  }

  async function cancelar(id) {
    const consulta = todas.find((c) => c.id === id);
    await cancelarLembrete(consulta?.lembreteId); // apaga o lembrete que não faz mais sentido
    await persistir(todas.map((c) => (c.id === id ? { ...c, status: 'cancelada', lembreteId: null } : c)));
  }

  async function fazerCheckin(id) {
    await persistir(
      todas.map((c) => (c.id === id ? { ...c, status: 'checkin', checkinEm: new Date().toISOString() } : c))
    );
  }

  const buscarConsulta = (id) => todas.find((c) => c.id === id);

  return (
    <ConsultasContext.Provider
      value={{ proximas, historico, horarioDisponivel, agendar, cancelar, fazerCheckin, buscarConsulta, recarregar }}
    >
      {children}
    </ConsultasContext.Provider>
  );
}

export function useConsultas() {
  const ctx = useContext(ConsultasContext);
  if (!ctx) throw new Error('useConsultas precisa estar dentro de <ConsultasProvider>');
  return ctx;
}
