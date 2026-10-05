import React, { useState, useEffect } from "react";
import { Download, AlertTriangle, Loader2 } from "./layout/icons";
import { useCondo } from "../context/CondoContext";

export default function FechamentoContabil() {
  const { currentAdm, currentCondo, mesAnoSelecionado } = useCondo();
  const [despesas, setDespesas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [erro, setErro] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (currentCondo && mesAnoSelecionado) {
      setLoading(true);
      setErro("");
      fetch(`${API_URL}/api/v1/validacao/despesas?status=validado,conciliado`)
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
      const blob = await resp.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `lote_alterdata_${mesAnoSelecionado}.txt`;
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
            style={{ display: "flex", alignItems: "center", gap: 8 }}
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
            <table style={{ width: "100%", minWidth: 700, fontSize: "13px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--paper)", borderBottom: "2px solid var(--line)", textAlign: "center" }}>
                  <th style={{ padding: "10px", textAlign: "center" }}>Fornecedor</th>
                  <th style={{ padding: "10px", textAlign: "center", whiteSpace: "nowrap" }}>Data Pag.</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Valor</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Fonte Pagadora</th>
                  <th style={{ padding: "10px", textAlign: "center" }}>Conta de Despesa</th>
                </tr>
              </thead>
              <tbody>
                {despesas.map(d => (
                  <tr key={d.id} style={{ borderBottom: "1px solid var(--line)" }}>
                    <td style={{ padding: "10px", textAlign: "center",  }} title={d.fornecedor}>
                      {(!d.conta_credora_descricao || !d.conta_devedora_codigo) && (
                        <span title="Incompleto: Falta conta de despesa ou fonte pagadora" style={{ color: "var(--red)", marginRight: "6px", verticalAlign: "middle" }}>
                          <AlertTriangle size={14} />
                        </span>
                      )}
                      <span style={{ verticalAlign: "middle" }}>{d.fornecedor}</span>
                    </td>
                    <td style={{ padding: "10px", textAlign: "center" }}>{d.data_pagamento?.substring(0,10) || d.data_emissao?.substring(0,10)}</td>
                    <td style={{ padding: "10px", textAlign: "center", whiteSpace: "nowrap" }}>R$ {parseFloat(d.valor_total).toFixed(2)}</td>
                    <td style={{ padding: "10px", textAlign: "center",  }} title={d.conta_credora_descricao || "N/A"}>
                      {d.conta_credora_descricao || "N/A"}
                    </td>
                    <td style={{ padding: "10px", textAlign: "center",  }} title={d.conta_devedora_codigo ? `${d.conta_devedora_codigo} - ${d.conta_devedora_descricao || ""}` : "N/A"}>
                      {d.conta_devedora_codigo ? `${d.conta_devedora_codigo} - ${d.conta_devedora_descricao || ""}` : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

