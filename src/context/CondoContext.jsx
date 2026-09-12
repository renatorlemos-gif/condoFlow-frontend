import React, { createContext, useContext, useState, useEffect } from "react";

const CondoContext = createContext(null);

const DEFAULT_ADMINISTRADORAS = [
  {
    id: "adm-alpha",
    nome: "Administradora Alpha Condomínios",
    total_condominios: 3,
  },
  {
    id: "adm-beta",
    nome: "Administradora Beta Gestão Predial",
    total_condominios: 2,
  },
];

const DEFAULT_CONDOMINIOS = [
  {
    id: "condo-alpha-01",
    administradora_id: "adm-alpha",
    nome: "Residencial Vista Verde",
    cidade: "São Paulo",
    uf: "SP",
  },
  {
    id: "condo-alpha-02",
    administradora_id: "adm-alpha",
    nome: "Condomínio Edifício Solar das Acácias",
    cidade: "São Paulo",
    uf: "SP",
  },
  {
    id: "condo-alpha-03",
    administradora_id: "adm-alpha",
    nome: "Parque das Flores Residencial",
    cidade: "Campinas",
    uf: "SP",
  },
  {
    id: "condo-beta-01",
    administradora_id: "adm-beta",
    nome: "Edifício Metropolitan Plaza",
    cidade: "Santos",
    uf: "SP",
  },
  {
    id: "condo-beta-02",
    administradora_id: "adm-beta",
    nome: "Residencial Jardins do Bosque",
    cidade: "São Bernardo do Campo",
    uf: "SP",
  },
];

export function CondoProvider({ children }) {
  const [administradoras, setAdministradoras] = useState(DEFAULT_ADMINISTRADORAS);
  const [selectedAdmId, setSelectedAdmId] = useState(() => {
    return localStorage.getItem("condoflow_adm_id") || DEFAULT_ADMINISTRADORAS[0].id;
  });

  const [condominios, setCondominios] = useState([]);
  const [selectedCondoId, setSelectedCondoId] = useState(() => {
    return localStorage.getItem("condoflow_condo_id") || "condo-alpha-01";
  });

  // Atualiza a carteira de condomínios ao trocar a administradora
  useEffect(() => {
    const filtrados = DEFAULT_CONDOMINIOS.filter(
      (c) => c.administradora_id === selectedAdmId
    );
    setCondominios(filtrados);

    // Se o condomínio atual não pertencer à nova administradora, reseta para o primeiro
    const existe = filtrados.some((c) => c.id === selectedCondoId);
    if (!existe && filtrados.length > 0) {
      const novoId = filtrados[0].id;
      setSelectedCondoId(novoId);
      localStorage.setItem("condoflow_condo_id", novoId);
    }
    localStorage.setItem("condoflow_adm_id", selectedAdmId);
  }, [selectedAdmId]);

  const handleSelectAdm = (admId) => {
    setSelectedAdmId(admId);
  };

  const handleSelectCondo = (condoId) => {
    setSelectedCondoId(condoId);
    localStorage.setItem("condoflow_condo_id", condoId);
  };

  const currentAdm = administradoras.find((a) => a.id === selectedAdmId) || administradoras[0];
  const currentCondo = condominios.find((c) => c.id === selectedCondoId) || condominios[0] || {
    id: "condo-alpha-01",
    nome: "Residencial Vista Verde",
  };

  return (
    <CondoContext.Provider
      value={{
        administradoras,
        selectedAdmId,
        currentAdm,
        selectAdm: handleSelectAdm,

        condominios,
        selectedCondoId,
        currentCondo,
        selectCondo: handleSelectCondo,
      }}
    >
      {children}
    </CondoContext.Provider>
  );
}

export function useCondo() {
  const ctx = useContext(CondoContext);
  if (!ctx) {
    throw new Error("useCondo deve ser utilizado dentro de um CondoProvider");
  }
  return ctx;
}
