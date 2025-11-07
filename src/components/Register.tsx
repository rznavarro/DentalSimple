import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Register({ onToggle }: { onToggle: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signUp(email, password, clinicName);
    } catch (err) {
      setError('Error al registrarse. Intenta con otro email.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-black mb-8 text-center">DentalSimple</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="clinicName" className="block text-sm font-medium text-black mb-1">
              Nombre de la Clínica
            </label>
            <input
              id="clinicName"
              type="text"
              value={clinicName}
              onChange={(e) => setClinicName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-black mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-black mb-1">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-3 py-2 border border-gray-300 text-black bg-white"
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Cargando...' : 'Registrarse'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={onToggle}
            className="text-blue-600 hover:underline text-sm"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  );
}
