import React, { useState, useEffect } from "react";
import { useCondo } from "../context/CondoContext";
import FontesPagadorasAdmin from "../components/FontesPagadorasAdmin";

export default function CadastrosBasicos() {
  const [administradoras, setAdministradoras] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [planoContas, setPlanoContas] = useState([]);

  const [formAdmin, setFormAdmin] = useState({ nome: "", cnpj: "" });
  const [formCondo, setFormCondo] = useState({ administradora_id: "", nome: "", cnpj: "", cidade: "", uf: "" });

  const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : "http://localhost:8000/api/v1";

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      const [admRes, conRes] = await Promise.all([
        fetch(`${baseURL}/cadastros/administradoras`),
        fetch(`${baseURL}/cadastros/condominios`)
      ]);
      const admData = await admRes.json();
      const conData = await conRes.json();
      setAdministradoras(Array.isArray(admData) ? admData : admData?.data || []);
      setCondominios(Array.isArray(conData) ? conData : conData?.data || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    }
  };

  const handleSalvarAdmin = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${baseURL}/cadastros/administradoras`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formAdmin)
      });
      setFormAdmin({ nome: "", cnpj: "" });
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar administradora:", error);
    }
  };

  const handleDeletarAdmin = async (id) => {
    try {
      await fetch(`${baseURL}/cadastros/administradoras/${id}`, {
        method: "DELETE"
      });
      carregarDados();
    } catch (error) {
      console.error("Erro ao excluir administradora:", error);
    }
  };

  const handleSalvarCondo = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${baseURL}/cadastros/condominios`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formCondo)
      });
      setFormCondo({ administradora_id: "", nome: "", cnpj: "", cidade: "", uf: "" });
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar condomínio:", error);
    }
  };

  const handleDeletarCondo = async (id) => {
    try {
      await fetch(`${baseURL}/cadastros/condominios/${id}`, {
        method: "DELETE"
      });
      carregarDados();
    } catch (error) {
      console.error("Erro ao excluir condomínio:", error);
    }
  };

  const [activeTab, setActiveTab] = useState("administradoras");

  return (
    <div className="page" style={{ maxWidth: "1000px" }}>
      <div className="section-header">
        <h1 className="page__title text-center" style={{ margin: 0, textAlign: "center" }}>Cadastros Básicos</h1>
      </div>

      <div style={{ display: "flex", gap: "16px", marginBottom: "24px", borderBottom: "1px solid var(--line)" }}>
        <button 
          style={{ background: "transparent", border: "none", borderBottom: activeTab === 'administradoras' ? '2px solid var(--primary)' : '2px solid transparent', padding: "8px 16px", cursor: "pointer", fontWeight: activeTab === 'administradoras' ? '600' : '400', color: activeTab === 'administradoras' ? 'var(--primary)' : 'var(--slate)' }}
          onClick={() => setActiveTab('administradoras')}
        >
          Administradoras
        </button>
        <button 
          style={{ background: "transparent", border: "none", borderBottom: activeTab === 'condominios' ? '2px solid var(--primary)' : '2px solid transparent', padding: "8px 16px", cursor: "pointer", fontWeight: activeTab === 'condominios' ? '600' : '400', color: activeTab === 'condominios' ? 'var(--primary)' : 'var(--slate)' }}
          onClick={() => setActiveTab('condominios')}
        >
          Condomínios
        </button>
        <button 
          style={{ background: "transparent", border: "none", borderBottom: activeTab === 'fontes' ? '2px solid var(--primary)' : '2px solid transparent', padding: "8px 16px", cursor: "pointer", fontWeight: activeTab === 'fontes' ? '600' : '400', color: activeTab === 'fontes' ? 'var(--primary)' : 'var(--slate)' }}
          onClick={() => setActiveTab('fontes')}
        >
          Fontes Pagadoras
        </button>
      </div>

      <div className="w-full">
        {activeTab === 'administradoras' && (
          <div className="slip" style={{ padding: "24px", background: "var(--paper-card)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink)" }}>Administradoras</h2>
            <form onSubmit={handleSalvarAdmin} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <input 
                className="input"
                placeholder="Nome da Administradora"
                value={formAdmin.nome}
                onChange={(e) => setFormAdmin({ ...formAdmin, nome: e.target.value })}
                required
              />
              <input 
                className="input"
                placeholder="CNPJ"
                value={formAdmin.cnpj}
                onChange={(e) => setFormAdmin({ ...formAdmin, cnpj: e.target.value })}
              />
              <button type="submit" className="btn-primary" style={{ width: "fit-content", marginTop: "8px" }}>
                Salvar Administradora
              </button>
            </form>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {administradoras.filter(a => a.ativo).map(adm => (
                <li key={adm.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontWeight: "500", color: "var(--ink)" }}>{adm.nome}</span>
                  <button 
                    onClick={() => handleDeletarAdmin(adm.id)}
                    style={{ color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", fontWeight: "500" }}
                  >
                    Excluir
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {activeTab === 'condominios' && (
          <div className="slip" style={{ padding: "24px", background: "var(--paper-card)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "16px", color: "var(--ink)" }}>Condomínios</h2>
            <form onSubmit={handleSalvarCondo} style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
              <select 
                className="input"
                value={formCondo.administradora_id}
                onChange={(e) => setFormCondo({ ...formCondo, administradora_id: e.target.value })}
                required
              >
                <option value="">Selecione a Administradora</option>
                {administradoras.filter(a => a.ativo).map(adm => (
                  <option key={adm.id} value={adm.id}>{adm.nome}</option>
                ))}
              </select>
              <input 
                className="input"
                placeholder="Nome do Condomínio"
                value={formCondo.nome}
                onChange={(e) => setFormCondo({ ...formCondo, nome: e.target.value })}
                required
              />
              <input 
                className="input"
                placeholder="CNPJ"
                value={formCondo.cnpj}
                onChange={(e) => setFormCondo({ ...formCondo, cnpj: e.target.value })}
              />
              <button type="submit" className="btn-primary" style={{ width: "fit-content", marginTop: "8px" }}>
                Salvar Condomínio
              </button>
            </form>

            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {condominios.filter(c => c.ativo).map(condo => {
                const adm = administradoras.find(a => a.id === condo.administradora_id);
                return (
                  <li key={condo.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: "500", color: "var(--ink)" }}>{condo.nome}</span>
                      <span style={{ fontSize: "12px", color: "var(--slate)" }}>{adm?.nome}</span>
                    </div>
                    <button 
                      onClick={() => handleDeletarCondo(condo.id)}
                      style={{ color: "var(--danger)", background: "transparent", border: "none", cursor: "pointer", fontWeight: "500" }}
                    >
                      Excluir
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {activeTab === 'fontes' && (
          <div className="slip" style={{ padding: "24px", background: "var(--paper-card)" }}>
            <FontesPagadorasAdmin />
          </div>
        )}
      </div>
    </div>
  );
}

