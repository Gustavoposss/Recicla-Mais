/**
 * Serviço de Denúncias
 * Gerencia operações relacionadas a denúncias
 */

const { supabase, supabaseAdmin, createUserClient } = require('../config/supabase');

class ComplaintService {
  /**
   * Cria uma nova denúncia
   * @param {string} userId - ID do usuário autenticado
   * @param {Object} complaintData - Dados da denúncia
   * @param {Array} photos - Array de fotos (Multer files)
   * @param {string} userToken - Token JWT do usuário para RLS
   */
  async createComplaint(userId, complaintData, photos, userToken) {
    const { description, latitude, longitude } = complaintData;

    // Validações básicas
    if (!description || !description.trim()) {
      throw new Error('A descrição é obrigatória');
    }

    if (!latitude || !longitude) {
      throw new Error('Latitude e longitude são obrigatórias');
    }

    // Valida e converte coordenadas
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Coordenadas inválidas');
    }

    // Valida coordenadas (Fortaleza)
    if (lat < -3.8 || lat > -3.6 || lng < -38.7 || lng > -38.4) {
      throw new Error('Coordenadas devem estar dentro dos limites de Fortaleza (-3.8 a -3.6 latitude, -38.7 a -38.4 longitude)');
    }

    // Valida se há fotos
    if (!photos || photos.length === 0) {
      throw new Error('Pelo menos uma foto é obrigatória');
    }

    // Cria cliente Supabase com token do usuário para RLS funcionar
    const userClient = createUserClient(userToken);
    
    // Cria a denúncia usando cliente com token do usuário (RLS verifica permissões)
    const { data: complaint, error: complaintError } = await userClient
      .from('complaints')
      .insert({
        user_id: userId,
        description: description.trim(),
        latitude: lat,
        longitude: lng,
        status: 'sent'
      })
      .select()
      .single();

    if (complaintError) {
      throw new Error(complaintError.message);
    }

    // Faz upload das fotos para Supabase Storage
    const photoUrls = [];
    const maxPhotoSize = 5 * 1024 * 1024; // 5MB

    for (const photo of photos) {
      // Valida tamanho da foto
      if (photo.size > maxPhotoSize) {
        console.warn(`Foto ${photo.originalname} muito grande, ignorando`);
        continue;
      }

      // Valida tipo de arquivo
      const validMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validMimeTypes.includes(photo.mimetype)) {
        console.warn(`Tipo de arquivo inválido para ${photo.originalname}, ignorando`);
        continue;
      }

      try {
        // Sanitiza o nome do arquivo
        const sanitizedName = photo.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${complaint.id}/${Date.now()}-${sanitizedName}`;
        
        // Usa cliente com token do usuário para upload (RLS verifica permissões)
        const { data: uploadData, error: uploadError } = await userClient
          .storage
          .from('complaint-photos')
          .upload(fileName, photo.buffer, {
            contentType: photo.mimetype,
            upsert: false
          });

        if (uploadError) {
          console.error('Erro ao fazer upload da foto:', uploadError);
          continue;
        }

        // Obtém URL pública da foto
        const { data: urlData } = userClient
          .storage
          .from('complaint-photos')
          .getPublicUrl(fileName);

        // Salva referência da foto no banco (RLS verifica permissões)
        const { data: photoRecord, error: photoError } = await userClient
          .from('complaint_photos')
          .insert({
            complaint_id: complaint.id,
            photo_url: urlData.publicUrl
          })
          .select()
          .single();

        if (!photoError && photoRecord) {
          photoUrls.push({
            id: photoRecord.id,
            photo_url: photoRecord.photo_url
          });
        }
      } catch (error) {
        console.error(`Erro ao processar foto ${photo.originalname}:`, error);
        // Continua com outras fotos mesmo se uma falhar
      }
    }

    // Se nenhuma foto foi enviada com sucesso, lança erro
    if (photoUrls.length === 0) {
      throw new Error('Nenhuma foto foi enviada com sucesso. Verifique o tamanho e formato dos arquivos.');
    }

    // Retorna a denúncia com as fotos que foram enviadas com sucesso
    return {
      ...complaint,
      photos: photoUrls
    };
  }

  /**
   * Lista denúncias com filtros
   */
  async listComplaints(filters = {}) {
    const {
      status,
      latitude,
      longitude,
      radius = 5000,
      page = 1,
      limit = 20,
      userId = null
    } = filters;

    let query = supabase
      .from('complaints')
      .select(`
        *,
        user:users(id, full_name),
        photos:complaint_photos(id, photo_url)
      `, { count: 'exact' });

    // Filtro por usuário (para minhas denúncias)
    if (userId) {
      query = query.eq('user_id', userId);
    }

    // Filtro por status
    if (status) {
      query = query.eq('status', status);
    }

    // Filtro por localização (raio)
    // NOTA: Para uma implementação mais precisa, seria necessário criar uma função RPC no Supabase
    // Por enquanto, buscamos todas e filtramos por status
    // Em produção, recomenda-se criar a função PostGIS no banco
    if (latitude && longitude) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);
      const radiusKm = parseInt(radius) / 1000; // Converte metros para km
      
      // Aproximação: busca denúncias próximas (aproximação de 0.01 grau ≈ 1km)
      const latRange = radiusKm * 0.009; // ~1km por 0.009 grau
      const lngRange = radiusKm * 0.009;
      
      query = query
        .gte('latitude', lat - latRange)
        .lte('latitude', lat + latRange)
        .gte('longitude', lng - lngRange)
        .lte('longitude', lng + lngRange);
    }

    // Paginação
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    // Ordenação
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return {
      complaints: data || [],
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    };
  }

  /**
   * Busca uma denúncia por ID
   */
  async getComplaintById(complaintId) {
    const { data, error } = await supabase
      .from('complaints')
      .select(`
        *,
        user:users(id, full_name),
        photos:complaint_photos(id, photo_url),
        logs:complaint_logs(id, status, changed_by, created_at, notes, changed_by_user:users(full_name))
      `)
      .eq('id', complaintId)
      .single();

    if (error) {
      throw new Error('Denúncia não encontrada');
    }

    return data;
  }

  /**
   * Atualiza o status de uma denúncia (apenas gestores)
   */
  async updateStatus(complaintId, status, notes, changedBy) {
    // Valida status
    const validStatuses = ['sent', 'analyzing', 'resolved'];
    if (!validStatuses.includes(status)) {
      throw new Error('Status inválido');
    }

    // Atualiza o status
    const { data, error } = await supabase
      .from('complaints')
      .update({ status })
      .eq('id', complaintId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // O trigger deve criar o log automaticamente, mas vamos garantir
    if (notes) {
      await supabase
        .from('complaint_logs')
        .insert({
          complaint_id: complaintId,
          status,
          changed_by: changedBy,
          notes
        });
    }

    return data;
  }

  /**
   * Busca estatísticas das denúncias (apenas gestores)
   */
  async getStats(startDate = null, endDate = null) {
    let query = supabase
      .from('complaints')
      .select('status, created_at', { count: 'exact' });

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message);
    }

    // Processa os dados para estatísticas
    const stats = {
      total: count || 0,
      by_status: {
        sent: 0,
        analyzing: 0,
        resolved: 0
      },
      by_period: {
        today: 0,
        week: 0,
        month: 0
      }
    };

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    data?.forEach(complaint => {
      // Por status
      if (complaint.status in stats.by_status) {
        stats.by_status[complaint.status]++;
      }

      // Por período
      const createdDate = new Date(complaint.created_at);
      if (createdDate >= today) {
        stats.by_period.today++;
      }
      if (createdDate >= weekAgo) {
        stats.by_period.week++;
      }
      if (createdDate >= monthAgo) {
        stats.by_period.month++;
      }
    });

    return stats;
  }
}

module.exports = new ComplaintService();

