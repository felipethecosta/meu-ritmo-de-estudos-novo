import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return (
    <main>
      <h1>Painel</h1>
      <p>{session.email}</p>
    </main>
  )
}