'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    fetchUser()
    fetchProposals()
  }, [])

  async function fetchUser() {
    const { data } = await supabase.auth.getUser()
    setUserId(data.user?.id ?? null)
  }

  async function fetchProposals() {
    const { data, error } = await supabase
      .from('proposals')
      .select('*')  // sans votes

    console.log('error:', error)
    setProposals(data || [])
    }


  async function vote(proposalId: string, choice: 'YES' | 'NO' | 'ABSTAIN') {
    if (!userId) return alert('Connecte-toi pour voter')

    await supabase
      .from('votes')
      .insert({ proposal_id: proposalId, user_id: userId, choice })

    fetchProposals()
  }

  function countVotes(votes: any[], choice: string) {
    return votes?.filter((v) => v.choice === choice).length ?? 0
  }

  return (
    <div>
      {proposals.map((p) => (
        <div key={p.id}>
          <h2>{p.title}</h2>
          <p>{p.description}</p>
          <p>Status: {p.status}</p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => vote(p.id, 'YES')}>
              ✅ Oui ({countVotes(p.votes, 'YES')})
            </button>
            <button onClick={() => vote(p.id, 'NO')}>
              ❌ Non ({countVotes(p.votes, 'NO')})
            </button>
            <button onClick={() => vote(p.id, 'ABSTAIN')}>
              ⬜ Abstention ({countVotes(p.votes, 'ABSTAIN')})
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
