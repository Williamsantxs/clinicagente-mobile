// Tela que cobre o app quando a biometria está ativa e o app acabou de abrir.
// Não é uma ROTA: o _layout raiz renderiza este componente NO LUGAR da
// navegação inteira enquanto `bloqueado` for true. Assim não existe nenhum
// caminho (nem link, nem notificação) que chegue nas telas sem a digital.

import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { Botao } from './ui';
import { vibrar } from '../services/haptics';
import { cores, espaco } from '../theme';

export function TelaBloqueio() {
  const { usuario, desbloquear, sair } = useAuth();
  const [falhou, setFalhou] = useState(false);

  async function tentar() {
    const ok = await desbloquear();
    if (!ok) {
      setFalhou(true);
      vibrar('erro');
    }
  }

  // Abre o leitor de digital/rosto assim que a tela aparece
  useEffect(() => {
    tentar();
  }, []);

  return (
    <SafeAreaView style={s.tela}>
      <View style={s.icone}>
        <Ionicons name="finger-print" size={56} color={cores.primaria} />
      </View>
      <Text style={s.titulo}>App protegido</Text>
      <Text style={s.texto}>Olá, {usuario?.nome.split(' ')[0]}. Use sua digital ou rosto para continuar.</Text>
      {falhou ? <Text style={s.erro}>Não foi possível confirmar. Tente de novo.</Text> : null}
      <View style={{ width: '100%', gap: espaco.sm + 4, marginTop: espaco.lg }}>
        <Botao titulo="Desbloquear" icone="lock-open-outline" onPress={tentar} />
        <Botao titulo="Sair e entrar com senha" variante="contorno" onPress={sair} />
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  tela: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: espaco.lg, backgroundColor: cores.fundo },
  icone: {
    width: 110, height: 110, borderRadius: 55, backgroundColor: cores.primariaClara,
    alignItems: 'center', justifyContent: 'center', marginBottom: espaco.lg,
  },
  titulo: { fontSize: 24, fontWeight: '800', color: cores.texto },
  texto: { fontSize: 15, color: cores.textoSuave, textAlign: 'center', marginTop: espaco.sm },
  erro: { color: cores.perigo, marginTop: espaco.md },
});
