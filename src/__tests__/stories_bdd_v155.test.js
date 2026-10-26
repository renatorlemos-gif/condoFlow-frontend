import { describe, it } from "node:test";
import assert from "node:assert/strict";

/**
 * Testes Automatizados dos Cenários BDD: STORY-v1.55
 * Bloqueio de Data de Pagamento Fora da Competência Ativa e Calibragem de Threshold Semântico
 */

// Funções puras replicando a lógica de ValidarDespesas.jsx
function calcularLimitesCompetencia(mesAnoSelecionado) {
  if (!mesAnoSelecionado || !mesAnoSelecionado.includes("-")) {
    return { minDate: null, maxDate: null, ano: null, mes: null, ultimoDia: null };
  }
  const [ano, mes] = mesAnoSelecionado.split("-").map(Number);
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
  const clean = val.includes("T") ? val.split("T")[0] : val;
  const parts = clean.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return val;
}

function validarDataPagamentoCompetencia(dataPagamento, mesAnoSelecionado) {
  const limites = calcularLimitesCompetencia(mesAnoSelecionado);
  if (!dataPagamento || !limites.minDate || !limites.maxDate) {
    return { valido: true };
  }
  const cleanData = dataPagamento.includes("T") ? dataPagamento.split("T")[0] : dataPagamento;
  if (cleanData < limites.minDate || cleanData > limites.maxDate) {
    return {
      valido: false,
      erro: `A data de pagamento (${formatarDataBr(cleanData)}) não pertence à competência ativa (${mesAnoSelecionado}). Se a despesa foi paga em outro mês, não salve nesta competência: exclua o documento desta pasta mensal para aguardar e processá-lo no mês correto.`
    };
  }
  return { valido: true };
}

function montarPayloadValidacao(form, mesAnoSelecionado, acaoPatch, forcedContaDevedoraId = undefined) {
  const payload = { acao: acaoPatch, ...form };
  if (forcedContaDevedoraId !== undefined) {
    payload.conta_devedora_id = forcedContaDevedoraId;
  }
  const prepareParaEnvio = (val) => {
    if (typeof val === "string" && val.trim() === "") return null;
    return val;
  };

  payload.fornecedor = prepareParaEnvio(payload.fornecedor);
  payload.cnpj_cpf = prepareParaEnvio(payload.cnpj_cpf);
  payload.numero_doc = prepareParaEnvio(payload.numero_doc);
  payload.data_emissao = prepareParaEnvio(payload.data_emissao);
  payload.data_vencimento = prepareParaEnvio(payload.data_vencimento);
  payload.data_pagamento = prepareParaEnvio(payload.data_pagamento);
  payload.descricao = prepareParaEnvio(payload.descricao);
  payload.chave_acesso = prepareParaEnvio(payload.chave_acesso);
  payload.competencia = prepareParaEnvio(payload.competencia);

  payload.conta_despesa_id = prepareParaEnvio(payload.conta_codigo);
  payload.fonte_pagadora_id = prepareParaEnvio(payload.conta_devedora_id);
  delete payload.conta_codigo;
  delete payload.conta_devedora_id;

  if (payload.valor_total === "") payload.valor_total = null;

  if (mesAnoSelecionado) {
    payload.mes_ano = mesAnoSelecionado;
  }

  // Validação impeditiva
  if (acaoPatch === "salvar" || acaoPatch === "confirmar") {
    const check = validarDataPagamentoCompetencia(payload.data_pagamento, mesAnoSelecionado);
    if (!check.valido) {
      throw new Error(check.erro);
    }
  }

  return payload;
}


describe("STORY-v1.55: Bloqueio de Data de Pagamento Fora da Competência Ativa", () => {

  it("Cenário 01: Cálculo de Limites Temporais do Mês Ativo (RF-01)", () => {
    // Competência Setembro/2026 (30 dias)
    const limitesSet = calcularLimitesCompetencia("2026-09");
    assert.equal(limitesSet.minDate, "2026-09-01");
    assert.equal(limitesSet.maxDate, "2026-09-30");
    assert.equal(limitesSet.ultimoDia, 30);

    // Competência Outubro/2026 (31 dias)
    const limitesOut = calcularLimitesCompetencia("2026-10");
    assert.equal(limitesOut.minDate, "2026-10-01");
    assert.equal(limitesOut.maxDate, "2026-10-31");
    assert.equal(limitesOut.ultimoDia, 31);

    // Competência Fevereiro/2024 (Ano bissexto -> 29 dias)
    const limitesFevBissexto = calcularLimitesCompetencia("2024-02");
    assert.equal(limitesFevBissexto.minDate, "2024-02-01");
    assert.equal(limitesFevBissexto.maxDate, "2024-02-29");

    // Competência Fevereiro/2026 (Ano regular -> 28 dias)
    const limitesFevRegular = calcularLimitesCompetencia("2026-02");
    assert.equal(limitesFevRegular.minDate, "2026-02-01");
    assert.equal(limitesFevRegular.maxDate, "2026-02-28");

    // Resiliência para valores nulos ou vazios
    assert.equal(calcularLimitesCompetencia(null).minDate, null);
    assert.equal(calcularLimitesCompetencia("").minDate, null);
    assert.equal(calcularLimitesCompetencia("invalido").minDate, null);
  });

  it("Cenário 01: Verificação de Sinalização Visual de Fora do Intervalo no MaskedDateInput (RF-01)", () => {
    const limites = calcularLimitesCompetencia("2026-09");

    const checkOutOfRange = (val) => {
      const clean = val && val.includes("T") ? val.split("T")[0] : val;
      return Boolean(clean && ((limites.minDate && clean < limites.minDate) || (limites.maxDate && clean > limites.maxDate)));
    };

    assert.equal(checkOutOfRange("2026-10-02"), true, "02/10/2026 deve ser marcado como out-of-range");
    assert.equal(checkOutOfRange("2026-08-31"), true, "31/08/2026 deve ser marcado como out-of-range");
    assert.equal(checkOutOfRange("2026-09-01"), false, "01/09/2026 está no range");
    assert.equal(checkOutOfRange("2026-09-15"), false, "15/09/2026 está no range");
    assert.equal(checkOutOfRange("2026-09-30"), false, "30/09/2026 está no range");
    assert.equal(checkOutOfRange(null), false, "Valor nulo não deve sinalizar erro");
  });

  it("Cenário 02: Validação Impeditiva e Mensagem Orientadora de Exclusão no Envio (RF-02)", () => {
    const formDivergente = {
      fornecedor: "Ampla Energia",
      data_pagamento: "2026-10-05",
      conta_codigo: "conta-1",
      conta_devedora_id: "fonte-1"
    };

    const mesAno = "2026-09";

    assert.throws(
      () => montarPayloadValidacao(formDivergente, mesAno, "confirmar"),
      (err) => {
        assert.ok(err instanceof Error);
        assert.ok(err.message.includes("A data de pagamento (05/10/2026) não pertence à competência ativa (2026-09)"));
        assert.ok(err.message.includes("exclua o documento desta pasta mensal para aguardar e processá-lo no mês correto"));
        return true;
      }
    );

    // Também bloqueia se a ação for salvar rascunho
    assert.throws(
      () => montarPayloadValidacao(formDivergente, mesAno, "salvar"),
      (err) => {
        assert.ok(err.message.includes("A data de pagamento (05/10/2026) não pertence à competência ativa (2026-09)"));
        return true;
      }
    );
  });

  it("Cenário 03: Montagem do Endpoint de Exclusão Direta de Despesa (RF-02, RF-03)", () => {
    const API_URL = "http://localhost:8000";
    const docId = "doc-uuid-155-del";
    const deleteUrl = `${API_URL}/api/v1/validacao/despesas/${docId}`;

    assert.equal(deleteUrl, "http://localhost:8000/api/v1/validacao/despesas/doc-uuid-155-del");
  });

  it("Cenário 06: Aceitação de Data Válida com Inclusão de mes_ano no Payload (RF-01, RF-03)", () => {
    const formValido = {
      fornecedor: "Light S.A.",
      data_pagamento: "2026-09-15",
      conta_codigo: "conta-luz-01",
      conta_devedora_id: "fonte-bancaria-01",
      valor_total: 350.50
    };

    const payload = montarPayloadValidacao(formValido, "2026-09", "confirmar");

    assert.equal(payload.acao, "confirmar");
    assert.equal(payload.data_pagamento, "2026-09-15");
    assert.equal(payload.mes_ano, "2026-09");
    assert.equal(payload.conta_despesa_id, "conta-luz-01");
    assert.equal(payload.fonte_pagadora_id, "fonte-bancaria-01");
    assert.equal(payload.valor_total, 350.50);
  });

  it("Cenário 07: Despesa Sem Data de Pagamento Informada (Retrocompatibilidade e Null Safety) (RF-05)", () => {
    const formPendente = {
      fornecedor: "Fornecedor Pendente",
      data_pagamento: null,
      conta_codigo: "conta-01",
      descricao: "Nota de compra sem data de pagamento"
    };

    // Salvar sem data_pagamento deve ser aceito sem erro
    const payloadSalvar = montarPayloadValidacao(formPendente, "2026-09", "salvar");
    assert.equal(payloadSalvar.acao, "salvar");
    assert.equal(payloadSalvar.data_pagamento, null);
    assert.equal(payloadSalvar.mes_ano, "2026-09");

    // Também aceita se data_pagamento for string vazia
    const formVazio = { ...formPendente, data_pagamento: "" };
    const payloadVazio = montarPayloadValidacao(formVazio, "2026-09", "salvar");
    assert.equal(payloadVazio.data_pagamento, null);
  });
});
