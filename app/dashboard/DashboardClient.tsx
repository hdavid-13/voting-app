'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Proposal = {
  id: string
  title: string
  description: string
  status: 'OPEN' | 'CLOSED'
  method: 'PUBLIC' | 'SECRET'
  created_at: string
  closed_at: string | null
  yes_count: number
  no_count: number
  abstain_count: number
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

function pct(value: number, total: number) {
  if (total === 0) return 0
  return Math.round((value / total) * 100)
}

export default function DashboardClient({ initial }: { initial: Proposal[] }) {
  const [proposals, setProposals] = useState<Proposal[]>(initial)

    useEffect(() => {
    const channel = supabase
        .channel('dashboard')
        .on(
        'postgres_changes',
        {
            event: '*',
            schema: 'public',
            table: 'proposals',
            // 👇 Écoute uniquement les colonnes de votes
            filter: 'yes_count,no_count,abstain_count,status',
        },
        () => {
            supabase
            .from('proposals')
            .select('*')
            .order('created_at', { ascending: false })
            .then(({ data }) => {
                if (data) setProposals(data)
            })
        }
        )
        .subscribe()

    return () => { supabase.removeChannel(channel) }
    }, [])


  const total = proposals.length
  const open = proposals.filter((p) => p.status === 'OPEN').length
  const totalVotes = proposals.reduce((acc, p) => acc + p.yes_count + p.no_count + p.abstain_count, 0)

  return (
    <div className="container">
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--gold)' }}>Résultats des votes</h1>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--gold)' }}>{total}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>// propositions</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{open}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>// en cours</p>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '1.25rem' }}>
          <p style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>{totalVotes}</p>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', letterSpacing: '0.08em' }}>// votes exprimés</p>
        </div>
      </div>

      {proposals.length > 0 ? proposals.map((p) => {
        const voteTotal = p.yes_count + p.no_count + p.abstain_count
        const yesPct = pct(p.yes_count, voteTotal)
        const noPct = pct(p.no_count, voteTotal)
        const abstainPct = pct(p.abstain_count, voteTotal)
        const isAnon = p.method === 'SECRET'

        return (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
              <h2 className="title">{p.title}</h2>
              <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                <span style={{
                  fontSize: '0.65rem', padding: '0.2rem 0.5rem',
                  border: `1px solid ${p.status === 'OPEN' ? 'var(--accent)' : '#1e2a38'}`,
                  color: p.status === 'OPEN' ? 'var(--accent)' : 'var(--text-muted)',
                  letterSpacing: '0.08em',
                }}>
                  {p.status === 'OPEN' ? '> ouvert' : '> fermé'}
                </span>
                <span style={{
                  fontSize: '0.65rem', padding: '0.2rem 0.5rem',
                  border: '1px solid #1e2a38', color: 'var(--text-muted)', letterSpacing: '0.08em',
                }}>
                  {isAnon ? '> secret' : '> public'}
                </span>
              </div>
            </div>

            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', margin: '0.25rem 0 0.5rem' }}>
              // créé le {formatDate(p.created_at)}
            </p>
            <p className="subtitle">{p.description}</p>

            <div style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', height: '6px', borderRadius: '2px', overflow: 'hidden', background: '#1e2a38' }}>
                {yesPct > 0 && <div style={{ width: `${yesPct}%`, background: 'var(--accent)' }} />}
                {abstainPct > 0 && <div style={{ width: `${abstainPct}%`, background: 'var(--gold)' }} />}
                {noPct > 0 && <div style={{ width: `${noPct}%`, background: 'var(--error)' }} />}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                {(['YES', 'NO', 'ABSTAIN'] as const).map((choice) => {
                  const count = choice === 'YES' ? p.yes_count : choice === 'NO' ? p.no_count : p.abstain_count
                  const percentage = choice === 'YES' ? yesPct : choice === 'NO' ? noPct : abstainPct
                  const label = choice === 'YES' ? '> OUI' : choice === 'NO' ? '> NON' : '> ABSTENTION'
                  const color = choice === 'YES' ? 'var(--accent)' : choice === 'NO' ? 'var(--error)' : 'var(--gold)'
                  return (
                    <div key={choice} style={{
                      flex: 1, padding: '0.6rem 0.5rem',
                      background: `${color}12`, border: `1px solid ${color}`,
                      color, fontSize: '0.75rem', letterSpacing: '0.08em',
                    }}>
                      <p style={{ marginBottom: '0.2rem' }}>{label}</p>
                      <p style={{ fontSize: '1rem', fontWeight: 'bold' }}>{count}</p>
                      <p style={{ fontSize: '0.65rem', opacity: 0.7 }}>{percentage}%</p>
                    </div>
                  )
                })}
              </div>

              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.5rem', letterSpacing: '0.08em' }}>
                // {voteTotal} vote{voteTotal > 1 ? 's' : ''} exprimé{voteTotal > 1 ? 's' : ''}
              </p>
            </div>
          </div>
        )
      }) : (
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', letterSpacing: '0.08em' }}>// aucune proposition trouvée</p>
        </div>
      )}
    </div>
  )
}
