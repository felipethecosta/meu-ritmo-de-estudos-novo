import { redirect } from 'next/navigation'
import { StudyPlanner } from '@/components/study-planner'
import { getSession } from '@/lib/session'

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  return <StudyPlanner userEmail={session.email} />
}
