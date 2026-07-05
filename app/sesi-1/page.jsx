'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStudy } from '@/context/StudyContext';
import ResearchPageLayout from '@/components/ResearchPageLayout';
import StepIndicator from '@/components/StepIndicator';
import Toast from '@/components/Toast';

const TEST_DETAILS = {
  sprint: {
    id: 'sprint',
    title: '10/20 m Sprint',
    desc: 'Pengukuran kecepatan linier atlet menempuh jarak pendek secara maksimal.',
    unit: 'detik',
    videoUrl: 'https://www.youtube.com/embed/fyzJXYNJkh4?rel=0', // Tutorial sprint
    tataCara: [
      'Atlet berdiri di belakang garis start dalam posisi berdiri atau berkuda (standing start).',
      'Peneliti memberikan aba-aba "Bersedia, Siap, Ya!" atau tiupan peluit.',
      'Atlet berlari secepat mungkin melewati garis finish.',
      'Waktu dicatat menggunakan stopwatch digital presisi atau sensor gerak.',
    ],
  },
  cmj: {
    id: 'cmj',
    title: 'Countermovement Jump',
    desc: 'Pengukuran daya ledak (explosive power) otot tungkai vertikal dengan awalan menekuk lutut.',
    unit: 'cm',
    videoUrl: 'https://www.youtube.com/embed/s3M0XyN6Fsw', // Tutorial CMJ
    tataCara: [
      'Atlet berdiri tegak di atas matras jump atau area pengukuran dengan tangan di pinggang.',
      'Atlet melakukan gerakan jongkok cepat (countermovement) lalu melompat vertikal setinggi-tingginya.',
      'Mendarat dengan kedua kaki secara bersamaan dan menjaga keseimbangan.',
      'Tinggi lompatan diukur berdasarkan waktu melayang atau skala ukur dinding.',
    ],
  },
  hop: {
    id: 'hop',
    title: 'Single Leg Hop',
    desc: 'Pengukuran kekuatan fungsional dan stabilitas tungkai tunggal melalui lompatan horizontal.',
    unit: 'cm',
    videoUrl: 'https://www.youtube.com/embed/U3fWn2-6K4c', // Tutorial Hop Test
    tataCara: [
      'Atlet berdiri dengan satu kaki terpilih di belakang garis start.',
      'Atlet melompat sejauh mungkin ke depan menggunakan kaki tersebut dan harus mendarat stabil dengan kaki yang sama.',
      'Posisi pendaratan harus dipertahankan selama minimal 2 detik tanpa kehilangan keseimbangan.',
      'Jarak diukur dari garis start hingga tumit kaki pendaratan.',
    ],
  },
};

export default function Sesi1Page() {
  const router = useRouter();
  const { researcher, isHydrated, logout } = useAuth();
  const { savedAthleteId, athleteProfile, saveSesi1Results, resetStudy } = useStudy();

  // Active View State: 'select' (Slide 4) or 'testing' (Slide 6 - Recording page)
  const [viewState, setViewState] = useState('select');
  const [activeTestId, setActiveTestId] = useState(null);

  const [testDetails, setTestDetails] = useState(TEST_DETAILS);
  const [globalConfig, setGlobalConfig] = useState({
    sessionTime: 180,
    cameraLimit: 20,
    modalCountdown: 5
  });

  // Load custom configurations set by researcher in admin dashboard
  useEffect(() => {
    try {
      const stored = localStorage.getItem('com7_test_configurations');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.tests) {
          setTestDetails(parsed.tests);
        }
        if (parsed.global) {
          setGlobalConfig(parsed.global);
          setSessionTime(parsed.global.sessionTime || 180);
          setModalCountdown(parsed.global.modalCountdown || 5);
        }
      }
    } catch (e) {
      console.warn('Failed to load dynamic test configurations:', e);
    }
  }, []);

  // Statuses: 'Belum Mulai' or 'Selesai'
  const [testStatuses, setTestStatuses] = useState({
    sprint: 'Belum Mulai',
    cmj: 'Belum Mulai',
    hop: 'Belum Mulai',
  });

  // Global Session Timer (3 Minutes = 180 seconds) for the active test
  const [sessionTime, setSessionTime] = useState(180);
  const [isTimeUp, setIsTimeUp] = useState(false);

  // Pop-up & Wajib Baca Countdown State (Slide 5) - REMOVED per user request

  // Per-test camera/recording state
  const [testStates, setTestStates] = useState({
    sprint: { isRecording: false, recordTime: 0, link: '', hasVideo: false, score: '', isSimulated: false },
    cmj: { isRecording: false, recordTime: 0, link: '', hasVideo: false, score: '', isSimulated: false },
    hop: { isRecording: false, recordTime: 0, link: '', hasVideo: false, score: '', scoreKanan: '', scoreKiri: '', isSimulated: false },
  });

  // Camera permission and active state
  const [cameraPermissionError, setCameraPermissionError] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  // Toast State
  const [toast, setToast] = useState(null);

  // Camera stream references
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Guard (Removed researcher check for athlete convenience)

  // Active Session Timer Countdown
  useEffect(() => {
    if (viewState !== 'testing') return;

    if (sessionTime <= 0) {
      setIsTimeUp(true);
      stopCamera();
      
      // Stop recording if active and switch
      if (activeTestId && testStates[activeTestId].isRecording) {
        setTestStates((prev) => ({
          ...prev,
          [activeTestId]: { ...prev[activeTestId], isRecording: false, hasVideo: true }
        }));
      }

      setToast({
        message: 'Batas waktu pengerjaan 3 menit telah habis. Kamera dinonaktifkan, silakan gunakan link backup.',
        type: 'error',
        key: Date.now(),
      });
      return;
    }

    const interval = setInterval(() => {
      setSessionTime((t) => t - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [sessionTime, viewState, activeTestId, testStates]);


  // Start Camera Stream
  const startCamera = async () => {
    try {
      setCameraPermissionError(false);
      if (streamRef.current) stopCamera();

      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('[Camera] Access denied or failed.', err);
      setCameraActive(false);
      setCameraPermissionError(true);
      setToast({
        message: 'Akses kamera ditolak browser. Silakan berikan izin kamera pada browser Anda.',
        type: 'error',
        key: Date.now(),
      });
    }
  };

  // Stop Camera Stream to save memory
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  // Trigger camera automatically when view changes to testing
  useEffect(() => {
    if (viewState === 'testing' && activeTestId && !isTimeUp && !testStates[activeTestId].hasVideo) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [viewState, activeTestId, isTimeUp]);

  // Recording Timer: Strict 20s Limit
  useEffect(() => {
    if (viewState !== 'testing' || !activeTestId) return;
    const currentState = testStates[activeTestId];
    if (!currentState.isRecording) return;

    const interval = setInterval(() => {
      setTestStates((prev) => {
        const test = prev[activeTestId];
        const nextTime = test.recordTime + 1;

        if (nextTime >= globalConfig.cameraLimit) {
          clearInterval(interval);
          stopCamera();
          setToast({
            message: `Batas rekam ${globalConfig.cameraLimit} detik tercapai. Kamera dihentikan, silakan isi link video backup.`,
            type: 'info',
            key: Date.now(),
          });
          return {
            ...prev,
            [activeTestId]: { ...test, isRecording: false, recordTime: globalConfig.cameraLimit, hasVideo: true },
          };
        }

        return {
          ...prev,
          [activeTestId]: { ...test, recordTime: nextTime },
        };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [testStates, activeTestId, viewState]);

  // Select test card
  const handleSelectTest = (testId) => {
    setActiveTestId(testId);
    setSessionTime(180);
    setIsTimeUp(false);
    setViewState('testing');
  };

  // Simulate Practice Test
  const handleLatihan = () => {
    setToast({
      message: `Memulai Latihan Simulasi untuk ${testDetails[activeTestId].title}.`,
      type: 'info',
      key: Date.now(),
    });
    setTestStates((prev) => ({
      ...prev,
      [activeTestId]: { ...prev[activeTestId], isSimulated: true },
    }));
  };

  // Start Official Recording
  const handleTesSekarang = () => {
    if (isTimeUp) return;
    
    // Attempt camera start if not active
    if (!cameraActive) {
      startCamera();
    }

    setTestStates((prev) => ({
      ...prev,
      [activeTestId]: { ...prev[activeTestId], isRecording: true, recordTime: 0, isSimulated: false },
    }));
  };

  // Stop Official Recording
  const handleStopRekam = () => {
    stopCamera();
    setTestStates((prev) => ({
      ...prev,
      [activeTestId]: { ...prev[activeTestId], isRecording: false, hasVideo: true },
    }));
    setTestStatuses((prev) => ({
      ...prev,
      [activeTestId]: 'Selesai',
    }));
  };

  // Reset / Rekam Ulang ("Ulangi?")
  const handleRetake = () => {
    if (isTimeUp) return;
    setTestStates((prev) => ({
      ...prev,
      [activeTestId]: { ...prev[activeTestId], isRecording: false, recordTime: 0, hasVideo: false, link: '' },
    }));
    setTestStatuses((prev) => ({
      ...prev,
      [activeTestId]: 'Belum Mulai',
    }));
    startCamera();
  };

  // Cancel / Kembali
  const handleBackToSelect = () => {
    stopCamera();
    setViewState('select');
  };

  const handleStateChange = (field, value) => {
    setTestStates((prev) => ({
      ...prev,
      [activeTestId]: { ...prev[activeTestId], [field]: value },
    }));
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleNextAthlete = () => {
    resetStudy();
    router.push('/informed-consent');
  };

  const handleGoToReflexology = async () => {
    try {
      if (savedAthleteId) {
        await saveSesi1Results(
          savedAthleteId,
          testStates.sprint.score,
          testStates.cmj.score,
          testStates.hop.scoreKanan,
          testStates.hop.scoreKiri,
          testStates.sprint.link,
          testStates.cmj.link,
          testStates.hop.link
        );
      }
    } catch (e) {
      console.error('Failed to save Sesi 1 results:', e);
    }
    router.push('/reflexology');
  };

  if (!isHydrated) return null;

  const currentTestData = activeTestId ? testDetails[activeTestId] : null;
  const currentTestState = activeTestId ? testStates[activeTestId] : null;

  return (
    <ResearchPageLayout
      researcher={researcher}
      onLogout={() => { logout(); router.replace('/login'); }}
      title="Sesi 1: Tes Fisik"
      lightTheme={true}
    >
      {toast && (
        <Toast key={toast.key} message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="mb-10">
        <StepIndicator currentStep={4} />
      </div>

      {/* Floating Monospaced Session Timer */}
      {viewState === 'testing' && (
        <div className="fixed top-20 sm:top-24 right-6 z-40 bg-white border border-slate-200 px-4 py-2.5 rounded shadow flex items-center gap-3">
          <div className="flex flex-col">
            <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Timer Sesi</span>
            <span className={`font-mono font-bold text-base sm:text-lg tracking-wider leading-none mt-1 ${isTimeUp ? 'text-red-600 animate-pulse' : 'text-slate-800'}`}>
              {formatTime(sessionTime)}
            </span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isTimeUp ? 'bg-red-500' : 'bg-[#2563eb] animate-ping'}`} />
        </div>
      )}

      {viewState === 'select' ? (
        /* ── SLIDE PAGE 4: PEMILIHAN TES ── */
        <div className="max-w-2xl mx-auto space-y-10">
          <div className="text-center sm:text-left">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Pilih Protokol Tes Fisik</h1>
            <p className="text-slate-500 text-xs mt-1 font-medium">
              Sesi 1: Lakukan 3 rangkaian evaluasi motorik atlet berikut secara berurutan.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.values(testDetails).map((test) => {
              const status = testStatuses[test.id];
              return (
                <div
                  key={test.id}
                  onClick={() => handleSelectTest(test.id)}
                  className="bg-white border border-[#e2e8f0] hover:border-slate-400 rounded-lg p-6 flex flex-col justify-between transition-all duration-200 cursor-pointer active:scale-95 transition-all shadow-none group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-slate-800 group-hover:text-[#2563eb] transition-colors">{test.title}</span>
                      <span className={`
                        text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded
                        ${status === 'Selesai'
                          ? 'bg-emerald-55/10 text-emerald-600 border border-emerald-100'
                          : 'bg-slate-50 text-slate-500 border border-slate-200'
                        }
                      `}>
                        {status}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 leading-normal">{test.desc}</p>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-200 flex items-center justify-between text-[10px] font-bold text-[#2563eb] uppercase tracking-wider">
                    <span>Mulai Asesmen</span>
                    <svg className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <p className="text-[10px] text-slate-500 leading-normal max-w-sm text-center sm:text-left font-medium">
              {testStatuses.sprint === 'Selesai' && testStatuses.cmj === 'Selesai' && testStatuses.hop === 'Selesai'
                ? 'Semua rangkaian tes fisik Part 1 telah selesai. Lanjutkan ke intervensi pemulihan.'
                : 'Pastikan seluruh pengujian selesai sebelum mendaftarkan naracoba berikutnya untuk menjaga integritas basis data.'
              }
            </p>
            {testStatuses.sprint === 'Selesai' && testStatuses.cmj === 'Selesai' && testStatuses.hop === 'Selesai' ? (
              <button
                onClick={handleGoToReflexology}
                className="
                  w-full sm:w-auto px-6 py-3 bg-[#2563eb] text-white rounded-md
                  font-bold text-xs uppercase tracking-wider
                  hover:bg-[#1d4ed8] active:bg-[#1e40af]
                  transition-all duration-150 cursor-pointer active:scale-95 transition-all flex items-center justify-center gap-2
                "
              >
                Mulai Intervensi Foot Reflexology
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleNextAthlete}
                className="
                  w-full sm:w-auto px-6 py-3 bg-slate-900 text-white rounded-md
                  font-bold text-xs uppercase tracking-wider
                  hover:bg-slate-800 active:bg-slate-950
                  transition-all duration-150 cursor-pointer active:scale-95 transition-all
                "
              >
                Daftarkan Naracoba Berikutnya
              </button>
            )}
          </div>
        </div>
      ) : (
        /* ── SLIDE PAGE 6: LAYAR PEREKAMAN FISIK ATLET DENGAN HYBRID BACKUP ── */
        <div className="max-w-3xl mx-auto bg-white border border-[#e2e8f0] rounded-lg p-6 md:p-8 shadow-none space-y-8">
          <div className="flex items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Tes Fisik Aktif</span>
              <h2 className="text-base font-bold text-slate-900 mt-0.5">{currentTestData.title}</h2>
            </div>
            <button
              onClick={handleBackToSelect}
              className="text-[10px] font-bold text-slate-500 hover:text-slate-600 tracking-wider uppercase transition-colors duration-200 cursor-pointer active:scale-95 transition-all"
            >
              ← Kembali
            </button>
          </div>

          {/* Tutorial Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">Prosedur Ringkas</span>
              <ul className="text-[10px] text-slate-600 list-disc pl-4 space-y-0.5">
                {currentTestData.tataCara.slice(0, 2).map((cara, idx) => (
                  <li key={idx}>{cara}</li>
                ))}
                {currentTestData.tataCara.length > 2 && <li>Dan seterusnya...</li>}
              </ul>
            </div>
            {currentTestData.videoUrl && (
              <div className="w-full sm:w-80 aspect-video shrink-0 bg-slate-900 rounded-lg overflow-hidden relative shadow-lg">
                <iframe
                  src={`${currentTestData.videoUrl}?rel=0`}
                  title={`Tutorial ${currentTestData.title}`}
                  className="w-full h-full object-cover"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}
          </div>

          {/* Two-Column Recording & Backup Grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            
            {/* Viewfinder Column */}
            <div className="md:col-span-3 space-y-4">
              <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">Umpan Kamera Video</span>
              
              <div className="relative aspect-video w-full overflow-hidden bg-slate-950 border border-slate-200 rounded-[12px] shadow-none flex items-center justify-center">
                
                {/* 1. Camera Permission Block Alert */}
                {cameraPermissionError && !currentTestState.hasVideo && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6 bg-white text-slate-800 z-10">
                    <div className="w-10 h-10 rounded-full border border-red-200 bg-red-50 flex items-center justify-center mb-3 text-red-500">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-red-600 uppercase tracking-wider mb-1">Izin Kamera Ditolak / Tidak Tersedia</p>
                    <p className="text-[10px] text-slate-500 max-w-[250px] leading-normal mb-3">
                      Izin kamera browser diblokir atau kamera tidak terdeteksi. Silakan berikan izin akses atau unggah tautan cadangan di sebelah kanan.
                    </p>
                  </div>
                )}

                {/* 2. Live Video Viewfinder */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover rounded-[12px] ${cameraActive && !currentTestState.hasVideo ? 'block' : 'hidden'}`}
                />

                {/* 3. Completed State Overlay / GDrive replacement */}
                {(currentTestState.hasVideo || isTimeUp) && (
                  <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center text-center p-6 z-10 border border-dashed border-slate-200 rounded-[12px]">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3 border border-emerald-100">
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {isTimeUp ? (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        ) : (
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        )}
                      </svg>
                    </div>
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
                      {isTimeUp ? 'Waktu Sesi Habis (00:00)' : 'Perekaman Selesai & Ditutup'}
                    </p>
                    <p className="text-[10px] text-slate-500 max-w-[240px] leading-normal">
                      {isTimeUp 
                        ? 'Sesi ditutup paksa untuk menghemat memori. Kamera dinonaktifkan.' 
                        : `Perekaman otomatis berhenti pada limit 20 detik untuk efisiensi penyimpanan.`}
                    </p>
                    <div className="mt-4 px-3 py-1 bg-white border border-slate-200 rounded text-[9px] font-mono text-slate-500">
                      Format: Semi-Hybrid Backup Aktif
                    </div>
                  </div>
                )}

                {/* 4. Connected but idle message */}
                {!cameraActive && !currentTestState.hasVideo && !cameraPermissionError && !isTimeUp && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
                    <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center mx-auto text-slate-500 mb-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kamera Siap</p>
                    <p className="text-[9px] text-slate-300">Tekan "Tes Sekarang" untuk memulai perekaman langsung.</p>
                  </div>
                )}

                {/* Active Recording UI Indicator */}
                {currentTestState.isRecording && (
                  <>
                    <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded border border-red-500/30">
                      <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
                      <span className="text-[8px] font-black text-white uppercase tracking-wider font-mono">REC</span>
                    </div>
                    <div className="absolute top-4 right-4 bg-black/60 px-2.5 py-1 rounded border border-slate-700 font-mono text-[9px] font-bold text-white">
                      00:{String(currentTestState.recordTime).padStart(2, '0')} / 00:{globalConfig.cameraLimit}
                    </div>
                  </>
                )}
              </div>

              {/* Viewfinder Action Buttons */}
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleLatihan}
                    disabled={isTimeUp || currentTestState.hasVideo || currentTestState.isRecording}
                    className="
                      flex-1 py-3 border border-slate-200 text-slate-600 rounded-md
                      text-xs font-bold uppercase tracking-wider
                      hover:bg-slate-50 transition-colors cursor-pointer active:scale-95 transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed
                    "
                  >
                    🤸 Latihan Tes
                  </button>

                  <button
                    type="button"
                    onClick={currentTestState.isRecording ? handleStopRekam : handleTesSekarang}
                    disabled={isTimeUp || currentTestState.hasVideo}
                    className={`
                      flex-1 py-3 rounded-md text-xs font-bold uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 transition-all
                      ${currentTestState.isRecording
                        ? 'bg-red-600 text-white hover:bg-red-700'
                        : (isTimeUp || currentTestState.hasVideo)
                          ? 'bg-slate-100 text-slate-300 border border-slate-200/60 cursor-not-allowed'
                          : 'bg-[#2563eb] text-white hover:bg-[#1d4ed8]'
                      }
                    `}
                  >
                    {currentTestState.isRecording ? '■ Hentikan Rekam' : '🎥 Tes Sekarang'}
                  </button>
                </div>

                {/* Ulangi? (Reset) Button */}
                {currentTestState.hasVideo && !isTimeUp && (
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="w-full py-2.5 bg-slate-50 text-slate-600 rounded border border-slate-200 text-xs font-bold uppercase tracking-wider hover:bg-slate-100 transition-colors cursor-pointer active:scale-95 transition-all"
                  >
                    🔄 Ulangi? (Rekam Ulang Pengujian)
                  </button>
                )}
              </div>
            </div>

            {/* Input Data Column */}
            <div className="md:col-span-2 space-y-6">
              {/* Score Input */}
              {activeTestId === 'hop' ? (
                <div className="flex gap-4">
                  <div className="space-y-1 flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Kaki Kanan ({currentTestData.unit}) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number" step="0.01"
                        placeholder="0"
                        value={currentTestState.scoreKanan}
                        onChange={(e) => handleStateChange('scoreKanan', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-8 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                      />
                      <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">{currentTestData.unit}</span>
                    </div>
                  </div>
                  <div className="space-y-1 flex-1">
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Kaki Kiri ({currentTestData.unit}) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="number" step="0.01"
                        placeholder="0"
                        value={currentTestState.scoreKiri}
                        onChange={(e) => handleStateChange('scoreKiri', e.target.value)}
                        className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-8 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                      />
                      <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">{currentTestData.unit}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Hasil Skor Tes ({currentTestData.unit}) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      placeholder={`Masukkan hasil ${currentTestData.unit}`}
                      value={currentTestState.score}
                      onChange={(e) => handleStateChange('score', e.target.value)}
                      className="w-full bg-transparent border-b border-slate-200 focus:border-[#2563eb] py-2 pr-12 text-sm text-[#0f172a] placeholder-slate-300 outline-none rounded-none transition-colors duration-200"
                    />
                    <span className="absolute right-0 bottom-2 text-slate-500 text-xs font-bold uppercase">
                      {currentTestData.unit}
                    </span>
                  </div>
                </div>
              )}

              {/* Hybrid Backup Link Input */}
              <div className="space-y-1 bg-slate-50/50 p-4 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-[10px] font-bold text-slate-800 uppercase tracking-wider">
                    Link Upload GDrive/YT
                  </label>
                  {(currentTestState.hasVideo || isTimeUp) ? (
                    <span className="text-[8px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Wajib (Backup)
                    </span>
                  ) : (
                    <span className="text-[8px] font-bold bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded uppercase tracking-wider">
                      Opsional / Tautan
                    </span>
                  )}
                </div>
                <p className="text-[9px] text-slate-500 leading-normal mb-3">
                  Anda bebas memilih: rekam video langsung menggunakan kamera di sebelah kiri, atau ketik tautan videonya di sini.
                </p>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... atau https://youtube.com/..."
                  value={currentTestState.link}
                  onChange={(e) => handleStateChange('link', e.target.value)}
                  className="
                    w-full py-2 bg-transparent text-xs text-[#0f172a] placeholder-slate-300 outline-none rounded-none
                    border-b border-slate-200 focus:border-[#2563eb] transition-colors duration-200
                  "
                />
              </div>

              {/* Simpan & Selesaikan (Manual Input Confirmation) */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if ((activeTestId === 'hop' && (!currentTestState.scoreKanan || !currentTestState.scoreKiri)) || (activeTestId !== 'hop' && (!currentTestState.score || (typeof currentTestState.score === 'string' && !currentTestState.score.trim())))) {
                      setToast({
                        message: 'Harap isi hasil skor pengujian secara manual terlebih dahulu.',
                        type: 'warning',
                        key: Date.now(),
                      });
                      return;
                    }
                    
                    stopCamera();
                    
                    setTestStatuses((prev) => ({
                      ...prev,
                      [activeTestId]: 'Selesai',
                    }));

                    setTestStates((prev) => ({
                      ...prev,
                      [activeTestId]: { ...prev[activeTestId], isRecording: false },
                    }));

                    setToast({
                      message: `Hasil skor ${testDetails[activeTestId].title} (${activeTestId === 'hop' ? `Kanan ${currentTestState.scoreKanan}, Kiri ${currentTestState.scoreKiri}` : currentTestState.score} ${testDetails[activeTestId].unit}) berhasil disimpan!`,
                      type: 'success',
                      key: Date.now(),
                    });

                    setViewState('select');
                  }}
                  className="
                    w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-md
                    font-bold text-xs uppercase tracking-wider transition-all duration-150 cursor-pointer active:scale-95 transition-all
                    flex items-center justify-center gap-2 shadow-sm
                  "
                >
                  💾 Simpan Hasil & Selesaikan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </ResearchPageLayout>
  );
}
