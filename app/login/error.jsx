'use client';

export default function LoginError({ error, reset }) {
  return (
    <div style={{ padding: '2rem', background: '#0f172a', color: '#f1f5f9', minHeight: '100vh' }}>
      <h2 style={{ color: '#f87171' }}>Error on Login Page</h2>
      <pre style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', overflow: 'auto', color: '#fbbf24', fontSize: '12px' }}>
        {error?.message}
        {'\n'}
        {error?.stack}
      </pre>
      <button onClick={reset} style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#a3e635', color: '#000', borderRadius: '8px', border: 'none', cursor: 'pointer' }}>
        Retry
      </button>
    </div>
  );
}
