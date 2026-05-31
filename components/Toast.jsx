'use client';

import { useEffect, useState } from 'react';

/**
 * Komponen Toast Notification kustom.
 * Mendukung tiga varian: 'success', 'error', 'warning'.
 * Muncul di pojok kanan atas dengan animasi slide-in dari kanan.
 * Otomatis menghilang setelah `duration` ms.
 *
 * Props:
 *   - message   : string — teks notifikasi
 *   - type      : 'success' | 'error' | 'warning'
 *   - onClose   : function — callback saat toast ditutup
 *   - duration  : number (default: 4000ms)
 */
export default function Toast({ message, type = 'success', onClose, duration = 4000 }) {
  const [visible, setVisible] = useState(false);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Trigger masuk
    const enterTimer = setTimeout(() => setVisible(true), 10);

    // Trigger keluar
    const exitTimer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose?.(), 400); // beri waktu animasi keluar
    }, duration);

    return () => {
      clearTimeout(enterTimer);
      clearTimeout(exitTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose?.(), 400);
  };

  const config = {
    success: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      borderColor: 'border-lime-400',
      iconColor: 'text-lime-400',
      bgGlow: 'shadow-lime-500/20',
      label: 'Berhasil',
    },
    error: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      ),
      borderColor: 'border-red-500',
      iconColor: 'text-red-400',
      bgGlow: 'shadow-red-500/20',
      label: 'Gagal',
    },
    warning: {
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
        </svg>
      ),
      borderColor: 'border-yellow-400',
      iconColor: 'text-yellow-400',
      bgGlow: 'shadow-yellow-500/20',
      label: 'Peringatan',
    },
  };

  const { icon, borderColor, iconColor, bgGlow, label } = config[type] ?? config.success;

  return (
    <div
      role="alert"
      aria-live="assertive"
      aria-label={`Notifikasi ${label}`}
      className={`
        fixed top-5 right-5 z-50 flex items-start gap-3 
        min-w-[300px] max-w-[420px] p-4
        bg-slate-800/95 backdrop-blur-sm border-l-4 ${borderColor}
        rounded-lg shadow-2xl ${bgGlow}
        transition-all duration-400 ease-out
        ${visible && !exiting
          ? 'opacity-100 translate-x-0'
          : 'opacity-0 translate-x-full'
        }
      `}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 mt-0.5 ${iconColor}`}>
        {icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className={`text-xs font-semibold uppercase tracking-wider mb-0.5 ${iconColor}`}>
          {label}
        </p>
        <p className="text-sm text-slate-200 leading-relaxed break-words">
          {message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={handleClose}
        aria-label="Tutup notifikasi"
        className="flex-shrink-0 ml-1 text-slate-500 hover:text-slate-300 transition-colors duration-200 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
