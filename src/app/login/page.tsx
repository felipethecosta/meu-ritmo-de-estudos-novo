import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function LoginPage() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <main className="login-shell">
      <div className="login-card">
        <h1>Meu Ritmo de Estudos</h1>
        <p className="hint">
          Entre com seu email para acessar seu painel. Seus dados ficam
          guardados no servidor, ligados ao seu email.
        </p>
        <form action="/api/auth/login" method="post">
          <label>
            Email
            <input
              name="email"
              type="email"
              placeholder="voce@exemplo.com"
              required
              autoFocus
            />
          </label>
          <label>
            Senha
            <input
              name="password"
              type="password"
              placeholder="qualquer senha para o modo demo"
              required
            />
          </label>
          <button type="submit" className="primary">Entrar</button>
        </form>
      </div>
    </main>
  )
}
