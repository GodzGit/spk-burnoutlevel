/* participantService.js */
import { supabase, isConfigured } from '../config/supabase.js';

/**
 * Menyimpan data partisipan baru.
 * @param {string} nama - Nama Mahasiswa
 * @param {string} prodi - Program Studi
 * @param {number} semester - Semester (integer)
 * @returns {Promise<Object>} Data partisipan yang berhasil disimpan
 */
export async function createParticipant(nama, prodi, semester) {
  const newParticipant = {
    nama: nama,
    prodi: prodi,
    semester: parseInt(semester, 10),
    created_at: new Date().toISOString()
  };

  if (isConfigured() && supabase) {
    const { data, error } = await supabase
      .from('participants')
      .insert([newParticipant])
      .select()
      .single();

    if (error) {
      console.error("Supabase createParticipant Error:", error);
      throw error;
    }
    return data;
  } else {
    // Fallback LocalStorage untuk development lokal
    console.warn("Supabase belum dikonfigurasi. Menggunakan penyimpanan lokal (LocalStorage) fallback.");
    
    // Ambil data lama
    const stored = localStorage.getItem('spk_participants');
    const participants = stored ? JSON.parse(stored) : [];
    
    // Buat data dengan ID integer urut
    const participantWithId = {
      id: participants.length + 1,
      ...newParticipant
    };
    
    participants.push(participantWithId);
    localStorage.setItem('spk_participants', JSON.stringify(participants));
    
    return participantWithId;
  }
}
