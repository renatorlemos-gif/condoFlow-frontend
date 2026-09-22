import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  FileCheck2,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "./layout/icons";
import { bytesToSize } from "../utils/format";
import { useCondo } from "../context/CondoContext";

const BANCOS = [
  { id: "bradesco", label: "Bradesco" },
  { id: "santander", label: "Santander" },
  { id: "itau", label: "Itaú" },
];

export default function ExtratoUploader() {
  const { selectedAdmId, selectedCondoId, currentAdm, currentCondo, recarregarCompetencias } = useCondo();
  const [file, setFile] = useState(null);
  const [banco, setBanco] = useState("bradesco");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const inputRef = useRef(null);

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

    setStatus("loading");
    setErrorMsg("");

    // O arquivo é enviado exatamente como foi selecionado — o front
    // não renomeia nada no envio.
    const formData = new FormData();
    formData.append("file", file);
    formData.append("banco", banco);
    formData.append("administradora_id", selectedAdmId);
    formData.append("condominio_id", selectedCondoId);
    formData.append("condo_nome", currentCondo.nome);

    // Em desenvolvimento, caminho relativo passa pelo proxy do Vite
    // (vite.config.js) até http://localhost:8000 — mesmo backend usado
    // pelo Escanear Documentos. Em produção (Vercel), não existe proxy do
    // Vite, então é obrigatório definir VITE_API_URL apontando para o
    // backend publicado.
    const API_URL = import.meta.env.VITE_API_URL || "";

    try {
      const response = await fetch(`${API_URL}/api/processar-extrato`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Erro ao processar o extrato no servidor.");

      // O nome do arquivo baixado é o que o back retornar no header
      // Content-Disposition. O front não define nem altera esse nome.
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

      setLastResult({
        name: filename,
        banco,
        when: new Date().toLocaleString("pt-BR"),
      });
      setStatus("success");
      
      // Atualiza contexto global de competências após upload
      if (recarregarCompetencias && selectedCondoId) {
        recarregarCompetencias(selectedCondoId);
      }
    } catch (error) {
      setStatus("error");
      setErrorMsg(error.message || "Não foi possível processar o extrato.");
    }
  };

  const bancoLabel = BANCOS.find((b) => b.id === banco)?.label ?? banco;

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
            <span className="field__label">Banco de origem</span>
            <div className="segmented" role="tablist" aria-label="Banco">
              {BANCOS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  role="tab"
                  aria-selected={banco === b.id}
                  className={`segmented__item ${banco === b.id ? "segmented__item--active" : ""}`}
                  onClick={() => {
                    setBanco(b.id);
                    resetFeedback();
                  }}
                >
                  {b.label}
                </button>
              ))}
            </div>
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
                <X size={15} />
              </button>
            </div>
          )}
        </label>

        <div className="perf" aria-hidden="true">
          <span className="perf__notch perf__notch--left" />
          <span className="perf__line" />
          <span className="perf__notch perf__notch--right" />
        </div>

        <div className="slip__actions">
          <button
            type="button"
            onClick={handleUpload}
            disabled={status === "loading"}
            className="btn-primary"
          >
            {status === "loading" ? (
              <>
                <Loader2 size={16} className="spin" />
                Processando extrato…
              </>
            ) : (
              <>Converter e baixar planilha</>
            )}
          </button>

          {status === "success" && (
            <span className="stamp">
              <CheckCircle2 size={13} strokeWidth={2.5} />
              Processado
            </span>
          )}
        </div>

        {status === "error" && (
          <div className="feedback feedback--error">
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {status === "success" && lastResult && (
          <div className="feedback feedback--success">
            <CheckCircle2 size={15} />
            <span>
              <strong>{lastResult.name}</strong> gerado às {lastResult.when} · banco {bancoLabel}.
              O download começou automaticamente.
            </span>
          </div>
        )}
      </div>

      <p className="page__footnote">
        Formatos aceitos: OFX, CSV, PDF ou planilha do extrato. O arquivo é enviado apenas para
        processamento e não fica armazenado neste painel.
      </p>
    </div>
  );
}
