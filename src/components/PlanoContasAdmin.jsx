import React, { useState, useEffect } from "react";
import { useCondo } from "../context/CondoContext";

export default function PlanoContasAdmin() {
  const { currentAdm } = useCondo();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");
  const [planoContas, setPlanoContas] = useState([]);

  const carregarPlanoContas = async () => {
    if (!currentAdm) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/plano-contas/?administradora_id=${currentAdm.id}`);
      if (res.ok) {
        const json = await res.json();
        setPlanoContas(json.data || []);
      }
    } catch (e) {
      console.error("Erro ao buscar plano de contas", e);
    }
  };

  useEffect(() => {
    carregarPlanoContas();
  }, [currentAdm]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErro("Selecione um arquivo CSV ou Excel.");
      return;
    }
    if (!currentAdm) {
      setErro("Nenhuma administradora selecionada.");
      return;
    }

    setLoading(true);
    setErro("");
    setMensagem("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("administradora_id", currentAdm.id);

    try {
      const res = await fetch("http://127.0.0.1:8000/api/plano-contas/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.detail || "Erro ao fazer upload do plano de contas.");
      }

      const data = await res.json();
      setMensagem(data.mensagem);
      setFile(null);
      carregarPlanoContas(); // recarrega a lista
    } catch (error) {
      setErro(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!currentAdm) {
    return (
      <div style={{ padding: "20px" }}>
        <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
          <p>Selecione uma administradora no topo para gerenciar o Plano de Contas.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2 style={{ marginBottom: "1rem" }}>Gestão do Plano de Contas - {currentAdm.nome}</h2>
      
      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)" }}>
        <h3>Importar Plano de Contas</h3>
        <p style={{ marginBottom: "1rem", color: "#666" }}>
          Faça upload de um arquivo CSV ou Excel contendo as colunas <strong>codigo</strong>, <strong>descricao</strong> e <strong>tipo</strong>.
        </p>

        <input 
          type="file" 
          accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
          onChange={handleFileChange}
          style={{ marginBottom: "1rem" }}
        />
        <br />
        
        <button 
          style={{ padding: "10px 20px", background: "#007BFF", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer", marginTop: "1rem" }}
          onClick={handleUpload}
          disabled={loading || !file}
        >
          {loading ? "Processando..." : "Fazer Upload"}
        </button>

        {erro && <p style={{ color: "red", marginTop: "1rem" }}>{erro}</p>}
        {mensagem && <p style={{ color: "green", marginTop: "1rem" }}>{mensagem}</p>}
      </div>

      <div style={{ background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0 2px 4px rgba(0,0,0,0.1)", marginTop: "1rem" }}>
        <h3>Plano de Contas Atual ({planoContas.length} contas)</h3>
        {planoContas.length > 0 ? (
          <div style={{ maxHeight: "400px", overflowY: "auto", marginTop: "1rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>
                  <th style={{ padding: "8px" }}>Código</th>
                  <th style={{ padding: "8px" }}>Descrição</th>
                  <th style={{ padding: "8px" }}>Tipo</th>
                </tr>
              </thead>
              <tbody>
                {planoContas.map((conta) => (
                  <tr key={conta.id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "8px" }}>{conta.codigo}</td>
                    <td style={{ padding: "8px" }}>{conta.descricao}</td>
                    <td style={{ padding: "8px" }}>{conta.tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p style={{ marginTop: "1rem", color: "#666" }}>Nenhuma conta encontrada para esta administradora.</p>
        )}
      </div>
    </div>
  );
}
