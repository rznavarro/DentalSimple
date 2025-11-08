import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

interface Paciente {
  id: string;
  nombre: string;
  telefono: string;
  email?: string;
  fecha_nacimiento?: string;
  direccion?: string;
  alergias?: string;
}

interface Visita {
  id: string;
  paciente_id: string;
  fecha: string;
  tratamiento: string;
  observaciones?: string;
  costo?: number;
}

interface FichaPacienteProps {
  pacienteId: string;
  onBack: () => void;
}

// Funciones para manejar datos locales
const getPacientes = (userId: string): Paciente[] => {
  try {
    const pacientesStr = localStorage.getItem(`pacientes_${userId}`);
    return pacientesStr ? JSON.parse(pacientesStr) : [];
  } catch {
    return [];
  }
};

const savePacientes = (userId: string, pacientes: Paciente[]) => {
  localStorage.setItem(`pacientes_${userId}`, JSON.stringify(pacientes));
};

const getVisitas = (userId: string): Visita[] => {
  try {
    const visitasStr = localStorage.getItem(`visitas_${userId}`);
    return visitasStr ? JSON.parse(visitasStr) : [];
  } catch {
    return [];
  }
};

const saveVisitas = (userId: string, visitas: Visita[]) => {
  localStorage.setItem(`visitas_${userId}`, JSON.stringify(visitas));
};

export default function FichaPaciente({ pacienteId, onBack }: FichaPacienteProps) {
  const { user } = useAuth();
  const [paciente, setPaciente] = useState<Paciente | null>(null);
  const [visitas, setVisitas] = useState<Visita[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    fecha: new Date().toISOString().split('T')[0],
    tratamiento: '',
    observaciones: '',
    costo: '',
  });
  const [editData, setEditData] = useState({
    nombre: '',
    telefono: '',
    email: '',
    fecha_nacimiento: '',
    direccion: '',
    alergias: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, pacienteId]);

  const loadData = () => {
    if (!user) return;

    try {
      // Buscar paciente
      const pacientes = getPacientes(user.id);
      const pacienteData = pacientes.find(p => p.id === pacienteId);

      if (pacienteData) {
        setPaciente(pacienteData);
        setEditData({
          nombre: pacienteData.nombre,
          telefono: pacienteData.telefono,
          email: pacienteData.email || '',
          fecha_nacimiento: pacienteData.fecha_nacimiento || '',
          direccion: pacienteData.direccion || '',
          alergias: pacienteData.alergias || '',
        });
      }

      // Cargar visitas del paciente
      const allVisitas = getVisitas(user.id);
      const pacienteVisitas = allVisitas
        .filter(v => v.paciente_id === pacienteId)
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());

      setVisitas(pacienteVisitas);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitVisita = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    try {
      const newVisita: Visita = {
        id: `visita_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        paciente_id: pacienteId,
        fecha: formData.fecha,
        tratamiento: formData.tratamiento,
        observaciones: formData.observaciones || undefined,
        costo: formData.costo ? parseFloat(formData.costo) : undefined,
      };

      const currentVisitas = getVisitas(user.id);
      const updatedVisitas = [newVisita, ...currentVisitas];
      saveVisitas(user.id, updatedVisitas);

      setSuccess('Visita registrada exitosamente');
      setFormData({
        fecha: new Date().toISOString().split('T')[0],
        tratamiento: '',
        observaciones: '',
        costo: '',
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError('Error al registrar visita');
    }
  };

  const handleUpdatePaciente = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!user) return;

    try {
      const updatedPaciente: Paciente = {
        id: pacienteId,
        nombre: editData.nombre,
        telefono: editData.telefono,
        email: editData.email || undefined,
        fecha_nacimiento: editData.fecha_nacimiento || undefined,
        direccion: editData.direccion || undefined,
        alergias: editData.alergias || undefined,
      };

      const currentPacientes = getPacientes(user.id);
      const updatedPacientes = currentPacientes.map(p =>
        p.id === pacienteId ? updatedPaciente : p
      );
      savePacientes(user.id, updatedPacientes);

      setSuccess('Datos actualizados exitosamente');
      setEditMode(false);
      loadData();
    } catch (err) {
      setError('Error al actualizar datos');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-black">Cargando...</p>
      </div>
    );
  }

  if (!paciente) {
    return (
      <div className="p-8">
        <p className="text-black">Paciente no encontrado</p>
        <button onClick={onBack} className="mt-4 text-blue-600 hover:underline">
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-8">
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">
        ← Volver a Pacientes
      </button>

      <h2 className="text-2xl font-bold text-black mb-6">Ficha del Paciente</h2>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      <div className="border border-gray-300 p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Datos Personales</h3>
          {!editMode && (
            <button
              onClick={() => setEditMode(true)}
              className="text-blue-600 hover:underline text-sm"
            >
              Editar
            </button>
          )}
        </div>

        {editMode ? (
          <form onSubmit={handleUpdatePaciente} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={editData.nombre}
                  onChange={(e) => setEditData({ ...editData, nombre: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Teléfono *</label>
                <input
                  type="tel"
                  value={editData.telefono}
                  onChange={(e) => setEditData({ ...editData, telefono: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <input
                  type="email"
                  value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={editData.fecha_nacimiento}
                  onChange={(e) => setEditData({ ...editData, fecha_nacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Dirección</label>
                <input
                  type="text"
                  value={editData.direccion}
                  onChange={(e) => setEditData({ ...editData, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">
                  Alergias / Observaciones
                </label>
                <textarea
                  value={editData.alergias}
                  onChange={(e) => setEditData({ ...editData, alergias: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button type="submit" className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setEditMode(false)}
                className="border border-gray-300 text-black px-4 py-2 hover:bg-gray-100"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="text-black">{paciente.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Teléfono</p>
              <p className="text-black">{paciente.telefono}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-black">{paciente.email || '-'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
              <p className="text-black">
                {paciente.fecha_nacimiento
                  ? new Date(paciente.fecha_nacimiento).toLocaleDateString()
                  : '-'}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Dirección</p>
              <p className="text-black">{paciente.direccion || '-'}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600">Alergias / Observaciones</p>
              <p className="text-black">{paciente.alergias || '-'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-black">Historial de Visitas</h3>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
          >
            {showForm ? 'Cancelar' : 'Registrar Nueva Visita'}
          </button>
        </div>

        {showForm && (
          <div className="border border-gray-300 p-6 mb-4">
            <form onSubmit={handleSubmitVisita} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-black mb-1">Fecha *</label>
                  <input
                    type="date"
                    value={formData.fecha}
                    onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-1">Costo</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.costo}
                    onChange={(e) => setFormData({ ...formData, costo: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">
                    Tratamiento *
                  </label>
                  <input
                    type="text"
                    value={formData.tratamiento}
                    onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={formData.observaciones}
                    onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                  />
                </div>
              </div>

              <button type="submit" className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
                Guardar Visita
              </button>
            </form>
          </div>
        )}

        <div className="border border-gray-300">
          {visitas.length === 0 ? (
            <div className="p-6 text-center text-gray-600">No hay visitas registradas</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-black font-medium">Fecha</th>
                  <th className="px-4 py-2 text-left text-black font-medium">Tratamiento</th>
                  <th className="px-4 py-2 text-left text-black font-medium">Observaciones</th>
                  <th className="px-4 py-2 text-left text-black font-medium">Costo</th>
                </tr>
              </thead>
              <tbody>
                {visitas.map((visita) => (
                  <tr key={visita.id} className="border-t border-gray-300">
                    <td className="px-4 py-2 text-black">
                      {new Date(visita.fecha).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 text-black">{visita.tratamiento}</td>
                    <td className="px-4 py-2 text-black">{visita.observaciones || '-'}</td>
                    <td className="px-4 py-2 text-black">
                      {visita.costo ? `$${visita.costo.toFixed(2)}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
