'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { readShortlistIds, writeShortlistIds } from '@/lib/shortlist'

// Mirrors the non-PII type from the list page — only safe fields.
type PreviewCandidate = {
  id: string
  created_at: string
  practice_area: string
  pqe_years: number
  availability: string
  hourly_rate_gbp: number
  case_mgmt_systems: string[]
  matter_experience: string
  ai_summary: string | null
  ai_extracted_skills: string[] | null
  status: string
}

interface Props {
  candidates: PreviewCandidate[]
  /** Derived from the `?shortlisted=1` URL param on the server side. */
  showShortlistedOnly: boolean
}

const STATUS_STYLES: Record<string, string> = {
  pending_review: 'bg-amber-50 text-amber-700 border-amber-200',
  approved:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  rejected:       'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABELS: Record<string, string> = {
  pending_review: 'Pending review',
  approved:       'Approved',
  rejected:       'Rejected',
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function CandidateGrid({ candidates, showShortlistedOnly }: Props) {
  // Shortlist state — empty until hydrated from localStorage
  const [ids, setIds] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setIds(readShortlistIds())
    setMounted(true)
  }, [])

  function toggle(candidateId: string) {
    setIds((prev) => {
      const next = prev.includes(candidateId)
        ? prev.filter((x) => x !== candidateId)
        : [...prev, candidateId]
      writeShortlistIds(next)
      return next
    })
  }

  // Only apply shortlist filter once mounted (avoids false empty-state flash on SSR)
  const displayed =
    showShortlistedOnly && mounted
      ? candidates.filter((c) => ids.includes(c.id))
      : candidates

  if (displayed.length === 0 && showShortlistedOnly && mounted) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-24 text-center shadow-sm">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl shadow-sm">
          🔖
        </div>
        <p className="text-sm font-semibold text-slate-700">No shortlisted candidates</p>
        <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-400">
          Save candidates using the bookmark button on any card, then come back here.
        </p>
        <Link
          href="/preview/candidates"
          className="mt-5 inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
        >
          View all candidates
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      {displayed.map((c) => (
        <CandidateCard
          key={c.id}
          candidate={c}
          isSaved={mounted && ids.includes(c.id)}
          onToggle={() => toggle(c.id)}
        />
      ))}
    </div>
  )
}

// ── Card ──────────────────────────────────────────────────────────────────────

function CandidateCard({
  candidate: c,
  isSaved,
  onToggle,
}: {
  candidate: PreviewCandidate
  isSaved: boolean
  onToggle: () => void
}) {
  const statusStyle = STATUS_STYLES[c.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  const statusLabel = STATUS_LABELS[c.status] ?? c.status

  function handleSave(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    onToggle()
  }

  return (
    <Link href={`/preview/candidates/${c.id}`} className="block group">
      <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-150 group-hover:-translate-y-0.5 group-hover:border-slate-300/80 group-hover:shadow-md group-hover:shadow-slate-200/70">

        {/* Card header */}
        <div className="flex items-start justify-between px-5 py-4">
          <div className="min-w-0 flex-1 pr-3">
            <p className="text-[15px] font-semibold leading-snug text-slate-900">
              {c.practice_area}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Added {formatDate(c.created_at)}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span
              className={`rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${statusStyle}`}
            >
              {statusLabel}
            </span>
            {/* Save button — stopPropagation prevents the parent Link from navigating */}
            <button
              type="button"
              onClick={handleSave}
              aria-pressed={isSaved}
              aria-label={isSaved ? 'Remove from shortlist' : 'Add to shortlist'}
              className={`inline-flex h-7 items-center gap-1 rounded-md border px-2 text-[11px] font-semibold transition-colors ${
                isSaved
                  ? 'border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
                  : 'border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:text-slate-700'
              }`}
            >
              <BookmarkIcon filled={isSaved} />
              {isSaved ? 'Saved' : 'Save'}
            </button>
          </div>
        </div>

        {/* Key stats strip */}
        <div className="grid grid-cols-3 divide-x divide-slate-100 border-y border-slate-100 bg-slate-50/70">
          <Stat label="PQE" value={`${c.pqe_years} yr${c.pqe_years !== 1 ? 's' : ''}`} />
          <Stat label="Rate" value={`£${c.hourly_rate_gbp}/hr`} />
          <Stat label="Availability" value={c.availability} compact />
        </div>

        {/* AI summary */}
        <div className="px-5 py-4">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Profile summary
          </p>
          {c.ai_summary ? (
            <p className="border-l-2 border-indigo-200 pl-3 text-sm leading-relaxed text-slate-700">
              {c.ai_summary}
            </p>
          ) : (
            <p className="border-l-2 border-slate-200 pl-3 text-sm italic text-slate-400">
              Profile summary pending
            </p>
          )}
        </div>

        {/* Extracted skills */}
        {c.ai_extracted_skills && c.ai_extracted_skills.length > 0 && (
          <div className="px-5 pb-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Skills &amp; specialisms
            </p>
            <div className="flex flex-wrap gap-1.5">
              {c.ai_extracted_skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-violet-100 bg-violet-50 px-2.5 py-0.5 text-[11px] font-medium text-violet-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Case management systems */}
        {c.case_mgmt_systems && c.case_mgmt_systems.length > 0 && (
          <div className="border-t border-slate-100 px-5 py-4">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Case management
            </p>
            <div className="flex flex-wrap gap-1.5">
              {c.case_mgmt_systems.map((sys) => (
                <span
                  key={sys}
                  className="rounded-full border border-sky-100 bg-sky-50 px-2.5 py-0.5 text-[11px] font-medium text-sky-700"
                >
                  {sys}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Matter experience */}
        <div className="mt-auto border-t border-slate-100 px-5 py-4">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Matter experience
          </p>
          <p className="line-clamp-3 text-sm leading-relaxed text-slate-500">
            {c.matter_experience}
          </p>
        </div>

      </article>
    </Link>
  )
}

// ── Shared helpers ────────────────────────────────────────────────────────────

function Stat({
  label,
  value,
  compact = false,
}: {
  label: string
  value: string
  compact?: boolean
}) {
  return (
    <div className="px-4 py-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">{label}</p>
      <p className={`mt-0.5 font-semibold text-slate-800 ${compact ? 'text-[11px] leading-snug' : 'text-sm'}`}>
        {value}
      </p>
    </div>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return filled ? (
    <svg className="h-3 w-3 text-indigo-500" viewBox="0 0 24 24" fill="currentColor">
      <path d="M5 3h14a1 1 0 0 1 1 1v17.414a.5.5 0 0 1-.854.353L12 14.707l-7.146 7.06A.5.5 0 0 1 4 21.414V4a1 1 0 0 1 1-1z" />
    </svg>
  ) : (
    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 3h14a1 1 0 0 1 1 1v17.414a.5.5 0 0 1-.854.353L12 14.707l-7.146 7.06A.5.5 0 0 1 4 21.414V4a1 1 0 0 1 1-1z"
      />
    </svg>
  )
}
