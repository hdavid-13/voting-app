import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'


export function useProposals() {
  const [proposals, setProposals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('proposals').select('*').then(({ data, error }) => {
      if (error) setError('Erreur chargement propositions')
      setProposals(data || [])
      setLoading(false)
    })
  }, [])

  return { proposals, loading, error }
}
