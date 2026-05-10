'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Choice, Proposal, Selections } from './types'

export function useVote() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [selections, setSelections] = useState<Selections>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    fetchUser()
    fetchProposals()
  }, [])

  async function fetchUser() {
    const { data } = await supabase.auth.getUser()
    console.log("SUR AKASH - USER ID:", data.user?.id) 
    const uid = data.user?.id ?? null
    setUserId(uid)
    if (uid) fetchVotedProposals(uid)
  }

  async function fetchVotedProposals(uid: string) {
    const { data } = await supabase
      .from('votes')
      .select('proposal_id, choice')
      .eq('user_id', uid)

    if (data) {
      setVotedProposals(new Set(data.map((v) => v.proposal_id)))
    }
  }

  async function fetchProposals() {
    setLoading(true)
    const { data, error } = await supabase.from('proposals').select('*')
    if (error) setError('Erreur lors du chargement des propositions')
    setProposals(data || [])
    setLoading(false)
  }

  function select(proposalId: string, choice: Choice) {
    setSelections((prev) => ({ ...prev, [proposalId]: choice }))
  }

  async function confirm(proposalId: string) {
    const { data } = await supabase.auth.getUser()
    console.log('USER AU MOMENT DU VOTE:', data.user)

    const choice = selections[proposalId]
    if (!choice) return alert('Choisis une option')
    if (!userId) return alert('Connecte-toi pour voter')

    const { error } = await supabase
      .from('votes')
      .insert({ proposal_id: proposalId, user_id: userId, choice })

    if (error) {
      console.log('ERREUR VOTE:', error)
      setError('Erreur lors du vote. Tu as peut-être déjà voté.')
      return
    }

    setVotedProposals((prev) => new Set(prev).add(proposalId))
    fetchProposals()
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')
  }

  return {
    proposals,
    userId,
    selections,
    loading,
    error,
    votedProposals,
    select,
    confirm,
    handleLogout,
  }
}
