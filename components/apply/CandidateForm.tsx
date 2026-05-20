'use client'

import { useRef, useState, useTransition, type ChangeEvent, type ReactNode } from 'react'
import { submitApplication } from '@/app/apply/actions'

type FormResult =
  | { success: true }
  | { success: false; error: string }
  | null

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

const CASE_MGMT_SYSTEMS = [
  'LEAP',
  'Clio',
  'Osprey',
  'Proclaim',
  'Eclipse Proclaim',
  'Insight Legal',
  'Visualfiles',
  'Tikit',
  'InfoTrack',
  'Redbrick Solutions',
  'Other',
]

export default function CandidateForm() {
  const formRef = useRef<HTMLFormElement>(null)
  const [result, setResult] = useState<FormResult>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedSystems, setSelectedSystems] = useState<string[]>([])
  const [cvFileName, setCvFileName] = useState<string | null>(null)

  function toggleSystem(system: string) {
    setSelectedSystems((prev) =>
      prev.includes(system) ? prev.filter((s) => s !== system) : [...prev, system]
    )
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    setCvFileName(file ? file.name : null)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // Append multi-select chips (not standard form fields)
    data.delete('case_mgmt_systems')
    for (const s of selectedSystems) {
      data.append('case_mgmt_systems', s)
    }

    startTransition(async () => {
      const res = await submitApplication(data)
      setResult(res)
      if (res.success) {
        formRef.current?.reset()
        setSelectedSystems([])
        setCvFileName(null)
      }
    })
  }

  if (result?.success) {
    return (
      <div className="py-8 text-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100">
          <svg className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Application received</h2>
        <p className="mt-2 text-sm text-slate-500">
          Thank you for applying. Our team will review your profile and be in touch within 2 working days.
        </p>
      </div>
    )
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* Name row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="First name" required>
          <input
            name="first_name"
            type="text"
            autoComplete="given-name"
            required
            className={inputClass}
            placeholder="Jane"
          />
        </Field>
        <Field label="Last name" required>
          <input
            name="last_name"
            type="text"
            autoComplete="family-name"
            required
            className={inputClass}
            placeholder="Smith"
          />
        </Field>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Email address" required>
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            className={inputClass}
            placeholder="jane@example.com"
          />
        </Field>
        <Field label="Mobile number" required>
          <input
            name="mobile"
            type="tel"
            autoComplete="tel"
            required
            className={inputClass}
            placeholder="+44 7700 900000"
          />
        </Field>
      </div>

      {/* Practice area */}
      <Field label="Primary practice area" required>
        <select name="practice_area" required className={inputClass} defaultValue="">
          <option value="" disabled>Select a practice area</option>
          {PRACTICE_AREAS.map((area) => (
            <option key={area} value={area}>{area}</option>
          ))}
        </select>
      </Field>

      {/* PQE + Availability */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="PQE (years)" required hint="Enter 0 if newly qualified">
          <input
            name="pqe_years"
            type="number"
            min={0}
            max={60}
            required
            className={inputClass}
            placeholder="5"
          />
        </Field>
        <Field label="Availability" required>
          <select name="availability" required className={inputClass} defaultValue="">
            <option value="" disabled>Select availability</option>
            {AVAILABILITY_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </Field>
      </div>

      {/* Hourly rate */}
      <Field label="Target hourly rate (£)" required>
        <div className="relative">
          <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 text-sm">£</span>
          <input
            name="hourly_rate_gbp"
            type="number"
            min={1}
            step="0.01"
            required
            className={`${inputClass} pl-7`}
            placeholder="75"
          />
        </div>
      </Field>

      {/* Case management systems */}
      <Field label="Case management systems" hint="Select all that apply">
        <div className="flex flex-wrap gap-2 pt-1">
          {CASE_MGMT_SYSTEMS.map((sys) => {
            const active = selectedSystems.includes(sys)
            return (
              <button
                key={sys}
                type="button"
                onClick={() => toggleSystem(sys)}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 ${
                  active
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                }`}
              >
                {sys}
              </button>
            )
          })}
        </div>
      </Field>

      {/* Matter experience */}
      <Field label="Matter experience" required hint="Describe the types of matters you have handled">
        <textarea
          name="matter_experience"
          rows={4}
          required
          className={`${inputClass} resize-none`}
          placeholder="e.g. Handled a caseload of 80+ residential conveyancing files including freehold and leasehold purchases, sales, and remortgages..."
        />
      </Field>

      {/* CV upload */}
      <Field label="Upload your CV" required hint="PDF or Word document, max 5 MB">
        <label className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-slate-400 hover:bg-white">
          <svg className="mb-2 h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          {cvFileName ? (
            <span className="text-sm font-medium text-slate-700">{cvFileName}</span>
          ) : (
            <>
              <span className="text-sm font-medium text-slate-700">Click to upload</span>
              <span className="mt-1 text-xs text-slate-400">PDF or DOCX up to 5 MB</span>
            </>
          )}
          <input
            name="cv"
            type="file"
            accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            required
            className="sr-only"
            onChange={handleFileChange}
          />
        </label>
      </Field>

      {/* Server-side error */}
      {result && !result.success && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {result.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-slate-900 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:opacity-60"
      >
        {isPending ? 'Submitting…' : 'Submit application'}
      </button>
    </form>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const inputClass =
  'block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200'

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string
  required?: boolean
  hint?: string
  children: ReactNode
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-700">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {hint && <p className="mb-1.5 text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  )
}
