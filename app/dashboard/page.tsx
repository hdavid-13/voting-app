import { supabase } from '@/lib/supabase'
import DashboardClient from './DashboardClient'

export default async function Dashboard() {
  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return (
      <div className="container">
        <p style={{ color: 'var(--error)' }}>Erreur : {error.message}</p>
      </div>
    )
  }

  return <DashboardClient initial={proposals ?? []} />
}
