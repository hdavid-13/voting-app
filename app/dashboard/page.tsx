// app/dashboard/page.tsx
import { createClient } from '@/lib/supabase-server'
import DashboardClient from './DashboardClient' // 👈 IMPORTATION CORRECTE

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data: proposals, error } = await supabase
    .from('proposals')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Erreur Supabase:', error)
    return <div>Erreur : {error.message}</div>
  }

  // 👇 Passe les données à DashboardClient
  return <DashboardClient initial={proposals ?? []} />
}
