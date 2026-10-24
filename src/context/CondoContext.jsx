/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";

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

  // Estados de Fontes Pagadoras (ADR-035 / RF-59, RF-60)
  const [fontesPagadoras, setFontesPagadoras] = useState([]);
  const [selectedFonteId, setSelectedFonteId] = useState(null);
  const [loadingFontes, setLoadingFontes] = useState(false);

  // Estados de Competências
  const [competencias, setCompetencias] = useState([]);
  const [mesAnoSelecionado, setMesAnoSelecionado] = useState(null);
  const [loadingCompetencias, setLoadingCompetencias] = useState(false);

  const [filtrosConciliacao, setFiltrosConciliacao] = useState([]);

  // Sincronização de reset de filtros na troca de condomínio sem efeito cascata
  const [prevCondoId, setPrevCondoId] = useState(selectedCondoId);
  if (prevCondoId !== selectedCondoId) {
    setPrevCondoId(selectedCondoId);
    setFiltrosConciliacao([]);
  }

  // Referência do condomínio ativo para prevenção de race conditions
  const activeCondoIdRef = useRef(selectedCondoId);
  useEffect(() => {
    activeCondoIdRef.current = selectedCondoId;
  }, [selectedCondoId]);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Fetch administradoras on mount
  useEffect(() => {
    async function fetchAdministradoras() {
      try {
        const response = await fetch(`${API_URL}/api/v1/contexto/administradoras`);
        if (response.ok) {
          const data = await response.json();
          data.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
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
  }, [API_URL, selectedAdmId]);

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
          data.sort((a, b) => (a.nome || "").localeCompare(b.nome || ""));
          setCondominios(data);

          // Se o condomínio atual não pertencer à nova administradora, reseta para o primeiro
          const existe = data.some((c) => c.id === selectedCondoId);
          if (data.length > 0 && (!existe || !selectedCondoId)) {
            const novoId = data[0].id;
            setSelectedCondoId(novoId);
            localStorage.setItem("condoflow_condo_id", novoId);
          } else if (data.length === 0) {
            setSelectedCondoId(null);
          }
          localStorage.setItem("condoflow_adm_id", selectedAdmId);
        }
      } catch (error) {
        console.error("Erro ao buscar condomínios", error);
      }
    }
    fetchCondominios();
  }, [selectedAdmId, selectedCondoId, API_URL]);

  // Busca assíncrona de fontes pagadoras bancárias (filtro estrito exige_conciliacao_extrato === true)
  const recarregarFontes = useCallback(async (condoId, fontePreferencial = null) => {
    if (!condoId) {
      setFontesPagadoras([]);
      setSelectedFonteId(null);
      setLoadingFontes(false);
      return;
    }
    setLoadingFontes(true);
    try {
      const resp = await fetch(`${API_URL}/api/v1/fontes-pagadoras/?condominio_id=${condoId}`);
      if (activeCondoIdRef.current !== condoId) return;

      if (resp.ok) {
        const data = await resp.json();
        const bancarias = Array.isArray(data)
          ? data.filter((f) => f.exige_conciliacao_extrato === true)
          : [];
        bancarias.sort((a, b) => (a.nome || a.banco || "").localeCompare(b.nome || b.banco || ""));
        setFontesPagadoras(bancarias);

        const savedId = localStorage.getItem(`condoflow_fonte_id_${condoId}`);
        if (fontePreferencial && bancarias.some((f) => f.id === fontePreferencial)) {
          setSelectedFonteId(fontePreferencial);
          localStorage.setItem(`condoflow_fonte_id_${condoId}`, fontePreferencial);
        } else if (savedId && bancarias.some((f) => f.id === savedId)) {
          setSelectedFonteId(savedId);
        } else if (bancarias.length > 0) {
          setSelectedFonteId(bancarias[0].id);
          localStorage.setItem(`condoflow_fonte_id_${condoId}`, bancarias[0].id);
        } else {
          setSelectedFonteId(null);
        }
      } else {
        setFontesPagadoras([]);
        setSelectedFonteId(null);
      }
    } catch (e) {
      if (activeCondoIdRef.current !== condoId) return;
      console.error("Erro ao carregar fontes pagadoras", e);
      setFontesPagadoras([]);
      setSelectedFonteId(null);
    } finally {
      if (activeCondoIdRef.current === condoId) {
        setLoadingFontes(false);
      }
    }
  }, [API_URL]);

  // Busca assíncrona de competências
  const recarregarCompetencias = useCallback(async (condoId, mesPreferencial = null) => {
    if (!condoId) {
      setCompetencias([]);
      setMesAnoSelecionado(null);
      setLoadingCompetencias(false);
      return;
    }
    setLoadingCompetencias(true);
    try {
      const resp = await fetch(`${API_URL}/api/v1/contexto/competencias?condominio_id=${condoId}`);
      if (activeCondoIdRef.current !== condoId) return;

      if (resp.ok) {
        const data = await resp.json();
        setCompetencias(data.competencias || []);
        if (mesPreferencial && data.competencias?.includes(mesPreferencial)) {
          setMesAnoSelecionado(mesPreferencial);
        } else {
          setMesAnoSelecionado(data.ultima_competencia || null);
        }
      } else {
        setCompetencias([]);
        setMesAnoSelecionado(null);
      }
    } catch (e) {
      if (activeCondoIdRef.current !== condoId) return;
      console.error("Erro ao carregar competencias", e);
      setCompetencias([]);
      setMesAnoSelecionado(null);
    } finally {
      if (activeCondoIdRef.current === condoId) {
        setLoadingCompetencias(false);
      }
    }
  }, [API_URL]);

  // Disparo concorrente paralelo sem waterfall na troca de condomínio (RNF-34)
  useEffect(() => {
    activeCondoIdRef.current = selectedCondoId;
    if (selectedCondoId) {
      recarregarCompetencias(selectedCondoId);
      recarregarFontes(selectedCondoId);
    } else {
      setCompetencias([]);
      setMesAnoSelecionado(null);
      setFontesPagadoras([]);
      setSelectedFonteId(null);
    }
  }, [selectedCondoId, recarregarCompetencias, recarregarFontes]);

  const handleSelectAdm = (admId) => {
    setSelectedAdmId(admId);
  };

  const handleSelectCondo = (condoId) => {
    setSelectedCondoId(condoId);
    localStorage.setItem("condoflow_condo_id", condoId);
  };

  const selectFonte = (fonteId) => {
    setSelectedFonteId(fonteId);
    if (selectedCondoId && fonteId) {
      localStorage.setItem(`condoflow_fonte_id_${selectedCondoId}`, fonteId);
    }
  };

  const selectMesAno = (valor) => {
    setMesAnoSelecionado(valor);
  };

  const currentAdm = administradoras.find((a) => a.id === selectedAdmId) || administradoras[0] || null;
  const currentCondo = condominios.find((c) => c.id === selectedCondoId) || condominios[0] || null;
  const currentFonte = fontesPagadoras.find((f) => f.id === selectedFonteId) || null;

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

        fontesPagadoras,
        selectedFonteId,
        currentFonte,
        loadingFontes,
        selectFonte,
        recarregarFontes,

        competencias,
        mesAnoSelecionado,
        loadingCompetencias,
        selectMesAno,
        recarregarCompetencias,

        filtrosConciliacao,
        setFiltrosConciliacao,
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
