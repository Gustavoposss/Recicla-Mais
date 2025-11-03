import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../config/api'
import { toast } from 'react-toastify'
import './CreateComplaint.css'

const CreateComplaint = () => {
  const [formData, setFormData] = useState({
    description: '',
    latitude: '',
    longitude: ''
  })
  const [photos, setPhotos] = useState([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    // Tenta obter a localização do usuário
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(8),
            longitude: position.coords.longitude.toFixed(8)
          }))
        },
        (error) => {
          console.error('Erro ao obter localização:', error)
          // Define coordenadas padrão (Fortaleza centro)
          setFormData(prev => ({
            ...prev,
            latitude: '-3.7319',
            longitude: '-38.5267'
          }))
        }
      )
    } else {
      // Se não suportar geolocalização, usa padrão
      setFormData(prev => ({
        ...prev,
        latitude: '-3.7319',
        longitude: '-38.5267'
      }))
    }
  }, [])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)
    
    // Valida número máximo de fotos
    if (files.length + photos.length > 5) {
      toast.error('Máximo de 5 fotos permitidas')
      return
    }

    // Valida tamanho de cada arquivo (5MB max)
    const maxSize = 5 * 1024 * 1024 // 5MB
    const invalidFiles = files.filter(file => file.size > maxSize)
    
    if (invalidFiles.length > 0) {
      toast.error('Algumas fotos são muito grandes. Tamanho máximo: 5MB por foto')
      return
    }

    // Valida tipo de arquivo
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    const invalidTypes = files.filter(file => !validTypes.includes(file.type))
    
    if (invalidTypes.length > 0) {
      toast.error('Apenas imagens são permitidas (JPG, PNG, GIF, WEBP)')
      return
    }

    setPhotos([...photos, ...files])
  }

  const removePhoto = (index) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Validações
    if (!formData.description.trim()) {
      toast.error('A descrição é obrigatória')
      return
    }

    if (photos.length === 0) {
      toast.error('Pelo menos uma foto é obrigatória')
      return
    }

    // Valida coordenadas
    const lat = parseFloat(formData.latitude)
    const lng = parseFloat(formData.longitude)
    
    if (isNaN(lat) || isNaN(lng)) {
      toast.error('Coordenadas inválidas')
      return
    }

    if (lat < -3.8 || lat > -3.6 || lng < -38.7 || lng > -38.4) {
      toast.error('Coordenadas devem estar dentro dos limites de Fortaleza')
      return
    }

    setLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('description', formData.description)
      formDataToSend.append('latitude', formData.latitude)
      formDataToSend.append('longitude', formData.longitude)

      photos.forEach((photo) => {
        formDataToSend.append('photos', photo)
      })

      await api.post('/complaints', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      toast.success('Denúncia criada com sucesso!')
      navigate('/my-complaints')
    } catch (error) {
      console.error('Erro ao criar denúncia:', error)
      
      // Tratamento específico para rate limiting
      if (error.response?.status === 429) {
        toast.error('Muitas requisições. Por favor, aguarde alguns segundos antes de tentar novamente.')
      } else if (error.response?.status === 400) {
        toast.error(error.response?.data?.message || 'Dados inválidos. Verifique os campos preenchidos.')
      } else {
        toast.error(error.response?.data?.message || 'Erro ao criar denúncia. Tente novamente.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="create-complaint">
      <div className="container">
        <h1>Nova Denúncia</h1>

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="description">Descrição do Problema *</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              placeholder="Descreva o problema de descarte irregular de lixo..."
              rows={6}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude *</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleChange}
                required
                step="0.00000001"
                placeholder="-3.7319"
              />
              <small>Use o botão abaixo para detectar automaticamente</small>
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Longitude *</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleChange}
                required
                step="0.00000001"
                placeholder="-38.5267"
              />
            </div>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (position) => {
                    setFormData(prev => ({
                      ...prev,
                      latitude: position.coords.latitude.toFixed(8),
                      longitude: position.coords.longitude.toFixed(8)
                    }))
                    toast.success('Localização detectada!')
                  },
                  (error) => {
                    console.warn('Erro ao obter localização:', error)
                    
                    // Mensagens mais específicas baseadas no tipo de erro
                    let errorMessage = 'Não foi possível obter sua localização.';
                    
                    if (error.code === error.PERMISSION_DENIED) {
                      errorMessage = 'Permissão de localização negada. Use as coordenadas padrão ou permita acesso no navegador.';
                    } else if (error.code === error.POSITION_UNAVAILABLE) {
                      errorMessage = 'Localização indisponível. Usando coordenadas padrão de Fortaleza.';
                    } else if (error.code === error.TIMEOUT) {
                      errorMessage = 'Tempo esgotado. Usando coordenadas padrão de Fortaleza.';
                    }
                    
                    toast.warn(errorMessage)
                    
                    // Define coordenadas padrão de Fortaleza
                    setFormData(prev => ({
                      ...prev,
                      latitude: '-3.7319',
                      longitude: '-38.5267'
                    }))
                  },
                  {
                    enableHighAccuracy: false, // Reduzido para false para evitar bloqueios
                    timeout: 5000, // Reduzido para 5 segundos
                    maximumAge: 60000 // 1 minuto de cache
                  }
                )
              } else {
                toast.error('Seu navegador não suporta geolocalização')
              }
            }}
          >
            📍 Detectar Minha Localização
          </button>

          <div className="form-group">
            <label htmlFor="photos">Fotos * (máximo 5)</label>
            <input
              type="file"
              id="photos"
              accept="image/*"
              multiple
              onChange={handlePhotoChange}
              required={photos.length === 0}
            />
            {photos.length > 0 && (
              <div className="photos-preview">
                {photos.map((photo, index) => (
                  <div key={index} className="photo-preview">
                    <img
                      src={URL.createObjectURL(photo)}
                      alt={`Preview ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="btn-remove-photo"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Enviando...' : 'Enviar Denúncia'}
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => navigate('/my-complaints')}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateComplaint

