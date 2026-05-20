export const SHORTLIST_KEY = 'locumlex_shortlisted_candidates'

/** Read the current shortlisted IDs from localStorage. Safe to call server-side (returns []). */
export function readShortlistIds(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(SHORTLIST_KEY)
    const parsed = JSON.parse(raw ?? 'null')
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

/** Persist a new set of IDs to localStorage. */
export function writeShortlistIds(ids: string[]): void {
  localStorage.setItem(SHORTLIST_KEY, JSON.stringify(ids))
}

/** Toggle an ID in/out of the shortlist. Returns the new ID array. */
export function toggleShortlistId(id: string): string[] {
  const ids = readShortlistIds()
  const next = ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]
  writeShortlistIds(next)
  return next
}
