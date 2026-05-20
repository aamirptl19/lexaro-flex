'use client'

import { useEffect, useState } from 'react'
import { readShortlistIds, toggleShortlistId } from '@/lib/shortlist'

interface Props {
  candidateId: string
}

/**
 * Standalone save/unsave button for the candidate detail page.
 * Manages its own localStorage state — safe to use without a parent grid.
 *
 * Renders a neutral placeholder until mounted to avoid hydration mismatches
 * (localStorage is not available during SSR).
 */
export default function SaveButton({ candidateId }: Props) {
  const [saved, setSaved] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setSaved(readShortlistIds().includes(candidateId))
    setMounted(true)
  }, [candidateId])

  function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    const next = toggleShortlistId(candidateId)
    setSaved(next.includes(candidateId))
  }

  // Render a fixed-size placeholder while not yet mounted so layout doesn't shift
  if (!mounted) {
    return (
      <div className="h-9 w-[88px] rounded-lg border border-slate-200 bg-white" aria-hidden />
    )
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from shortlist' : 'Add to shortlist'}
      className={`inline-flex h-9 items-center gap-1.5 rounded-lg border px-3.5 text-xs font-semibold transition-colors ${
        saved
          ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:border-indigo-300 hover:bg-indigo-100'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
      }`}
    >
      <BookmarkIcon filled={saved} />
      {saved ? 'Saved' : 'Save'}
    </button>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg className="h-3.5 w-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14a1 1 0 0 1 1 1v17.414a.5.5 0 0 1-.854.353L12 14.707l-7.146 7.06A.5.5 0 0 1 4 21.414V4a1 1 0 0 1 1-1z" />
    </svg>
  ) : (
    <svg
      className="h-3.5 w-3.5"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3h14a1 1 0 0 1 1 1v17.414a.5.5 0 0 1-.854.353L12 14.707l-7.146 7.06A.5.5 0 0 1 4 21.414V4a1 1 0 0 1 1-1z"
      />
    </svg>
  )
}
