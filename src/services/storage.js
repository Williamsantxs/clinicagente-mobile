// Camada de armazenamento. As telas NUNCA falam direto com o AsyncStorage:
// elas usam os Contexts, e os Contexts usam estas funções.
// Vantagem: para trocar por Supabase (ou outra API) no futuro, só este
// arquivo e os Contexts mudam — nenhuma tela precisa ser reescrita.

import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFIXO = '@clinicagente:';

export async function lerJSON(chave, padrao = null) {
  try {
    const valor = await AsyncStorage.getItem(PREFIXO + chave);
    return valor != null ? JSON.parse(valor) : padrao;
  } catch (erro) {
    console.warn('Erro ao ler', chave, erro);
    return padrao;
  }
}

export async function salvarJSON(chave, valor) {
  try {
    await AsyncStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
  } catch (erro) {
    console.warn('Erro ao salvar', chave, erro);
  }
}

export async function remover(chave) {
  try {
    await AsyncStorage.removeItem(PREFIXO + chave);
  } catch (erro) {
    console.warn('Erro ao remover', chave, erro);
  }
}
