// CUSTOM HOOK de geolocalização.
// Esconde da tela toda a parte chata (permissão, GPS, erros) e devolve
// só o que a tela precisa: { carregando, erro, distanciaKm, atualizar }.
//
// Um custom hook é só uma função que começa com "use" e usa outros hooks
// (useState, useEffect...). Assim, a lógica pode ser reaproveitada em
// qualquer tela.

import { useCallback, useEffect, useState } from 'react';
import * as Location from 'expo-location';

// Fórmula de Haversine: distância em linha reta entre dois pontos do globo.
export function distanciaEmKm(a, b) {
  const R = 6371; // raio da Terra em km
  const rad = (g) => (g * Math.PI) / 180;
  const dLat = rad(b.latitude - a.latitude);
  const dLon = rad(b.longitude - a.longitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.latitude)) * Math.cos(rad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function useLocalizacao(destino) {
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [posicao, setPosicao] = useState(null);

  const atualizar = useCallback(async () => {
    setCarregando(true);
    setErro('');
    try {
      const { granted } = await Location.requestForegroundPermissionsAsync();
      if (!granted) {
        setErro('Permissão de localização negada. Ative nas configurações do celular para ver a distância.');
        return;
      }
      const atual = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setPosicao(atual.coords);
    } catch (e) {
      setErro('Não foi possível obter sua localização. Verifique se o GPS está ligado.');
    } finally {
      setCarregando(false); // roda tanto no sucesso quanto no erro
    }
  }, []);

  // Busca a posição uma vez quando a tela abre
  useEffect(() => {
    atualizar();
  }, [atualizar]);

  const distanciaKm = posicao && destino ? distanciaEmKm(posicao, destino) : null;
  return { carregando, erro, posicao, distanciaKm, atualizar };
}
