import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

interface Paciente {
  id: string;
  nombre: string;
}

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  motivo: string | null;
  pacientes: {
    nombre: string;
  };
}

export default function Agenda() {
  const { user } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [citas, setCitas] = useState<Cita[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    paciente_id: '',
    fecha: new Date().toISOString().split('T')[0],
    hora: '09:00',
    motivo: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user, currentDate]);

  const loadData = async () => {
    try {
      const { data: pacientesData } = await supabase
        .from('pacientes')
        .select('id, nombre')
        .eq('user_id', user?.id)
        .order('nombre');

      setPacientes(pacientesData || []);

      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDay = new Date(year, month, 1).toISOString().split('T')[0];
      const lastDay = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const { data: citasData } = await supabase
        .from('citas')
        .select('id, fecha, hora, motivo, pacientes(nombre)')
        .eq('user_id', user?.id)
        .gte('fecha', firstDay)
        .lte('fecha', lastDay)
        .order('hora');

      setCitas(citasData || []);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.paciente_id) {
      setError('Selecciona un paciente');
      return;
    }

    try {
      const { error: insertError } = await supabase.from('citas').insert({
        user_id: user?.id,
        paciente_id: formData.paciente_id,
        fecha: formData.fecha,
        hora: formData.hora,
        motivo: formData.motivo || null,
      });

      if (insertError) throw insertError;

      setSuccess('Cita agendada exitosamente');
      setFormData({
        paciente_id: '',
        fecha: new Date().toISOString().split('T')[0],
        hora: '09:00',
        motivo: '',
      });
      setShowForm(false);
      loadData();
    } catch (err) {
      setError('Error al agendar cita');
    }
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek };
  };

  const getCitasForDay = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];
    return citas.filter((cita) => cita.fecha === dateStr);
  };

  const handleDayClick = (day: number) => {
    const dateStr = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      day
    ).toISOString().split('T')[0];
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-black">Cargando...</p>
      </div>
    );
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth();
  const monthName = currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-black">Agenda</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700"
        >
          {showForm ? 'Cancelar' : 'Agendar Cita'}
        </button>
      </div>

      {error && <div className="mb-4 text-red-600">{error}</div>}
      {success && <div className="mb-4 text-green-600">{success}</div>}

      {showForm && (
        <div className="mb-8 border border-gray-300 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">Nueva Cita</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Paciente *</label>
                <select
                  value={formData.paciente_id}
                  onChange={(e) => setFormData({ ...formData, paciente_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                >
                  <option value="">Selecciona un paciente</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id}>
                      {paciente.nombre}
                    </option>
                  ))}
                </select>
              </div>

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
                <label className="block text-sm font-medium text-black mb-1">Hora *</label>
                <input
                  type="time"
                  value={formData.hora}
                  onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-1">Motivo</label>
                <input
                  type="text"
                  value={formData.motivo}
                  onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
                />
              </div>
            </div>

            <button type="submit" className="bg-blue-600 text-white px-4 py-2 hover:bg-blue-700">
              Agendar
            </button>
          </form>
        </div>
      )}

      <div className="border border-gray-300 p-6">
        <div className="flex justify-between items-center mb-4">
          <button onClick={previousMonth} className="text-black hover:text-blue-600 px-4 py-2">
            ← Anterior
          </button>
          <h3 className="text-lg font-semibold text-black capitalize">{monthName}</h3>
          <button onClick={nextMonth} className="text-black hover:text-blue-600 px-4 py-2">
            Siguiente →
          </button>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-black p-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: startingDayOfWeek }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const dayCitas = getCitasForDay(day);
            const dateStr = new Date(
              currentDate.getFullYear(),
              currentDate.getMonth(),
              day
            ).toISOString().split('T')[0];
            const isSelected = selectedDate === dateStr;
            const isToday =
              new Date().toISOString().split('T')[0] === dateStr;

            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`aspect-square border border-gray-300 p-2 text-left hover:bg-gray-100 ${
                  isSelected ? 'bg-blue-100' : ''
                } ${isToday ? 'border-blue-600 border-2' : ''}`}
              >
                <div className="text-sm font-medium text-black">{day}</div>
                {dayCitas.length > 0 && (
                  <div className="text-xs text-blue-600 mt-1">{dayCitas.length} cita(s)</div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {selectedDate && (
        <div className="mt-6 border border-gray-300 p-6">
          <h3 className="text-lg font-semibold text-black mb-4">
            Citas del {new Date(selectedDate + 'T00:00:00').toLocaleDateString()}
          </h3>
          {citas.filter((cita) => cita.fecha === selectedDate).length === 0 ? (
            <p className="text-gray-600">No hay citas para este día</p>
          ) : (
            <div className="space-y-3">
              {citas
                .filter((cita) => cita.fecha === selectedDate)
                .map((cita) => (
                  <div key={cita.id} className="border border-gray-300 p-4">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-medium text-black">{cita.pacientes.nombre}</p>
                        <p className="text-sm text-gray-600">
                          {cita.hora.substring(0, 5)}
                          {cita.motivo && ` - ${cita.motivo}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
