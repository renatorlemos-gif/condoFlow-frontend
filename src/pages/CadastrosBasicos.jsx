import React, { useState, useEffect } from "react";

export default function CadastrosBasicos() {
  const [administradoras, setAdministradoras] = useState([]);
  const [condominios, setCondominios] = useState([]);

  const [formAdmin, setFormAdmin] = useState({ nome: "", cnpj: "" });
  const [formCondo, setFormCondo] = useState({ administradora_id: "", nome: "", cnpj: "", cidade: "", uf: "" });

  const baseURL = "http://localhost:8000/api/v1";

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
      setAdministradoras(admData);
      setCondominios(conData);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cadastros Básicos</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Administradoras */}
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-4">Administradoras</h2>
          <form onSubmit={handleSalvarAdmin} className="mb-4 flex flex-col gap-2">
            <input 
              className="border p-2 rounded"
              placeholder="Nome da Administradora"
              value={formAdmin.nome}
              onChange={(e) => setFormAdmin({ ...formAdmin, nome: e.target.value })}
              required
            />
            <input 
              className="border p-2 rounded"
              placeholder="CNPJ"
              value={formAdmin.cnpj}
              onChange={(e) => setFormAdmin({ ...formAdmin, cnpj: e.target.value })}
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Salvar Administradora
            </button>
          </form>

          <ul>
            {administradoras.filter(a => a.ativo).map(adm => (
              <li key={adm.id} className="flex justify-between items-center border-b p-2">
                <span>{adm.nome}</span>
                <button 
                  onClick={() => handleDeletarAdmin(adm.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Condomínios */}
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-4">Condomínios</h2>
          <form onSubmit={handleSalvarCondo} className="mb-4 flex flex-col gap-2">
            <select 
              className="border p-2 rounded"
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
              className="border p-2 rounded"
              placeholder="Nome do Condomínio"
              value={formCondo.nome}
              onChange={(e) => setFormCondo({ ...formCondo, nome: e.target.value })}
              required
            />
            <input 
              className="border p-2 rounded"
              placeholder="CNPJ"
              value={formCondo.cnpj}
              onChange={(e) => setFormCondo({ ...formCondo, cnpj: e.target.value })}
            />
            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Salvar Condomínio
            </button>
          </form>

          <ul>
            {condominios.filter(c => c.ativo).map(cond => (
              <li key={cond.id} className="flex justify-between items-center border-b p-2">
                <span>{cond.nome}</span>
                <button 
                  onClick={() => handleDeletarCondo(cond.id)}
                  className="text-red-600 hover:text-red-800"
                >
                  Excluir
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
