import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 // Session status check stub (resolved in TASK-005)
 setUser(null);
 setLoading(false);
 }, []);

 const login = (userData) => setUser(userData);
 const logout = () => setUser(null);

 return (
 <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
 {children}
 </AuthContext.Provider>
 );
}
