import { createContext, useContext, useState, useEffect } from 'react'
import api from '../config/api'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Função para verificar token
    const verifyToken = async () => {
      try {
        await api.get('/users/profile')
      } catch (error) {
        // Token inválido, limpa localStorage
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        setUser(null)
      }
    }

    // Verifica se há usuário salvo no localStorage
    const savedUser = localStorage.getItem('user')
    const token = localStorage.getItem('token')

    if (savedUser && token) {
      try {
        const parsedUser = JSON.parse(savedUser)
        setUser(parsedUser)
        // Verifica se o token ainda é válido
        verifyToken().finally(() => setLoading(false))
      } catch (error) {
        console.error('Erro ao carregar usuário:', error)
        localStorage.removeItem('user')
        localStorage.removeItem('token')
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      const { user, token } = response.data.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login'
      }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      const { user, token } = response.data.data

      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
      setUser(user)

      return { success: true }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar usuário'
      }
    }
  }

  const logout = async () => {
    try {
      await api.post('/auth/logout')
    } catch (error) {
      console.error('Erro ao fazer logout:', error)
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      setUser(null)
    }
  }

  const isManager = () => {
    return user?.user_type === 'manager'
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isManager,
        isAuthenticated: !!user
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

