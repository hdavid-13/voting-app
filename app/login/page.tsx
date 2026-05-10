'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('Email ou mot de passe incorrect')
    } else {
      router.push('/vote')
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>

        <h1 className="title text-center">Vote J42</h1>
        <p className="subtitle text-center">Connecte-toi pour voter</p>

        <form onSubmit={handleLogin}>

          <label className="label">Email</label>
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            required
          />

          <label className="label">Mot de passe</label>
          <input
            type="password"
            placeholder="Ton mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            required
          />

          {error && <p className="error">{error}</p>}

          <button type="submit" className="btn">
            Se connecter
          </button>

        </form>
      </div>
    </div>
  )
}
