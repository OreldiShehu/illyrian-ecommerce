import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

export default function AppleIcon() {
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
          borderRadius: '36px',
        }}
      >
        <span style={{ color: '#fff', fontSize: 100, fontWeight: 900, lineHeight: 1, letterSpacing: '-3px' }}>
          M
        </span>
        <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 20, fontWeight: 700, letterSpacing: '7px', marginTop: 2 }}>
          MIO
        </span>
      </div>
    ),
    { ...size }
  )
}
