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
function XCircle({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" /><path d="m15 9-6 6M9 9l6 6" /></svg>;
}
function ArrowLeft({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="m12 19-7-7 7-7" /><path d="M19 12H5" /></svg>;
}
function ZoomIn({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M11 8v6M8 11h6" /></svg>;
}
function Printer({ size = 18, strokeWidth = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
         stroke="currentColor" strokeWidth={strokeWidth}
         strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  );
}
function AlertTriangle({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="m10.29 3.86-8.18 14.18A2 2 0 0 0 4 21h16a2 2 0 0 0 1.89-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" /><path d="M12 9v4M12 17h.01" /></svg>;
}
function RefreshCw({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M3 21v-5h5" /></svg>;
}
function ExternalLink({ size = 18, strokeWidth = 2 }) {
  return <svg {...iconBase(size, strokeWidth)}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                             */
/* ------------------------------------------------------------------ */
const API_URL = () => import.meta.env.VITE_API_URL || "";

function formatBRL(v) {
  const n = Number(v);
  if (isNaN(n)) return "—";
  return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function statusBadge(status) {
  const map = {
    pendente:   { label: "Pendente",   bg: "#eef2ff", color: "#4f46e5", spinner: true },
    extraindo:  { label: "Extraindo…", bg: "#eef2ff", color: "#4f46e5", spinner: true },
    extraido:   { label: "Aguardando", bg: "#f5ead9", color: "#b8875a" },
    validado:   { label: "Validado",   bg: "#e4efe9", color: "#21503e" },
    conciliado: { label: "Conciliado", bg: "#dde1e0", color: "#4b5567" },
    erro:       { label: "Erro",       bg: "#f6e6e1", color: "#b3452f" },
  };
  const s = map[status] || { label: status, bg: "#dde1e0", color: "#4b5567" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 11, fontWeight: 600, borderRadius: 6,
      padding: "2px 8px", whiteSpace: "nowrap",
      display: "inline-flex", alignItems: "center", gap: 4
    }}>
      {s.spinner && <Loader2 size={12} className="spin" />}
      {s.label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  Modal de zoom da foto                                               */
/* ------------------------------------------------------------------ */
function FotoModal({ url, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const isPdf = url && url.toLowerCase().includes(".pdf");

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 100,
        background: "rgba(16,27,48,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "zoom-out",
      }}
    >
      {isPdf ? (
        <iframe
          src={url}
          style={{ width: "92vw", height: "92vh", border: "none", borderRadius: 8 }}
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          src={url}
          alt="Documento ampliado"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "92vw", maxHeight: "92vh", objectFit: "contain",
                   borderRadius: 8, cursor: "default" }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tela de detalhe / validação                                         */
/* ------------------------------------------------------------------ */
function DetalheDocumento({ docId, onVoltar, onSalvo }) {
  const [doc, setDoc]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]     = useState("");
  const [zoom, setZoom]     = useState(false);
  const [form, setForm]     = useState({});
  const [planoContas, setPlanoContas] = useState([]);

  useEffect(() => {
    let ativo = true;
    const fetchDoc = async () => {
      try {
        setLoading(true);
        setErro("");
        const res = await fetch(`${API_URL()}/api/v1/validacao/documentos/${docId}`);
        if (!res.ok) throw new Error("Erro na requisição");
        const d = await res.json();
        if (ativo) {
          setDoc(d);
          setForm({
            fornecedor:      d.fornecedor      || "",
            cnpj_cpf:        d.cnpj_cpf        || "",
            numero_doc:      d.numero_doc      || "",
            data_emissao:    d.data_emissao    || "",
            data_vencimento: d.data_vencimento || "",
            data_pagamento:  d.data_pagamento  || "",
            valor_total:     d.valor_total     ?? "",
            descricao:       d.descricao       || "",
            conta_codigo:    d.sugestao_contabil?.conta_debito_codigo || "",
          });
          
          try {
            const resPlano = await fetch(`${API_URL()}/api/v1/validacao/documentos/${docId}/contas-sugeridas`);
            if (resPlano.ok) {
              const contas = await resPlano.json();
              if (ativo) setPlanoContas(contas);
            }
          } catch (errPlano) {
            console.error("Erro ao carregar contas sugeridas", errPlano);
          }
        }
      } catch (err) {
        if (ativo) setErro("Não foi possível carregar o documento.");
      } finally {
        if (ativo) setLoading(false);
      }
    };
    fetchDoc();
    return () => { ativo = false; };
  }, [docId]);

  const handleAcao = async (acao) => {
    setSalvando(true);
    setErro("");
    try {
      const resp = await fetch(`${API_URL()}/api/v1/validacao/documentos/${docId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ acao, ...form }),
      });
      if (!resp.ok) {
        const errData = await resp.json().catch(() => ({}));
        throw new Error(errData.detail || "Erro ao salvar.");
      }
      onSalvo();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  const handleReprocessar = async () => {
    setSalvando(true);
    setErro("");
    try {
      const resp = await fetch(`${API_URL()}/api/v1/documentos/${docId}/reprocessar`, {
        method: "POST",
      });
      if (!resp.ok) throw new Error("Erro ao solicitar reprocessamento.");
      onSalvo();
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <Loader2 size={28} className="spin" />
    </div>
  );

  if (!doc) return (
    <div className="feedback feedback--error">
      <AlertTriangle size={15} /><span>{erro || "Documento não encontrado."}</span>
    </div>
  );

  const campo = (label, key, type = "text") => (
    <div className="field">
      <span className="field__label">{label}</span>
      <input
        type={type}
        className="input"
        value={form[key] ?? ""}
        onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
      />
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 960 }}>
      {zoom && doc.foto_url && <FotoModal url={doc.foto_url} onClose={() => setZoom(false)} />}

      {/* Cabeçalho */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button className="icon-btn" onClick={onVoltar} title="Voltar à lista">
          <ArrowLeft size={18} />
        </button>
        <div>
          <span className="page__eyebrow">Validação</span>
          <h1 className="page__title" style={{ margin: 0 }}>{doc.filename}</h1>
        </div>
        <div style={{ marginLeft: "auto" }}>{statusBadge(doc.status)}</div>
      </div>

      {/* Split screen */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start" }}>

        {/* Foto */}
        <div className="slip" style={{ padding: 0, overflow: "hidden" }}>
          {doc.foto_url ? (
            <div style={{ position: "relative" }}>
              {(() => {
                const isPdf = (doc.foto_url && doc.foto_url.toLowerCase().includes(".pdf")) ||
                              (doc.filename && doc.filename.toLowerCase().includes(".pdf"));
                return isPdf ? (
                  <iframe
                    src={doc.foto_url}
                    style={{ width: "100%", height: "520px", border: "none" }}
                  />
                ) : (
                  <img
                    src={doc.foto_url}
                    alt="Documento fiscal"
                    style={{ width: "100%", display: "block", maxHeight: 520, objectFit: "contain",
                             background: "#eef1ef", cursor: "zoom-in" }}
                    onClick={() => setZoom(true)}
                  />
                );
              })()}
              <div style={{ position: "absolute", bottom: 10, right: 10, display: "flex", gap: 8 }}>
                {doc.url_sefaz_qr && (
                  <a
                    href={doc.url_sefaz_qr}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir Original Sefaz"
                    style={{
                      background: "rgba(255,255,255,0.9)", border: "1px solid #dde1e0",
                      borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 5,
                      fontSize: 12, fontWeight: 500, color: "#4b5567", textDecoration: "none"
                    }}
                  >
                    <ExternalLink size={14} /> Abrir Sefaz
                  </a>
                )}
                <button
                  onClick={() => setZoom(true)}
                  title="Ampliar"
                  style={{
                    background: "rgba(255,255,255,0.9)", border: "1px solid #dde1e0",
                    borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, fontWeight: 500, color: "#4b5567",
                  }}
                >
                  <ZoomIn size={14} /> Ampliar
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#7a8496" }}>
              Foto não disponível
            </div>
          )}
        </div>

        {/* Dados editáveis */}
        <div className="slip">
          <h2 className="section-title">Dados extraídos</h2>

          <div className="result-grid">
            {campo("Fornecedor",    "fornecedor")}
            {campo("CNPJ/CPF",      "cnpj_cpf")}
            {campo("Nº do documento","numero_doc")}
            {campo("Valor total (R$)","valor_total", "number")}
            {campo("Data de emissão", "data_emissao", "date")}
            {campo("Data de vencimento","data_vencimento","date")}
            {doc.data_pagamento !== undefined && campo("Data de pagamento","data_pagamento","date")}
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <span className="field__label">Descrição</span>
            <textarea
              className="input textarea"
              rows={2}
              value={form.descricao ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <span className="field__label">Conta Contábil (Débito)</span>
            <select
              className="input"
              value={form.conta_codigo ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, conta_codigo: e.target.value }))}
            >
              <option value="">Selecione uma conta...</option>
              {planoContas.length > 0 && planoContas.some(c => c.similarity !== null && c.similarity !== undefined) ? (
                <>
                  <optgroup label="Mais Prováveis">
                    {planoContas.slice(0, 5).map(conta => (
                      <option key={`prov-${conta.codigo}`} value={conta.codigo}>
                        {conta.codigo} - {conta.descricao} {conta.similarity ? `(${(conta.similarity * 100).toFixed(1)}%)` : ''}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Outras Contas">
                    {planoContas.slice(5).map(conta => (
                      <option key={`outras-${conta.codigo}`} value={conta.codigo}>
                        {conta.codigo} - {conta.descricao}
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                planoContas.map(conta => (
                  <option key={`normal-${conta.codigo}`} value={conta.codigo}>
                    {conta.codigo} - {conta.descricao}
                  </option>
                ))
              )}
            </select>
          </div>


          {erro && (
            <div className="feedback feedback--error" style={{ marginBottom: 12 }}>
              <AlertTriangle size={15} /><span>{erro}</span>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              className="btn-primary"
              disabled={salvando}
              onClick={() => handleAcao("confirmar")}
              style={{ flex: 1 }}
            >
              {salvando ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
              Confirmar
            </button>
            {doc.status === "erro" && (
              <button
                onClick={handleReprocessar}
                disabled={salvando}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  border: "1px solid #4b5567", background: "transparent",
                  color: "#4b5567", borderRadius: 9, padding: "11px 16px",
                  fontWeight: 600, fontSize: 13.5, cursor: "pointer",
                }}
              >
                <RefreshCw size={15} /> Reprocessar OCR
              </button>
            )}
            <button
              onClick={() => handleAcao("rejeitar")}
              disabled={salvando}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                border: "1px solid #b3452f", background: "transparent",
                color: "#b3452f", borderRadius: 9, padding: "11px 16px",
                fontWeight: 600, fontSize: 13.5, cursor: "pointer",
              }}
            >
              <XCircle size={15} /> Rejeitar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tela de lista                                                       */
/* ------------------------------------------------------------------ */
export default function ValidarDocumentos() {
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState("");
  const [filtro, setFiltro]     = useState("todos");
  const [docAberto, setDocAberto] = useState(null);

  const isFetchingRef = useRef(false);

  const carregar = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API_URL()}/api/v1/validacao/documentos?status=todos&limit=100`, {
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!res.ok) throw new Error("Erro na requisição");
      const data = await res.json();
      setDocs(Array.isArray(data) ? data : []);
      setErro("");
    } catch (e) {
      if (e.name === "AbortError") {
        setErro("A requisição demorou muito para responder.");
      } else {
        setErro("Não foi possível carregar os documentos.");
      }
    } finally {
      clearTimeout(timeoutId);
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, []);

  useEffect(() => { 
    carregar(); 
    const interval = setInterval(carregar, 10000);
    return () => clearInterval(interval);
  }, [carregar]);

  const total = docs.length;
  const aguardando = docs.filter(d => d.status === "extraido").length;
  const validados = docs.filter(d => d.status === "validado").length;
  const conciliados = docs.filter(d => d.status === "conciliado").length;
  const erros = docs.filter(d => d.status === "erro").length;

  const docsFiltrados = docs.filter(d => 
    filtro === "todos" ? true :
    d.status === filtro
  );

  if (docAberto) {
    return (
      <DetalheDocumento
        docId={docAberto}
        onVoltar={() => { setDocAberto(null); carregar(); }}
        onSalvo={() => { setDocAberto(null); carregar(); }}
      />
    );
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page__head">
        <span className="page__eyebrow">Contabilidade</span>
        <h1 className="page__title">Validar Documentos</h1>
        <p className="page__subtitle">
          Revise e confirme os dados extraídos automaticamente antes da conciliação.
        </p>
      </div>

      {/* Filtros + reload */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        {[
          { label: "Todos", value: "todos", valor: total, bg: "var(--paper-card)", cor: "var(--ink)" },
          { label: "Aguardando", value: "extraido", valor: aguardando, bg: "#f5ead9", cor: "#b8875a" },
          { label: "Validados", value: "validado", valor: validados, bg: "#e4efe9", cor: "#21503e" },
          { label: "Conciliados", value: "conciliado", valor: conciliados, bg: "#e0f2fe", cor: "#0369a1" },
          { label: "Com erro", value: "erro", valor: erros, bg: "#f6e6e1", cor: "#b3452f" },
        ].map(item => (
          <div key={item.value} onClick={() => setFiltro(item.value)} style={{
            background: item.bg, borderRadius: 10, padding: "10px 16px",
            border: "1px solid var(--line)", minWidth: 100, cursor: "pointer",
            opacity: filtro === item.value ? 1 : 0.6,
          }}>
            <p style={{ margin: 0, fontSize: 10.5, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--slate)", fontWeight: 600 }}>{item.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 700, color: item.cor, fontFamily: "IBM Plex Mono, monospace" }}>{item.valor}</p>
          </div>
        ))}
        <button
          className="icon-btn"
          onClick={carregar}
          title="Atualizar"
          disabled={loading}
          style={{ marginLeft: "auto", alignSelf: "flex-start", marginTop: 8, opacity: loading ? 0.5 : 1, cursor: loading ? "not-allowed" : "pointer" }}
        >
          <RefreshCw size={16} className={loading ? "spin" : ""} />
        </button>
      </div>

      {/* Estado de carregamento */}
      {loading && (
        <div style={{ display: "flex", justifyContent: "center", padding: 48 }}>
          <Loader2 size={24} className="spin" />
        </div>
      )}

      {/* Erro */}
      {!loading && erro && (
        <div className="feedback feedback--error">
          <AlertTriangle size={15} /><span>{erro}</span>
        </div>
      )}

      {/* Lista vazia */}
      {!loading && !erro && docsFiltrados.length === 0 && (
        <div className="slip" style={{ textAlign: "center", padding: 48, color: "var(--slate)" }}>
          Nenhum documento {filtro === "extraido" ? "aguardando validação" : "encontrado"}.
        </div>
      )}

      {/* Tabela */}
      {!loading && docsFiltrados.length > 0 && (
        <div className="slip" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--paper)" }}>
                {["Fornecedor", "Nº Doc", "Data emissão", "Valor (R$)", "Status", ""].map((h) => (
                  <th key={h} style={{
                    padding: "10px 14px", textAlign: "left",
                    fontSize: 10.5, textTransform: "uppercase",
                    letterSpacing: "0.06em", color: "var(--slate)",
                    fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {docsFiltrados.map((doc, i) => (
                <tr
                  key={doc.id}
                  onClick={() => setDocAberto(doc.id)}
                  style={{
                    borderBottom: i < docsFiltrados.length - 1 ? "1px solid var(--line)" : "none",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "11px 14px", fontWeight: 500, color: "var(--ink)" }}>
                    {doc.fornecedor || <span style={{ color: "var(--slate)" }}>—</span>}
                  </td>
                  <td style={{ padding: "11px 14px", color: "var(--ink-soft)" }}>
                    {doc.numero_doc || "—"}
                  </td>
                  <td style={{ padding: "11px 14px", color: "var(--ink-soft)" }}>
                    {doc.data_emissao
                      ? new Date(doc.data_emissao + "T00:00:00").toLocaleDateString("pt-BR")
                      : "—"}
                  </td>
                  <td style={{ padding: "11px 14px", fontFamily: "IBM Plex Mono, monospace",
                               fontSize: 12, color: "var(--ink)" }}>
                    {doc.valor_total != null ? formatBRL(doc.valor_total) : "—"}
                  </td>
                  <td style={{ padding: "11px 14px" }}>{statusBadge(doc.status)}</td>
                  <td style={{ padding: "11px 14px", color: "var(--ledger)",
                               fontWeight: 600, fontSize: 12 }}>
                    Abrir →
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
