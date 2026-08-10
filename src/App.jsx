import ExtratoUploader from './components/ExtratoUploader';

function App() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <header className="mb-4 text-center">
        <h1 className="text-3xl font-extrabold text-gray-900">CondoFlow</h1>
        <p className="text-gray-600">Painel de Gestão e Automação Financeira</p>
      </header>
      <main className="w-full max-w-xl">
        <ExtratoUploader />
      </main>
    </div>
  );
}

export default App;