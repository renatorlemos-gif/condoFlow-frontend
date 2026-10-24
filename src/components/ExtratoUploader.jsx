import { useState, useRef, useCallback } from "react";
import { UploadCloud, FileCheck2, Loader2, AlertTriangle, CheckCircle2, X } from "./layout/icons";
import { bytesToSize } from "../utils/format";
import { useCondo } from "../context/CondoContext";

export default function ExtratoUploader({ onNavigate }) {
  const {
    selectedAdmId,
    selectedCondoId,
    currentAdm,
    currentCondo,
    selectedFonteId,
    currentFonte,
    fontesPagadoras,
    recarregarCompetencias,
  } = useCondo();

  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const hasFonte = Boolean(selectedFonteId && currentFonte);

  const resetFeedback = useCallback(() => {
    setStatus("idle");
    setErrorMsg("");
  }, []);

  const pickFile = useCallback((f) => {
    if (!f) return;
    setFile(f);
    resetFeedback();
  }, [resetFeedback]);

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
  }, [pickFile]);

  const handleUpload = async () => {
    if (!file) {
      setStatus("error");
      setErrorMsg("Selecione um arquivo de extrato antes de converter.");
      return;
    }
    if (!selectedFonteId || !currentFonte) {
      setStatus("error");
      setErrorMsg("Nenhuma conta bancária ativa selecionada.");
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("banco", currentFonte.banco);
    formData.append("administradora_id", selectedAdmId);
    formData.append("condominio_id", selectedCondoId);
    formData.append("condo_nome", currentCondo?.nome || "");
    formData.append("fonte_pagadora_id", selectedFonteId);

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
      <div
        className="page__head"
        style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}
      >
        <span className="page__eyebrow">Conciliação bancária</span>
        <h1 className="page__title">Processar Extratos</h1>
        <p className="page__subtitle" style={{ margin: "0 auto" }}>
          Envie o extrato do banco e receba a planilha consolidada, pronta para conferência com o
          livro caixa do condomínio.
        </p>
      </div>

      <div className="slip">
        {/* Banner de Contexto da Carteira e Fonte Bancária ou Alerta Defensivo */}
        {!hasFonte || fontesPagadoras.length === 0 ? (
          <div className="slip__warning-banner">
            <AlertTriangle size={20} style={{ color: "#d97706", flexShrink: 0, marginTop: "2px" }} />
            <div style={{ flex: 1 }}>
              <div className="slip__warning-title">Nenhuma Fonte Bancária Vinculada</div>
              <div className="slip__warning-desc">
                ⚠️ Nenhuma fonte pagadora bancária cadastrada para este condomínio. Cadastre ou habilite uma conta em Administração &gt; Cadastros Básicos para processar extratos.
              </div>
              {onNavigate && (
                <button
                  type="button"
                  className="btn-amber-link"
                  onClick={() => onNavigate("cadastros-basicos")}
                >
                  Configurar Contas em Cadastros Básicos &rarr;
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="slip__inherited-banner">
            <div className="slip__inherited-info">
              <span className="slip__inherited-label">
                Carteira Ativa: {currentAdm?.nome || "Administradora"} &rarr; <strong>{currentCondo?.nome || "Condomínio"}</strong>
              </span>
              <span className="slip__inherited-val">
                <span>🏦</span> {currentFonte.banco} ({currentFonte.agencia} | {currentFonte.conta})
              </span>
              <span className="slip__inherited-sub">
                Fonte pagadora vinculada automaticamente via menu lateral
              </span>
            </div>
            <span className="slip__inherited-badge">
              {currentFonte.tipo || "Conta Corrente"}
            </span>
          </div>
        )}

        {/* Dropzone de upload */}
        <label
          className={`dropzone ${dragActive ? "dropzone--active" : ""} ${file ? "dropzone--filled" : ""} ${
            !hasFonte ? "dropzone--disabled" : ""
          }`}
          onDragOver={(e) => {
            if (hasFonte) handleDrag(e, true);
          }}
          onDragEnter={(e) => {
            if (hasFonte) handleDrag(e, true);
          }}
          onDragLeave={(e) => {
            if (hasFonte) handleDrag(e, false);
          }}
          onDrop={(e) => {
            if (hasFonte) handleDrop(e);
          }}
          style={!hasFonte ? { opacity: 0.5, cursor: "not-allowed", pointerEvents: "none" } : {}}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".ofx,.csv,.pdf,.xls,.xlsx,.txt"
            className="dropzone__input"
            onChange={(e) => pickFile(e.target.files?.[0])}
            disabled={!hasFonte}
          />

          {!file ? (
            <div className="dropzone__empty">
              <span className="dropzone__icon">
                <UploadCloud size={22} strokeWidth={1.8} />
              </span>
              <span className="dropzone__title">
                {!hasFonte ? "Envio de extrato desabilitado" : "Arraste o extrato aqui"}
              </span>
              <span className="dropzone__hint">
                {!hasFonte
                  ? "Cadastre uma conta corrente para liberar o upload"
                  : "ou clique para procurar no computador (OFX, CSV, PDF, XLS, TXT)"}
              </span>
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
            disabled={!file || status === "loading" || !hasFonte}
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
