export type CandidateStatus = 'pending_review' | 'approved' | 'rejected'

export interface Candidate {
  id: string
  created_at: string
  updated_at: string
  first_name: string
  last_name: string
  email: string
  mobile: string
  practice_area: string
  pqe_years: number
  availability: string
  hourly_rate_gbp: number
  case_mgmt_systems: string[]
  matter_experience: string
  cv_storage_path: string | null
  cv_filename: string | null
  ai_summary: string | null
  ai_extracted_skills: string[] | null
  ai_processed_at: string | null
  status: CandidateStatus
  internal_notes: string | null
}

export interface CandidateInsert {
  first_name: string
  last_name: string
  email: string
  mobile: string
  practice_area: string
  pqe_years: number
  availability: string
  hourly_rate_gbp: number
  case_mgmt_systems: string[]
  matter_experience: string
  cv_storage_path?: string
  cv_filename?: string
}
