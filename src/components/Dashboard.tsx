import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  pacienteNombre: string;
}

interface DashboardProps {
  onNavigate: (view: string) => void;
}

// Funciones para manejar datos locales
const getPacientes = (userId: string) => {
  try {
    const pacientesStr = localStorage.getItem(`pacientes_${userId}`);
    return pacientesStr ? JSON.parse(pacientesStr) : [];
  } catch {
    return [];
  }
};

const getCitas = (userId: string) => {
  try {
    const citasStr = localStorage.getItem(`citas_${userId}`);
    return citasStr ? JSON.parse(citasStr) : [];
  } catch {
    return [];
  }
};

export default function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useAuth();
  const [totalPacientes, setTotalPacientes] = useState(0);
  const [citasHoy, setCitasHoy] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadData = async () => {
      try {
        // Cargar pacientes desde localStorage
        const pacientes = getPacientes(user.id);
        setTotalPacientes(pacientes.length);

        // Cargar citas desde localStorage
        const allCitas = getCitas(user.id);
        const today = new Date().toISOString().split('T')[0];

        // Filtrar citas de hoy y agregar nombre del paciente
        const citasHoyData = allCitas
          .filter((cita: any) => cita.fecha === today)
          .map((cita: any) => {
            const paciente = pacientes.find((p: any) => p.id === cita.paciente_id);
            return {
              id: cita.id,
              fecha: cita.fecha,
              hora: cita.hora,
              pacienteNombre: paciente ? paciente.nombre : 'Paciente no encontrado'
            };
          })
          .sort((a: any, b: any) => a.hora.localeCompare(b.hora));

        setCitasHoy(citasHoyData);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-black">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold text-black mb-6">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="border border-gray-300 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Total Pacientes</h3>
          <p className="text-3xl font-bold text-black">{totalPacientes}</p>
        </div>

        <div className="border border-gray-300 p-6">
          <h3 className="text-sm text-gray-600 mb-2">Citas Hoy</h3>
          <p className="text-3xl font-bold text-black">{citasHoy.length}</p>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold text-black mb-4">Citas de Hoy</h3>
        {citasHoy.length === 0 ? (
          <p className="text-gray-600">No hay citas programadas para hoy</p>
        ) : (
          <div className="border border-gray-300">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-black font-medium">Hora</th>
                  <th className="px-4 py-2 text-left text-black font-medium">Paciente</th>
                </tr>
              </thead>
              <tbody>
                {citasHoy.map((cita) => (
                  <tr key={cita.id} className="border-t border-gray-300">
                    <td className="px-4 py-2 text-black">{cita.hora.substring(0, 5)}</td>
                    <td className="px-4 py-2 text-black">{cita.pacienteNombre}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => onNavigate('pacientes')}
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        >
          Nuevo Paciente
        </button>
        <button
          onClick={() => onNavigate('agenda')}
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        >
          Agendar Cita
        </button>
      </div>
    </div>
  );
}
