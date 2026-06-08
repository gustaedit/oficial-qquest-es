import { createClient } from '@supabase/supabase-js';

// 1. Captura correta usando o padrão do Vite (import.meta.env e prefixo VITE_)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// 2. Validação preventiva no console do navegador
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ ATENÇÃO OPERADOR: Chaves do Supabase não detectadas no arquivo .env.local ou formato incorreto!");
}

// 3. Inicialização segura (Se não existirem no .env, passa string vazia para o SDK acusar o erro real)
export const supabase = createClient(
  supabaseUrl, 
  supabaseAnonKey
);

// 🚨 AVISO SOBRE O CLIENTE ADMIN:
// Em projetos Vite (Client-side), remover o supabaseAdmin é uma regra de segurança estrita.
// Qualquer chave colocada aqui ficará visível para os usuários no navegador.
// Use apenas o cliente 'supabase' acima com políticas de RLS ativas no banco de dados.