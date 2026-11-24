// Dados fixos da clínica (fictícia). Num app real isso viria do banco
// (ex.: as tabelas do ClinicAgente no Supabase). Aqui fica local para o app
// funcionar sem internet e sem configuração nenhuma.

export const servicos = [
  { id: 'avaliacao', nome: 'Avaliação', duracao: 30, preco: 0, icone: 'clipboard-outline', descricao: 'Primeira consulta: exame clínico e plano de tratamento.' },
  { id: 'limpeza', nome: 'Limpeza', duracao: 45, preco: 150, icone: 'sparkles-outline', descricao: 'Profilaxia, remoção de tártaro e aplicação de flúor.' },
  { id: 'restauracao', nome: 'Restauração', duracao: 60, preco: 220, icone: 'construct-outline', descricao: 'Tratamento de cárie com resina da cor do dente.' },
  { id: 'clareamento', nome: 'Clareamento', duracao: 60, preco: 600, icone: 'sunny-outline', descricao: 'Clareamento em consultório com gel e luz.' },
  { id: 'canal', nome: 'Tratamento de canal', duracao: 90, preco: 900, icone: 'medkit-outline', descricao: 'Endodontia para salvar o dente comprometido.' },
  { id: 'ortodontia', nome: 'Manutenção de aparelho', duracao: 30, preco: 180, icone: 'git-commit-outline', descricao: 'Ajuste mensal do aparelho ortodôntico.' },
];

export const dentistas = [
  {
    id: 'd1',
    nome: 'Dra. Ana Ribeiro',
    especialidade: 'Clínica geral',
    cro: 'CRO-SP 98.231',
    servicos: ['avaliacao', 'limpeza', 'restauracao'],
    diasAtendimento: [1, 2, 3, 4, 5], // 0 = domingo ... 6 = sábado
    bio: 'Atende há 12 anos com foco em prevenção e atendimento a famílias.',
  },
  {
    id: 'd2',
    nome: 'Dr. Carlos Mendes',
    especialidade: 'Endodontia',
    cro: 'CRO-SP 77.415',
    servicos: ['avaliacao', 'canal', 'restauracao'],
    diasAtendimento: [1, 3, 5],
    bio: 'Especialista em tratamento de canal, com atendimento de urgência.',
  },
  {
    id: 'd3',
    nome: 'Dra. Juliana Prado',
    especialidade: 'Ortodontia e estética',
    cro: 'CRO-SP 112.908',
    servicos: ['avaliacao', 'ortodontia', 'clareamento', 'limpeza'],
    diasAtendimento: [2, 4, 6],
    bio: 'Aparelhos fixos, alinhadores e clareamento dental.',
  },
];

// Horários em que a clínica atende (cada consulta ocupa um horário).
export const horariosBase = ['08:00', '09:00', '10:00', '11:00', '13:30', '14:30', '15:30', '16:30', '17:30'];

// Usuário de demonstração, criado na primeira vez que o app abre.
export const usuarioDemo = {
  id: 'u-demo',
  nome: 'Paciente Demo',
  email: 'paciente@clinicagente.com',
  senha: '123456',
  telefone: '(12) 99999-0000',
};

export const contatoClinica = {
  nome: 'ClinicAgente Odontologia',
  endereco: 'Av. Iperoig, 500 — Centro, Ubatuba-SP',
  telefone: '(12) 3832-0000',
  horario: 'Seg a sex 8h–18h · Sáb 8h–12h',
  // Coordenadas usadas no cálculo de distância (GPS) e no "Como chegar"
  coordenadas: { latitude: -23.4339, longitude: -45.0713 },
};

// Texto gravado no QR Code que fica no balcão da recepção.
// O app só aceita o check-in se ler exatamente este conteúdo.
export const QR_CHECKIN = 'CLINICAGENTE:CHECKIN:RECEPCAO';

export const buscarServico = (id) => servicos.find((s) => s.id === id);
export const buscarDentista = (id) => dentistas.find((d) => d.id === id);
