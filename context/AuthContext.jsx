'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

/**
 * AuthContext — Global state untuk peneliti yang sedang login.
 *
 * Data yang disimpan:
 *   - id       : UUID peneliti dari Supabase
 *   - name     : Nama lengkap peneliti
 *   - username : Username peneliti
 *
 * Data dipersist ke localStorage agar tetap ada setelah refresh halaman.
 * Saat logout, localStorage dibersihkan.
 */

const AuthContext = createContext(null);

const LOCAL_STORAGE_KEY = 'com7_active_researcher';

export function AuthProvider({ children }) {
  const [researcher, setResearcher] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 menit timeout

  // Hydrate dari localStorage saat pertama mount (client-side only)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validasi minimal: pastikan data memiliki struktur yang benar
        if (parsed?.id && parsed?.name && parsed?.username) {
          setResearcher(parsed);
        }
      }
    } catch {
      // Data korup — hapus
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  /**
   * Login: simpan info peneliti ke state dan localStorage.
   * @param {{ id: string, name: string, username: string }} researcherData
   */
  function login(researcherData) {
    const sanitized = {
      id: String(researcherData.id),
      name: String(researcherData.name),
      username: String(researcherData.username),
      loginAt: Date.now(),
      lastActive: Date.now()
    };
    setResearcher(sanitized);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
  }

  /**
   * Logout: hapus state dan localStorage.
   */
  const logout = useCallback(() => {
    setResearcher(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    router.push('/login');
  }, [router]);

  
  // Auto-logout effect & Activity tracker
  useEffect(() => {
    if (!isHydrated || !researcher) return;

    const checkSession = () => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          const now = Date.now();
          if (now - parsed.lastActive > SESSION_TIMEOUT_MS) {
            logout();
          }
        }
      } catch (e) {}
    };

    const updateActivity = () => {
      try {
        const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          parsed.lastActive = Date.now();
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(parsed));
          setResearcher(parsed);
        }
      } catch (e) {}
    };

    // Check interval
    const interval = setInterval(checkSession, 60000); // Tiap 1 menit
    
    // Update on click/key
    window.addEventListener('click', updateActivity);
    window.addEventListener('keydown', updateActivity);
    
    // Also update on pathname change
    updateActivity();

    return () => {
      clearInterval(interval);
      window.removeEventListener('click', updateActivity);
      window.removeEventListener('keydown', updateActivity);
    };
  }, [isHydrated, researcher?.id, pathname, logout]);
  
  return (
    <AuthContext.Provider value={{ researcher, login, logout, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook untuk mengakses AuthContext.
 * Harus digunakan di dalam AuthProvider.
 */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth harus digunakan di dalam <AuthProvider>');
  }
  return ctx;
}
