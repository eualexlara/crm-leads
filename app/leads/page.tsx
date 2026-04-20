'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Lead = {
  id: number
  nome: string
  telefone: string
  campanha: string | null
  origem_lead: string | null
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

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [vendas, setVendas] = useState<VendaHistorico[]>([])

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [leadAbertoId, setLeadAbertoId] = useState<number | null>(null)

  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [origemLead, setOrigemLead] = useState('anuncio')
  const [campanha, setCampanha] = useState('')
  const [dataEntrada, setDataEntrada] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [buscaLead, setBuscaLead] = useState('')

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
    setOrigemLead('anuncio')
    setCampanha('')
    setDataEntrada(new Date().toISOString().split('T')[0])
  }

  async function salvarOuEditarLead() {
    if (!nome || !telefone || !dataEntrada) {
      alert('Preencha nome, telefone e data')
      return
    }

    const campanhaFinal = origemLead === 'anuncio' ? campanha || null : null

    if (origemLead === 'anuncio' && !campanhaFinal) {
      alert('Selecione a campanha')
      return
    }

    if (editandoId) {
      const { error } = await supabase
        .from('leads')
        .update({
          nome,
          telefone,
          origem_lead: origemLead,
          campanha: campanhaFinal,
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
          origem_lead: origemLead,
          campanha: campanhaFinal,
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
    setOrigemLead(lead.origem_lead || 'anuncio')
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
      padding: '6px 10px',
      border: '1px solid #d1d5db',
      borderRadius: 9,
      background: '#ffffff',
      color: '#111827',
      cursor: 'pointer',
      fontWeight: 700,
      fontSize: 13,
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

  function formatarOrigem(origem: string | null | undefined) {
    if (origem === 'lead_antigo') return 'Lead antigo'
    return 'Anúncio'
  }

  const leadsFiltrados = leads.filter((lead) => {
    const status = lead.status_cliente || 'lead'
    const passaStatus =
      filtroStatus === 'lead' ? status !== 'comprou' : status === 'comprou'

    const passaBusca = lead.nome
      .toLowerCase()
      .includes(buscaLead.trim().toLowerCase())

    return passaStatus && passaBusca
  })

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
            background:
              'linear-gradient(135deg, #1d4ed8 0%, #2563eb 45%, #06b6d4 100%)',
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
              value={origemLead}
              onChange={(e) => {
                setOrigemLead(e.target.value)
                if (e.target.value === 'lead_antigo') {
                  setCampanha('')
                }
              }}
              style={inputStyle()}
            >
              <option value="anuncio">Anúncio</option>
              <option value="lead_antigo">Lead antigo</option>
            </select>

            {origemLead === 'anuncio' && (
              <select
                value={campanha}
                onChange={(e) => setCampanha(e.target.value)}
                style={inputStyle()}
              >
                <option value="">Selecione a campanha</option>
                {opcoesCampanha.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            )}

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

            <input
              placeholder={
                filtroStatus === 'lead'
                  ? 'Pesquisar lead pelo nome'
                  : 'Pesquisar cliente pelo nome'
              }
              value={buscaLead}
              onChange={(e) => setBuscaLead(e.target.value)}
              style={inputStyle()}
            />
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
                    marginBottom: 10,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#111827',
                        lineHeight: 1.2,
                      }}
                    >
                      {lead.nome}
                    </div>

                    <div
                      style={{
                        color: '#4b5563',
                        marginTop: 4,
                        fontSize: 13,
                        lineHeight: 1.3,
                      }}
                    >
                      {lead.telefone}
                    </div>

                    <div
                      style={{
                        color: '#4b5563',
                        marginTop: 3,
                        fontSize: 13,
                        lineHeight: 1.3,
                      }}
                    >
                      Origem: {formatarOrigem(lead.origem_lead)}
                    </div>

                    <div
                      style={{
                        color: '#4b5563',
                        marginTop: 3,
                        fontSize: 13,
                        lineHeight: 1.3,
                      }}
                    >
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

                <div
                  style={{
                    display: 'grid',
                    gap: 6,
                    color: '#111827',
                    fontSize: 13,
                    lineHeight: 1.35,
                  }}
                >
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
                  <div style={{ marginTop: 12 }}>
                    <button
                      onClick={() => setLeadAbertoId(leadAbertoId === lead.id ? null : lead.id)}
                      style={{
                        padding: '8px 12px',
                        border: '1px solid #d1d5db',
                        borderRadius: 10,
                        background: '#ffffff',
                        color: '#111827',
                        cursor: 'pointer',
                        fontWeight: 700,
                        fontSize: 13,
                      }}
                    >
                      {leadAbertoId === lead.id ? 'Fechar histórico' : 'Ver histórico'}
                    </button>

                    {leadAbertoId === lead.id && (
                      <div
                        style={{
                          marginTop: 12,
                          background: '#f8fafc',
                          border: '1px solid #e5e7eb',
                          borderRadius: 12,
                          padding: 12,
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 700,
                            fontSize: 16,
                            marginBottom: 8,
                            color: '#111827',
                          }}
                        >
                          Histórico de compras
                        </div>

                        <div
                          style={{
                            marginBottom: 10,
                            color: '#111827',
                            fontSize: 13,
                          }}
                        >
                          <b>Quantidade de compras: {quantidadeCompras}</b>
                        </div>

                        <div style={{ display: 'grid', gap: 10 }}>
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
                                    borderRadius: 10,
                                    padding: 10,
                                    color: '#111827',
                                    fontSize: 13,
                                    lineHeight: 1.35,
                                  }}
                                >
                                  <div>
                                    <span style={{ color: '#6b7280' }}>Data: </span>
                                    <b>{venda.data_venda}</b>
                                  </div>

                                  <div style={{ marginTop: 3 }}>
                                    <span style={{ color: '#6b7280' }}>Valor: </span>
                                    <b>R$ {Number(venda.valor_venda).toFixed(2)}</b>
                                  </div>

                                  <div style={{ marginTop: 3 }}>
                                    <span style={{ color: '#6b7280' }}>Custo: </span>
                                    <b>R$ {Number(venda.custo_servico).toFixed(2)}</b>
                                  </div>

                                  <div style={{ marginTop: 3 }}>
                                    <span style={{ color: '#6b7280' }}>Lucro: </span>
                                    <b style={{ color: lucro >= 0 ? '#16a34a' : '#dc2626' }}>
                                      R$ {lucro.toFixed(2)}
                                    </b>
                                  </div>
                                </div>
                              )
                            })
                          ) : (
                            <div style={{ color: '#6b7280', fontSize: 13 }}>
                              Nenhuma compra encontrada.
                            </div>
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