'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Trafego = {
  id: number
  data: string
  valor: number
  campanha: string | null
}

type Lead = {
  id: number
  campanha: string | null
  origem_lead: string | null
  data_entrada: string | null
}

type Venda = {
  id: number
  lead_id: number
  valor_venda: number
  custo_servico: number
  data_venda: string
}

const opcoesCampanha = [
  'Celular 1 - Mulheres - Cinza',
  'Celular 1 - Mulheres - Preta',
  'Celular 1 - Mulheres - Amarela',
  'Celular 1 - Mulheres - Azul',
  'Celular 1 - Mulheres - Cinza nova',
  'Celular 1 - Homens - Cinza',
  'Celular 1 - Homens - Preta',
  'Celular 1 - Homens - Amarela',
  'Celular 2 - Mulheres - Cinza',
  'Celular 2 - Mulheres - Preta',
  'Celular 2 - Mulheres - Amarela',
  'Celular 2 - Mulheres - Azul',
  'Celular 2 - Mulheres - Cinza nova',
  'Celular 2 - Homens - Cinza',
  'Celular 2 - Homens - Preta',
  'Celular 2 - Homens - Amarela',
]

type LinhaCampanha = {
  campanha: string
  valor: string
}

type ResumoCampanha = {
  campanha: string
  gasto: number
  leads: number
  vendas: number
  faturamento: number
  custoPorLead: number
  roi: number
}

export default function TrafegoPage() {
  const [registros, setRegistros] = useState<Trafego[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])

  const [dataLancamento, setDataLancamento] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [linhas, setLinhas] = useState<LinhaCampanha[]>([
    { campanha: '', valor: '' },
  ])
  const [diaAberto, setDiaAberto] = useState<string | null>(null)

  const hoje = new Date().toISOString().split('T')[0]
  const primeiroDiaMes = new Date(
    new Date().getFullYear(),
    new Date().getMonth(),
    1
  )
    .toISOString()
    .split('T')[0]

  const [campanhaSelecionada, setCampanhaSelecionada] = useState('todas')
  const [dataInicioRelatorio, setDataInicioRelatorio] = useState(primeiroDiaMes)
  const [dataFimRelatorio, setDataFimRelatorio] = useState(hoje)

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

    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('id, campanha, origem_lead, data_entrada')

    if (leadsError) {
      alert('Erro ao buscar leads: ' + leadsError.message)
      return
    }

    const { data: vendasData, error: vendasError } = await supabase
      .from('vendas')
      .select('id, lead_id, valor_venda, custo_servico, data_venda')

    if (vendasError) {
      alert('Erro ao buscar vendas: ' + vendasError.message)
      return
    }

    setRegistros((data as Trafego[]) || [])
    setLeads((leadsData as Lead[]) || [])
    setVendas((vendasData as Venda[]) || [])
  }

  function inputStyle(textoEscuro = true) {
    return {
      padding: 12,
      border: '1px solid #d1d5db',
      borderRadius: 10,
      background: '#ffffff',
      fontSize: 14,
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
      borderRadius: 16,
      padding: 16,
      border: '1px solid rgba(255,255,255,0.4)',
      boxShadow: '0 8px 22px rgba(0,0,0,0.07)',
    } as const
  }

  function buttonPrimaryStyle() {
    return {
      padding: '12px 16px',
      border: '1px solid #2563eb',
      borderRadius: 12,
      background: '#2563eb',
      color: '#ffffff',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 15,
      width: '100%',
      boxShadow: '0 8px 20px rgba(37, 99, 235, 0.2)',
    } as const
  }

  function buttonSecondaryStyle() {
    return {
      padding: '12px 16px',
      border: '1px solid #d1d5db',
      borderRadius: 12,
      background: '#ffffff',
      color: '#111827',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 15,
      width: '100%',
    } as const
  }

  function dangerButtonStyle() {
    return {
      padding: '6px 10px',
      border: '1px solid #ef4444',
      borderRadius: 9,
      background: '#ffffff',
      color: '#ef4444',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 13,
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

  function dataDentroRelatorio(data: string | null) {
    if (!data) return false
    const dataTexto = data.slice(0, 10)
    return dataTexto >= dataInicioRelatorio && dataTexto <= dataFimRelatorio
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

  const leadsRelatorio = useMemo(() => {
    return leads.filter(
      (lead) =>
        lead.origem_lead === 'anuncio' &&
        dataDentroRelatorio(lead.data_entrada)
    )
  }, [leads, dataInicioRelatorio, dataFimRelatorio])

  const resumoPorCampanha = useMemo<ResumoCampanha[]>(() => {
    return opcoesCampanha.map((campanha) => {
      const gastosCampanha = registros.filter(
        (item) =>
          item.campanha === campanha &&
          dataDentroRelatorio(item.data)
      )

      const leadsCampanha = leadsRelatorio.filter(
        (lead) => lead.campanha === campanha
      )

      const idsLeadsCampanha = new Set(leadsCampanha.map((lead) => lead.id))

      const vendasCampanha = vendas.filter(
        (venda) =>
          idsLeadsCampanha.has(venda.lead_id) &&
          dataDentroRelatorio(venda.data_venda)
      )

      const gasto = gastosCampanha.reduce(
        (acc, item) => acc + Number(item.valor || 0),
        0
      )

      const faturamento = vendasCampanha.reduce(
        (acc, venda) => acc + Number(venda.valor_venda || 0),
        0
      )

      const leadsCount = leadsCampanha.length
      const vendasCount = vendasCampanha.length

      return {
        campanha,
        gasto,
        leads: leadsCount,
        vendas: vendasCount,
        faturamento,
        custoPorLead: leadsCount > 0 ? gasto / leadsCount : 0,
        roi: gasto > 0 ? faturamento / gasto : 0,
      }
    })
  }, [registros, leadsRelatorio, vendas, dataInicioRelatorio, dataFimRelatorio])

  const resumoSelecionado = useMemo(() => {
    if (campanhaSelecionada === 'todas') {
      const gasto = resumoPorCampanha.reduce((acc, item) => acc + item.gasto, 0)
      const leadsCount = resumoPorCampanha.reduce((acc, item) => acc + item.leads, 0)
      const vendasCount = resumoPorCampanha.reduce((acc, item) => acc + item.vendas, 0)
      const faturamento = resumoPorCampanha.reduce((acc, item) => acc + item.faturamento, 0)

      return {
        campanha: 'Todas as campanhas',
        gasto,
        leads: leadsCount,
        vendas: vendasCount,
        faturamento,
        custoPorLead: leadsCount > 0 ? gasto / leadsCount : 0,
        roi: gasto > 0 ? faturamento / gasto : 0,
      }
    }

    return (
      resumoPorCampanha.find((item) => item.campanha === campanhaSelecionada) || {
        campanha: campanhaSelecionada,
        gasto: 0,
        leads: 0,
        vendas: 0,
        faturamento: 0,
        custoPorLead: 0,
        roi: 0,
      }
    )
  }, [campanhaSelecionada, resumoPorCampanha])

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

  function alternarDia(data: string) {
    setDiaAberto((atual) => (atual === data ? null : data))
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <div style={cardStyle()}>
            <div
              style={{
                color: '#6b7280',
                marginBottom: 6,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Total deste lançamento
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
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
                marginBottom: 6,
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              Último total do dia
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: agrupadoPorDia[0] ? '#dc2626' : '#111827',
              }}
            >
              R$ {agrupadoPorDia[0] ? agrupadoPorDia[0].total.toFixed(2) : '0.00'}
            </div>
          </div>
        </div>

        <div style={{ ...cardStyle(), marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, color: '#111827', fontSize: 24 }}>
            Lançamento de tráfego
          </h2>

          <div style={{ display: 'grid', gap: 10 }}>
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
                  gap: 10,
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
                gap: 10,
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

        <div style={{ ...cardStyle(), marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, color: '#111827', fontSize: 24 }}>
            Relatório por campanha
          </h2>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 10,
              marginBottom: 16,
            }}
          >
            <select
              value={campanhaSelecionada}
              onChange={(e) => setCampanhaSelecionada(e.target.value)}
              style={inputStyle(true)}
            >
              <option value="todas">Todas as campanhas</option>
              {opcoesCampanha.map((campanha) => (
                <option key={campanha} value={campanha}>
                  {campanha}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dataInicioRelatorio}
              onChange={(e) => setDataInicioRelatorio(e.target.value)}
              style={inputStyle(true)}
            />

            <input
              type="date"
              value={dataFimRelatorio}
              onChange={(e) => setDataFimRelatorio(e.target.value)}
              style={inputStyle(true)}
            />
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div style={cardStyle()}>
              <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>Campanha</div>
              <div style={{ color: '#111827', fontSize: 16, fontWeight: 700 }}>
                {resumoSelecionado.campanha}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>Gasto</div>
              <div style={{ color: '#dc2626', fontSize: 20, fontWeight: 700 }}>
                R$ {resumoSelecionado.gasto.toFixed(2)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>Leads</div>
              <div style={{ color: '#111827', fontSize: 20, fontWeight: 700 }}>
                {resumoSelecionado.leads}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>Vendas</div>
              <div style={{ color: '#111827', fontSize: 20, fontWeight: 700 }}>
                {resumoSelecionado.vendas}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>Faturamento</div>
              <div style={{ color: '#16a34a', fontSize: 20, fontWeight: 700 }}>
                R$ {resumoSelecionado.faturamento.toFixed(2)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>Custo por lead</div>
              <div style={{ color: '#111827', fontSize: 20, fontWeight: 700 }}>
                R$ {resumoSelecionado.custoPorLead.toFixed(2)}
              </div>
            </div>

            <div style={cardStyle()}>
              <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 4 }}>ROI</div>
              <div style={{ color: '#111827', fontSize: 20, fontWeight: 700 }}>
                {resumoSelecionado.roi.toFixed(2)}x
              </div>
            </div>
          </div>

          <div style={{ marginBottom: 10, color: '#111827', fontWeight: 700, fontSize: 16 }}>
            Resumo de todas as campanhas no período
          </div>

          <div style={{ display: 'grid', gap: 8 }}>
            {resumoPorCampanha.map((item) => (
              <div
                key={item.campanha}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1.4fr repeat(5, minmax(90px, 1fr))',
                  gap: 10,
                  alignItems: 'center',
                  padding: 10,
                  borderRadius: 12,
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc',
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 14, color: '#111827' }}>
                  {item.campanha}
                </div>

                <div style={{ fontSize: 13, color: '#111827' }}>
                  <span style={{ color: '#6b7280' }}>Gasto:</span><br />
                  <b>R$ {item.gasto.toFixed(2)}</b>
                </div>

                <div style={{ fontSize: 13, color: '#111827' }}>
                  <span style={{ color: '#6b7280' }}>Leads:</span><br />
                  <b>{item.leads}</b>
                </div>

                <div style={{ fontSize: 13, color: '#111827' }}>
                  <span style={{ color: '#6b7280' }}>Vendas:</span><br />
                  <b>{item.vendas}</b>
                </div>

                <div style={{ fontSize: 13, color: '#111827' }}>
                  <span style={{ color: '#6b7280' }}>Faturamento:</span><br />
                  <b>R$ {item.faturamento.toFixed(2)}</b>
                </div>

                <div style={{ fontSize: 13, color: '#111827' }}>
                  <span style={{ color: '#6b7280' }}>CPL:</span><br />
                  <b>R$ {item.custoPorLead.toFixed(2)}</b>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: 24 }}>Histórico por dia</h2>
        </div>

        <div style={{ display: 'grid', gap: 18 }}>
          {agrupadoPorDia.map((dia) => {
            const aberto = diaAberto === dia.data

            return (
              <div key={dia.data} style={cardStyle()}>
                <div
                  onClick={() => alternarDia(dia.data)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                    cursor: 'pointer',
                  }}
                >
                  <div>
                    <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>Dia</div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#111827',
                      }}
                    >
                      {dia.data}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ color: '#6b7280', fontSize: 13, marginBottom: 2 }}>
                      Total do dia
                    </div>
                    <div
                      style={{
                        fontSize: 20,
                        fontWeight: 700,
                        color: '#dc2626',
                      }}
                    >
                      R$ {dia.total.toFixed(2)}
                    </div>
                  </div>
                </div>

                {aberto && (
                  <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                    {dia.itens.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 10,
                          flexWrap: 'wrap',
                          padding: 10,
                          borderRadius: 12,
                          border: '1px solid #e5e7eb',
                          background: '#f8fafc',
                        }}
                      >
                        <div
                          style={{
                            color: '#111827',
                            fontWeight: 600,
                            fontSize: 14,
                            lineHeight: 1.3,
                          }}
                        >
                          {item.campanha || '-'}
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            flexWrap: 'wrap',
                          }}
                        >
                          <div
                            style={{
                              color: '#dc2626',
                              fontWeight: 700,
                              fontSize: 16,
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
                )}
              </div>
            )
          })}

          {agrupadoPorDia.length === 0 && (
            <div style={cardStyle()}>
              <div style={{ color: '#6b7280', fontSize: 14 }}>Nenhum lançamento encontrado.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}