'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Trafego = {
  id: number
  data: string
  valor: number
  campanha: string | null
}

const opcoesCampanha = [
  'Mulheres - Cinza',
  'Mulheres - Preta',
  'Mulheres - Amarela',
  'Mulheres - Azul',
  'Mulheres - Cinza nova',
  'Homens - Cinza',
  'Homens - Preta',
  'Homens - Amarela',
]

type LinhaCampanha = {
  campanha: string
  valor: string
}

export default function TrafegoPage() {
  const [registros, setRegistros] = useState<Trafego[]>([])
  const [dataLancamento, setDataLancamento] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [linhas, setLinhas] = useState<LinhaCampanha[]>([
    { campanha: '', valor: '' },
  ])

  useEffect(() => {
    buscarRegistros()
  }, [])

  async function buscarRegistros() {
    const { data, error } = await supabase
      .from('trafego')
      .select('id, data, valor, campanha')
      .order('data', { ascending: false })
      .order('id', { ascending: false })

    if (error) {
      alert('Erro ao buscar tráfego: ' + error.message)
      return
    }

    setRegistros((data as Trafego[]) || [])
  }

  function inputStyle(textoEscuro = true) {
    return {
      padding: 14,
      border: '1px solid #d1d5db',
      borderRadius: 12,
      background: '#ffffff',
      fontSize: 15,
      color: textoEscuro ? '#111827' : '#4b5563',
      outline: 'none',
      width: '100%',
      WebkitTextFillColor: textoEscuro ? '#111827' : '#4b5563',
      opacity: 1,
      boxSizing: 'border-box',
    } as const
  }

  function cardStyle() {
    return {
      background: '#ffffff',
      borderRadius: 18,
      padding: 20,
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    } as const
  }

  function buttonPrimaryStyle() {
    return {
      padding: '14px 18px',
      border: '1px solid #2563eb',
      borderRadius: 14,
      background: '#2563eb',
      color: '#ffffff',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 16,
      width: '100%',
      boxShadow: '0 10px 24px rgba(37, 99, 235, 0.25)',
    } as const
  }

  function buttonSecondaryStyle() {
    return {
      padding: '14px 18px',
      border: '1px solid #d1d5db',
      borderRadius: 14,
      background: '#ffffff',
      color: '#111827',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 16,
      width: '100%',
    } as const
  }

  function dangerButtonStyle() {
    return {
      padding: '10px 12px',
      border: '1px solid #ef4444',
      borderRadius: 10,
      background: '#ffffff',
      color: '#ef4444',
      cursor: 'pointer',
      fontWeight: 700,
    } as const
  }

  function adicionarLinha() {
    setLinhas([...linhas, { campanha: '', valor: '' }])
  }

  function removerLinha(index: number) {
    if (linhas.length === 1) return
    setLinhas(linhas.filter((_, i) => i !== index))
  }

  function atualizarLinha(
    index: number,
    campo: 'campanha' | 'valor',
    valor: string
  ) {
    const novasLinhas = [...linhas]
    novasLinhas[index][campo] = valor
    setLinhas(novasLinhas)
  }

  const totalLancamento = useMemo(() => {
    return linhas.reduce((acc, linha) => {
      const numero = Number(String(linha.valor).replace(',', '.'))
      if (isNaN(numero)) return acc
      return acc + numero
    }, 0)
  }, [linhas])

  const agrupadoPorDia = useMemo(() => {
    const mapa = new Map<
      string,
      {
        data: string
        total: number
        itens: Trafego[]
      }
    >()

    registros.forEach((item) => {
      const existente = mapa.get(item.data)

      if (existente) {
        existente.total += Number(item.valor)
        existente.itens.push(item)
      } else {
        mapa.set(item.data, {
          data: item.data,
          total: Number(item.valor),
          itens: [item],
        })
      }
    })

    return Array.from(mapa.values()).sort((a, b) =>
      a.data < b.data ? 1 : -1
    )
  }, [registros])

  async function salvarTudo() {
    if (!dataLancamento) {
      alert('Escolha a data')
      return
    }

    const validas = linhas.filter(
      (linha) =>
        linha.campanha.trim() !== '' &&
        linha.valor.trim() !== '' &&
        !isNaN(Number(linha.valor.replace(',', '.')))
    )

    if (validas.length === 0) {
      alert('Preencha pelo menos uma campanha com valor')
      return
    }

    const payload = validas.map((linha) => ({
      data: dataLancamento,
      campanha: linha.campanha,
      valor: Number(linha.valor.replace(',', '.')),
    }))

    const { error } = await supabase.from('trafego').insert(payload)

    if (error) {
      alert('Erro ao salvar tráfego: ' + error.message)
      return
    }

    alert('Tráfego salvo com sucesso!')
    setLinhas([{ campanha: '', valor: '' }])
    buscarRegistros()
  }

  async function excluirRegistro(id: number) {
    const confirmar = confirm('Tem certeza que deseja excluir este lançamento?')
    if (!confirmar) return

    const { error } = await supabase.from('trafego').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir: ' + error.message)
      return
    }

    buscarRegistros()
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 20,
        fontFamily: 'Arial, sans-serif',
        background:
          'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%)',
      }}
    >
      <style jsx global>{`
        input,
        select,
        textarea {
          color: #111827 !important;
          -webkit-text-fill-color: #111827 !important;
          opacity: 1 !important;
        }

        input::placeholder,
        textarea::placeholder {
          color: #4b5563 !important;
          opacity: 1 !important;
          -webkit-text-fill-color: #4b5563 !important;
        }

        select option {
          color: #111827 !important;
          background: #ffffff !important;
        }
      `}</style>

      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div
          style={{
            marginBottom: 24,
            padding: 24,
            borderRadius: 20,
            background:
              'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #06b6d4 100%)',
            color: '#ffffff',
            boxShadow: '0 15px 40px rgba(37, 99, 235, 0.35)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 34 }}>Tráfego</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.95 }}>
            Lance os gastos por campanha e acompanhe o histórico por dia.
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
            <div
              style={{
                color: '#6b7280',
                marginBottom: 8,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              Total deste lançamento
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: '#111827',
              }}
            >
              R$ {totalLancamento.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div
              style={{
                color: '#6b7280',
                marginBottom: 8,
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              Último total do dia
            </div>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                color: agrupadoPorDia[0] ? '#dc2626' : '#111827',
              }}
            >
              R$ {agrupadoPorDia[0] ? agrupadoPorDia[0].total.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle(), marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 18, color: '#111827' }}>
            Lançamento de tráfego
          </h2>

          <div style={{ display: 'grid', gap: 14 }}>
            <input
              type="date"
              value={dataLancamento}
              onChange={(e) => setDataLancamento(e.target.value)}
              style={inputStyle(true)}
            />

            {linhas.map((linha, index) => (
              <div
                key={index}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.2fr 1fr auto',
                  gap: 12,
                }}
              >
                <select
                  value={linha.campanha}
                  onChange={(e) =>
                    atualizarLinha(index, 'campanha', e.target.value)
                  }
                  style={inputStyle(!!linha.campanha)}
                >
                  <option value="">Selecione a campanha</option>
                  {opcoesCampanha.map((camp) => (
                    <option key={camp} value={camp}>
                      {camp}
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Valor"
                  value={linha.valor}
                  onChange={(e) =>
                    atualizarLinha(index, 'valor', e.target.value)
                  }
                  style={inputStyle(!!linha.valor)}
                />

                <button
                  onClick={() => removerLinha(index)}
                  style={dangerButtonStyle()}
                >
                  X
                </button>
              </div>
            ))}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 12,
              }}
            >
              <button onClick={adicionarLinha} style={buttonSecondaryStyle()}>
                + Adicionar campanha
              </button>

              <button onClick={salvarTudo} style={buttonPrimaryStyle()}>
                Salvar tudo
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: '#111827' }}>Histórico por dia</h2>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          {agrupadoPorDia.map((dia) => (
            <div key={dia.data} style={cardStyle()}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginBottom: 14,
                }}
              >
                <div>
                  <div style={{ color: '#6b7280', fontSize: 16 }}>Dia</div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#111827',
                    }}
                  >
                    {dia.data}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#6b7280', fontSize: 16 }}>
                    Total do dia
                  </div>
                  <div
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      color: '#dc2626',
                    }}
                  >
                    R$ {dia.total.toFixed(2)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gap: 10 }}>
                {dia.itens.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                      flexWrap: 'wrap',
                      padding: 14,
                      borderRadius: 14,
                      border: '1px solid #e5e7eb',
                      background: '#f8fafc',
                    }}
                  >
                    <div style={{ color: '#111827', fontWeight: 700 }}>
                      {item.campanha || '-'}
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div
                        style={{
                          color: '#dc2626',
                          fontWeight: 800,
                          fontSize: 20,
                        }}
                      >
                        R$ {Number(item.valor).toFixed(2)}
                      </div>

                      <button
                        onClick={() => excluirRegistro(item.id)}
                        style={dangerButtonStyle()}
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {agrupadoPorDia.length === 0 && (
            <div style={cardStyle()}>
              <div style={{ color: '#6b7280' }}>Nenhum lançamento encontrado.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}