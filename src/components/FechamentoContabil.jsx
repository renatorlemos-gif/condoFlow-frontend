import React, { useState, useEffect } from "react";
import { Download, AlertTriangle, Loader2 } from "./layout/icons";
import { useCondo } from "../context/CondoContext";

export default function FechamentoContabil() {
  const { currentAdm, currentCondo, mesAnoSelecionado } = useCondo();
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [erro, setErro] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: "data_pagamento", direction: "asc" });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (currentCondo && mesAnoSelecionado) {
      setLoading(true);
      setErro("");
      fetch(`${API_URL}/api/v1/validacao/despesas?status=validado,conciliado&limit=1000&condominio_id=${currentCondo.id}&mes_ano=${mesAnoSelecionado}`)
        .then(res => res.json())
        .then(data => {
          const docs = data.filter(d => {
            const dt = d.data_pagamento || d.data_emissao;
            let refMes = null;
            if (dt) {
              refMes = dt.substring(0, 7); // Ex: "2026-08"
            }
            return d.condominio_id === currentCondo.id && 
                   refMes === mesAnoSelecionado;
          });
          setDespesas(docs);
        })
        .catch(err => {
          console.error(err);
          setErro("Falha ao carregar despesas.");
        })
        .finally(() => setLoading(false));
    } else {
      setDespesas([]);
    }
  }, [currentCondo, mesAnoSelecionado, API_URL]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc"
    }));
  };

  const despesasOrdenadas = [...despesas].sort((a, b) => {
    const key = sortConfig.key;
    let valA = a[key] || (key === 'data_pagamento' ? a['data_emissao'] : '');
    let valB = b[key] || (key === 'data_pagamento' ? b['data_emissao'] : '');
    
    if (key === "valor_total") {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    } else if (key === "conta_devedora_codigo" || key === "conta_credora_codigo") {
      valA = String(valA || (key === 'conta_credora_codigo' ? (a.conta_credora_descricao || '').split(' - ')[0] : ''));
      valB = String(valB || (key === 'conta_credora_codigo' ? (b.conta_credora_descricao || '').split(' - ')[0] : ''));
      return sortConfig.direction === "asc"
        ? valA.localeCompare(valB, undefined, { numeric: true, sensitivity: "base" })
        : valB.localeCompare(valA, undefined, { numeric: true, sensitivity: "base" });
    } else {
      valA = String(valA).toLowerCase();
      valB = String(valB).toLowerCase();
    }

    if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
    if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleExport = async () => {
    if (despesas.length === 0) return;
    setExporting(true);
    setErro("");
    try {
      const resp = await fetch(`${API_URL}/api/v1/exportacao/lote-us42?condominio_id=${currentCondo.id}&competencia=${mesAnoSelecionado}`);
      if (!resp.ok) {
        const d = await resp.json();
        setErro(d.detail || "Erro ao exportar lote.");
        setExporting(false);
        return;
      }
      const disposition = resp.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);

      let fallbackName = "lote_alterdata.txt";
      if (currentCondo && mesAnoSelecionado) {
        const slugify = (text) => {
          if (!text) return "";
          return text
            .toString()
            .toLowerCase()
            .trim()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
        };
        const slugAdm = slugify(currentAdm?.nome) || "administradora";
        const slugCondo = slugify(currentCondo?.nome) || slugify(currentCondo?.id) || "condominio";

        let mesAno = mesAnoSelecionado.trim().replace("/", "-");
        const parts = mesAno.split("-");
        if (parts.length === 2) {
          if (parts[0].length === 4) {
            mesAno = `${parts[1].padStart(2, "0")}-${parts[0]}`;
          } else if (parts[1].length === 4) {
            mesAno = `${parts[0].padStart(2, "0")}-${parts[1]}`;
          }
        }
        fallbackName = `${slugAdm}_${slugCondo}_${mesAno}.txt`;
      }

      const filename = match ? decodeURIComponent(match[1]) : fallbackName;

      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setErro("Erro de comunicação ao exportar lote.");
    } finally {
      setExporting(false);
    }
  };

  if (!currentCondo || !mesAnoSelecionado) {
    return (
      <div className="page" style={{ maxWidth: 1100 }}>
         <div className="slip" style={{ textAlign: "center", padding: "64px 20px", color: "var(--slate)" }}>
          <AlertTriangle size={48} style={{ margin: "0 auto 16px", color: "var(--line)" }} strokeWidth={1} />
          <h3 style={{ fontSize: 18, color: "var(--ink)", margin: "0 0 8px" }}>Selecione um condomínio e competência.</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: 1100 }}>
      <div className="page__head" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span className="page__eyebrow">Fechamento Mensal</span>
        <h1 className="page__title">Fechamento Contábil</h1>
        <p className="page__subtitle" style={{ margin: "0 auto" }}>
          Gere o lote .TXT Alterdata para o condomínio {currentCondo.nome} (Período: {mesAnoSelecionado}).
        </p>
      </div>

      <div className="slip">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 className="section-title">Lançamentos Qualificados</h3>
            <p style={{ fontSize: "13px", color: "var(--slate)", margin: 0 }}>
              Exibindo apenas despesas validados/conciliados com conta de despesa informada.
            </p>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleExport} 
            disabled={exporting || despesas.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: "13px", height: "auto", minHeight: "36px", flex: "none" }}
          >
            {exporting ? <Loader2 size={16} className="spin" /> : <Download size={16} />}
            Gerar Lote Alterdata
          </button>
        </div>

        {erro && (
          <div className="feedback feedback--error" style={{ marginBottom: "16px" }}>
            <AlertTriangle size={15} /><span>{erro}</span>
          </div>
        )}

        {loading ? (
          <div style={{ padding: "40px", textAlign: "center" }}><Loader2 size={24} className="spin" /></div>
        ) : despesas.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--line)", borderRadius: "8px" }}>
            <p style={{ color: "var(--slate)", margin: 0 }}>Não há lançamentos qualificados para exportação neste período.</p>
          </div>
        ) : (
          <div style={{ overflowX: "auto", width: "100%", minWidth: 0 }}>
            <table style={{ width: "100%", minWidth: 700, fontSize: "13px", borderCollapse: "collapse", tableLayout: "fixed" }}>
              <thead>
                <tr style={{ background: "var(--paper)", borderBottom: "2px solid var(--line)", textAlign: "center" }}>
                  {[
                    { label: "DT.PAGTO", key: "data_pagamento", width: "15%" },
                    { label: "FORNECEDOR", key: "fornecedor", width: "23%" },
                    { label: "VALOR", key: "valor_total", width: "14%" },
                    { label: "FONTE", key: "conta_credora_codigo", width: "24%" },
                    { label: "CONTA", key: "conta_devedora_codigo", width: "24%" }
                  ].map((h) => (
                    <th key={h.key} 
                      onClick={() => handleSort(h.key)}
                      style={{
                        width: h.width,
                        padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap",
                        fontSize: "10.5px", textTransform: "uppercase",
                        letterSpacing: "0.06em", color: "var(--slate)",
                        fontWeight: 600, cursor: "pointer", userSelect: "none"
                    }}>
                      {h.label} {sortConfig.key === h.key ? (sortConfig.direction === "asc" ? "↑" : "↓") : ""}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {despesasOrdenadas.map(d => {
                  const fontePartes = (d.conta_credora_descricao || "").split(" - ");
                  const codFonte = d.conta_credora_codigo || fontePartes[0] || "";
                  const descFonte = d.conta_credora_nome || (fontePartes.length > 1 ? fontePartes.slice(1).join(" - ") : "");

                  return (
                    <tr key={d.id} style={{ borderBottom: "1px solid var(--line)" }}>
                      <td style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap" }}>
                        {d.data_pagamento?.substring(0,10) || d.data_emissao?.substring(0,10) || "—"}
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center", fontSize: 12, wordBreak: "break-word" }} title={d.fornecedor}>
                        {(!d.conta_credora_descricao || !d.conta_devedora_codigo) && (
                          <span title="Incompleto: Falta conta de despesa ou fonte pagadora" style={{ color: "var(--red)", marginRight: "6px", verticalAlign: "middle" }}>
                            <AlertTriangle size={14} />
                          </span>
                        )}
                        <span style={{ verticalAlign: "middle" }}>{d.fornecedor || "—"}</span>
                      </td>
                      <td style={{ padding: "10px 8px", textAlign: "center", whiteSpace: "nowrap", fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>
                        R$ {parseFloat(d.valor_total).toFixed(2)}
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, maxWidth: "100%" }}>
                          <span style={{ fontWeight: 600, color: "var(--ink)", fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>
                            {codFonte || "—"}
                          </span>
                          {descFonte && (
                            <span style={{ fontSize: 11, color: "var(--slate)", wordBreak: "break-word", lineHeight: 1.25 }}>
                              {descFonte}
                            </span>
                          )}
                        </div>
                      </td>
                      <td style={{ padding: "8px 8px", textAlign: "center" }}>
                        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 2, maxWidth: "100%" }}>
                          <span style={{ fontWeight: 600, color: "var(--ink)", fontFamily: "IBM Plex Mono, monospace", fontSize: 12 }}>
                            {d.conta_devedora_codigo || "—"}
                          </span>
                          {d.conta_devedora_descricao && (
                            <span style={{ fontSize: 11, color: "var(--slate)", wordBreak: "break-word", lineHeight: 1.25 }}>
                              {d.conta_devedora_descricao}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

