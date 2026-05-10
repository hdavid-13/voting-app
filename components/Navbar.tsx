'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const pathname = usePathname()
  const showNavbar = pathname !== '/login'

  if (!showNavbar) return null
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const links = [
    { href: '/vote', label: 'votes' },
    { href: '/dashboard', label: 'dashboard' },
  ]

  return (
    <nav style={{
      borderBottom: '1px solid #162030',
      borderTop: '1px solid var(--accent)',
      background: 'var(--bg-secondary)',
      padding: '1.25rem 1rem',
    }}>
      <div style={{
        maxWidth: '640px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        {/* Logo */}
        <span style={{ color: 'var(--gold)', fontSize: '0.85rem', letterSpacing: '0.1em' }}>
          {'>'} <span style={{ color: 'var(--accent)' }}>vote_app</span>
        </span>

        {/* Links + logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          {links.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                fontSize: '0.8rem',
                letterSpacing: '0.08em',
                color: pathname === href ? 'var(--accent)' : 'var(--text-secondary)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
            >
              {pathname === href ? `> ${label}` : `// ${label}`}
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="btn-primary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
          >
            exit
          </button>
        </div>
      </div>
    </nav>
  )
}
