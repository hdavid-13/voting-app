'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function TestPage() {
  const [proposals, setProposals] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)
  const [selections, setSelections] = useState<Record<string, 'YES' | 'NO' | 'ABSTAIN' | null>>({})
  const router = useRouter()

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

  // 👇 Fonction de déconnexion
  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/')  // Redirige vers la page d'accueil
  }

  return (
    <div className="container">

      {/* 👇 Barre de navigation avec bouton déconnexion */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🗳️ Votes en cours</h1>
        <button
          onClick={handleLogout}
          style={{ backgroundColor: "rgba(255, 104, 126, 0.8)" }}
          className="btn-primary"  // adapte selon ta classe CSS
        >
          Se déconnecter
        </button>
      </div>

      {proposals.map((p) => (
        <div key={p.id} className="card">
          <h2 className="title">{p.title}</h2>
          <p className="subtitle">{p.description}</p>

          <div>
            {(['YES', 'NO', 'ABSTAIN'] as const).map((choice) => (
              <label key={choice} className="label" style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
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
            className="btn-primary"
            onClick={() => confirm(p.id)}
          >
            Valider mon vote
          </button>
        </div>
      ))}
    </div>
  )
}
