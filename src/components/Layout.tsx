import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  currentView: string;
  onNavigate: (view: string) => void;
}

export default function Layout({ children, currentView, onNavigate }: LayoutProps) {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'pacientes', label: 'Pacientes' },
    { id: 'agenda', label: 'Agenda' },
  ];

  return (
    <div className="min-h-screen bg-white flex">
      <aside className="w-64 border-r border-gray-300 flex flex-col">
        <div className="p-6 border-b border-gray-300">
          <h1 className="text-2xl font-bold text-black">DentalSimple</h1>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => onNavigate(item.id)}
                  className={`w-full text-left px-4 py-2 ${
                    currentView === item.id
                      ? 'bg-blue-600 text-white'
                      : 'text-black hover:bg-gray-100'
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-300">
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-black hover:bg-gray-100"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
