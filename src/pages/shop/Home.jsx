import { useState, useMemo } from 'react';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { useShop } from '../../contexts/ShopContext';
import ProductCard from '../../components/product/ProductCard';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import './Home.css';

const SORT_OPTIONS = [
  { value: 'default', label: 'Phổ biến nhất' },
  { value: 'price_asc', label: 'Giá: Thấp → Cao' },
  { value: 'price_desc', label: 'Giá: Cao → Thấp' },
  { value: 'sold', label: 'Bán chạy nhất' },
  { value: 'newest', label: 'Mới nhất' },
];

const Home = () => {
  const { products, categories } = useShop();
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('all');
  const [sort, setSort] = useState('default');

  const filtered = useMemo(() => {
    let list = [...products];
    if (categoryId !== 'all') list = list.filter((p) => p.categoryId === categoryId);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    switch (sort) {
      case 'price_asc': list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
      case 'sold': list.sort((a, b) => (b.sold || 0) - (a.sold || 0)); break;
      case 'newest': list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default: list.sort((a, b) => (b.sold || 0) - (a.sold || 0));
    }
    return list;
  }, [products, search, categoryId, sort]);

  return (
    <div className="page-wrapper">
      <Header />

      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <div className="hero-tag">✨ Bộ sưu tập mới 2026</div>
          <h1 className="hero-title">
            Thời trang <span className="hero-highlight">LUNINA</span><br />
            Tự tin mỗi ngày
          </h1>
          <p className="hero-desc">Khám phá hàng trăm sản phẩm thời trang chất lượng cao, phong cách hiện đại với giá ưu đãi nhất.</p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <a href="#products" className="btn btn-primary btn-lg" style={{ borderRadius: '9999px' }}>
              🛍️ Mua sắm ngay
            </a>
            <a href="#products" className="btn btn-secondary btn-lg" style={{ borderRadius: '9999px', background: 'rgba(255,255,255,0.15)', border: '2px solid rgba(255,255,255,0.5)', color: '#fff' }}>
              Khám phá →
            </a>
          </div>
        </div>
        <div className="hero-image">
          <div className="hero-float-card hero-float-1">🥇 Vàng thành viên</div>
          <div className="hero-float-card hero-float-2">💎 -15% Kim Cương</div>
          <div className="hero-float-card hero-float-3">🔥 Hot 500+ đã bán</div>
          <img
            src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=700&fit=crop"
            alt="LUNINA Fashion"
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '24px' }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="container">
        <div className="stats-row">
          {[
            { icon: '🛍️', value: `${products.length}+`, label: 'Sản phẩm' },
            { icon: '👥', value: '1,200+', label: 'Khách hàng' },
            { icon: '⭐', value: '4.9/5', label: 'Đánh giá' },
            { icon: '🚚', value: 'Miễn phí', label: 'Giao hàng' },
          ].map((s, i) => (
            <div key={i} className="stat-item">
              <div className="stat-item-icon">{s.icon}</div>
              <div className="stat-item-value">{s.value}</div>
              <div className="stat-item-label">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Products Section */}
      <div className="container section" id="products">
        {/* Filters */}
        <div className="filters-bar">
          <div className="search-bar" style={{ flex: 1, maxWidth: '440px' }}>
            <FiSearch className="search-bar-icon" />
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="category-chips">
            <button
              className={`category-chip ${categoryId === 'all' ? 'active' : ''}`}
              onClick={() => setCategoryId('all')}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`category-chip ${categoryId === c.id ? 'active' : ''}`}
                onClick={() => setCategoryId(c.id)}
              >
                {c.name}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative' }}>
            <FiFilter style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <select
              className="form-select"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{ paddingLeft: '36px', minWidth: '180px' }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="section-header">
          <h2 className="section-title">
            {categoryId === 'all' ? '🛍️ Tất cả sản phẩm' : `👗 ${categories.find(c => c.id === categoryId)?.name || ''}`}
          </h2>
          <span className="section-count">{filtered.length} sản phẩm</span>
        </div>

        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🔍</div>
            <div className="empty-state-title">Không tìm thấy sản phẩm</div>
            <p className="empty-state-desc">Thử tìm kiếm với từ khóa khác nhé!</p>
          </div>
        ) : (
          <div className="product-grid">
            {filtered.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Home;
