/**
 * Extracts plain text from a PDF or DOCX file buffer.
 * Returns an empty string if extraction fails rather than throwing,
 * so a failed extraction never blocks the candidate row from being saved.
 *
 * PDF  → pdfjs-dist legacy Node.js build (text-only, no canvas required)
 * DOCX → mammoth (pure JS, no native deps)
 */
export async function extractCvText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      return await extractPdfText(buffer)
    }

    if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return result.value ?? ''
    }

    return ''
  } catch (err) {
    // Log enough to diagnose failures without exposing CV content.
    console.error(
      '[extract-cv-text] Extraction failed:',
      err instanceof Error ? err.message : String(err)
    )
    return ''
  }
}

// TextItem is not part of the public pdfjs-dist export; define locally.
interface PdfTextItem {
  str: string
  hasEOL: boolean
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // Dynamic import prevents Next.js from statically initialising pdfjs-dist
  // at build time (which can fail due to its browser-global expectations).
  // The legacy build ships Node.js-compatible polyfills for DOM APIs.
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')

  // Disable the worker thread — not available in serverless environments.
  pdfjs.GlobalWorkerOptions.workerSrc = ''

  const loadingTask = pdfjs.getDocument({
    data: new Uint8Array(buffer),
    // These flags prevent pdfjs from spawning fetch/eval/worker calls
    // that don't work in a Lambda context.
    useWorkerFetch: false,
    isEvalSupported: false,
    useSystemFonts: true,
  })

  const doc = await loadingTask.promise
  const pageTexts: string[] = []

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i)
    const content = await page.getTextContent()

    // getTextContent returns TextItem | TextMarkedContent; only TextItem has .str
    const pageText = content.items
      .filter((item) => 'str' in item)
      .map((item) => {
        const ti = item as unknown as PdfTextItem
        return ti.str + (ti.hasEOL ? '\n' : ' ')
      })
      .join('')
      .trim()

    if (pageText) pageTexts.push(pageText)
    page.cleanup()
  }

  await doc.destroy()
  return pageTexts.join('\n')
}
