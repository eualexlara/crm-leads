'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  const [usuario, setUsuario] = useState('')
  const [senha, setSenha] = useState('')

  function fazerLogin() {
    const usuarioCorreto = 'admin'
    const senhaCorreta = '1234'

    if (usuario === usuarioCorreto && senha === senhaCorreta) {
      localStorage.setItem('crm_logado', 'sim')
      router.push('/dashboard')
      return
    }

    alert('Usuário ou senha inválidos')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
        fontFamily: 'Arial',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%)',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 420,
          background: '#ffffff',
          borderRadius: 20,
          padding: 28,
          boxShadow: '0 15px 40px rgba(0,0,0,0.10)',
        }}
      >
        <div
          style={{
            marginBottom: 20,
            padding: 20,
            borderRadius: 16,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #06b6d4 100%)',
            color: '#ffffff',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 30 }}>Login</h1>
          <p style={{ marginTop: 8, marginBottom: 0 }}>
            Entre para acessar seu CRM.
          </p>
        </div>

        <div style={{ display: 'grid', gap: 12 }}>
          <input
            type="text"
            placeholder="Usuário"
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            style={{
              padding: 14,
              border: '1px solid #d1d5db',
              borderRadius: 12,
              fontSize: 15,
            }}
          />

          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            style={{
              padding: 14,
              border: '1px solid #d1d5db',
              borderRadius: 12,
              fontSize: 15,
            }}
          />

          <button
            onClick={fazerLogin}
            style={{
              padding: '12px 18px',
              border: '1px solid #2563eb',
              borderRadius: 12,
              background: '#2563eb',
              color: '#ffffff',
              cursor: 'pointer',
              fontWeight: 700,
              boxShadow: '0 10px 24px rgba(37, 99, 235, 0.25)',
            }}
          >
            Entrar
          </button>
        </div>
      </div>
    </div>
  )
}