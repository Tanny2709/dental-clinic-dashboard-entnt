
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  role: 'Admin' | 'Patient';
  email: string;
  patientId?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const mockUsers = [
  { id: "1", role: "Admin" as const, email: "admin@entnt.in", password: "admin123" },
  { id: "2", role: "Patient" as const, email: "john@entnt.in", password: "patient123", patientId: "p1" },
  { id: "3", role: "Patient" as const, email: "jane@entnt.in", password: "patient123", patientId: "p2" }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const foundUser = mockUsers.find(u => u.email === email && u.password === password);
    if (foundUser) {
      const userSession = {
        id: foundUser.id,
        role: foundUser.role,
        email: foundUser.email,
        patientId: foundUser.patientId
      };
      setUser(userSession);
      localStorage.setItem('currentUser', JSON.stringify(userSession));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'Admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
