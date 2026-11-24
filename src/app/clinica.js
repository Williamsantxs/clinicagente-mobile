// GEOLOCALIZAÇÃO — mostra a distância entre o paciente e a clínica
// e abre o app de mapas do celular com a rota.
// Toda a lógica de GPS fica no custom hook useLocalizacao().

import { ActivityIndicator, Linking, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalizacao } from '../hooks/useLocalizacao';
import { Botao, Cartao } from '../components/ui';
import { contatoClinica } from '../data/clinica';
import { vibrar } from '../services/haptics';
import { cores, espaco, raio } from '../theme';

const { latitude, longitude } = contatoClinica.coordenadas;

// Tempo estimado bem simples: 30 km/h de média na cidade, 5 km/h a pé.
function tempoEstimado(km, velocidade) {
  const minutos = Math.max(1, Math.round((km / velocidade) * 60));
  return minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)}h${String(minutos % 60).padStart(2, '0')}`;
}

function abrirMapa() {
  vibrar();
  // Cada sistema tem seu esquema de link para o app de mapas
  const rotulo = encodeURIComponent(contatoClinica.nome);
  const url = Platform.select({
    ios: `maps://?daddr=${latitude},${longitude}&q=${rotulo}`,
    android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${rotulo})`,
    default: `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
  });
  Linking.openURL(url).catch(() =>
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`)
  );
}

function ligar() {
  vibrar();
  Linking.openURL(`tel:${contatoClinica.telefone.replace(/\D/g, '')}`);
}

export default function ComoChegar() {
  const { carregando, erro, distanciaKm, atualizar } = useLocalizacao(contatoClinica.coordenadas);

  return (
    <ScrollView contentContainerStyle={{ padding: espaco.lg }}>
      <Cartao style={s.destaque}>
        <Ionicons name="navigate-circle" size={44} color={cores.primaria} />
        {carregando ? (
          <View style={s.centro}>
            <ActivityIndicator color={cores.primaria} />
            <Text style={s.legenda}>Buscando sua localização pelo GPS…</Text>
          </View>
        ) : erro ? (
          <View style={s.centro}>
            <Text style={s.erro}>{erro}</Text>
            <View style={{ marginTop: espaco.md, alignSelf: 'stretch' }}>
              <Botao titulo="Tentar de novo" variante="secundario" icone="refresh" onPress={atualizar} />
            </View>
          </View>
        ) : (
          <View style={s.centro}>
            <Text style={s.legenda}>Você está a</Text>
            <Text style={s.distancia}>
              {distanciaKm < 1 ? `${Math.round(distanciaKm * 1000)} m` : `${distanciaKm.toFixed(1).replace('.', ',')} km`}
            </Text>
            <Text style={s.legenda}>da clínica (em linha reta)</Text>
            <View style={s.tempos}>
              <Tempo icone="car-outline" texto={tempoEstimado(distanciaKm, 30)} />
              <Tempo icone="walk-outline" texto={tempoEstimado(distanciaKm, 5)} />
            </View>
          </View>
        )}
      </Cartao>

      <Cartao style={{ marginTop: espaco.md }}>
        <Text style={s.nome}>{contatoClinica.nome}</Text>
        <Text style={s.info}>{contatoClinica.endereco}</Text>
        <Text style={s.info}>{contatoClinica.horario}</Text>
      </Cartao>

      <View style={{ gap: espaco.sm + 4, marginTop: espaco.lg }}>
        <Botao titulo="Abrir rota no mapa" icone="map-outline" onPress={abrirMapa} />
        <Botao titulo={`Ligar ${contatoClinica.telefone}`} variante="secundario" icone="call-outline" onPress={ligar} />
        {!carregando && !erro ? (
          <Botao titulo="Atualizar localização" variante="contorno" icone="locate-outline" onPress={atualizar} />
        ) : null}
      </View>
    </ScrollView>
  );
}

function Tempo({ icone, texto }) {
  return (
    <View style={s.tempo}>
      <Ionicons name={icone} size={18} color={cores.primariaEscura} />
      <Text style={s.tempoTexto}>{texto}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  destaque: { alignItems: 'center', paddingVertical: espaco.lg },
  centro: { alignItems: 'center', marginTop: espaco.sm, alignSelf: 'stretch' },
  legenda: { fontSize: 14, color: cores.textoSuave, marginTop: 4, textAlign: 'center' },
  distancia: { fontSize: 40, fontWeight: '800', color: cores.primariaEscura },
  erro: { fontSize: 14, color: cores.perigo, textAlign: 'center' },
  tempos: { flexDirection: 'row', gap: espaco.sm + 4, marginTop: espaco.md },
  tempo: {
    flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 14, paddingVertical: 8,
    backgroundColor: cores.primariaClara, borderRadius: raio.md,
  },
  tempoTexto: { fontWeight: '700', color: cores.primariaEscura },
  nome: { fontSize: 16, fontWeight: '700', color: cores.texto },
  info: { fontSize: 14, color: cores.textoSuave, marginTop: 4 },
});
