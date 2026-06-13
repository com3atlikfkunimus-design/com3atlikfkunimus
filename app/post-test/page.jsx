'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import ResearchPageLayout from '@/components/ResearchPageLayout';
import StepIndicator from '@/components/StepIndicator';
import Toast from '@/components/Toast';
import ABQQuestionnaire from '@/components/ABQQuestionnaire';

/** Interpretasi skor ABQ total */
function interpretAbqScore(score) {
  if (score <= 8)
    return { level: 'Rendah', desc: 'Tidak ada indikasi burnout bermakna.', color: 'text-slate-700' };
  if (score <= 14)
    return { level: 'Sedang', desc: 'Terdapat beberapa gejala burnout ringan.', color: 'text-amber-600' };
  if (score <= 19)
    return { level: 'Tinggi', desc: 'Burnout signifikan — perlu perhatian khusus.', color: 'text-orange-600' };
  return { level: 'Sangat Tinggi', desc: 'Burnout berat — intervensi segera diperlukan.', color: 'text-red-600' };
}

export default function PostTestPage() {
  const router = useRouter();
  const { researcher, isHydrated, logout } = useAuth();
  const { savedAthleteId, athleteProfile, savePostAbqResults } = useStudy();
  const [isSaving, setIsSaving] = useState(false);

  const [answers, setAnswers] = useState([0, 0, 0, 0, 0]);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  // Guard: pastikan athleteProfile ada (jika user refresh halaman)
  useEffect(() => {
    if (isHydrated && !athleteProfile) {
      router.replace('/registrasi');
    }
  }, [isHydrated, athleteProfile, router]);

  const handleSave = async (updatedAnswers, score) => {
    setAnswers(updatedAnswers);
    if (!savedAthleteId) {
      setToast({ message: 'Terjadi kesalahan sistem: Data atlet tidak ditemukan.', type: 'error', key: Date.now() });
      return;
    }
    
    setIsSaving(true);
    try {
      await savePostAbqResults(savedAthleteId, score);
      setSubmitted(true);
    } catch (err) {
      console.error('[Pre-Test] Save error:', err);
      setToast({
        message: 'Gagal menyimpan data ke server. Cek koneksi dan konfigurasi Supabase.',
        type: 'error',
        key: Date.now(),
      });
    }
  };

  if (!isHydrated || !athleteProfile) return null;

  // ── Tampilan Sukses Setelah Submit (Minimalist Light Style) ──
  if (submitted) {
    const finalScore = answers.reduce((acc, val) => acc + val, 0);
    const finalInterp = interpretAbqScore(finalScore);

    return (
      <ResearchPageLayout
        researcher={researcher}
        onLogout={() => { logout(); router.replace('/login'); }}
        title="Post-Test Selesai"
        lightTheme={true}
      >
        <div className="mb-10">
          <StepIndicator currentStep={4} />
        </div>

        <div className="max-w-xl mx-auto text-center">
          {/* Minimalist Success Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-12 h-12 rounded-full border-2 border-slate-900 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          <h1 className="text-xl font-bold text-slate-900 mb-2">Post-Test Selesai</h1>
          <p className="text-slate-400 text-xs mb-8 font-medium">
            Evaluasi akhir untuk <span className="text-slate-800 font-bold">{athleteProfile.name}</span> berhasil disimpan dengan aman.
          </p>

          {/* Clean Light Card Summary */}
          <div className="glass-panel border border-[#e2e8f0]/80 rounded-2xl p-8 text-left mb-8 shadow-premium space-y-6 relative z-10 hover-lift transition-all duration-300">
            <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ringkasan Data</h2>

            <div className="space-y-3.5 text-sm text-slate-600">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">Nama Lengkap</span>
                <span className="font-semibold text-slate-800">{athleteProfile.name}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">Umur</span>
                <span className="font-semibold text-slate-800">{athleteProfile.age} tahun</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">Program Studi</span>
                <span className="font-semibold text-slate-800">{athleteProfile.prodi}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="font-medium text-slate-400">BMI (Indeks Massa Tubuh)</span>
                <span className="font-semibold text-slate-800">{athleteProfile.bmi} ({athleteProfile.bmiCategory})</span>
              </div>
              <div className="flex justify-between py-1.5 pt-4">
                <div>
                  <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Skor Burnout ABQ (Post-Test)</span>
                  <span className={`text-xs font-semibold ${finalInterp.color} mt-0.5 block`}>{finalInterp.level} — {finalInterp.desc}</span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-black text-slate-900">{finalScore}</span>
                  <span className="text-slate-400 text-xs font-medium">/25</span>
                </div>
              </div>
            </div>
          </div>

          {/* CTA */}
          <button
            id="goto-admin-btn"
            onClick={() => router.push('/admin')}
            className="
              w-full sm:w-auto px-8 py-3.5 bg-emerald-600 text-white rounded-lg
              font-bold text-xs tracking-wider uppercase hover-lift shadow-md
              hover:bg-emerald-700 active:bg-emerald-800
              transition-all duration-200 cursor-pointer
              flex items-center justify-center gap-2 mx-auto
            "
          >
            Selesaikan Riset & Kembali ke Admin
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>
      </ResearchPageLayout>
    );
  }

  // ── Form ABQ (Minimalist Reusable Focus Mode) ──
  return (
    <ResearchPageLayout
      researcher={researcher}
      onLogout={() => { logout(); router.replace('/login'); }}
      title="Post-Test ABQ"
      lightTheme={true}
    >
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="mb-10">
        <StepIndicator currentStep={3} />
      </div>

      <div className="max-w-xl mx-auto">
        <ABQQuestionnaire
          title="Kuesioner Post-Test ABQ"
          subtitle={`Asesmen akhir Athlete Burnout Questionnaire untuk ${athleteProfile.name} setelah intervensi.`}
          initialAnswers={answers}
          onSave={handleSave}
          isSaving={isSaving}
        />
        
        <div className="mt-4 text-center">
          <button
            type="button"
            onClick={() => router.push('/sesi-2')}
            className="text-[10px] font-bold text-slate-400 hover:text-slate-600 tracking-wider uppercase transition-colors duration-200 cursor-pointer"
          >
            ← Kembali ke Sesi 2 Fisik
          </button>
        </div>
      </div>
    </ResearchPageLayout>
  );
}
