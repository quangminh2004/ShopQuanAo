import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiPackage, FiUsers, FiBarChart2, FiLogOut, FiShoppingBag } from 'react-icons/fi';
import { useAuth } from '../../contexts/AuthContext';

const AdminLayout = ({ children }) => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { to: '/admin', icon: <FiGrid />, label: 'Dashboard', exact: true },
    { to: '/admin/products', icon: <FiShoppingBag />, label: 'Sản phẩm' },
    { to: '/admin/orders', icon: <FiPackage />, label: 'Đơn hàng' },
    { to: '/admin/customers', icon: <FiUsers />, label: 'Khách hàng' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        background: 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        top: 0,
        left: 0,
        height: '100vh',
        zIndex: 100,
        boxShadow: '2px 0 24px rgba(0,0,0,0.15)',
      }}>
        {/* Logo */}
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiShoppingBag style={{ fontSize: '24px', color: 'var(--primary)' }} />
            <div>
              <div style={{ fontSize: '18px', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LUNINA</div>
              <div style={{ fontSize: '11px', color: '#666', marginTop: '-2px' }}>Admin Panel</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '16px 12px' }}>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 14px',
                marginBottom: '4px',
                borderRadius: '10px',
                fontSize: '14px',
                fontWeight: 600,
                color: isActive ? '#fff' : '#888',
                background: isActive ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.2s',
                boxShadow: isActive ? '0 4px 12px rgba(238,77,45,0.3)' : 'none',
              })}
              onMouseEnter={(e) => {
                if (!e.currentTarget.classList.contains('active')) {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#888';
                }
              }}
            >
              <span style={{ fontSize: '18px' }}>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User Info */}
        <div style={{ padding: '16px 12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', padding: '10px 8px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '14px', flexShrink: 0 }}>
              {currentUser?.fullName.charAt(0)}
            </div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#fff' }}>{currentUser?.fullName}</div>
              <div style={{ fontSize: '11px', color: '#666' }}>Admin</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 14px', background: 'rgba(238,77,45,0.12)', border: 'none', borderRadius: '10px', color: 'var(--primary)', fontSize: '14px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(238,77,45,0.2)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(238,77,45,0.12)'}
          >
            <FiLogOut /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, marginLeft: '240px', minHeight: '100vh', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  );
};

export default AdminLayout;
