'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import ResearchPageLayout from '@/components/ResearchPageLayout';
import StepIndicator from '@/components/StepIndicator';

export default function Sesi2Page() {
  const router = useRouter();
  const { researcher, isHydrated, logout } = useAuth();
  const { resetStudy } = useStudy();

  // Guard (Removed researcher check for open athlete flow)

  const handleFinishAll = () => {
    resetStudy();
    router.push('/informed-consent');
  };

  if (!isHydrated) return null;

  return (
    <ResearchPageLayout
      researcher={researcher}
      onLogout={() => {
        logout();
        router.replace('/login');
      }}
      title="Sesi 2: Pasca-Intervensi"
      lightTheme={true}
    >
      <div className="mb-10 opacity-70">
        <StepIndicator currentStep={4} />
      </div>

      <div className="max-w-md mx-auto bg-white border border-[#e2e8f0] rounded-lg p-8 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-100 animate-pulse">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>

        <div className="space-y-2">
          <h2 className="text-base font-bold text-slate-900">Sesi Fisik Part 2 Siap Dimulai</h2>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Terapi Foot Reflexology telah selesai diimplementasikan secara penuh. Peneliti dapat melanjutkan dengan pengujian motorik pasca-intervensi untuk mencatat efek biomekanika pemulihan pada performa fisik atlet.
          </p>
        </div>

        <div className="pt-4 border-t border-slate-100 space-y-3">
          <button
            onClick={handleFinishAll}
            className="
              w-full py-3 bg-[#2563eb] hover:bg-[#1d4ed8] text-white rounded-md
              font-bold text-xs uppercase tracking-wider transition-all cursor-pointer
            "
          >
            Selesaikan Riset & Naracoba Berikutnya
          </button>
          
          <button
            onClick={() => router.push('/reflexology')}
            className="w-full py-2 bg-transparent text-slate-400 hover:text-slate-600 text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            ← Kembali ke Intervensi
          </button>
        </div>
      </div>
    </ResearchPageLayout>
  );
}
