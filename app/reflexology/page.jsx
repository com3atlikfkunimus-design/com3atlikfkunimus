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

  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes
  const [isRunning, setIsRunning] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
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

  // Progress ring math
  const radius = 45;
  const stroke = 3;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (timeLeft / 180) * circumference;

  if (!isHydrated) return null;

  return (
    <ResearchPageLayout
      researcher={researcher}
      onLogout={() => {
        logout();
        router.replace('/login');
      }}
      title="Intervensi: Foot Reflexology"
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

      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
        
        {/* LEFT COLUMN: Map & Instruction Panel */}
        <div className="md:col-span-7 bg-white border border-[#e2e8f0] rounded-lg p-6 flex flex-col justify-between space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-[#2563eb] bg-[#2563eb]/10 px-2 py-0.5 rounded uppercase tracking-wider">
                Fase Pemulihan
              </span>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                Parlak et al. (2024)
              </span>
            </div>
            <h2 className="text-base font-bold text-slate-900">Peta Titik Refleksi Kaki</h2>
            <p className="text-[10px] text-slate-400 leading-normal max-w-md">
              Lakukan stimulasi pijat reflexology pada titik <strong>Solar Plexus</strong> dan <strong>Ankle Joint Node</strong> atlet secara bergantian selama masing-masing 90 detik.
            </p>
          </div>

          {/* Premium Foot Sole SVG Diagram */}
          <div className="relative border border-slate-100 rounded-lg p-6 bg-slate-50/50 flex items-center justify-center min-h-[300px] overflow-visible">
            
            <svg
              viewBox="0 0 200 240"
              className="w-48 h-auto text-slate-400 fill-none stroke-current"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {/* Outer Foot Outline */}
              <path
                d="M 100,220 
                   C 85,220 75,200 75,185 
                   C 75,170 80,150 78,130 
                   C 76,110 65,80 65,55 
                   C 65,30 80,20 100,20 
                   C 120,20 135,30 135,55 
                   C 135,80 124,110 122,130 
                   C 120,150 125,170 125,185 
                   C 125,200 115,220 100,220 Z"
                className="text-slate-300 fill-white"
                strokeWidth="1.2"
              />

              {/* Inner Arch Details */}
              <path
                d="M 82,145 C 87,155 88,170 84,185"
                className="text-slate-200"
                strokeWidth="1"
              />
              <path
                d="M 118,145 C 113,155 112,170 116,185"
                className="text-slate-200"
                strokeWidth="1"
              />

              {/* Solar Plexus Hotspot Link */}
              <line x1="100" y1="90" x2="60" y2="90" className="text-slate-200 border-dashed" strokeDasharray="2,2" strokeWidth="1" />
              {/* Ankle Joint Hotspot Link */}
              <line x1="100" y1="180" x2="140" y2="180" className="text-slate-200 border-dashed" strokeDasharray="2,2" strokeWidth="1" />
            </svg>

            {/* Hotspot 1: Solar Plexus (Center Sole) */}
            <button
              onMouseEnter={() => setActiveTooltip('solar')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip(activeTooltip === 'solar' ? null : 'solar')}
              className="absolute top-[37%] left-[50%] -translate-x-1/2 -translate-y-1/2 group"
              type="button"
            >
              <span className="absolute -inset-2.5 rounded-full bg-[#2563eb]/20 animate-ping duration-1000" />
              <span className="relative block w-3.5 h-3.5 rounded-full bg-[#2563eb] border-2 border-white shadow-md cursor-pointer" />
            </button>

            {/* Hotspot 2: Ankle Joint Node (Heel/Arch Connection) */}
            <button
              onMouseEnter={() => setActiveTooltip('ankle')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={() => setActiveTooltip(activeTooltip === 'ankle' ? null : 'ankle')}
              className="absolute top-[75%] left-[50%] -translate-x-1/2 -translate-y-1/2 group"
              type="button"
            >
              <span className="absolute -inset-2.5 rounded-full bg-red-500/20 animate-ping duration-1000" />
              <span className="relative block w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow-md cursor-pointer" />
            </button>

            {/* Text labels on SVG */}
            <div className="absolute top-[34%] left-[18%] flex flex-col items-end">
              <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Solar Plexus</span>
              <span className="text-[7px] text-slate-400 font-medium leading-none">Pijat Melingkar</span>
            </div>

            <div className="absolute top-[72%] right-[16%] flex flex-col items-start">
              <span className="text-[9px] font-bold text-slate-800 uppercase tracking-wider">Ankle Joint Node</span>
              <span className="text-[7px] text-slate-400 font-medium leading-none">Tekan & Tahan</span>
            </div>

            {/* Interactive Tooltip Card */}
            {activeTooltip && (
              <div className="absolute bottom-4 left-4 right-4 bg-slate-900 text-white rounded-lg p-3.5 border border-slate-800 shadow-xl transition-all duration-200 z-20">
                {activeTooltip === 'solar' ? (
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-[#2563eb] uppercase tracking-wider">Metode Refleksi</span>
                    <h4 className="text-[10px] font-bold">Solar Plexus Reflex Point</h4>
                    <p className="text-[9px] text-slate-300 leading-normal">
                      Terletak di bagian atas tengah telapak kaki. Berfungsi menyeimbangkan sistem saraf otonom, meredakan stres emosional/burnout mental, dan menenangkan atlet pasca-beban fisik tinggi.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <span className="text-[8px] font-bold text-red-400 uppercase tracking-wider">Metode Refleksi</span>
                    <h4 className="text-[10px] font-bold">Ankle Joint Node</h4>
                    <p className="text-[9px] text-slate-300 leading-normal">
                      Terletak di dekat tumit bagian medial. Berfungsi meredakan ketegangan tendo Achilles, mempercepat drainase asam laktat, dan memfasilitasi pemulihan neuromuskular tungkai bawah.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Control & Timer Panel */}
        <div className="md:col-span-5 bg-white border border-[#e2e8f0] rounded-lg p-6 flex flex-col justify-between space-y-8">
          
          {/* Active Timer Box */}
          <div className="flex flex-col items-center justify-center text-center p-8 bg-slate-50 border border-slate-100 rounded-lg space-y-6">
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
              Durasi Terapi Refleksi
            </span>

            {/* Circular Progress Timer */}
            <div className="relative flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle
                  className="text-slate-100"
                  strokeWidth={stroke}
                  stroke="currentColor"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={45 + stroke}
                  cy={45 + stroke}
                  style={{ transform: 'scale(1.4)', transformOrigin: 'center' }}
                />
                <circle
                  className={isCompleted ? 'text-emerald-500' : 'text-[#2563eb] transition-all duration-300'}
                  strokeWidth={stroke}
                  strokeDasharray={circumference + ' ' + circumference}
                  style={{ strokeDashoffset, transform: 'scale(1.4)', transformOrigin: 'center' }}
                  strokeLinecap="round"
                  fill="transparent"
                  r={normalizedRadius}
                  cx={45 + stroke}
                  cy={45 + stroke}
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`font-mono text-3xl font-black tracking-wider leading-none ${isCompleted ? 'text-emerald-600' : 'text-slate-800'}`}>
                  {formatTime(timeLeft)}
                </span>
                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                  {isCompleted ? 'Selesai' : 'Detik'}
                </span>
              </div>
            </div>

            {/* Status Text Info */}
            <div className="space-y-1 max-w-[200px]">
              {isCompleted ? (
                <>
                  <p className="text-xs font-bold text-emerald-600 uppercase tracking-wide">Terapi Selesai</p>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Kondisi otot dan mental atlet telah diistirahatkan sejalan dengan protokol riset.
                  </p>
                </>
              ) : (
                <>
                  <p className="text-xs font-bold text-[#2563eb] uppercase tracking-wide">Terapi Berjalan</p>
                  <p className="text-[9px] text-slate-400 leading-normal">
                    Lakukan stimulasi pada kaki kanan dan kiri secara bergantian.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Action Action Buttons */}
          <div className="space-y-3">
            {isCompleted ? (
              <button
                onClick={handleLanjutkan}
                className="
                  w-full py-3.5 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white rounded-md
                  font-bold text-xs uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2
                "
              >
                Lanjutkan ke Sesi Fisik Part 2
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            ) : (
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={`
                    w-full py-3 rounded-md font-bold text-xs uppercase tracking-wider cursor-pointer transition-all duration-150
                    ${isRunning 
                      ? 'border border-slate-200 text-slate-600 hover:bg-slate-50' 
                      : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                    }
                  `}
                >
                  {isRunning ? '⏸ Pause Timer' : '▶ Lanjutkan Timer'}
                </button>

                <button
                  onClick={handleSkip}
                  className="w-full py-2.5 bg-slate-50 text-slate-400 hover:text-slate-600 rounded border border-slate-200 text-[10px] font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  ⏩ Lewati Secara Manual (Skip)
                </button>
              </div>
            )}
          </div>

        </div>

      </div>
    </ResearchPageLayout>
  );
}
