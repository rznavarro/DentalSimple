import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Paciente {
  id: string;
  nombre: string;
  telefono: string;
  created_at: string;
}

interface PacientesProps {
  onSelectPaciente: (id: string) => void;
}

export default function Pacientes({ onSelectPaciente }: PacientesProps) {
  const { user } = useAuth();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
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
    loadPacientes();
  }, [user]);

  const loadPacientes = async () => {
    try {
      const { data } = await supabase
        .from('pacientes')
        .select('id, nombre, telefono, created_at')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      setPacientes(data || []);
    } catch (err) {
      console.error('Error loading patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const { error: insertError } = await supabase.from('pacientes').insert({
        user_id: user?.id,
        nombre: formData.nombre,
        telefono: formData.telefono,
        email: formData.email || null,
        fecha_nacimiento: formData.fecha_nacimiento || null,
        direccion: formData.direccion || null,
        alergias: formData.alergias || null,
      });

      if (insertError) throw insertError;

      setSuccess('Paciente registrado exitosamente');
      setFormData({
        nombre: '',
        telefono: '',
        email: '',
        fecha_nacimiento: '',
        direccion: '',
        alergias: '',
      });
      setShowForm(false);
      loadPacientes();
    } catch (err) {
      setError('Error al registrar paciente');
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-black">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Pacientes</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Nuevo Paciente'}
        </button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      {showForm && (
        <div className="mb-8 border border-gray-300 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Nuevo Paciente</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Teléfono *
                </label>
                <input
                  type="tel"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-1">
                  Fecha de Nacimiento
                </label>
                <input
                  type="date"
                  value={formData.fecha_nacimiento}
                  onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Dirección</label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">
                  Alergias / Observaciones Médicas
                </label>
                <textarea
                  value={formData.alergias}
                  onChange={(e) => setFormData({ ...formData, alergias: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
            >
              Guardar
            </button>
          </form>
        </div>
      )}

      <div className="border border-gray-300">
        {pacientes.length === 0 ? (
          <div className="p-6 text-center text-gray-600">No hay pacientes registrados</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-black font-medium">Nombre</th>
                <th className="px-4 py-2 text-left text-black font-medium">Teléfono</th>
                <th className="px-4 py-2 text-left text-black font-medium">Registrado</th>
                <th className="px-4 py-2 text-left text-black font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {pacientes.map((paciente) => (
                <tr key={paciente.id} className="border-t border-gray-300">
                  <td className="px-4 py-2 text-black">{paciente.nombre}</td>
                  <td className="px-4 py-2 text-black">{paciente.telefono}</td>
                  <td className="px-4 py-2 text-black">
                    {new Date(paciente.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => onSelectPaciente(paciente.id)}
                      className="text-blue-600 hover:underline"
                    >
                      Ver ficha
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
