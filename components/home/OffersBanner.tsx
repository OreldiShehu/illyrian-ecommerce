interface Props {
  count: number
}

export default function OffersBanner({ count }: Props) {
  return (
    <div className="offers-banner">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
      <span>
        {count > 0
          ? `${count} dyqane kanë oferta aktive sot`
          : 'Exploroni dyqanet tona'}
      </span>
      {count > 0 && (
        <div className="offers-dots">
          {Array.from({ length: Math.min(count, 5) }).map((_, i) => (
            <span key={i} className={`dot${i < Math.min(count, 3) ? ' active' : ''}`} />
          ))}
        </div>
      )}
    </div>
  )
}
