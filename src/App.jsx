import React, { useState } from "react";
import { CondoProvider } from "./context/CondoContext";
import AppShell from "./components/layout/AppShell";
import ExtratoUploader from "./components/ExtratoUploader";
import CapturarDocumentos from "./components/CapturarDocumentos";
import ValidarDocumentos from "./components/ValidarDocumentos";
import ConciliarDocumentos from "./components/ConciliarDocumentos";
import { FileSpreadsheet, ImageIcon, ClipboardCheck, GitMerge } from "./components/layout/icons";

const PAGES = [
  { id: "processar-extratos",   label: "Processar Extratos",   icon: FileSpreadsheet, component: ExtratoUploader    },
  { id: "capturar-documentos",  label: "Capturar Documentos",  icon: ImageIcon,       component: CapturarDocumentos },
  { id: "validar-documentos",   label: "Validar Documentos",   icon: ClipboardCheck,  component: ValidarDocumentos  },
  { id: "conciliar-documentos", label: "Conciliar Documentos", icon: GitMerge,        component: ConciliarDocumentos},
];

export default function App() {
  const [currentPageId, setCurrentPageId] = useState(PAGES[0].id);
  const CurrentPage = PAGES.find(p => p.id === currentPageId)?.component ?? PAGES[0].component;

  return (
    <CondoProvider>
      <AppShell pages={PAGES} currentPageId={currentPageId} onNavigate={setCurrentPageId}>
        <CurrentPage />
      </AppShell>
    </CondoProvider>
  );
}
