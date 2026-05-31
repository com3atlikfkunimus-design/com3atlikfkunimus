'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ResearchPageLayout from '@/components/ResearchPageLayout';
import StepIndicator from '@/components/StepIndicator';
import Toast from '@/components/Toast';

export default function InformedConsentPage() {
  const router = useRouter();
  const { researcher, isHydrated, logout } = useAuth();
  const [toast, setToast] = useState(null);
  
  // Track agreement status
  const [isAccessBlocked, setIsAccessBlocked] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Remove strict login redirect for athletes
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <svg className="w-8 h-8 animate-spin text-[#2563eb]" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  const handleAgree = () => {
    if (!hasScrolledToBottom || !isChecked) return;
    router.push('/registrasi');
  };

  const handleDecline = () => {
    setIsAccessBlocked(true);
    setToast({
      message: 'Akses pengujian dikunci karena Anda tidak menyetujui pernyataan etika.',
      type: 'warning',
      key: Date.now(),
    });
  };

  const handleResetAccess = () => {
    setIsAccessBlocked(false);
    setHasScrolledToBottom(false);
    setIsChecked(false);
  };

  const handleScroll = (e) => {
    const target = e.target;
    // Check if scrolled within 15px from bottom
    const isAtBottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 15;
    if (isAtBottom) {
      setHasScrolledToBottom(true);
    }
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <ResearchPageLayout
      researcher={researcher}
      onLogout={handleLogout}
      title="Lembar Pernyataan Persetujuan"
      lightTheme={true}
    >
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="mb-10">
        <StepIndicator currentStep={1} />
      </div>

      {isAccessBlocked ? (
        /* ── Blokir Akses Pengujian (Blocked State) ── */
        <div className="max-w-xl mx-auto bg-white border border-[#e2e8f0] rounded-lg p-10 text-center space-y-6">
          <div className="w-12 h-12 rounded-full border-2 border-red-500 flex items-center justify-center mx-auto text-red-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-bold text-[#0f172a] tracking-tight">Akses Pengujian Dikunci</h1>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm mx-auto font-medium">
              Sesuai dengan etika penelitian medis kelompok 7, naracoba wajib menyetujui pernyataan tertulis sebelum data dapat diambil.
            </p>
          </div>
          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleResetAccess}
              className="px-6 py-2.5 bg-[#2563eb] text-white rounded-md text-xs font-bold uppercase tracking-wider hover:bg-[#1d4ed8] transition-colors cursor-pointer"
            >
              Ulas Kembali Lembar Pernyataan
            </button>
          </div>
        </div>
      ) : (
        /* ── Lembar Pernyataan Card ── */
        <div className="max-w-2xl mx-auto bg-white border border-[#e2e8f0] rounded-lg overflow-hidden shadow-none">
          {/* Header Card */}
          <div className="px-8 py-6 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#2563eb] text-white flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
              </div>
              <div>
                <h1 className="text-base font-bold text-[#0f172a] tracking-tight">Lembar Pernyataan Persetujuan</h1>
                <p className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                  Etika Pengujian Atlet · COM 7 Kedokteran UNIMUS
                </p>
              </div>
            </div>
          </div>

          {/* Body: Teks Consent (Pristine scrollbox with scroll spy) */}
          <div 
            onScroll={handleScroll}
            className="px-8 py-6 space-y-6 max-h-[45vh] overflow-y-auto text-xs md:text-sm text-slate-600 leading-relaxed border-b border-slate-100"
          >
            <p className="font-semibold text-[#0f172a]">
              Dengan ini saya memberikan persetujuan sukarela untuk berpartisipasi dalam rangkaian pengujian motorik dan pemulihan medis yang dilaksanakan oleh kelompok peneliti COM 7 Kedokteran Universitas Muhammadiyah Semarang (UNIMUS).
            </p>

            <section className="space-y-1.5">
              <h2 className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider">Judul Penelitian</h2>
              <p className="p-3 bg-slate-50 border border-slate-200/60 rounded italic text-slate-500 font-medium">
                "Pengaruh Terapi Foot Reflexology terhadap Tingkat Burnout dan Performa Fisik Atlet: Studi Pre-Post dengan Kelompok COM 7 Kedokteran UNIMUS"
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider">Tujuan Penelitian</h2>
              <p>
                Penelitian ini bertujuan untuk mengkaji efektivitas terapi Foot Reflexology (pijat refleksi kaki) dalam mengurangi tingkat kelelahan (burnout) atlet serta meningkatkan performa fisik yang diukur melalui serangkaian tes kondisi fisik standar.
              </p>
            </section>

            <section className="space-y-2">
              <h2 className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider">Prosedur yang Akan Dilakukan</h2>
              <p>Partisipasi Anda mencakup serangkaian prosedur berikut:</p>
              <ul className="space-y-2.5">
                {[
                  {
                    title: '1. Tes Sprint (Kecepatan)',
                    desc: 'Anda akan melakukan sprint maksimal sejauh 30 meter. Waktu tempuh diukur secara presisi menggunakan stopwatch digital.'
                  },
                  {
                    title: '2. Counter Movement Jump (CMJ)',
                    desc: 'Tes lompatan vertikal dengan awalan gerakan jongkok (countermovement) untuk mengukur daya ledak otot tungkai.'
                  },
                  {
                    title: '3. Hop Test (Keseimbangan Dinamis)',
                    desc: 'Serangkaian lompatan satu kaki mengukur kekuatan, koordinasi, dan keseimbangan dinamis ekstremitas bawah.'
                  },
                  {
                    title: '4. Terapi Foot Reflexology',
                    desc: 'Sesi pijat refleksi kaki selama ±30 menit oleh terapis terlatih bersertifikat pada titik-titik refleks spesifik di telapak kaki.'
                  },
                  {
                    title: '5. Pengisian Kuesioner ABQ',
                    desc: 'Athlete Burnout Questionnaire (ABQ) berisi 5 pertanyaan singkat menilai tingkat kelelahan emosional, depersonalisasi, dan penurunan prestasi.'
                  },
                ].map((item) => (
                  <li key={item.title} className="p-3 border border-slate-100 rounded space-y-0.5">
                    <p className="font-bold text-[#0f172a] text-xs">{item.title}</p>
                    <p className="text-slate-500 text-xs">{item.desc}</p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider">Risiko dan Ketidaknyamanan</h2>
              <p className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded font-medium text-xs">
                ⚠️ Tes fisik berpotensi menyebabkan kelelahan otot sementara, kram ringan, atau nyeri setelah latihan (DOMS) yang umumnya mereda dalam 24–48 jam. Apabila Anda memiliki riwayat cedera muskuloskeletal, gangguan kardiovaskular, atau kondisi medis lain, harap informasikan kepada peneliti sebelum memulai tes.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider">Kerahasiaan Data</h2>
              <p>
                Seluruh data pribadi dan hasil pemeriksaan Anda bersifat <span className="font-bold text-[#0f172a]">RAHASIA</span> dan hanya digunakan untuk kepentingan penelitian ilmiah. Identitas Anda tidak akan dipublikasikan dalam bentuk apapun tanpa izin tertulis dari Anda.
              </p>
            </section>

            <section className="space-y-1.5">
              <h2 className="text-[10px] font-bold text-[#0f172a] uppercase tracking-wider">Hak Mengundurkan Diri</h2>
              <p>
                Keikutsertaan Anda dalam penelitian ini bersifat <span className="font-bold text-[#0f172a]">sukarela</span>. Anda berhak untuk mengundurkan diri kapan saja tanpa sanksi apapun dan tanpa perlu memberikan alasan.
              </p>
            </section>

            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded text-emerald-800 text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
              <span>✓ Gulir selesai! Harap beri centang pada kotak persetujuan di bawah ini.</span>
            </div>
          </div>

          {/* Checklist Area */}
          <div className="px-8 pt-4 pb-2">
            <label className={`flex items-start gap-3 cursor-pointer text-xs select-none ${!hasScrolledToBottom ? 'opacity-60 cursor-not-allowed' : ''}`}>
              <input
                type="checkbox"
                checked={isChecked}
                disabled={!hasScrolledToBottom}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#2563eb] focus:ring-[#2563eb]/20 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <span className={!hasScrolledToBottom ? 'text-slate-400 font-medium' : 'text-slate-700 font-semibold'}>
                Saya menyatakan telah membaca, memahami, dan menyetujui seluruh ketentuan lembar persetujuan di atas.
                {!hasScrolledToBottom && (
                  <span className="block text-[10px] text-amber-600 font-bold mt-1 uppercase tracking-wide">
                    ⚠️ Harap gulir (scroll) teks persetujuan di atas hingga paling bawah untuk membuka checkbox persetujuan.
                  </span>
                )}
              </span>
            </label>
          </div>

          {/* Footer Card Actions */}
          <div className="px-8 py-5 flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-slate-100 mt-2">
            <p className="text-[10px] text-slate-400 leading-normal max-w-xs text-center sm:text-left font-medium">
              Silakan baca dan berikan tanda centang di atas untuk mengaktifkan tombol persetujuan.
            </p>
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                id="consent-decline-btn"
                type="button"
                onClick={handleDecline}
                className="flex-1 sm:flex-none px-4 py-2.5 border border-slate-200 text-red-500 hover:bg-slate-50 transition-colors rounded text-xs font-bold uppercase tracking-wider cursor-pointer"
              >
                Tidak Setuju
              </button>
              <button
                id="consent-agree-btn"
                type="button"
                disabled={!hasScrolledToBottom || !isChecked}
                onClick={handleAgree}
                className="
                  flex-1 sm:flex-none px-6 py-2.5 bg-slate-900 text-white rounded
                  font-bold text-xs uppercase tracking-wider
                  hover:bg-slate-800 active:bg-slate-950
                  disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed
                  transition-all duration-150 cursor-pointer
                  flex items-center justify-center gap-1.5
                "
              >
                Saya Setuju
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </ResearchPageLayout>
  );
}
