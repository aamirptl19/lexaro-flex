'use server'

import { supabaseAdmin } from '@/lib/supabase'
import { extractCvText } from '@/lib/extract-cv-text'
import { generateCandidateProfile } from '@/lib/anthropic'

export type SubmitResult =
  | { success: true }
  | { success: false; error: string }

export async function submitApplication(formData: FormData): Promise<SubmitResult> {
  // --- 1. Parse and validate fields ---
  const firstName = (formData.get('first_name') as string | null)?.trim() ?? ''
  const lastName = (formData.get('last_name') as string | null)?.trim() ?? ''
  const email = (formData.get('email') as string | null)?.trim().toLowerCase() ?? ''
  const mobile = (formData.get('mobile') as string | null)?.trim() ?? ''
  const practiceArea = (formData.get('practice_area') as string | null)?.trim() ?? ''
  const pqeRaw = formData.get('pqe_years') as string | null
  const availability = (formData.get('availability') as string | null)?.trim() ?? ''
  const hourlyRateRaw = formData.get('hourly_rate_gbp') as string | null
  const caseMgmtRaw = formData.getAll('case_mgmt_systems') as string[]
  const matterExperience = (formData.get('matter_experience') as string | null)?.trim() ?? ''
  const cvFile = formData.get('cv') as File | null

  // Required field validation
  if (!firstName) return { success: false, error: 'First name is required.' }
  if (!lastName) return { success: false, error: 'Last name is required.' }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'A valid email address is required.' }
  }
  if (!mobile) return { success: false, error: 'Mobile number is required.' }
  if (!practiceArea) return { success: false, error: 'Practice area is required.' }
  if (!availability) return { success: false, error: 'Availability is required.' }
  if (!matterExperience) return { success: false, error: 'Matter experience is required.' }

  const pqeYears = parseInt(pqeRaw ?? '', 10)
  if (isNaN(pqeYears) || pqeYears < 0) {
    return { success: false, error: 'PQE must be a non-negative number.' }
  }

  const hourlyRate = parseFloat(hourlyRateRaw ?? '')
  if (isNaN(hourlyRate) || hourlyRate <= 0) {
    return { success: false, error: 'Target hourly rate must be a positive number.' }
  }

  if (!cvFile || cvFile.size === 0) {
    return { success: false, error: 'Please upload your CV.' }
  }

  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
  ]
  if (!allowedTypes.includes(cvFile.type)) {
    return { success: false, error: 'CV must be a PDF or Word document.' }
  }

  const MAX_CV_BYTES = 5 * 1024 * 1024 // 5 MB
  if (cvFile.size > MAX_CV_BYTES) {
    return { success: false, error: 'CV file must be 5 MB or smaller.' }
  }

  // --- 2. Upload CV to Supabase Storage ---
  const cvBuffer = Buffer.from(await cvFile.arrayBuffer())
  const ext = cvFile.name.split('.').pop() ?? 'pdf'
  const storagePath = `${Date.now()}-${crypto.randomUUID()}.${ext}`

  const { error: uploadError } = await supabaseAdmin.storage
    .from('candidate-cvs')
    .upload(storagePath, cvBuffer, {
      contentType: cvFile.type,
      upsert: false,
    })

  if (uploadError) {
    console.error('CV upload error:', uploadError)
    return { success: false, error: 'Failed to upload CV. Please try again.' }
  }

  // --- 3. Insert candidate row ---
  const { data: candidate, error: insertError } = await supabaseAdmin
    .from('candidates')
    .insert({
      first_name: firstName,
      last_name: lastName,
      email,
      mobile,
      practice_area: practiceArea,
      pqe_years: pqeYears,
      availability,
      hourly_rate_gbp: hourlyRate,
      case_mgmt_systems: caseMgmtRaw,
      matter_experience: matterExperience,
      cv_storage_path: storagePath,
      cv_filename: cvFile.name,
    })
    .select('id')
    .single()

  if (insertError || !candidate) {
    console.error('Candidate insert error:', insertError)
    // Attempt to clean up uploaded CV
    await supabaseAdmin.storage.from('candidate-cvs').remove([storagePath])
    if (insertError?.code === '23505') {
      return { success: false, error: 'An application with this email already exists.' }
    }
    return { success: false, error: 'Failed to save your application. Please try again.' }
  }

  // --- 4. Generate AI summary (non-blocking) ---
  try {
    const cvText = await extractCvText(cvBuffer, cvFile.type)

    if (cvText.length > 50) {
      const aiResult = await generateCandidateProfile(cvText, {
        practiceArea,
        pqeYears,
        availability,
        hourlyRateGbp: hourlyRate,
        caseMgmtSystems: caseMgmtRaw,
        matterExperience,
      })

      await supabaseAdmin
        .from('candidates')
        .update({
          ai_summary: aiResult.summary,
          ai_extracted_skills: aiResult.extracted_skills,
          ai_processed_at: new Date().toISOString(),
        })
        .eq('id', candidate.id)
    }
  } catch (aiError) {
    // AI failure is non-blocking — candidate row already saved
    console.error('AI processing error:', aiError)
  }

  return { success: true }
}
