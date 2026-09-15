import React, { useState } from "react";
import { Building2, ChevronDown, Menu } from "./icons";
import { useCondo } from "../../context/CondoContext";
import "../../styles/theme.css";

export default function AppShell({
  pages,
  currentPageId,
  onNavigate,
  user = { name: "Renato", role: "Analista Contábil", initials: "RC" },
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const {
    administradoras,
    selectedAdmId,
    selectAdm,
    condominios,
    selectedCondoId,
    selectCondo,
  } = useCondo();

  const adminIds = ["cadastros-basicos", "plano-contas", "balancetes-historicos"];
  const opPages = pages.filter((p) => !adminIds.includes(p.id));
  const adminPages = pages.filter((p) => adminIds.includes(p.id));

  return (
    <div className="app">
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
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
          {opPages.map((p) => {
            const Icon = p.icon;
            const isCurrent = p.id === currentPageId;
            return (
              <button
                key={p.id}
                type="button"
                className={`nav-item ${isCurrent ? "nav-item--active" : ""}`}
                title={p.label}
                onClick={() => {
                  onNavigate(p.id);
                  setMenuOpen(false);
                }}
              >
                <Icon size={17} strokeWidth={2} className="nav-item__icon" />
                <span className="nav-item__label">{p.label}</span>
              </button>
            );
          })}

          <button
            type="button"
            className="sidebar__section"
            onClick={() => setIsAdminOpen(!isAdminOpen)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              textAlign: "left",
              paddingTop: "16px",
              paddingBottom: "8px",
            }}
          >
            <span>Administração</span>
            <ChevronDown
              size={14}
              style={{
                transform: isAdminOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            />
          </button>
          
          {isAdminOpen &&
            adminPages.map((p) => {
              const Icon = p.icon;
              const isCurrent = p.id === currentPageId;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`nav-item ${isCurrent ? "nav-item--active" : ""}`}
                  title={p.label}
                  onClick={() => {
                    onNavigate(p.id);
                    setMenuOpen(false);
                  }}
                  style={{ paddingLeft: "32px" }}
                >
                  <Icon size={17} strokeWidth={2} className="nav-item__icon" />
                  <span className="nav-item__label">{p.label}</span>
                </button>
              );
            })}
        </nav>
      </aside>

      <div className="main">
        <header className="topbar">
          <button
            type="button"
            className="icon-btn topbar__menu"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
          >
            <Menu size={19} />
          </button>

          <div className="context-picker">
            <select
              className="context-select"
              value={selectedAdmId || ""}
              onChange={(e) => selectAdm(e.target.value)}
              title="Administradora Selecionada"
            >
              {administradoras.map((adm) => (
                <option key={adm.id} value={adm.id}>
                  🏢 {adm.nome}
                </option>
              ))}
            </select>

            <span style={{ color: "var(--line)", fontWeight: "bold" }}>/</span>

            <select
              className="context-select"
              value={selectedCondoId || ""}
              onChange={(e) => selectCondo(e.target.value)}
              title="Condomínio Ativo da Carteira"
            >
              {condominios.map((c) => (
                <option key={c.id} value={c.id}>
                  📍 {c.nome} ({c.cidade || "SP"})
                </option>
              ))}
            </select>
          </div>

          <div className="topbar__spacer" />

          <div className="user-chip">
            <span className="user-chip__avatar">{user.initials}</span>
            <span className="user-chip__meta">
              <span className="user-chip__name">{user.name}</span>
              <span className="user-chip__role">{user.role}</span>
            </span>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
