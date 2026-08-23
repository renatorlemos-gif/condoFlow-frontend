import React, { useState } from "react";
import AppShell from "./components/layout/AppShell";
import ExtratoUploader from "./components/ExtratoUploader";
import { EscanearDocumentos } from "./components/EscanearDocumentos";
import { FileSpreadsheet, ScanLine } from "./components/layout/icons";

/**
 * Lista única de páginas do CondoFlow. Para adicionar uma nova
 * funcionalidade no futuro (Dashboard, Boletos, etc.):
 *   1. crie o componente da página em src/components/
 *   2. adicione uma linha aqui, com id, label, ícone e o componente
 * Nada no AppShell precisa mudar.
 */
const PAGES = [
  {
    id: "processar-extratos",
    label: "Processar Extratos",
    icon: FileSpreadsheet,
    component: ExtratoUploader,
  },
  {
    id: "escanear-documentos",
    label: "Escanear Documentos",
    icon: ScanLine,
    component: EscanearDocumentos,
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
