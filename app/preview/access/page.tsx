import AccessForm from '@/components/preview/AccessForm'

export const metadata = {
  title: 'Access — Lexaro Flex',
  robots: 'noindex',
}

export default function AccessPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  // Validate `from` to prevent open-redirect attacks — only allow /preview/ paths
  const rawFrom = typeof searchParams.from === 'string' ? searchParams.from : ''
  const from = rawFrom.startsWith('/preview/') ? rawFrom : '/preview/candidates'

  return (
    <div className="flex min-h-screen flex-col bg-slate-100">

      {/* Nav */}
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex h-16 max-w-md items-center px-4 sm:px-6">
          <span className="text-base font-bold tracking-tight text-slate-900">
            Lexaro Flex
          </span>
        </div>
      </header>

      {/* Gate card */}
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-sm">

          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl shadow-sm">
              🔒
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              Access Lexaro Flex candidate preview
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              This area is currently restricted to invited law firm users.
            </p>
          </div>

          {/* Form card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
            <AccessForm from={from} />
          </div>

        </div>
      </main>

    </div>
  )
}
