'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

type Lead = {
  id: number
  nome: string
  status_cliente?: string | null
}

type LeadRelation =
  | {
      nome?: string | null
    }
  | {
      nome?: string | null
    }[]
  | null

type Venda = {
  id: number
  lead_id: number
  valor_venda: number
  custo_servico: number
  data_venda: string
  etiquetas: string[] | null
  leads?: LeadRelation
}

const opcoesEtiquetas = [
  { valor: 'primeira_venda', label: 'Primeira venda' },
  { valor: 'reativacao', label: 'Reativação' },
  { valor: 'recompra', label: 'Recompra' },
  { valor: 'promocao', label: 'Promoção' },
]

export default function VendasPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [vendas, setVendas] = useState<Venda[]>([])

  const [editandoId, setEditandoId] = useState<number | null>(null)
  const [leadId, setLeadId] = useState('')
  const [valorVenda, setValorVenda] = useState('')
  const [custoServico, setCustoServico] = useState('')
  const [dataVenda, setDataVenda] = useState(
    new Date().toISOString().split('T')[0]
  )
  const [etiquetas, setEtiquetas] = useState<string[]>([])

  useEffect(() => {
    buscarLeads()
    buscarVendas()
  }, [])

  async function buscarLeads() {
    const { data, error } = await supabase
      .from('leads')
      .select('id, nome, status_cliente')
      .order('nome', { ascending: true })

    if (error) {
      alert('Erro ao buscar leads: ' + error.message)
      return
    }

    setLeads((data as Lead[]) || [])
  }

  async function buscarVendas() {
    const { data, error } = await supabase
      .from('vendas')
      .select(`
        id,
        lead_id,
        valor_venda,
        custo_servico,
        data_venda,
        etiquetas,
        leads(nome)
      `)
      .order('id', { ascending: false })

    if (error) {
      alert('Erro ao buscar vendas: ' + error.message)
      return
    }

    setVendas((data as Venda[]) || [])
  }

  function limparFormulario() {
    setEditandoId(null)
    setLeadId('')
    setValorVenda('')
    setCustoServico('')
    setDataVenda(new Date().toISOString().split('T')[0])
    setEtiquetas([])
  }

  function toggleEtiqueta(etiqueta: string) {
    if (etiquetas.includes(etiqueta)) {
      setEtiquetas(etiquetas.filter((item) => item !== etiqueta))
    } else {
      setEtiquetas([...etiquetas, etiqueta])
    }
  }

  async function atualizarStatusLeadParaComprou(idDoLead: number) {
    const { error } = await supabase
      .from('leads')
      .update({
        status_cliente: 'comprou',
        status: 'comprou',
      })
      .eq('id', idDoLead)

    if (error) {
      alert('Erro ao atualizar status do lead: ' + error.message)
    }
  }

  async function salvarOuEditarVenda() {
    if (!leadId || !valorVenda || !custoServico || !dataVenda) {
      alert('Preencha tudo')
      return
    }

    const valorConvertido = Number(valorVenda.replace(',', '.'))
    const custoConvertido = Number(custoServico.replace(',', '.'))

    if (isNaN(valorConvertido) || isNaN(custoConvertido)) {
      alert('Valor e custo precisam ser números válidos')
      return
    }

    if (editandoId) {
      const { error } = await supabase
        .from('vendas')
        .update({
          lead_id: Number(leadId),
          valor_venda: valorConvertido,
          custo_servico: custoConvertido,
          data_venda: dataVenda,
          etiquetas: etiquetas,
        })
        .eq('id', editandoId)

      if (error) {
        alert('Erro ao editar venda: ' + error.message)
        return
      }

      await atualizarStatusLeadParaComprou(Number(leadId))
      alert('Venda editada com sucesso!')
    } else {
      const { error } = await supabase
        .from('vendas')
        .insert([
          {
            lead_id: Number(leadId),
            valor_venda: valorConvertido,
            custo_servico: custoConvertido,
            data_venda: dataVenda,
            etiquetas: etiquetas,
          },
        ])

      if (error) {
        alert('Erro ao salvar venda: ' + error.message)
        return
      }

      await atualizarStatusLeadParaComprou(Number(leadId))
      alert('Venda cadastrada!')
    }

    limparFormulario()
    buscarLeads()
    buscarVendas()
  }

  function editarVenda(venda: Venda) {
    setEditandoId(venda.id)
    setLeadId(String(venda.lead_id))
    setValorVenda(String(venda.valor_venda))
    setCustoServico(String(venda.custo_servico))
    setDataVenda(venda.data_venda)
    setEtiquetas(venda.etiquetas || [])
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function deletarVenda(id: number) {
    const confirmar = confirm('Tem certeza que deseja excluir esta venda?')
    if (!confirmar) return

    const { error } = await supabase.from('vendas').delete().eq('id', id)

    if (error) {
      alert('Erro ao excluir venda: ' + error.message)
      return
    }

    if (editandoId === id) {
      limparFormulario()
    }

    buscarVendas()
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

  function badgeStyle() {
    return {
      display: 'inline-block',
      padding: '5px 9px',
      borderRadius: 999,
      background: '#eff6ff',
      color: '#1d4ed8',
      fontSize: 11,
      fontWeight: 700,
      border: '1px solid #bfdbfe',
    } as const
  }

  function formatarEtiqueta(etiqueta: string) {
    const encontrada = opcoesEtiquetas.find((item) => item.valor === etiqueta)
    return encontrada ? encontrada.label : etiqueta
  }

  function pegarNomeLead(relacao: LeadRelation | undefined) {
    if (!relacao) return '-'
    if (Array.isArray(relacao)) {
      return relacao[0]?.nome || '-'
    }
    return relacao.nome || '-'
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
          <h1 style={{ margin: 0, fontSize: 34 }}>
            {editandoId ? 'Editar venda' : 'Vendas'}
          </h1>
          <p style={{ marginTop: 8, marginBottom: 0, opacity: 0.95 }}>
            Cadastre, edite e acompanhe as vendas do seu CRM.
          </p>
        </div>

        <div style={{ ...cardStyle(), marginBottom: 24 }}>
          <h2 style={{ marginTop: 0, marginBottom: 16, color: '#111827', fontSize: 24 }}>
            {editandoId ? 'Editar venda' : 'Cadastro de vendas'}
          </h2>

          <div
            style={{
              display: 'grid',
              gap: 10,
              maxWidth: 700,
            }}
          >
            <select
              value={leadId}
              onChange={(e) => setLeadId(e.target.value)}
              style={inputStyle(!!leadId)}
            >
              <option value="">Selecione o lead</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.nome}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Valor da venda"
              value={valorVenda}
              onChange={(e) => setValorVenda(e.target.value)}
              style={inputStyle(!!valorVenda)}
            />

            <input
              type="text"
              placeholder="Custo do serviço"
              value={custoServico}
              onChange={(e) => setCustoServico(e.target.value)}
              style={inputStyle(!!custoServico)}
            />

            <input
              type="date"
              value={dataVenda}
              onChange={(e) => setDataVenda(e.target.value)}
              style={inputStyle(true)}
            />

            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: 12,
                padding: 12,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  marginBottom: 8,
                  color: '#111827',
                  fontSize: 14,
                }}
              >
                Classificação da venda
              </div>

              <div style={{ display: 'grid', gap: 6 }}>
                {opcoesEtiquetas.map((item) => (
                  <label
                    key={item.valor}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: '#111827',
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={etiquetas.includes(item.valor)}
                      onChange={() => toggleEtiqueta(item.valor)}
                      style={{ width: 16, height: 16 }}
                    />
                    {item.label}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <button onClick={salvarOuEditarVenda} style={buttonPrimaryStyle()}>
                {editandoId ? 'Salvar edição' : 'Salvar venda'}
              </button>

              {editandoId && (
                <button onClick={limparFormulario} style={buttonSecondaryStyle()}>
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, color: '#111827', fontSize: 24 }}>Vendas cadastradas</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: 18,
          }}
        >
          {vendas.map((venda) => {
            const lucro =
              Number(venda.valor_venda) - Number(venda.custo_servico)

            return (
              <div key={venda.id} style={cardStyle()}>
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
                        fontSize: 12,
                        color: '#6b7280',
                        marginBottom: 3,
                        lineHeight: 1.2,
                      }}
                    >
                      Cliente
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 600,
                        color: '#111827',
                        lineHeight: 1.2,
                      }}
                    >
                      {pegarNomeLead(venda.leads)}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      onClick={() => editarVenda(venda)}
                      style={smallButtonStyle()}
                    >
                      Editar
                    </button>

                    <button
                      onClick={() => deletarVenda(venda.id)}
                      style={dangerButtonStyle()}
                    >
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
                    <span style={{ color: '#6b7280' }}>Data: </span>
                    <b>{venda.data_venda}</b>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280' }}>Valor da venda: </span>
                    <b style={{ color: '#16a34a' }}>
                      R$ {Number(venda.valor_venda).toFixed(2)}
                    </b>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280' }}>Custo do serviço: </span>
                    <b>R$ {Number(venda.custo_servico).toFixed(2)}</b>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280' }}>Lucro: </span>
                    <b style={{ color: lucro >= 0 ? '#16a34a' : '#dc2626' }}>
                      R$ {lucro.toFixed(2)}
                    </b>
                  </div>

                  <div>
                    <span style={{ color: '#6b7280' }}>Etiquetas: </span>
                    <div
                      style={{
                        display: 'flex',
                        gap: 5,
                        flexWrap: 'wrap',
                        marginTop: 5,
                      }}
                    >
                      {venda.etiquetas && venda.etiquetas.length > 0 ? (
                        venda.etiquetas.map((etiqueta) => (
                          <span key={etiqueta} style={badgeStyle()}>
                            {formatarEtiqueta(etiqueta)}
                          </span>
                        ))
                      ) : (
                        <span>-</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}