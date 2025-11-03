import { useState, useEffect } from 'react'
import api from '../config/api'
import { toast } from 'react-toastify'
import './ManagerDashboard.css'

const ManagerDashboard = () => {
  const [stats, setStats] = useState(null)
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20
  })

  useEffect(() => {
    loadStats()
    loadComplaints()
  }, [filters.status])

  const loadStats = async () => {
    try {
      const response = await api.get('/complaints/stats')
      setStats(response.data.data || null)
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error)
      toast.error('Erro ao carregar estatísticas')
      setStats(null)
    }
  }

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const params = {}
      if (filters.status) params.status = filters.status
      params.page = filters.page
      params.limit = filters.limit

      const response = await api.get('/complaints', { params })
      const complaintsData = response.data.data?.complaints || []
      
      // Garante que as coordenadas são números
      const normalizedComplaints = complaintsData.map(complaint => ({
        ...complaint,
        latitude: typeof complaint.latitude === 'string' 
          ? parseFloat(complaint.latitude) 
          : complaint.latitude,
        longitude: typeof complaint.longitude === 'string'
          ? parseFloat(complaint.longitude)
          : complaint.longitude
      }))
      
      setComplaints(normalizedComplaints)
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao carregar denúncias'
      toast.error(errorMessage)
      console.error('Erro ao carregar denúncias:', error)
      setComplaints([]) // Define array vazio em caso de erro
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      await api.put(`/complaints/${complaintId}/status`, { status: newStatus })
      toast.success('Status atualizado com sucesso!')
      // Recarrega os dados
      await Promise.all([loadComplaints(), loadStats()])
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Erro ao atualizar status'
      toast.error(errorMessage)
      console.error('Erro ao atualizar status:', error)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      sent: 'Enviada',
      analyzing: 'Em Análise',
      resolved: 'Resolvida'
    }
    return labels[status] || status
  }

  if (loading && !stats) {
    return <div className="loading">Carregando...</div>
  }

  return (
    <div className="manager-dashboard">
      <div className="container">
        <h1>Painel de Gestão</h1>

        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total de Denúncias</h3>
              <p className="stat-value">{stats.total}</p>
            </div>
            <div className="stat-card sent">
              <h3>Enviadas</h3>
              <p className="stat-value">{stats.by_status.sent}</p>
            </div>
            <div className="stat-card analyzing">
              <h3>Em Análise</h3>
              <p className="stat-value">{stats.by_status.analyzing}</p>
            </div>
            <div className="stat-card resolved">
              <h3>Resolvidas</h3>
              <p className="stat-value">{stats.by_status.resolved}</p>
            </div>
            <div className="stat-card">
              <h3>Hoje</h3>
              <p className="stat-value">{stats.by_period.today}</p>
            </div>
            <div className="stat-card">
              <h3>Esta Semana</h3>
              <p className="stat-value">{stats.by_period.week}</p>
            </div>
            <div className="stat-card">
              <h3>Este Mês</h3>
              <p className="stat-value">{stats.by_period.month}</p>
            </div>
          </div>
        )}

        <div className="filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="">Todas as denúncias</option>
            <option value="sent">Enviadas</option>
            <option value="analyzing">Em Análise</option>
            <option value="resolved">Resolvidas</option>
          </select>
        </div>

        <div className="complaints-list">
          {complaints.length === 0 ? (
            <div className="empty-state">
              <p>Nenhuma denúncia encontrada.</p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <div>
                    <span className={`status-badge status-${complaint.status}`}>
                      {getStatusLabel(complaint.status)}
                    </span>
                    <span className="complaint-date">
                      {new Date(complaint.created_at).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                  <div className="complaint-actions">
                    {complaint.status !== 'analyzing' && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleStatusChange(complaint.id, 'analyzing')}
                      >
                        Marcar como Em Análise
                      </button>
                    )}
                    {complaint.status !== 'resolved' && (
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleStatusChange(complaint.id, 'resolved')}
                      >
                        Marcar como Resolvida
                      </button>
                    )}
                  </div>
                </div>
                <p className="complaint-description">{complaint.description}</p>
                {complaint.photos && complaint.photos.length > 0 && (
                  <div className="complaint-photos">
                    {complaint.photos.map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.photo_url}
                        alt="Denúncia"
                        className="complaint-photo"
                      />
                    ))}
                  </div>
                )}
                <div className="complaint-info">
                  <p>
                    <strong>Usuário:</strong> {complaint.user?.full_name || 'N/A'}
                  </p>
                  <p>
                    <strong>Localização:</strong> {typeof complaint.latitude === 'number'
                      ? complaint.latitude.toFixed(4)
                      : parseFloat(complaint.latitude || 0).toFixed(4)},{' '}
                    {typeof complaint.longitude === 'number'
                      ? complaint.longitude.toFixed(4)
                      : parseFloat(complaint.longitude || 0).toFixed(4)}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default ManagerDashboard

