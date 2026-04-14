import { useNavigate } from 'react-router-dom';
import { FiShoppingCart, FiStar } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import { formatCurrency } from '../../utils/formatUtils';
import { toast } from 'react-toastify';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { currentUser } = useAuth();
  const { getVariantsByProduct } = useShop();
  const navigate = useNavigate();

  const variants = getVariantsByProduct(product.id);
  const uniqueSizes = [...new Set(variants.map(v => v.sizeName).filter(Boolean))];

  const totalStock = variants.length > 0 
    ? variants.reduce((sum, v) => sum + (v.stock || 0), 0)
    : (product.stockQuantity || 0);
  const isOutOfStock = totalStock <= 0;

  const handleAddToCart = (e) => {
    e.stopPropagation();
    if (!currentUser) {
      toast.info('Vui lòng đăng nhập để thêm vào giỏ hàng!');
      navigate('/login');
      return;
    }
    if (variants && variants.length > 0) {
      toast.info('Vui lòng chọn kích cỡ/màu sắc trên trang chi tiết!');
      navigate(`/products/${product.id}`);
      return;
    }
    addToCart(product, 1);
    toast.success(`Đã thêm "${product.name}" vào giỏ hàng!`, { autoClose: 2000 });
  };

  return (
    <div className="product-card" onClick={() => navigate(`/products/${product.id}`)}>
      <div className="product-card-img">
        <img src={product.imageUrl} alt={product.name} className="img-cover" />
        <div className="product-card-overlay">
          {!isOutOfStock ? (
            <button className="quick-add-btn" onClick={handleAddToCart}>
              <FiShoppingCart /> Thêm vào giỏ
            </button>
          ) : (
            <button className="quick-add-btn" style={{ background: '#b0bec5', color: '#fff', cursor: 'not-allowed' }} onClick={(e) => { e.stopPropagation(); toast.error('Sản phẩm này tạm thời hết hàng!'); }}>
              Hết hàng
            </button>
          )}
        </div>
        {isOutOfStock ? (
          <div className="product-low-badge" style={{ background: '#e53935' }}>Hết hàng</div>
        ) : product.sold > 200 ? (
          <div className="product-hot-badge">🔥 Hot</div>
        ) : totalStock < 20 && totalStock > 0 ? (
          <div className="product-low-badge">Sắp hết</div>
        ) : null}
      </div>
      <div className="product-card-body">
        <p className="product-card-name line-clamp-2">{product.name}</p>
        
        {uniqueSizes.length > 0 && (
          <div className="product-card-sizes">
            {uniqueSizes.map(size => (
              <span key={size} className="size-badge">{size}</span>
            ))}
          </div>
        )}

        <div className="product-card-footer">
          <span className="product-card-price">{formatCurrency(product.price)}</span>
          <div className="product-card-sold">
            <FiStar style={{ color: '#f9a825', fontSize: '12px' }} />
            <span>Đã bán {product.sold > 999 ? `${(product.sold/1000).toFixed(1)}k` : product.sold}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
