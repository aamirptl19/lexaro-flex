/**
 * Extracts plain text from a PDF or DOCX file buffer.
 * Returns an empty string if extraction fails rather than throwing.
 */
export async function extractCvText(
  buffer: Buffer,
  mimeType: string
): Promise<string> {
  try {
    if (mimeType === 'application/pdf') {
      type PdfParseFn = (dataBuffer: Buffer) => Promise<{ text: string }>
      const pdfParse = (await import('pdf-parse')) as unknown as PdfParseFn
      const result = await pdfParse(buffer)
      return result.text ?? ''
    }

    if (
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      mimeType === 'application/msword'
    ) {
      const mammoth = await import('mammoth')
      const result = await mammoth.extractRawText({ buffer })
      return result.value ?? ''
    }

    return ''
  } catch {
    return ''
  }
}
