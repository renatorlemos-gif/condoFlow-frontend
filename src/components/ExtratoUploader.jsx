import React, { useState } from 'react';

export default function ExtratoUploader() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert('Selecione um arquivo .xls do Bradesco!');
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    // Usa a variável de ambiente do Vite ou o link atual do Render como segurança
    const API_URL = import.meta.env.VITE_API_URL || 'https://condoflow-backend-ep3z.onrender.com';

    try {
      const response = await fetch(`${API_URL}/api/processar-extrato-bradesco`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Erro ao processar o extrato no servidor.');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = "extrato_consolidado_bradesco.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto bg-white rounded-xl shadow-lg space-y-4 border border-gray-100 mt-10">
      <h2 className="text-2xl font-bold text-gray-800">Processador Bradesco</h2>
      <p className="text-sm text-gray-500">Envie o arquivo do extrato para gerar a planilha consolidada com débitos negativos.</p>
      
      <input 
        type="file" 
        onChange={(e) => setFile(e.target.files[0])} 
        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
      
      <button 
        onClick={handleUpload}
        disabled={loading}
        className="w-full bg-blue-600 text-white font-medium p-2.5 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 transition-colors"
      >
        {loading ? 'Processando...' : 'Converter e Baixar Planilha'}
      </button>
    </div>
  );
}