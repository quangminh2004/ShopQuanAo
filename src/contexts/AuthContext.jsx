import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';
import { getRankFromSpending } from '../utils/rankUtils';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Chỉ dùng localStorage để lưu thông tin THẬT của người dùng ĐÃ ĐĂNG NHẬP (session)
  const [currentUser, setCurrentUser] = useState(() => {
    const stored = localStorage.getItem('lunina_current_user');
    return stored ? JSON.parse(stored) : null;
  });

  // Xóa toàn bộ localStorage cũ rác của mockData lúc khởi động (chỉ dọn mảng users, giữ lại current_user)
  useEffect(() => {
    localStorage.removeItem('lunina_users');
  }, []);

  // Đăng nhập API
  const login = async (email, password) => {
    try {
      const response = await api.post('/user/login', { email, password });

      if (!response.data || response.data.success === false) {
        return { success: false, message: response.data?.message || 'Email hoặc mật khẩu không chính xác' };
      }

      const user = response.data.data;
      if (!user) throw new Error('Không nhận được dữ liệu user từ server');

      const updated = {
        ...user,
        rank: getRankFromSpending(user.totalSpending || 0),
        username: user.email,
      };
      
      localStorage.setItem('lunina_current_user', JSON.stringify(updated));
      setCurrentUser(updated);
      return { success: true, user: updated };
    } catch (err) {
      // TRẢ VỀ LỖI THẬT, KHÔNG FALLBACK MOCK NỮA
      const serverMsg = err.response?.data?.message || err.response?.data?.error;
      return { success: false, message: serverMsg || 'Lỗi kết nối từ server khi đăng nhập!' };
    }
  };

  // Đăng ký API
  const register = async ({ username, password, fullName, email }) => {
    try {
      // Schema hiện tại: fullName, email, address + password ở query param 
      const payload = {
        fullName,
        email,
        address: '',
      };

      const response = await api.post(`/user/register?password=${encodeURIComponent(password)}`, payload);

      if (!response.data || response.data.success === false) {
        return { success: false, message: response.data?.message || 'Đăng ký thất bại' };
      }

      const newUser = response.data.data;
      const enriched = {
        ...newUser,
        rank: getRankFromSpending(newUser.totalSpending || 0),
        username: newUser.email,
      };

      localStorage.setItem('lunina_current_user', JSON.stringify(enriched));
      setCurrentUser(enriched);
      return { success: true, user: enriched };
    } catch (err) {
      // TRẢ VỀ LỖI THẬT TỪ BACKEND
      console.warn("Register API Error:", err.response?.data);
      const serverMsg = err.response?.data?.message || err.response?.data?.error || `HTTP ${err.response?.status}: Lấy lỗi từ API thất bại`;
      return { success: false, message: serverMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem('lunina_current_user');
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ 
        currentUser, 
        login, 
        register, 
        logout,
        // Dùng fake rỗng cho các component đang cần mảng users cũ (ví dụ AdminCustomers)
        // Trong tương lai AdminCustomers cần gọi API GET /api/user đàng hoàng
        users: [] 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
