import Link from 'next/link'
import { supabaseAdmin } from '@/lib/supabase'
import SaveButton from '@/components/preview/SaveButton'

// Only safe, non-PII columns are selected.
// Never fetched: first_name, last_name, email, mobile,
// cv_storage_path, cv_filename, internal_notes.
type CandidateDetail = {
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
  ai_processed_at: string | null
  status: string
}

async function getCandidate(id: string): Promise<CandidateDetail | null> {
  const { data, error } = await supabaseAdmin
    .from('candidates')
    .select(
      'id, created_at, practice_area, pqe_years, availability, hourly_rate_gbp, case_mgmt_systems, matter_experience, ai_summary, ai_extracted_skills, ai_processed_at, status'
    )
    .eq('id', id)
    .single()

  if (error) {
    if (error.code !== 'PGRST116') {
      // PGRST116 = no rows found — not an unexpected error
      console.error('Failed to fetch candidate:', error)
    }
    return null
  }

  return data
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
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

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const candidate = await getCandidate(params.id)

  if (!candidate) {
    return (
      <div className="min-h-screen bg-slate-100">
        <NavBar />
        <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
          <BackLink />
          <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-slate-200/80 bg-white py-24 text-center shadow-sm">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-2xl shadow-sm">
              🔍
            </div>
            <p className="text-sm font-semibold text-slate-700">Candidate not found</p>
            <p className="mt-1.5 text-xs text-slate-400">
              This profile may have been removed or the link is incorrect.
            </p>
          </div>
        </main>
      </div>
    )
  }

  const c = candidate
  const statusStyle = STATUS_STYLES[c.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  const statusLabel = STATUS_LABELS[c.status] ?? c.status

  return (
    <div className="min-h-screen bg-slate-100">

      {/* ── Navigation bar ─────────────────────────────────────────── */}
      <NavBar />

      {/* ── Candidate hero band ────────────────────────────────────── */}
      <div className="border-b border-slate-200/60 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-7 sm:px-6">

          <BackLink />

          {/* Title row */}
          <div className="mt-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                {c.practice_area}
              </h1>
              <p className="mt-1 text-xs text-slate-400">Added {formatDate(c.created_at)}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusStyle}`}
              >
                {statusLabel}
              </span>
              <SaveButton candidateId={c.id} />
            </div>
          </div>

          {/* Inline stat row */}
          <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-t border-slate-100 pt-5">
            <HeroStat label="PQE" value={`${c.pqe_years} yr${c.pqe_years !== 1 ? 's' : ''}`} />
            <HeroStat label="Hourly rate" value={`£${c.hourly_rate_gbp}/hr`} />
            <HeroStat label="Availability" value={c.availability} />
          </dl>

        </div>
      </div>

      {/* ── Main content ───────────────────────────────────────────── */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 space-y-4">

        {/* AI summary — prominent */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              AI profile summary
            </p>
            {c.ai_processed_at && (
              <>
                <span className="text-slate-200">·</span>
                <p className="text-[11px] text-slate-400">
                  Generated {formatDateTime(c.ai_processed_at)}
                </p>
              </>
            )}
          </div>
          {c.ai_summary ? (
            <p className="border-l-2 border-indigo-200 pl-4 text-sm leading-7 text-slate-700">
              {c.ai_summary}
            </p>
          ) : (
            <p className="border-l-2 border-slate-200 pl-4 text-sm italic text-slate-400">
              Profile summary pending
            </p>
          )}
        </section>

        {/* Skills & specialisms */}
        {c.ai_extracted_skills && c.ai_extracted_skills.length > 0 && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Skills &amp; specialisms
            </p>
            <div className="flex flex-wrap gap-2">
              {c.ai_extracted_skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-violet-100 bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Case management systems */}
        {c.case_mgmt_systems && c.case_mgmt_systems.length > 0 && (
          <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
              Case management systems
            </p>
            <div className="flex flex-wrap gap-2">
              {c.case_mgmt_systems.map((sys) => (
                <span
                  key={sys}
                  className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                >
                  {sys}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Matter experience — full text */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <p className="mb-3.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
            Matter experience
          </p>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
            {c.matter_experience}
          </p>
        </section>

      </main>
    </div>
  )
}

// ── Shared sub-components ────────────────────────────────────────────────────

function NavBar() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200/80 bg-white shadow-sm">
      <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:px-6">
        <span className="text-base font-bold tracking-tight text-slate-900">Lexaro Flex</span>
        <span className="text-slate-300">|</span>
        <span className="text-xs font-medium text-slate-400">Candidate profiles</span>
      </div>
    </header>
  )
}

function BackLink() {
  return (
    <Link
      href="/preview/candidates"
      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
    >
      <svg
        className="h-3 w-3"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2.5}
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
      All candidates
    </Link>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">
        {label}
      </dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

