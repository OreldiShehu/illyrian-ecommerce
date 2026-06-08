import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#232F3E',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span
          style={{
            color: '#ffffff',
            fontSize: 300,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: '-10px',
          }}
        >
          M
        </span>
        <span
          style={{
            color: 'rgba(255,255,255,0.6)',
            fontSize: 60,
            fontWeight: 700,
            letterSpacing: '20px',
            marginTop: 8,
          }}
        >
          MIO
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
