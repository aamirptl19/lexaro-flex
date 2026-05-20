'use server'

import { supabaseAdmin } from '@/lib/supabase'

export type RequestResult =
  | { success: true }
  | { success: false; error: string }

export async function submitInterestRequest(
  candidateId: string,
  formData: FormData
): Promise<RequestResult> {
  const firmName    = (formData.get('firm_name')    as string | null)?.trim() ?? ''
  const contactName = (formData.get('contact_name') as string | null)?.trim() ?? ''
  const workEmail   = (formData.get('work_email')   as string | null)?.trim().toLowerCase() ?? ''
  const phone       = (formData.get('phone')        as string | null)?.trim() || null
  const message     = (formData.get('message')      as string | null)?.trim() || null

  if (!firmName)    return { success: false, error: 'Firm name is required.' }
  if (!contactName) return { success: false, error: 'Contact name is required.' }
  if (!workEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(workEmail)) {
    return { success: false, error: 'A valid work email address is required.' }
  }

  const { error } = await supabaseAdmin
    .from('candidate_interest_requests')
    .insert({
      candidate_id: candidateId,
      firm_name:    firmName,
      contact_name: contactName,
      work_email:   workEmail,
      phone,
      message,
    })

  if (error) {
    console.error('Interest request insert error:', error)
    return { success: false, error: 'Failed to submit your request. Please try again.' }
  }

  return { success: true }
}
