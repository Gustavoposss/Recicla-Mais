import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

const PrivateRoute = ({ children, requireManager = false }) => {
  const { isAuthenticated, loading, isManager } = useAuth()

  if (loading) {
    return <div className="loading">Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireManager && !isManager()) {
    return <Navigate to="/" replace />
  }

  return children
}

export default PrivateRoute

