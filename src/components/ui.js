// Componentes visuais reaproveitados em várias telas.
// Regra: se um pedaço de interface aparece em 2+ telas, ele vem pra cá.

import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { vibrar } from '../services/haptics';
import { cores, espaco, raio } from '../theme';

export function Botao({ titulo, onPress, variante = 'primario', carregando = false, desabilitado = false, icone }) {
  const estilo = estilosBotao[variante];
  const inativo = desabilitado || carregando;
  return (
    <Pressable
      onPress={(e) => {
        vibrar(); // feedback tátil leve em todo botão
        onPress?.(e);
      }}
      disabled={inativo}
      accessibilityRole="button"
      style={({ pressed }) => [s.botao, estilo.caixa, inativo && s.inativo, pressed && s.pressionado]}
    >
      {carregando ? (
        <ActivityIndicator color={estilo.texto.color} />
      ) : (
        <View style={s.linha}>
          {icone && <Ionicons name={icone} size={18} color={estilo.texto.color} style={{ marginRight: 8 }} />}
          <Text style={[s.botaoTexto, estilo.texto]}>{titulo}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function Campo({ rotulo, erro, style, ...props }) {
  return (
    <View style={{ marginBottom: espaco.md }}>
      <Text style={s.rotulo}>{rotulo}</Text>
      <TextInput
        placeholderTextColor={cores.textoSuave}
        style={[s.campo, erro && { borderColor: cores.perigo }, style]}
        {...props}
      />
      {erro ? <Text style={s.erro}>{erro}</Text> : null}
    </View>
  );
}

export function Cartao({ children, style, onPress }) {
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [s.cartao, style, pressed && s.pressionado]}>
        {children}
      </Pressable>
    );
  }
  return <View style={[s.cartao, style]}>{children}</View>;
}

export function Titulo({ children, subtitulo }) {
  return (
    <View style={{ marginBottom: espaco.md }}>
      <Text style={s.titulo}>{children}</Text>
      {subtitulo ? <Text style={s.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

export function EstadoVazio({ icone, titulo, texto, children }) {
  return (
    <View style={s.vazio}>
      <View style={s.vazioIcone}>
        <Ionicons name={icone} size={32} color={cores.primaria} />
      </View>
      <Text style={s.vazioTitulo}>{titulo}</Text>
      {texto ? <Text style={s.vazioTexto}>{texto}</Text> : null}
      {children}
    </View>
  );
}

export function Selo({ texto, tipo = 'info' }) {
  const mapa = {
    info: [cores.primariaClara, cores.primariaEscura],
    sucesso: [cores.sucessoClaro, cores.sucesso],
    perigo: [cores.perigoClaro, cores.perigo],
    aviso: [cores.avisoClaro, cores.aviso],
  };
  const [fundo, cor] = mapa[tipo];
  return (
    <View style={[s.selo, { backgroundColor: fundo }]}>
      <Text style={[s.seloTexto, { color: cor }]}>{texto}</Text>
    </View>
  );
}

// Barra de progresso do fluxo de agendamento (etapa 1 de 4, etc.)
export function Etapas({ atual, total = 4 }) {
  return (
    <View style={s.etapas}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={[s.etapa, i < atual && { backgroundColor: cores.primaria }]} />
      ))}
    </View>
  );
}

const estilosBotao = {
  primario: { caixa: { backgroundColor: cores.primaria }, texto: { color: '#fff' } },
  secundario: { caixa: { backgroundColor: cores.primariaClara }, texto: { color: cores.primariaEscura } },
  perigo: { caixa: { backgroundColor: cores.perigoClaro }, texto: { color: cores.perigo } },
  contorno: { caixa: { backgroundColor: 'transparent', borderWidth: 1, borderColor: cores.borda }, texto: { color: cores.texto } },
};

const s = StyleSheet.create({
  botao: { minHeight: 50, borderRadius: raio.md, alignItems: 'center', justifyContent: 'center', paddingHorizontal: espaco.md },
  botaoTexto: { fontSize: 16, fontWeight: '600' },
  linha: { flexDirection: 'row', alignItems: 'center' },
  inativo: { opacity: 0.5 },
  pressionado: { opacity: 0.75 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  campo: {
    backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: raio.md,
    paddingHorizontal: espaco.md, paddingVertical: 12, fontSize: 16, color: cores.texto,
  },
  erro: { color: cores.perigo, fontSize: 13, marginTop: 4 },
  cartao: {
    backgroundColor: cores.superficie, borderRadius: raio.lg, padding: espaco.md, borderWidth: 1, borderColor: cores.borda,
  },
  titulo: { fontSize: 24, fontWeight: '700', color: cores.texto },
  subtitulo: { fontSize: 15, color: cores.textoSuave, marginTop: 4 },
  vazio: { alignItems: 'center', paddingVertical: espaco.xl, paddingHorizontal: espaco.lg },
  vazioIcone: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: cores.primariaClara,
    alignItems: 'center', justifyContent: 'center', marginBottom: espaco.md,
  },
  vazioTitulo: { fontSize: 17, fontWeight: '700', color: cores.texto, textAlign: 'center' },
  vazioTexto: { fontSize: 14, color: cores.textoSuave, textAlign: 'center', marginTop: 6, marginBottom: espaco.md },
  selo: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  seloTexto: { fontSize: 12, fontWeight: '700' },
  etapas: { flexDirection: 'row', gap: 6, marginBottom: espaco.lg },
  etapa: { flex: 1, height: 4, borderRadius: 2, backgroundColor: cores.borda },
});
