'use client';

/**
 * ResearchPageLayout — Shared layout wrapper untuk semua halaman alur penelitian.
 * Menyediakan: dark background atau light minimalist theme.
 *
 * Props:
 *   - children       : konten halaman
 *   - researcher     : { name, username } objek peneliti aktif
 *   - onLogout       : fungsi logout
 *   - title          : judul section (optional, ditampilkan di nav)
 *   - lightTheme     : boolean, jika true maka render tema putih minimalis
 */
export default function ResearchPageLayout({ children, researcher, onLogout, title, lightTheme = false, wide = false }) {
  if (lightTheme) {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-800 relative overflow-hidden font-sans">
        {/* Ambient light glow */}
        <div
          className="absolute -top-32 -right-32 w-[30rem] h-[30rem] rounded-full opacity-40 blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #e0f2fe 0%, transparent 70%)' }}
          aria-hidden="true"
        />
        <div
          className="absolute top-1/3 -left-32 w-96 h-96 rounded-full opacity-30 blur-[80px] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #f0fdf4 0%, transparent 70%)' }}
          aria-hidden="true"
        />

        {/* Premium Glass Navigation Bar */}
        <nav className="relative z-40 glass-panel border-b border-white/50 sticky top-0 transition-all shadow-sm">
          <div className={`${wide ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-6 py-4 flex items-center justify-between`}>
            {/* Branding */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-white bg-slate-900"
              >
                7
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 leading-none">COM 7 UNIMUS</p>
                {title && (
                  <p className="text-[9px] text-slate-400 leading-none mt-0.5">{title}</p>
                )}
              </div>
            </div>

            {/* Researcher info + logout */}
            {researcher && (
              <div className="flex items-center gap-3">
                <div className="hidden sm:block text-right">
                  <p className="text-xs font-bold text-slate-800 leading-none">{researcher.name}</p>
                  <p className="text-[9px] text-slate-400 leading-none mt-0.5">@{researcher.username}</p>
                </div>
                <div className="w-px h-5 bg-slate-200" />
                <button
                  onClick={onLogout}
                  id="nav-logout-btn"
                  title="Logout"
                  className="text-slate-400 hover:text-red-500 transition-colors duration-200 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </nav>

        {/* Main Content */}
        <main className={`relative z-10 ${wide ? 'max-w-6xl' : 'max-w-3xl'} mx-auto px-6 py-10`}>
          {children}
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f172a 0%, #0c1829 100%)' }}
    >
      {/* Grid background */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(#a3e635 1px, transparent 1px),
            linear-gradient(90deg, #a3e635 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
        aria-hidden="true"
      />

      {/* Ambient top-left glow */}
      <div
        className="absolute -top-32 -left-32 w-72 h-72 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #a3e635 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Ambient bottom-right glow */}
      <div
        className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full opacity-[0.06] blur-3xl pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Top Navigation Bar */}
      <nav className="relative z-10 border-b border-slate-800/60 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          {/* Branding */}
          <div className="flex items-center gap-2.5">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-slate-900"
              style={{ background: 'linear-gradient(135deg, #a3e635, #84cc16)' }}
            >
              7
            </div>
            <div>
              <p className="text-xs font-bold text-white leading-none">COM 7 UNIMUS</p>
              {title && (
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">{title}</p>
              )}
            </div>
          </div>

          {/* Researcher info + logout */}
          {researcher && (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-medium text-white leading-none">{researcher.name}</p>
                <p className="text-[10px] text-slate-500 leading-none mt-0.5">@{researcher.username}</p>
              </div>
              <div className="w-px h-6 bg-slate-700" />
              <button
                onClick={onLogout}
                id="nav-logout-btn"
                title="Logout"
                className="text-slate-500 hover:text-red-400 transition-colors duration-200 cursor-pointer"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

