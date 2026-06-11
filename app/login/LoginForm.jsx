'use client';

import { useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { useAuth } from '@/context/AuthContext';
import Toast from '@/components/Toast';

/**
 * Sanitasi input: trim whitespace dan hapus karakter berbahaya dasar.
 */
function sanitizeInput(value) {
  return String(value).trim().replace(/[\x00-\x1F\x7F]/g, '');
}

const MOCK_RESEARCHERS = [
  { id: 'd3b07384-d113-49cd-a5d6-89d023b12345', name: 'Dr. Ahmad Fauzi', username: 'ahmad.fauzi', password: 'password123' },
  { id: 'a5b28345-e214-48cc-b6d7-98e134c56789', name: 'Dr. Siti Rahayu', username: 'siti.rahayu', password: 'password456' },
  { id: 'c7c39456-f325-49dd-c7e8-09f245d67890', name: 'Budi Santoso, M.Kes', username: 'budi.santoso', password: 'password789' }
];

/**
 * LoginForm — Komponen form login utama (Minimalist & Clean Redesign).
 */
export default function LoginForm() {
  const router = useRouter();
  const { login } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null); // { message, type }

  // Rate limiting: blokir submit selama cooldown setelah gagal
  const cooldownRef = useRef(false);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type, key: Date.now() });
  }, []);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLoading || cooldownRef.current) return;

    // --- Validasi Client-side ---
    const cleanUsername = sanitizeInput(username);
    const cleanPassword = sanitizeInput(password);

    if (!cleanUsername) {
      showToast('Username Peneliti tidak boleh kosong.', 'warning');
      return;
    }
    if (!cleanPassword) {
      showToast('Password tidak boleh kosong.', 'warning');
      return;
    }
    if (cleanUsername.length > 100 || cleanPassword.length > 255) {
      showToast('Input melebihi batas karakter yang diizinkan.', 'error');
      return;
    }

    setIsLoading(true);

    // --- Cek Kredensial ---
    try {
      // 1. Cek Local Storage (Akun yang ditambahkan di dashboard)
      let localResearchers = [];
      try {
        const stored = localStorage.getItem('com7_local_researchers');
        if (stored) localResearchers = JSON.parse(stored);
      } catch {}

      const matchedLocal = localResearchers.find(
        (r) => r.username === cleanUsername && r.password === cleanPassword
      );

      if (matchedLocal) {
        login({ id: matchedLocal.id, name: matchedLocal.name, username: matchedLocal.username });
        showToast(`Selamat datang, ${matchedLocal.name}! Mengalihkan...`, 'success');
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
        return;
      }

      const isConfigured = 
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('your-project-id');

      if (!isConfigured) {
        // --- Fallback Offline Mode: Supabase unconfigured ---
        const matched = MOCK_RESEARCHERS.find(
          (r) => r.username === cleanUsername && r.password === cleanPassword
        );

        if (matched) {
          login({ id: matched.id, name: matched.name, username: matched.username });
          showToast(`[Offline Mode] Selamat datang, ${matched.name}!`, 'success');
          setTimeout(() => {
            router.push('/admin');
          }, 1500);
        } else {
          showToast('Username atau Password salah. (Offline Fallback)', 'error');
          startCooldown();
        }
        return;
      }

      // --- Query ke Supabase ---
      const { data, error } = await supabase
        .from('researchers')
        .select('id, name, username, password')
        .eq('username', cleanUsername)
        .limit(1)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        showToast('Username atau Password salah. Periksa kembali.', 'error');
        startCooldown();
        return;
      }

      // --- Verifikasi Password ---
      const isPasswordValid = data.password === cleanPassword;

      if (!isPasswordValid) {
        showToast('Username atau Password salah. Periksa kembali.', 'error');
        startCooldown();
        return;
      }

      // --- Login Berhasil ---
      login({
        id: data.id,
        name: data.name,
        username: data.username,
      });

      showToast(`Selamat datang, ${data.name}! Mengalihkan...`, 'success');

      setTimeout(() => {
        router.push('/admin');
      }, 1500);

    } catch (err) {
      console.warn('[Login] Supabase error, falling back to local verification:', err.message || err);
      
      // --- Fallback Offline Mode: Network Error (Failed to fetch) ---
      const matched = MOCK_RESEARCHERS.find(
        (r) => r.username === cleanUsername && r.password === cleanPassword
      );

      if (matched) {
        login({ id: matched.id, name: matched.name, username: matched.username });
        showToast(`[Offline Mode] Selamat datang, ${matched.name}!`, 'success');
        setTimeout(() => {
          router.push('/admin');
        }, 1500);
      } else {
        showToast('Username atau Password salah.', 'error');
        startCooldown();
      }
    } finally {
      setIsLoading(false);
    }
  };

  function startCooldown(ms = 3000) {
    cooldownRef.current = true;
    setTimeout(() => {
      cooldownRef.current = false;
    }, ms);
  }

  const isDisabled = isLoading || cooldownRef.current;

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={dismissToast}
        />
      )}

      {/* Centered Login Card */}
      <div className="w-full glass-panel shadow-premium border border-[#e2e8f0]/80 rounded-2xl p-8 md:p-10 relative z-10">
        
        {/* Elegant UNIMUS Medical Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 mb-3 text-slate-800 flex items-center justify-center">
            {/* SVG Logo representing UNIMUS Medical emblem & shield */}
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-10 h-10"
            >
              {/* External shield lines */}
              <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" />
              {/* Medical cross intersecting elegant lines */}
              <path d="M12 7V17" />
              <path d="M7 12H17" />
              {/* Inner accent ring */}
              <circle cx="12" cy="12" r="3" className="stroke-slate-300" strokeWidth="1" />
            </svg>
          </div>

          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            COM 7 Kedokteran
          </h1>
          <p className="text-[10px] text-slate-400 font-semibold tracking-widest uppercase mt-0.5">
            UNIMUS Research Portal
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          
          {/* Username Field */}
          <div className="space-y-1">
            <label
              htmlFor="login-username"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Username Peneliti
            </label>
            <input
              id="login-username"
              type="text"
              autoComplete="username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              maxLength={100}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isDisabled}
              placeholder="Masukkan username peneliti"
              className="
                w-full py-2 bg-transparent text-sm text-[#0f172a] placeholder-slate-300
                border-b border-slate-200 outline-none rounded-none
                focus:border-[#2563eb] transition-colors duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
              "
            />
          </div>

          {/* Password Field */}
          <div className="space-y-1">
            <label
              htmlFor="login-password"
              className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                maxLength={255}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isDisabled}
                placeholder="Masukkan password"
                className="
                  w-full py-2 pr-10 bg-transparent text-sm text-[#0f172a] placeholder-slate-300
                  border-b border-slate-200 outline-none rounded-none
                  focus:border-[#2563eb] transition-colors duration-200
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              />
              {/* Toggle show/hide password */}
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
                aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 transition-colors duration-200 cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="login-submit-btn"
            type="submit"
            disabled={isDisabled}
            className="
              w-full py-3 bg-slate-900 text-white rounded-lg
              font-bold text-xs tracking-wider uppercase hover-lift shadow-md
              hover:bg-slate-800 active:bg-slate-950
              disabled:opacity-60 disabled:shadow-none disabled:transform-none disabled:cursor-not-allowed
              transition-all duration-200 cursor-pointer
              flex items-center justify-center gap-2
              mt-6
            "
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Memverifikasi...
              </>
            ) : (
              <>
                Masuk ke Portal Peneliti
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* Separator line */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-slate-100"></div>
          </div>
          <div className="relative flex justify-center text-[9px] font-black uppercase tracking-widest leading-none">
            <span className="bg-white px-3 text-slate-400">Atau Akses Atlet</span>
          </div>
        </div>

        {/* Premium Subject/Athlete Entry Card */}
        <div className="bg-[#2563eb]/5 border border-[#2563eb]/10 rounded-lg p-5 text-center space-y-3.5">
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">Portal Naracoba / Atlet</h3>
            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
              Apakah Anda partisipan atlet yang akan diteliti? Mulai asesmen burnout (ABQ) & pengujian fisik di sini.
            </p>
          </div>
          <button
            onClick={() => router.push('/informed-consent')}
            className="
              w-full py-2.5 bg-gradient-to-r from-[#2563eb] to-[#0ea5e9] hover:from-[#1d4ed8] hover:to-[#0284c7] text-white rounded-lg font-bold text-[9px] uppercase tracking-wider hover-lift
              transition-all duration-200 cursor-pointer shadow-md flex items-center justify-center gap-1.5
            "
          >
            🧪 Mulai Pengujian Atlet
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </button>
        </div>

        {/* Small minimalist notice */}
        <p className="mt-8 text-center text-[10px] text-slate-400 tracking-wide">
          Gunakan kredensial resmi peneliti medis COM 7 UNIMUS.
        </p>
      </div>
    </>
  );
}

