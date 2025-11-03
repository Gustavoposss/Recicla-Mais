import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Home.css'

const Home = () => {
  const { user } = useAuth()

  return (
    <div className="home">
      <div className="container">
        <div className="hero">
          <h1>Bem-vindo ao Recicla Mais, {user?.full_name}!</h1>
          <p className="hero-subtitle">
            Contribua para uma Fortaleza mais limpa e sustentável
          </p>
        </div>

        <div className="actions-grid">
          <Link to="/create-complaint" className="action-card primary">
            <div className="action-icon">📸</div>
            <h3>Nova Denúncia</h3>
            <p>Reporte um problema de descarte irregular de lixo</p>
          </Link>

          <Link to="/map" className="action-card">
            <div className="action-icon">🗺️</div>
            <h3>Ver no Mapa</h3>
            <p>Visualize todas as denúncias na cidade</p>
          </Link>

          <Link to="/my-complaints" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Minhas Denúncias</h3>
            <p>Acompanhe o status das suas denúncias</p>
          </Link>
        </div>

        <div className="info-section">
          <h2>Sobre o Projeto</h2>
          <p>
            O Recicla Mais é uma plataforma que conecta cidadãos aos órgãos de gestão
            ambiental para reportar e monitorar denúncias de lixo em áreas urbanas de Fortaleza.
          </p>
          <p>
            Este projeto contribui para o <strong>ODS 11: Cidades e Comunidades Sustentáveis</strong>,
            auxiliando na criação de cidades mais limpas, seguras e resilientes.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Home

