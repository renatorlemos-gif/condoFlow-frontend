import React, { useState } from "react";
import { Building2, ChevronDown, Menu } from "./icons";
import "../../styles/theme.css";

/**
 * Casco da aplicação: sidebar + topbar + área de conteúdo.
 * Não conhece nenhuma feature específica (Processar Extratos, Escanear
 * Documentos, etc.) — recebe a lista de páginas via props. Para adicionar
 * uma nova funcionalidade no futuro, NÃO se mexe aqui: adiciona-se um item
 * no array `PAGES` do App.jsx.
 */
export default function AppShell({
  pages,
  currentPageId,
  onNavigate,
  condoName = "Residencial Vista Verde",
  user = { name: "Renato", role: "Síndico profissional", initials: "RS" },
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

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
          {pages.map((p) => {
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

          <button type="button" className="condo-picker">
            <Building2 size={15} strokeWidth={2.25} />
            <span>{condoName}</span>
            <ChevronDown size={14} />
          </button>

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
