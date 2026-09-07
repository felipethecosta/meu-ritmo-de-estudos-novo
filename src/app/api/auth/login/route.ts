import { NextResponse } from 'next/server'
import { SESSION_COOKIE } from '@/lib/session'

/** Login stub — valide credenciais de verdade antes de ir para producao. */
export async function POST(request: Request) {
  const form = await request.formData()
  const email = String(form.get('email') ?? '')
  if (!email) {
    return NextResponse.json({ error: 'Email obrigatorio' }, { status: 400 })
  }

  const response = NextResponse.redirect(new URL('/dashboard', request.url), 303)
  response.cookies.set(SESSION_COOKIE, email, { httpOnly: true, sameSite: 'lax', path: '/' })
  return response
}