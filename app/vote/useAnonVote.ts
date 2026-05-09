'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Choice, Proposal, Selections } from './types'

export function useAnonVote() {
  const [proposals, setProposals] = useState<Proposal[]>([])
  const [selections, setSelections] = useState<Selections>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [votedProposals, setVotedProposals] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProposals()
    loadVotedFromStorage()
  }, [])

  function loadVotedFromStorage() {
    const stored = localStorage.getItem('voted_proposals')
    if (stored) {
      setVotedProposals(new Set(JSON.parse(stored)))
    }
  }

  function saveVotedToStorage(proposalId: string) {
    const stored = localStorage.getItem('voted_proposals')
    const current: string[] = stored ? JSON.parse(stored) : []
    const updated = [...new Set([...current, proposalId])]
    localStorage.setItem('voted_proposals', JSON.stringify(updated))
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
    if (votedProposals.has(proposalId)) {
      return alert('Tu as déjà voté pour cette proposition')
    }

    const choice = selections[proposalId]
    if (!choice) return alert('Choisis une option')

    const { error } = await supabase
      .from('votes')
      .insert({ proposal_id: proposalId, user_id: null, choice })

    if (error) {
      console.log('ERREUR VOTE:', error)
      setError('Erreur lors du vote.')
      return
    }

    setVotedProposals((prev) => new Set(prev).add(proposalId))
    saveVotedToStorage(proposalId)
    fetchProposals()
  }

  return {
    proposals,
    selections,
    loading,
    error,
    votedProposals,
    select,
    confirm,
  }
}
