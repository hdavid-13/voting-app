'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function SetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Supabase lit automatiquement le hash de l'URL et crée la session
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setReady(true)
      } else {
        // Attendre que Supabase traite le hash
        const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
          if (session) {
            setReady(true)
            listener.subscription.unsubscribe()
          }
        })
      }
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (password.length < 6) {
      setError('Minimum 6 caractères')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
    } else {
      router.push('/vote')
    }

    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>

        <h1 className="title text-center">Vote J42</h1>
        <p className="subtitle text-center">Définis ton mot de passe</p>

        {!ready ? (
          <p className="subtitle text-center">Chargement...</p>
        ) : (
          <form onSubmit={handleSubmit}>
            <label className="label">Mot de passe</label>
            <input
              type="password"
              placeholder="Ton mot de passe"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="input"
              required
            />

            <label className="label">Confirmer le mot de passe</label>
            <input
              type="password"
              placeholder="Confirme ton mot de passe"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              className="input"
              required
            />

            {error && <p className="error">{error}</p>}

            <button type="submit" className="btn" disabled={loading}>
              {loading ? 'Chargement...' : 'Confirmer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
