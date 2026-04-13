import { Link } from 'react-router-dom';
import { HiOutlineShoppingBag } from 'react-icons/hi';
import { FiFacebook, FiInstagram, FiPhone, FiMail } from 'react-icons/fi';

const Footer = () => (
  <footer style={{
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    color: '#ccc',
    padding: '48px 0 24px',
    marginTop: '60px',
  }}>
    <div className="container">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '40px' }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <HiOutlineShoppingBag style={{ fontSize: '28px', color: 'var(--primary)' }} />
            <span style={{ fontSize: '22px', fontWeight: 900, background: 'linear-gradient(135deg, var(--primary), var(--secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>LUNINA</span>
          </div>
          <p style={{ fontSize: '14px', lineHeight: '1.7', color: '#999' }}>
            Thời trang chất lượng cao, phong cách hiện đại. Mang đến cho bạn sự tự tin và phong cách trong từng bộ trang phục.
          </p>
        </div>

        {/* Links */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '15px' }}>Danh mục</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Áo', 'Quần', 'Váy', 'Sale'].map((c) => (
              <Link key={c} to={`/products?category=${c}`} style={{ color: '#999', fontSize: '14px', textDecoration: 'none', transition: 'color 0.15s' }}
                onMouseEnter={e => e.target.style.color = 'var(--primary)'}
                onMouseLeave={e => e.target.style.color = '#999'}
              >{c}</Link>
            ))}
          </div>
        </div>

        {/* Support */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '15px' }}>Hỗ trợ</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {['Chính sách đổi trả', 'Hướng dẫn mua hàng', 'Chính sách bảo mật', 'Liên hệ'].map((t) => (
              <span key={t} style={{ color: '#999', fontSize: '14px', cursor: 'pointer' }}>{t}</span>
            ))}
          </div>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: '#fff', marginBottom: '16px', fontSize: '15px' }}>Liên hệ</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[
              { icon: <FiPhone />, text: '0901 234 567' },
              { icon: <FiMail />, text: 'hello@lunina.vn' },
              { icon: <FiFacebook />, text: 'facebook.com/lunina' },
              { icon: <FiInstagram />, text: '@lunina.fashion' },
            ].map(({ icon, text }, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#999' }}>
                {icon} {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <p style={{ fontSize: '13px', color: '#666' }}>© 2026 LUNINA. Tất cả quyền được bảo lưu.</p>
        <p style={{ fontSize: '13px', color: '#666' }}>Được làm với ❤️ tại Việt Nam</p>
      </div>
    </div>
  </footer>
);

export default Footer;
