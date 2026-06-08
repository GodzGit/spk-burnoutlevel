/* assessmentService.js */
import { supabase, isConfigured } from '../config/supabase.js';

/**
 * Menyimpan data assessment burnout baru.
 * @param {Object} payload - Data assessment
 * @param {string} payload.participant_id - ID Partisipan
 * @param {number} payload.beban_akademik - Nilai Beban Akademik (0-100)
 * @param {number} payload.durasi_tidur - Nilai Durasi Tidur (0-12)
 * @param {number} payload.aktivitas_non_akademik - Nilai Aktivitas Non Akademik (0-100)
 * @param {number} payload.burnout_score - Skor Burnout (%)
 * @param {string} payload.burnout_category - Kategori Burnout (Rendah, Sedang, Tinggi)
 * @returns {Promise<Object>} Data assessment yang berhasil disimpan
 */
export async function createAssessment(payload) {
  const newAssessment = {
    participant_id: payload.participant_id,
    beban_akademik: parseFloat(payload.beban_akademik),
    durasi_tidur: parseFloat(payload.durasi_tidur),
    aktivitas_non_akademik: parseFloat(payload.aktivitas_non_akademik),
    burnout_score: parseFloat(payload.burnout_score),
    burnout_category: payload.burnout_category,
    created_at: new Date().toISOString()
  };

  if (isConfigured() && supabase) {
    const { data, error } = await supabase
      .from('assessments')
      .insert([newAssessment])
      .select()
      .single();

    if (error) {
      console.error("Supabase createAssessment Error:", error);
      throw error;
    }
    return data;
  } else {
    // Fallback LocalStorage untuk development lokal
    console.warn("Supabase belum dikonfigurasi. Menggunakan penyimpanan lokal (LocalStorage) fallback.");
    
    const stored = localStorage.getItem('spk_assessments');
    const assessments = stored ? JSON.parse(stored) : [];
    
    // Buat data dengan ID integer urut
    const assessmentWithId = {
      id: assessments.length + 1,
      ...newAssessment
    };
    
    assessments.push(assessmentWithId);
    localStorage.setItem('spk_assessments', JSON.stringify(assessments));
    
    return assessmentWithId;
  }
}

/**
 * Mengambil data assessment terbaru beserta data partisipannya.
 * @param {number} limit - Jumlah data maksimal yang diambil
 * @returns {Promise<Array>} List data assessment terbaru
 */
export async function getRecentAssessments(limit = 10) {
  if (isConfigured() && supabase) {
    // Menggunakan query join di Supabase
    const { data, error } = await supabase
      .from('assessments')
      .select(`
        id,
        beban_akademik,
        durasi_tidur,
        aktivitas_non_akademik,
        burnout_score,
        burnout_category,
        created_at,
        participants (
          nama,
          prodi,
          semester
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Supabase getRecentAssessments Error:", error);
      throw error;
    }
    return data;
  } else {
    // Fallback LocalStorage (melakukan manual JOIN)
    const storedAssessments = localStorage.getItem('spk_assessments');
    const storedParticipants = localStorage.getItem('spk_participants');
    
    const assessments = storedAssessments ? JSON.parse(storedAssessments) : [];
    const participants = storedParticipants ? JSON.parse(storedParticipants) : [];
    
    // Urutkan assessments berdasarkan created_at DESC
    const sorted = [...assessments].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    const limited = sorted.slice(0, limit);
    
    // Gabungkan dengan data partisipan
    return limited.map(ass => {
      const part = participants.find(p => p.id === ass.participant_id) || {
        nama: "Pengguna Misterius",
        prodi: "Tidak Diketahui",
        semester: 1
      };
      return {
        ...ass,
        participants: {
          nama: part.nama,
          prodi: part.prodi,
          semester: part.semester
        }
      };
    });
  }
}
