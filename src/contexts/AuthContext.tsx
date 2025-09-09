import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialization?: string; // for doctors
  cedula?: string; // for patients
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing
const demoUsers: User[] = [
  {
    id: '1',
    name: 'Dr. Ana García',
    email: 'admin@clinica.com',
    role: 'admin',
    phone: '+34 600 123 456'
  },
  {
    id: '2',
    name: 'Dr. Carlos Rodríguez',
    email: 'doctor@clinica.com',
    role: 'doctor',
    phone: '+34 600 789 012',
    specialization: 'Medicina General'
  },
  {
    id: '3',
    name: 'María López',
    email: 'paciente@email.com',
    role: 'patient',
    phone: '+34 600 345 678',
    cedula: '12345678X'
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is stored in localStorage
    const storedUser = localStorage.getItem('medical_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simple demo authentication
    const foundUser = demoUsers.find(u => u.email === email);
    
    if (foundUser && password === 'demo123') {
      setUser(foundUser);
      localStorage.setItem('medical_user', JSON.stringify(foundUser));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medical_user');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};