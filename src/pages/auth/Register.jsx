import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import './Auth.css';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '' });

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.username || !form.password || !form.fullName || !form.email) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc!');
      return;
    }
    if (form.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      toast.error('Email không hợp lệ!');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const result = register(form);
      setLoading(false);
      if (result.success) {
        toast.success('Đăng ký thành công! Chào mừng bạn đến với LUNINA! 🎉');
        navigate('/');
      } else {
        toast.error(result.message);
      }
    }, 500);
  };

  return (
    <div className="auth-page">
      <div className="auth-bg" />
      <div className="auth-container">
        <div className="auth-card slide-up" style={{ maxWidth: '460px' }}>
          <div className="auth-logo">
            <FiShoppingBag className="auth-logo-icon" />
            <span className="auth-logo-text">LUNINA</span>
          </div>
          <h2 className="auth-title">Tạo tài khoản mới</h2>
          <p className="auth-subtitle">Tham gia LUNINA để nhận ưu đãi độc quyền</p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Họ và tên *</label>
              <input className="form-input" type="text" placeholder="Nguyễn Văn A" value={form.fullName} onChange={set('fullName')} autoFocus />
            </div>
            <div className="form-group">
              <label className="form-label">Tên đăng nhập *</label>
              <input className="form-input" type="text" placeholder="username123" value={form.username} onChange={set('username')} />
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input className="form-input" type="email" placeholder="email@example.com" value={form.email} onChange={set('email')} />
            </div>
            <div className="form-group">
              <label className="form-label">Mật khẩu *</label>
              <div style={{ position: 'relative' }}>
                <input
                  className="form-input"
                  type={showPass ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={set('password')}
                  style={{ paddingRight: '44px' }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '18px', display: 'flex' }}>
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg btn-block" disabled={loading}>
              {loading
                ? <><span className="spinner" style={{ width: '18px', height: '18px', borderWidth: '2px' }} /> Đang xử lý...</>
                : '🎉 Đăng ký ngay'}
            </button>
          </form>

          <div className="auth-divider"><span>Đã có tài khoản?</span></div>
          <Link to="/login" className="btn btn-secondary btn-block">Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
