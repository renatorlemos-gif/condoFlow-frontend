import React, { useState, useRef, useCallback, useEffect } from "react";

/* ------------------------------------------------------------------ */
/*  Ícones inline — sem dependência externa                            */
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

/* ------------------------------------------------------------------ */
/*  Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function CapturarDocumentos() {
  const [file, setFile]       = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus]   = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef  = useRef(null);
  const abortRef  = useRef(null);

  /* Libera object URL ao trocar arquivo ou desmontar */
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  /* ---------------------------------------------------------------- */
  /*  Seleciona arquivo e dispara upload automaticamente               */
  /* ---------------------------------------------------------------- */
  const pickFile = useCallback((f) => {
    if (!f) return;

    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (preview) URL.revokeObjectURL(preview);

    setFile(f);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    setStatus("loading");
    setErrorMsg("");

    enviar(f);
  }, [preview]);

  /* ---------------------------------------------------------------- */
  /*  Remove e cancela                                                  */
  /* ---------------------------------------------------------------- */
  const removeFile = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  }, [preview]);

  /* ---------------------------------------------------------------- */
  /*  Upload para o backend → Supabase                                 */
  /* ---------------------------------------------------------------- */
  const enviar = async (f) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const formData = new FormData();
    formData.append("file", f);

    const API_URL = import.meta.env.VITE_API_URL || "";

    try {
      const response = await fetch(`${API_URL}/api/v1/documentos/upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (!response.ok) throw new Error("Erro ao enviar o documento.");

      setStatus("success");
    } catch (err) {
      if (err.name === "AbortError") return;
      setStatus("error");
      setErrorMsg(err.message || "Não foi possível enviar o documento.");
    } finally {
      abortRef.current = null;
    }
  };

  /* ---------------------------------------------------------------- */
  /*  Nova captura — limpa tudo para a próxima foto                    */
  /* ---------------------------------------------------------------- */
  const novaCaptura = () => {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setErrorMsg("");
    if (inputRef.current) inputRef.current.value = "";
  };

  /* ---------------------------------------------------------------- */
  /*  Drag & drop                                                       */
  /* ---------------------------------------------------------------- */
  const handleDrag = useCallback((e, active) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(active);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }, [pickFile]);

  /* ---------------------------------------------------------------- */
  /*  Render                                                            */
  /* ---------------------------------------------------------------- */
  return (
    <div className="page">
      <div className="page__head">
        <span className="page__eyebrow">Digitalização</span>
        <h1 className="page__title">Capturar Documentos</h1>
        <p className="page__subtitle">
          Fotografe notas fiscais e recibos. O envio é automático — assim que
          concluir, já pode fotografar o próximo documento.
        </p>
      </div>

      <div className="slip">
        {/* ---- Área de upload / preview ---- */}
        <label
          className={[
            "dropzone",
            dragActive ? "dropzone--active" : "",
            file ? "dropzone--filled dropzone--preview" : "",
          ].join(" ")}
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
            className="dropzone__input"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) pickFile(f); }}
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
              {preview
                ? <img src={preview} alt="Prévia do documento" className="dropzone__img" />
                : (
                  <div className="dropzone__pdf-badge">
                    <span className="dropzone__filename">{file.name}</span>
                  </div>
                )
              }

              {/* Overlay de loading */}
              {status === "loading" && (
                <div className="dropzone__overlay">
                  <Loader2 size={28} className="spin" />
                  <span>Enviando…</span>
                </div>
              )}

              {/* Overlay de sucesso */}
              {status === "success" && (
                <div className="dropzone__overlay dropzone__overlay--success">
                  <CheckCircle2 size={28} />
                  <span>Enviado!</span>
                </div>
              )}

              {/* Botão remover (só quando não foi enviado com sucesso) */}
              {status !== "success" && (
                <button
                  type="button"
                  className="dropzone__remove dropzone__remove--float"
                  onClick={(e) => { e.preventDefault(); removeFile(); }}
                  aria-label="Remover arquivo"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}
        </label>

        {/* ---- Erro ---- */}
        {status === "error" && (
          <div className="feedback feedback--error" style={{ marginTop: 12 }}>
            <AlertTriangle size={15} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* ---- Ação pós-sucesso ---- */}
        {status === "success" && (
          <div className="perf" aria-hidden="true">
            <span className="perf__notch perf__notch--left" />
            <span className="perf__line" />
            <span className="perf__notch perf__notch--right" />
          </div>
        )}

        {status === "success" && (
          <div className="slip__actions">
            <button type="button" className="btn-primary" onClick={novaCaptura}>
              Fotografar próximo documento
            </button>
          </div>
        )}
      </div>

      <p className="page__footnote">
        O arquivo é enviado com segurança e armazenado vinculado ao condomínio.
        A extração automática de dados ocorre em segundo plano.
      </p>
    </div>
  );
}
