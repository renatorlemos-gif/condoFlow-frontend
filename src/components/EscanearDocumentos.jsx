import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  UploadCloud,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Printer,
} from "./layout/icons";
import { bytesToSize, formatBRL } from "../utils/format";

/* ------------------------------------------------------------------ */
/*  Ref de abort — permite cancelar um request em andamento quando     */
/*  o usuário troca de foto antes de o Gemini terminar.                */
/* ------------------------------------------------------------------ */

export function EscanearDocumentos() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);  // object URL da imagem
  const [loading, setLoading]   = useState(false);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro]         = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const inputRef   = useRef(null);
  const abortRef   = useRef(null); // AbortController atual

  /* Libera o object URL quando o arquivo troca ou o componente desmonta */
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  /* ---------------------------------------------------------------- */
  /*  Seleciona arquivo, gera preview e dispara o processamento        */
  /* ---------------------------------------------------------------- */
  const pickFile = useCallback((f) => {
    if (!f) return;

    /* Cancela request anterior se ainda estiver em andamento */
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    /* Libera URL anterior */
    if (preview) URL.revokeObjectURL(preview);

    const isImage = f.type.startsWith("image/");
    setFile(f);
    setPreview(isImage ? URL.createObjectURL(f) : null);
    setResultado(null);
    setErro(null);

    processar(f);
  }, [preview]);

  /* ---------------------------------------------------------------- */
  /*  Remove arquivo e cancela request em andamento                   */
  /* ---------------------------------------------------------------- */
  const removeFile = useCallback(() => {
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResultado(null);
    setErro(null);
    setLoading(false);
    if (inputRef.current) inputRef.current.value = "";
  }, [preview]);

  /* ---------------------------------------------------------------- */
  /*  Processamento (chamada ao backend)                               */
  /* ---------------------------------------------------------------- */
  const processar = async (f) => {
    setLoading(true);
    setErro(null);
    setResultado(null);

    const controller = new AbortController();
    abortRef.current = controller;

    const formData = new FormData();
    formData.append("file", f);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      const response = await fetch(
        `${API_URL}/api/v1/documentos/escanear?condominio_id=cond_teste&db_context=db_teste`,
        { method: "POST", body: formData, signal: controller.signal }
      );

      if (!response.ok) throw new Error("Erro ao processar o documento no servidor.");

      const data = await response.json();
      setResultado(data);
    } catch (err) {
      if (err.name === "AbortError") return; /* troca de foto — ignora */
      console.error(err);
      setErro("Falha ao comunicar com o backend. Verifique se o servidor está rodando.");
    } finally {
      setLoading(false);
      abortRef.current = null;
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Drag & drop                                                      */
  /* ---------------------------------------------------------------- */
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

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <div className="page">
      <div className="page__head">
        <span className="page__eyebrow">Inteligência artificial &amp; contabilidade</span>
        <h1 className="page__title">Escanear Documento Fiscal</h1>
        <p className="page__subtitle">
          Fotografe ou envie a nota fiscal — os dados são extraídos automaticamente.
        </p>
      </div>

      {/* ---- Área de upload ---- */}
      <div className="slip">
        <label
          className={`dropzone ${dragActive ? "dropzone--active" : ""} ${file ? "dropzone--filled dropzone--preview" : ""}`}
          onDragOver={(e) => handleDrag(e, true)}
          onDragEnter={(e) => handleDrag(e, true)}
          onDragLeave={(e) => handleDrag(e, false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
            accept=".pdf,.png,.jpg,.jpeg"
            capture="environment"
            className="dropzone__input"
          />

          {!file ? (
            /* Estado vazio */
            <div className="dropzone__empty">
              <span className="dropzone__icon">
                <UploadCloud size={22} strokeWidth={1.8} />
              </span>
              <span className="dropzone__title">Fotografe ou arraste o documento</span>
              <span className="dropzone__hint">PDF, JPG ou PNG · toque para abrir a câmera</span>
            </div>
          ) : (
            /* Estado com arquivo */
            <div className="dropzone__preview-wrap">
              {preview ? (
                <img src={preview} alt="Prévia do documento" className="dropzone__img" />
              ) : (
                /* PDF não tem preview de imagem — mostra nome */
                <div className="dropzone__pdf-badge">
                  <span className="dropzone__filename">{file.name}</span>
                  <span className="dropzone__filesize">{bytesToSize(file.size)}</span>
                </div>
              )}

              {/* Overlay de loading sobre o preview */}
              {loading && (
                <div className="dropzone__overlay">
                  <Loader2 size={28} className="spin" />
                  <span>Extraindo dados…</span>
                </div>
              )}

              {/* Botão remover */}
              <button
                type="button"
                className="dropzone__remove dropzone__remove--float"
                onClick={(e) => { e.preventDefault(); removeFile(); }}
                aria-label="Remover arquivo"
              >
                <X size={15} />
              </button>
            </div>
          )}
        </label>

        {/* Botão imprimir — só aparece quando tem preview de imagem */}
          {preview && !loading && (
            <div style={{ display: "flex", justifyContent: "flex-end", padding: "8px 10px 10px" }}>
              <button
                type="button"
                className="btn-print"
                onClick={() => window.print()}
                title="Imprimir foto do documento"
              >
                <Printer size={15} />
                Imprimir
              </button>
            </div>
          )}

        {erro && (
          <div className="feedback feedback--error" style={{ marginTop: 12 }}>
            <AlertTriangle size={15} />
            <span>{erro}</span>
          </div>
        )}
      </div>

      {/* ---- Resultado ---- */}
      {resultado && (
        <div className="slip print-area" style={{ marginTop: 18 }}>
          <h2 className="section-title">Dados extraídos</h2>

          <div className="result-grid">
            <div className="field">
              <span className="field__label">Fornecedor</span>
              <input type="text" defaultValue={resultado.dados_extraidos.nome_fornecedor || ""} className="input" />
            </div>
            <div className="field">
              <span className="field__label">CNPJ/CPF</span>
              <input type="text" defaultValue={resultado.dados_extraidos.cnpj_cpf_fornecedor || ""} className="input" />
            </div>
            <div className="field">
              <span className="field__label">Nº do documento</span>
              <input type="text" defaultValue={resultado.dados_extraidos.numero_documento || ""} className="input" />
            </div>
            <div className="field">
              <span className="field__label">Valor total (R$)</span>
              <input type="text" inputMode="decimal" defaultValue={formatBRL(resultado.dados_extraidos.valor_total ?? 0)} className="input" />
            </div>
            <div className="field">
              <span className="field__label">Data de emissão</span>
              <input type="date" defaultValue={resultado.dados_extraidos.data_emissao || ""} className="input" />
            </div>
            {resultado.dados_extraidos.data_vencimento && (
              <div className="field">
                <span className="field__label">Data de vencimento</span>
                <input type="date" defaultValue={resultado.dados_extraidos.data_vencimento} className="input" />
              </div>
            )}
            {resultado.dados_extraidos.data_pagamento && (
              <div className="field">
                <span className="field__label">Data de pagamento</span>
                <input type="date" defaultValue={resultado.dados_extraidos.data_pagamento} className="input" />
              </div>
            )}
            <div className="field">
              <span className="field__label">Hash do arquivo</span>
              <input type="text" disabled value={resultado.hash_arquivo || ""} className="input input--mono" />
            </div>
          </div>

          <div className="field" style={{ marginBottom: 18 }}>
            <span className="field__label">Descrição</span>
            <textarea defaultValue={resultado.dados_extraidos.descricao || ""} rows="2" className="input textarea" />
          </div>

          <h2 className="section-title">Sugestão contábil (IA)</h2>
          <div className="suggestion-card">
            <p><strong>Débito:</strong> {resultado.sugestao_contabil.conta_debito_codigo} — {resultado.sugestao_contabil.conta_debito_nome}</p>
            <p><strong>Crédito:</strong> {resultado.sugestao_contabil.conta_credito_codigo} — {resultado.sugestao_contabil.conta_credito_nome}</p>
            <p><strong>Histórico:</strong> {resultado.sugestao_contabil.historico_sugerido}</p>
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
