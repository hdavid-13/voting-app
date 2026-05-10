'use client'
import { useVote } from './useVote'
import { useAnonVote } from './useAnonVote'

const ANON_MODE = false // 👈 change à true pour le mode anonyme

export default function VotePage() {
  const auth = useVote()
  const anon = useAnonVote()

  const { proposals, selections, loading, error, votedProposals, select, confirm } =
    ANON_MODE ? anon : auth

  const handleLogout = !ANON_MODE ? auth.handleLogout : undefined

  if (loading) return <p style={{ textAlign: 'center' }}>Chargement...</p>

  return (
    <div className="container">

      {/* Encart mode anonyme */}
      {ANON_MODE && (
        <div style={{
          backgroundColor: 'rgba(255, 200, 0, 0.15)',
          border: '1px solid rgba(255, 200, 0, 0.5)',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <span style={{ fontSize: '1.2rem' }}>👤</span>
          <div>
            <p style={{ fontWeight: 'bold', margin: 0 }}>Mode anonyme activé</p>
            <p style={{ fontSize: '0.85rem', margin: 0, opacity: 0.8 }}>
              Ton vote n'est pas lié à un compte. Ton navigateur retient que tu as déjà voté,
              mais vider tes données te permettrait de revoter.
            </p>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>🗳️ Votes en cours</h1>
        {handleLogout && (
          <button
            onClick={handleLogout}
            style={{ backgroundColor: 'rgba(118, 87, 255, 0.8)' }}
            className="btn-primary"
          >
            Se déconnecter
          </button>
        )}
      </div>

      {error && (
        <p style={{ color: 'red', marginBottom: '16px' }}>{error}</p>
      )}

      {proposals.map((p) => (
        <div
          key={p.id}
          className="card"
          style={ANON_MODE ? { borderLeft: '4px solid rgba(255, 200, 0, 0.6)' } : {}}
        >
          <h2 className="title">{p.title}</h2>
          <p className="subtitle">{p.description}</p>

          {votedProposals.has(p.id) ? (
            <p style={{ color: 'green', fontWeight: 'bold' }}>
              ✅ Tu as voté : {selections[p.id]}
            </p>
          ) : (
            <>
              <div>
                {(['YES', 'NO', 'ABSTAIN'] as const).map((choice) => (
                  <label
                    key={choice}
                    className="label"
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                  >
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
            </>
          )}
        </div>
      ))}
    </div>
  )
}
