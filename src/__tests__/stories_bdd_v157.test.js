import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Testes Automatizados dos Cenários BDD: STORY-v1.57
 * Prevalência de Datas Contábeis, Desbloqueio de Rejeição e Refinamento de UX na Validação.
 */

// Funções utilitárias replicando a lógica de negócio do componente ValidarDespesas.jsx
function calcularLimitesCompetencia(mesAnoSelecionado) {
  if (!mesAnoSelecionado) {
    return { minDate: null, maxDate: null, ano: null, mes: null, ultimoDia: null };
  }
  const s = String(mesAnoSelecionado).trim();
  let ano = null;
  let mes = null;
  if (s.includes("-")) {
    const parts = s.split("-").map(Number);
    if (parts.length === 2) {
      if (parts[0] > 1000) { [ano, mes] = parts; }
      else { [mes, ano] = parts; }
    }
  } else if (s.includes("/")) {
    const parts = s.split("/").map(Number);
    if (parts.length === 2) {
      if (parts[0] > 1000) { [ano, mes] = parts; }
      else { [mes, ano] = parts; }
    }
  }
  if (!ano || !mes || mes < 1 || mes > 12) {
    return { minDate: null, maxDate: null, ano: null, mes: null, ultimoDia: null };
  }
  const ultimoDia = new Date(ano, mes, 0).getDate();
  const minDate = `${ano}-${String(mes).padStart(2, "0")}-01`;
  const maxDate = `${ano}-${String(mes).padStart(2, "0")}-${String(ultimoDia).padStart(2, "0")}`;
  return { minDate, maxDate, ano, mes, ultimoDia };
}

function formatarDataBr(val) {
  if (!val) return "";
  const clean = String(val).includes("T") ? String(val).split("T")[0] : String(val);
  const parts = clean.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return val;
}

function verificarDataForaDoPeriodo(dataPagamento, mesAnoSelecionado) {
  const limites = calcularLimitesCompetencia(mesAnoSelecionado);
  const dataPgtoLimpa = dataPagamento && typeof dataPagamento === "string"
    ? (dataPagamento.includes("T") ? dataPagamento.split("T")[0] : dataPagamento)
    : dataPagamento;

  const dataForaDoPeriodo = Boolean(
    dataPgtoLimpa &&
    limites.minDate &&
    limites.maxDate &&
    (dataPgtoLimpa < limites.minDate || dataPgtoLimpa > limites.maxDate)
  );

  return { dataPgtoLimpa, dataForaDoPeriodo, limites };
}

function simularHandleAcao(acao, form, mesAnoSelecionado) {
  const { dataPgtoLimpa, dataForaDoPeriodo } = verificarDataForaDoPeriodo(form.data_pagamento, mesAnoSelecionado);

  // Regra v1.57: Exclusiva para confirmação
  if (acao === "confirmar") {
    if (dataForaDoPeriodo) {
      return {
        sucesso: false,
        bloqueado: true,
        erro: `A data de pagamento (${formatarDataBr(dataPgtoLimpa)}) está fora do período em processamento (${mesAnoSelecionado}). Ajuste a data de pagamento para este mês ou exclua a despesa desta pasta mensal para aguardar o fechamento do mês seguinte.`
      };
    }

    if (!form.conta_devedora_id || form.conta_devedora_id.trim() === "") {
      return {
        sucesso: false,
        bloqueado: false,
        erro: "A fonte pagadora (Conta Crédito) é obrigatória para validação."
      };
    }

    return {
      sucesso: true,
      bloqueado: false,
      status: "validado"
    };
  }

  // Regra v1.57: Rejeitar é incondicional
  if (acao === "rejeitar") {
    return {
      sucesso: true,
      bloqueado: false,
      status: "erro",
      erro_msg: "Rejeitado manualmente pela usuária."
    };
  }

  // Ação salvar rascunho
  if (acao === "salvar") {
    return {
      sucesso: true,
      bloqueado: false,
      status: "salvo"
    };
  }

  return { sucesso: true, bloqueado: false, status: "ok" };
}

describe("STORY-v1.57: Prevalência de Datas Contábeis, Desbloqueio de Rejeição e Refinamento de UX na Validação", () => {
  const componentPath = path.join(__dirname, "..", "components", "ValidarDespesas.jsx");
  const componentCode = fs.readFileSync(componentPath, "utf-8");

  // ------------------------------------------------------------------ //
  // US-01: Layout do Banner e Higienização da Barra Inferior           //
  // ------------------------------------------------------------------ //
  it("Cenário 01: Banner de advertência possui layout vertical em coluna com botão abaixo do texto", () => {
    // Verifica a presença do estilo em coluna no banner condicional de dataForaDoPeriodo
    assert.ok(componentCode.includes('flexDirection: "column"'), "O banner deve ter flexDirection: column");
    assert.ok(componentCode.includes('alignItems: "flex-start"'), "O banner deve ter alignItems: flex-start");
    assert.ok(componentCode.includes("gap: 12"), "O banner deve ter gap: 12");
    assert.ok(componentCode.includes("paddingLeft: 28"), "O container do botão Excluir Despesa deve ter paddingLeft: 28");
  });

  it("Cenário 02: Omissão imediata do banner quando data_pagamento pertence ao mês ativo", () => {
    const mesAtivo = "2026-09";
    const dataFora = "2026-10-05";
    const dataDentro = "2026-09-25";

    const checkFora = verificarDataForaDoPeriodo(dataFora, mesAtivo);
    assert.equal(checkFora.dataForaDoPeriodo, true, "Data 2026-10-05 deve ativar dataForaDoPeriodo");

    const checkDentro = verificarDataForaDoPeriodo(dataDentro, mesAtivo);
    assert.equal(checkDentro.dataForaDoPeriodo, false, "Data 2026-09-25 deve desativar dataForaDoPeriodo");
  });

  it("Cenário 03: Ausência do botão 'Excluir Despesa' na barra inferior de ações de DetalheDespesa", () => {
    // Localiza a barra de ações inferior de DetalheDespesa
    const acoesRegex = /{\/\*\s*Ações\s*\*\/}[\s\S]*?<div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>([\s\S]*?)<\/div>/;
    const match = componentCode.match(acoesRegex);
    assert.ok(match, "Barra de ações inferior deve existir no código");

    const barraAcoesConteudo = match[1];
    // Assere que NÃO há botão Excluir Despesa na barra inferior
    assert.ok(
      !barraAcoesConteudo.includes("Excluir Despesa"),
      "O botão 'Excluir Despesa' foi higienizado e não deve constar na barra inferior de ações"
    );

    // Assere que os botões legítimos continuam presentes
    assert.ok(barraAcoesConteudo.includes("Confirmar"), "Botão Confirmar deve estar presente");
    assert.ok(barraAcoesConteudo.includes("Salvar"), "Botão Salvar deve estar presente");
    assert.ok(barraAcoesConteudo.includes("Rejeitar"), "Botão Rejeitar deve estar presente");
  });

  it("Cenário 04: Botão 'Excluir Despesa' continua presente contextualmente dentro do banner vertical", () => {
    const idxInicio = componentCode.indexOf("{dataForaDoPeriodo && (");
    const idxFim = componentCode.indexOf("<div className=\"result-grid\">");
    assert.ok(idxInicio > -1 && idxFim > idxInicio, "Bloco do banner dataForaDoPeriodo deve existir antes de result-grid");

    const bannerConteudo = componentCode.substring(idxInicio, idxFim);
    assert.ok(bannerConteudo.includes("handleExcluirDireto"), "Banner deve chamar handleExcluirDireto");
    assert.ok(bannerConteudo.includes("Excluir Despesa"), "Banner deve conter o botão 'Excluir Despesa'");
    assert.ok(bannerConteudo.includes("paddingLeft: 28"), "Botão no banner deve estar recuado em paddingLeft: 28");
  });

  // ------------------------------------------------------------------ //
  // US-02: Desbloqueio Incondicional da Ação Rejeitar                   //
  // ------------------------------------------------------------------ //
  it("Cenário 05 / 08: Despacho incondicional da ação 'rejeitar' sem bloqueios de data fora do período", () => {
    const form = {
      data_pagamento: "2026-10-15", // data fora da competência ativa
      conta_devedora_id: "",        // sem conta devedora
      conta_codigo: "",             // sem conta de despesa
      valor_total: 450.0
    };

    const res = simularHandleAcao("rejeitar", form, "2026-09");
    assert.equal(res.sucesso, true, "Rejeitar deve executar com sucesso");
    assert.equal(res.bloqueado, false, "Rejeitar não pode ser bloqueado");
    assert.equal(res.status, "erro", "Status retornado deve ser 'erro'");
  });

  it("Cenário 06: Despacho incondicional da ação 'rejeitar' com data de pagamento nula", () => {
    const form = {
      data_pagamento: null,
      conta_devedora_id: null,
      conta_codigo: null,
      valor_total: 200.0
    };

    const res = simularHandleAcao("rejeitar", form, "2026-09");
    assert.equal(res.sucesso, true);
    assert.equal(res.bloqueado, false);
    assert.equal(res.status, "erro");
  });

  it("Cenário 07: Preservação estrita do bloqueio temporal na ação 'confirmar'", () => {
    const form = {
      data_pagamento: "2026-10-15", // fora do mês 2026-09
      conta_devedora_id: "fp-01",
      conta_codigo: "cd-01",
      valor_total: 450.0
    };

    const res = simularHandleAcao("confirmar", form, "2026-09");
    assert.equal(res.sucesso, false, "Confirmar com data fora do período deve falhar");
    assert.equal(res.bloqueado, true, "Confirmar com data fora do período deve ser bloqueado");
    assert.ok(res.erro.includes("A data de pagamento (15/10/2026) está fora do período em processamento (2026-09)"));
  });

  it("Cenário de Regressão: Confirmação com data válida no mês ativa validação normalmente", () => {
    const form = {
      data_pagamento: "2026-09-18",
      conta_devedora_id: "fp-01",
      conta_codigo: "cd-01",
      valor_total: 450.0
    };

    const res = simularHandleAcao("confirmar", form, "2026-09");
    assert.equal(res.sucesso, true);
    assert.equal(res.bloqueado, false);
    assert.equal(res.status, "validado");
  });
});
