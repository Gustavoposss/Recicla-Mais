import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../config/api'
import { toast } from 'react-toastify'
import './MyComplaints.css'

const MyComplaints = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    loadComplaints()
  }, [filter])

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const params = filter ? { status: filter } : {}
      const response = await api.get('/complaints/my', { params })
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

  const getStatusLabel = (status) => {
    const labels = {
      sent: 'Enviada',
      analyzing: 'Em Análise',
      resolved: 'Resolvida'
    }
    return labels[status] || status
  }

  const getStatusClass = (status) => {
    return `status-badge status-${status}`
  }

  if (loading) {
    return <div className="loading">Carregando denúncias...</div>
  }

  return (
    <div className="my-complaints">
      <div className="container">
        <div className="page-header">
          <h1>Minhas Denúncias</h1>
          <Link to="/create-complaint" className="btn btn-primary">
            Nova Denúncia
          </Link>
        </div>

        <div className="filters">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todas</option>
            <option value="sent">Enviadas</option>
            <option value="analyzing">Em Análise</option>
            <option value="resolved">Resolvidas</option>
          </select>
        </div>

        {complaints.length === 0 ? (
          <div className="empty-state">
            <p>Você ainda não fez nenhuma denúncia.</p>
            <Link to="/create-complaint" className="btn btn-primary">
              Fazer Primeira Denúncia
            </Link>
          </div>
        ) : (
          <div className="complaints-list">
            {complaints.map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <span className={getStatusClass(complaint.status)}>
                    {getStatusLabel(complaint.status)}
                  </span>
                  <span className="complaint-date">
                    {new Date(complaint.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
                <p className="complaint-description">{complaint.description}</p>
                {complaint.photos && complaint.photos.length > 0 && (
                  <div className="complaint-photos">
                    {complaint.photos.slice(0, 3).map((photo) => (
                      <img
                        key={photo.id}
                        src={photo.photo_url}
                        alt="Denúncia"
                        className="complaint-photo"
                      />
                    ))}
                  </div>
                )}
                <div className="complaint-location">
                  📍 {typeof complaint.latitude === 'number' 
                    ? complaint.latitude.toFixed(4) 
                    : parseFloat(complaint.latitude || 0).toFixed(4)}, {typeof complaint.longitude === 'number'
                    ? complaint.longitude.toFixed(4)
                    : parseFloat(complaint.longitude || 0).toFixed(4)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyComplaints

