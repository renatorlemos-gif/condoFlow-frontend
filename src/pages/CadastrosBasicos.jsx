import React, { useState, useEffect } from "react";
import { useCondo } from "../context/CondoContext";

export default function CadastrosBasicos() {
  const [administradoras, setAdministradoras] = useState([]);
  const [condominios, setCondominios] = useState([]);
  const [contasBancarias, setContasBancarias] = useState([]);
  const [planoContas, setPlanoContas] = useState([]);

  const [formAdmin, setFormAdmin] = useState({ nome: "", cnpj: "" });
  const [formCondo, setFormCondo] = useState({ administradora_id: "", nome: "", cnpj: "", cidade: "", uf: "" });
  const [formConta, setFormConta] = useState({ condominio_id: "", banco: "", agencia: "", conta: "", plano_conta_id: "" });

  const baseURL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api/v1` : "http://localhost:8000/api/v1";

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    if (formConta.condominio_id) {
      const condo = condominios.find(c => c.id === formConta.condominio_id);
      if (condo && condo.administradora_id) {
        fetch(`${baseURL}/plano-contas?administradora_id=${condo.administradora_id}`)
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data.data)) {
              setPlanoContas(data.data);
            } else if (Array.isArray(data)) {
              setPlanoContas(data);
            } else {
              setPlanoContas([]);
            }
          })
          .catch(err => console.error(err));
      } else {
        setPlanoContas([]);
      }
    } else {
      setPlanoContas([]);
    }
  }, [formConta.condominio_id, condominios]);

  const carregarDados = async () => {
    try {
      const [admRes, conRes, cbRes] = await Promise.all([
        fetch(`${baseURL}/cadastros/administradoras`),
        fetch(`${baseURL}/cadastros/condominios`),
        fetch(`${baseURL}/cadastros/contas-bancarias`)
      ]);
      const admData = await admRes.json();
      const conData = await conRes.json();
      const cbData = await cbRes.json();
      setAdministradoras(admData);
      setCondominios(conData);
      setContasBancarias(cbData);
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

  const handleSalvarConta = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${baseURL}/cadastros/contas-bancarias`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formConta)
      });
      setFormConta({ condominio_id: "", banco: "", agencia: "", conta: "", plano_conta_id: "" });
      carregarDados();
    } catch (error) {
      console.error("Erro ao salvar conta bancária:", error);
    }
  };

  const handleDeletarConta = async (id) => {
    try {
      await fetch(`${baseURL}/cadastros/contas-bancarias/${id}`, {
        method: "DELETE"
      });
      carregarDados();
    } catch (error) {
      console.error("Erro ao excluir conta bancária:", error);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Cadastros Básicos</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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
            {condominios.filter(c => c.ativo).map(condo => {
              const adm = administradoras.find(a => a.id === condo.administradora_id);
              return (
                <li key={condo.id} className="flex justify-between items-center border-b p-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">{condo.nome}</span>
                    <span className="text-xs text-gray-500">{adm?.nome}</span>
                  </div>
                  <button 
                    onClick={() => handleDeletarCondo(condo.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Excluir
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Contas Bancárias */}
        <div className="bg-white p-4 shadow rounded">
          <h2 className="text-xl font-semibold mb-4">Contas Bancárias</h2>
          <form onSubmit={handleSalvarConta} className="mb-4 flex flex-col gap-2">
            <select 
              className="border p-2 rounded"
              value={formConta.condominio_id}
              onChange={(e) => setFormConta({ ...formConta, condominio_id: e.target.value })}
              required
            >
              <option value="">Selecione o Condomínio</option>
              {condominios.filter(c => c.ativo).map(condo => (
                <option key={condo.id} value={condo.id}>{condo.nome}</option>
              ))}
            </select>

            <input 
              className="border p-2 rounded"
              placeholder="Banco (Ex: Itaú)"
              value={formConta.banco}
              onChange={(e) => setFormConta({ ...formConta, banco: e.target.value })}
              required
            />
            <div className="flex gap-2">
              <input 
                className="border p-2 rounded w-1/2"
                placeholder="Agência"
                value={formConta.agencia}
                onChange={(e) => setFormConta({ ...formConta, agencia: e.target.value })}
                required
              />
              <input 
                className="border p-2 rounded w-1/2"
                placeholder="Conta"
                value={formConta.conta}
                onChange={(e) => setFormConta({ ...formConta, conta: e.target.value })}
                required
              />
            </div>

            <select 
              className="border p-2 rounded"
              value={formConta.plano_conta_id}
              onChange={(e) => setFormConta({ ...formConta, plano_conta_id: e.target.value })}
              required
              disabled={!formConta.condominio_id}
            >
              {!formConta.condominio_id ? (
                <option value="">Selecione o Condomínio primeiro...</option>
              ) : planoContas.length === 0 ? (
                <option value="">Nenhuma conta devedora encontrada</option>
              ) : (
                <>
                  <option value="">Selecione a Conta Devedora</option>
                  {planoContas.map(pc => (
                    <option key={pc.id} value={pc.id}>{pc.codigo} - {pc.descricao}</option>
                  ))}
                </>
              )}
            </select>

            <button type="submit" className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
              Salvar Conta Bancária
            </button>
          </form>

          <ul>
            {contasBancarias.filter(c => c.ativo).map(conta => {
              const condo = condominios.find(cd => cd.id === conta.condominio_id);
              return (
                <li key={conta.id} className="flex justify-between items-center border-b p-2">
                  <div className="flex flex-col">
                    <span className="font-semibold">{conta.banco} - Ag: {conta.agencia} CC: {conta.conta}</span>
                    <span className="text-xs text-gray-500">{condo?.nome}</span>
                  </div>
                  <button 
                    onClick={() => handleDeletarConta(conta.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Excluir
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </div>
  );
}
