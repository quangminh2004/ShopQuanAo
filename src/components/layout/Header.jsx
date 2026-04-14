import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiUser, FiChevronDown, FiLogOut, FiPackage, FiSettings } from 'react-icons/fi';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import CartDrawer from '../cart/CartDrawer';
import './Header.css';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [cartOpen, setCartOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setDropdownOpen(false);
  };

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header-inner">
            {/* Logo */}
            <Link to="/" className="logo">
              <HiOutlineShoppingBag className="logo-icon" />
              <span className="logo-text">LUNINA</span>
            </Link>

            {/* Nav */}
            <nav className="nav-links">
              <Link to="/" className="nav-link">Trang chủ</Link>
              <Link to="/products" className="nav-link">Sản phẩm</Link>
            </nav>

            {/* Actions */}
            <div className="header-actions">
              {currentUser ? (
                <>
                  {/* Cart */}
                  <button className="cart-btn" onClick={() => setCartOpen(true)}>
                    <FiShoppingCart />
                    {cartCount > 0 && (
                      <span className="cart-badge">{cartCount > 99 ? '99+' : cartCount}</span>
                    )}
                  </button>

                  {/* User Dropdown - Click to open, click outside to close */}
                  <div className="user-dropdown" ref={dropdownRef}>
                    <button
                      className="user-btn"
                      onClick={() => setDropdownOpen(!dropdownOpen)}
                    >
                      <div className="avatar">
                        {currentUser.fullName.charAt(0).toUpperCase()}
                      </div>
                      <span className="user-name">{currentUser.fullName.split(' ').pop()}</span>
                      <FiChevronDown className={`chevron ${dropdownOpen ? 'open' : ''}`} />
                    </button>
                    {dropdownOpen && (
                      <div className="dropdown-menu slide-up">
                        <div className="dropdown-header">
                          <div className="dropdown-avatar">
                            {currentUser.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="dropdown-name">{currentUser.fullName}</div>
                            <div className="dropdown-email">{currentUser.email}</div>
                          </div>
                        </div>
                        <div className="dropdown-divider" />
                        <Link to="/profile" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FiUser /> Hồ sơ & Tích điểm
                        </Link>
                        <Link to="/orders" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                          <FiPackage /> Đơn hàng của tôi
                        </Link>
                        {currentUser.role === 'ADMIN' && (
                          <Link to="/admin" className="dropdown-item" onClick={() => setDropdownOpen(false)}>
                            <FiSettings /> Quản trị
                          </Link>
                        )}
                        <div className="dropdown-divider" />
                        <button className="dropdown-item danger" onClick={handleLogout}>
                          <FiLogOut /> Đăng xuất
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="auth-links">
                  <Link to="/login" className="btn btn-ghost btn-sm">Đăng nhập</Link>
                  <Link to="/register" className="btn btn-primary btn-sm">Đăng ký</Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
};

export default Header;
