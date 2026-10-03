import React, { useState } from "react";
import { CondoProvider } from "./context/CondoContext";
import AppShell from "./components/layout/AppShell";
import ExtratoUploader from "./components/ExtratoUploader";
import CapturarDespesas from "./components/CapturarDespesas";
import ValidarDespesas from "./components/ValidarDespesas";
import ConciliarDespesas from "./components/ConciliarDespesas";
import PlanoContasAdmin from "./components/PlanoContasAdmin";
import BalanceteUploader from "./components/BalanceteUploader";
import CadastrosBasicos from "./pages/CadastrosBasicos";
import FechamentoContabil from "./components/FechamentoContabil";
import { FileSpreadsheet, ImageIcon, ClipboardCheck, GitMerge, BookOpen, Download, Wallet } from "./components/layout/icons";

const PAGES = [
  { id: "cadastros-basicos",    label: "Cadastros Básicos",    icon: BookOpen,        component: CadastrosBasicos   },
  { id: "processar-extratos",   label: "Processar Extratos",   icon: FileSpreadsheet, component: ExtratoUploader    },
  { id: "capturar-despesas",  label: "Capturar Despesas",  icon: ImageIcon,       component: CapturarDespesas },
  { id: "validar-despesas",   label: "Validar Despesas",   icon: ClipboardCheck,  component: ValidarDespesas  },
  { id: "conciliar-despesas", label: "Conciliar Despesas", icon: GitMerge,        component: ConciliarDespesas},
  { id: "fechamento-contabil",  label: "Fechamento Contábil",  icon: Download,        component: FechamentoContabil },
  { id: "plano-contas",         label: "Plano de Contas",      icon: BookOpen,        component: PlanoContasAdmin   },
  { id: "balancetes-historicos",label: "Balancetes Históricos",icon: BookOpen,        component: BalanceteUploader  },
];

export default function App() {
  const [currentPageId, setCurrentPageId] = useState("processar-extratos");
  const CurrentPage = PAGES.find(p => p.id === currentPageId)?.component ?? PAGES[0].component;

  return (
    <CondoProvider>
      <AppShell pages={PAGES} currentPageId={currentPageId} onNavigate={setCurrentPageId}>
        <CurrentPage />
      </AppShell>
    </CondoProvider>
  );
}

