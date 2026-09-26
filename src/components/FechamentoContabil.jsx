import React, { useState, useEffect } from "react";
import { Download, AlertTriangle, Loader2 } from "./layout/icons";
import { useCondo } from "../context/CondoContext";

export default function FechamentoContabil() {
  const { currentAdm, currentCondo, mesAnoSelecionado } = useCondo();
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [erro, setErro] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (currentCondo && mesAnoSelecionado) {
      setLoading(true);
      setErro("");
      fetch(`${API_URL}/api/v1/validacao/documentos?status=validado`)
        .then(res => res.json())
        .then(data => {
          const docs = data.filter(d => 
            d.condominio_id === currentCondo.id && 
            d.competencia === mesAnoSelecionado && 
            d.plano_contas?.codigo
          );
          setDocumentos(docs);
        })
        .catch(err => {
          console.error(err);
          setErro("Falha ao carregar documentos.");
        })
        .finally(() => setLoading(false));
    } else {
      setDocumentos([]);
    }
  }, [currentCondo, mesAnoSelecionado, API_URL]);

  const handleExport = async () => {
    if (documentos.length === 0) return;
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
          Gere o lote .TXT Alterdata para o condomínio {currentCondo.nome} (Competência: {mesAnoSelecionado}).
        </p>
      </div>

      <div className="slip">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <div>
            <h3 className="section-title">Lançamentos Qualificados</h3>
            <p style={{ fontSize: "13px", color: "var(--slate)", margin: 0 }}>
              Exibindo apenas documentos validados com conta devedora informada.
            </p>
          </div>
          <button 
            className="btn-primary" 
            onClick={handleExport} 
            disabled={exporting || documentos.length === 0}
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
        ) : documentos.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", border: "1px dashed var(--line)", borderRadius: "8px" }}>
            <p style={{ color: "var(--slate)", margin: 0 }}>Não há lançamentos qualificados para exportação neste período.</p>
          </div>
        ) : (
          <table style={{ width: "100%", fontSize: "13px", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--paper)", borderBottom: "2px solid var(--line)", textAlign: "left" }}>
                <th style={{ padding: "10px" }}>Fornecedor</th>
                <th style={{ padding: "10px" }}>Data Pag.</th>
                <th style={{ padding: "10px" }}>Valor</th>
                <th style={{ padding: "10px" }}>C. Contábil</th>
                <th style={{ padding: "10px" }}>C. Devedora</th>
              </tr>
            </thead>
            <tbody>
              {documentos.map(d => (
                <tr key={d.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={{ padding: "10px" }}>{d.fornecedor}</td>
                  <td style={{ padding: "10px" }}>{d.data_pagamento?.substring(0,10) || d.data_emissao?.substring(0,10)}</td>
                  <td style={{ padding: "10px" }}>R$ {parseFloat(d.valor_total).toFixed(2)}</td>
                  <td style={{ padding: "10px" }}>{d.conta_codigo || "N/A"}</td>
                  <td style={{ padding: "10px" }}>{d.plano_contas?.codigo || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

