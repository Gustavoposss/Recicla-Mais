/**
 * Serviço de Autenticação
 * Gerencia operações relacionadas a autenticação e usuários
 */

const { supabase, supabaseAdmin } = require('../config/supabase');
const bcrypt = require('bcryptjs');

class AuthService {
  /**
   * Registra um novo usuário
   */
  async register(userData) {
    const { email, password, full_name, phone, user_type = 'citizen' } = userData;

    // Validações básicas
    if (!email || !password || !full_name) {
      throw new Error('Email, senha e nome são obrigatórios');
    }

    if (password.length < 8) {
      throw new Error('A senha deve ter pelo menos 8 caracteres');
    }

    // Cria usuário no Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone,
          user_type
        }
      }
    });

    if (authError) {
      // Tratamento específico para rate limiting do Supabase
      if (authError.message.includes('security purposes') || authError.message.includes('after')) {
        throw new Error('Muitas tentativas. Por favor, aguarde alguns segundos antes de tentar novamente.');
      }
      throw new Error(authError.message);
    }

    // Cria registro na tabela users usando admin client para bypass RLS
    // NOTA: O Supabase Auth já gerencia a senha, então não salvamos password_hash
    const clientToUse = supabaseAdmin || supabase;
    const { data: user, error: userError } = await clientToUse
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        password_hash: null, // NULL: Supabase Auth gerencia as senhas na tabela auth.users
        full_name,
        phone,
        user_type
      })
      .select()
      .single();

    if (userError) {
      // Se falhar ao criar na tabela users, tenta deletar o usuário do auth
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(userError.message);
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        phone: user.phone,
        user_type: user.user_type,
        created_at: user.created_at
      },
      token: authData.session?.access_token || null
    };
  }

  /**
   * Faz login do usuário
   */
  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      throw new Error(error.message);
    }

    // Busca dados adicionais do usuário usando admin client para bypass RLS
    const clientToUse = supabaseAdmin || supabase;
    const { data: user, error: userError } = await clientToUse
      .from('users')
      .select('id, email, full_name, phone, user_type, created_at, updated_at')
      .eq('id', data.user.id)
      .single();

    if (userError) {
      // Se o usuário não existe na tabela public.users, tenta criar
      console.warn('Usuário não encontrado em public.users, tentando criar...');
      
      // Tenta criar o registro na tabela public.users
      const { data: newUser, error: createError } = await clientToUse
        .from('users')
        .insert({
          id: data.user.id,
          email: data.user.email,
          password_hash: null,
          full_name: data.user.user_metadata?.full_name || 'Usuário',
          phone: data.user.user_metadata?.phone || null,
          user_type: data.user.user_metadata?.user_type || 'citizen'
        })
        .select()
        .single();

      if (createError) {
        throw new Error(`Erro ao buscar/criar dados do usuário: ${createError.message}`);
      }

      return {
        user: newUser,
        token: data.session.access_token
      };
    }

    return {
      user,
      token: data.session.access_token
    };
  }

  /**
   * Faz logout do usuário
   */
  async logout(token) {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  /**
   * Busca perfil do usuário
   */
  async getProfile(userId) {
    // Usa cliente anon (RLS verifica se o usuário pode ver seu próprio perfil)
    const { data, error } = await supabase
      .from('users')
      .select('id, email, full_name, phone, user_type, created_at, updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      // Se não encontrou, tenta buscar do auth.users e criar
      const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(userId);
      
      if (!authError && authUser) {
        // Tenta criar o usuário na tabela public.users
        const { data: newUser, error: createError } = await clientToUse
          .from('users')
          .insert({
            id: authUser.id,
            email: authUser.email,
            password_hash: null,
            full_name: authUser.user_metadata?.full_name || 'Usuário',
            phone: authUser.user_metadata?.phone || null,
            user_type: authUser.user_metadata?.user_type || 'citizen'
          })
          .select()
          .single();

        if (!createError && newUser) {
          return newUser;
        }
      }
      
      throw new Error('Usuário não encontrado');
    }

    return data;
  }

  /**
   * Atualiza perfil do usuário
   */
  async updateProfile(userId, updateData) {
    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}

module.exports = new AuthService();

