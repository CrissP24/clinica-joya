import React, { createContext, useContext, useState, useEffect } from 'react';
import { localStorageService, SystemUser } from '@/services/localStorageService';

export type UserRole = 'admin' | 'doctor' | 'patient';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  specialization?: string; // for doctors
  cedula?: string; // for patients
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (updates: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for testing - these will be replaced by localStorageService
const demoUsers: (User & { password: string })[] = [
  {
    id: '1',
    name: 'Dr. Ana García',
    email: 'admin@clinica.com',
    role: 'admin',
    phone: '+34 600 123 456',
    isActive: true,
    password: 'admin123'
  },
  {
    id: '2',
    name: 'Dr. Candy Maribel Hoppe Castro',
    email: 'dracandyhoppe@gmail.com',
    role: 'doctor',
    phone: '+593 99 715 8494',
    specialization: 'Medicina General',
    isActive: true,
    password: 'doctor123'
  },
  {
    id: '3',
    name: 'María López',
    email: 'paciente@email.com',
    role: 'patient',
    phone: '+34 600 345 678',
    cedula: '12345678X',
    isActive: true,
    password: 'patient123'
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
    // First try to find user in localStorageService
    const systemUsers = localStorageService.getSystemUsers();
    let foundUser = systemUsers.find(u => u.email === email && u.isActive);
    
    // If not found, try demo users
    if (!foundUser) {
      foundUser = demoUsers.find(u => u.email === email);
    }
    
    // Check password
    if (foundUser && foundUser.password === password) {
      const userToSet: User = {
        id: foundUser.id,
        name: foundUser.name,
        email: foundUser.email,
        role: foundUser.role,
        phone: foundUser.phone,
        specialization: foundUser.specialization,
        cedula: foundUser.cedula,
        isActive: foundUser.isActive
      };
      
      setUser(userToSet);
      localStorage.setItem('medical_user', JSON.stringify(userToSet));
      return true;
    }
    
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('medical_user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('medical_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      updateUser
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