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

  // Au début de ton composant (avec les autres useState)
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="container">
      <div className="card">
        <h2 className="title">Connexion</h2>

        <form onSubmit={handleLogin}>

          {/* Champ Email */}
          <label htmlFor="email" className="label">
            Adresse email
          </label>
          <input
            id="email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="input"
            required
          />

          {/* Champ Mot de passe */}
          <label htmlFor="password" className="label">
            Mot de passe
          </label>
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="input"
            required
          />

          {/* Message d'erreur */}
          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={isLoading}
            className="btn"
          >
            {isLoading ? 'Connexion en cours...' : 'Se connecter'}
          </button>

        </form>
      </div>
    </div>
  )






}
