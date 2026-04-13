import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/mockData';
import { getRankFromSpending } from '../utils/rankUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [users, setUsers] = useState(() => {
    const stored = localStorage.getItem('lunina_users');
    if (stored) return JSON.parse(stored);
    localStorage.setItem('lunina_users', JSON.stringify(INITIAL_USERS));
    return INITIAL_USERS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('lunina_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  const persistUsers = (updatedUsers) => {
    localStorage.setItem('lunina_users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
  };

  const login = (username, password) => {
    const found = users.find(
      (u) => u.username === username && u.password === password
    );
    if (!found) return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu!' };

    // Sync latest rank
    const updated = { ...found, rank: getRankFromSpending(found.totalSpending) };
    localStorage.setItem('lunina_current_user', JSON.stringify(updated));
    setCurrentUser(updated);
    return { success: true, user: updated };
  };

  const register = ({ username, password, fullName, email }) => {
    if (users.find((u) => u.username === username)) {
      return { success: false, message: 'Tên đăng nhập đã tồn tại!' };
    }
    if (users.find((u) => u.email === email)) {
      return { success: false, message: 'Email đã được sử dụng!' };
    }
    const newUser = {
      id: Date.now(),
      username,
      password,
      fullName,
      email,
      totalSpending: 0,
      points: 0,
      rank: 'NORMAL',
      role: 'USER',
      createdAt: new Date().toISOString(),
    };
    const updated = [...users, newUser];
    persistUsers(updated);
    localStorage.setItem('lunina_current_user', JSON.stringify(newUser));
    setCurrentUser(newUser);
    return { success: true, user: newUser };
  };

  const logout = () => {
    localStorage.removeItem('lunina_current_user');
    setCurrentUser(null);
  };

  const updateUser = (updatedData) => {
    const updated = users.map((u) =>
      u.id === updatedData.id ? { ...u, ...updatedData } : u
    );
    persistUsers(updated);
    const refreshed = updated.find((u) => u.id === updatedData.id);
    localStorage.setItem('lunina_current_user', JSON.stringify(refreshed));
    setCurrentUser(refreshed);
  };

  // Called after order is placed to update totalSpending & rank
  const addSpending = (userId, amount) => {
    const updated = users.map((u) => {
      if (u.id === userId) {
        const newTotal = (u.totalSpending || 0) + amount;
        const newRank = getRankFromSpending(newTotal);
        const newPoints = (u.points || 0) + Math.floor(amount / 1000);
        return { ...u, totalSpending: newTotal, rank: newRank, points: newPoints };
      }
      return u;
    });
    persistUsers(updated);
    if (currentUser?.id === userId) {
      const refreshed = updated.find((u) => u.id === userId);
      localStorage.setItem('lunina_current_user', JSON.stringify(refreshed));
      setCurrentUser(refreshed);
    }
  };

  return (
    <AuthContext.Provider
      value={{ currentUser, users, login, register, logout, updateUser, addSpending }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
