// Datas são guardadas como texto 'AAAA-MM-DD' e horas como 'HH:MM'.
// Assim evitamos problemas de fuso horário que aparecem com objetos Date.

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const DIAS_LONGOS = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

const doisDigitos = (n) => String(n).padStart(2, '0');

export function paraISO(data) {
  return `${data.getFullYear()}-${doisDigitos(data.getMonth() + 1)}-${doisDigitos(data.getDate())}`;
}

export function deISO(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(a, m - 1, d);
}

export function hojeISO() {
  return paraISO(new Date());
}

// Próximos N dias em que o dentista atende (a partir de amanhã).
export function proximosDias(diasAtendimento, quantidade = 14) {
  const lista = [];
  const cursor = new Date();
  while (lista.length < quantidade) {
    cursor.setDate(cursor.getDate() + 1);
    if (diasAtendimento.includes(cursor.getDay())) {
      lista.push(paraISO(cursor));
    }
  }
  return lista;
}

export function formatarCurto(iso) {
  const d = deISO(iso);
  return { semana: DIAS[d.getDay()], dia: d.getDate(), mes: MESES[d.getMonth()] };
}

export function formatarLongo(iso) {
  const d = deISO(iso);
  return `${DIAS_LONGOS[d.getDay()]}, ${d.getDate()} de ${MESES[d.getMonth()]}`;
}

// Junta data + hora para comparar qual consulta vem antes.
export function chaveOrdenacao(consulta) {
  return `${consulta.data} ${consulta.horario}`;
}

export function jaPassou(consulta) {
  const agora = new Date();
  const agoraChave = `${paraISO(agora)} ${doisDigitos(agora.getHours())}:${doisDigitos(agora.getMinutes())}`;
  return chaveOrdenacao(consulta) < agoraChave;
}

export function formatarPreco(valor) {
  if (!valor) return 'Gratuita';
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function saudacao() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
