'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import ResearchPageLayout from '@/components/ResearchPageLayout';
import StepIndicator from '@/components/StepIndicator';
import Toast from '@/components/Toast';

export default function IntervensiPage() {
  const router = useRouter();
  const { researcher, isHydrated, logout } = useAuth();
  const { savedAthleteId, athleteProfile } = useStudy();

  const [receiptLink, setReceiptLink] = useState('');
  const [toast, setToast] = useState(null);

  // Guard (Removed researcher check for open athlete flow)

  // Timer Countdown Effect
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) {
      if (timeLeft === 0 && !isCompleted) {
        handleTimerEnd();
      }
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, isCompleted]);

  const handleTimerEnd = () => {
    setIsRunning(false);
    setIsCompleted(true);
    setToast({
      message: 'Intervensi selesai! Atlet siap melanjutkan ke Sesi Fisik Part 2.',
      type: 'success',
      key: Date.now(),
    });
  };

  const handleSkip = () => {
    setTimeLeft(0);
    setIsRunning(false);
    setIsCompleted(true);
    setToast({
      message: 'Intervensi dilewati secara manual oleh peneliti.',
      type: 'info',
      key: Date.now(),
    });
  };

  const handleLanjutkan = () => {
    router.push('/sesi-2');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  

  if (!isHydrated) return null;

  return (
    <ResearchPageLayout
      researcher={researcher}
      onLogout={() => {
        logout();
        router.replace('/login');
      }}
      title="Intervensi: Validasi Pijat Otot"
      lightTheme={true}
    >
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Progress step indicator */}
      <div className="mb-10 opacity-70">
        <StepIndicator currentStep={4} />
      </div>

      <div className="max-w-2xl mx-auto">
        <div className="bg-white border border-[#e2e8f0] rounded-lg p-8 flex flex-col space-y-8 shadow-sm">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-[#2563eb] bg-[#2563eb]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                Fase Pemulihan
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Verifikasi Bukti
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900">Validasi Struk Nota Pijat Otot</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sebagai bagian dari intervensi penelitian (fase pemulihan), atlet diwajibkan untuk melampirkan bukti struk/nota dari sesi pijat otot yang telah dilakukan. Tanpa bukti yang valid, Anda <strong>tidak dapat</strong> melanjutkan ke Sesi Fisik Part 2.
            </p>
          </div>

          {/* Kriteria dan Referensi Gambar */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Kriteria Struk/Nota Valid</span>
              <ul className="text-[10px] text-slate-500 list-disc pl-4 space-y-1">
                <li>Harus <strong>jelas terlihat tanggal</strong> pijat otot (sesuai dengan jadwal sesi).</li>
                <li>Harus <strong>jelas terlihat lokasi/nama tempat</strong> pijat otot.</li>
                <li>Foto tidak boleh buram (blur) atau terpotong.</li>
              </ul>
              <div className="mt-2 rounded overflow-hidden border border-slate-200 relative group">
                <img src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&q=80&w=400" alt="Contoh Struk" className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-2">
                  <span className="text-[8px] text-white font-bold uppercase tracking-wider">Contoh Struk/Nota</span>
                </div>
              </div>
            </div>
            
            <div className="bg-slate-50 border border-slate-200 p-4 rounded-lg flex flex-col gap-3">
              <span className="text-[10px] font-bold text-slate-800 uppercase tracking-wider">Bukti Sedang Dipijat</span>
              <p className="text-[10px] text-slate-500 leading-normal">
                Sertakan minimal satu foto yang memperlihatkan atlet sedang mendapatkan intervensi pijat otot oleh terapis.
              </p>
              <div className="mt-auto rounded overflow-hidden border border-slate-200 relative group">
                <img src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=400" alt="Contoh Dipijat" className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent flex items-end p-2">
                  <span className="text-[8px] text-white font-bold uppercase tracking-wider">Contoh Dokumentasi</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 bg-slate-50/50 p-6 rounded-lg border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Link Upload GDrive / File
              </label>
              <span className="text-[9px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-2 py-0.5 rounded uppercase tracking-wider">
                Wajib Diisi *
              </span>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal mb-3">
              Silakan jadikan satu folder Google Drive (struk nota + foto saat dipijat), pastikan akses terbuka untuk publik/peneliti, lalu tempelkan tautannya di bawah ini.
            </p>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={receiptLink}
              onChange={(e) => setReceiptLink(e.target.value)}
              className="w-full py-3 px-4 bg-white text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded border border-slate-200 focus:border-[#2563eb] transition-all shadow-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={handleLanjutkan}
              className={`
                w-full py-4 rounded-md font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm
                ${receiptLink.trim().length > 0 
                  ? 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white' 
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'}
              `}
            >
              Lanjutkan ke Sesi Fisik Part 2
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>

        </div>
      </div>
    </ResearchPageLayout>
  );
}
