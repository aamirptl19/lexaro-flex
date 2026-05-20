import Anthropic from '@anthropic-ai/sdk'

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export interface AiProfileResult {
  summary: string
  extracted_skills: string[]
}

/**
 * Generates an anonymous professional summary from CV text and candidate form data.
 * All identifying information (name, employer names, contact details, exact locations)
 * is removed. Safe to share with law firms.
 */
export async function generateCandidateProfile(
  cvText: string,
  fields: {
    practiceArea: string
    pqeYears: number
    availability: string
    hourlyRateGbp: number
    caseMgmtSystems: string[]
    matterExperience: string
  }
): Promise<AiProfileResult> {
  const prompt = `You are a legal recruitment specialist. Your task is to produce an anonymous professional summary of a locum lawyer candidate that can be shared with law firms.

You will be given:
1. The candidate's CV text
2. Key profile details they submitted

Your output must be a JSON object with exactly two fields:
- "summary": A 3–5 sentence professional summary written in third person. It must NOT contain the candidate's name, any employer/firm names, any contact details (email, phone, address), or any specific locations. Focus on experience level, practice area expertise, the types of matters handled, and availability.
- "extracted_skills": An array of concise skill strings (e.g. "Residential Conveyancing", "LEAP", "Family Mediation"). Include practice area specialisms, case management systems, and notable matter types. Maximum 15 items.

Profile details:
- Practice area: ${fields.practiceArea}
- PQE (years): ${fields.pqeYears}
- Availability: ${fields.availability}
- Target hourly rate: £${fields.hourlyRateGbp}
- Case management systems: ${fields.caseMgmtSystems.join(', ') || 'Not specified'}
- Matter experience: ${fields.matterExperience}

CV text:
---
${cvText.slice(0, 8000)}
---

Respond with only valid JSON. No markdown, no code fences, no commentary.`

  const message = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''

const cleaned = raw
  .replace(/```json/gi, '')
  .replace(/```/g, '')
  .trim()

try {
  const parsed = JSON.parse(cleaned) as AiProfileResult

  return {
    summary: parsed.summary ?? '',
    extracted_skills: Array.isArray(parsed.extracted_skills) ? parsed.extracted_skills : [],
  }
} catch (err) {
  console.error('AI JSON parse failed. Raw output:', raw)
  throw err
}
}
