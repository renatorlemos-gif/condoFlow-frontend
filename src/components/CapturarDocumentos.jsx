import React, { useState, useRef, useCallback, useEffect } from "react";
import { useCondo } from "../context/CondoContext";

/* ------------------------------------------------------------------ */
/*  Ícones inline                                                       */
/* ------------------------------------------------------------------ */
const iconBase = (size, strokeWidth) => ({
  width: size, height: size, viewBox: "0 0 24 24",
  fill: "none", stroke: "currentColor",
  strokeWidth, strokeLinecap: "round", strokeLinejoin: "round",
});

function UploadCloud({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M4 14.9A5 5 0 0 1 6 5.3 6.5 6.5 0 0 1 18.5 8.5 4.5 4.5 0 0 1 18 17H6a2 2 0 0 1-2-2.1z" />
      <path d="M12 12v9" /><path d="m9 15 3-3 3 3" />
    </svg>
  );
}

function CheckCircle2({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

function AlertTriangle({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="m10.29 3.86-8.18 14.18A2 2 0 0 0 4 21h16a2 2 0 0 0 1.89-2.96L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  );
}

function Loader2({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function X({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function Trash2({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}

function FileText({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function CapturarDocumentos() {
  const { selectedAdmId, selectedCondoId } = useCondo();
  const [files, setFiles] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [previews, setPreviews] = useState({});
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  // Criar URLs para pre-visualizar as imagens
  useEffect(() => {
    const newPreviews = { ...previews };
    files.forEach((f) => {
      // Usar f.name + file size para ter uma key mais unica
      const key = f.name + f.size;
      if (!newPreviews[key]) {
        newPreviews[key] = URL.createObjectURL(f);
      }
    });
    setPreviews(newPreviews);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [files]);

  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetar = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    Object.values(previews).forEach((url) => URL.revokeObjectURL(url));
    setFiles([]);
    setCurrentIndex(0);
    setPreviews({});
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }, [previews]);

  const addFiles = useCallback((newFilesList) => {
    if (!newFilesList || newFilesList.length === 0) return;
    setStatus("idle");
    setErrorMsg("");
    const arr = Array.from(newFilesList);
    setFiles((prev) => [...prev, ...arr]);
  }, []);

  const handleDrag = useCallback((e, active) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(active);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const removeFile = (index) => {
    const newFiles = [...files];
    const removed = newFiles.splice(index, 1)[0];
    setFiles(newFiles);
    
    // Revogar a url pra evitar memory leak
    if (removed) {
      const key = removed.name + removed.size;
      if (previews[key]) {
        URL.revokeObjectURL(previews[key]);
        const newPrev = { ...previews };
        delete newPrev[key];
        setPreviews(newPrev);
      }
    }
    
    if (currentIndex >= newFiles.length) {
      setCurrentIndex(Math.max(0, newFiles.length - 1));
    }
  };

  const enviarPasta = async () => {
    if (files.length === 0) return;
    setStatus("uploading");
    setErrorMsg("");

    const controller = new AbortController();
    abortRef.current = controller;
    const API_URL = import.meta.env.VITE_API_URL || "";

    try {
      const formData = new FormData();
      formData.append("administradora_id", selectedAdmId);
      formData.append("condominio_id", selectedCondoId);
      files.forEach(f => formData.append("files", f));

      const response = await fetch(`${API_URL}/api/v1/documentos/upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data?.detail || `Erro ao enviar os documentos.`);
      }
      setStatus("success");
      setFiles([]);
    } catch (err) {
      if (err.name === "AbortError") return;
      setStatus("error");
      setErrorMsg(err.message || "Não foi possível enviar os documentos.");
    } finally {
      abortRef.current = null;
    }
  };

  const isUploading = status === "uploading";

  return (
    <div className="page">
      <div className="page__head" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <span className="page__eyebrow">Digitalização</span>
        <h1 className="page__title">Capturar Documentos</h1>
        <p className="page__subtitle" style={{ margin: "0 auto" }}>
          Fotografe notas fiscais e recibos em pasta. Revise as imagens antes de enviar todas de uma vez.
        </p>
      </div>

      <div className="slip">
        {files.length === 0 && status !== "success" ? (
          <label
            className={`dropzone ${dragActive ? "dropzone--active" : ""}`}
            onDragOver={(e) => handleDrag(e, true)}
            onDragEnter={(e) => handleDrag(e, true)}
            onDragLeave={(e) => handleDrag(e, false)}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              capture="environment"
              multiple
              className="dropzone__input"
              onChange={(e) => addFiles(e.target.files)}
            />
            <div className="dropzone__empty">
              <span className="dropzone__icon">
                <UploadCloud size={22} strokeWidth={1.8} />
              </span>
              <span className="dropzone__title">Fotografe ou arraste documentos</span>
              <span className="dropzone__hint">PDF, JPG ou PNG · toque para abrir a câmera</span>
            </div>
          </label>
        ) : files.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '16px', padding: '16px 0' }}>
              <div style={{ position: 'relative', width: '100%', height: '384px', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', backgroundColor: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Botão Anterior */}
                {files.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => (prev > 0 ? prev - 1 : files.length - 1))}
                    style={{ position: 'absolute', left: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  >
                    <span style={{ fontWeight: 'bold', color: '#334155' }}>&lt;</span>
                  </button>
                )}

                {/* Conteúdo Atual */}
                {(() => {
                  const file = files[currentIndex];
                  if (!file) return null;
                  const key = file.name + file.size;
                  let previewUrl = previews[key] || "";
                  if (file.type === "application/pdf" && previewUrl) {
                    previewUrl += "#navpanes=0&view=FitH";
                  }
                  return (
                    <object data={previewUrl} type={file.type} className="w-full h-96" style={{ width: '100%', height: '100%', objectFit: 'contain' }}>
                      <p style={{ padding: '16px', color: '#64748b' }}>Seu navegador não suporta a visualização deste arquivo ({file.name}).</p>
                    </object>
                  );
                })()}

                {/* Botão Próximo */}
                {files.length > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((prev) => (prev < files.length - 1 ? prev + 1 : 0))}
                    style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', zIndex: 10, background: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
                  >
                    <span style={{ fontWeight: 'bold', color: '#334155' }}>&gt;</span>
                  </button>
                )}
              </div>

              {/* Informações e Controles */}
              <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '14px', fontWeight: 500, color: '#334155' }}>
                  {files[currentIndex]?.name} <span style={{ color: '#94a3b8', fontWeight: 400 }}>({currentIndex + 1} de {files.length})</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!isUploading && status !== "success" && (
                    <button
                      type="button"
                      onClick={() => removeFile(currentIndex)}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#fee2e2', color: '#ef4444', border: 'none', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}
                      title="Remover arquivo atual"
                    >
                      <Trash2 size={16} /> <span className="hidden sm:inline">Remover Atual</span>
                    </button>
                  )}
                  
                  {!isUploading && status !== "success" && (
                    <label style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }}>
                      <UploadCloud size={16} /> <span className="hidden sm:inline">Adicionar mais</span>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        capture="environment"
                        multiple
                        style={{ display: 'none' }}
                        onChange={(e) => addFiles(e.target.files)}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* Overlay de uploading */}
            {isUploading && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: '#2563eb', fontWeight: 500, padding: '16px 0' }}>
                <Loader2 size={24} className="spin" />
                <span>Enviando {files.length} arquivo(s)…</span>
              </div>
            )}
          </div>
        ) : (
          <div className="dropzone dropzone--filled dropzone--preview" style={{ position: "relative" }}>
             <div className="dropzone__preview-wrap">
              {/* Overlay de sucesso se files = 0 e success */}
              {status === "success" && (
                <div className="dropzone__overlay dropzone__overlay--success">
                  <CheckCircle2 size={28} />
                  <span>Pasta Enviada!</span>
                </div>
              )}
             </div>
          </div>
        )}

        {/* Erro */}
        {status === "error" && (
          <div className="feedback feedback--error" style={{ marginTop: 12 }}>
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Ações pós-conclusão ou Ação de Enviar Lote */}
        <div className="perf" aria-hidden="true" style={{ marginTop: 16 }}>
          <span className="perf__notch perf__notch--left" />
          <span className="perf__line" />
          <span className="perf__notch perf__notch--right" />
        </div>
        <div className="slip__actions">
          {status === "success" || status === "error" ? (
            <button type="button" className="btn-primary" onClick={resetar}>
              {status === "success" ? "Fotografar nova pasta" : "Tentar novamente"}
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={enviarPasta} disabled={files.length === 0 || isUploading}>
              {isUploading ? "Enviando..." : `Enviar Pasta (${files.length} arquivo${files.length !== 1 ? 's' : ''})`}
            </button>
          )}
        </div>
      </div>

      <p className="page__footnote">
        Os arquivos são enviados com segurança e armazenados vinculados ao condomínio.
        A extração automática de dados ocorre em segundo plano.
      </p>
    </div>
  );
}


