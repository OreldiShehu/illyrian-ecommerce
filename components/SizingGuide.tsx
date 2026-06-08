'use client'

import { useState } from 'react'

const SIZE_ROWS = [
  { size: 'XS', eu: '32–34', us: '0–2',   uk: '4–6',   chest: '80–84', waist: '60–64' },
  { size: 'S',  eu: '36–38', us: '4–6',   uk: '8–10',  chest: '84–88', waist: '64–68' },
  { size: 'M',  eu: '40–42', us: '8–10',  uk: '12–14', chest: '88–92', waist: '68–72' },
  { size: 'L',  eu: '44–46', us: '12–14', uk: '16–18', chest: '92–96', waist: '72–76' },
  { size: 'XL', eu: '48–50', us: '16–18', uk: '20–22', chest: '96–102', waist: '76–82' },
  { size: 'XXL', eu: '52–54', us: '20–22', uk: '24–26', chest: '102–108', waist: '82–88' },
]

export default function SizingGuide({ label }: { label?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button onClick={() => setOpen(true)} className="sizing-guide-btn">
        📏 {label ?? 'Size Guide'}
      </button>

      {open && (
        <div className="modal-overlay" onClick={() => setOpen(false)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>SIZING GUIDE</h2>
              <button onClick={() => setOpen(false)} aria-label="Close">✕</button>
            </div>

            <div style={{ padding: '0 24px 24px' }}>
              <p style={{ fontSize: 12, color: 'var(--gray-dark)', lineHeight: 1.6, margin: '16px 0', fontStyle: 'italic' }}>
                Measurements are in centimeters. For the best fit, measure yourself and compare to the chart below.
              </p>

              <div style={{ overflowX: 'auto' }}>
                <table className="size-table">
                  <thead>
                    <tr>
                      <th>Size</th>
                      <th>EU</th>
                      <th>US</th>
                      <th>UK</th>
                      <th>Chest (cm)</th>
                      <th>Waist (cm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {SIZE_ROWS.map((row) => (
                      <tr key={row.size}>
                        <td style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 13, color: 'var(--black)' }}>{row.size}</td>
                        <td>{row.eu}</td>
                        <td>{row.us}</td>
                        <td>{row.uk}</td>
                        <td>{row.chest}</td>
                        <td>{row.waist}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div style={{ marginTop: 20, padding: '16px', background: 'var(--off-white)', borderRadius: 8 }}>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--gray-mid)', marginBottom: 8 }}>HOW TO MEASURE</p>
                <ul style={{ fontSize: 12, color: 'var(--gray-dark)', lineHeight: 1.8, paddingLeft: 16 }}>
                  <li><strong>Chest:</strong> Measure around the fullest part of your chest</li>
                  <li><strong>Waist:</strong> Measure around your natural waistline</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
