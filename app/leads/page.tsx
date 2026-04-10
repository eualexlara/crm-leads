'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Lead = {
  id: number
  nome: string
  telefone: string
  campanha: string | null
  data_entrada: string
  status_cliente?: string | null
}

type VendaHistorico = {
  id: number
  lead_id: number
  valor_venda: number
  custo_servico: number
  data_venda: string
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [vendas, setVendas] = useState<VendaHistorico[]>([])

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [leadAbertoId, setLeadAbertoId] = useState<number | null>(null)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [campanha, setCampanha] = useState('')
  const [dataEntrada, setDataEntrada] = useState(
    new Date().toISOString().split('T')[0]
  )

  const [filtroStatus, setFiltroStatus] = useState<'lead' | 'comprou'>('lead')

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

    setLeads((data as Lead[]) || [])
  }

  async function buscarVendas() {
    const { data, error } = await supabase
      .from('vendas')
      .select('id, lead_id, valor_venda, custo_servico, data_venda')
      .order('id', { ascending: false })

    if (error) {
      alert('Erro ao buscar vendas: ' + error.message)
      return
    }

    setVendas((data as VendaHistorico[]) || [])
  }

  function limparFormulario() {
    setEditandoId(null)
    setNome('')
    setTelefone('')
    setCampanha('')
    setDataEntrada(new Date().toISOString().split('T')[0])
  }

  async function salvarOuEditarLead() {
    if (!nome || !telefone || !dataEntrada) {
      alert('Preencha nome, telefone e data')
      return
    }

    if (editandoId) {
      const { error } = await supabase
        .from('leads')
        .update({
          nome,
          telefone,
          campanha: campanha || null,
          data_entrada: dataEntrada,
        })
        .eq('id', editandoId)

      if (error) {
        alert('Erro ao editar lead: ' + error.message)
        return
      }

      alert('Lead editado com sucesso!')
    } else {
      const { error } = await supabase.from('leads').insert([
        {
          nome,
          telefone,
          campanha: campanha || null,
          data_entrada: dataEntrada,
          status_cliente: 'lead',
          status: 'lead',
        },
      ])

      if (error) {
        alert('Erro ao salvar lead: ' + error.message)
        return
      }

      alert('Lead salvo com sucesso!')
    }

    limparFormulario()
    buscarLeads()
  }

  function editarLead(lead: Lead) {
    setEditandoId(lead.id)
    setNome(lead.nome || '')
    setTelefone(lead.telefone || '')
    setCampanha(lead.campanha || '')
    setDataEntrada(lead.data_entrada || new Date().toISOString().split('T')[0])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function excluirLead(id: number) {
    const confirmar = confirm('Tem certeza que deseja excluir este lead?')
    if (!confirmar) return

    const { error } = await supabase.from('leads').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir lead: ' + error.message)
      return
    }

    if (editandoId === id) {
      limparFormulario()
    }

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
      background: '#ffffff',
      fontSize: 15,
      color: '#111827',
      outline: 'none',
      width: '100%',
      WebkitTextFillColor: '#111827',
      opacity: 1,
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

  function buttonSecondaryStyle(ativo: boolean) {
    return {
      padding: '12px 16px',
      border: ativo ? '1px solid #2563eb' : '1px solid #d1d5db',
      borderRadius: 12,
      background: ativo ? '#2563eb' : '#ffffff',
      color: ativo ? '#ffffff' : '#111827',
      cursor: 'pointer',
      fontWeight: 700,
    } as const
  }

  function smallButtonStyle() {
    return {
      padding: '8px 12px',
      border: '1px solid #d1d5db',
      borderRadius: 10,
      background: '#ffffff',
      color: '#111827',
      cursor: 'pointer',
      fontWeight: 700,
    } as const
  }

  function dangerButtonStyle() {
    return {
      padding: '8px 12px',
      border: '1px solid #ef4444',
      borderRadius: 10,
      background: '#ffffff',
      color: '#ef4444',
      cursor: 'pointer',
      fontWeight: 700,
    } as const
  }

  const leadsFiltrados = leads.filter((lead) => {
    const status = lead.status_cliente || 'lead'
    if (filtroStatus === 'lead') return status !== 'comprou'
    return status === 'comprou'
  })

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: 20,
        fontFamily: 'Arial, sans-serif',
        background: 'linear-gradient(135deg, #eef2ff 0%, #f8fafc 50%, #ecfeff 100%)',
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
          color: #9ca3af !important;
          opacity: 1 !important;
          -webkit-text-fill-color: #9ca3af !important;
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
            background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #06b6d4 100%)',
            color: '#ffffff',
            boxShadow: '0 15px 40px rgba(37, 99, 235, 0.35)',
          }}
        >
          <h1 style={{ margin: 0, fontSize: 34 }}>Leads</h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.95 }}>
            Cadastre, organize e acompanhe seus leads e clientes.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 18 }}>
          <button
            onClick={() => setFiltroStatus('lead')}
            style={buttonSecondaryStyle(filtroStatus === 'lead')}
          >
            Leads
          </button>

          <button
            onClick={() => setFiltroStatus('comprou')}
            style={buttonSecondaryStyle(filtroStatus === 'comprou')}
          >
            Compraram
          </button>
        </div>

        <div style={{ ...cardStyle(), marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 18, color: '#111827' }}>
            {editandoId ? 'Editar lead' : 'Cadastro de leads'}
          </h2>

          <div
            style={{
              display: 'grid',
              gap: 12,
              maxWidth: 700,
            }}
          >
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

            <select
              value={campanha}
              onChange={(e) => setCampanha(e.target.value)}
              style={inputStyle()}
            >
              <option value="">Selecione a campanha</option>
              <option value="Mulheres - Cinza">Mulheres - Cinza</option>
              <option value="Mulheres - Preta">Mulheres - Preta</option>
              <option value="Mulheres - Amarela">Mulheres - Amarela</option>
              <option value="Mulheres - Azul">Mulheres - Azul</option>
              <option value="Mulheres - Cinza nova">Mulheres - Cinza nova</option>
              <option value="Homens - Cinza">Homens - Cinza</option>
              <option value="Homens - Preta">Homens - Preta</option>
              <option value="Homens - Amarela">Homens - Amarela</option>
            </select>

            <input
              type="date"
              value={dataEntrada}
              onChange={(e) => setDataEntrada(e.target.value)}
              style={inputStyle()}
            />

            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={salvarOuEditarLead} style={buttonPrimaryStyle()}>
                {editandoId ? 'Salvar edição' : 'Salvar lead'}
              </button>

              {editandoId && (
                <button
                  onClick={limparFormulario}
                  style={{
                    padding: '14px 18px',
                    border: '1px solid #d1d5db',
                    borderRadius: 14,
                    background: '#ffffff',
                    color: '#111827',
                    cursor: 'pointer',
                    fontWeight: 700,
                    fontSize: 16,
                    width: '100%',
                  }}
                >
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: '#111827' }}>
            {filtroStatus === 'lead' ? 'Leads cadastrados' : 'Clientes que compraram'}
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 18,
          }}
        >
          {leadsFiltrados.map((lead) => {
            const vendasDoLead = vendas.filter((venda) => venda.lead_id === lead.id)
            const quantidadeCompras = vendasDoLead.length

            return (
              <div key={lead.id} style={cardStyle()}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    gap: 10,
                    marginBottom: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
                      {lead.nome}
                    </div>
                    <div style={{ color: '#4b5563', marginTop: 6 }}>{lead.telefone}</div>
                    <div style={{ color: '#4b5563', marginTop: 4 }}>
                      {lead.campanha || '-'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => editarLead(lead)} style={smallButtonStyle()}>
                      Editar
                    </button>

                    <button onClick={() => excluirLead(lead.id)} style={dangerButtonStyle()}>
                      Excluir
                    </button>
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 8, color: '#111827' }}>
                  <div>
                    <span style={{ color: '#6b7280' }}>Data de entrada: </span>
                    <b>{lead.data_entrada}</b>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280' }}>Status: </span>
                    <b>{lead.status_cliente || 'lead'}</b>
                  </div>

                  {lead.status_cliente === 'comprou' && (
                    <div>
                      <span style={{ color: '#6b7280' }}>Quantidade de compras: </span>
                      <b>{quantidadeCompras}</b>
                    </div>
                  )}
                </div>

                {lead.status_cliente === 'comprou' && (
                  <div style={{ marginTop: 14 }}>
                    <button
                      onClick={() => setLeadAbertoId(leadAbertoId === lead.id ? null : lead.id)}
                      style={{
                        padding: '10px 14px',
                        border: '1px solid #d1d5db',
                        borderRadius: 12,
                        background: '#ffffff',
                        color: '#111827',
                        cursor: 'pointer',
                        fontWeight: 700,
                      }}
                    >
                      {leadAbertoId === lead.id ? 'Fechar histórico' : 'Ver histórico'}
                    </button>

                    {leadAbertoId === lead.id && (
                      <div
                        style={{
                          marginTop: 14,
                          background: '#f8fafc',
                          border: '1px solid #e5e7eb',
                          borderRadius: 14,
                          padding: 14,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 18,
                            marginBottom: 10,
                            color: '#111827',
                          }}
                        >
                          Histórico de compras
                        </div>

                        <div style={{ marginBottom: 12, color: '#111827' }}>
                          <b>Quantidade de compras: {quantidadeCompras}</b>
                        </div>

                        <div style={{ display: 'grid', gap: 12 }}>
                          {vendasDoLead.length > 0 ? (
                            vendasDoLead.map((venda) => {
                              const lucro =
                                Number(venda.valor_venda) - Number(venda.custo_servico)

                              return (
                                <div
                                  key={venda.id}
                                  style={{
                                    background: '#ffffff',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: 12,
                                    padding: 12,
                                    color: '#111827',
                                  }}
                                >
                                  <div>
                                    <span style={{ color: '#6b7280' }}>Data: </span>
                                    <b>{venda.data_venda}</b>
                                  </div>

                                  <div style={{ marginTop: 4 }}>
                                    <span style={{ color: '#6b7280' }}>Valor: </span>
                                    <b>R$ {Number(venda.valor_venda).toFixed(2)}</b>
                                  </div>

                                  <div style={{ marginTop: 4 }}>
                                    <span style={{ color: '#6b7280' }}>Custo: </span>
                                    <b>R$ {Number(venda.custo_servico).toFixed(2)}</b>
                                  </div>

                                  <div style={{ marginTop: 4 }}>
                                    <span style={{ color: '#6b7280' }}>Lucro: </span>
                                    <b style={{ color: lucro >= 0 ? '#16a34a' : '#dc2626' }}>
                                      R$ {lucro.toFixed(2)}
                                    </b>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div style={{ color: '#6b7280' }}>Nenhuma compra encontrada.</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}