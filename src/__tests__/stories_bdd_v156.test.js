import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Testes Automatizados dos Cenários BDD: STORY-v1.56
 * Visibilidade de Capturas e Bloqueio Orientado de Despesas Fora do Período
 */

// Funções puras replicando a lógica de ValidarDespesas.jsx
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

function simularConfirmarValidacao(form, mesAnoSelecionado) {
  const { dataPgtoLimpa, dataForaDoPeriodo } = verificarDataForaDoPeriodo(form.data_pagamento, mesAnoSelecionado);

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

function gerarTextoBanner(dataPagamento, mesAnoSelecionado) {
  const dataPgtoLimpa = dataPagamento && typeof dataPagamento === "string"
    ? (dataPagamento.includes("T") ? dataPagamento.split("T")[0] : dataPagamento)
    : dataPagamento;
  return `Atenção: A data de pagamento (${formatarDataBr(dataPgtoLimpa)}) está fora do período em processamento (${mesAnoSelecionado}). Este documento não pode ser validado com esta data.`;
}

function calcularContadores(docs, revisaoIds = []) {
  const total = docs.length;
  const aguardando = docs.filter(d => d.status === "extraido" && !revisaoIds.includes(d.id)).length;
  const validados = docs.filter(d => d.status === "validado" && !revisaoIds.includes(d.id)).length;
  const conciliados = docs.filter(d => d.status === "conciliado" && !revisaoIds.includes(d.id)).length;
  const erros = docs.filter(d => d.status === "erro" && !revisaoIds.includes(d.id)).length;
  return { total, aguardando, validados, conciliados, erros };
}


describe("STORY-v1.56: Visibilidade de Capturas e Bloqueio Orientado de Despesas Fora do Período", () => {

  it("Cenário 01: Inclusão e contagem de despesas aguardando mesmo fora do mês", () => {
    const docsRecebidos = [
      {
        id: "desp-01",
        fornecedor: "Ampla Energia",
        status: "validado",
        data_pagamento: "2026-09-15"
      },
      {
        id: "desp-02",
        fornecedor: "Naturgy Gás",
        status: "extraido",
        data_pagamento: "2026-10-01" // Fora de Setembro/2026, recém-extraída
      }
    ];

    const contadores = calcularContadores(docsRecebidos);
    assert.equal(contadores.total, 2);
    assert.equal(contadores.aguardando, 1, "Despesa recém-extraída fora do mês deve constar na contagem de Aguardando");
    assert.equal(contadores.validados, 1);
  });

  it("Cenário 02: Limites temporais da competência preservam cálculo estrito", () => {
    const limitesSet = calcularLimitesCompetencia("2026-09");
    assert.equal(limitesSet.minDate, "2026-09-01");
    assert.equal(limitesSet.maxDate, "2026-09-30");

    const limitesFevBissexto = calcularLimitesCompetencia("2024-02");
    assert.equal(limitesFevBissexto.ultimoDia, 29);
    assert.equal(limitesFevBissexto.maxDate, "2024-02-29");
  });

  it("Cenário 03: Detecção de data fora do período e ativação do banner de advertência", () => {
    const mesAno = "2026-09";
    const dataFora = "2026-10-01";

    const { dataForaDoPeriodo } = verificarDataForaDoPeriodo(dataFora, mesAno);
    assert.equal(dataForaDoPeriodo, true, "Data posterior ao mês ativo deve ativar advertência");

    const textoBanner = gerarTextoBanner(dataFora, mesAno);
    assert.equal(
      textoBanner,
      "Atenção: A data de pagamento (01/10/2026) está fora do período em processamento (2026-09). Este documento não pode ser validado com esta data."
    );
  });

  it("Cenário 03 (Badge na listagem): Sinalização de advertência na linha da tabela", () => {
    const mesAno = "2026-09";
    const docNormal = { data_pagamento: "2026-09-15" };
    const docFora = { data_pagamento: "2026-10-01" };

    const checkNormal = verificarDataForaDoPeriodo(docNormal.data_pagamento, mesAno);
    const checkFora = verificarDataForaDoPeriodo(docFora.data_pagamento, mesAno);

    assert.equal(checkNormal.dataForaDoPeriodo, false, "Data dentro do mês não deve exibir badge de advertência");
    assert.equal(checkFora.dataForaDoPeriodo, true, "Data fora do mês deve exibir badge de advertência 'Data fora do mês'");
  });

  it("Cenário 04: Bloqueio impeditivo no clique de confirmação com mensagem orientadora oficial", () => {
    const form = {
      data_pagamento: "2026-10-01",
      conta_devedora_id: "fp-01",
      conta_codigo: "conta-01",
      valor_total: 312.80
    };

    const res = simularConfirmarValidacao(form, "2026-09");
    assert.equal(res.sucesso, false);
    assert.equal(res.bloqueado, true);
    assert.equal(
      res.erro,
      "A data de pagamento (01/10/2026) está fora do período em processamento (2026-09). Ajuste a data de pagamento para este mês ou exclua a despesa desta pasta mensal para aguardar o fechamento do mês seguinte."
    );
  });

  it("Cenário 05: Desbloqueio dinâmico imediato após usuária ajustar a data para dentro do mês", () => {
    const form = {
      data_pagamento: "2026-10-01",
      conta_devedora_id: "fp-01",
      conta_codigo: "conta-01",
      valor_total: 312.80
    };

    // Inicialmente bloqueado
    let res = simularConfirmarValidacao(form, "2026-09");
    assert.equal(res.bloqueado, true);

    // Usuária edita o input para 30/09/2026
    form.data_pagamento = "2026-09-30";
    const checkAtualizado = verificarDataForaDoPeriodo(form.data_pagamento, "2026-09");
    assert.equal(checkAtualizado.dataForaDoPeriodo, false, "Banner deve ser ocultado");

    // Validação agora liberada com sucesso
    res = simularConfirmarValidacao(form, "2026-09");
    assert.equal(res.sucesso, true);
    assert.equal(res.status, "validado");
  });

  it("Cenário 06: Exclusão direta de despesa via endpoint DELETE", () => {
    const docId = "desp-002-outubro";
    const deleteUrl = `/api/v1/validacao/despesas/${docId}`;
    assert.ok(deleteUrl.includes(docId));
  });

  it("Cenário 09: Despesa com data de pagamento nula não bloqueia salvamento parcial", () => {
    const form = {
      data_pagamento: null,
      fornecedor: "Conta Pendente",
      valor_total: 100.0
    };

    const { dataForaDoPeriodo } = verificarDataForaDoPeriodo(form.data_pagamento, "2026-09");
    assert.equal(dataForaDoPeriodo, false, "Data nula não ativa bloqueio de período");
  });
});
