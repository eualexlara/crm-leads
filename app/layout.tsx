'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()
  const [autorizado, setAutorizado] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const logado = localStorage.getItem('crm_logado') === 'sim'

    if (pathname === '/login') {
      setAutorizado(true)
      setCarregando(false)
      return
    }

    if (!logado) {
      router.push('/login')
      setAutorizado(false)
      setCarregando(false)
      return
    }

    setAutorizado(true)
    setCarregando(false)
  }, [pathname, router])

  function sair() {
    localStorage.removeItem('crm_logado')
    router.push('/login')
  }

  function getStyle(path: string) {
    return {
      textDecoration: 'none',
      fontWeight: 700,
      padding: '10px 16px',
      borderRadius: 10,
      border: '1px solid #e5e7eb',
      background: pathname === path ? '#2563eb' : '#ffffff',
      color: pathname === path ? '#ffffff' : '#111827',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
    }
  }

  if (carregando) {
    return (
      <html lang="pt-BR">
        <body style={{ margin: 0, fontFamily: 'Arial, sans-serif' }}>
          <div style={{ padding: 30 }}>Carregando...</div>
        </body>
      </html>
    )
  }

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          fontFamily: 'Arial, sans-serif',
          background: '#f8fafc',
        }}
      >
        {pathname !== '/login' && autorizado && (
          <div
            style={{
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              background: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)',
              borderBottom: '1px solid #e5e7eb',
              boxShadow: '0 4px 20px rgba(0,0,0,0.04)',
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: '0 auto',
                padding: '14px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 20,
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  color: '#111827',
                }}
              >
                CRM Leads
              </div>

              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  alignItems: 'center',
                }}
              >
                <Link href="/dashboard" style={getStyle('/dashboard')}>
                  Dashboard
                </Link>

                <Link href="/leads" style={getStyle('/leads')}>
                  Leads
                </Link>

                <Link href="/vendas" style={getStyle('/vendas')}>
                  Vendas
                </Link>

                <Link href="/trafego" style={getStyle('/trafego')}>
                  Tráfego
                </Link>

                <button
                  onClick={sair}
                  style={{
                    padding: '10px 16px',
                    borderRadius: 10,
                    border: '1px solid #ef4444',
                    background: '#ffffff',
                    color: '#ef4444',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}

        {autorizado && children}
      </body>
    </html>
  )
}