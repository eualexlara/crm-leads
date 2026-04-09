'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type GastoTrafego = {
  id: number
  data: string
  valor: number
  campanha: string | null
}

type ItemFormulario = {
  campanha: string
  valor: string
}

const campanhas = [
  'Mulheres - Cinza',
  'Mulheres - Preta',
  'Mulheres - Amarela',
  'Mulheres - Azul',
  'Mulheres - Cinza nova',
  'Homens - Cinza',
  'Homens - Preta',
  'Homens - Amarela',
]

export default function Trafego() {
  const [gastos, setGastos] = useState<GastoTrafego[]>([])
  const [data, setData] = useState(new Date().toISOString().split('T')[0])
  const [itens, setItens] = useState<ItemFormulario[]>([
    { campanha: '', valor: '' },
  ])
  const [diaAberto, setDiaAberto] = useState<string | null>(null)

  useEffect(() => {
    buscarGastos()
  }, [])

  async function buscarGastos() {
    const { data, error } = await supabase
      .from('trafego')
      .select('*')
      .order('data', { ascending: false })
      .order('id', { ascending: false })

    if (error) {
      alert('Erro ao buscar tráfego: ' + error.message)
      return
    }

    setGastos(data || [])
  }

  function adicionarLinha() {
    setItens([...itens, { campanha: '', valor: '' }])
  }

  function removerLinha(index: number) {
    if (itens.length === 1) return

    const novosItens = itens.filter((_, i) => i !== index)
    setItens(novosItens)
  }

  function atualizarItem(
    index: number,
    campo: 'campanha' | 'valor',
    valor: string
  ) {
    const novosItens = [...itens]
    novosItens[index][campo] = valor
    setItens(novosItens)
  }

  function limparFormulario() {
    setData(new Date().toISOString().split('T')[0])
    setItens([{ campanha: '', valor: '' }])
  }

  async function salvarTudo() {
    const itensValidos = itens.filter((item) => item.campanha && item.valor)

    if (itensValidos.length === 0) {
      alert('Preencha pelo menos uma campanha com valor')
      return
    }

    for (const item of itensValidos) {
      const valorNumero = Number(item.valor.replace(',', '.'))

      if (isNaN(valorNumero)) {
        alert('Existe valor inválido no formulário')
        return
      }

      const { error } = await supabase.from('trafego').insert([
        {
          data,
          campanha: item.campanha,
          valor: valorNumero,
        },
      ])

      if (error) {
        alert('Erro ao salvar tráfego: ' + error.message)
        return
      }
    }

    alert('Gastos salvos com sucesso!')
    limparFormulario()
    buscarGastos()
  }

  function inputStyle() {
    return {
      padding: 14,
      border: '1px solid #d1d5db',
      borderRadius: 12,
      background: '#ffffff',
      fontSize: 15,
      outline: 'none',
    }
  }

  function buttonStyle(variant: 'primary' | 'secondary' | 'danger') {
    if (variant === 'primary') {
      return {
        padding: '12px 18px',
        border: '1px solid #2563eb',
        borderRadius: 12,
        background: '#2563eb',
        color: '#ffffff',
        cursor: 'pointer',
        fontWeight: 700,
        boxShadow: '0 10px 24px rgba(37, 99, 235, 0.25)',
      }
    }

    if (variant === 'danger') {
      return {
        padding: '10px 14px',
        border: '1px solid #ef4444',
        borderRadius: 12,
        background: '#ffffff',
        color: '#ef4444',
        cursor: 'pointer',
        fontWeight: 700,
      }
    }

    return {
      padding: '10px 14px',
      border: '1px solid #d1d5db',
      borderRadius: 12,
      background: '#ffffff',
      color: '#111827',
      cursor: 'pointer',
      fontWeight: 700,
    }
  }

  function cardStyle() {
    return {
      background: '#ffffff',
      borderRadius: 18,
      padding: 20,
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    }
  }

  const gastosAgrupados = useMemo(() => {
    const grupos: Record<string, GastoTrafego[]> = {}

    for (const gasto of gastos) {
      if (!grupos[gasto.data]) {
        grupos[gasto.data] = []
      }
      grupos[gasto.data].push(gasto)
    }

    return Object.entries(grupos).map(([data, itens]) => {
      const total = itens.reduce((acc, item) => acc + Number(item.valor || 0), 0)

      return {
        data,
        itens,
        total,
      }
    })
  }, [gastos])

  const totalGeral = gastos.reduce((acc, item) => acc + Number(item.valor || 0), 0)

  const totalFormulario = itens.reduce((acc, item) => {
    const valorNumero = Number((item.valor || '').replace(',', '.'))
    return acc + (isNaN(valorNumero) ? 0 : valorNumero)
  }, 0)

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 30,
        fontFamily: 'Arial',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%)',
      }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            marginBottom: 25,
            padding: 24,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #06b6d4 100%)',
            color: '#ffffff',
            boxShadow: '0 15px 40px rgba(37, 99, 235, 0.35)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 34 }}>Tráfego</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.95 }}>
            Lance várias campanhas no dia e acompanhe o total com detalhamento.
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            marginBottom: 24,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
              Total de dias lançados
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827' }}>
              {gastosAgrupados.length}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
              Total geral
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#dc2626' }}>
              R$ {totalGeral.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
              Total deste lançamento
            </div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827' }}>
              R$ {totalFormulario.toFixed(2)}
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle(), marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 18, color: '#111827' }}>
            Lançamento de tráfego
          </h2>

          <div style={{ maxWidth: 760, display: 'grid', gap: 12 }}>
            <input
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              style={inputStyle()}
            />

            {itens.map((item, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.5fr 1fr auto',
                  gap: 10,
                  alignItems: 'center',
                }}
              >
                <select
                  value={item.campanha}
                  onChange={(e) =>
                    atualizarItem(index, 'campanha', e.target.value)
                  }
                  style={inputStyle()}
                >
                  <option value="">Selecione a campanha</option>
                  {campanhas.map((campanha) => (
                    <option key={campanha} value={campanha}>
                      {campanha}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Valor"
                  value={item.valor}
                  onChange={(e) => atualizarItem(index, 'valor', e.target.value)}
                  style={inputStyle()}
                />

                <button
                  onClick={() => removerLinha(index)}
                  style={buttonStyle('danger')}
                >
                  Remover
                </button>
              </div>
            ))}

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={adicionarLinha} style={buttonStyle('secondary')}>
                + Adicionar campanha
              </button>

              <button onClick={salvarTudo} style={buttonStyle('primary')}>
                Salvar tudo
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: '#111827' }}>Histórico por dia</h2>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          {gastosAgrupados.map((grupo) => (
            <div key={grupo.data} style={cardStyle()}>
              <div
                onClick={() =>
                  setDiaAberto(diaAberto === grupo.data ? null : grupo.data)
                }
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  cursor: 'pointer',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                    Dia
                  </div>
                  <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
                    {grupo.data}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 4 }}>
                    Total do dia
                  </div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: '#dc2626' }}>
                    R$ {grupo.total.toFixed(2)}
                  </div>
                </div>
              </div>

              {diaAberto === grupo.data && (
                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 16,
                    borderTop: '1px solid #e5e7eb',
                    display: 'grid',
                    gap: 10,
                  }}
                >
                  {grupo.itens.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: 12,
                        padding: 12,
                        display: 'flex',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>
                          Campanha
                        </div>
                        <div style={{ fontWeight: 700, color: '#111827' }}>
                          {item.campanha || '-'}
                        </div>
                      </div>

                      <div>
                        <div style={{ color: '#6b7280', fontSize: 13 }}>
                          Valor
                        </div>
                        <div style={{ fontWeight: 700, color: '#dc2626' }}>
                          R$ {Number(item.valor).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}