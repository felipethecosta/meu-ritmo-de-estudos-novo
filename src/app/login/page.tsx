import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <main className="login-shell">
      <div className="login-card">
        <h1>Entrar</h1>
        <p className="hint">
          Use qualquer email para acessar. É uma sessão de exemplo.
        </p>
        <form action="/api/auth/login" method="post">
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              required
              autoComplete="current-password"
            />
          </label>
          <button type="submit" className="primary">
            Entrar
          </button>
        </form>
      </div>
    </main>
  )
}
