import { cookies } from 'next/headers'

export const SESSION_COOKIE = 'session'

export interface Session {
  email: string
}

/** Sessao de exemplo em cookie — troque por um provedor real de auth. */
export async function getSession(): Promise<Session | null> {
  const store = await cookies()
  const email = store.get(SESSION_COOKIE)?.value
  return email ? { email } : null
}