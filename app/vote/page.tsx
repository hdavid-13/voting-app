'use client'
import { useProposals } from './useProposals'
import { useVote } from './useVote'

export default function VotePage() {
  const { proposals, loading: pLoading, error: pError } = useProposals()
  const auth = useVote(proposals)

  const loading = pLoading || auth.loading
  const error = pError || auth.error

  if (loading) return <p style={{ textAlign: 'center' }}>Chargement...</p>

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', color: 'var(--gold)' }}>Votes en cours</h1>
      </div>

      {error && <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>}

      {proposals
        .filter((p) => p.status !== 'CLOSED')
        .map((p) => {
        const isAnon = p.method === 'SECRET'
        const { selections, votedProposals, select, confirm } = auth

        return (
          <div key={p.id} className="card">
            <h2 className="title">{p.title}</h2>
            <p 
              className="subtitle"
              style={{ whiteSpace: 'pre-line'}}      
            >{p.description}</p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              {isAnon ? '// vote anonyme' : '// vote public'}
            </p>

            {votedProposals.has(p.id) ? (
              <>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['YES', 'NO', 'ABSTAIN'] as const).map((choice) => {
                    const isVoted = selections[p.id] === choice
                    const label = choice === 'YES' ? '> OUI' : choice === 'NO' ? '> NON' : '> ABSTENTION'
                    const color = choice === 'YES' ? 'var(--accent)' : choice === 'NO' ? 'var(--error)' : 'var(--gold)'
                    return (
                      <button
                        key={choice}
                        disabled
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.5rem',
                          background: isVoted ? `${color}12` : 'transparent',
                          border: `1px solid ${isVoted ? color : '#1e2a38'}`,
                          color: isVoted ? color : '#2a3a4a',
                          fontFamily: 'inherit',
                          fontSize: '0.8rem',
                          letterSpacing: '0.08em',
                          cursor: 'not-allowed',
                          textAlign: 'left',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                <button
                  disabled
                  style={{
                    width: '100%',
                    marginTop: '0.75rem',
                    padding: '0.6rem',
                    background: 'transparent',
                    border: '1px solid #1e2a38',
                    color: '#2a3a4a',
                    fontFamily: 'inherit',
                    fontSize: '0.8rem',
                    letterSpacing: '0.08em',
                    cursor: 'not-allowed',
                    textAlign: 'left',
                  }}
                >
                  {isAnon ? '// vote anonyme enregistré' : '// vote enregistré'}
                </button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(['YES', 'NO', 'ABSTAIN'] as const).map((choice) => {
                    const isSelected = selections[p.id] === choice
                    const label = choice === 'YES' ? '> OUI' : choice === 'NO' ? '> NON' : '> ABSTENTION'
                    const color = choice === 'YES' ? 'var(--accent)' : choice === 'NO' ? 'var(--error)' : 'var(--gold)'
                    return (
                      <button
                        key={choice}
                        onClick={() => select(p.id, choice)}
                        style={{
                          flex: 1,
                          padding: '0.6rem 0.5rem',
                          background: isSelected ? `${color}12` : 'transparent',
                          border: `1px solid ${isSelected ? color : '#1e2a38'}`,
                          color: isSelected ? color : 'var(--text-muted)',
                          fontFamily: 'inherit',
                          fontSize: '0.8rem',
                          letterSpacing: '0.08em',
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>
                <button
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '0.75rem' }}
                  onClick={() => confirm(p.id)}
                  disabled={!selections[p.id]}
                >
                  Valider mon vote
                </button>
              </>
            )}
          </div>
        )
      })}
    </div>
  )
}
