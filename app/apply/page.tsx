import CandidateForm from '@/components/apply/CandidateForm'
import Link from 'next/link'

export const metadata = {
  title: 'Apply — Lexaro Flex',
  description:
    'Apply to join the Lexaro Flex network. Create your candidate profile and connect with UK law firms seeking flexible legal cover.',
}

export default function ApplyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-2xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="text-sm font-semibold tracking-tight text-slate-900">
            Lexaro Flex
          </Link>
          <span className="text-xs text-slate-400">Candidate application</span>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Apply to join the Lexaro Flex network
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500">
            Complete the form below to create your candidate profile. Our team will review
            your application and be in touch within 2 working days. Your personal details
            remain confidential throughout the introduction process.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <CandidateForm />
        </div>
      </main>
    </div>
  )
}
