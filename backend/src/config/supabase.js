/**
 * Configuração do Supabase
 * Conecta ao projeto Supabase usando as variáveis de ambiente
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Validação mais robusta das variáveis de ambiente
if (!supabaseUrl || !supabaseAnonKey) {
  const missingVars = [];
  if (!supabaseUrl) missingVars.push('SUPABASE_URL');
  if (!supabaseAnonKey) missingVars.push('SUPABASE_ANON_KEY');
  
  throw new Error(
    `Variáveis de ambiente faltando: ${missingVars.join(', ')}. ` +
    `Verifique o arquivo .env e certifique-se de que todas as variáveis necessárias estão configuradas.`
  );
}

// Validação básica de formato da URL
if (!supabaseUrl.startsWith('https://')) {
  throw new Error('SUPABASE_URL deve começar com https://');
}

// Cliente para operações do usuário (usa anon key)
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Cliente para operações administrativas (usa service role key)
const supabaseAdmin = supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey)
  : null;

/**
 * Cria um cliente Supabase com o token do usuário para RLS funcionar corretamente
 * @param {string} userToken - Token JWT do usuário autenticado
 * @returns {Object} Cliente Supabase configurado com o token do usuário
 */
const createUserClient = (userToken) => {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${userToken}`
      }
    }
  });
};

module.exports = {
  supabase,
  supabaseAdmin,
  createUserClient
};

