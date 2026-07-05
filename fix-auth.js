const fs = require('fs');

// 1. Fix AuthContext.jsx
let authFile = 'context/AuthContext.jsx';
let authContent = fs.readFileSync(authFile, 'utf8');

// Add auto-logout logic
if (!authContent.includes('const SESSION_TIMEOUT_MS = 60 * 60 * 1000;')) { // 60 minutes
  const importRepl = `import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';`;

  authContent = authContent.replace(`import { createContext, useContext, useState, useEffect } from 'react';`, importRepl);

  const authProviderStart = `export function AuthProvider({ children }) {
  const [researcher, setResearcher] = useState(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  
  const SESSION_TIMEOUT_MS = 60 * 60 * 1000; // 60 menit timeout`;

  authContent = authContent.replace(`export function AuthProvider({ children }) {\n  const [researcher, setResearcher] = useState(null);\n  const [isHydrated, setIsHydrated] = useState(false);`, authProviderStart);

  const loginRepl = `function login(researcherData) {
    const sanitized = {
      id: String(researcherData.id),
      name: String(researcherData.name),
      username: String(researcherData.username),
      loginAt: Date.now(),
      lastActive: Date.now()
    };
    setResearcher(sanitized);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
  }`;
  
  authContent = authContent.replace(/function login\(researcherData\) \{[\s\S]*?localStorage\.setItem\(LOCAL_STORAGE_KEY, JSON\.stringify\(sanitized\)\);\n  \}/, loginRepl);
  
  const logoutRepl = `const logout = useCallback(() => {
    setResearcher(null);
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    router.push('/login');
  }, [router]);`;
  
  authContent = authContent.replace(/function logout\(\) \{\n    setResearcher\(null\);\n    localStorage\.removeItem\(LOCAL_STORAGE_KEY\);\n  \}/, logoutRepl);

  const timeoutEffect = `
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
  `;
  
  authContent = authContent.replace('return (', timeoutEffect + '\n  return (');
}

fs.writeFileSync(authFile, authContent, 'utf8');

// 2. Fix admin/page.jsx protection
let adminFile = 'app/admin/page.jsx';
let adminContent = fs.readFileSync(adminFile, 'utf8');

if (!adminContent.includes('// PROTECT ROUTE')) {
  const protectEffect = `  // PROTECT ROUTE
  useEffect(() => {
    if (isHydrated && !researcher) {
      router.replace('/login');
    }
  }, [isHydrated, researcher, router]);

  if (!isHydrated || !researcher) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div></div>;
  }
`;

  // Find the exact place to inject the redirect
  const searchPattern = `const { researcher, isHydrated, logout } = useAuth();`;
  if (adminContent.includes(searchPattern)) {
    adminContent = adminContent.replace(searchPattern, searchPattern + '\n\n' + protectEffect);
  }
}

fs.writeFileSync(adminFile, adminContent, 'utf8');

console.log("Added protection and auto-logout successfully");
