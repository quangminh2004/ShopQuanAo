import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiArrowLeft, FiPlus, FiMinus, FiCheck } from 'react-icons/fi';
import { useShop } from '../../contexts/ShopContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency } from '../../utils/formatUtils';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';
import { toast } from 'react-toastify';
import './ProductDetail.css';

const ProductDetail = () => {
  const { id } = useParams();
  const { getProduct, getVariantsByProduct, getCategoryName } = useShop();
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const product = getProduct(id);
  const allVariants = getVariantsByProduct(id);

  // Derived color / size options from variants
  const colors = useMemo(() => [...new Set(allVariants.map((v) => v.colorName))], [allVariants]);
  const [selectedColor, setSelectedColor] = useState(colors[0] || null);

  const sizesForColor = useMemo(
    () => allVariants.filter((v) => v.colorName === selectedColor),
    [allVariants, selectedColor]
  );
  const [selectedVariant, setSelectedVariant] = useState(null);

  // When color changes reset variant
  const handleColorSelect = (color) => {
    setSelectedColor(color);
    setSelectedVariant(null);
  };

  const handleSizeSelect = (variant) => {
    setSelectedVariant(variant);
  };

  // Displayed image: variant image if color selected, else product default
  const variantImageForColor = allVariants.find((v) => v.colorName === selectedColor)?.variantImageUrl;
  const displayImage = variantImageForColor || product?.imageUrl;

  // Price: from selected variant or product base price
  const displayPrice = selectedVariant?.price ?? (sizesForColor[0]?.price ?? product?.price);

  const [qty, setQty] = useState(1);
  const maxQty = selectedVariant?.stock ?? product?.stockQuantity ?? 0;

  if (!product) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="container section">
          <div className="empty-state">
            <div className="empty-state-icon">❌</div>
            <div className="empty-state-title">Không tìm thấy sản phẩm</div>
            <button className="btn btn-primary mt-16" onClick={() => navigate('/')}>Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  const hasVariants = allVariants.length > 0;
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.stockQuantity > 0;

  const handleAddToCart = () => {
    if (!currentUser) { toast.info('Vui lòng đăng nhập!'); navigate('/login'); return; }
    if (hasVariants && !selectedVariant) { toast.warning('Vui lòng chọn kích cỡ!'); return; }
    addToCart(product, qty, selectedVariant);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`);
  };

  const handleBuyNow = () => {
    if (!currentUser) { toast.info('Vui lòng đăng nhập!'); navigate('/login'); return; }
    if (hasVariants && !selectedVariant) { toast.warning('Vui lòng chọn kích cỡ!'); return; }
    addToCart(product, qty, selectedVariant);
    navigate('/checkout');
  };

  const categoryName = getCategoryName(product.categoryId);

  return (
    <div className="page-wrapper">
      <Header />
      <div className="container section">
        <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Quay lại
        </button>

        <div className="product-detail-grid">
          {/* Left — Images */}
          <div className="product-detail-img-col">
            <div className="product-detail-main-img">
              <img src={displayImage} alt={product.name} />
            </div>
            {/* Color thumbnails */}
            {colors.length > 1 && (
              <div className="color-thumbnails">
                {colors.map((color) => {
                  const thumb = allVariants.find((v) => v.colorName === color)?.variantImageUrl || product.imageUrl;
                  return (
                    <div
                      key={color}
                      className={`color-thumb ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => handleColorSelect(color)}
                    >
                      <img src={thumb} alt={color} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right — Info */}
          <div className="product-detail-info">
            <span className="product-category-badge">{categoryName}</span>
            <h1 className="product-detail-name">{product.name}</h1>

            <div className="product-detail-meta">
              <span>⭐ {(4.5 + Math.random() * 0.4).toFixed(1)} / 5.0</span>
              <span>🛒 Đã bán: {product.sold?.toLocaleString() || 0}</span>
            </div>

            <div className="product-detail-price">{formatCurrency(displayPrice)}</div>

            {/* Color Picker */}
            {colors.length > 0 && (
              <div className="variant-section">
                <div className="variant-label">
                  Màu sắc: <strong>{selectedColor}</strong>
                </div>
                <div className="color-chips">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`color-chip ${selectedColor === color ? 'active' : ''}`}
                      onClick={() => handleColorSelect(color)}
                    >
                      {selectedColor === color && <FiCheck className="chip-check" />}
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Size Picker */}
            {sizesForColor.length > 0 && (
              <div className="variant-section">
                <div className="variant-label">
                  Kích cỡ: {selectedVariant && <strong>{selectedVariant.sizeName}</strong>}
                </div>
                <div className="size-chips">
                  {sizesForColor.map((variant) => (
                    <button
                      key={variant.id}
                      className={`size-chip ${selectedVariant?.id === variant.id ? 'active' : ''} ${variant.stock === 0 ? 'out' : ''}`}
                      onClick={() => variant.stock > 0 && handleSizeSelect(variant)}
                      disabled={variant.stock === 0}
                      title={variant.stock === 0 ? 'Hết hàng' : `Còn ${variant.stock}`}
                    >
                      {variant.sizeName}
                      {variant.stock === 0 && <span className="out-label">Hết</span>}
                    </button>
                  ))}
                </div>
                {selectedVariant && (
                  <p className="stock-hint">
                    {selectedVariant.stock > 0
                      ? <span style={{ color: 'var(--success)' }}>✓ Còn {selectedVariant.stock} sản phẩm</span>
                      : <span style={{ color: 'var(--error)' }}>✗ Hết hàng</span>}
                  </p>
                )}
              </div>
            )}

            {/* No variants fallback */}
            {!hasVariants && (
              <p style={{ fontSize: '14px', color: product.stockQuantity > 0 ? 'var(--success)' : 'var(--error)', fontWeight: 600, marginBottom: '16px' }}>
                {product.stockQuantity > 0 ? `✓ Còn ${product.stockQuantity} sản phẩm` : '✗ Hết hàng'}
              </p>
            )}

            {/* Description */}
            <div className="product-detail-desc">
              <p>{product.description}</p>
            </div>

            {/* Quantity */}
            <div className="qty-section">
              <span className="variant-label">Số lượng:</span>
              <div className="qty-control">
                <button className="qty-btn" onClick={() => setQty(Math.max(1, qty - 1))}><FiMinus /></button>
                <input className="qty-input" value={qty} readOnly style={{ width: '56px' }} />
                <button className="qty-btn" onClick={() => setQty(Math.min(maxQty || 99, qty + 1))}><FiPlus /></button>
              </div>
            </div>

            {/* Actions */}
            <div className="product-actions">
              <button className="btn btn-secondary btn-lg" style={{ flex: 1 }} onClick={handleAddToCart} disabled={!inStock}>
                <FiShoppingCart /> Thêm vào giỏ
              </button>
              <button className="btn btn-primary btn-lg" style={{ flex: 1 }} onClick={handleBuyNow} disabled={!inStock}>
                Mua ngay
              </button>
            </div>

            {/* Policies */}
            <div className="product-policies">
              {['🚚 Miễn phí vận chuyển đơn từ 300k', '🔄 Đổi trả trong 7 ngày', '✅ Hàng chính hãng 100%'].map((t, i) => (
                <p key={i}>{t}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProductDetail;
