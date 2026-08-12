import React, { useState, useRef, useCallback } from "react";

/* ------------------------------------------------------------------ */
/*  Ícones inline (sem dependência externa) — mesma assinatura de props */
/*  usada pelo lucide-react: size, strokeWidth, className              */
/* ------------------------------------------------------------------ */

const iconBase = (size, strokeWidth) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth,
  strokeLinecap: "round",
  strokeLinejoin: "round",
});

function Building2({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M6 22V4a1 1 0 0 1 1-1h7a1 1 0 0 1 1 1v18" />
      <path d="M15 22V9a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v13" />
      <path d="M2 22h20" />
      <path d="M9 6h1M9 10h1M9 14h1M9 18h1" />
      <path d="M14 12h1M14 16h1" />
    </svg>
  );
}

function FileSpreadsheet({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h8M8 13v4" />
    </svg>
  );
}

function UploadCloud({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M4 14.9A5 5 0 0 1 6 5.3 6.5 6.5 0 0 1 18.5 8.5 4.5 4.5 0 0 1 18 17H6a2 2 0 0 1-2-2.1z" />
      <path d="M12 12v9" />
      <path d="m9 15 3-3 3 3" />
    </svg>
  );
}

function FileCheck2({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="m9 15 2 2 4-4" />
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

function Loader2({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

function ChevronDown({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="m6 9 6 6 6-6" />
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

function Menu({ size = 18, strokeWidth = 2, className }) {
  return (
    <svg {...iconBase(size, strokeWidth)} className={className}>
      <path d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  CondoFlow — painel de administração de condomínios                 */
/*  Tema: "livro-razão" — navy de arquivo, papel frio, selo de conciliação */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { id: "processar-extratos", label: "Processar Extratos", icon: FileSpreadsheet },
];

const BANCOS = [
  { id: "bradesco", label: "Bradesco" },
  { id: "santander", label: "Santander" },
];

function bytesToSize(bytes) {
  if (!bytes) return "0 KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(0)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

/* ------------------------------- Sidebar ------------------------------- */

function Sidebar({ open, onClose, currentPage }) {
  return (
    <>
      {open && <div className="scrim" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
        <div className="sidebar__brand">
          <span className="sidebar__mark">
            <Building2 size={20} strokeWidth={2.25} />
          </span>
          <div className="sidebar__brandtext">
            <span className="sidebar__name">CondoFlow</span>
            <span className="sidebar__tag">Administração de Condomínios</span>
          </div>
        </div>

        <nav className="sidebar__nav">
          <span className="sidebar__section">Operação</span>
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isCurrent = item.id === currentPage;
            return (
              <button
                key={item.id}
                type="button"
                className={`nav-item ${isCurrent ? "nav-item--active" : ""}`}
                title={item.label}
              >
                <Icon size={17} strokeWidth={2} className="nav-item__icon" />
                <span className="nav-item__label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}

/* ------------------------------- Topbar ------------------------------- */

function Topbar({ onMenu }) {
  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar__menu" onClick={onMenu} aria-label="Abrir menu">
        <Menu size={19} />
      </button>

      <button type="button" className="condo-picker">
        <Building2 size={15} strokeWidth={2.25} />
        <span>Residencial Vista Verde</span>
        <ChevronDown size={14} />
      </button>

      <div className="topbar__spacer" />

      <div className="user-chip">
        <span className="user-chip__avatar">RS</span>
        <span className="user-chip__meta">
          <span className="user-chip__name">Renato</span>
          <span className="user-chip__role">Síndico profissional</span>
        </span>
      </div>
    </header>
  );
}

/* ------------------------- Extrato Processor page ------------------------- */

function ExtratoProcessor() {
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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("banco", banco);

    const API_URL =
      import.meta.env.VITE_API_URL || "https://condoflow-backend-ep3z.onrender.com";

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
    } catch (error) {
      setStatus("error");
      setErrorMsg(error.message || "Não foi possível processar o extrato.");
    }
  };

  const bancoLabel = BANCOS.find((b) => b.id === banco)?.label ?? banco;

  return (
    <div className="page">
      <div className="page__head">
        <span className="page__eyebrow">Conciliação bancária</span>
        <h1 className="page__title">Processar Extratos</h1>
        <p className="page__subtitle">
          Envie o extrato do banco e receba a planilha consolidada, pronta para conferência com o
          livro caixa do condomínio.
        </p>
      </div>

      <div className="slip">
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

/* --------------------------------- App --------------------------------- */

export default function CondoFlowApp() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="app">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:wght@500;600&family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@500&display=swap');

        :root {
          --navy-950: #101b30;
          --navy-900: #16233f;
          --navy-800: #1e2f4f;
          --navy-700: #2b3f63;
          --paper: #eef1ef;
          --paper-card: #ffffff;
          --ink: #1c2430;
          --ink-soft: #4b5567;
          --slate: #7a8496;
          --line: #dde1e0;
          --ledger: #2e6b52;
          --ledger-dark: #21503e;
          --ledger-tint: #e4efe9;
          --brass: #b8875a;
          --brass-tint: #f5ead9;
          --red: #b3452f;
          --red-tint: #f6e6e1;
        }

        .app {
          font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
          color: var(--ink);
          background: var(--paper);
          min-height: 100vh;
          display: flex;
          position: relative;
        }

        /* ---------------- Sidebar ---------------- */
        .sidebar {
          width: 248px;
          flex-shrink: 0;
          background: var(--navy-900);
          background-image: linear-gradient(180deg, var(--navy-900), var(--navy-950));
          color: #dfe6f2;
          display: flex;
          flex-direction: column;
          padding: 22px 14px;
          position: sticky;
          top: 0;
          height: 100vh;
          box-sizing: border-box;
          z-index: 30;
        }

        .sidebar__brand {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 4px 8px 20px 8px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          margin-bottom: 16px;
        }
        .sidebar__mark {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: var(--ledger);
          color: #eafff2;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .sidebar__brandtext { display: flex; flex-direction: column; line-height: 1.2; }
        .sidebar__name { font-family: 'IBM Plex Serif', serif; font-weight: 600; font-size: 15.5px; color: #fff; }
        .sidebar__tag { font-size: 10.5px; color: #93a0bd; margin-top: 2px; }

        .sidebar__section {
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: #6b7897;
          padding: 0 10px;
          margin-bottom: 6px;
          display: block;
        }

        .sidebar__nav { display: flex; flex-direction: column; gap: 2px; flex: 1; }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          text-align: left;
          padding: 9px 10px;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #aab6d1;
          font-size: 13.3px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s ease, color 0.15s ease;
        }
        .nav-item:hover { background: rgba(255,255,255,0.06); color: #fff; }
        .nav-item--active {
          background: var(--ledger);
          color: #f2fff8;
        }
        .nav-item--active:hover { background: var(--ledger) !important; color: #f2fff8 !important; }
        .nav-item__icon { flex-shrink: 0; }
        .nav-item__label { flex: 1; }

        .scrim { display: none; }

        /* ---------------- Topbar ---------------- */
        .main { flex: 1; min-width: 0; display: flex; flex-direction: column; }
        .topbar {
          height: 62px;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 0 24px;
          background: var(--paper-card);
          border-bottom: 1px solid var(--line);
          position: sticky;
          top: 0;
          z-index: 20;
        }
        .topbar__menu { display: none; }
        .icon-btn {
          border: none;
          background: transparent;
          color: var(--ink-soft);
          width: 34px; height: 34px;
          border-radius: 8px;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
        }
        .icon-btn:hover { background: var(--paper); }

        .condo-picker {
          display: flex;
          align-items: center;
          gap: 8px;
          border: 1px solid var(--line);
          background: var(--paper);
          border-radius: 9px;
          padding: 7px 12px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
          cursor: pointer;
        }
        .condo-picker:hover { border-color: var(--ledger); }
        .topbar__spacer { flex: 1; }

        .user-chip { display: flex; align-items: center; gap: 9px; }
        .user-chip__avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: var(--brass-tint);
          color: var(--brass);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px; font-weight: 600;
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--brass);
        }
        .user-chip__meta { display: flex; flex-direction: column; line-height: 1.25; }
        .user-chip__name { font-size: 13px; font-weight: 600; color: var(--ink); }
        .user-chip__role { font-size: 11px; color: var(--slate); }

        /* ---------------- Page ---------------- */
        .page { max-width: 620px; margin: 0 auto; padding: 44px 24px 60px; width: 100%; box-sizing: border-box; }
        .page__head { margin-bottom: 26px; }
        .page__eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ledger);
          font-weight: 500;
        }
        .page__title {
          font-family: 'IBM Plex Serif', serif;
          font-weight: 600;
          font-size: 28px;
          color: var(--ink);
          margin: 6px 0 8px;
        }
        .page__subtitle { font-size: 14px; color: var(--ink-soft); line-height: 1.55; max-width: 46ch; }
        .page__footnote { margin-top: 18px; font-size: 12px; color: var(--slate); line-height: 1.6; text-align: center; }

        /* ---------------- Slip card (signature element) ---------------- */
        .slip {
          background: var(--paper-card);
          border: 1px solid var(--line);
          border-radius: 14px;
          padding: 22px 22px 20px;
          box-shadow: 0 1px 2px rgba(16,27,48,0.04), 0 14px 30px -18px rgba(16,27,48,0.22);
        }

        .slip__row {
          display: flex;
          gap: 18px;
          margin-bottom: 16px;
          flex-wrap: wrap;
        }
        .field { display: flex; flex-direction: column; gap: 6px; }
        .field__label {
          font-size: 10.5px;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          color: var(--slate);
          font-weight: 600;
        }
        .field__mono {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 13px;
          color: var(--ink-soft);
          padding: 8px 0;
        }

        .segmented {
          display: inline-flex;
          background: var(--paper);
          border: 1px solid var(--line);
          border-radius: 9px;
          padding: 3px;
          gap: 2px;
        }
        .segmented__item {
          border: none;
          background: transparent;
          padding: 7px 14px;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink-soft);
          border-radius: 7px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .segmented__item--active {
          background: var(--navy-900);
          color: #fff;
        }

        .dropzone {
          display: block;
          border: 1.5px dashed var(--line);
          border-radius: 10px;
          background: var(--paper);
          padding: 26px 18px;
          text-align: center;
          cursor: pointer;
          transition: border-color 0.15s ease, background 0.15s ease;
          position: relative;
        }
        .dropzone:hover { border-color: var(--ledger); }
        .dropzone--active { border-color: var(--ledger); background: var(--ledger-tint); }
        .dropzone--filled { background: var(--paper-card); border-style: solid; border-color: var(--line); text-align: left; padding: 12px 14px; }
        .dropzone__input { position: absolute; inset: 0; opacity: 0; cursor: pointer; }

        .dropzone__empty { display: flex; flex-direction: column; align-items: center; gap: 6px; }
        .dropzone__icon {
          width: 40px; height: 40px; border-radius: 50%;
          background: var(--ledger-tint); color: var(--ledger);
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 4px;
        }
        .dropzone__title { font-size: 13.5px; font-weight: 600; color: var(--ink); }
        .dropzone__hint { font-size: 12px; color: var(--slate); }

        .dropzone__file { display: flex; align-items: center; gap: 12px; }
        .dropzone__fileicon {
          width: 36px; height: 36px; border-radius: 8px;
          background: var(--ledger-tint); color: var(--ledger);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .dropzone__filemeta { display: flex; flex-direction: column; min-width: 0; flex: 1; }
        .dropzone__filename { font-size: 13px; font-weight: 600; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .dropzone__filesize { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--slate); margin-top: 1px; }
        .dropzone__remove {
          border: none; background: var(--paper);
          width: 26px; height: 26px; border-radius: 50%;
          color: var(--ink-soft);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; flex-shrink: 0;
        }
        .dropzone__remove:hover { background: var(--red-tint); color: var(--red); }

        /* perforated ticket divider */
        .perf { position: relative; height: 16px; margin: 4px -22px; }
        .perf__line {
          position: absolute; left: 22px; right: 22px; top: 50%;
          border-top: 1.5px dashed var(--line);
        }
        .perf__notch {
          position: absolute; top: 50%; transform: translateY(-50%);
          width: 14px; height: 14px; border-radius: 50%;
          background: var(--paper);
          border: 1px solid var(--line);
        }
        .perf__notch--left { left: -7px; }
        .perf__notch--right { right: -7px; }

        .slip__actions { display: flex; align-items: center; gap: 12px; margin-top: 14px; }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          background: var(--ledger);
          color: #f2fff8;
          border: none;
          font-size: 13.5px;
          font-weight: 600;
          padding: 11px 18px;
          border-radius: 9px;
          cursor: pointer;
          transition: background 0.15s ease, transform 0.05s ease;
          flex: 1;
        }
        .btn-primary:hover:not(:disabled) { background: var(--ledger-dark); }
        .btn-primary:active:not(:disabled) { transform: translateY(1px); }
        .btn-primary:disabled { background: #c3cbd6; cursor: not-allowed; color: #fff; }

        .spin { animation: spin 0.85s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .stamp {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--brass);
          border: 1.5px solid var(--brass);
          border-radius: 7px;
          padding: 6px 10px;
          transform: rotate(-3deg);
          animation: stampIn 0.28s ease-out;
        }
        @keyframes stampIn {
          from { opacity: 0; transform: rotate(-3deg) scale(1.4); }
          to { opacity: 1; transform: rotate(-3deg) scale(1); }
        }

        .feedback {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          font-size: 12.5px;
          line-height: 1.55;
          border-radius: 9px;
          padding: 10px 12px;
          margin-top: 14px;
        }
        .feedback--error { background: var(--red-tint); color: var(--red); }
        .feedback--success { background: var(--ledger-tint); color: var(--ledger-dark); }
        .feedback svg { margin-top: 1px; flex-shrink: 0; }

        /* ---------------- Responsive ---------------- */
        @media (max-width: 860px) {
          .sidebar {
            position: fixed;
            left: 0; top: 0;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
          }
          .sidebar--open { transform: translateX(0); }
          .scrim {
            display: block;
            position: fixed; inset: 0;
            background: rgba(16,27,48,0.45);
            z-index: 25;
          }
          .topbar__menu { display: flex; }
          .page { padding: 28px 16px 44px; }
          .slip__row { flex-direction: column; gap: 12px; }
        }
      `}</style>

      <Sidebar open={menuOpen} onClose={() => setMenuOpen(false)} currentPage="processar-extratos" />

      <div className="main">
        <Topbar onMenu={() => setMenuOpen(true)} />
        <ExtratoProcessor />
      </div>
    </div>
  );
}
