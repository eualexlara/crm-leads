'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Lead = {
  id: number
  nome: string
  telefone: string
  campanha: string | null
  data_entrada: string | null
  status_cliente: string | null
}

type Venda = {
  id: number
  lead_id: number
  valor_venda: number
  custo_servico: number
  data_venda: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])
  const [filtro, setFiltro] = useState<'lead' | 'comprou'>('lead')
  const [leadAbertoId, setLeadAbertoId] = useState<number | null>(null)

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [campanha, setCampanha] = useState('')
  const [dataEntrada, setDataEntrada] = useState(
    new Date().toISOString().split('T')[0]
  )

  useEffect(() => {
    buscarLeads()
    buscarVendas()
  }, [])

  async function buscarLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      alert('Erro ao buscar leads: ' + error.message)
      return
    }

    setLeads(data || [])
  }

  async function buscarVendas() {
    const { data, error } = await supabase
      .from('vendas')
      .select('*')
      .order('id', { ascending: false })

    if (error) {
      alert('Erro ao buscar vendas: ' + error.message)
      return
    }

    setVendas(data || [])
  }

  function limparFormulario() {
    setEditandoId(null)
    setNome('')
    setTelefone('')
    setCampanha('')
    setDataEntrada(new Date().toISOString().split('T')[0])
  }

  async function salvarOuEditarLead() {
    if (!nome || !telefone || !campanha || !dataEntrada) {
      alert('Preencha todos os campos')
      return
    }

    if (editandoId) {
      const { error } = await supabase
        .from('leads')
        .update({
          nome,
          telefone,
          campanha,
          data_entrada: dataEntrada,
        })
        .eq('id', editandoId)

      if (error) {
        alert('Erro ao editar lead: ' + error.message)
        return
      }

      alert('Lead editado!')
    } else {
      const { error } = await supabase
        .from('leads')
        .insert([
          {
            nome,
            telefone,
            campanha,
            data_entrada: dataEntrada,
            status_cliente: 'lead',
          },
        ])

      if (error) {
        alert('Erro ao cadastrar lead: ' + error.message)
        return
      }

      alert('Lead cadastrado!')
    }

    limparFormulario()
    buscarLeads()
  }

  function editarLead(lead: Lead) {
    setEditandoId(lead.id)
    setNome(lead.nome || '')
    setTelefone(lead.telefone || '')
    setCampanha(lead.campanha || '')
    setDataEntrada(
      lead.data_entrada || new Date().toISOString().split('T')[0]
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deletarLead(id: number) {
    const confirmar = confirm('Excluir lead?')
    if (!confirmar) return

    await supabase.from('leads').delete().eq('id', id)

    if (editandoId === id) limparFormulario()
    if (leadAbertoId === id) setLeadAbertoId(null)

    buscarLeads()
  }

  function abrirHistorico(id: number) {
    setLeadAbertoId(leadAbertoId === id ? null : id)
  }

  function inputStyle() {
    return {
      padding: 14,
      border: '1px solid #d1d5db',
      borderRadius: 12,
      background: '#fff',
      fontSize: 15,
      collor: '#000'
    }
  }

  function cardStyle() {
    return {
      background: '#fff',
      borderRadius: 18,
      padding: 18,
      boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    }
  }

  function buttonStyle() {
    return {
      padding: '12px 18px',
      borderRadius: 12,
      background: '#2563eb',
      color: '#fff',
      border: 'none',
      fontWeight: 700,
      cursor: 'pointer',
    }
  }

  const leadsFiltrados = leads.filter((l) =>
    filtro === 'lead'
      ? l.status_cliente !== 'comprou'
      : l.status_cliente === 'comprou'
  )

  return (
    <div style={{ padding: 30 }}>
      <h1>Leads</h1>

      <div style={{ ...cardStyle(), marginBottom: 20 }}>
        <div style={{ display: 'grid', gap: 10, maxWidth: 500 }}>
          <input
            placeholder="Nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            style={inputStyle()}
          />

          <input
            placeholder="Telefone"
            value={telefone}
            onChange={(e) => setTelefone(e.target.value)}
            style={inputStyle()}
          />

          {/* SELECT DE CAMPANHA */}
          <select
            value={campanha}
            onChange={(e) => setCampanha(e.target.value)}
            style={inputStyle()}
          >
            <option value="">Selecione a campanha</option>

            <option>Mulheres - Cinza</option>
            <option>Mulheres - Preta</option>
            <option>Mulheres - Amarela</option>
            <option>Mulheres - Azul</option>
            <option>Mulheres - Cinza nova</option>
            <option>Homens - Cinza</option>
            <option>Homens - Preta</option>
            <option>Homens - Amarela</option>
          </select>

          <input
            type="date"
            value={dataEntrada}
            onChange={(e) => setDataEntrada(e.target.value)}
            style={inputStyle()}
          />

          <button onClick={salvarOuEditarLead} style={buttonStyle()}>
            {editandoId ? 'Salvar edição' : 'Salvar lead'}
          </button>
        </div>
      </div>

      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setFiltro('lead')}>Lead</button>
        <button onClick={() => setFiltro('comprou')}>Comprou</button>
      </div>

      <div style={{ display: 'grid', gap: 12 }}>
        {leadsFiltrados.map((lead) => {
          const vendasDoLead = vendas.filter((v) => v.lead_id === lead.id)

          return (
            <div key={lead.id} style={cardStyle()}>
              <b onClick={() => abrirHistorico(lead.id)} style={{ cursor: 'pointer' }}>
                {lead.nome}
              </b>

              <div>{lead.telefone}</div>
              <div>{lead.campanha}</div>

              {leadAbertoId === lead.id && (
                <div style={{ marginTop: 10 }}>
                  <b>Compras: {vendasDoLead.length}</b>
                </div>
              )}

              <div style={{ marginTop: 10 }}>
                <button onClick={() => editarLead(lead)}>Editar</button>
                <button onClick={() => deletarLead(lead.id)}>Excluir</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}