'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { readShortlistIds } from '@/lib/shortlist'

const PRACTICE_AREAS = [
  'Conveyancing',
  'Family',
  'Employment',
  'Personal Injury',
  'Wills & Probate',
  'Criminal',
  'Immigration',
  'Civil Litigation',
  'Commercial',
  'Housing',
  'Debt & Insolvency',
  'Other',
]

const AVAILABILITY_OPTIONS = [
  'Immediately available',
  'Available within 1 week',
  'Available within 2 weeks',
  'Available within 1 month',
  'Flexible / project-based',
]

const PQE_OPTIONS = [
  { label: 'Any PQE', value: '' },
  { label: '1+ years', value: '1' },
  { label: '3+ years', value: '3' },
  { label: '5+ years', value: '5' },
  { label: '7+ years', value: '7' },
  { label: '10+ years', value: '10' },
]

const RATE_OPTIONS = [
  { label: 'Any rate', value: '' },
  { label: 'Up to £50/hr', value: '50' },
  { label: 'Up to £75/hr', value: '75' },
  { label: 'Up to £100/hr', value: '100' },
  { label: 'Up to £150/hr', value: '150' },
  { label: 'Up to £200/hr', value: '200' },
]

const baseSelectClass =
  'h-9 rounded-lg border px-3 text-xs font-medium focus:outline-none focus:ring-2 cursor-pointer transition-colors'

const idleSelectClass =
  `${baseSelectClass} border-slate-200 bg-white text-slate-600 focus:border-slate-300 focus:ring-slate-100`

const activeSelectClass =
  `${baseSelectClass} border-indigo-200 bg-indigo-50 text-indigo-700 focus:border-indigo-300 focus:ring-indigo-100`

function selectClass(active: boolean) {
  return active ? activeSelectClass : idleSelectClass
}

export default function CandidateFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const debounceRef = useRef<ReturnType<typeof setTimeout>>()

  const [keyword, setKeyword] = useState(searchParams.get('q') ?? '')
  // Shortlist count — read from localStorage after mount only
  const [shortlistCount, setShortlistCount] = useState(0)

  useEffect(() => {
    setShortlistCount(readShortlistIds().length)
  }, [])

  const isShortlistedOnly = searchParams.get('shortlisted') === '1'

  const hasActive = ['q', 'area', 'availability', 'pqe', 'rate', 'shortlisted'].some(
    (k) => !!searchParams.get(k)
  )

  function setParam(key: string, value: string) {
    const params = new URLSearchParams(window.location.search)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.push(`/preview/candidates?${params.toString()}`)
  }

  function toggleShortlisted() {
    const params = new URLSearchParams(window.location.search)
    if (isShortlistedOnly) {
      params.delete('shortlisted')
    } else {
      params.set('shortlisted', '1')
      // Re-read count so badge is fresh when activating the filter
      setShortlistCount(readShortlistIds().length)
    }
    router.push(`/preview/candidates?${params.toString()}`)
  }

  function handleKeyword(value: string) {
    setKeyword(value)
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(window.location.search)
      if (value.trim()) {
        params.set('q', value.trim())
      } else {
        params.delete('q')
      }
      router.push(`/preview/candidates?${params.toString()}`)
    }, 400)
  }

  function clearAll() {
    setKeyword('')
    clearTimeout(debounceRef.current)
    router.push('/preview/candidates')
  }

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      {/* Row 1 — search + dropdowns */}
      <div className="flex flex-wrap items-center gap-2 p-3">

        {/* Keyword search */}
        <div className="relative min-w-[200px] flex-1">
          <svg
            className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <input
            type="search"
            placeholder="Search summaries, skills, experience…"
            value={keyword}
            onChange={(e) => handleKeyword(e.target.value)}
            className={`h-9 w-full rounded-lg border pl-9 pr-3 text-xs text-slate-700 placeholder-slate-400 transition-colors focus:outline-none focus:ring-2 ${
              keyword
                ? 'border-indigo-200 bg-indigo-50 focus:border-indigo-300 focus:ring-indigo-100'
                : 'border-slate-200 bg-white focus:border-slate-300 focus:ring-slate-100'
            }`}
          />
        </div>

        {/* Divider */}
        <div className="hidden h-5 w-px bg-slate-200 sm:block" />

        {/* Practice area */}
        <select
          value={searchParams.get('area') ?? ''}
          onChange={(e) => setParam('area', e.target.value)}
          className={selectClass(!!searchParams.get('area'))}
          aria-label="Filter by practice area"
        >
          <option value="">All areas</option>
          {PRACTICE_AREAS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Availability */}
        <select
          value={searchParams.get('availability') ?? ''}
          onChange={(e) => setParam('availability', e.target.value)}
          className={selectClass(!!searchParams.get('availability'))}
          aria-label="Filter by availability"
        >
          <option value="">Any availability</option>
          {AVAILABILITY_OPTIONS.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>

        {/* Min PQE */}
        <select
          value={searchParams.get('pqe') ?? ''}
          onChange={(e) => setParam('pqe', e.target.value)}
          className={selectClass(!!searchParams.get('pqe'))}
          aria-label="Filter by minimum PQE"
        >
          {PQE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Max rate */}
        <select
          value={searchParams.get('rate') ?? ''}
          onChange={(e) => setParam('rate', e.target.value)}
          className={selectClass(!!searchParams.get('rate'))}
          aria-label="Filter by maximum hourly rate"
        >
          {RATE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Clear all */}
        {hasActive && (
          <>
            <div className="hidden h-5 w-px bg-slate-200 sm:block" />
            <button
              onClick={clearAll}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 px-3 text-xs font-medium text-slate-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          </>
        )}
      </div>

      {/* Row 2 — shortlist toggle */}
      <div className="flex items-center gap-3 border-t border-slate-100 px-3 py-2">
        <button
          onClick={toggleShortlisted}
          className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
            isShortlistedOnly
              ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
              : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:text-slate-800'
          }`}
        >
          {/* Bookmark icon */}
          {isShortlistedOnly ? (
            <svg className="h-3.5 w-3.5 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3h14a1 1 0 0 1 1 1v17.414a.5.5 0 0 1-.854.353L12 14.707l-7.146 7.06A.5.5 0 0 1 4 21.414V4a1 1 0 0 1 1-1z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 3h14a1 1 0 0 1 1 1v17.414a.5.5 0 0 1-.854.353L12 14.707l-7.146 7.06A.5.5 0 0 1 4 21.414V4a1 1 0 0 1 1-1z"
              />
            </svg>
          )}
          Shortlisted only
          {shortlistCount > 0 && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums leading-none ${
                isShortlistedOnly
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {shortlistCount}
            </span>
          )}
        </button>
        <span className="text-[11px] text-slate-400">
          {isShortlistedOnly
            ? 'Showing shortlisted candidates only'
            : 'Showing all candidates'}
        </span>
      </div>
    </div>
  )
}
