import { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_USERS } from '../data/mockData';
import api from '../utils/api';
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

  // email = trường người dùng nhập (login bằng email theo backend schema)
  const login = async (email, password) => {
    try {
      // Backend nhận: { email, password }
      const response = await api.post('/user/login', { email, password });
      
      if (!response.data || response.data.success === false) {
        return { success: false, message: response.data?.message || 'Email hoặc mật khẩu không chính xác' };
      }
      
      let user = response.data.data;
      if (!user) throw new Error('Không nhận được dữ liệu user');

      // Map sang internal user object (backend không có field rank, ta tính từ totalSpending)
      const updated = {
        ...user,
        rank: getRankFromSpending(user.totalSpending || 0),
        // Dùng email làm "username" hiển thị nếu không có fullName
        username: user.email,
      };
      localStorage.setItem('lunina_current_user', JSON.stringify(updated));
      setCurrentUser(updated);
      return { success: true, user: updated };
    } catch (err) {
      console.warn('API Login failed, trying mock fallback...', err);
      // Fallback: tìm theo email hoặc username
      const found = users.find(
        (u) => (u.email === email || u.username === email) && u.password === password
      );
      if (!found) return { success: false, message: 'Email hoặc mật khẩu không đúng!' };

      const updated = { ...found, rank: getRankFromSpending(found.totalSpending || 0) };
      localStorage.setItem('lunina_current_user', JSON.stringify(updated));
      setCurrentUser(updated);
      return { success: true, user: updated };
    }
  };

  const register = async ({ username, password, fullName, email }) => {
    try {
      // Truyền password trong body, không truyền trên URL
      const payload = {
        fullName,
        email,
        password,          // password nằm trong body
        role: 'USER',
        address: '',
        totalSpending: 0,
        points: 0,
        rank: 'NORMAL',
      };
      
      const response = await api.post('/user/register', payload);
      
      if (!response.data || response.data.success === false) {
        return { success: false, message: response.data?.message || 'Đăng ký thất bại' };
      }

      let newUser = response.data.data;
      const enriched = {
        ...newUser,
        rank: getRankFromSpending(newUser.totalSpending || 0),
        username: newUser.email, // Dùng email làm username nội bộ
      };
       
      localStorage.setItem('lunina_current_user', JSON.stringify(enriched));
      setCurrentUser(enriched);
      persistUsers([...users, enriched]);

      return { success: true, user: enriched };
    } catch(err) {
      console.warn('API Register failed, trying mock fallback...', err);
      // Fallback mock
      if (users.find((u) => u.email === email || u.username === username)) {
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
    }
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
