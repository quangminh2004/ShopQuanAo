import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      toast.error('Vui lòng nhập email và mật khẩu!');
      return;
    }
    setLoading(true);
    try {
      const result = await login(form.email, form.password);
      setLoading(false);
      if (result.success) {
        toast.success(`Chào mừng, ${result.user.fullName || result.user.username}! 👋`);
        navigate(result.user.role === 'ADMIN' ? '/admin' : '/');
      } else {
        toast.error(result.message);
      }
    } catch (err) {
      setLoading(false);
      toast.error('Có lỗi xảy ra khi đăng nhập.');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container">
        <div className="auth-card slide-up">
          <div className="auth-logo">
            <FiShoppingBag className="auth-logo-icon" />
            <span className="auth-logo-text">LUNINA</span>
          </div>
          <h2 className="auth-title">Chào mừng trở lại!</h2>
          <p className="auth-subtitle">Đăng nhập để tiếp tục mua sắm</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                className="form-input"
                type="email"
                placeholder="Nhập email đăng nhập..."
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Nhập mật khẩu..."
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  style={{ paddingRight: '44px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px' }}
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading ? (
                <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Đang đăng nhập...</>
              ) : 'Đăng nhập'}
            </button>
          </form>

          <div className="auth-divider"><span>Chưa có tài khoản?</span></div>
          <Link to="/register" className="btn btn-secondary btn-block">Đăng ký ngay</Link>

          {/* <div className="auth-demo">
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>🔑 Tài khoản demo (nếu chưa có server):</p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button type="button" className="demo-btn" onClick={() => setForm({ email: 'admin@lunina.com', password: 'admin123' })}>
                👑 Admin
              </button>
              <button type="button" className="demo-btn" onClick={() => setForm({ email: 'user1@lunina.com', password: 'user123' })}>
                👤 User thường
              </button>
              <button type="button" className="demo-btn" onClick={() => setForm({ email: 'vip@lunina.com', password: 'user123' })}>
                💎 VIP Kim Cương
              </button>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Login;
