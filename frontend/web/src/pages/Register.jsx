import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { toast } from 'react-toastify'
import './Auth.css'

const Register = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: ''
  })
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validação básica no frontend
    if (!formData.email || !formData.password || !formData.full_name) {
      toast.error('Preencha os campos obrigatórios')
      return
    }

    if (formData.password.length < 8) {
      toast.error('A senha deve ter no mínimo 8 caracteres')
      return
    }

    setLoading(true)

    try {
      const result = await register({
        ...formData,
        email: formData.email.trim(),
        full_name: formData.full_name.trim(),
        phone: formData.phone?.trim() || null
      })

      if (result.success) {
        toast.success('Cadastro realizado com sucesso!')
        navigate('/')
      } else {
        toast.error(result.message || 'Erro ao cadastrar')
      }
    } catch (error) {
      toast.error('Erro inesperado ao cadastrar')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1>♻️ Recicla Mais</h1>
        <h2>Cadastro</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="full_name">Nome Completo</label>
            <input
              type="text"
              id="full_name"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              required
              placeholder="Seu nome completo"
            />
          </div>

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
            <label htmlFor="phone">Telefone (opcional)</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="(85) 99999-9999"
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
              minLength={8}
              placeholder="Mínimo 8 caracteres"
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>

        <p className="auth-link">
          Já tem uma conta? <Link to="/login">Faça login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register

