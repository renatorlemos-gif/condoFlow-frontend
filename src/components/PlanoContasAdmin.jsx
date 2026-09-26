import React, { useState, useEffect, useMemo } from "react";
import { useCondo } from "../context/CondoContext";

function ModalConta({ open, onClose, onSave, loading, conta, erro, isEdit }) {
  const [codigo, setCodigo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [contexto, setContexto] = useState("");

  useEffect(() => {
    if (conta) {
      setCodigo(conta.codigo || "");
      setDescricao(conta.descricao || "");
      setContexto(conta.contexto || "");
    } else {
      setCodigo("");
      setDescricao("");
      setContexto("");
    }
  }, [conta]);

  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(16,27,48,0.45)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div className="slip" style={{ width: "400px", maxWidth: "90%" }}>
        <h3 className="section-title">{isEdit ? "Editar Contexto da Conta" : "Nova Conta Contábil"}</h3>
        
        {erro && (
          <div className="feedback feedback--error" style={{ marginBottom: "16px" }}>
            <span>⚠️ {erro}</span>
          </div>
        )}

        <div className="field" style={{ marginBottom: "12px" }}>
          <label className="field__label">Código Contábil</label>
          <input 
            type="text" 
            className="input" 
            value={codigo} 
            onChange={(e) => setCodigo(e.target.value)}
            disabled={isEdit}
            readOnly={isEdit}
            style={isEdit ? { background: "var(--paper)", color: "var(--slate)" } : {}}
            placeholder="Ex: 1.01.001"
          />
        </div>

        <div className="field" style={{ marginBottom: "12px" }}>
          <label className="field__label">Descrição</label>
          <input 
            type="text" 
            className="input" 
            value={descricao} 
            onChange={(e) => setDescricao(e.target.value)}
            disabled={isEdit}
            readOnly={isEdit}
            style={isEdit ? { background: "var(--paper)", color: "var(--slate)" } : {}}
            placeholder="Ex: Taxas Bancárias"
          />
        </div>

        <div className="field" style={{ marginBottom: "16px" }}>
          <label className="field__label">Contexto Semântico RAG</label>
          <textarea 
            className="input textarea" 
            value={contexto} 
            onChange={(e) => setContexto(e.target.value)}
            placeholder="Descreva as regras para a IA classificar nesta conta..."
            rows={4}
          />
        </div>

        <div className="slip__actions" style={{ marginTop: "24px" }}>
          <button className="btn-secondary" onClick={onClose} disabled={loading} style={{ flex: 1 }}>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={() => onSave({ codigo, descricao, contexto })} 
            disabled={loading || !codigo || !descricao || !contexto}
          >
            {loading ? "Vetorizando Regras de IA..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ModalConfirmacaoExclusao({ open, onClose, onConfirm, loading }) {
  if (!open) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(16,27,48,0.45)", zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center"
    }}>
      <div className="slip" style={{ width: "400px", maxWidth: "90%", borderTop: "4px solid var(--red)" }}>
        <h3 className="section-title" style={{ color: "var(--red)" }}>⚠️ Excluir Conta Contábil</h3>
        
        <p style={{ fontSize: "13px", color: "var(--red)", lineHeight: 1.5, background: "var(--red-tint)", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
          Esta ação irá inativar a conta e remover suas regras semânticas de IA. O histórico contábil vinculado será preservado.
        </p>

        <div className="slip__actions">
          <button className="btn-secondary" onClick={onClose} disabled={loading} style={{ flex: 1 }}>
            Cancelar
          </button>
          <button 
            className="btn-primary" 
            onClick={onConfirm} 
            disabled={loading}
            style={{ background: "var(--red)", flex: 1 }}
          >
            {loading ? "Excluindo..." : "Excluir Conta"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PlanoContasAdmin() {
  const { currentAdm } = useCondo();
  const [planoContas, setPlanoContas] = useState([]);
  const [busca, setBusca] = useState("");
  const [carregandoListagem, setCarregandoListagem] = useState(false);

  // Estados dos modais
  const [modalContaOpen, setModalContaOpen] = useState(false);
  const [modalExclusaoOpen, setModalExclusaoOpen] = useState(false);
  const [contaSelecionada, setContaSelecionada] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loadingAcao, setLoadingAcao] = useState(false);
  const [erroModal, setErroModal] = useState("");
  const [toast, setToast] = useState("");

  const API = () => import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  const carregarPlanoContas = React.useCallback(async () => {
    if (!currentAdm) return;
    setCarregandoListagem(true);
    try {
      const res = await fetch(`${API()}/api/v1/plano-contas/?administradora_id=${currentAdm.id}`);
      if (res.ok) {
        const json = await res.json();
        setPlanoContas(json.data || []);
      }
    } catch (e) {
      console.error("Erro ao buscar plano de contas", e);
    } finally {
      setCarregandoListagem(false);
    }
  }, [currentAdm]);

  useEffect(() => {
    carregarPlanoContas();
  }, [carregarPlanoContas]);

  const contasFiltradas = useMemo(() => {
    if (!busca.trim()) return planoContas;
    const term = busca.toLowerCase();
    return planoContas.filter(
      c => c.codigo.toLowerCase().includes(term) || c.descricao.toLowerCase().includes(term)
    );
  }, [planoContas, busca]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleOpenNovaConta = () => {
    setContaSelecionada(null);
    setIsEditMode(false);
    setErroModal("");
    setModalContaOpen(true);
  };

  const handleOpenEditar = (conta) => {
    setContaSelecionada(conta);
    setIsEditMode(true);
    setErroModal("");
    setModalContaOpen(true);
  };

  const handleOpenExcluir = (conta) => {
    setContaSelecionada(conta);
    setModalExclusaoOpen(true);
  };

  const handleSalvarConta = async (dados) => {
    setLoadingAcao(true);
    setErroModal("");

    try {
      let url = `${API()}/api/v1/plano-contas/`;
      let method = "POST";
      let body = {
        administradora_id: currentAdm.id,
        codigo: dados.codigo,
        descricao: dados.descricao,
        contexto: dados.contexto
      };

      if (isEditMode) {
        url = `${API()}/api/v1/plano-contas/${contaSelecionada.id}/contexto`;
        method = "PATCH";
        body = { contexto: dados.contexto };
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao salvar conta.");
      }

      showToast(isEditMode ? "Contexto atualizado com sucesso!" : "Conta criada com sucesso!");
      setModalContaOpen(false);
      carregarPlanoContas(); // Refresh sutil

    } catch (err) {
      setErroModal(err.message);
    } finally {
      setLoadingAcao(false);
    }
  };

  const handleConfirmarExclusao = async () => {
    if (!contaSelecionada) return;
    setLoadingAcao(true);
    try {
      const res = await fetch(`${API()}/api/v1/plano-contas/${contaSelecionada.id}`, {
        method: "DELETE"
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao inativar conta.");
      }

      // Remover reativamente da listagem sem reload
      setPlanoContas(prev => prev.filter(c => c.id !== contaSelecionada.id));
      showToast("Conta Excluída com Sucesso e Removida dos Motores RAG");
      setModalExclusaoOpen(false);
    } catch (err) {
      alert(err.message);
    } finally {
      setLoadingAcao(false);
    }
  };

  const formatDate = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    return `${d.toLocaleDateString("pt-BR")} ${d.toLocaleTimeString("pt-BR", {hour: '2-digit', minute:'2-digit'})}`;
  };

  if (!currentAdm) {
    return (
      <div className="page" style={{ maxWidth: "1000px" }}>
        <div className="slip" style={{ textAlign: "center", padding: "40px" }}>
          <h2 className="section-title">Sem Administradora</h2>
          <p style={{ color: "var(--slate)" }}>
            Por favor, selecione uma administradora no topo para gerenciar seu Plano de Contas Global.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="page" style={{ maxWidth: "1000px" }}>
      
      {/* Banner / Badge Informativo */}
      <div style={{
        background: "var(--navy-900)",
        color: "#dfe6f2",
        padding: "16px 20px",
        borderRadius: "10px",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
      }}>
        <div style={{ fontSize: "24px" }}>🏢</div>
        <div>
          <h2 style={{ fontSize: "15px", fontWeight: "600", color: "#fff", margin: 0 }}>
            Plano de Contas Global — {currentAdm.nome}
          </h2>
          <p style={{ fontSize: "13px", margin: "4px 0 0", color: "#aab6d1" }}>
            Aplica-se a todos os condomínios da carteira
          </p>
        </div>
      </div>

      <div className="section-header">
        <h2 className="page__title" style={{ margin: 0 }}>Plano de Contas</h2>
        <button className="btn-primary" onClick={handleOpenNovaConta} style={{ flex: "none" }}>
          + Nova Conta
        </button>
      </div>

      {/* Toolbar (Pesquisa) */}
      <div className="slip" style={{ padding: "16px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "16px" }}>
        <input 
          type="text"
          className="input"
          placeholder="Pesquisar por código ou descrição..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          style={{ flex: 1 }}
        />
        <div style={{ fontSize: "12px", color: "var(--slate)", whiteSpace: "nowrap", fontFamily: "var(--font-mono)" }}>
          Exibindo {contasFiltradas.length} de {planoContas.length} contas
        </div>
      </div>

      {/* Tabela Livro-Razão */}
      <div className="slip" style={{ padding: "0", overflow: "hidden" }}>
        {contasFiltradas.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--paper)", borderBottom: "1.5px solid var(--line)" }}>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--ink-soft)" }}>Código</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--ink-soft)" }}>Descrição</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--ink-soft)" }}>Contexto Semântico RAG</th>
                <th style={{ padding: "12px 16px", fontWeight: "600", color: "var(--ink-soft)", textAlign: "center" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {contasFiltradas.map((conta, index) => (
                <tr key={conta.id} style={{ 
                  borderBottom: "1px solid var(--line)", 
                  background: index % 2 === 0 ? "var(--paper-card)" : "#fbfcfc" 
                }}>
                  <td style={{ padding: "12px 16px", fontWeight: "500", fontFamily: "'IBM Plex Mono', monospace" }}>
                    {conta.codigo}
                  </td>
                  <td style={{ padding: "12px 16px", fontWeight: "500", color: "var(--ink)" }}>
                    {conta.descricao}
                  </td>
                  <td style={{ padding: "12px 16px", maxWidth: "300px" }}>
                    <div 
                      title={conta.contexto} 
                      style={{ 
                        display: "-webkit-box", 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: "vertical", 
                        overflow: "hidden",
                        color: "var(--ink-soft)",
                        lineHeight: 1.4
                      }}
                    >
                      {conta.contexto || "Sem contexto"}
                    </div>
                    {conta.updated_at && (
                      <div style={{ fontSize: "11px", color: "var(--slate)", marginTop: "4px", opacity: 0.8 }}>
                        Últ. atualização: {formatDate(conta.updated_at)} {conta.criada_por_ia ? "por IA" : "por Usuário"}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "center" }}>
                    <button 
                      onClick={() => handleOpenEditar(conta)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px", marginRight: "8px" }}
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => handleOpenExcluir(conta)}
                      style={{ background: "transparent", border: "none", cursor: "pointer", fontSize: "16px" }}
                      title="Excluir"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div style={{ padding: "40px", textAlign: "center" }}>
            <p style={{ color: "var(--slate)", fontSize: "14px" }}>
              Nenhuma conta contábil encontrada para o termo pesquisado. Revise o filtro ou clique em + Nova Conta.
            </p>
          </div>
        )}
      </div>

      <ModalConta 
        open={modalContaOpen} 
        onClose={() => setModalContaOpen(false)} 
        onSave={handleSalvarConta} 
        loading={loadingAcao} 
        conta={contaSelecionada} 
        isEdit={isEditMode}
        erro={erroModal}
      />

      <ModalConfirmacaoExclusao 
        open={modalExclusaoOpen} 
        onClose={() => setModalExclusaoOpen(false)} 
        onConfirm={handleConfirmarExclusao} 
        loading={loadingAcao} 
      />

      {/* Toast Notifier */}
      {toast && (
        <div style={{
          position: "fixed", bottom: "24px", right: "24px",
          background: "var(--ledger)", color: "#fff",
          padding: "12px 20px", borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
          fontWeight: "500", zIndex: 1000,
          animation: "stampIn 0.3s ease-out"
        }}>
          {toast}
        </div>
      )}

    </div>
  );
}
