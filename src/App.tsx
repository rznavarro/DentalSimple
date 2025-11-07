import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Register from './components/Register';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Pacientes from './components/Pacientes';
import FichaPaciente from './components/FichaPaciente';
import Agenda from './components/Agenda';

function MainApp() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('dashboard');
  const [selectedPacienteId, setSelectedPacienteId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-black">Cargando...</p>
      </div>
    );
  }

  if (!user) {
    return authMode === 'login' ? (
      <Login onToggle={() => setAuthMode('register')} />
    ) : (
      <Register onToggle={() => setAuthMode('login')} />
    );
  }

  const handleSelectPaciente = (id: string) => {
    setSelectedPacienteId(id);
    setView('ficha');
  };

  const handleBackToPacientes = () => {
    setSelectedPacienteId(null);
    setView('pacientes');
  };

  const renderView = () => {
    if (view === 'ficha' && selectedPacienteId) {
      return <FichaPaciente pacienteId={selectedPacienteId} onBack={handleBackToPacientes} />;
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard onNavigate={setView} />;
      case 'pacientes':
        return <Pacientes onSelectPaciente={handleSelectPaciente} />;
      case 'agenda':
        return <Agenda />;
      default:
        return <Dashboard onNavigate={setView} />;
    }
  };

  return (
    <Layout currentView={view} onNavigate={setView}>
      {renderView()}
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}

export default App;
