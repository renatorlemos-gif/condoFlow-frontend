import { useState } from "react";
import { Building2, ChevronDown, Menu, X } from "./icons";
import { useCondo } from "../../context/CondoContext";
import "../../styles/theme.css";

const ADMIN_IDS = ["cadastros-basicos", "plano-contas", "balancetes-historicos"];

function formatMesAno(isoString) {
  if (!isoString) return "";
  const [yyyy, mm] = isoString.split("-");
  const date = new Date(Number(yyyy), Number(mm) - 1, 1);
  const mes = date.toLocaleDateString("pt-BR", { month: "long" });
  return `${mes.charAt(0).toUpperCase() + mes.slice(1)} ${yyyy}`;
}

export default function AppShell({
  pages,
  currentPageId,
  onNavigate,
  user = { name: "Renato Costa", role: "Analista Contábil", initials: "RC" },
  children,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const {
    administradoras,
    selectedAdmId,
    selectAdm,
    condominios,
    selectedCondoId,
    selectCondo,
    fontesPagadoras,
    selectedFonteId,
    loadingFontes,
    selectFonte,
    competencias,
    mesAnoSelecionado,
    loadingCompetencias,
    selectMesAno,
  } = useCondo();

  const opPages = pages.filter((p) => !ADMIN_IDS.includes(p.id));
  const adminPages = pages.filter((p) => ADMIN_IDS.includes(p.id));

  // Acordeão Exclusivo: apenas uma seção aberta por vez ('operacao' | 'administracao')
  const [prevPageId, setPrevPageId] = useState(currentPageId);
  const [expandedSection, setExpandedSection] = useState(() =>
    ADMIN_IDS.includes(currentPageId) ? "administracao" : "operacao"
  );

  // Sincronização inteligente com a rota ativa durante render
  if (prevPageId !== currentPageId) {
    setPrevPageId(currentPageId);
    setExpandedSection(ADMIN_IDS.includes(currentPageId) ? "administracao" : "operacao");
  }

  const toggleSection = (section) => {
    setExpandedSection((prev) => (prev === section ? prev : section));
  };

  return (
    <div className="app">
      {/* Scrim Mobile */}
      {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} />}

      {/* ---------------- Sidebar Redesenhada ---------------- */}
      <aside className={`sidebar ${menuOpen ? "sidebar--open" : ""}`}>
        {/* Marca / Identidade */}
        <div className="sidebar__brand">
          <span className="sidebar__mark">
            <Building2 size={20} strokeWidth={2.25} />
          </span>
          <div className="sidebar__brandtext">
            <span className="sidebar__name">CondoFlow</span>
            <span className="sidebar__tag">Administração de Condomínios</span>
          </div>
          <button
            type="button"
            className="sidebar__close-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Fechar menu lateral"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegação e Acordeão Exclusivo (Single-Expanded Accordion) */}
        <nav className="sidebar__nav">
          {/* SEÇÃO OPERAÇÃO */}
          <button
            type="button"
            className={`sidebar__accordion-header ${
              expandedSection === "operacao" ? "sidebar__accordion-header--active" : ""
            }`}
            onClick={() => toggleSection("operacao")}
            aria-expanded={expandedSection === "operacao"}
          >
            <span>Operação</span>
            <ChevronDown
              size={14}
              style={{
                transform: expandedSection === "operacao" ? "rotate(180deg)" : "none",
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </button>

          {expandedSection === "operacao" && (
            <div className="sidebar__accordion-content">
              {/* Bloco Superior: Contexto Operacional (Carteira Ativa) */}
              <div className="sidebar__context-box">
                <div className="sidebar__context-header">
                  <span className="sidebar__context-title">Contexto Operacional</span>
                  <span className="sidebar__context-badge">Ativo</span>
                </div>

                {/* 1. Administradora */}
                <div className="sidebar__field">
                  <label className="sidebar__field-label" htmlFor="sidebar-adm">
                    🏢 Administradora
                  </label>
                  <select
                    id="sidebar-adm"
                    className="sidebar__select"
                    value={selectedAdmId || ""}
                    onChange={(e) => selectAdm(e.target.value)}
                  >
                    {[...administradoras]
                      .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
                      .map((adm) => (
                        <option key={adm.id} value={adm.id}>
                          {adm.nome}
                        </option>
                      ))}
                  </select>
                </div>

                {/* 2. Condomínio */}
                <div className="sidebar__field">
                  <label className="sidebar__field-label" htmlFor="sidebar-condo">
                    📍 Condomínio
                  </label>
                  <select
                    id="sidebar-condo"
                    className="sidebar__select"
                    value={selectedCondoId || ""}
                    onChange={(e) => selectCondo(e.target.value)}
                    disabled={condominios.length === 0}
                  >
                    {condominios.length === 0 ? (
                      <option value="">Sem condomínios</option>
                    ) : (
                      [...condominios]
                        .sort((a, b) => (a.nome || "").localeCompare(b.nome || ""))
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nome}
                          </option>
                        ))
                    )}
                  </select>
                </div>

                {/* 3. Fonte Pagadora (Novo Seletor Global) */}
                <div className="sidebar__field">
                  <label className="sidebar__field-label" htmlFor="sidebar-fonte">
                    🏦 Fonte Pagadora
                  </label>
                  <select
                    id="sidebar-fonte"
                    className={`sidebar__select ${
                      fontesPagadoras.length === 0 && !loadingFontes
                        ? "sidebar__select--empty-warning"
                        : ""
                    }`}
                    value={selectedFonteId || ""}
                    onChange={(e) => selectFonte(e.target.value)}
                    disabled={loadingFontes || fontesPagadoras.length === 0}
                  >
                    {loadingFontes ? (
                      <option value="">Carregando contas...</option>
                    ) : fontesPagadoras.length === 0 ? (
                      <option value="">⚠️ Nenhuma fonte bancária</option>
                    ) : (
                      fontesPagadoras.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.banco} ({f.agencia} | {f.conta})
                        </option>
                      ))
                    )}
                  </select>
                </div>

                {/* 4. Competência */}
                <div className="sidebar__field">
                  <label className="sidebar__field-label" htmlFor="sidebar-comp">
                    📅 Competência
                  </label>
                  <select
                    id="sidebar-comp"
                    className="sidebar__select"
                    value={mesAnoSelecionado || ""}
                    onChange={(e) => selectMesAno(e.target.value)}
                    disabled={loadingCompetencias || competencias.length === 0}
                  >
                    {loadingCompetencias ? (
                      <option value="">Carregando...</option>
                    ) : competencias.length === 0 ? (
                      <option value="">Sem extrato importado</option>
                    ) : (
                      competencias.map((comp) => (
                        <option key={comp} value={comp}>
                          {formatMesAno(comp)}
                        </option>
                      ))
                    )}
                  </select>
                </div>
              </div>

              {/* Linha Divisória Sutil */}
              <div className="sidebar__divider" />

              {/* Ações da Operação */}
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
            </div>
          )}

          {/* SEÇÃO ADMINISTRAÇÃO */}
          <button
            type="button"
            className={`sidebar__accordion-header ${
              expandedSection === "administracao" ? "sidebar__accordion-header--active" : ""
            }`}
            onClick={() => toggleSection("administracao")}
            aria-expanded={expandedSection === "administracao"}
            style={{ marginTop: 12 }}
          >
            <span>Administração</span>
            <ChevronDown
              size={14}
              style={{
                transform: expandedSection === "administracao" ? "rotate(180deg)" : "none",
                transition: "transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
              }}
            />
          </button>

          {expandedSection === "administracao" && (
            <div className="sidebar__accordion-content">
              {adminPages.map((p) => {
                const Icon = p.icon;
                const isCurrent = p.id === currentPageId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`nav-item nav-item--admin ${isCurrent ? "nav-item--active" : ""}`}
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
            </div>
          )}
        </nav>

        {/* Rodapé da Sidebar: Chip do Usuário com Separador Sutil */}
        <div className="sidebar__footer">
          <div className="user-chip" title={`${user.name} (${user.role})`}>
            <span className="user-chip__avatar">{user.initials}</span>
            <div className="user-chip__meta">
              <span className="user-chip__name">{user.name}</span>
              <span className="user-chip__role">{user.role}</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ---------------- Main Content (100% Vertical Space em Desktop) ---------------- */}
      <div className="main">
        {/* Botão flutuante discreto visível apenas em mobile (<= 860px) */}
        <button
          type="button"
          className="mobile-menu-toggle"
          onClick={() => setMenuOpen(true)}
          aria-label="Abrir menu"
        >
          <Menu size={20} />
        </button>

        {children}
      </div>
    </div>
  );
}
