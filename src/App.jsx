import React, { useState } from "react";
import AppShell from "./components/layout/AppShell";
import ExtratoUploader from "./components/ExtratoUploader";
import CapturarDocumentos from "./components/CapturarDocumentos";
import { EscanearDocumentos } from "./components/EscanearDocumentos";
import ValidarDocumentos from "./components/ValidarDocumentos";
import { FileSpreadsheet, ScanLine, ImageIcon, ClipboardCheck } from "./components/layout/icons";

const PAGES = [
  {
    id: "processar-extratos",
    label: "Processar Extratos",
    icon: FileSpreadsheet,
    component: ExtratoUploader,
  },
  {
    id: "capturar-documentos",
    label: "Capturar Documentos",
    icon: ImageIcon,
    component: CapturarDocumentos,
  },
  {
    id: "escanear-documentos",
    label: "Escanear Documentos",
    icon: ScanLine,
    component: EscanearDocumentos,
  },
  {
    id: "validar-documentos",
    label: "Validar Documentos",
    icon: ClipboardCheck,
    component: ValidarDocumentos,
  },
];

export default function App() {
  const [currentPageId, setCurrentPageId] = useState(PAGES[0].id);
  const CurrentPage =
    PAGES.find((p) => p.id === currentPageId)?.component ?? PAGES[0].component;

  return (
    <AppShell pages={PAGES} currentPageId={currentPageId} onNavigate={setCurrentPageId}>
      <CurrentPage />
    </AppShell>
  );
}
