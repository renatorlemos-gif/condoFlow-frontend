import React, { useState, useEffect, useCallback, useRef } from "react";

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
/*  Modal de seleção manual de documento                               */
/* ------------------------------------------------------------------ */
function ModalSelecionarDoc({ transacao, onConfirmar, onFechar }) {
  const [docs, setDocs]     = useState([]);
  const [busca, setBusca]   = useState("");
  const [loading, setLoading] = useState(true);
  const [selecionado, setSelecionado] = useState(null);

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

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      background: "rgba(16,27,48,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      <div style={{
        background: "var(--paper-card)", borderRadius: 14, width: 560,
        maxHeight: "80vh", display: "flex", flexDirection: "column",
        boxShadow: "0 20px 60px rgba(16,27,48,0.3)",
      }}>
        {/* Header */}
        <div style={{ padding: "18px 20px 12px", borderBottom: "1px solid var(--line)", display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--slate)", margin: 0 }}>Vinculando transação</p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ink)", margin: "2px 0 0" }}>
              {formatDate(transacao.data_transacao)} · {transacao.descricao} · R$ {formatBRL(transacao.valor)}
            </p>
          </div>
          <button onClick={onFechar} style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--slate)" }}>
            <X size={18} />
          </button>
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
          {filtrados.map(doc => (
            <div
              key={doc.id}
              onClick={() => setSelecionado(doc.id === selecionado ? null : doc.id)}
              style={{
                padding: "10px 20px", cursor: "pointer",
                background: selecionado === doc.id ? "var(--ledger-tint)" : "transparent",
                borderLeft: selecionado === doc.id ? "3px solid var(--ledger)" : "3px solid transparent",
                display: "grid", gridTemplateColumns: "1fr auto",
                gap: 8, alignItems: "center",
              }}
            >
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
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: "12px 20px", borderTop: "1px solid var(--line)", display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onFechar} style={{
            border: "1px solid var(--line)", background: "transparent",
            borderRadius: 8, padding: "8px 16px", fontSize: 13,
            fontWeight: 500, cursor: "pointer", color: "var(--ink-soft)",
          }}>Cancelar</button>
          <button
            disabled={!selecionado}
            onClick={() => onConfirmar(selecionado, "manual")}
            style={{
              border: "none", background: selecionado ? "var(--ledger)" : "#c3cbd6",
              color: "#fff", borderRadius: 8, padding: "8px 18px",
              fontSize: 13, fontWeight: 600, cursor: selecionado ? "pointer" : "not-allowed",
              display: "flex", alignItems: "center", gap: 6,
            }}
          >
            <Link2 size={14} /> Vincular
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Linha da tabela                                                     */
/* ------------------------------------------------------------------ */
function LinhaTransacao({ trans, onConciliar, onDesfazer }) {
  const [salvando, setSalvando] = useState(false);
  const [modalAberto, setModalAberto] = useState(false);

  const confirmar = async (docId, tipo) => {
    setSalvando(true);
    setModalAberto(false);
    await onConciliar(trans.id, docId, tipo);
    setSalvando(false);
  };

  const statusStyle = {
    conciliada: { bg: "#e4efe9", color: "#21503e", label: "Conciliada" },
    sugerida:   { bg: "#f5ead9", color: "#b8875a", label: "Sugestão"  },
    pendente:   { bg: "#f6e6e1", color: "#b3452f", label: "Pendente"  },
  }[trans.status_conciliacao] || {};

  const isConciliada = trans.status_conciliacao === "conciliada";

  return (
    <>
      {modalAberto && (
        <ModalSelecionarDoc
          transacao={trans}
          onConfirmar={confirmar}
          onFechar={() => setModalAberto(false)}
        />
      )}
      <tr style={{ borderBottom: "1px solid var(--line)" }}>
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
          {isConciliada ? (
            <div>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "var(--ink)" }}>
                {trans.documento_fornecedor || "Fornecedor não identificado"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: 11, color: "var(--slate)" }}>
                R$ {formatBRL(trans.documento_valor)}
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
            </div>
          ) : (
            <span style={{ fontSize: 12, color: "var(--slate)" }}>Sem sugestão</span>
          )}
        </td>

        {/* Status */}
        <td style={{ padding: "11px 14px" }}>
          <span style={{ background: statusStyle.bg, color: statusStyle.color,
                         fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px" }}>
            {statusStyle.label}
          </span>
        </td>

        {/* Ações */}
        <td style={{ padding: "11px 14px", whiteSpace: "nowrap" }}>
          {salvando ? (
            <Loader2 size={16} className="spin" />
          ) : isConciliada ? (
            <button
              onClick={() => onDesfazer(trans.conciliacao_id)}
              title="Desfazer conciliação"
              style={{ border: "1px solid var(--line)", background: "transparent",
                       borderRadius: 7, padding: "5px 10px", cursor: "pointer",
                       color: "var(--slate)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}
            >
              <Unlink size={13} /> Desfazer
            </button>
          ) : trans.sugestao ? (
            <div style={{ display: "flex", gap: 6 }}>
              <button
                onClick={() => confirmar(trans.sugestao.id, "automatica")}
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

  const carregar = useCallback(() => {
    setLoading(true);
    setErro("");
    const params = new URLSearchParams({ mes_ano: mesAno, limit: "200" });
    if (banco) params.set("banco", banco);
    fetch(`${API()}/api/v1/conciliacao/transacoes?${params}`)
      .then(r => r.json())
      .then(setTransacoes)
      .catch(() => setErro("Não foi possível carregar as transações."))
      .finally(() => setLoading(false));
  }, [mesAno, banco]);

  useEffect(() => { carregar(); }, [carregar]);

  const handleConciliar = async (transacaoId, documentoId, status) => {
    const resp = await fetch(`${API()}/api/v1/conciliacao/conciliar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transacao_id: transacaoId, documento_id: documentoId, status }),
    });
    if (resp.ok) carregar();
    else {
      const d = await resp.json();
      alert(d.detail || "Erro ao conciliar.");
    }
  };

  const handleDesfazer = async (conciliacaoId) => {
    if (!confirm("Desfazer esta conciliação?")) return;
    await fetch(`${API()}/api/v1/conciliacao/${conciliacaoId}`, { method: "DELETE" });
    carregar();
  };

  // Resumo
  const total      = transacoes.length;
  const conciliadas = transacoes.filter(t => t.status_conciliacao === "conciliada").length;
  const sugeridas  = transacoes.filter(t => t.status_conciliacao === "sugerida").length;
  const pendentes  = transacoes.filter(t => t.status_conciliacao === "pendente").length;

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="page__head">
        <span className="page__eyebrow">Conciliação bancária</span>
        <h1 className="page__title">Conciliar Documentos</h1>
        <p className="page__subtitle">
          Vincule transações do extrato bancário aos documentos fiscais validados.
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
          <div key={item.label} style={{
            background: item.bg, borderRadius: 10, padding: "10px 16px",
            border: "1px solid var(--line)", minWidth: 100,
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
      </div>

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
              {transacoes.map(trans => (
                <LinhaTransacao
                  key={trans.id}
                  trans={trans}
                  onConciliar={handleConciliar}
                  onDesfazer={handleDesfazer}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
