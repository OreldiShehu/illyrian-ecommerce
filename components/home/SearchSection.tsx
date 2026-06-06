'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function SearchSection() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) {
      router.push(`/stores?q=${encodeURIComponent(query.trim())}`)
    }
  }

  return (
    <div className="search-section">
      <form className="search-wrap" onSubmit={handleSearch}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Kërko dyqane, produkte, kategori…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </form>
    </div>
  )
}
