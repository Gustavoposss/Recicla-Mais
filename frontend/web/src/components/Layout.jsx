import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './Layout.css'

const Layout = ({ children }) => {
  const { user, logout, isManager } = useAuth()
  const location = useLocation()

  const handleLogout = () => {
    logout()
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="container">
          <div className="nav-content">
            <Link to="/" className="logo">
              ♻️ Recicla Mais
            </Link>

            <div className="nav-links">
              <Link
                to="/"
                className={location.pathname === '/' ? 'active' : ''}
              >
                Início
              </Link>
              <Link
                to="/map"
                className={location.pathname === '/map' ? 'active' : ''}
              >
                Mapa
              </Link>
              <Link
                to="/create-complaint"
                className={location.pathname === '/create-complaint' ? 'active' : ''}
              >
                Nova Denúncia
              </Link>
              <Link
                to="/my-complaints"
                className={location.pathname === '/my-complaints' ? 'active' : ''}
              >
                Minhas Denúncias
              </Link>
              {isManager() && (
                <Link
                  to="/dashboard"
                  className={location.pathname === '/dashboard' ? 'active' : ''}
                >
                  Painel Gestor
                </Link>
              )}
            </div>

            <div className="nav-user">
              <span className="user-name">{user?.full_name}</span>
              <button onClick={handleLogout} className="btn-logout">
                Sair
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>Recicla Mais - Contribuindo para o ODS 11: Cidades e Comunidades Sustentáveis</p>
          <p>© 2025 - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  )
}

export default Layout

