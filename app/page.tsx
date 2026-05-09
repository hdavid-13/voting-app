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
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-xl shadow w-96">
        
        <h1 className="text-2xl font-bold text-center mb-6">
          🗳️ Vote Asso
        </h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          
          <input
            type="email"
            placeholder="Ton email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded-lg p-3"
            required
          />
          
          <input
            type="password"
            placeholder="Ton mot de passe"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="border rounded-lg p-3"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
          >
            Se connecter
          </button>

        </form>
      </div>
    </div>
  )
}
