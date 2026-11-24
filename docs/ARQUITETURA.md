# Arquitetura de navegação — ClinicAgente Mobile

Este documento explica **como** o menu e a navegação funcionam, para quem for apresentar o projeto.

## 1. A ideia central: o arquivo É a rota

Com o **Expo Router**, não existe um arquivo gigante configurando as telas. A estrutura de pastas dentro de `src/app/` vira a navegação:

| Arquivo | Endereço (rota) |
|---|---|
| `src/app/login.js` | `/login` |
| `src/app/(tabs)/consultas.js` | `/consultas` |
| `src/app/agendar/horario.js` | `/agendar/horario` |
| `src/app/consulta/[id].js` | `/consulta/qualquer-coisa` |

Três regras de nome de arquivo para saber explicar:

- **`_layout.js`** → não é uma tela. Define *como* as telas daquela pasta são exibidas (pilha, abas…).
- **`(pasta)`** com parênteses → é um **grupo**. Organiza os arquivos mas **não aparece na URL**. Por isso a aba é `/consultas` e não `/(tabs)/consultas`.
- **`[id].js`** com colchetes → **rota dinâmica**. Uma tela só atende qualquer id; ele chega na tela via `useLocalSearchParams()`.

## 2. Os três tipos de navegação usados

```
Stack raiz  (src/app/_layout.js)
│   (se a biometria estiver ativa e o app acabou de abrir → TelaBloqueio no lugar de tudo)
│
├── [protegido: só logado]
│   ├── (tabs) ─────────── Tabs: MENU INFERIOR (src/app/(tabs)/_layout.js)
│   │                        ├── Início       /
│   │                        ├── Consultas    /consultas
│   │                        ├── Dentistas    /dentistas
│   │                        └── Perfil       /perfil
│   ├── consulta/[id]       (empilha por cima das abas)
│   ├── dentista/[id]       (empilha por cima das abas)
│   ├── clinica             (GPS: "Como chegar")
│   ├── checkin/[id]        (MODAL em tela cheia com a câmera)
│   └── agendar  ────────── MODAL com Stack própria (src/app/agendar/_layout.js)
│                            ├── etapa 1  /agendar
│                            ├── etapa 2  /agendar/dentista
│                            ├── etapa 3  /agendar/horario
│                            └── etapa 4  /agendar/confirmar
│
└── [protegido: só deslogado]
    ├── login
    └── cadastro
```

**Stack (pilha):** as telas se empilham como cartas. `router.push()` coloca uma por cima; "voltar" tira a de cima. Usada na raiz e dentro do agendamento.

**Tabs (abas):** o menu inferior. As 4 telas ficam "vivas" lado a lado e você alterna entre elas sem perder o estado (a rolagem da lista continua onde estava, por exemplo).

**Modal:** uma tela da pilha com `presentation: 'modal'`. No celular ela sobe de baixo, sinalizando "isso é uma tarefa separada, que você termina ou abandona".

### Por que navegação ANINHADA (uma pilha dentro da outra)?

O agendamento tem 4 etapas. Se elas estivessem na pilha raiz, o "voltar" da etapa 1 iria para o Início e o histórico ficaria cheio de telas soltas. Com uma **pilha própria dentro do modal**:

- "Voltar" anda entre as etapas;
- o **X** fecha o fluxo inteiro de uma vez (`router.dismissTo('/')`);
- ao confirmar, o modal fecha e o app abre o detalhe da consulta criada.

### Por que os detalhes (`consulta/[id]`) ficam FORA das abas?

Ficam na pilha raiz, por cima das abas. Assim o detalhe ocupa a tela toda (o menu inferior some) e o "voltar" retorna para a aba de onde o usuário veio. É o padrão de apps como WhatsApp e Instagram: lista nas abas, detalhe por cima.

### Por que a câmera abre em `fullScreenModal`?

Para ler um QR Code a câmera precisa ocupar a tela toda, sem cabeçalho nem abas. O `fullScreenModal` cobre tudo e o "X" (ou o botão Voltar do Android) devolve para o detalhe da consulta.

## 3. Proteção de rotas (login)

No `src/app/_layout.js`:

```jsx
<Stack.Protected guard={logado}>    ...abas, detalhes, agendar...  </Stack.Protected>
<Stack.Protected guard={!logado}>   ...login, cadastro...          </Stack.Protected>
```

- Se `guard` for `false`, aquelas rotas **deixam de existir**: nem digitando o endereço dá para chegar nelas.
- A tela de login **não navega** depois de entrar. Ela só chama `entrar()`; o Context muda o `usuario`, o `_layout` re-renderiza, o guard muda e o Expo Router redireciona sozinho. O logout é igual, no sentido contrário.

### Bloqueio por biometria

O bloqueio **não é uma rota**. Quando `bloqueado` é `true`, o `_layout` raiz devolve `<TelaBloqueio />` em vez da `<Stack>`. Como a pilha de telas nem existe nesse momento, nenhum link ou notificação consegue chegar numa tela protegida sem a digital.

### Notificação abrindo uma tela (deep link)

Cada lembrete leva `data.url = '/consulta/<id>'`. O hook `useAbrirPelaNotificacao` escuta o toque e guarda o endereço como "pendente". Ele só chama `router.push` quando o app está pronto (logado e desbloqueado). Isso funciona tanto com o app aberto quanto fechado.

## 4. Como os dados passam entre telas

| Situação | Como |
|---|---|
| Entre etapas do agendamento | **Parâmetros na URL**: `router.push({ pathname: '/agendar/horario', params: { servico, dentista } })` |
| Para uma rota dinâmica | Pelo próprio endereço: `/consulta/c-123` → `id = "c-123"` |
| Dados que muitas telas usam (usuário, consultas) | **Context API**: `useAuth()` e `useConsultas()` |

Por que parâmetros e não Context no agendamento? Cada etapa fica independente: dá para abrir `/agendar/horario?servico=limpeza&dentista=d1` direto. É exatamente o que a tela do dentista faz com o botão "Agendar com este dentista", que pula a etapa 2.

## 5. Camadas do código

```
Telas (src/app)  →  Custom hooks (src/hooks)  →  Contexts (src/context)  →  Services (src/services)  →  AsyncStorage / APIs nativas
```

As telas nunca acessam o armazenamento nem as APIs nativas diretamente. Para trocar o AsyncStorage pelo Supabase, só `context/` e `services/` mudam.

### Hooks usados e onde

| Hook | Onde | Para quê |
|---|---|---|
| `useState` | quase todas as telas | dados que mudam na tela (formulário, filtro, horário escolhido) |
| `useEffect` | AuthContext, useCep, useLocalizacao, Perfil | rodar algo quando a tela abre ou quando um valor muda |
| `useEffect` com **cleanup** | useCep (`controle.abort()`), useAbrirPelaNotificacao (`assinatura.remove()`) | cancelar requisição/listener quando a tela fecha, evitando vazamento e respostas atrasadas |
| `useMemo` | ConsultasContext | só recalcular "próximas" e "histórico" quando a lista muda |
| `useCallback` | ConsultasContext, useLocalizacao | manter a mesma função entre renderizações e evitar loop infinito no `useEffect` |
| `useRef` | checkin/[id] | trava instantânea para a câmera não registrar o mesmo QR várias vezes |
| `useContext` | useAuth, useConsultas | ler o estado global |
| **Custom hooks** | `useLocalizacao`, `useCep`, `useAbrirPelaNotificacao`, `useAuth`, `useConsultas` | reaproveitar lógica com estado entre telas |

### Listas

As listas que podem crescer (consultas e dentistas) usam `FlatList`, que só renderiza os itens visíveis na tela. A lista de consultas tem `RefreshControl` (puxar para atualizar).

## 6. Perguntas que o professor pode fazer

**Por que Expo Router e não React Navigation "puro"?**
O Expo Router é construído em cima do React Navigation (por baixo, as abas e pilhas são as mesmas). A diferença é a configuração: em vez de declarar cada tela num arquivo central, a estrutura de pastas define as rotas. Isso dá links profundos (abrir o app direto numa tela) e URLs na versão web sem configuração extra.

**O que acontece quando eu aperto uma aba?**
O navegador de abas troca a tela visível, mas não destrói a anterior. Por isso, ao voltar para "Consultas", o filtro escolhido continua lá.

**Qual a diferença entre `router.push`, `router.navigate` e `router.replace`?**
`push` sempre empilha uma tela nova. `navigate` vai até a rota e, se ela já existe na pilha/abas, reaproveita (usado nos atalhos do Início para trocar de aba). `replace` troca a tela atual sem deixar histórico (usado na tela "não encontrada").

**Como o app lembra que estou logado depois de fechar?**
A sessão é salva no AsyncStorage. Ao abrir, o `AuthProvider` lê a sessão; enquanto lê, mostra um carregando (para não "piscar" a tela de login).

**Por que notificação local e não push?**
Push depende de um servidor e, desde o SDK 53, não funciona no Expo Go no Android. O lembrete de consulta tem data conhecida, então o próprio celular consegue agendar, inclusive sem internet.

**O app vê a minha digital?**
Não. O `expo-local-authentication` pergunta ao sistema operacional "é o dono do aparelho?" e recebe só `true` ou `false`.

**Como funciona o cálculo de distância?**
Pela fórmula de Haversine (`src/hooks/useLocalizacao.js`), que calcula a distância em linha reta entre duas coordenadas na superfície da Terra. O tempo estimado considera 30 km/h de carro e 5 km/h a pé.

**Como evita marcar dois pacientes no mesmo horário?**
`horarioDisponivel()` no `ConsultasContext` verifica se já existe consulta agendada para aquele dentista/dia/horário. A checagem é feita de novo dentro de `agendar()`, no momento de salvar.

## 7. Divisão pelos papéis do enunciado

| Papel (enunciado) | Responsabilidade | Arquivos |
|---|---|---|
| **UI/UX & Design System** | cores, componentes reutilizáveis, ergonomia tátil | `src/theme.js`, `src/components/*`, `services/haptics.js` |
| **Mobile Frontend** | telas, formulários, listas, navegação | `src/app/**` (layouts, abas, agendamento, check-in) |
| **Arquitetura & Hooks / Dados** | estado, custom hooks, API, AsyncStorage, recursos nativos | `src/context/*`, `src/hooks/*`, `src/services/*` |
| **QA & Documentação** | testes no Expo Go, README, PDF dos 4 pilares | `README.md`, `docs/*` |

Cada integrante deve conseguir abrir os arquivos do seu papel e explicar cada função e hook. O enunciado penaliza código que o aluno não sabe explicar.
