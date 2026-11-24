// Context de autenticação: guarda QUEM está logado e expõe login/logout
// para qualquer tela, sem precisar passar props de pai pra filho.
// O _layout.js raiz lê `usuario` e `bloqueado` daqui para decidir o que mostrar.
//
// Também guarda as PREFERÊNCIAS do usuário (biometria e lembretes).

import { createContext, useContext, useEffect, useState } from 'react';
import { lerJSON, salvarJSON, remover } from '../services/storage';
import { autenticar } from '../services/biometria';
import { usuarioDemo } from '../data/clinica';

const AuthContext = createContext(null);

const CONFIG_PADRAO = { biometria: false, lembretes: true };

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [config, setConfigState] = useState(CONFIG_PADRAO);
  const [bloqueado, setBloqueado] = useState(false);
  const [carregando, setCarregando] = useState(true);

  // Roda uma vez quando o app abre: garante o usuário demo e restaura a sessão.
  useEffect(() => {
    (async () => {
      const usuarios = await lerJSON('usuarios', []);
      if (!usuarios.some((u) => u.email === usuarioDemo.email)) {
        await salvarJSON('usuarios', [...usuarios, usuarioDemo]);
      }
      const sessao = await lerJSON('sessao');
      if (sessao) {
        const cfg = await lerJSON(`config:${sessao.id}`, CONFIG_PADRAO);
        setConfigState(cfg);
        setUsuario(sessao);
        // Já estava logado e ativou biometria? Começa TRANCADO.
        if (cfg.biometria) setBloqueado(true);
      }
      setCarregando(false);
    })();
  }, []);

  async function carregarSessao(dados) {
    const { senha: _ignorada, ...semSenha } = dados; // nunca guarda a senha na sessão
    await salvarJSON('sessao', semSenha);
    setConfigState(await lerJSON(`config:${semSenha.id}`, CONFIG_PADRAO));
    setUsuario(semSenha);
  }

  async function entrar(email, senha) {
    const usuarios = await lerJSON('usuarios', []);
    const encontrado = usuarios.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.senha === senha
    );
    if (!encontrado) throw new Error('E-mail ou senha incorretos.');
    await carregarSessao(encontrado);
  }

  async function cadastrar({ nome, email, telefone, senha, endereco }) {
    const usuarios = await lerJSON('usuarios', []);
    if (usuarios.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
      throw new Error('Já existe uma conta com esse e-mail.');
    }
    const novo = {
      id: `u-${Date.now()}`,
      nome: nome.trim(),
      email: email.trim(),
      telefone: telefone.trim(),
      endereco: endereco || '',
      senha,
    };
    await salvarJSON('usuarios', [...usuarios, novo]);
    await carregarSessao(novo);
  }

  async function atualizarPerfil(dados) {
    const usuarios = await lerJSON('usuarios', []);
    await salvarJSON('usuarios', usuarios.map((u) => (u.id === usuario.id ? { ...u, ...dados } : u)));
    const novaSessao = { ...usuario, ...dados };
    await salvarJSON('sessao', novaSessao);
    setUsuario(novaSessao);
  }

  async function alterarConfig(mudancas) {
    const nova = { ...config, ...mudancas };
    setConfigState(nova);
    await salvarJSON(`config:${usuario.id}`, nova);
  }

  // Chamado pela tela de bloqueio. Só destranca se a biometria confirmar.
  async function desbloquear() {
    const ok = await autenticar('Desbloquear o ClinicAgente');
    if (ok) setBloqueado(false);
    return ok;
  }

  async function sair() {
    await remover('sessao');
    setBloqueado(false);
    setUsuario(null);
  }

  return (
    <AuthContext.Provider
      value={{ usuario, config, bloqueado, carregando, entrar, cadastrar, atualizarPerfil, alterarConfig, desbloquear, sair }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
}
