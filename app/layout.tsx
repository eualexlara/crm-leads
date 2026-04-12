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
    const ativo = pathname === path

    return {
      textDecoration: 'none',
      fontWeight: 700,
      fontSize: 14,
      padding: '8px 14px',
      borderRadius: 10,
      border: ativo ? '1px solid #2563eb' : '1px solid #e5e7eb',
      background: ativo ? '#2563eb' : '#ffffff',
      color: ativo ? '#ffffff' : '#111827',
      boxShadow: ativo
        ? '0 6px 16px rgba(37, 99, 235, 0.18)'
        : '0 1px 4px rgba(0,0,0,0.04)',
      whiteSpace: 'nowrap' as const,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 38,
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
                padding: '12px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  fontSize: 18,
                  fontWeight: 800,
                  color: '#111827',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                CRM Leads
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  flex: 1,
                  minWidth: 0,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
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
              </div>

              <button
                onClick={sair}
                style={{
                  padding: '8px 14px',
                  borderRadius: 10,
                  border: '1px solid #ef4444',
                  background: '#ffffff',
                  color: '#ef4444',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  minHeight: 38,
                  flexShrink: 0,
                }}
              >
                Sair
              </button>
            </div>
          </div>
        )}

        {autorizado && children}
      </body>
    </html>
  )
}