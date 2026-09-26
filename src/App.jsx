import React, { useState } from "react";
import { CondoProvider } from "./context/CondoContext";
import AppShell from "./components/layout/AppShell";
import ExtratoUploader from "./components/ExtratoUploader";
import CapturarDocumentos from "./components/CapturarDocumentos";
import ValidarDocumentos from "./components/ValidarDocumentos";
import ConciliarDocumentos from "./components/ConciliarDocumentos";
import PlanoContasAdmin from "./components/PlanoContasAdmin";
import BalanceteUploader from "./components/BalanceteUploader";
import CadastrosBasicos from "./pages/CadastrosBasicos";
import FechamentoContabil from "./components/FechamentoContabil";
import { FileSpreadsheet, ImageIcon, ClipboardCheck, GitMerge, BookOpen, Download } from "./components/layout/icons";

const PAGES = [
  { id: "cadastros-basicos",    label: "Cadastros Básicos",    icon: BookOpen,        component: CadastrosBasicos   },
  { id: "processar-extratos",   label: "Processar Extratos",   icon: FileSpreadsheet, component: ExtratoUploader    },
  { id: "capturar-documentos",  label: "Capturar Documentos",  icon: ImageIcon,       component: CapturarDocumentos },
  { id: "validar-documentos",   label: "Validar Documentos",   icon: ClipboardCheck,  component: ValidarDocumentos  },
  { id: "conciliar-documentos", label: "Conciliar Documentos", icon: GitMerge,        component: ConciliarDocumentos},
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
