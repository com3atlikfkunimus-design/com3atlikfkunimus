'use client';

import { createContext, useContext, useState, useEffect } from 'react';

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
    };
    setResearcher(sanitized);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
  }

  /**
   * Logout: hapus state dan localStorage.
   */
  function logout() {
    setResearcher(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }

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
