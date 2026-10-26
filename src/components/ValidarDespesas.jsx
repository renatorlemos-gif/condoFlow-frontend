import React, { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useCondo } from "../context/CondoContext";

/* ------------------------------------------------------------------ */
/*  Ícones inline                                                       */
/* ------------------------------------------------------------------ */
const iconBase = (size, sw) => ({
  width: size, height: size, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth: sw, strokeLinecap: "round", strokeLinejoin: "round",
});

function Trash2({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

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

function interpolarDescricao(template, fornecedor, numeroDoc) {
  if (!template) return "";
  let res = template;
  const fVal = (fornecedor || "").trim();
  const dVal = (numeroDoc || "").trim();
  res = res.replace(/<fornecedor>/gi, fVal);
  res = res.replace(/<numero_doc>/gi, dVal);
  res = res.replace(/\s+/g, " ").trim();
  return res;
}

function statusBadge(status) {
  const map = {
    pendente:   { label: "Pendente",   bg: "#f3f4f6", color: "#4b5563", spinner: true },
    extraindo:  { label: "Extraindo…", bg: "#f3f4f6", color: "#4b5563", spinner: true },
    extraido:   { label: "Aguardando", bg: "#f5ead9", color: "#b8875a" },
    validado:   { label: "Validado",   bg: "#e4efe9", color: "#21503e" },
    conciliado: { label: "Conciliado", bg: "#e0f2fe", color: "#0369a1" },
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
          alt="Despesa ampliado"
          onClick={(e) => e.stopPropagation()}
          style={{ maxWidth: "92vw", maxHeight: "92vh", objectFit: "contain",
                   borderRadius: 8, cursor: "default" }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Campo de data com placeholder e picker inteligente                  */
/* ------------------------------------------------------------------ */
function MaskedDateInput({ value, onChange, placeholder, style, className, min, max }) {
  const formatValue = (val) => {
    if (!val) return "";
    const cleanVal = val.includes("T") ? val.split("T")[0] : val;
    const parts = cleanVal.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return val;
  };

  const [display, setDisplay] = useState(formatValue(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(formatValue(value));
    }
  }, [value, focused]);

  const cleanVal = value && value.includes("T") ? value.split("T")[0] : value;
  const isOutOfRange = Boolean(
    cleanVal && ((min && cleanVal < min) || (max && cleanVal > max))
  );

  const handleChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 8) raw = raw.slice(0, 8);
    let masked = raw;
    if (raw.length > 4) {
      masked = `${raw.slice(0, 2)}/${raw.slice(2, 4)}/${raw.slice(4)}`;
    } else if (raw.length > 2) {
      masked = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setDisplay(masked);

    if (raw.length === 8) {
      const d = raw.slice(0, 2);
      const m = raw.slice(2, 4);
      const y = raw.slice(4, 8);
      if (Number(m) >= 1 && Number(m) <= 12 && Number(d) >= 1 && Number(d) <= 31) {
        onChange({ target: { value: `${y}-${m}-${d}` } });
      } else {
        onChange({ target: { value: "" } });
      }
    } else {
      onChange({ target: { value: "" } }); 
    }
  };

  const combinedStyle = {
    ...style,
    ...(isOutOfRange ? { borderColor: "#ef4444", color: "#b91c1c", backgroundColor: "#fff5f5" } : {})
  };

  return (
    <input
      type="text"
      min={min}
      max={max}
      className={`${className || ""} ${!value ? "input--missing" : ""} ${isOutOfRange ? "input--out-of-range" : ""}`.trim()}
      style={combinedStyle}
      placeholder={placeholder || "DD/MM/YYYY"}
      value={display}
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      title={isOutOfRange ? "Data fora da competência ativa" : undefined}
    />
  );
}

function MaskedCompInput({ value, onChange, placeholder, style, className }) {
  const [display, setDisplay] = useState(value || "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(value || "");
    }
  }, [value, focused]);

  const handleChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (raw.length > 6) raw = raw.slice(0, 6);
    let masked = raw;
    if (raw.length > 2) {
      masked = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setDisplay(masked);

    if (raw.length === 6) {
      onChange({ target: { value: masked } });
    } else {
      onChange({ target: { value: "" } });
    }
  };

  return <input type="text" className={`${className || ""} ${!value ? "input--missing" : ""}`.trim()} style={style} placeholder={placeholder || "MM/YYYY"} value={display} onChange={handleChange} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} />;
}

function MaskedCurrencyInput({ value, onChange, placeholder, style, className }) {
  const formatCurrency = (val) => {
    if (val === null || val === undefined || val === "") return "";
    const n = Number(val);
    if (isNaN(n)) return "";
    return n.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };
  
  const [display, setDisplay] = useState("");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) {
      setDisplay(formatCurrency(value));
    }
  }, [value, focused]);

  const handleChange = (e) => {
    let raw = e.target.value.replace(/\D/g, "");
    if (!raw) {
       setDisplay("");
       onChange({ target: { value: "" } });
       return;
    }
    const num = Number(raw) / 100;
    setDisplay(num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
    onChange({ target: { value: num } });
  };

  return (
    <input 
      type="text" 
      className={`${className || ""} ${value === "" || value === null ? "input--missing" : ""}`.trim()} 
      style={style} 
      placeholder={placeholder || "0,00"} 
      value={display} 
      onChange={handleChange}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  Modal de Conciliação Imediata                                       */
/* ------------------------------------------------------------------ */
function ModalConciliacaoImediata({ transacao, docId, onConfirm, onValidarDepois, onCancel, salvando, valorDoc }) {
  const diff = Math.abs(Number(transacao.valor || 0) - Number(valorDoc || 0));
  const isDivergente = diff > 0.05;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(16,27,48,0.6)", backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center"
      }}
    >
      <div style={{
        background: "var(--paper)", width: 440, borderRadius: 12,
        boxShadow: "0 12px 24px rgba(0,0,0,0.15)", padding: 24
      }}>
        <h2 style={{ margin: "0 0 8px", fontSize: 18, color: "var(--ink)", fontWeight: 600 }}>
          Conciliação Sugerida
        </h2>
        <p style={{ margin: "0 0 20px", fontSize: 14, color: "var(--slate)" }}>
          Encontramos uma transação correspondente no extrato bancário.
        </p>

        <div style={{
          background: "var(--paper-card)", border: "1px solid var(--line)",
          borderRadius: 8, padding: 16, marginBottom: 24
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span style={{
              background: transacao.score >= 0.85 ? "#ecfdf5" : "#fef3c7",
              color: transacao.score >= 0.85 ? "#065f46" : "#92400e",
              padding: "4px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600
            }}>
              {transacao.score >= 0.85 ? `🟢 Match Forte (${Math.round(transacao.score * 100)}%)` : `🟡 Match Provável (${Math.round(transacao.score * 100)}%)`}
            </span>
            <span style={{ fontSize: 13, color: "var(--slate)", fontWeight: 500 }}>
              {(() => {
                 if (!transacao.data_transacao) return "";
                 const raw = transacao.data_transacao.includes("T") ? transacao.data_transacao : transacao.data_transacao + "T00:00:00";
                 const dt = new Date(raw);
                 return isNaN(dt.getTime()) ? transacao.data_transacao : dt.toLocaleDateString("pt-BR");
              })()}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--ink)", fontWeight: 600, marginBottom: 4, wordBreak: "break-word" }}>
            {transacao.descricao || "Sem descrição"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
            <span style={{ fontSize: 13, color: "var(--slate)" }}>{transacao.banco?.toUpperCase() || "BANCO"}</span>
            <span style={{ fontSize: 16, color: "var(--ink)", fontWeight: 600, fontFamily: "IBM Plex Mono, monospace" }}>
              {formatBRL(transacao.valor)}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <button type="button" onClick={onConfirm}
            disabled={salvando || isDivergente}
            className="btn-primary"
            style={{ padding: "12px 16px", fontSize: 14, justifyContent: "center", width: "100%" }}
          >
            {salvando ? "Conciliando..." : isDivergente ? "Valor Divergente (Bloqueado)" : "Confirmar Conciliação"}
          </button>
          {isDivergente && (
            <span style={{ fontSize: 12, color: "var(--ledger)", textAlign: "center", marginTop: "-6px" }}>
              Dica: Corrija o valor da nota (se erro de leitura) ou valide para conciliar depois.
            </span>
          )}
          <button type="button" onClick={onValidarDepois}
            disabled={salvando}
            style={{
              padding: "12px 16px", borderRadius: 8, border: "1px solid var(--ledger)",
              background: "transparent", color: "var(--ledger)", fontWeight: 600, cursor: "pointer",
              fontSize: 14, width: "100%", textAlign: "center"
            }}
          >
            Validar e conciliar depois
          </button>
          <button type="button" onClick={onCancel}
            disabled={salvando}
            style={{
              padding: "12px 16px", borderRadius: 8, border: "1px solid var(--line)",
              background: "transparent", color: "var(--ink-soft)", fontWeight: 600, cursor: "pointer",
              fontSize: 14, width: "100%", textAlign: "center"
            }}
          >
            Cancelar validação
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Tela de detalhe / validação                                         */
/* ------------------------------------------------------------------ */
function DetalheDespesa({ docId, onVoltar, onSalvo, revisaoIds, toggleRevisao }) {
  const { mesAnoSelecionado, selectedCondoId, selectedFonteId } = useCondo();
  const [doc, setDoc]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro]     = useState("");
  const [zoom, setZoom]     = useState(false);
  const [form, setForm]     = useState({});
  const [planoContas, setPlanoContas] = useState([]);
  const [contasBancarias, setContasBancarias] = useState([]);
  const [sugestao, setSugestao] = useState(null);
  const [fonteCorrenteId, setFonteCorrenteId] = useState(null);
  const [alertaSemConciliacao, setAlertaSemConciliacao] = useState(false);
  const [showToast, setShowToast] = useState("");
  const [scanning, setScanning] = useState(false);

  const limitesCompetencia = useMemo(() => {
    if (!mesAnoSelecionado || !mesAnoSelecionado.includes("-")) {
      return { minDate: null, maxDate: null, ano: null, mes: null, ultimoDia: null };
    }
    const [ano, mes] = mesAnoSelecionado.split("-").map(Number);
    if (!ano || !mes || mes < 1 || mes > 12) {
      return { minDate: null, maxDate: null, ano: null, mes: null, ultimoDia: null };
    }
    const ultimoDia = new Date(ano, mes, 0).getDate();
    const minDate = `${ano}-${String(mes).padStart(2, "0")}-01`;
    const maxDate = `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
    return { minDate, maxDate, ano, mes, ultimoDia };
  }, [mesAnoSelecionado]);

  const formatarDataBr = (val) => {
    if (!val) return "";
    const clean = val.includes("T") ? val.split("T")[0] : val;
    const parts = clean.split("-");
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return val;
  };

  const debounceTimerRef = useRef(null);
  const isInitialMount = useRef(true);
  const prevInputsRef = useRef({ fornecedor: "", numero_doc: "" });

  const handleContaChange = (novaContaId) => {
    const selectedConta = planoContas.find(c => c.id === novaContaId);
    setForm(prev => {
      let novaDesc = prev.descricao;
      if (selectedConta?.descricao_padrao) {
        novaDesc = interpolarDescricao(selectedConta.descricao_padrao, prev.fornecedor, prev.numero_doc);
      } else {
        novaDesc = doc?.descricao_original || doc?.descricao || "";
      }
      return {
        ...prev,
        conta_codigo: novaContaId,
        descricao: novaDesc
      };
    });
  };

  useEffect(() => {
    if (isInitialMount.current) {
      if (form.fornecedor !== undefined || form.numero_doc !== undefined) {
        isInitialMount.current = false;
        prevInputsRef.current = { fornecedor: form.fornecedor, numero_doc: form.numero_doc };
      }
      return;
    }

    const fornecedorMudou = prevInputsRef.current.fornecedor !== form.fornecedor;
    const docMudou = prevInputsRef.current.numero_doc !== form.numero_doc;
    prevInputsRef.current = { fornecedor: form.fornecedor, numero_doc: form.numero_doc };

    if (!fornecedorMudou && !docMudou) {
      return;
    }

    const selectedConta = planoContas.find(c => c.id === form.conta_codigo);
    if (!selectedConta || !selectedConta.descricao_padrao) {
      return;
    }

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const novaDesc = interpolarDescricao(
        selectedConta.descricao_padrao,
        form.fornecedor,
        form.numero_doc
      );
      setForm(prev => {
        if (prev.descricao === novaDesc) return prev;
        return { ...prev, descricao: novaDesc };
      });
    }, 1500);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [form.fornecedor, form.numero_doc, form.conta_codigo, planoContas]);

  useEffect(() => {
    let ativo = true;
    const fetchDoc = async () => {
      try {
        setLoading(true);
        setErro("");
        const res = await fetch(`${API_URL()}/api/v1/validacao/despesas/${docId}`);
        if (!res.ok) throw new Error("Erro na requisição");
        const d = await res.json();
        if (ativo) {
          setDoc(d);
          
          const limpaInit = (val) => {
            if (!val) return "";
            if (typeof val === "string") {
              const v = val.trim();
              if (["null", "none", "undefined", "dd/mm/aaaa", "—", "-", "não identificado", "nao identificado"].includes(v.toLowerCase())) return "";
              return v;
            }
            return val || "";
          };

          const limpaData = (val) => {
            const v = limpaInit(val);
            if (!v) return "";
            if (v.includes("T")) return v.split("T")[0];
            return v;
          };

          setForm({
            fornecedor:      limpaInit(d.fornecedor),
            cnpj_cpf:        limpaInit(d.cnpj_cpf),
            numero_doc:      limpaInit(d.numero_doc),
            data_emissao:    limpaData(d.data_emissao),
            data_vencimento: limpaData(d.data_vencimento),
            data_pagamento:  limpaData(d.data_pagamento),
            valor_total:     d.valor_total ?? "",
            descricao:       limpaInit(d.descricao),
            chave_acesso:    limpaInit(d.chave_acesso),
            competencia:     limpaInit(d.competencia),
            conta_codigo:    "", // Será preenchido pelo fetch sugeridas
            conta_devedora_id: d.fonte_pagadora_id || "",
          });
          
          if (ativo) setLoading(false); // Libera a tela imediatamente para leitura

          const fontesPromise = fetch(`${API_URL()}/api/v1/fontes-pagadoras?condominio_id=${d.condominio_id}`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => []);

          const correntePromise = fetch(`${API_URL()}/api/v1/fontes-pagadoras/corrente?condominio_id=${d.condominio_id}&mes_ano=${mesAnoSelecionado || ""}`)
            .then(res => res.ok ? res.json() : null)
            .catch(() => null);

          const contasSugeridasPromise = fetch(`${API_URL()}/api/v1/validacao/despesas/${docId}/contas-sugeridas`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => []);

          Promise.all([fontesPromise, correntePromise, contasSugeridasPromise]).then(([fontes, correnteData, contas]) => {
            if (!ativo) return;
            setContasBancarias(fontes);

            const fidCorrente = selectedFonteId || correnteData?.fonte_pagadora_id || (fontes.find(f => f.exige_conciliacao_extrato)?.id) || (fontes[0]?.id) || "";
            setFonteCorrenteId(fidCorrente);

            setForm(prev => ({
              ...prev,
              conta_devedora_id: d.fonte_pagadora_id || fidCorrente || "",
            }));

            setPlanoContas(contas);

            // 1. Usa o UUID que o usuário já salvou no banco (se existir)
            let selectedId = d.conta_despesa_id;

            // 2. Se for novo/não salvo, tenta usar a sugestão da IA baseada no código
            if (!selectedId) {
              const defaultCodigo = d.sugestao_contabil?.conta_debito_codigo;
              if (defaultCodigo) {
                const match = contas.find(c => c.codigo_contabil === defaultCodigo);
                if (match) selectedId = match.id;
              }
            }

            // 3. Fallback
            if (!selectedId && contas.length > 0) {
              selectedId = contas[0].id;
            }

            if (selectedId) {
              setForm(prev => {
                const selConta = contas.find(c => c.id === selectedId);
                let novaDesc = prev.descricao;
                if (selConta?.descricao_padrao && (!prev.descricao || prev.descricao === (d.descricao_original || d.descricao))) {
                  novaDesc = interpolarDescricao(selConta.descricao_padrao, prev.fornecedor, prev.numero_doc);
                }
                return { ...prev, conta_codigo: selectedId, descricao: novaDesc };
              });
            }
          }).catch(console.error);
        }
      } catch (err) {
        if (ativo) setErro("Não foi possível carregar a despesa.");
      } finally {
        if (ativo) setLoading(false);
      }
    };
    fetchDoc();
    return () => { ativo = false; };
  }, [docId, mesAnoSelecionado]);

  const salvarDespesaPatch = async (acaoPatch, forcedContaDevedoraId = undefined) => {
    const payload = { acao: acaoPatch, ...form };
    if (forcedContaDevedoraId !== undefined) {
        payload.conta_devedora_id = forcedContaDevedoraId;
    }
    const prepareParaEnvio = (val) => {
      if (typeof val === "string" && val.trim() === "") return null;
      return val;
    };

    payload.fornecedor = prepareParaEnvio(payload.fornecedor);
    payload.cnpj_cpf = prepareParaEnvio(payload.cnpj_cpf);
    payload.numero_doc = prepareParaEnvio(payload.numero_doc);
    payload.data_emissao = prepareParaEnvio(payload.data_emissao);
    payload.data_vencimento = prepareParaEnvio(payload.data_vencimento);
    payload.data_pagamento = prepareParaEnvio(payload.data_pagamento);
    payload.descricao = prepareParaEnvio(payload.descricao);
    payload.chave_acesso = prepareParaEnvio(payload.chave_acesso);
    payload.competencia = prepareParaEnvio(payload.competencia);
    
    // Mapeamento correto para o backend
    payload.conta_despesa_id = prepareParaEnvio(payload.conta_codigo);
    payload.fonte_pagadora_id = prepareParaEnvio(payload.conta_devedora_id);
    delete payload.conta_codigo;
    delete payload.conta_devedora_id;

    if (payload.valor_total === "") payload.valor_total = null;

    if (mesAnoSelecionado) {
      payload.mes_ano = mesAnoSelecionado;
    }

    if (acaoPatch === "salvar" || acaoPatch === "confirmar") {
      if (payload.data_pagamento && limitesCompetencia.minDate && limitesCompetencia.maxDate) {
        if (payload.data_pagamento < limitesCompetencia.minDate || payload.data_pagamento > limitesCompetencia.maxDate) {
          throw new Error(
            `A data de pagamento (${formatarDataBr(payload.data_pagamento)}) não pertence à competência ativa (${mesAnoSelecionado}). ` +
            `Se a despesa foi paga em outro mês, não salve nesta competência: exclua o documento desta pasta mensal para aguardar e processá-lo no mês correto.`
          );
        }
      }
    }

    const resp = await fetch(`${API_URL()}/api/v1/validacao/despesas/${docId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}));
      throw new Error(errData.detail || "Erro ao salvar.");
    }
    return resp;
  };

  const handleAcao = async (acao, forcedContaDevedoraId = undefined) => {
    setSalvando(true);
    setErro("");
    try {
      if (acao !== "rejeitar" && acao !== "cancelar") {
        if (form.data_pagamento && limitesCompetencia.minDate && limitesCompetencia.maxDate) {
          if (form.data_pagamento < limitesCompetencia.minDate || form.data_pagamento > limitesCompetencia.maxDate) {
            setErro(
              `A data de pagamento (${formatarDataBr(form.data_pagamento)}) não pertence à competência ativa (${mesAnoSelecionado}). ` +
              `Se a despesa foi paga em outro mês, não salve nesta competência: exclua o documento desta pasta mensal para aguardar e processá-lo no mês correto.`
            );
            setSalvando(false);
            return;
          }
        }
      }

      if (acao === "rejeitar") {
        await salvarDespesaPatch(acao);
        onSalvo();
        return;
      }

      if (acao === "salvar") {
        await salvarDespesaPatch("salvar");
        setShowToast("Despesa salva com sucesso.");
        setSalvando(false);
        return;
      }

      if (acao === "confirmar" && mesAnoSelecionado) {
        // Validação: não permitir confirmação sem fonte pagadora selecionada
        if (!form.conta_devedora_id || form.conta_devedora_id.trim() === "") {
          setErro("A fonte pagadora (Conta Crédito) é obrigatória para validação.");
          setSalvando(false);
          return;
        }

        if (forcedContaDevedoraId !== undefined) {
          await salvarDespesaPatch("confirmar", forcedContaDevedoraId);
          setShowToast("Despesa validada com sucesso. A conciliação será feita depois.");
          setTimeout(() => onSalvo(), 2000);
          setSalvando(false);
          return;
        }

        const fonteSelecionada = form.conta_devedora_id;
        const contaLateralAtivaId = selectedFonteId || fonteCorrenteId;
        const isFonteDivergente = Boolean(contaLateralAtivaId && fonteSelecionada && fonteSelecionada !== contaLateralAtivaId);

        // CENÁRIO B: FONTE DIVERGENTE DA CORRENTE -> VALIDAÇÃO DIRETA (BYPASS CONCILIAÇÃO)
        if (isFonteDivergente) {
          await salvarDespesaPatch("confirmar", fonteSelecionada);
          setShowToast("Despesa validada com sucesso contra a fonte pagadora selecionada.");
          setTimeout(() => onSalvo(), 1500);
          setSalvando(false);
          return;
        }

        // CENÁRIO A: MESMA FONTE DO EXTRATO -> BUSCA CONCILIAÇÃO
        // 1. Salva dados na tela primeiro via ação "salvar"
        await salvarDespesaPatch("salvar");

        // 2. Monta parâmetros dinâmicos com os dados da tela para busca de sugestões
        const queryParams = new URLSearchParams({
          mes_ano: mesAnoSelecionado,
          condominio_id: selectedCondoId || "",
        });
        if (form.valor_total !== null && form.valor_total !== "" && form.valor_total !== undefined) {
          queryParams.append("valor_total", form.valor_total);
        }
        if (form.data_pagamento) {
          queryParams.append("data_pagamento", form.data_pagamento);
        }
        if (form.data_emissao) {
          queryParams.append("data_emissao", form.data_emissao);
        }

        try {
          const sugResp = await fetch(
            `${API_URL()}/api/v1/conciliacao/sugestoes-despesa/${docId}?${queryParams.toString()}`
          );
          if (sugResp.ok) {
            const sugData = await sugResp.json();
            if (sugData.tem_sugestao && sugData.sugestao) {
              setSugestao(sugData.sugestao);
              setSalvando(false);
              return;
            }
          }
        } catch (e) {
          console.error("Erro ao buscar sugestão", e);
        }

        // Se não encontrou sugestão:
        // Primeiro clique: ativa alerta visual e aguarda reconfirmação
        if (!alertaSemConciliacao) {
          setAlertaSemConciliacao(true);
          setErro("A automação não encontrou conciliação para este valor. Verifique a Fonte Pagadora (Crédito) abaixo e confirme novamente para gravar.");
          setSalvando(false);
          return;
        }

        // Segundo clique com alerta ativo: valida e grava
        await salvarDespesaPatch("confirmar", fonteSelecionada);
        const [ano, mes] = mesAnoSelecionado.split("-");
        const date = new Date(ano, parseInt(mes) - 1);
        const mesFormat = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        const mesCapitalizado = mesFormat.charAt(0).toUpperCase() + mesFormat.slice(1);
        setShowToast(`Despesa validada. Nenhuma transação correspondente encontrada no extrato de ${mesCapitalizado}.`);
        setTimeout(() => onSalvo(), 2000);
        setSalvando(false);
        return;
      }
      
      await salvarDespesaPatch(acao);
      onSalvo();
    } catch (e) {
      setErro(e.message);
      setSalvando(false);
    }
  };

  const handleConfirmarConciliacao = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSalvando(true);
    try {
      await salvarDespesaPatch("confirmar", sugestao.fonte_pagadora_id || null);

      const resp = await fetch(`${API_URL()}/api/v1/conciliacao/conciliar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transacoes_ids: [sugestao.id],
          despesas_ids: [docId],
          status: "manual"
        })
      });
      if (!resp.ok) throw new Error("Erro ao conciliar.");
      
      setSugestao(null);
      setShowToast("Conciliado com sucesso!");
      setTimeout(() => onSalvo(), 2000);
      return;
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  };

  const handleReprocessar = async () => {
    setSalvando(true);
    setErro("");
    try {
      const resp = await fetch(`${API_URL()}/api/v1/despesas/${docId}/reprocessar`, {
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

  const handleExcluirDireto = async () => {
    if (!window.confirm("Deseja realmente excluir esta despesa desta competência mensal?\nEsta ação é recomendada caso o pagamento pertença a outro mês.")) {
      return;
    }
    setSalvando(true);
    setErro("");
    try {
      const res = await fetch(`${API_URL()}/api/v1/validacao/despesas/${docId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Erro ao excluir despesa.");
      }
      setShowToast("Despesa excluída com sucesso.");
      setTimeout(() => onSalvo(), 1200);
    } catch (err) {
      setErro(err.message);
      setSalvando(false);
    }
  };

  const handleConsultarOriginal = async () => {
    const rawChave = form.chave_acesso || doc?.chave_acesso || "";
    const chave = rawChave.replace(/\D/g, "");

    if (chave) {
      try {
        await navigator.clipboard.writeText(chave);
        setShowToast("Chave copiada! Cole no portal da Fazenda.");
        setTimeout(() => setShowToast(""), 3000);
      } catch (err) {
        console.error("Erro ao copiar chave de acesso:", err);
      }
    } else {
      setShowToast("Despesa sem chave de acesso informada.");
      setTimeout(() => setShowToast(""), 3000);
    }

    window.open(
      "https://consultadfe.fazenda.rj.gov.br/consultaDFe/paginas/consultaChaveAcesso.faces",
      "_blank",
      "noopener,noreferrer"
    );
  };

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <Loader2 size={28} className="spin" />
    </div>
  );

  if (!doc) return (
    <div className="feedback feedback--error">
      <AlertTriangle size={15} /><span>{erro || "Despesa não encontrado."}</span>
    </div>
  );

  const campo = (label, key, type = "text", placeholder = "Não identificado") => {
    const val = form[key] ?? "";
    const isMissing = val === null || val === "";
    const isDataPgto = key === "data_pagamento";
    const cleanVal = val && typeof val === "string" && val.includes("T") ? val.split("T")[0] : val;
    const isOutOfRange = Boolean(
      isDataPgto && cleanVal && limitesCompetencia.minDate && limitesCompetencia.maxDate && (cleanVal < limitesCompetencia.minDate || cleanVal > limitesCompetencia.maxDate)
    );

    return (
      <div className="field">
        <span className="field__label">{label}</span>
        {key === "competencia" ? (
          <MaskedCompInput
            value={val}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder="MM/YYYY"
            style={{ textAlign: "center" }}
            className="input"
          />
        ) : type === "date" ? (
          <MaskedDateInput
            value={val}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder="DD/MM/YYYY"
            min={isDataPgto ? limitesCompetencia.minDate : undefined}
            max={isDataPgto ? limitesCompetencia.maxDate : undefined}
            style={{ textAlign: "center" }}
            className="input"
          />
        ) : type === "number" || key === "valor_total" ? (
          <MaskedCurrencyInput
            value={val}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
            placeholder="0,00"
            style={{ textAlign: "center" }}
            className="input"
          />
        ) : (
          <input
            type="text"
            className={`input ${isMissing ? "input--missing" : ""}`.trim()}
            placeholder={placeholder}
            style={{ textAlign: "center" }}
            value={val}
            onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          />
        )}
        {isOutOfRange && (
          <span style={{ color: "#ef4444", fontSize: "11px", marginTop: "2px", display: "block", textAlign: "center" }}>
            Fora do mês ({mesAnoSelecionado})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="page" style={{ maxWidth: 960 }}>
      {sugestao && (
        <ModalConciliacaoImediata
          transacao={sugestao}
          docId={docId}
          salvando={salvando}
          valorDoc={form.valor_total}
          onConfirm={handleConfirmarConciliacao}
          onValidarDepois={(e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            setSugestao(null);
            const fonteFinal = form.conta_devedora_id || sugestao.fonte_pagadora_id;
            if (!fonteFinal) {
              setErro("A fonte pagadora (Conta Crédito) é obrigatória para validação.");
              setSalvando(false);
              return;
            }
            handleAcao("confirmar", fonteFinal);
          }}
          onCancel={(e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            setSugestao(null);
          }}
        />
      )}
      {showToast && (
        <div style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 300,
          background: "var(--ink)", color: "var(--paper)", padding: "12px 20px",
          borderRadius: 8, boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          display: "flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500
        }}>
          <CheckCircle2 size={16} style={{ color: "var(--ledger)" }} />
          {showToast}
        </div>
      )}
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
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 16 }}>
          {revisaoIds && (
            <label style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", fontSize: 13, fontWeight: 600, color: "var(--slate)" }}>
              <input type="checkbox" checked={revisaoIds.includes(docId)} onChange={(e) => toggleRevisao(docId, e.target.checked)} />
              Marcar Revisão
            </label>
          )}
          {statusBadge(doc.status)}
        </div>
      </div>

      {/* Split screen */}
      <div className="split-screen">

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
                    alt="Despesa fiscal"
                    style={{ width: "100%", display: "block", maxHeight: 520, objectFit: "contain",
                             background: "#eef1ef", cursor: "zoom-in" }}
                    onClick={() => setZoom(true)}
                  />
                );
              })()}
              <div style={{ position: "absolute", bottom: 15, left: "50%", transform: "translateX(-50%)", display: "flex", gap: 8 }}>
                <button
                  onClick={handleConsultarOriginal}
                  disabled={scanning}
                  title="Consultar original na Sefaz"
                  style={{
                    background: "rgba(255,255,255,0.9)", border: "1px solid #dde1e0",
                    borderRadius: 8, padding: "6px 10px", cursor: scanning ? "not-allowed" : "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, fontWeight: 500, color: scanning ? "#a0aec0" : "#4b5567",
                  }}
                >
                  {scanning ? <Loader2 size={14} className="spin" /> : <span>🧾</span>} Consultar Original
                </button>
                <button
                  onClick={() => setZoom(true)}
                  title="Ampliar despesa"
                  style={{
                    background: "rgba(255,255,255,0.9)", border: "1px solid #dde1e0",
                    borderRadius: 8, padding: "6px 10px", cursor: "pointer",
                    display: "flex", alignItems: "center", gap: 5,
                    fontSize: 12, fontWeight: 500, color: "#4b5567",
                  }}
                >
                  <span>🔍</span> Ampliar
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
            {campo("Fornecedor",        "fornecedor",      "text",   "Não identificado")}
            {campo("CNPJ/CPF",          "cnpj_cpf",        "text",   "Não identificado")}
            {campo("Nº do despesa",   "numero_doc",      "text",   "Não identificado")}
            {campo("Competência",       "competencia",     "text",   "MM/YYYY")}
            {campo("Valor total (R$)",  "valor_total",     "number", "Não identificado")}
            {campo("Data de emissão",   "data_emissao",    "date",   "Não identificado")}
            {campo("Data de vencimento","data_vencimento", "date",   "Não identificado")}
            {doc.data_pagamento !== undefined && campo("Data de pagamento","data_pagamento","date", "Não identificado")}
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <span className="field__label">Descrição</span>
            <textarea
              className={`input textarea ${!form.descricao ? "input--missing" : ""}`.trim()}
              rows={2}
              placeholder="Não identificado"
              style={{ textAlign: "center" }}
              value={form.descricao ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, descricao: e.target.value }))}
            />
            {(() => {
              const descLen = (form.descricao ?? "").length;
              const isOverLimit = descLen > 80;
              return (
                <div style={{
                  textAlign: "right",
                  fontSize: 12,
                  marginTop: 4,
                  color: isOverLimit ? "#dc2626" : "var(--slate)",
                  fontWeight: isOverLimit ? 600 : 400
                }}>
                  {descLen}/80
                </div>
              );
            })()}
          </div>

          <div className="field" style={{ marginBottom: 16 }}>
            <span className="field__label">Conta de Despesa (Débito)</span>
            <select
              className="input left-align-select"
              style={{ width: "100%", maxWidth: "100%", textOverflow: "ellipsis" }}
              value={form.conta_codigo ?? ""}
              onChange={(e) => handleContaChange(e.target.value)}
            >
              <option value="">Selecione uma conta...</option>
              {planoContas.length > 0 && planoContas.some(c => c.similarity !== null && c.similarity !== undefined) ? (
                <>
                  <optgroup label="Mais Prováveis">
                    {planoContas.slice(0, 5).map(conta => (
                      <option key={`prov-${conta.id}`} value={conta.id}>
                        {conta.codigo_contabil} - {conta.descricao} {conta.similarity ? `(${(conta.similarity * 100).toFixed(1)}%)` : ''}
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Outras Contas">
                    {planoContas.slice(5).map(conta => (
                      <option key={`outras-${conta.id}`} value={conta.id}>
                        {conta.codigo_contabil} - {conta.descricao}
                      </option>
                    ))}
                  </optgroup>
                </>
              ) : (
                planoContas.map(conta => (
                  <option key={`normal-${conta.id}`} value={conta.id}>
                    {conta.codigo_contabil} - {conta.descricao}
                  </option>
                ))
              )}
            </select>
          </div>

          {/* Campo de Fonte Pagadora SEMPRE visível */}
          <div className="field" style={{ marginBottom: 16 }}>
            <span className="field__label">Fonte Pagadora (Crédito)</span>
            <select
              className="input left-align-select"
              style={{
                borderColor: alertaSemConciliacao ? "#ef4444" : "var(--line)",
                width: "100%",
                maxWidth: "100%",
                textOverflow: "ellipsis"
              }}
              value={form.conta_devedora_id ?? ""}
              onChange={(e) => {
                setForm((f) => ({ ...f, conta_devedora_id: e.target.value }));
                setAlertaSemConciliacao(false);
                if (erro) setErro("");
              }}
            >
              <option value="">Selecione a conta que originou o pagamento...</option>
              {contasBancarias
                .filter(conta => {
                  const contaLateralId = selectedFonteId || fonteCorrenteId;
                  const isContaLateral = conta.id === contaLateralId;
                  const naoExigeExtrato = conta.exige_conciliacao_extrato === false || conta.exige_conciliacao_extrato === "false";
                  const isSalvaNaDespesa = conta.id === doc?.fonte_pagadora_id;
                  return isContaLateral || naoExigeExtrato || isSalvaNaDespesa;
                })
                .map(conta => (
                <option key={conta.id} value={conta.id}>
                  {conta.nome} {conta.banco ? `- ${conta.banco}` : ''} {conta.conta ? `CC: ${conta.conta}` : ''}
                </option>
              ))}
            </select>
            {alertaSemConciliacao && (
              <span style={{ color: "#ef4444", fontSize: "12px", marginTop: "4px", display: "block" }}>
                Nenhuma transação correspondente encontrada no extrato atual para esta fonte.
              </span>
            )}
          </div>

          {erro && (
            <div className="feedback feedback--error" style={{ marginBottom: 12 }}>
              <AlertTriangle size={15} /><span>{erro}</span>
            </div>
          )}

          {/* Ações */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              className="btn-primary"
              disabled={salvando}
              onClick={() => handleAcao("confirmar")}
              style={{ flex: 1, minWidth: 140 }}
            >
              {salvando ? <Loader2 size={15} className="spin" /> : <CheckCircle2 size={15} />}
              Confirmar
            </button>
            <button
              disabled={salvando}
              onClick={() => handleAcao("salvar")}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                border: "1px solid var(--line)", background: "transparent",
                color: "var(--ink)", borderRadius: 9, padding: "11px 16px",
                fontWeight: 600, fontSize: 13.5, cursor: "pointer",
              }}
              title="Salvar alterações sem validar"
            >
              Salvar
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
                <RefreshCw size={15} /> Reprocessar
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
            <button
              onClick={handleExcluirDireto}
              disabled={salvando}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                border: "1px solid #ef4444", background: "transparent",
                color: "#ef4444", borderRadius: 9, padding: "11px 16px",
                fontWeight: 600, fontSize: 13.5, cursor: "pointer",
              }}
              title="Excluir despesa desta competência mensal"
            >
              <Trash2 size={15} /> Excluir Despesa
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
export default function ValidarDespesas() { const { currentCondo, mesAnoSelecionado } = useCondo();
  const [docs, setDocs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState("");
  const [filtro, setFiltro]     = useState("todos");
  const [sortConfig, setSortConfig] = useState({ key: "data_pagamento", direction: "asc" });
  const [docAberto, setDocAberto] = useState(null);

  const [revisaoIds, setRevisaoIds] = useState(() => {
    try {
      const stored = sessionStorage.getItem("revisaoIds");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    sessionStorage.setItem("revisaoIds", JSON.stringify(revisaoIds));
  }, [revisaoIds]);

  const toggleRevisao = useCallback((id, checked) => {
    setRevisaoIds(prev => checked ? [...prev, id] : prev.filter(x => x !== id));
  }, []);

  const isFetchingRef = useRef(false);

  const carregar = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true; if (!currentCondo || !mesAnoSelecionado) { setDocs([]); setLoading(false); isFetchingRef.current = false; return; }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch(`${API_URL()}/api/v1/validacao/despesas?status=todos&limit=100&condominio_id=${currentCondo.id}&mes_ano=${mesAnoSelecionado}`, {
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
        setErro("Não foi possível carregar os despesas.");
      }
    } finally {
      clearTimeout(timeoutId);
      isFetchingRef.current = false;
      setLoading(false);
    }
  }, [currentCondo, mesAnoSelecionado]);

  const handleExcluirDespesa = useCallback(async (e, docId) => {
    e.stopPropagation();
    if (!window.confirm("Tem certeza que deseja excluir permanentemente esta despesa e seus documentos?\nSe houver conciliação associada, ela também será desfeita.\n\nEsta ação NÃO pode ser desfeita.")) {
      return;
    }
    
    setLoading(true);
    try {
      const res = await fetch(`${API_URL()}/api/v1/validacao/despesas/${docId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "Erro ao excluir despesa.");
      }
      setRevisaoIds(prev => prev.filter(x => x !== docId));
      await carregar();
    } catch (err) {
      setErro(err.message);
      setLoading(false);
    }
  }, [carregar]);


  const handleAtualizarManual = useCallback(() => {
    if (isFetchingRef.current) return;
    setLoading(true);
    carregar();
  }, [carregar]);

  // Carga inicial
  useEffect(() => { 
    carregar(); 
  }, [carregar]);

  // Smart Polling Condicional e Page Visibility API (US-03, US-04)
  useEffect(() => {
    let intervalId = null;

    const verificarEAgendar = () => {
      if (intervalId) clearInterval(intervalId);

      const temProcessamentoPendente = docs.some(
        (d) => d.status === "pendente" || d.status === "extraindo"
      );

      // Se não há pendentes ou a aba está oculta, não agenda
      if (!temProcessamentoPendente || document.hidden) {
        return;
      }

      // Intervalo relaxado de 8 segundos
      intervalId = setInterval(() => {
        if (!document.hidden) {
          carregar();
        }
      }, 8000);
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        const temProcessamentoPendente = docs.some(
          (d) => d.status === "pendente" || d.status === "extraindo"
        );
        if (temProcessamentoPendente) {
          carregar(); // Recarga imediata ao reativar foco
        }
      }
      verificarEAgendar();
    };

    verificarEAgendar();
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [carregar, docs]);

  const total = docs.length;
  const emRevisaoCount = docs.filter(d => revisaoIds.includes(d.id)).length;
  const aguardando = docs.filter(d => d.status === "extraido" && !revisaoIds.includes(d.id)).length;
  const validados = docs.filter(d => d.status === "validado" && !revisaoIds.includes(d.id)).length;
  const conciliados = docs.filter(d => d.status === "conciliado" && !revisaoIds.includes(d.id)).length;
  const erros = docs.filter(d => d.status === "erro" && !revisaoIds.includes(d.id)).length;

  const docsFiltrados = [...docs].filter(d => {
    if (filtro === "todos") return true;
    if (filtro === "revisao") return revisaoIds.includes(d.id);
    if (revisaoIds.includes(d.id)) return false; // Hide reviewed items from other tabs
    return d.status === filtro;
  }).sort((a, b) => {
    const key = sortConfig.key;
    if (a[key] === null || a[key] === undefined) return 1;
    if (b[key] === null || b[key] === undefined) return -1;
    let valA = a[key];
    let valB = b[key];
    
    if (key === "valor_total") {
      valA = Number(valA);
      valB = Number(valB);
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  if (docAberto) {
    return (
      <DetalheDespesa
        docId={docAberto}
        onVoltar={() => { setDocAberto(null); carregar(); }}
        onSalvo={() => { 
          toggleRevisao(docAberto, false);
          setDocAberto(null); 
          carregar(); 
        }}
        revisaoIds={revisaoIds}
        toggleRevisao={toggleRevisao}
      />
    );
  }

  return (
    <div className="page" style={{ maxWidth: 900 }}>
      <div className="page__head" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span className="page__eyebrow">Contabilidade</span>
        <h1 className="page__title">Validar Despesas</h1>
        <p className="page__subtitle" style={{ margin: "0 auto" }}>
          Revise e confirme os dados extraídos automaticamente antes da conciliação.
        </p>
      </div>

      {/* Barra de Ações Superior / Atualizar Lista (US-04) */}
      <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", marginBottom: 12, width: "100%" }}>
        <button
          type="button"
          onClick={handleAtualizarManual}
          disabled={loading}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: "var(--paper-card, #ffffff)",
            border: "1px solid var(--line, #cbd5e1)",
            borderRadius: 8,
            padding: "8px 14px",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--ink, #1e293b)",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            transition: "all 0.2s ease"
          }}
          title="Atualizar lista de despesas"
        >
          {loading ? (
            <Loader2 size={15} className="spin" />
          ) : (
            <RefreshCw size={15} />
          )}
          <span>Atualizar Lista</span>
        </button>
      </div>

      {/* Filtros */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "nowrap", alignItems: "center", width: "100%", overflowX: "auto" }}>
        {[
          { label: "Todos", value: "todos", valor: total, bg: "var(--paper-card)", cor: "var(--ink)" },
          { label: "Aguardando", value: "extraido", valor: aguardando, bg: "#f5ead9", cor: "#b8875a" },
          { label: "Validados", value: "validado", valor: validados, bg: "#e4efe9", cor: "#21503e" },
          { label: "Conciliados", value: "conciliado", valor: conciliados, bg: "#e0f2fe", cor: "#0369a1" },
          { label: "Revisar", value: "revisao", valor: emRevisaoCount, bg: "#f1f5f9", cor: "#64748b" },
          { label: "Com erro", value: "erro", valor: erros, bg: "#f6e6e1", cor: "#b3452f" },
        ].map(item => (
          <div key={item.value} onClick={() => setFiltro(item.value)} style={{
            background: item.bg, borderRadius: 10, padding: "10px 12px",
            border: "1px solid var(--line)", flex: 1, minWidth: 0, cursor: "pointer",
            opacity: filtro === item.value ? 1 : 0.6,
            textAlign: "center"
          }}>
            <p style={{ margin: 0, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--slate)", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</p>
            <p style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700, color: item.cor, fontFamily: "IBM Plex Mono, monospace" }}>{item.valor}</p>
          </div>
        ))}

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
          Nenhum despesa {filtro === "extraido" ? "aguardando validação" : "encontrado"}.
        </div>
      )}

      {/* Tabela com scroll horizontal fluido mobile (US-03) */}
      {!loading && docsFiltrados.length > 0 && (
        <div className="slip" style={{ padding: 0, overflowX: "auto", overflowY: "hidden", WebkitOverflowScrolling: "touch" }}>
          <table style={{ width: "100%", minWidth: "750px", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--line)", background: "var(--paper)" }}>
                {[
                  { label: "Fornecedor", key: "fornecedor" },
                  { label: "Nº Doc", key: "numero_doc" },
                  { label: "Data Pagamento", key: "data_pagamento" },
                  { label: "Valor (R$)", key: "valor_total" },
                  { label: "Status", key: "status" }
                ].map((h) => (
                  <th key={h.key} 
                    onClick={() => handleSort(h.key)}
                    style={{
                      padding: "10px 14px", textAlign: "center",
                      fontSize: 10.5, textTransform: "uppercase",
                      letterSpacing: "0.06em", color: "var(--slate)",
                      fontWeight: 600, cursor: "pointer",
                      userSelect: "none"
                  }}>
                    {h.label} {sortConfig.key === h.key ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                  </th>
                ))}
                <th style={{ width: 44, padding: "10px 8px" }}></th>
              </tr>
            </thead>
            <tbody>
              {docsFiltrados.map((doc, i) => {
                const rowBgColor = {
                  pendente: "#ffffff",
                  extraindo: "#ffffff",
                  extraido: "#fff7ed",
                  validado: "#ecfdf5",
                  conciliado: "#f0f9ff",
                  erro: "#fef2f2",
                }[doc.status] || "#ffffff";

                return (
                  <tr
                    key={doc.id}
                    onClick={() => setDocAberto(doc.id)}
                    style={{
                      borderBottom: i < docsFiltrados.length - 1 ? "1px solid var(--line)" : "none",
                      cursor: "pointer",
                      background: rowBgColor,
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--paper)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = rowBgColor}
                  >
                    <td style={{ padding: "11px 14px", fontWeight: 500, color: "var(--ink)", textAlign: "center" }}>
                      {doc.fornecedor && doc.fornecedor !== "null" ? doc.fornecedor : <span style={{ color: "var(--slate)" }}>—</span>}
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--ink-soft)", textAlign: "center" }}>
                      {doc.numero_doc && doc.numero_doc !== "null" ? doc.numero_doc : "—"}
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--ink-soft)", textAlign: "center" }}>
                      {doc.data_pagamento && doc.data_pagamento !== "null"
                        ? (() => {
                            const raw = doc.data_pagamento.includes("T") ? doc.data_pagamento : doc.data_pagamento + "T00:00:00";
                            const dt = new Date(raw);
                            return isNaN(dt.getTime()) ? "—" : dt.toLocaleDateString("pt-BR");
                          })()
                        : "—"}
                    </td>
                    <td style={{ padding: "11px 14px", fontFamily: "IBM Plex Mono, monospace", fontSize: 12, color: "var(--ink)", textAlign: "center" }}>
                      {doc.valor_total != null ? formatBRL(doc.valor_total) : "—"}
                    </td>
                    <td style={{ padding: "11px 14px", textAlign: "center" }}>{statusBadge(doc.status)}</td>
                    <td style={{ padding: "11px 8px", textAlign: "center", width: 44 }}>
                      <button
                        type="button"
                        onClick={(e) => handleExcluirDespesa(e, doc.id)}
                        title="Excluir permanentemente"
                        style={{
                          background: "transparent",
                          border: "none",
                          cursor: "pointer",
                          color: "var(--slate)",
                          padding: "4px",
                          borderRadius: "4px",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.color = "#ef4444"}
                        onMouseLeave={(e) => e.currentTarget.style.color = "var(--slate)"}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}










