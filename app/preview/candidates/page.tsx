import { Suspense } from 'react'
import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import CandidateFilters from '@/components/preview/CandidateFilters'
import CandidateGrid from '@/components/preview/CandidateGrid'

export const metadata = {
  title: 'Candidate Profiles — Lexaro Flex',
}

// Only the non-PII columns are requested from the DB.
// PII fields (first_name, last_name, email, mobile, cv_storage_path,
// cv_filename, internal_notes) are never selected.
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

type Filters = {
  area: string | undefined
  availability: string | undefined
  pqe: number | undefined
  rate: number | undefined
  q: string | undefined
  shortlisted: boolean
}

async function getCandidates(filters: Filters): Promise<PreviewCandidate[]> {
  let query = supabaseAdmin
    .from('candidates')
    .select(
      'id, created_at, practice_area, pqe_years, availability, hourly_rate_gbp, case_mgmt_systems, matter_experience, ai_summary, ai_extracted_skills, status'
    )
    .order('created_at', { ascending: false })

  // Apply DB-level filters for exact/range matches
  if (filters.area) query = query.eq('practice_area', filters.area)
  if (filters.availability) query = query.eq('availability', filters.availability)
  if (filters.pqe !== undefined) query = query.gte('pqe_years', filters.pqe)
  if (filters.rate !== undefined) query = query.lte('hourly_rate_gbp', filters.rate)

  const { data, error } = await query

  if (error) {
    console.error('Failed to fetch candidates:', error)
    return []
  }

  let results = (data ?? []) as PreviewCandidate[]

  // Keyword filter in JS — matches ai_summary, matter_experience, and ai_extracted_skills
  if (filters.q) {
    const kw = filters.q.toLowerCase()
    results = results.filter(
      (c) =>
        c.ai_summary?.toLowerCase().includes(kw) ||
        c.matter_experience.toLowerCase().includes(kw) ||
        c.ai_extracted_skills?.some((s) => s.toLowerCase().includes(kw))
    )
  }

  // Note: `filters.shortlisted` is intentionally NOT applied here.
  // Shortlist IDs live in the browser's localStorage and are only known
  // client-side. CandidateGrid applies this filter after hydration.

  return results
}

function parseSearchParams(raw: { [key: string]: string | string[] | undefined }): Filters {
  const str = (key: string) =>
    typeof raw[key] === 'string' ? (raw[key] as string).trim() || undefined : undefined

  const num = (key: string) => {
    const v = str(key)
    if (!v) return undefined
    const n = Number(v)
    return isFinite(n) && n > 0 ? n : undefined
  }

  return {
    area: str('area'),
    availability: str('availability'),
    pqe: num('pqe'),
    rate: num('rate'),
    q: str('q'),
    shortlisted: raw['shortlisted'] === '1',
  }
}

export default async function CandidatePreviewPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const filters = parseSearchParams(searchParams)
  // hasFilters excludes `shortlisted` — that filter is client-only and doesn't
  // change the server-fetched count.
  const hasServerFilters = !!(
    filters.area || filters.availability || filters.pqe || filters.rate || filters.q
  )
  const candidates = await getCandidates(filters)

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ── Navigation bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold tracking-tight text-slate-900">Lexaro Flex</span>
            <span className="text-slate-300">|</span>
            <span className="text-xs font-medium text-slate-400">Candidate profiles</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold tabular-nums text-slate-600">
              {candidates.length} {candidates.length === 1 ? 'candidate' : 'candidates'}
              {hasServerFilters && ' matched'}
            </span>
          </div>
        </div>
      </header>

      {/* ── Page title band ────────────────────────────────────────── */}
      <div className="border-b border-slate-200/60 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-7 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Candidate profiles</h1>
          <p className="mt-1.5 text-sm text-slate-500">
            All profiles are anonymised during the discovery stage — no personally identifiable
            information is shown.
          </p>
        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">

        {/* Filter bar — client component, needs Suspense for useSearchParams */}
        <Suspense fallback={<FilterBarSkeleton />}>
          <CandidateFilters />
        </Suspense>

        {/* Results */}
        {candidates.length === 0 ? (
          hasServerFilters ? (
            <EmptyState
              icon="🔍"
              heading="No candidates match your filters"
              body="Try adjusting or removing some filters to see more results."
              action={
                <Link
                  href="/preview/candidates"
                  className="mt-5 inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
                >
                  Clear all filters
                </Link>
              }
            />
          ) : (
            <EmptyState
              icon="📋"
              heading="No candidates yet"
              body="Submitted applications will appear here once they come in."
            />
          )
        ) : (
          // CandidateGrid is a client component that handles the shortlist
          // toggle and Save/Unsave interactions after hydration.
          <CandidateGrid
            candidates={candidates}
            showShortlistedOnly={filters.shortlisted}
          />
        )}
      </main>
    </div>
  )
}

// ── Components ────────────────────────────────────────────────────────────────

function FilterBarSkeleton() {
  return (
    <div className="mb-6 animate-pulse rounded-2xl border border-slate-200/80 bg-white shadow-sm">
      <div className="h-[52px] rounded-t-2xl" />
      <div className="h-px bg-slate-100" />
      <div className="h-[44px] rounded-b-2xl" />
    </div>
  )
}

function EmptyState({
  icon,
  heading,
  body,
  action,
}: {
  icon: string
  heading: string
  body: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-24 text-center shadow-sm">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl shadow-sm">
        {icon}
      </div>
      <p className="text-sm font-semibold text-slate-700">{heading}</p>
      <p className="mt-1.5 max-w-xs text-xs leading-relaxed text-slate-400">{body}</p>
      {action}
    </div>
  )
}
