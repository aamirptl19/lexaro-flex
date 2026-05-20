import Link from 'next/link'

export const metadata = {
  title: 'Lexaro Flex — Flexible Legal Talent for UK Law Firms',
  description:
    'Lexaro Flex is a curated marketplace connecting experienced locum lawyers with UK law firms — anonymised profiles, streamlined introductions, flexible engagement.',
}

const features = [
  {
    icon: '⚖️',
    title: 'Built for UK law',
    body: 'Conveyancing, family, employment, PI, and beyond. We focus on the work that matters to high street and regional firms — not just City mandates.',
  },
  {
    icon: '📋',
    title: 'Your profile, your terms',
    body: 'Define your availability, primary practice area, and target hourly rate. We surface your profile to firms whose requirements genuinely match.',
  },
  {
    icon: '🔒',
    title: 'Confidentiality by design',
    body: 'Firms receive an anonymised professional summary during the discovery stage. Your name and contact details are never shared without your explicit consent.',
  },
  {
    icon: '⚡',
    title: 'Structured, fast introductions',
    body: 'Applications are reviewed within 2 working days. Approved candidates are surfaced to active firm briefs immediately through a streamlined engagement workflow.',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-6">
          <span className="text-sm font-semibold tracking-tight text-slate-900">Lexaro Flex</span>
          <Link
            href="/apply"
            className="inline-flex h-8 items-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition-colors hover:bg-slate-700"
          >
            Apply now
          </Link>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden bg-white pb-24 pt-20 sm:pb-32 sm:pt-28">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)',
              backgroundSize: '64px 64px',
            }}
          />
          <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Now accepting applications
            </div>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Flexible legal talent,{' '}
              <span className="text-slate-400">matched to the firms that need you.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-slate-500 sm:text-lg">
              Lexaro Flex is a curated marketplace connecting experienced solicitors and legal
              professionals with UK law firms seeking flexible cover — on your terms, on your
              schedule.
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link
                href="/apply"
                className="inline-flex h-11 items-center justify-center rounded-lg bg-slate-900 px-6 text-sm font-semibold text-white transition-colors hover:bg-slate-700"
              >
                Apply as a locum lawyer →
              </Link>
              <span className="text-xs text-slate-400">Free to apply · No placement fees for candidates</span>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-100 bg-slate-50 py-20 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6">
            <h2 className="mb-12 text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
              Why join the Lexaro Flex network?
            </h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {features.map((f) => (
                <div key={f.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                  <div className="mb-3 text-2xl">{f.icon}</div>
                  <h3 className="mb-1.5 text-sm font-semibold text-slate-900">{f.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{f.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-100 py-8">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} Lexaro Flex. Part of the Lexaro platform.
          </p>
        </div>
      </footer>

    </div>
  )
}
