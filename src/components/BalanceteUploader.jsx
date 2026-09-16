import React, { useState } from 'react';
import { useCondo } from '../context/CondoContext';

export default function BalanceteUploader() {
  const { selectedAdmId, selectedCondoId, currentCondo, currentAdm } = useCondo();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setResult(null);
    setError(null);
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Selecione um arquivo PDF de balancete.");
      return;
    }

    console.log("Arquivo selecionado:", file, "Tamanho:", file?.size);

    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('administradora_id', selectedAdmId);
    formData.append('condominio_id', selectedCondoId);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/balancetes/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || 'Erro ao processar balancete');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginTop: 0 }}>Importar Balancete Histórico</h2>
      <p style={{ color: '#555' }}>
        Administradora: {currentAdm?.nome}<br/>
        Condomínio: {currentCondo?.nome}
      </p>

      <div style={{ marginBottom: '15px' }}>
        <input 
          type="file" 
          accept="application/pdf" 
          onChange={handleFileChange}
          style={{ display: 'block', marginBottom: '10px' }}
        />
        <button 
          onClick={handleUpload} 
          disabled={loading || !file}
          style={{
            padding: '10px 15px',
            backgroundColor: loading ? '#999' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Processando (pode levar alguns segundos)...' : 'Enviar Balancete'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffeef0', color: '#dc3545', borderRadius: '4px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      {result && (
        <div>
          <h3 style={{ color: '#28a745' }}>Sucesso! ({result.inserted} registros salvos)</h3>
          <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '4px' }}>
            <ul style={{ listStyleType: 'none', padding: 0, margin: 0 }}>
              {result.data.map((item, idx) => (
                <li key={idx} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>Fornecedor:</strong> {item.fornecedor_nome} <br />
                  <strong>Conta:</strong> {item.conta_codigo || 'N/A'} <br />
                  <strong>Descrição:</strong> {item.conta_descricao || '—'} <br />
                  <strong>Valor:</strong> R$ {item.valor_referencia.toFixed(2)}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
