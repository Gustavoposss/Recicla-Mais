import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import './Auth.css'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validação básica no frontend
    if (!formData.email || !formData.password) {
      toast.error('Preencha todos os campos')
      return
    }

    setLoading(true)

    try {
      const result = await login(formData.email.trim(), formData.password)

      if (result.success) {
        toast.success('Login realizado com sucesso!')
        navigate('/')
      } else {
        toast.error(result.message || 'Erro ao fazer login')
      }
    } catch (error) {
      toast.error('Erro inesperado ao fazer login')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>♻️ Recicla Mais</h1>
        <h2>Login</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-link">
          Não tem uma conta? <Link to="/register">Cadastre-se</Link>
        </p>
      </div>
    </div>
  )
}

export default Login

