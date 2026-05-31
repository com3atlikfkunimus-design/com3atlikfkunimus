import LoginForm from './LoginForm';

export const metadata = {
  title: 'Login Peneliti — COM 7 Kedokteran UNIMUS',
  description: 'Portal login untuk peneliti COM 7 Kedokteran Universitas Muhammadiyah Semarang.',
};

/**
 * Halaman Login — Route: /login
 *
 * Server Component (layout) yang membungkus Client Component LoginForm.
 * Desain: Minimalist & Clean (White background, Slate text).
 */
export default function LoginPage() {
  return (
    <main
      id="login-page"
      className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden bg-white px-4 py-12 text-slate-800"
    >
      {/* Centered Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <LoginForm />
      </div>

      {/* Minimalist Footer Branding */}
      <footer className="relative z-10 mt-8 text-center">
        <p className="text-xs text-slate-400 tracking-wider">
          © {new Date().getFullYear()} COM 7 Kedokteran UNIMUS · Research Portal
        </p>
      </footer>
    </main>
  );
}

