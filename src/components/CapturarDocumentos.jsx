import React, { useState, useRef, useCallback, useEffect } from "react";

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

/* ------------------------------------------------------------------ */
/*  Componente principal                                                */
/* ------------------------------------------------------------------ */

export default function CapturarDocumentos() {
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [status, setStatus]     = useState("idle"); // idle | validating | uploading | success | rejected | error
  const [mensagem, setMensagem] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  const abortRef = useRef(null);

  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const resetar = useCallback(() => {
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setStatus("idle");
    setMensagem("");
    if (inputRef.current) inputRef.current.value = "";
  }, [preview]);

  const pickFile = useCallback((f) => {
    if (!f) return;
    if (abortRef.current) { abortRef.current.abort(); abortRef.current = null; }
    if (preview) URL.revokeObjectURL(preview);

    setFile(f);
    setPreview(f.type.startsWith("image/") ? URL.createObjectURL(f) : null);
    setStatus("validating");
    setMensagem("");

    enviar(f);
  }, [preview]);

  const enviar = async (f) => {
    const controller = new AbortController();
    abortRef.current = controller;

    const formData = new FormData();
    formData.append("file", f);

    const API_URL = import.meta.env.VITE_API_URL || "";

    try {
      // Muda para "uploading" assim que a validação começa no backend
      // (o backend faz os dois em sequência; o front mostra etapas)
      const response = await fetch(`${API_URL}/api/v1/documentos/upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
      });

      if (response.status === 422) {
        // Qualidade insuficiente — backend não salvou o arquivo
        const data = await response.json();
        const motivo = data?.detail || "Qualidade insuficiente para extração de dados.";
        setStatus("rejected");
        setMensagem(motivo);
        return;
      }

      if (!response.ok) {
        throw new Error("Erro ao enviar o documento.");
      }

      setStatus("success");
    } catch (err) {
      if (err.name === "AbortError") return;
      setStatus("error");
      setMensagem(err.message || "Não foi possível enviar o documento.");
    } finally {
      abortRef.current = null;
    }
  };

  const handleDrag = useCallback((e, active) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(active);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault(); e.stopPropagation(); setDragActive(false);
    const f = e.dataTransfer.files?.[0];
    if (f) pickFile(f);
  }, [pickFile]);

  /* Labels do overlay conforme estado */
  const overlayLabel = {
    validating: { icon: <Loader2 size={28} className="spin" />, texto: "Verificando qualidade…" },
    uploading:  { icon: <Loader2 size={28} className="spin" />, texto: "Enviando…" },
    success:    { icon: <CheckCircle2 size={28} />, texto: "Enviado!", css: "dropzone__overlay--success" },
    rejected:   { icon: <AlertTriangle size={28} />, texto: "Foto recusada", css: "dropzone__overlay--rejected" },
  }[status];

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
            <div className="dropzone__empty">
              <span className="dropzone__icon">
                <UploadCloud size={22} strokeWidth={1.8} />
              </span>
              <span className="dropzone__title">Fotografe ou arraste o documento</span>
              <span className="dropzone__hint">PDF, JPG ou PNG · toque para abrir a câmera</span>
            </div>
          ) : (
            <div className="dropzone__preview-wrap">
              {preview
                ? <img src={preview} alt="Prévia do documento" className="dropzone__img" />
                : (
                  <div className="dropzone__pdf-badge">
                    <span className="dropzone__filename">{file.name}</span>
                  </div>
                )
              }

              {/* Overlay de estado */}
              {overlayLabel && (
                <div className={`dropzone__overlay ${overlayLabel.css || ""}`}>
                  {overlayLabel.icon}
                  <span>{overlayLabel.texto}</span>
                </div>
              )}

              {/* Botão remover (disponível em qualquer estado exceto success) */}
              {status !== "success" && (
                <button
                  type="button"
                  className="dropzone__remove dropzone__remove--float"
                  onClick={(e) => { e.preventDefault(); resetar(); }}
                  aria-label="Remover arquivo"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          )}
        </label>

        {/* Motivo da rejeição */}
        {status === "rejected" && (
          <div className="feedback feedback--error" style={{ marginTop: 12 }}>
            <AlertTriangle size={15} />
            <span><strong>Foto recusada:</strong> {mensagem} — tire uma nova foto com melhor iluminação e foco.</span>
          </div>
        )}

        {/* Erro técnico */}
        {status === "error" && (
          <div className="feedback feedback--error" style={{ marginTop: 12 }}>
            <AlertTriangle size={15} />
            <span>{mensagem}</span>
          </div>
        )}

        {/* Ações pós-sucesso ou pós-rejeição */}
        {(status === "success" || status === "rejected") && (
          <>
            <div className="perf" aria-hidden="true">
              <span className="perf__notch perf__notch--left" />
              <span className="perf__line" />
              <span className="perf__notch perf__notch--right" />
            </div>
            <div className="slip__actions">
              <button type="button" className="btn-primary" onClick={resetar}>
                {status === "success" ? "Fotografar próximo documento" : "Tentar novamente"}
              </button>
            </div>
          </>
        )}
      </div>

      <p className="page__footnote">
        O arquivo é enviado com segurança após validação automática de qualidade.
        Imagens fora de foco, escuras ou cortadas são recusadas para garantir a extração correta dos dados.
      </p>
    </div>
  );
}
