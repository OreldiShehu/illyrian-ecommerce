'use client'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#232F3E', color: '#fff', textAlign: 'center', padding: '0 24px',
    }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>📶</div>
      <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 900, letterSpacing: '0.1em', marginBottom: 12 }}>
        JE OFFLINE
      </h1>
      <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7, maxWidth: 320, marginBottom: 32 }}>
        Nuk ke lidhje interneti. Kontrollo lidhjen tënde dhe provo përsëri.
      </p>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '12px 28px', background: '#fff', color: '#232F3E',
          border: 'none', borderRadius: 8, cursor: 'pointer',
          fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 800, letterSpacing: '0.12em',
        }}
      >
        PROVO PËRSËRI
      </button>
    </div>
  )
}
