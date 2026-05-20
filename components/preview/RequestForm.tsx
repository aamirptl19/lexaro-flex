'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import {
  submitInterestRequest,
  type RequestResult,
} from '@/app/preview/candidates/[id]/request/actions'

interface Props {
  candidateId: string
}

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100'

const labelClass = 'block text-xs font-semibold text-slate-600 mb-1.5'

export default function RequestForm({ candidateId }: Props) {
  const [result, setResult]    = useState<RequestResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await submitInterestRequest(candidateId, formData)
      setResult(res)
    })
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (result?.success) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-200 bg-emerald-50 text-2xl shadow-sm">
          ✓
        </div>
        <p className="text-sm font-semibold text-slate-800">Request sent</p>
        <p className="mt-2 max-w-sm text-xs leading-relaxed text-slate-500">
          We've received your interest in this candidate. A member of the Lexaro Flex
          team will be in touch with you shortly.
        </p>
        <Link
          href="/preview/candidates"
          className="mt-6 inline-flex items-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-colors hover:border-slate-300 hover:text-slate-900"
        >
          Back to all candidates
        </Link>
      </div>
    )
  }

  // ── Form ─────────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">

      {/* Server-side error banner */}
      {result && !result.success && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700">
          {result.error}
        </div>
      )}

      {/* Row 1 — firm + contact */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="firm_name" className={labelClass}>
            Firm name <span className="text-red-400">*</span>
          </label>
          <input
            id="firm_name"
            name="firm_name"
            type="text"
            required
            autoComplete="organization"
            placeholder="e.g. Smith &amp; Partners LLP"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="contact_name" className={labelClass}>
            Your name <span className="text-red-400">*</span>
          </label>
          <input
            id="contact_name"
            name="contact_name"
            type="text"
            required
            autoComplete="name"
            placeholder="e.g. Jane Smith"
            className={inputClass}
          />
        </div>
      </div>

      {/* Row 2 — email + phone */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="work_email" className={labelClass}>
            Work email <span className="text-red-400">*</span>
          </label>
          <input
            id="work_email"
            name="work_email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@firm.co.uk"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone{' '}
            <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            placeholder="e.g. 020 7946 0000"
            className={inputClass}
          />
        </div>
      </div>

      {/* Message */}
      <div>
        <label htmlFor="message" className={labelClass}>
          Message{' '}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Tell us about the role, your timeline, or any specific requirements…"
          className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between pt-1">
        <p className="text-[11px] text-slate-400">
          <span className="text-red-400">*</span> Required
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="inline-flex h-10 items-center gap-2 rounded-lg bg-indigo-600 px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  className="opacity-25"
                  cx="12" cy="12" r="10"
                  stroke="currentColor" strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Sending…
            </>
          ) : (
            'Send request'
          )}
        </button>
      </div>

    </form>
  )
}
