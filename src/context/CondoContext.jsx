import React, { createContext, useContext, useState, useEffect } from "react";

const CondoContext = createContext(null);



export function CondoProvider({ children }) {
  const [administradoras, setAdministradoras] = useState([]);
  const [selectedAdmId, setSelectedAdmId] = useState(() => {
    return localStorage.getItem("condoflow_adm_id") || null;
  });

  const [condominios, setCondominios] = useState([]);
  const [selectedCondoId, setSelectedCondoId] = useState(() => {
    return localStorage.getItem("condoflow_condo_id") || null;
  });

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Fetch administradoras on mount
  useEffect(() => {
    async function fetchAdministradoras() {
      try {
        const response = await fetch(`${API_URL}/api/v1/contexto/administradoras`);
        if (response.ok) {
          const data = await response.json();
          setAdministradoras(data);
          
          if (data.length > 0) {
            const admExists = data.some((a) => a.id === selectedAdmId);
            if (!admExists || !selectedAdmId) {
              setSelectedAdmId(data[0].id);
              localStorage.setItem("condoflow_adm_id", data[0].id);
            }
          }
        }
      } catch (error) {
        console.error("Erro ao buscar administradoras", error);
      }
    }
    fetchAdministradoras();
  }, []);

  // Atualiza a carteira de condomínios ao trocar a administradora
  useEffect(() => {
    async function fetchCondominios() {
      if (!selectedAdmId) {
        setCondominios([]);
        return;
      }
      try {
        const response = await fetch(`${API_URL}/api/v1/contexto/condominios?administradora_id=${selectedAdmId}`);
        if (response.ok) {
          const data = await response.json();
          setCondominios(data);

          // Se o condomínio atual não pertencer à nova administradora, reseta para o primeiro
          const existe = data.some((c) => c.id === selectedCondoId);
          if (data.length > 0 && (!existe || !selectedCondoId)) {
            const novoId = data[0].id;
            setSelectedCondoId(novoId);
            localStorage.setItem("condoflow_condo_id", novoId);
          }
          localStorage.setItem("condoflow_adm_id", selectedAdmId);
        }
      } catch (error) {
        console.error("Erro ao buscar condomínios", error);
      }
    }
    fetchCondominios();
  }, [selectedAdmId]);

  const handleSelectAdm = (admId) => {
    setSelectedAdmId(admId);
  };

  const handleSelectCondo = (condoId) => {
    setSelectedCondoId(condoId);
    localStorage.setItem("condoflow_condo_id", condoId);
  };

  const currentAdm = administradoras.find((a) => a.id === selectedAdmId) || administradoras[0];
  const currentCondo = condominios.find((c) => c.id === selectedCondoId) || condominios[0];

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
