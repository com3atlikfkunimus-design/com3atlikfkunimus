'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';

/**
 * StudyContext — Global state untuk sesi pendaftaran naracoba.
 *
 * Menyimpan:
 *   - athleteProfile  : data profil naracoba (nama, umur, prodi, BB, TB, BMI)
 *   - abqAnswers      : jawaban ABQ (array 5 item skor 1–5)
 *   - abqScore        : total skor ABQ (maks 25)
 *   - savedAthleteId  : UUID atlet setelah berhasil disimpan ke Supabase
 *
 * Semua data naracoba terikat ke researcher.id dari AuthContext.
 */

const StudyContext = createContext(null);

export function StudyProvider({ children }) {
  const { researcher } = useAuth();

  const [athleteProfile, setAthleteProfileState] = useState(null);
  const [abqAnswers, setAbqAnswersState] = useState(null);
  const [abqScore, setAbqScoreState] = useState(null);
  const [savedAthleteId, setSavedAthleteId] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedProfile = localStorage.getItem('com7_athleteProfile');
      if (storedProfile) setAthleteProfileState(JSON.parse(storedProfile));

      const storedAbqAnswers = localStorage.getItem('com7_abqAnswers');
      if (storedAbqAnswers) setAbqAnswersState(JSON.parse(storedAbqAnswers));

      const storedAbqScore = localStorage.getItem('com7_abqScore');
      if (storedAbqScore) setAbqScoreState(JSON.parse(storedAbqScore));

      const storedSavedId = localStorage.getItem('com7_savedAthleteId');
      if (storedSavedId) setSavedAthleteId(JSON.parse(storedSavedId));
    } catch (e) {
      console.warn('Failed to load study context from localStorage', e);
    }
  }, []);

  /**
   * Simpan profil sementara di state (belum ke Supabase).
   * @param {{ name, age, prodi, weight, height, bmi, bmiCategory }} profile
   */
  function setAthleteProfile(profile) {
    setAthleteProfileState(profile);
    try { localStorage.setItem('com7_athleteProfile', JSON.stringify(profile)); } catch (e) {}
  }

  /**
   * Simpan hasil ABQ sementara di state.
   * @param {number[]} answers - array 5 skor (masing-masing 1–5)
   * @param {number} score - total skor
   */
  function setAbqResults(answers, score) {
    setAbqAnswersState(answers);
    setAbqScoreState(score);
    try { 
      localStorage.setItem('com7_abqAnswers', JSON.stringify(answers)); 
      localStorage.setItem('com7_abqScore', JSON.stringify(score)); 
    } catch (e) {}
  }

  /**
   * Simpan seluruh data naracoba (profil + ABQ) ke tabel `athletes` di Supabase.
   * researcher_id diambil otomatis dari AuthContext.
   *
   * @param {object} profile - dari athleteProfile state
   * @param {number[]} answers - dari abqAnswers state
   * @param {number} score - dari abqScore state
   * @returns {Promise<string>} ID atlet yang baru dibuat
   */
  async function saveAthleteWithAbq(profile, answers, score) {
    if (!profile) throw new Error('Data profil atlet belum lengkap.');

    setIsSaving(true);
    try {
      const isConfigured = 
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

      if (!isConfigured) {
        throw new Error('Koneksi Database Gagal: Konfigurasi Supabase belum disetel.');
      }

      const { data, error } = await supabase
        .from('athletes')
        .insert({
          researcher_id: profile.researcher_id || (researcher?.id ?? 'd3b07384-d113-49cd-a5d6-89d023b12345'),
          test_date: profile.test_date || new Date().toISOString().split('T')[0],
          name: String(profile.name).trim(),
          age: parseInt(profile.age, 10),
          prodi: String(profile.prodi).trim(),
          weight: parseFloat(profile.weight),
          height: parseFloat(profile.height),
          bmi: parseFloat(profile.bmi),
          bmi_category: String(profile.bmiCategory),
          abq_score: parseInt(score, 10),
          abq_answers: answers, // disimpan sebagai JSONB
        })
        .select('id')
        .single();

      if (error) throw error;

      setSavedAthleteId(data.id);
      try { localStorage.setItem('com7_savedAthleteId', JSON.stringify(data.id)); } catch (e) {}
      return data.id;
    } catch (err) {
      console.error('[StudyContext] Supabase insert failed:', err.message || err);
      throw new Error(err.message || 'Gagal menyimpan ke database. Pastikan koneksi internet Anda stabil.');
    } finally {
      setIsSaving(false);
    }
  }

  /**
   * Simpan hasil Sesi 1 fisik ke database & localStorage.
   */
  async function saveSesi1Results(athleteId, sprint, cmj, hopKanan, hopKiri, sprintLink, cmjLink, hopLink) {
    if (!athleteId) return;
    try {
      const localKey = `com7_athlete_sesi1_${athleteId}`;
      localStorage.setItem(localKey, JSON.stringify({ sprint, cmj, hopKanan, hopKiri, sprintLink, cmjLink, hopLink }));
    } catch (e) {}

    try {
      const { error } = await supabase
        .from('athletes')
        .update({
          sprint_pre: parseFloat(sprint),
          cmj_pre: parseFloat(cmj),
          hop_kanan_pre: parseFloat(hopKanan),
          hop_kiri_pre: parseFloat(hopKiri),
          video_url_sprint: sprintLink || null,
          video_url_cmj: cmjLink || null,
          video_url_hop: hopLink || null,
        })
        .eq('id', athleteId);
      if (error) throw error;
    } catch (err) {
      console.warn('[StudyContext] Failed to save Sesi 1 to Supabase, fallback active:', err.message || err);
    }
  }

  /**
   * Simpan hasil Sesi 2 fisik ke database & localStorage.
   */
  async function saveSesi2Results(athleteId, sprint, cmj, hopKanan, hopKiri, sprintLink, cmjLink, hopLink) {
    if (!athleteId) return;
    try {
      const localKey = `com7_athlete_sesi2_${athleteId}`;
      localStorage.setItem(localKey, JSON.stringify({ sprint, cmj, hopKanan, hopKiri, sprintLink, cmjLink, hopLink }));
    } catch (e) {}

    try {
      const { error } = await supabase
        .from('athletes')
        .update({
          sprint_post: parseFloat(sprint),
          cmj_post: parseFloat(cmj),
          hop_kanan_post: parseFloat(hopKanan),
          hop_kiri_post: parseFloat(hopKiri),
          video_url_sprint_post: sprintLink || null,
          video_url_cmj_post: cmjLink || null,
          video_url_hop_post: hopLink || null,
        })
        .eq('id', athleteId);
      if (error) throw error;
    } catch (err) {
      console.warn('[StudyContext] Failed to save Sesi 2 to Supabase, fallback active:', err.message || err);
    }
  }

  /**
   * Simpan hasil Post-Test ABQ
   */
  async function savePostAbqResults(athleteId, score) {
    if (!athleteId) return;
    try {
      const { error } = await supabase
        .from('athletes')
        .update({
          abq_post_score: parseInt(score, 10),
        })
        .eq('id', athleteId);
      if (error) throw error;
    } catch (err) {
      console.warn('[StudyContext] Failed to save Post ABQ to Supabase:', err.message || err);
      throw err;
    }
  }

  /**
   * Upload video ke Supabase Storage (bucket 'videos')
   * Dibatasi ukuran 10MB di client-side pada saat pemanggilan.
   */
  async function uploadVideo(file, testId) {
    if (!file) return null;
    try {
      const isConfigured = 
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');
      if (!isConfigured) return null;

      const fileExt = file.name.split('.').pop() || 'mp4';
      const fileName = `${savedAthleteId || 'unknown'}-${testId}-${Date.now()}.${fileExt}`;
      const filePath = `raw-footage/${fileName}`;

      const { data, error } = await supabase.storage
        .from('videos')
        .upload(filePath, file, { upsert: true });

      if (error) throw error;

      // Ambil public URL
      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error('[StudyContext] Video upload failed:', err);
      throw err;
    }
  }

  /** Reset state setelah satu naracoba selesai (untuk naracoba berikutnya) */
  function resetStudy() {
    setAthleteProfileState(null);
    setAbqAnswersState(null);
    setAbqScoreState(null);
    setSavedAthleteId(null);
    try {
      localStorage.removeItem('com7_athleteProfile');
      localStorage.removeItem('com7_abqAnswers');
      localStorage.removeItem('com7_abqScore');
      localStorage.removeItem('com7_savedAthleteId');
    } catch (e) {}
  }

  return (
    <StudyContext.Provider
      value={{
        athleteProfile,
        setAthleteProfile,
        abqAnswers,
        abqScore,
        setAbqResults,
        savedAthleteId,
        isSaving,
        saveAthleteWithAbq,
        saveSesi1Results,
        saveSesi2Results,
        savePostAbqResults,
        uploadVideo,
        resetStudy,
        researcherId: researcher?.id ?? null,
        researcherName: researcher?.name ?? null,
      }}
    >
      {children}
    </StudyContext.Provider>
  );
}

export function useStudy() {
  const ctx = useContext(StudyContext);
  if (!ctx) throw new Error('useStudy harus digunakan di dalam <StudyProvider>');
  return ctx;
}
