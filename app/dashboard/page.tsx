'use client'

import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Lead = {
  id: number
  data_entrada: string | null
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
  const [dataInicio, setDataInicio] = useState(hoje)
  const [dataFim, setDataFim] = useState(hoje)

  useEffect(() => {
    buscarDados()
  }, [])

  async function buscarDados() {
    const { data: leadsData, error: leadsError } = await supabase
      .from('leads')
      .select('id, data_entrada')

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

    setLeads(leadsData || [])
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

  const leadsFiltrados = useMemo(() => {
    return leads.filter((item) => dataEstaNoFiltro(item.data_entrada))
  }, [leads, filtro, dataInicio, dataFim])

  const vendasFiltradas = useMemo(() => {
    return vendas.filter((item) => dataEstaNoFiltro(item.data_venda))
  }, [vendas, filtro, dataInicio, dataFim])

  const trafegoFiltrado = useMemo(() => {
    return trafego.filter((item) => dataEstaNoFiltro(item.data))
  }, [trafego, filtro, dataInicio, dataFim])

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
      padding: '10px 16px',
      border: ativo ? '1px solid #2563eb' : '1px solid #d1d5db',
      borderRadius: 10,
      background: ativo ? '#2563eb' : '#ffffff',
      color: ativo ? '#ffffff' : '#111827',
      cursor: 'pointer',
      fontWeight: 600 as const,
      boxShadow: ativo
        ? '0 8px 20px rgba(37, 99, 235, 0.25)'
        : '0 2px 8px rgba(0,0,0,0.05)',
    }
  }

  function cardStyle() {
    return {
      background: '#ffffff',
      borderRadius: 16,
      padding: 20,
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
      border: '1px solid rgba(255,255,255,0.3)',
    }
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 30,
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
            marginBottom: 25,
            padding: 24,
            borderRadius: 20,
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #06b6d4 100%)',
            color: '#fff',
            boxShadow: '0 15px 40px rgba(37, 99, 235, 0.35)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 34 }}>Dashboard</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.95 }}>
            Visão geral do seu CRM, vendas, custos, lucro e recompra.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
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
              marginBottom: 20,
              display: 'flex',
              gap: 15,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ marginBottom: 6, fontWeight: 600, color: '#374151' }}>Data inicial</div>
              <input
                type="date"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                style={{
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 10,
                  background: '#fff',
                }}
              />
            </div>

            <div>
              <div style={{ marginBottom: 6, fontWeight: 600, color: '#374151' }}>Data final</div>
              <input
                type="date"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                style={{
                  padding: 12,
                  border: '1px solid #d1d5db',
                  borderRadius: 10,
                  background: '#fff',
                }}
              />
            </div>
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 18,
            marginBottom: 20,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Leads</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827' }}>{totalLeads}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Vendas</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#111827' }}>{totalVendas}</div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Faturamento</div>
            <div style={{ fontSize: 30, fontWeight: 700, color: '#16a34a' }}>
              R$ {faturamento.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Lucro</div>
            <div
              style={{
                fontSize: 30,
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
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
            marginBottom: 20,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Custo de serviço</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              R$ {custoServico.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Custo de tráfego</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              R$ {custoTrafego.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Custo total</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              R$ {custoTotal.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Ticket médio</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              R$ {ticketMedio.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>Custo por lead</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              R$ {custoPorLead.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>ROI</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              {roi.toFixed(2)}x
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: '#111827' }}>Métricas de recompra</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 18,
          }}
        >
          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
              Faturamento de primeira venda
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              R$ {faturamentoPrimeiraVenda.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
              Faturamento de recompra
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              R$ {faturamentoRecompra.toFixed(2)}
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
              Porcentagem de recompra
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              {porcentagemRecompra.toFixed(1)}%
            </div>
          </div>

          <div style={cardStyle()}>
            <div style={{ color: '#6b7280', marginBottom: 8, fontWeight: 600 }}>
              Clientes que voltaram
            </div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#111827' }}>
              {clientesQueVoltaram}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}