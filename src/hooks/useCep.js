// CUSTOM HOOK que consulta uma API REAL na internet: ViaCEP (gratuita, sem chave).
// Mostra os 4 estados de uma chamada assíncrona: ocioso, carregando, sucesso e erro.
//
// Detalhe importante: o AbortController cancela a requisição anterior se o
// usuário mudar o CEP no meio do caminho, e também quando a tela é fechada
// (função de "cleanup" do useEffect). Sem isso, uma resposta atrasada poderia
// sobrescrever um endereço mais novo.

import { useEffect, useState } from 'react';

export function useCep(cep) {
  const [estado, setEstado] = useState({ carregando: false, erro: '', endereco: null });
  const somenteNumeros = (cep || '').replace(/\D/g, '');

  useEffect(() => {
    if (somenteNumeros.length !== 8) {
      setEstado({ carregando: false, erro: '', endereco: null });
      return;
    }

    const controle = new AbortController();
    setEstado({ carregando: true, erro: '', endereco: null });

    fetch(`https://viacep.com.br/ws/${somenteNumeros}/json/`, { signal: controle.signal })
      .then((resposta) => {
        if (!resposta.ok) throw new Error('Serviço de CEP indisponível.');
        return resposta.json();
      })
      .then((dados) => {
        if (dados.erro) throw new Error('CEP não encontrado.');
        setEstado({
          carregando: false,
          erro: '',
          endereco: {
            rua: dados.logradouro,
            bairro: dados.bairro,
            cidade: dados.localidade,
            uf: dados.uf,
          },
        });
      })
      .catch((e) => {
        if (e.name === 'AbortError') return; // cancelada de propósito
        setEstado({ carregando: false, erro: e.message.includes('CEP') ? e.message : 'Sem conexão. Você pode continuar sem o endereço.', endereco: null });
      });

    return () => controle.abort(); // cleanup
  }, [somenteNumeros]);

  return estado;
}

export function formatarEndereco(e) {
  if (!e) return '';
  return [e.rua, e.bairro, `${e.cidade}-${e.uf}`].filter(Boolean).join(', ');
}
