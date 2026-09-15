import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useCondo } from "../context/CondoContext";

/* ------------------------------------------------------------------ */
/*  Ícones inline                                                       */
/* ------------------------------------------------------------------ */
const iconBase = (size, sw) => ({
  width: size, height: size, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round",
});
function Loader2({ size = 18, strokeWidth = 2, className }) {
  return <svg {...iconBase(size, strokeWidth)} className={className}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>;
}
function CheckCircle2({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /><path d="m9 12 2 2 4-4" /></svg>;
}
function AlertTriangle({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="m10.29 3.86-8.18 14.18A2 2 0 0 0 4 21h16a2 2 0 0 0 1.89-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4M12 17h.01" /></svg>;
}
function RefreshCw({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>;
}
function Unlink({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="m18.84 12.25 1.72-1.71a4.5 4.5 0 0 0-6.37-6.37l-1.71 1.72" /><path d="m5.17 11.75-1.72 1.71a4.5 4.5 0 0 0 6.37 6.37l1.71-1.72" /><path d="M8 8l8 8" /></svg>;
}
function Link2({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="M9 17H7A5 5 0 0 1 7 7h2" /><path d="M15 7h2a5 5 0 1 1 0 10h-2" /><line x1="8" x2="16" y1="12" y2="12" /></svg>;
}
function Search({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" /></svg>;
}
function X({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="M18 6 6 18M6 6l12 12" /></svg>;
}
function Layers({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>;
}
function Download({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const API = () => import.meta.env.VITE_API_URL || "";

function formatBRL(v) {
  const n = Number(v);
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(s) {
  if (!s) return "—";
  const d = s.slice(0, 10);
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}

function mesesDisponiveis() {
  const meses = [];
  const hoje = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
    meses.push({ val, label });
  }
  return meses;
}

/* ------------------------------------------------------------------ */
/*  Modal de seleção manual de documento (Suporta N x N)               */
/* ------------------------------------------------------------------ */
function ModalSelecionarDoc({ transacoes, onConfirmar, onFechar }) {
  const [docs, setDocs]     = useState([]);
  const [busca, setBusca]   = useState("");
  const [loading, setLoading] = useState(true);
  
  // Set of selected doc ids
  const [selecionados, setSelecionados] = useState(new Set());

  useEffect(() => {
    setLoading(true);
    fetch(`${API()}/api/v1/conciliacao/documentos-disponiveis`)
      .then(r => r.json())
      .then(setDocs)
      .finally(() => setLoading(false));
  }, []);

  const filtrados = docs.filter(d =>
    !busca ||
    (d.fornecedor || "").toLowerCase().includes(busca.toLowerCase()) ||
    (d.numero_doc || "").toLowerCase().includes(busca.toLowerCase())
  );

  const toggleDoc = (id) => {
    const next = new Set(selecionados);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelecionados(next);
  };

  // Cálculo de Delta
  const totalTransacoes = transacoes.reduce((acc, t) => acc + Number(t.valor || 0), 0);
  const totalDocs = docs.filter(d => selecionados.has(d.id)).reduce((acc, d) => acc + Number(d.valor_total || 0), 0);
  const delta = Math.abs(totalTransacoes - totalDocs);
  const isDeltaValido = delta <= 0.05; // RNF-03 tolerância de R$ 0,05

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(16,27,48,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--paper-card)", borderRadius: 14, width: 620,
        maxHeight: "90vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(16,27,48,0.3)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "flex-start", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--slate)", margin: 0 }}>
              Vinculando {transacoes.length} transaç{transacoes.length > 1 ? "ões" : "ão"}
            </p>
            <div style={{ maxHeight: 60, overflowY: "auto", marginTop: 4 }}>
              {transacoes.map(t => (
                <p key={t.id} style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: "2px 0 0" }}>
                  {formatDate(t.data_transacao)} · {t.descricao} · R$ {formatBRL(t.valor)}
                </p>
              ))}
            </div>
          </div>
          <button onClick={onFechar} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--slate)" }}>
            <X size={18} />
          </button>
        </div>

        {/* Resumo do Lote (Delta) */}
        <div style={{ padding: "12px 20px", background: "var(--ledger-tint)", borderBottom: "1px solid var(--line)", display: "flex", gap: 20 }}>
          <div>
            <span style={{ fontSize: 11, color: "var(--slate)" }}>Total Transações</span>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>R$ {formatBRL(totalTransacoes)}</p>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "var(--slate)" }}>Total Documentos ({selecionados.size})</span>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "var(--ledger)" }}>R$ {formatBRL(totalDocs)}</p>
          </div>
          <div>
            <span style={{ fontSize: 11, color: "var(--slate)" }}>Diferença (Delta)</span>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: isDeltaValido ? "#21503e" : "#b3452f" }}>
              R$ {formatBRL(delta)}
            </p>
          </div>
        </div>

        {/* Busca */}
        <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 8 }}>
          <Search size={15} />
          <input
            autoFocus
            placeholder="Buscar por fornecedor ou nº do documento…"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            style={{ border: "none", outline: "none", flex: 1, fontSize: 13, background: "transparent", color: "var(--ink)" }}
          />
        </div>

        {/* Lista */}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
          {loading && (
            <div style={{ display: "flex", justifyContent: "center", padding: 32 }}>
              <Loader2 size={22} className="spin" />
            </div>
          )}
          {!loading && filtrados.length === 0 && (
            <p style={{ textAlign: "center", color: "var(--slate)", padding: 32, fontSize: 13 }}>
              Nenhum documento disponível.
            </p>
          )}
          {filtrados.map(doc => {
            const selecionado = selecionados.has(doc.id);
            return (
              <div
                key={doc.id}
                onClick={() => toggleDoc(doc.id)}
                style={{
                  padding: "10px 20px", cursor: "pointer",
                  background: selecionado ? "var(--ledger-tint)" : "transparent",
                  borderLeft: selecionado ? "3px solid var(--ledger)" : "3px solid transparent",
                  display: "grid", gridTemplateColumns: "auto 1fr auto",
                  gap: 12, alignItems: "center",
                }}
              >
                <input type="checkbox" checked={selecionado} readOnly style={{ pointerEvents: "none" }} />
                <div>
                  <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                    {doc.fornecedor || "Fornecedor não identificado"}
                  </p>
                  <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--slate)" }}>
                    Nº {doc.numero_doc || "—"} · Emissão: {formatDate(doc.data_emissao)}
                  </p>
                </div>
                <span style={{ fontFamily: "IBM Plex Mono, monospace", fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                  R$ {formatBRL(doc.valor_total)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line)", display: "flex", gap: 8, justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, color: "var(--slate)" }}>
            * É permitida diferença de até R$ 0,05 (juros/arredondamento).
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={onFechar} style={{
              border: "1px solid var(--line)", background: "transparent",
              borderRadius: 8, padding: "8px 16px", fontSize: 13,
              fontWeight: 500, cursor: "pointer", color: "var(--ink-soft)",
            }}>Cancelar</button>
            <button
              disabled={!isDeltaValido || selecionados.size === 0}
              onClick={() => onConfirmar(Array.from(selecionados), transacoes.length > 1 || selecionados.size > 1 ? "lote" : "manual")}
              style={{
                border: "none", background: isDeltaValido && selecionados.size > 0 ? "var(--ledger)" : "#c3cbd6",
                color: "#fff", borderRadius: 8, padding: "8px 18px",
                fontSize: 13, fontWeight: 600, cursor: isDeltaValido && selecionados.size > 0 ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", gap: 6,
              }}
            >
              <Layers size={14} /> Conciliar {transacoes.length > 1 || selecionados.size > 1 ? "Lote" : "Documento"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Linha da tabela                                                     */
/* ------------------------------------------------------------------ */
function LinhaTransacao({ trans, onConciliar, onDesfazer, selecionada, onToggleSelec }) {
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const confirmarModal = async (docsIds, tipo) => {
    setSalvando(true);
    setModalAberto(false);
    await onConciliar([trans.id], docsIds, tipo);
    setSalvando(false);
  };

  const confirmarSugestao = async () => {
    setSalvando(true);
    await onConciliar([trans.id], [trans.sugestao.id], "automatica");
    
    if (trans.sugestao.conta_debito_codigo) {
      try {
        await fetch(`${API()}/api/classificacao/confirmar`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            administradora_id: "1",
            fornecedor_nome: trans.sugestao.fornecedor,
            palavra_chave: trans.sugestao.fornecedor,
            conta_codigo: trans.sugestao.conta_debito_codigo,
            criada_por_ia: false
          }),
        });
      } catch (e) {
        console.error("Erro ao salvar regra contábil", e);
      }
    }
    
    setSalvando(false);
  };

  const statusStyle = {
    conciliada: { bg: "#e4efe9", color: "#21503e", label: "Conciliada" },
    conciliada_em_lote: { bg: "#dbeafe", color: "#1e40af", label: "Agrupada (Lote)" },
    sugerida:   { bg: "#f5ead9", color: "#b8875a", label: "Sugestão"  },
    pendente:   { bg: "#f6e6e1", color: "#b3452f", label: "Pendente"  },
  }[trans.status_conciliacao] || {};

  const isConciliada = trans.status_conciliacao === "conciliada" || trans.status_conciliacao === "conciliada_em_lote";
  
  // Determinar qual ID usar para estornar (se lote, envia o lote_id, se individual, pega o ID da conciliação)
  const estornoId = trans.status_conciliacao === "conciliada_em_lote" 
    ? trans.lote_id 
    : (trans.documentos_conciliados?.[0]?.conciliacao_id);

  return (
    <>
      {modalAberto && (
        <ModalSelecionarDoc
          transacoes={[trans]}
          onConfirmar={confirmarModal}
          onFechar={() => setModalAberto(false)}
        />
      )}
      <tr style={{ borderBottom: "1px solid var(--line)", background: selecionada ? "var(--ledger-tint)" : "transparent" }}>
        {/* Checkbox */}
        <td style={{ padding: "11px 14px", width: 40, textAlign: "center" }}>
          {!isConciliada && (
            <input type="checkbox" checked={selecionada} onChange={onToggleSelec} />
          )}
        </td>
        
        {/* Transação */}
        <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--ink-soft)", fontFamily: "IBM Plex Mono, monospace" }}>
          {formatDate(trans.data_transacao)}
        </td>
        <td style={{ padding: "11px 14px", fontSize: 13, color: "var(--ink)", maxWidth: 220 }}>
          <span style={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {trans.descricao || "—"}
          </span>
          <span style={{ fontSize: 11, color: "var(--slate)", textTransform: "capitalize" }}>{trans.banco}</span>
        </td>
        <td style={{ padding: "11px 14px", fontFamily: "IBM Plex Mono, monospace", fontSize: 13,
                     fontWeight: 600, color: trans.tipo === "credito" ? "var(--ledger)" : "var(--ink)",
                     textAlign: "right", whiteSpace: "nowrap" }}>
          {trans.tipo === "debito" ? "−" : "+"}R$ {formatBRL(trans.valor)}
        </td>

        {/* Documento vinculado */}
        <td style={{ padding: "11px 14px" }}>
          {trans.status_conciliacao === "conciliada_em_lote" ? (
            <div>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                Agrupado: {trans.documentos_conciliados?.length} documentos
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 10, color: "var(--slate)" }}>
                Lote ID: {trans.lote_id}
              </p>
            </div>
          ) : trans.status_conciliacao === "conciliada" && trans.documentos_conciliados?.length > 0 ? (
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                {trans.documentos_conciliados[0].fornecedor || "Fornecedor não identificado"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--slate)" }}>
                R$ {formatBRL(trans.documentos_conciliados[0].valor)}
              </p>
            </div>
          ) : trans.sugestao ? (
            <div style={{ background: "var(--brass-tint)", borderRadius: 8, padding: "6px 10px" }}>
              <p style={{ margin: 0, fontSize: 12, fontWeight: 600, color: "var(--ink)" }}>
                {trans.sugestao.fornecedor || "Fornecedor não identificado"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--slate)" }}>
                R$ {formatBRL(trans.sugestao.valor_total)} · Confiança: {Math.round(trans.sugestao.score * 100)}%
              </p>
              {trans.sugestao.conta_debito_codigo && (
                <p style={{ margin: "4px 0 0", fontSize: 11, color: "var(--slate)", borderTop: "1px solid rgba(0,0,0,0.05)", paddingTop: 4 }}>
                  Conta: <strong>{trans.sugestao.conta_debito_codigo}</strong> - {trans.sugestao.conta_debito_nome}
                </p>
              )}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Sem sugestão</span>
          )}
        </td>

        {/* Status */}
        <td style={{ padding: "11px 14px" }}>
          <span style={{ background: statusStyle.bg, color: statusStyle.color,
                         fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px", whiteSpace: "nowrap" }}>
            {statusStyle.label}
          </span>
        </td>

        {/* Ações */}
        <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
          {salvando ? (
            <Loader2 size={16} className="spin" />
          ) : isConciliada ? (
            <button
              onClick={() => onDesfazer(estornoId, trans.status_conciliacao === "conciliada_em_lote")}
              title="Desfazer conciliação"
              style={{ border: "1px solid var(--line)", background: "transparent",
                       borderRadius: 7, padding: "5px 10px", cursor: "pointer",
                       color: "var(--slate)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
            >
              <Unlink size={13} /> Desfazer {trans.status_conciliacao === "conciliada_em_lote" ? "Lote" : ""}
            </button>
          ) : trans.sugestao ? (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={confirmarSugestao}
                style={{ border: "none", background: "var(--ledger)", color: "#fff",
                         borderRadius: 7, padding: "5px 10px", cursor: "pointer",
                         display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600 }}
              >
                <CheckCircle2 size={13} /> Confirmar
              </button>
              <button
                onClick={() => setModalAberto(true)}
                style={{ border: "1px solid var(--line)", background: "transparent",
                         borderRadius: 7, padding: "5px 10px", cursor: "pointer",
                         color: "var(--ink-soft)", fontSize: 12 }}
              >
                Trocar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setModalAberto(true)}
              style={{ border: "1px solid var(--ledger)", background: "transparent",
                       color: "var(--ledger)", borderRadius: 7, padding: "5px 10px",
                       cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
                       fontSize: 12, fontWeight: 600 }}
            >
              <Link2 size={13} /> Vincular
            </button>
          )}
        </td>
      </tr>
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                                */
/* ------------------------------------------------------------------ */
export default function ConciliarDocumentos() {
  const meses = mesesDisponiveis();
  const [mesAno, setMesAno]       = useState(meses[0].val);
  const [banco, setBanco]         = useState("");
  const [transacoes, setTransacoes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [erro, setErro]           = useState("");
  const [salvandoLote, setSalvandoLote] = useState(false);
  const [filtroStatus, setFiltroStatus] = useState("Total");
  
  // Lotes N x N
  const [selecionadasTrans, setSelecionadasTrans] = useState(new Set());
  const [modalLoteAberto, setModalLoteAberto] = useState(false);

  // Assumimos que o condomínio ativo deveria vir do contexto.
  const { selectedCondoId } = useCondo();
  const condominioAtivo = selectedCondoId; // TODO: Integrar com seletor de condomínio

  const carregar = useCallback(() => {
    setLoading(true);
    setErro("");
    setSelecionadasTrans(new Set());
    const params = new URLSearchParams({ mes_ano: mesAno, limit: "200" });
    if (banco) params.set("banco", banco);
    fetch(`${API()}/api/v1/conciliacao/transacoes?${params}`)
      .then(r => r.json())
      .then(setTransacoes)
      .catch(() => setErro("Não foi possível carregar as transações."))
      .finally(() => setLoading(false));
  }, [mesAno, banco]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleConciliar = async (transacoesIds, documentosIds, status) => {
    const resp = await fetch(`${API()}/api/v1/conciliacao/conciliar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transacoes_ids: transacoesIds, documentos_ids: documentosIds, status }),
    });
    if (resp.ok) {
      setModalLoteAberto(false);
      carregar();
    } else {
      const d = await resp.json();
      alert(d.detail || "Erro ao conciliar.");
    }
  };

  const handleDesfazer = async (estornoId, isLote) => {
    const msg = isLote 
      ? "Esta transação faz parte de um LOTE. Desfazer irá estornar TODAS as transações e documentos deste lote. Confirmar?"
      : "Desfazer esta conciliação?";
    if (!confirm(msg)) return;
    
    await fetch(`${API()}/api/v1/conciliacao/${estornoId}`, { method: "DELETE" });
    carregar();
  };
  
  const toggleSelectTrans = (id) => {
    const next = new Set(selecionadasTrans);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelecionadasTrans(next);
  };
  
  const handleVincularLote = async (docsIds, tipo) => {
    await handleConciliar(Array.from(selecionadasTrans), docsIds, tipo);
  };

  const handleExportarLote = async () => {
    setSalvandoLote(true);
    setErro("");
    try {
      const resp = await fetch(`${API()}/api/v1/exportacao/lote?condominio_id=${condominioAtivo}`);
      if (!resp.ok) {
        const d = await resp.json();
        setErro(d.detail || "Erro ao exportar lote.");
        setSalvandoLote(false);
        return;
      }
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      // Pega o nome do header Content-Disposition ou usa fallback
      const disp = resp.headers.get("Content-Disposition");
      let filename = `lote_alterdata_${condominioAtivo}.csv`;
      if (disp && disp.includes("filename=")) {
        filename = disp.split("filename=")[1].replace(/"/g, "");
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setErro("Erro de comunicação ao exportar lote.");
    } finally {
      setSalvandoLote(false);
    }
  };

  // Resumo
  const total      = transacoes.length;
  const conciliadas = transacoes.filter(t => t.status_conciliacao === "conciliada" || t.status_conciliacao === "conciliada_em_lote").length;
  const sugeridas  = transacoes.filter(t => t.status_conciliacao === "sugerida").length;
  const pendentes  = transacoes.filter(t => t.status_conciliacao === "pendente").length;

  const selecionadasArr = transacoes.filter(t => selecionadasTrans.has(t.id));
  const valorTotalSelecionadas = selecionadasArr.reduce((acc, t) => acc + Number(t.valor || 0), 0);

  const transacoesFiltradas = transacoes.filter(t => {
    if (filtroStatus === "Total") return true;
    if (filtroStatus === "Conciliadas") return t.status_conciliacao === "conciliada" || t.status_conciliacao === "conciliada_em_lote";
    if (filtroStatus === "Sugestões") return t.status_conciliacao === "sugerida";
    if (filtroStatus === "Pendentes") return t.status_conciliacao === "pendente";
    return true;
  });

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      {modalLoteAberto && (
        <ModalSelecionarDoc
          transacoes={selecionadasArr}
          onConfirmar={handleVincularLote}
          onFechar={() => setModalLoteAberto(false)}
        />
      )}
      
      <div className="page__head">
        <span className="page__eyebrow">Conciliação bancária</span>
        <h1 className="page__title">Conciliar Documentos</h1>
        <p className="page__subtitle">
          Vincule transações do extrato bancário aos documentos fiscais validados (1x1 ou Agrupado).
        </p>
      </div>

      {/* Resumo */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Total", valor: total, bg: "var(--paper-card)", cor: "var(--ink)" },
          { label: "Conciliadas", valor: conciliadas, bg: "#e4efe9", cor: "#21503e" },
          { label: "Sugestões", valor: sugeridas, bg: "#f5ead9", cor: "#b8875a" },
          { label: "Pendentes", valor: pendentes, bg: "#f6e6e1", cor: "#b3452f" },
        ].map(item => (
          <div key={item.label} onClick={() => setFiltroStatus(item.label)} style={{
            background: item.bg, borderRadius: 10, padding: "10px 16px",
            border: "1px solid var(--line)", minWidth: 100, cursor: "pointer",
            opacity: filtroStatus === item.label ? 1 : 0.6,
          }}>
            <p style={{ margin: 0, fontSize: 10.5, textTransform: "uppercase",
                        letterSpacing: "0.07em", color: "var(--slate)", fontWeight: 600 }}>{item.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: item.cor,
                        fontFamily: "IBM Plex Mono, monospace" }}>{item.valor}</p>
          </div>
        ))}
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <select
          value={mesAno}
          onChange={e => setMesAno(e.target.value)}
          className="input"
          style={{ maxWidth: 200 }}
        >
          {meses.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
        </select>

        <select
          value={banco}
          onChange={e => setBanco(e.target.value)}
          className="input"
          style={{ maxWidth: 160 }}
        >
          <option value="">Todos os bancos</option>
          <option value="bradesco">Bradesco</option>
          <option value="santander">Santander</option>
        </select>

        <button className="icon-btn" onClick={carregar} title="Atualizar">
          <RefreshCw size={16} />
        </button>

        <div style={{ flex: 1 }} />
        
        <button 
          className="btn" 
          onClick={handleExportarLote} 
          disabled={salvandoLote || conciliadas === 0}
          style={{ 
            display: "flex", alignItems: "center", gap: 6, 
            background: "var(--ledger)", color: "#fff", 
            border: "none", fontWeight: 600, padding: "8px 16px", borderRadius: 8,
            cursor: (salvandoLote || conciliadas === 0) ? "not-allowed" : "pointer",
            opacity: (salvandoLote || conciliadas === 0) ? 0.7 : 1
          }}
        >
          {salvandoLote ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
          Exportar Lote (Alterdata)
        </button>
      </div>

      {/* Floating Bar para Lote */}
      {selecionadasTrans.size > 0 && (
        <div style={{
          position: "sticky", top: 16, zIndex: 50,
          background: "var(--ink)", color: "#fff", borderRadius: 12,
          padding: "12px 20px", marginBottom: 16, display: "flex",
          justifyContent: "space-between", alignItems: "center",
          boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
        }}>
          <div>
            <p style={{ margin: 0, fontSize: 13, fontWeight: 600 }}>{selecionadasTrans.size} transaç{selecionadasTrans.size > 1 ? "ões" : "ão"} selecionada{selecionadasTrans.size > 1 ? "s" : ""}</p>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "rgba(255,255,255,0.7)" }}>
              Total: R$ {formatBRL(valorTotalSelecionadas)}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setSelecionadasTrans(new Set())} style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.3)", color: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13 }}>
              Cancelar
            </button>
            <button onClick={() => setModalLoteAberto(true)} style={{ background: "var(--ledger)", border: "none", color: "#fff", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontSize: 13, fontWeight: 600, display: "flex", gap: 6, alignItems: "center" }}>
              <Layers size={15}/> Conciliar Agrupado
            </button>
          </div>
        </div>
      )}

      {/* Tabela */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <Loader2 size={26} className="spin" />
        </div>
      )}

      {!loading && erro && (
        <div className="feedback feedback--error">
          <AlertTriangle size={15} /><span>{erro}</span>
        </div>
      )}

      {!loading && !erro && transacoes.length === 0 && (
        <div className="slip" style={{ textAlign: "center", padding: 48, color: "var(--slate)" }}>
          Nenhuma transação encontrada para este período.
        </div>
      )}

      {!loading && transacoes.length > 0 && (
        <div className="slip" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "var(--paper)", borderBottom: "1px solid var(--line)" }}>
                <th style={{ width: 40 }}></th>
                {["Data", "Descrição / Banco", "Valor", "Documento vinculado", "Status", "Ação"].map(h => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
                    fontSize: 10.5, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: "var(--slate)", fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {transacoesFiltradas.map(trans => (
                <LinhaTransacao
                  key={trans.id}
                  trans={trans}
                  onConciliar={handleConciliar}
                  onDesfazer={handleDesfazer}
                  selecionada={selecionadasTrans.has(trans.id)}
                  onToggleSelec={() => toggleSelectTrans(trans.id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
