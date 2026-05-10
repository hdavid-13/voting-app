import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Choice = 'YES' | 'NO' | 'ABSTAIN'
type Selections = Record<string, Choice>

export function useVote(proposals: any[]) {
  const [selections, setSelections] = useState<Selections>({})
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (proposals.length === 0) return
    init()
  }, [proposals])

  async function init() {
    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) {
      setError('Non connecté')
      setLoading(false)
      return
    }
    await fetchVotedProposals(uid)
    setLoading(false)
  }

  async function fetchVotedProposals(uid: string) {
    const publicIds = proposals.filter(p => p.method === 'PUBLIC').map(p => p.id)
    const secretIds = proposals.filter(p => p.method === 'SECRET').map(p => p.id)

    const voted = new Set<string>()
    const s: Selections = {}

    if (publicIds.length > 0) {
      const { data } = await supabase
        .from('votes')
        .select('proposal_id, choice')
        .eq('user_id', uid)
        .in('proposal_id', publicIds)

      data?.forEach(v => {
        voted.add(v.proposal_id)
        s[v.proposal_id] = v.choice
      })
    }

    if (secretIds.length > 0) {
      const { data } = await supabase
        .from('vote_receipts')
        .select('proposal_id')
        .eq('user_id', uid)
        .in('proposal_id', secretIds)

      data?.forEach(v => voted.add(v.proposal_id))
    }

    setVotedProposals(voted)
    setSelections(s)
  }

  function select(proposalId: string, choice: Choice) {
    if (votedProposals.has(proposalId)) return
    setSelections(prev => ({ ...prev, [proposalId]: choice }))
  }

  async function confirm(proposalId: string) {
    const choice = selections[proposalId]
    if (!choice) return

    const { data: userData } = await supabase.auth.getUser()
    const uid = userData.user?.id
    if (!uid) return

    const proposal = proposals.find(p => p.id === proposalId)
    if (!proposal) return

    if (proposal.method === 'SECRET') {
      // Vote anonyme
      const { error: voteError } = await supabase
        .from('anonymous_votes')
        .insert({ proposal_id: proposalId, choice })

      if (voteError) {
        setError('Erreur lors du vote')
        console.error("Erreur insertion vote anonyme:", voteError)
        return
      }

      // Reçu de vote
      const { error: receiptError } = await supabase
        .from('vote_receipts')
        .insert({ proposal_id: proposalId, user_id: uid })

      if (receiptError) {
        setError("Erreur lors de l'enregistrement du reçu")
        console.error("Erreur insertion reçu:", receiptError)
        return
      }

      // 👇 Appel RPC pour les votes SECRET
      const { error: rpcError } = await supabase.rpc('update_proposal_counter', {
        proposal_id: proposalId,
        choice
      })

      if (rpcError) {
        setError('Erreur lors de la mise à jour des compteurs')
        console.error("Erreur RPC SECRET:", rpcError)
        return
      }

    } else {
      // Vote PUBLIC
      const { error: voteError } = await supabase
        .from('votes')
        .insert({ proposal_id: proposalId, user_id: uid, choice })
        .select()

      if (voteError) {
        setError('Erreur lors du vote')
        console.error("Erreur insertion vote public:", voteError)
        return
      }

      // 👇 Appel RPC pour les votes PUBLIC (c'était manquant !)
      const { error: rpcError } = await supabase.rpc('update_proposal_counter', {
        proposal_id: proposalId,
        choice
      })

      if (rpcError) {
        setError('Erreur lors de la mise à jour des compteurs')
        console.error("Erreur RPC PUBLIC:", rpcError)
        return
      }
    }

    setVotedProposals(prev => new Set([...prev, proposalId]))
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return { selections, votedProposals, loading, error, select, confirm, handleLogout }
}
