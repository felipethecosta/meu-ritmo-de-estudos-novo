import Link from 'next/link'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function Home() {
  const session = await getSession()
  if (session) redirect('/dashboard')

  return (
    <main className="landing">
      <div>
        <h1>Meu Ritmo de Estudos</h1>
        <p>
          Cadastre suas matérias, planeje sessões pela semana com dia, horário e
          duração, marque o que já concluiu e mantenha seu ritmo. Seus dados
          ficam guardados no servidor.
        </p>
        <Link href="/login" className="cta">Entrar para começar</Link>
      </div>
    </main>
  )
}
