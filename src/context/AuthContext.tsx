import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  id: string;
  email: string;
  user_metadata: { clinicName: string };
  app_metadata: {};
  aud: string;
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, clinicName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Función para guardar usuario en localStorage
const saveUserToLocalStorage = (user: User | null) => {
  if (user) {
    localStorage.setItem('dental_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('dental_user');
  }
};

// Función para obtener usuario de localStorage
const getUserFromLocalStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem('dental_user');
    return userStr ? JSON.parse(userStr) : null;
  } catch {
    return null;
  }
};

// Función para obtener todos los usuarios registrados
const getAllUsers = (): User[] => {
  try {
    const usersStr = localStorage.getItem('dental_users');
    return usersStr ? JSON.parse(usersStr) : [];
  } catch {
    return [];
  }
};

// Función para guardar usuario en la lista de usuarios registrados
const saveUserToUsersList = (user: User) => {
  const users = getAllUsers();
  const existingIndex = users.findIndex(u => u.email === user.email);

  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }

  localStorage.setItem('dental_users', JSON.stringify(users));
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cargar usuario desde localStorage al iniciar
    const localUser = getUserFromLocalStorage();
    setUser(localUser);
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    // Buscar usuario en la lista de usuarios registrados
    const users = getAllUsers();
    const foundUser = users.find(u => u.email === email);

    if (!foundUser) {
      throw new Error('Usuario no encontrado. Regístrate primero.');
    }

    // En localStorage, no verificamos contraseña por simplicidad
    // En producción, deberías hashear y verificar contraseñas
    saveUserToLocalStorage(foundUser);
    setUser(foundUser);
  };

  const signUp = async (email: string, password: string, clinicName: string) => {
    // Verificar si el usuario ya existe
    const users = getAllUsers();
    const existingUser = users.find(u => u.email === email);

    if (existingUser) {
      throw new Error('Este email ya está registrado.');
    }

    // Crear nuevo usuario
    const newUser: User = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: email,
      user_metadata: { clinicName },
      app_metadata: {},
      aud: 'authenticated',
      created_at: new Date().toISOString(),
    };

    // Guardar en la lista de usuarios y como usuario actual
    saveUserToUsersList(newUser);
    saveUserToLocalStorage(newUser);
    setUser(newUser);
  };

  const signOut = async () => {
    saveUserToLocalStorage(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
