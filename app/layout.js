import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { StudyProvider } from '@/context/StudyContext';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata = {
  title: 'COM 7 Kedokteran UNIMUS — Research Portal',
  description: 'Portal penelitian COM 7 Kedokteran Universitas Muhammadiyah Semarang.',
};

/**
 * Root Layout — Hierarki Provider:
 *   AuthProvider  → menyediakan data peneliti yang login
 *     StudyProvider → menyediakan data sesi pendaftaran naracoba
 *       {children}
 *
 * StudyProvider di dalam AuthProvider karena ia menggunakan useAuth() secara internal.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="id" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-slate-900 text-white" suppressHydrationWarning>
        <AuthProvider>
          <StudyProvider>
            {children}
          </StudyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
