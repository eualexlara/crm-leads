'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Lead = {
  id: number
  data_entrada: string | null
  origem_lead?: string | null
}

type Venda = {
  id: number
  lead_id: number
  valor_venda: number
  custo_servico: number
  data_venda: string
  etiquetas: string[] | null
}

type Trafego = {
  id: number
  valor: number
  data: string
}

export default function Dashboard() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [trafego, setTrafego] = useState<Trafego[]>([])

  const hoje = new Date().toISOString().split('T')[0]

  const [filtro, setFiltro] = useState<'hoje' | 'mes' | 'todos' | 'personalizado'>('todos')
  const [filtroOrigem, setFiltroOrigem] = useState<'todos' | 'anuncio' | 'lead_antigo'>('todos')
  const [dataInicio, setDataInicio] = useState(hoje)
  const [dataFim, setDataFim] = useState(hoje)

  useEffect(() => {
    buscarDados()
  }, [])

  async function buscarDados() {
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('id, data_entrada, origem_lead')

    if (leadsError) {
      alert('Erro ao buscar leads: ' + leadsError.message)
      return
    }

    const { data: vendasData, error: vendasError } = await supabase
      .from('vendas')
      .select('id, lead_id, valor_venda, custo_servico, data_venda, etiquetas')

    if (vendasError) {
      alert('Erro ao buscar vendas: ' + vendasError.message)
      return
    }

    const { data: trafegoData, error: trafegoError } = await supabase
      .from('trafego')
      .select('id, valor, data')

    if (trafegoError) {
      alert('Erro ao buscar tráfego: ' + trafegoError.message)
      return
    }

    setLeads((leadsData as Lead[]) || [])
    setVendas((vendasData as Venda[]) || [])
    setTrafego(trafegoData || [])
  }

  function dataEstaNoFiltro(data: string | null) {
    if (!data) return false

    const dataTexto = data.slice(0, 10)
    const hojeTexto = new Date().toISOString().slice(0, 10)

    if (filtro === 'todos') return true

    if (filtro === 'hoje') {
      return dataTexto === hojeTexto
    }

    if (filtro === 'mes') {
      const agora = new Date()
      const anoAtual = agora.getFullYear()
      const mesAtual = agora.getMonth()

      const dataObj = new Date(dataTexto + 'T00:00:00')
      return (
        dataObj.getFullYear() === anoAtual &&
        dataObj.getMonth() === mesAtual
      )
    }

    if (filtro === 'personalizado') {
      return dataTexto >= dataInicio && dataTexto <= dataFim
    }

    return true
  }

  const leadsFiltradosPorData = useMemo(() => {
    return leads.filter((item) => dataEstaNoFiltro(item.data_entrada))
  }, [leads, filtro, dataInicio, dataFim])

  const leadsAnuncio = useMemo(() => {
    return leadsFiltradosPorData.filter((item) => item.origem_lead === 'anuncio')
  }, [leadsFiltradosPorData])

  const leadsAntigos = useMemo(() => {
    return leadsFiltradosPorData.filter((item) => item.origem_lead === 'lead_antigo')
  }, [leadsFiltradosPorData])

  const leadsFiltrados = useMemo(() => {
    if (filtroOrigem === 'anuncio') return leadsAnuncio
    if (filtroOrigem === 'lead_antigo') return leadsAntigos
    return leadsFiltradosPorData
  }, [filtroOrigem, leadsAnuncio, leadsAntigos, leadsFiltradosPorData])

  const idsLeadsAnuncio = useMemo(() => {
    return new Set(
      leads
        .filter((item) => item.origem_lead === 'anuncio')
        .map((item) => item.id)
    )
  }, [leads])

  const idsLeadsAntigos = useMemo(() => {
    return new Set(
      leads
        .filter((item) => item.origem_lead === 'lead_antigo')
        .map((item) => item.id)
    )
  }, [leads])

  const vendasFiltradasPorData = useMemo(() => {
    return vendas.filter((item) => dataEstaNoFiltro(item.data_venda))
  }, [vendas, filtro, dataInicio, dataFim])

  const vendasFiltradas = useMemo(() => {
    if (filtroOrigem === 'anuncio') {
      return vendasFiltradasPorData.filter((item) => idsLeadsAnuncio.has(item.lead_id))
    }

    if (filtroOrigem === 'lead_antigo') {
      return vendasFiltradasPorData.filter((item) => idsLeadsAntigos.has(item.lead_id))
    }

    return vendasFiltradasPorData
  }, [vendasFiltradasPorData, filtroOrigem, idsLeadsAnuncio, idsLeadsAntigos])

  const trafegoFiltradoPorData = useMemo(() => {
    return trafego.filter((item) => dataEstaNoFiltro(item.data))
  }, [trafego, filtro, dataInicio, dataFim])

  const trafegoFiltrado = useMemo(() => {
    if (filtroOrigem === 'lead_antigo') return []
    return trafegoFiltradoPorData
  }, [trafegoFiltradoPorData, filtroOrigem])

  const totalLeads = leadsFiltrados.length
  const totalVendas = vendasFiltradas.length

  const faturamento = vendasFiltradas.reduce((acc, item) => {
    return acc + Number(item.valor_venda || 0)
  }, 0)

  const custoServico = vendasFiltradas.reduce((acc, item) => {
    return acc + Number(item.custo_servico || 0)
  }, 0)

  const custoTrafego = trafegoFiltrado.reduce((acc, item) => {
    return acc + Number(item.valor || 0)
  }, 0)

  const custoTotal = custoServico + custoTrafego
  const lucro = faturamento - custoTotal

  const ticketMedio = totalVendas > 0 ? faturamento / totalVendas : 0
  const custoPorLead = totalLeads > 0 ? custoTrafego / totalLeads : 0
  const roi = custoTrafego > 0 ? faturamento / custoTrafego : 0

  const vendasRecompra = vendasFiltradas.filter((item) =>
    (item.etiquetas || []).includes('recompra')
  )

  const vendasPrimeiraVenda = vendasFiltradas.filter((item) =>
    (item.etiquetas || []).includes('primeira_venda')
  )

  const faturamentoRecompra = vendasRecompra.reduce((acc, item) => {
    return acc + Number(item.valor_venda || 0)
  }, 0)

  const faturamentoPrimeiraVenda = vendasPrimeiraVenda.reduce((acc, item) => {
    return acc + Number(item.valor_venda || 0)
  }, 0)

  const porcentagemRecompra =
    totalVendas > 0 ? (vendasRecompra.length / totalVendas) * 100 : 0

  const clientesQueVoltaram = new Set(
    vendasRecompra.map((item) => item.lead_id)
  ).size

  function botaoStyle(ativo: boolean) {
    return {
      padding: '8px 14px',
      border: ativo ? '1px solid #2563eb' : '1px solid #d1d5db',
      borderRadius: 12,
      background: ativo ? '#2563eb' : '#ffffff',
      color: ativo ? '#ffffff' : '#111827',
      cursor: 'pointer',
      fontWeight: 600 as const,
      fontSize: 15,
      boxShadow: ativo
        ? '0 6px 16px rgba(37, 99, 235, 0.18)'
        : '0 1px 4px rgba(0,0,0,0.04)',
      minHeight: 42,
    }
  }

  function cardStyle() {
    return {
      background: '#ffffff',
      borderRadius: 14,
      padding: 16,
      boxShadow: '0 6px 18px rgba(0,0,0,0.06)',
      border: '1px solid rgba(255,255,255,0.35)',
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 20,
        fontFamily: 'Arial',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
        }}
      >
        <div
          style={{
            marginBottom: 18,
            padding: 18,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #06b6d4 100%)',
            color: '#fff',
            boxShadow: '0 10px 24px rgba(37, 99, 235, 0.24)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 28 }}>Dashboard</h1>
          <p style={{ marginTop: 6, marginBottom: 0, opacity: 0.95, fontSize: 15, lineHeight: 1.4 }}>
            Visão geral do seu CRM, vendas, custos, lucro e recompra.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          <button onClick={() => setFiltro('hoje')} style={botaoStyle(filtro === 'hoje')}>
            Hoje
          </button>

          <button onClick={() => setFiltro('mes')} style={botaoStyle(filtro === 'mes')}>
            Este mês
          </button>

          <button onClick={() => setFiltro('todos')} style={botaoStyle(filtro === 'todos')}>
            Todos
          </button>

          <button
            onClick={() => setFiltro('personalizado')}
            style={botaoStyle(filtro === 'personalizado')}
          >
            Personalizado
          </button>
        </div>

        {filtro === 'personalizado' && (
          <div
            style={{
              ...cardStyle(),
              marginBottom: 14,
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ marginBottom: 6, fontWeight: 600, color: '#374151', fontSize: 14 }}>
                Data inicial
              </div>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                style={{
                  padding: 10,
                  border: '1px solid #d1d5db',
                  borderRadius: 10,
                  background: '#fff',
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <div style={{ marginBottom: 6, fontWeight: 600, color: '#374151', fontSize: 14 }}>
                Data final
              </div>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                style={{
                  padding: 10,
                  border: '1px solid #d1d5db',
                  borderRadius: 10,
                  background: '#fff',
                  fontSize: 14,
                }}
              />
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
          <button
            onClick={() => setFiltroOrigem('todos')}
            style={botaoStyle(filtroOrigem === 'todos')}
          >
            Todos os leads
          </button>

          <button
            onClick={() => setFiltroOrigem('anuncio')}
            style={botaoStyle(filtroOrigem === 'anuncio')}
          >
            Leads de anúncio
          </button>

          <button
            onClick={() => setFiltroOrigem('lead_antigo')}
            style={botaoStyle(filtroOrigem === 'lead_antigo')}
          >
            Leads antigos
          </button>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
            gap: 14,
            marginBottom: 14,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Leads
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{totalLeads}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Leads de anúncio
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              {leadsAnuncio.length}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Leads antigos
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              {leadsAntigos.length}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Vendas
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>{totalVendas}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Faturamento
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>
              R$ {faturamento.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Lucro
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: lucro >= 0 ? '#16a34a' : '#dc2626',
              }}
            >
              R$ {lucro.toFixed(2)}
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
            marginBottom: 18,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Custo de serviço
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              R$ {custoServico.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Custo de tráfego
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              R$ {custoTrafego.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Custo total
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              R$ {custoTotal.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Ticket médio
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              R$ {ticketMedio.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Custo por lead
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              R$ {custoPorLead.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              ROI
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              {roi.toFixed(2)}x
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 10 }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: 20 }}>Métricas de recompra</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 14,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Faturamento de primeira venda
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              R$ {faturamentoPrimeiraVenda.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Faturamento de recompra
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              R$ {faturamentoRecompra.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Porcentagem de recompra
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              {porcentagemRecompra.toFixed(1)}%
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 6, fontWeight: 600, fontSize: 14 }}>
              Clientes que voltaram
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827' }}>
              {clientesQueVoltaram}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}