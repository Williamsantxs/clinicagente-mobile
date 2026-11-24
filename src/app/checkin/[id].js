// CÂMERA + LEITURA DE QR CODE — check-in na recepção.
//
// O paciente chega na clínica, abre a consulta e aponta a câmera para o
// QR Code do balcão. Se o conteúdo bater com QR_CHECKIN, a consulta muda
// para "check-in feito" e a recepção sabe que ele chegou, sem fila.
//
// Usa <CameraView> do expo-camera com leitura de código de barras embutida.

import { useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConsultas } from '../../context/ConsultasContext';
import { Botao, EstadoVazio } from '../../components/ui';
import { QR_CHECKIN, buscarServico } from '../../data/clinica';
import { vibrar } from '../../services/haptics';
import { cores, espaco, raio } from '../../theme';

export default function Checkin() {
  const { id } = useLocalSearchParams();
  const { buscarConsulta, fazerCheckin } = useConsultas();
  const consulta = buscarConsulta(id);
  const [permissao, pedirPermissao] = useCameraPermissions();
  const [resultado, setResultado] = useState(null); // null | 'ok' | 'invalido'
  // useRef em vez de useState: a câmera lê o mesmo QR várias vezes por segundo,
  // e o ref muda NA HORA (sem esperar re-renderizar), evitando check-in duplicado.
  const processando = useRef(false);

  async function aoLerCodigo({ data }) {
    if (processando.current || resultado === 'ok') return;
    processando.current = true;
    if (data === QR_CHECKIN) {
      await fazerCheckin(id);
      vibrar('sucesso');
      setResultado('ok');
    } else {
      vibrar('erro');
      setResultado('invalido');
      // libera para tentar de novo depois de 2 segundos
      setTimeout(() => {
        processando.current = false;
        setResultado(null);
      }, 2000);
    }
  }

  const fechar = () => router.back();

  if (!consulta) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center' }}>
        <EstadoVazio icone="alert-circle-outline" titulo="Consulta não encontrada">
          <Botao titulo="Voltar" onPress={fechar} />
        </EstadoVazio>
      </SafeAreaView>
    );
  }

  // 1) Ainda carregando o status da permissão
  if (!permissao) return <View style={{ flex: 1, backgroundColor: '#000' }} />;

  // 2) Sem permissão: explica o motivo ANTES de pedir (boa prática de UX)
  if (!permissao.granted) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', padding: espaco.lg, backgroundColor: cores.fundo }}>
        <EstadoVazio
          icone="camera-outline"
          titulo="Precisamos da câmera"
          texto="Ela é usada só para ler o QR Code no balcão da recepção. Nenhuma foto é salva."
        >
          <View style={{ alignSelf: 'stretch', gap: espaco.sm + 4 }}>
            <Botao titulo="Permitir câmera" icone="camera" onPress={pedirPermissao} />
            <Botao titulo="Agora não" variante="contorno" onPress={fechar} />
          </View>
        </EstadoVazio>
      </SafeAreaView>
    );
  }

  // 3) Check-in concluído
  if (resultado === 'ok') {
    return (
      <SafeAreaView style={[s.tela, { backgroundColor: cores.sucesso }]}>
        <Ionicons name="checkmark-circle" size={96} color="#fff" />
        <Text style={s.okTitulo}>Check-in feito!</Text>
        <Text style={s.okTexto}>
          A recepção já sabe que você chegou para {buscarServico(consulta.servicoId)?.nome.toLowerCase()} às {consulta.horario}.
          Aguarde ser chamado.
        </Text>
        <View style={{ alignSelf: 'stretch', marginTop: espaco.xl }}>
          <Botao titulo="Concluir" variante="contorno" onPress={fechar} />
        </View>
      </SafeAreaView>
    );
  }

  // 4) Câmera aberta lendo QR Codes
  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={aoLerCodigo}
      />
      <SafeAreaView style={s.sobreposicao} pointerEvents="box-none">
        <Pressable onPress={fechar} style={s.fechar} hitSlop={12} accessibilityLabel="Fechar câmera">
          <Ionicons name="close" size={28} color="#fff" />
        </Pressable>
        <View style={s.moldura} />
        <View style={[s.aviso, resultado === 'invalido' && { backgroundColor: cores.perigo }]}>
          <Text style={s.avisoTexto}>
            {resultado === 'invalido'
              ? 'Esse QR Code não é o da recepção do ClinicAgente.'
              : 'Aponte para o QR Code no balcão da recepção'}
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco.lg },
  okTitulo: { fontSize: 28, fontWeight: '800', color: '#fff', marginTop: espaco.md },
  okTexto: { fontSize: 16, color: '#fff', textAlign: 'center', marginTop: espaco.sm, lineHeight: 22 },
  sobreposicao: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: espaco.lg },
  fechar: {
    alignSelf: 'flex-end', marginRight: espaco.lg, width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center',
  },
  moldura: { width: 250, height: 250, borderWidth: 4, borderColor: '#fff', borderRadius: raio.lg },
  aviso: {
    marginHorizontal: espaco.lg, paddingHorizontal: espaco.md, paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.65)', borderRadius: raio.md,
  },
  avisoTexto: { color: '#fff', fontSize: 15, fontWeight: '600', textAlign: 'center' },
});
