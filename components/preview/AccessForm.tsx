'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { submitAccessPassword, type AccessResult } from '@/app/preview/access/actions'

interface Props {
  from: string
}

export default function AccessForm({ from }: Props) {
  const [result, setResult] = useState<AccessResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await submitAccessPassword(formData)
      if (res.success) {
        // router.refresh() ensures the next page render sees the new cookie
        router.refresh()
        router.push(from)
      } else {
        setResult(res)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">

      {result && !result.success && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700"
        >
          {result.error}
        </div>
      )}

      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-xs font-semibold text-slate-600"
        >
          Access password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          autoComplete="current-password"
          placeholder="Enter your access password"
          className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 placeholder-slate-400 transition-colors focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="w-full inline-flex h-10 items-center justify-center rounded-lg bg-slate-900 text-sm font-semibold text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? 'Checking…' : 'Access preview'}
      </button>

    </form>
  )
}
