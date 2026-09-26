import React, { useState, useEffect, useRef, useCallback } from "react";
import { UploadCloud, FileCheck2, Loader2, AlertTriangle, CheckCircle2, X } from "./layout/icons";
import { bytesToSize } from "../utils/format";
import { useCondo } from "../context/CondoContext";

export default function ExtratoUploader() {
  const { selectedAdmId, selectedCondoId, currentAdm, currentCondo, recarregarCompetencias } = useCondo();
  const [file, setFile] = useState(null);
  const [contasBancarias, setContasBancarias] = useState([]);
  const [contaSelecionada, setContaSelecionada] = useState("");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  useEffect(() => {
    if (selectedCondoId) {
      fetch(`${API_URL}/api/v1/cadastros/contas-bancarias?condominio_id=${selectedCondoId}&ativo=true`)
        .then(res => res.json())
        .then(data => {
          setContasBancarias(data || []);
          if (data && data.length > 0) {
            setContaSelecionada(data[0].id);
          } else {
            setContaSelecionada("");
          }
        })
        .catch(err => console.error(err));
    }
  }, [selectedCondoId, API_URL]);

  const resetFeedback = () => {
    setStatus("idle");
    setErrorMsg("");
  };

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    resetFeedback();
  };

  const handleDrag = useCallback((e, active) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(active);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }, []);

  const handleUpload = async () => {
    if (!file) {
      setStatus("error");
      setErrorMsg("Selecione um arquivo de extrato antes de converter.");
      return;
    }
    if (!contaSelecionada) {
      setStatus("error");
      setErrorMsg("Nenhuma conta bancária selecionada.");
      return;
    }

    const contaInfo = contasBancarias.find(c => c.id === contaSelecionada);
    if (!contaInfo) return;

    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("banco", contaInfo.banco);
    formData.append("administradora_id", selectedAdmId);
    formData.append("condominio_id", selectedCondoId);
    formData.append("condo_nome", currentCondo.nome);
    formData.append("conta_bancaria_id", contaSelecionada);

    try {
      const response = await fetch(`${API_URL}/api/processar-extrato`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao processar o extrato no servidor.");

      const disposition = response.headers.get("Content-Disposition") || "";
      const match = disposition.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i);
      const filename = match ? decodeURIComponent(match[1]) : "extrato_consolidado.xlsx";

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setStatus("success");
      
      if (recarregarCompetencias && selectedCondoId) {
        recarregarCompetencias(selectedCondoId);
      }
    } catch (error) {
      setStatus("error");
      setErrorMsg(error.message || "Não foi possível processar o extrato.");
    }
  };

  return (
    <div className="page">
      <div className="page__head" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span className="page__eyebrow">Conciliação bancária</span>
        <h1 className="page__title">Processar Extratos</h1>
        <p className="page__subtitle" style={{ margin: "0 auto" }}>
          Envie o extrato do banco e receba a planilha consolidada, pronta para conferência com o
          livro caixa do condomínio.
        </p>
      </div>

      <div className="slip">
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          padding: "10px 14px",
          background: "var(--paper)",
          border: "1px solid var(--line)",
          borderRadius: "8px",
          marginBottom: "16px",
          fontSize: "12.5px"
        }}>
          <span><strong>Carteira Ativa:</strong> {currentAdm?.nome} &rarr; <strong>{currentCondo?.nome}</strong></span>
        </div>

        <div className="slip__row">
          <div className="field">
            <span className="field__label">Conta Bancária do Condomínio</span>
            <select
              className="input"
              value={contaSelecionada}
              onChange={(e) => {
                setContaSelecionada(e.target.value);
                resetFeedback();
              }}
              style={{ padding: "8px", borderRadius: "8px", border: "1px solid var(--line)", width: "100%", background: "#fff" }}
            >
              {contasBancarias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.banco} - Ag: {c.agencia} CC: {c.conta}
                </option>
              ))}
              {contasBancarias.length === 0 && <option value="">Nenhuma conta cadastrada</option>}
            </select>
            {contasBancarias.length === 0 && (
              <p style={{ fontSize: "11px", color: "var(--red)", marginTop: "4px" }}>
                Cadastre as contas bancárias em "Cadastros Básicos" para este condomínio.
              </p>
            )}
          </div>
          
          <div className="field">
            <span className="field__label">Nº do lote</span>
            <span className="field__mono">CF-{new Date().getFullYear()}-AUTO</span>
          </div>
        </div>

        <label
          className={`dropzone ${dragActive ? "dropzone--active" : ""} ${file ? "dropzone--filled" : ""}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".ofx,.csv,.pdf,.xls,.xlsx,.txt"
            className="dropzone__input"
            onChange={(e) => pickFile(e.target.files?.[0])}
          />

          {!file ? (
            <div className="dropzone__empty">
              <span className="dropzone__icon">
                <UploadCloud size={22} strokeWidth={1.8} />
              </span>
              <span className="dropzone__title">Arraste o extrato aqui</span>
              <span className="dropzone__hint">ou clique para procurar no computador</span>
            </div>
          ) : (
            <div className="dropzone__file">
              <span className="dropzone__fileicon">
                <FileCheck2 size={20} strokeWidth={2} />
              </span>
              <span className="dropzone__filemeta">
                <span className="dropzone__filename">{file.name}</span>
                <span className="dropzone__filesize">{bytesToSize(file.size)}</span>
              </span>
              <button
                type="button"
                className="dropzone__remove"
                onClick={(e) => {
                  e.preventDefault();
                  setFile(null);
                  if (inputRef.current) inputRef.current.value = "";
                  resetFeedback();
                }}
                aria-label="Remover arquivo"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          )}
        </label>

        {status === "error" && (
          <div className="feedback feedback--error" style={{ marginTop: 12 }}>
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "success" && (
          <div className="feedback feedback--success" style={{ marginTop: 12 }}>
            <CheckCircle2 size={15} />
            <span>Extrato processado e consolidado com sucesso!</span>
          </div>
        )}

        <div className="perf" aria-hidden="true" style={{ marginTop: 16 }}>
          <span className="perf__notch perf__notch--left" />
          <span className="perf__line" />
          <span className="perf__notch perf__notch--right" />
        </div>

        <div className="slip__actions">
          <button
            type="button"
            className="btn-primary w-full"
            disabled={!file || status === "loading" || contasBancarias.length === 0}
            onClick={handleUpload}
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="spin" /> Processando...
              </>
            ) : (
              "Processar Extrato"
            )}
          </button>
        </div>
      </div>
      <p className="page__footnote">
        Nenhum arquivo é sobrescrito. O extrato original e a planilha gerada
        ficarão salvos no repositório do condomínio.
      </p>
    </div>
  );
}
