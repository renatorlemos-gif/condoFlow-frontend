import React, { useState, useEffect } from "react";
import { useCondo } from "../context/CondoContext";
import { BookOpen, Plus, Trash2 } from "./layout/icons";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function FontesPagadorasAdmin() {
  const { selectedCondoId, selectedAdmId } = useCondo();
  const [planoContas, setPlanoContas] = useState([]);
  const [fontes, setFontes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [novaFonte, setNovaFonte] = useState({
    nome: "",
    tipo: "CONTA_BANCARIA",
    banco: "",
    agencia: "",
    conta: "",
    plano_conta_id: "",
    exige_conciliacao_extrato: true
  });

  useEffect(() => {
    if (selectedAdmId) {
      fetch(`${API_URL}/api/v1/plano-contas/?administradora_id=${selectedAdmId}`)
        .then(res => res.json())
        .then(data => setPlanoContas(data.data || []))
        .catch(err => console.error("Erro ao carregar plano de contas", err));
    }
  }, [selectedAdmId]);

  useEffect(() => {
    if (selectedCondoId) {
      carregarFontes();
    } else {
      setFontes([]);
    }
  }, [selectedCondoId]);

  const carregarFontes = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/v1/fontes-pagadoras/?condominio_id=${selectedCondoId}`);
      if (res.ok) {
        const data = await res.json();
        setFontes(data);
      }
    } catch (error) {
      console.error("Erro ao carregar fontes pagadoras", error);
    } finally {
      setLoading(false);
    }
  };

  const salvarFonte = async () => {
    if (!selectedCondoId) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/fontes-pagadoras/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...novaFonte, condominio_id: selectedCondoId })
      });
      if (res.ok) {
        alert("Fonte Pagadora cadastrada com sucesso!");
        setIsModalOpen(false);
        carregarFontes();
      } else {
        const err = await res.json();
        alert(err.detail || "Erro ao salvar fonte pagadora");
      }
    } catch (error) {
      console.error(error);
      alert("Erro de conexão");
    }
  };

  const inativarFonte = async (id) => {
    if (!confirm("Deseja inativar esta fonte pagadora?")) return;
    try {
      const res = await fetch(`${API_URL}/api/v1/fontes-pagadoras/${id}`, { method: "DELETE" });
      if (res.ok) {
        carregarFontes();
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: "600", color: "var(--ink)", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
          <BookOpen size={20} /> Gestão de Fontes Pagadoras
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary"
          style={{ display: "flex", alignItems: "center", gap: "8px" }}
        >
          <Plus size={16} /> Nova Fonte Pagadora
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--slate)" }}>Carregando...</p>
      ) : fontes.length === 0 ? (
        <div style={{ background: "#fff", border: "2px dashed var(--line)", borderRadius: "8px", padding: "48px", textAlign: "center", color: "var(--slate)" }}>
          Nenhuma fonte pagadora cadastrada para este condomínio.
        </div>
      ) : (
        <div style={{ background: "#fff", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)" }}>
          <table style={{ width: "100%", textAlign: "left", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--paper-card)", borderBottom: "1px solid var(--line)", color: "var(--ink-soft)", fontWeight: "600" }}>
                <th style={{ padding: "12px 16px" }}>Nome</th>
                <th style={{ padding: "12px 16px" }}>Tipo</th>
                <th style={{ padding: "12px 16px" }}>Banco/Ag/Cc</th>
                <th style={{ padding: "12px 16px" }}>Cód Contábil</th>
                <th style={{ padding: "12px 16px" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {fontes.map((f, i) => (
                <tr key={f.id} style={{ borderBottom: "1px solid var(--line)", background: i % 2 === 0 ? "#fff" : "#fbfcfc" }}>
                  <td style={{ padding: "12px 16px", fontWeight: "500", color: "var(--ink)" }}>{f.nome}</td>
                  <td style={{ padding: "12px 16px", color: "var(--slate)" }}>{f.tipo}</td>
                  <td style={{ padding: "12px 16px", color: "var(--slate)" }}>
                    {f.tipo === 'CONTA_BANCARIA' ? `${f.banco || '-'} / ${f.agencia || '-'} / ${f.conta || '-'}` : 'N/A'}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--slate)", fontFamily: "var(--mono)" }}>{(() => { const p = planoContas.find(x => x.id === f.plano_conta_id); return p ? p.codigo_contabil : f.plano_conta_id; })()}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button
                      onClick={() => inativarFonte(f.id)}
                      style={{ color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer" }}
                      title="Inativar"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50 }}>
          <div style={{ background: "#fff", borderRadius: "8px", width: "100%", maxWidth: "480px", overflow: "hidden", boxShadow: "0 10px 25px rgba(0,0,0,0.2)" }}>
            <div style={{ padding: "16px 24px", borderBottom: "1px solid var(--line)", background: "var(--paper-card)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "var(--ink)" }}>Nova Fonte Pagadora</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: "transparent", border: "none", fontSize: "20px", cursor: "pointer", color: "var(--slate)" }}>&times;</button>
            </div>
            
            <div style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--ink-soft)", marginBottom: "4px" }}>Nome</label>
                <input
                  type="text"
                  className="input"
                  style={{ width: "100%" }}
                  value={novaFonte.nome}
                  onChange={(e) => setNovaFonte({ ...novaFonte, nome: e.target.value })}
                  placeholder="Ex: Bradesco Principal"
                />
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--ink-soft)", marginBottom: "4px" }}>Tipo</label>
                <select
                  className="input"
                  style={{ width: "100%" }}
                  value={novaFonte.tipo}
                  onChange={(e) => setNovaFonte({ ...novaFonte, tipo: e.target.value })}
                >
                  <option value="CONTA_BANCARIA">Conta Bancária</option>
                  <option value="CAIXA_SINDICO">Caixa Síndico</option>
                  <option value="ADMINISTRADORA">Administradora</option>
                  <option value="OUTRO">Outro</option>
                </select>
              </div>
              
              {novaFonte.tipo === 'CONTA_BANCARIA' && (
                <div style={{ display: "grid", gridTemplateColumns: "3fr 1fr 2fr", gap: "8px" }}>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--ink-soft)", marginBottom: "4px" }}>Banco</label>
                    <input
                      type="text"
                      className="input"
                      style={{ width: "100%" }}
                      value={novaFonte.banco}
                      onChange={(e) => setNovaFonte({ ...novaFonte, banco: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--ink-soft)", marginBottom: "4px" }}>Agência</label>
                    <input
                      type="text"
                      className="input"
                      style={{ width: "100%" }}
                      value={novaFonte.agencia}
                      onChange={(e) => setNovaFonte({ ...novaFonte, agencia: e.target.value })}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--ink-soft)", marginBottom: "4px" }}>Conta</label>
                    <input
                      type="text"
                      className="input"
                      style={{ width: "100%" }}
                      value={novaFonte.conta}
                      onChange={(e) => setNovaFonte({ ...novaFonte, conta: e.target.value })}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: "block", fontSize: "13px", fontWeight: "500", color: "var(--ink-soft)", marginBottom: "4px" }}>Código Contábil (Alterdata)</label>
                <select
                  className="input"
                  style={{ width: "100%", fontFamily: "var(--mono)" }}
                  value={novaFonte.plano_conta_id}
                  onChange={(e) => setNovaFonte({ ...novaFonte, plano_conta_id: e.target.value })}
                >
                  <option value="">Selecione uma conta...</option>
                  {planoContas.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.codigo_contabil} - {p.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "8px" }}>
                <input
                  type="checkbox"
                  id="exige_conciliacao"
                  checked={novaFonte.exige_conciliacao_extrato}
                  onChange={(e) => setNovaFonte({ ...novaFonte, exige_conciliacao_extrato: e.target.checked })}
                />
                <label htmlFor="exige_conciliacao" style={{ fontSize: "13px", color: "var(--ink)" }}>Exige conciliação de extrato bancário</label>
              </div>
            </div>
            
            <div style={{ padding: "16px 24px", background: "var(--paper-card)", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid var(--line)" }}>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ padding: "8px 16px", background: "#fff", border: "1px solid var(--line)", borderRadius: "6px", cursor: "pointer", color: "var(--ink)" }}
              >
                Cancelar
              </button>
              <button
                onClick={salvarFonte}
                className="btn-primary"
              >
                Salvar Fonte Pagadora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
