'use server'

import { createHmac } from 'crypto'
import { cookies } from 'next/headers'
import { PREVIEW_COOKIE } from '@/middleware'

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 // 7 days

function expectedToken(password: string): string {
  return createHmac('sha256', password).update('flex-preview-v1').digest('hex')
}

export type AccessResult =
  | { success: true }
  | { success: false; error: string }

export async function submitAccessPassword(
  formData: FormData
): Promise<AccessResult> {
  const entered = (formData.get('password') as string | null)?.trim() ?? ''
  const configured = process.env.FLEX_PREVIEW_PASSWORD

  if (!configured) {
    // No password set — allow through so local dev without the env var works
    return { success: true }
  }

  if (!entered) {
    return { success: false, error: 'Please enter the access password.' }
  }

  if (entered !== configured) {
    return { success: false, error: 'Incorrect password. Please try again.' }
  }

  cookies().set(PREVIEW_COOKIE, expectedToken(configured), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/preview',
    maxAge: COOKIE_MAX_AGE,
  })

  return { success: true }
}
