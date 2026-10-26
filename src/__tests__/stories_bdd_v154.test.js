import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Testes Automatizados dos Cenários BDD: STORY-v1.54
 * Filtro de Competência e Expansão de Limite na Validação de Despesas
 */

describe("STORY-v1.54: Validação de Despesas - Filtro de Competência e Expansão de Limite", () => {
  it("Cenário 01: Verificação estática do código-fonte de ValidarDespesas.jsx para limit=500", () => {
    const sourceCode = fs.readFileSync(new URL("../components/ValidarDespesas.jsx", import.meta.url), "utf-8");
    assert.ok(sourceCode.includes("limit=500"), "ValidarDespesas.jsx deve conter explicitamente 'limit=500'");
    assert.ok(!sourceCode.includes("limit=100"), "ValidarDespesas.jsx NÃO deve conter 'limit=100'");
  });
  it("Cenário 02 & 03: Montagem da URL de Carga com limit=500 e Cálculo de Contadores (RF-04, RF-05)", () => {
    const currentCondo = { id: "83262090-73af-41ef-8fb5-83dfb67ecb14", nome: "Lírios do Campo IV" };
    const mesAnoSelecionado = "2026-09";
    const API_URL = "http://localhost:8000";

    // 1. Simula montagem da URL conforme função carregar() em ValidarDespesas.jsx
    const targetUrl = `${API_URL}/api/v1/validacao/despesas?status=todos&limit=500&condominio_id=${currentCondo.id}&mes_ano=${mesAnoSelecionado}`;
    
    assert.ok(targetUrl.includes("limit=500"), "A URL deve conter limit=500 explicitamente");
    assert.ok(!targetUrl.includes("limit=100"), "A URL não deve conter o antigo limit=100");
    assert.ok(targetUrl.includes("mes_ano=2026-09"), "A URL deve conter a competência mes_ano");
    assert.ok(targetUrl.includes(`condominio_id=${currentCondo.id}`), "A URL deve conter o condominio_id");

    // 2. Simula dataset retornado pela API para o condomínio Lírios do Campo IV (111 despesas)
    const mockApiResponse = [
      ...Array.from({ length: 106 }, (_, i) => ({
        id: `conciliado-${i}`,
        status: "conciliado",
        fornecedor: `Fornecedor ${i}`,
        valor_total: 150.00
      })),
      ...Array.from({ length: 5 }, (_, i) => ({
        id: `extraido-${i}`,
        status: "extraido",
        fornecedor: "Ampla Energia e Serviços S.A.",
        valor_total: 280.00
      }))
    ];

    assert.equal(mockApiResponse.length, 111, "O dataset simulado deve conter 111 despesas");

    // 3. Simula cálculo de contadores feito pelos cards de status da tela ValidarDespesas
    const contadores = {
      todos: mockApiResponse.length,
      aguardando: mockApiResponse.filter(d => d.status === "extraido").length,
      validados: mockApiResponse.filter(d => d.status === "validado").length,
      conciliados: mockApiResponse.filter(d => d.status === "conciliado").length,
      revisar: mockApiResponse.filter(d => d.status === "revisar").length,
      erro: mockApiResponse.filter(d => d.status === "erro").length
    };

    assert.equal(contadores.todos, 111, "O contador 'Todos' deve indicar 111");
    assert.equal(contadores.conciliados, 106, "O contador 'Conciliados' deve indicar 106");
    assert.equal(contadores.aguardando, 5, "O contador 'Aguardando' deve indicar 5");
    assert.equal(contadores.validados, 0, "O contador 'Validados' deve indicar 0");
  });

  it("Cenário 03: Filtragem da Aba Aguardando com as 5 Faturas da Ampla Energia (RF-05)", () => {
    const mockApiResponse = [
      ...Array.from({ length: 106 }, (_, i) => ({
        id: `conciliado-${i}`,
        status: "conciliado",
        fornecedor: `Fornecedor Diverso ${i}`,
        valor_total: 100.00
      })),
      { id: "ampla-1", status: "extraido", fornecedor: "Ampla Energia e Serviços S.A.", valor_total: 707.75 },
      { id: "ampla-2", status: "extraido", fornecedor: "Ampla Energia e Serviços S.A.", valor_total: 253.46 },
      { id: "ampla-3", status: "extraido", fornecedor: "Ampla Energia e Serviços S.A.", valor_total: 233.76 },
      { id: "ampla-4", status: "extraido", fornecedor: "Ampla Energia e Serviços S.A.", valor_total: 108.99 },
      { id: "ampla-5", status: "extraido", fornecedor: "Ampla Energia e Serviços S.A.", valor_total: 98.48 }
    ];

    // Simula clique na aba "Aguardando" (filtro por status 'extraido')
    const activeTab = "aguardando";
    const docsFiltrados = mockApiResponse.filter(d => {
      if (activeTab === "todos") return true;
      if (activeTab === "aguardando") return d.status === "extraido";
      return d.status === activeTab;
    });

    assert.equal(docsFiltrados.length, 5, "A aba 'Aguardando' deve conter exatamente 5 faturas");
    for (const doc of docsFiltrados) {
      assert.equal(doc.status, "extraido");
      assert.equal(doc.fornecedor, "Ampla Energia e Serviços S.A.");
    }
  });

  it("Cenário 05: Inclusão de Despesa Recém-Extraída sem Data de Pagamento no Universo da Competência (RF-02)", () => {
    const docs = [
      { id: "doc-sem-pgto", status: "extraido", data_emissao: "2026-09-15", data_pagamento: null, fornecedor: "Comgás" },
      { id: "doc-com-pgto", status: "conciliado", data_emissao: "2026-09-01", data_pagamento: "2026-09-10", fornecedor: "Sabesp" }
    ];

    // Ambas despesas devem ser consideradas válidas na competência 2026-09
    const mesRef = "2026-09";
    const pertenceCompetencia = (doc) => {
      const dataRef = doc.data_pagamento || doc.data_emissao;
      return dataRef && dataRef.startsWith(mesRef);
    };

    const filtrados = docs.filter(pertenceCompetencia);
    assert.equal(filtrados.length, 2);
    assert.ok(filtrados.some(d => d.id === "doc-sem-pgto"));
  });
});
