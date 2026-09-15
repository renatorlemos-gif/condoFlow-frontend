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

function ChevronLeft({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="m15 18-6-6 6-6"/>
    </svg>
  );
}

function ChevronRight({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="m9 18 6-6-6-6"/>
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
  const [uploadIndex, setUploadIndex] = useState(0); // Para saber qual está enviando (1 of N)
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const appendInputRef = useRef(null);
  const abortRef = useRef(null);

  // Criar URLs para pre-visualizar as imagens
  useEffect(() => {
    const newPreviews = { ...previews };
    files.forEach((f) => {
      // Usar f.name + file size para ter uma key mais unica
      const key = f.name + f.size;
      if (!newPreviews[key] && f.type.startsWith("image/")) {
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
    setPreviews({});
    setCurrentIndex(0);
    setUploadIndex(0);
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
    if (appendInputRef.current) appendInputRef.current.value = "";
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

  const removeCurrent = () => {
    const newFiles = [...files];
    const removed = newFiles.splice(currentIndex, 1)[0];
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
    
    if (currentIndex >= newFiles.length && newFiles.length > 0) {
      setCurrentIndex(newFiles.length - 1);
    } else if (newFiles.length === 0) {
      setCurrentIndex(0);
    }
  };

  const enviarLote = async () => {
    if (files.length === 0) return;
    setStatus("uploading");
    setErrorMsg("");
    setUploadIndex(0);

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

  const currentFile = files[currentIndex];
  const currentKey = currentFile ? currentFile.name + currentFile.size : "";
  const isUploading = status === "uploading";

  return (
    <div className="page">
      <div className="page__head">
        <span className="page__eyebrow">Digitalização</span>
        <h1 className="page__title">Capturar Documentos</h1>
        <p className="page__subtitle">
          Fotografe notas fiscais e recibos em lote. Revise as imagens antes de enviar todas de uma vez.
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
          <div className="dropzone dropzone--filled dropzone--preview" style={{ position: "relative", overflow: "hidden", padding: 0 }}>
             <div className="dropzone__preview-wrap" style={{ position: "relative", width: "100%", minHeight: "200px", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {previews[currentKey]
                ? <img src={previews[currentKey]} alt="Prévia" className="dropzone__img" style={{ maxHeight: "400px", objectFit: "contain" }} />
                : (
                  <div className="dropzone__pdf-badge" style={{ padding: "20px" }}>
                    <span className="dropzone__filename">{currentFile?.name}</span>
                  </div>
                )
              }
              
              {/* Overlay de uploading */}
              {isUploading && (
                <div className="dropzone__overlay">
                  <Loader2 size={28} className="spin" />
                  <span>Enviando {uploadIndex} de {files.length}…</span>
                </div>
              )}
              
              {/* Overlay de sucesso */}
              {status === "success" && (
                <div className="dropzone__overlay dropzone__overlay--success">
                  <CheckCircle2 size={28} />
                  <span>Enviado!</span>
                </div>
              )}

              {/* Setas do Carrossel */}
              {!isUploading && status !== "success" && files.length > 1 && (
                <>
                  <button 
                    type="button"
                    className="dropzone__nav-btn dropzone__nav-btn--prev"
                    style={{ position: 'absolute', left: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10 }}
                    onClick={(e) => { e.preventDefault(); setCurrentIndex((curr) => curr > 0 ? curr - 1 : files.length - 1); }}
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    type="button"
                    className="dropzone__nav-btn dropzone__nav-btn--next"
                    style={{ position: 'absolute', right: 10, background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '8px', cursor: 'pointer', zIndex: 10 }}
                    onClick={(e) => { e.preventDefault(); setCurrentIndex((curr) => curr < files.length - 1 ? curr + 1 : 0); }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
             </div>

             {/* Footer do Carrossel */}
             {!isUploading && status !== "success" && (
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '10px 15px', background: '#f9f9f9', borderTop: '1px solid #eee', boxSizing: 'border-box' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                   <span style={{ fontSize: '14px', fontWeight: 500, color: '#333' }}>{currentIndex + 1} de {files.length}</span>
                   <button type="button" onClick={removeCurrent} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '13px' }}>
                     <Trash2 size={14} /> Remover atual
                   </button>
                 </div>
                 <div style={{ position: 'relative' }}>
                   <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', fontSize: '13px', fontWeight: 500 }} onClick={() => appendInputRef.current?.click()}>
                     + Adicionar Mais
                   </button>
                   <input
                     ref={appendInputRef}
                     type="file"
                     accept=".pdf,.png,.jpg,.jpeg"
                     capture="environment"
                     multiple
                     style={{ display: 'none' }}
                     onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
                   />
                 </div>
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
                  <span>Lote Enviado!</span>
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
              {status === "success" ? "Fotografar novo lote" : "Tentar novamente"}
            </button>
          ) : (
            <button type="button" className="btn-primary" onClick={enviarLote} disabled={files.length === 0 || isUploading}>
              {isUploading ? "Enviando..." : `Enviar Lote (${files.length} arquivo${files.length !== 1 ? 's' : ''})`}
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

