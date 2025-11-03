import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { Icon } from 'leaflet'
import api from '../config/api'
import { toast } from 'react-toastify'
import 'leaflet/dist/leaflet.css'
import './Map.css'

// Fix para ícones do Leaflet
delete Icon.Default.prototype._getIconUrl
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png'
})

const Map = () => {
  const [complaints, setComplaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    latitude: -3.7319, // Fortaleza centro
    longitude: -38.5267,
    radius: 10000
  })

  useEffect(() => {
    loadComplaints()
  }, [filters.status])

  const loadComplaints = async () => {
    try {
      setLoading(true)
      const params = {
        latitude: filters.latitude,
        longitude: filters.longitude,
        radius: filters.radius
      }
      if (filters.status) params.status = filters.status

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
      console.error('Erro ao carregar denúncias:', error)
      
      // Tratamento específico para rate limiting
      if (error.response?.status === 429) {
        toast.error('Muitas requisições. Por favor, aguarde alguns segundos antes de tentar novamente.')
      } else {
        const errorMessage = error.response?.data?.message || 'Erro ao carregar denúncias. Tente novamente mais tarde.'
        toast.error(errorMessage)
      }
      
      setComplaints([]) // Define array vazio em caso de erro
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return '#f39c12'
      case 'analyzing': return '#3498db'
      case 'resolved': return '#2ecc71'
      default: return '#95a5a6'
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'sent': return 'Enviada'
      case 'analyzing': return 'Em Análise'
      case 'resolved': return 'Resolvida'
      default: return status
    }
  }

  if (loading) {
    return <div className="loading">Carregando mapa...</div>
  }

  return (
    <div className="map-page">
      <div className="container">
        <h1>Mapa de Denúncias</h1>

        <div className="map-filters">
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

        <div className="map-container">
          <MapContainer
            center={[filters.latitude, filters.longitude]}
            zoom={13}
            style={{ height: '600px', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            {complaints.map((complaint) => {
              // Garante que as coordenadas são números
              const lat = typeof complaint.latitude === 'string' 
                ? parseFloat(complaint.latitude) 
                : complaint.latitude
              const lng = typeof complaint.longitude === 'string'
                ? parseFloat(complaint.longitude)
                : complaint.longitude

              // Valida coordenadas antes de renderizar
              if (isNaN(lat) || isNaN(lng)) {
                return null
              }

              return (
              <Marker
                key={complaint.id}
                position={[lat, lng]}
              >
                <Popup>
                  <div className="popup-content">
                    <h3>{getStatusLabel(complaint.status)}</h3>
                    <p>{complaint.description}</p>
                    {complaint.photos && complaint.photos.length > 0 && (
                      <img
                        src={complaint.photos[0].photo_url}
                        alt="Denúncia"
                        style={{ width: '100%', marginTop: '10px' }}
                      />
                    )}
                    <p className="popup-date">
                      {new Date(complaint.created_at).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                </Popup>
              </Marker>
              )
            })}
          </MapContainer>
        </div>

        <div className="map-legend">
          <h3>Legenda</h3>
          <div className="legend-items">
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#f39c12' }}></span>
              <span>Enviada</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#3498db' }}></span>
              <span>Em Análise</span>
            </div>
            <div className="legend-item">
              <span className="legend-color" style={{ backgroundColor: '#2ecc71' }}></span>
              <span>Resolvida</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Map

