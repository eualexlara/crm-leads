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

/* 🔥 AQUI É A MUDANÇA PRINCIPAL */
const opcoesCampanha = [
  'Homens',
  'Mulheres',
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
      .select('*')
      .order('data', { ascending: false })

    const { data: leadsData } = await supabase.from('leads').select('*')
    const { data: vendasData } = await supabase.from('vendas').select('*')

    if (error) {
      alert('Erro ao buscar tráfego')
      return
    }

    setRegistros((data as Trafego[]) || [])
    setLeads((leadsData as Lead[]) || [])
    setVendas((vendasData as Venda[]) || [])
  }

  function dataDentroRelatorio(data: string | null) {
    if (!data) return false
    const d = data.slice(0, 10)
    return d >= dataInicioRelatorio && d <= dataFimRelatorio
  }

  const resumoPorCampanha = useMemo<ResumoCampanha[]>(() => {
    return opcoesCampanha.map((campanha) => {
      const gastos = registros.filter(
        (r) => r.campanha === campanha && dataDentroRelatorio(r.data)
      )

      const leadsCamp = leads.filter(
        (l) =>
          l.campanha === campanha &&
          l.origem_lead === 'anuncio' &&
          dataDentroRelatorio(l.data_entrada)
      )

      const ids = new Set(leadsCamp.map((l) => l.id))

      const vendasCamp = vendas.filter(
        (v) =>
          ids.has(v.lead_id) &&
          dataDentroRelatorio(v.data_venda)
      )

      const gasto = gastos.reduce((a, b) => a + Number(b.valor || 0), 0)
      const faturamento = vendasCamp.reduce((a, b) => a + Number(b.valor_venda || 0), 0)

      return {
        campanha,
        gasto,
        leads: leadsCamp.length,
        vendas: vendasCamp.length,
        faturamento,
        custoPorLead: leadsCamp.length ? gasto / leadsCamp.length : 0,
        roi: gasto ? faturamento / gasto : 0,
      }
    })
  }, [registros, leads, vendas, dataInicioRelatorio, dataFimRelatorio])

  const resumoSelecionado = useMemo(() => {
    if (campanhaSelecionada === 'todas') {
      return resumoPorCampanha.reduce(
        (acc, item) => {
          acc.gasto += item.gasto
          acc.leads += item.leads
          acc.vendas += item.vendas
          acc.faturamento += item.faturamento
          return acc
        },
        {
          campanha: 'Todas',
          gasto: 0,
          leads: 0,
          vendas: 0,
          faturamento: 0,
          custoPorLead: 0,
          roi: 0,
        }
      )
    }

    return resumoPorCampanha.find((i) => i.campanha === campanhaSelecionada)!
  }, [campanhaSelecionada, resumoPorCampanha])

  async function salvarTudo() {
    const validas = linhas.filter(
      (l) =>
        l.campanha &&
        l.valor &&
        !isNaN(Number(l.valor.replace(',', '.')))
    )

    if (!validas.length) {
      alert('Preencha algo')
      return
    }

    const payload = validas.map((l) => ({
      data: dataLancamento,
      campanha: l.campanha,
      valor: Number(l.valor.replace(',', '.')),
    }))

    await supabase.from('trafego').insert(payload)

    alert('Salvo')
    setLinhas([{ campanha: '', valor: '' }])
    buscarRegistros()
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Tráfego</h1>

      {/* LANÇAMENTO */}
      <div style={{ marginBottom: 30 }}>
        <input
          type="date"
          value={dataLancamento}
          onChange={(e) => setDataLancamento(e.target.value)}
        />

        {linhas.map((linha, i) => (
          <div key={i} style={{ display: 'flex', gap: 10 }}>
            <select
              value={linha.campanha}
              onChange={(e) => {
                const novas = [...linhas]
                novas[i].campanha = e.target.value
                setLinhas(novas)
              }}
            >
              <option value="">Campanha</option>
              {opcoesCampanha.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <input
              placeholder="Valor"
              value={linha.valor}
              onChange={(e) => {
                const novas = [...linhas]
                novas[i].valor = e.target.value
                setLinhas(novas)
              }}
            />
          </div>
        ))}

        <button onClick={() => setLinhas([...linhas, { campanha: '', valor: '' }])}>
          + linha
        </button>

        <button onClick={salvarTudo}>Salvar</button>
      </div>

      {/* RELATÓRIO */}
      <div>
        <select onChange={(e) => setCampanhaSelecionada(e.target.value)}>
          <option value="todas">Todas</option>
          {opcoesCampanha.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </select>

        <input type="date" value={dataInicioRelatorio} onChange={(e) => setDataInicioRelatorio(e.target.value)} />
        <input type="date" value={dataFimRelatorio} onChange={(e) => setDataFimRelatorio(e.target.value)} />

        <div>
          <p>Gasto: {resumoSelecionado.gasto}</p>
          <p>Leads: {resumoSelecionado.leads}</p>
          <p>Vendas: {resumoSelecionado.vendas}</p>
          <p>Faturamento: {resumoSelecionado.faturamento}</p>
          <p>ROI: {resumoSelecionado.roi.toFixed(2)}x</p>
        </div>
      </div>
    </div>
  )
}