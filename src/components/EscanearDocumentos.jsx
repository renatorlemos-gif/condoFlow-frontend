import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  FileCheck2,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
} from "./layout/icons";
import { bytesToSize, formatBRL } from "../utils/format";

export function EscanearDocumentos() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);

  const pickFile = (f) => {
    if (!f) return;
    setFile(f);
    setResultado(null);
    setErro(null);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      pickFile(e.target.files[0]);
    }
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

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setErro(null);

    const formData = new FormData();
    formData.append("file", file);

    try {
      // Em desenvolvimento, caminho relativo passa pelo proxy do Vite
      // (vite.config.js) até http://localhost:8000. Em produção (Vercel),
      // não existe esse proxy, então VITE_API_URL precisa apontar para o
      // backend publicado — mesma variável usada em ExtratoUploader.jsx.
      const API_URL = import.meta.env.VITE_API_URL || "";
      const response = await fetch(
        `${API_URL}/api/v1/documentos/escanear?condominio_id=cond_teste&db_context=db_teste`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error("Erro ao processar o documento no servidor.");
      }

      const data = await response.json();
      setResultado(data);
    } catch (err) {
      console.error(err);
      setErro("Falha ao comunicar com o backend. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page__head">
        <span className="page__eyebrow">Inteligência artificial &amp; contabilidade</span>
        <h1 className="page__title">Escanear Documento Fiscal</h1>
        <p className="page__subtitle">
          Envie notas fiscais ou recibos para extração automática de dados e sugestão contábil.
        </p>
      </div>

      <form onSubmit={handleUpload} className="slip">
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
            onChange={handleFileChange}
            accept=".pdf,.png,.jpg,.jpeg"
            className="dropzone__input"
          />

          {!file ? (
            <div className="dropzone__empty">
              <span className="dropzone__icon">
                <UploadCloud size={22} strokeWidth={1.8} />
              </span>
              <span className="dropzone__title">Arraste o documento aqui</span>
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
                  setResultado(null);
                  setErro(null);
                  if (inputRef.current) inputRef.current.value = "";
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
          <button type="submit" disabled={!file || loading} className="btn-primary">
            {loading ? (
              <>
                <Loader2 size={16} className="spin" />
                Processando com Gemini…
              </>
            ) : (
              <>Escanear e analisar documento</>
            )}
          </button>
        </div>

        {erro && (
          <div className="feedback feedback--error">
            <AlertTriangle size={15} />
            <span>{erro}</span>
          </div>
        )}
      </form>

      {resultado && (
        <div className="slip" style={{ marginTop: 18 }}>
          <h2 className="section-title">Dados extraídos</h2>

          <div className="result-grid">
            <div className="field">
              <span className="field__label">Fornecedor</span>
              <input
                type="text"
                defaultValue={resultado.dados_extraidos.nome_fornecedor || ""}
                className="input"
              />
            </div>
            <div className="field">
              <span className="field__label">CNPJ/CPF</span>
              <input
                type="text"
                defaultValue={resultado.dados_extraidos.cnpj_cpf_fornecedor || ""}
                className="input"
              />
            </div>
            <div className="field">
              <span className="field__label">Nº do documento</span>
              <input
                type="text"
                defaultValue={resultado.dados_extraidos.numero_documento || ""}
                className="input"
              />
            </div>
            <div className="field">
              <span className="field__label">Valor total (R$)</span>
              <input
                type="text"
                inputMode="decimal"
                defaultValue={formatBRL(resultado.dados_extraidos.valor_total ?? 0)}
                className="input"
              />
            </div>
            <div className="field">
              <span className="field__label">Data de emissão</span>
              <input
                type="date"
                defaultValue={resultado.dados_extraidos.data_emissao || ""}
                className="input"
              />
            </div>
            <div className="field">
              <span className="field__label">Hash do arquivo</span>
              <input
                type="text"
                disabled
                value={resultado.hash_arquivo || ""}
                className="input input--mono"
              />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 18 }}>
            <span className="field__label">Descrição</span>
            <textarea
              defaultValue={resultado.dados_extraidos.descricao || ""}
              rows="2"
              className="input textarea"
            />
          </div>

          <h2 className="section-title">Sugestão contábil (IA)</h2>
          <div className="suggestion-card">
            <p>
              <strong>Débito:</strong> {resultado.sugestao_contabil.conta_debito_codigo} —{" "}
              {resultado.sugestao_contabil.conta_debito_nome}
            </p>
            <p>
              <strong>Crédito:</strong> {resultado.sugestao_contabil.conta_credito_codigo} —{" "}
              {resultado.sugestao_contabil.conta_credito_nome}
            </p>
            <p>
              <strong>Histórico:</strong> {resultado.sugestao_contabil.historico_sugerido}
            </p>
            <span className="suggestion-card__confidence">
              Confiança da IA: {(resultado.sugestao_contabil.score_confianca * 100).toFixed(0)}%
            </span>
          </div>

          <div style={{ marginTop: 18 }}>
            <button type="button" className="btn-secondary">
              <CheckCircle2 size={16} />
              Confirmar e salvar lançamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
