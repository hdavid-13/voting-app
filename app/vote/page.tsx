'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [selections, setSelections] = useState<Record<string, 'YES' | 'NO' | 'ABSTAIN' | null>>({})

  useEffect(() => {
    fetchUser()
    fetchProposals()
  }, [])

  async function fetchUser() {
    const { data } = await supabase.auth.getUser()
    setUserId(data.user?.id ?? null)
  }

  async function fetchProposals() {
    const { data } = await supabase.from('proposals').select('*')
    setProposals(data || [])
  }

  function select(proposalId: string, choice: 'YES' | 'NO' | 'ABSTAIN') {
    setSelections((prev) => ({ ...prev, [proposalId]: choice }))
  }

  async function confirm(proposalId: string) {
    const choice = selections[proposalId]
    if (!choice) return alert('Choisis une option')
    if (!userId) return alert('Connecte-toi pour voter')

    await supabase
      .from('votes')
      .insert({ proposal_id: proposalId, user_id: userId, choice })

    fetchProposals()
  }

  return (
    <div>
      {proposals.map((p) => (
        <div key={p.id} style={{ marginBottom: '24px', border: '1px solid #ccc', padding: '16px' }}>
          <h2>{p.title}</h2>
          <p>{p.description}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {(['YES', 'NO', 'ABSTAIN'] as const).map((choice) => (
              <label key={choice} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name={`vote-${p.id}`}
                  checked={selections[p.id] === choice}
                  onChange={() => select(p.id, choice)}
                />
                {choice === 'YES' ? '✅ Oui' : choice === 'NO' ? '❌ Non' : '⬜ Abstention'}
              </label>
            ))}
          </div>

          <button 
            className='mt-3 px-6 py-3 bg-cyan-800 text-white rounded-full text-base font-bold cursor-pointer border-none'
            onClick={() => confirm(p.id)}
          >
            Valider mon vote
          </button>

        </div>
      ))}
    </div>
  )
}
