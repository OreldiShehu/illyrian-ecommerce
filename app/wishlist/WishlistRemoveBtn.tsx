'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { removeFromWishlist } from '@/app/actions/wishlist'

export default function WishlistRemoveBtn({ wishlistId }: { wishlistId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRemove = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setLoading(true)
    await removeFromWishlist(wishlistId)
    router.refresh()
  }

  return (
    <button
      onClick={handleRemove}
      disabled={loading}
      title="Remove from wishlist"
      style={{
        position: 'absolute',
        top: 8,
        right: 8,
        width: 30,
        height: 30,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.9)',
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ef4444',
        backdropFilter: 'blur(4px)',
        zIndex: 2,
        opacity: loading ? 0.5 : 1,
      }}
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  )
}
