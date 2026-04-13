import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiX, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { formatCurrency } from '../../utils/formatUtils';
import './CartDrawer.css';

const CartDrawer = ({ isOpen, onClose }) => {
  const { cartItems, removeFromCart, updateQuantity, cartTotal } = useCart();
  const navigate = useNavigate();

  const handleCheckout = () => {
    onClose();
    navigate('/checkout');
  };

  return (
    <>
      {isOpen && <div className="cart-backdrop" onClick={onClose} />}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FiShoppingBag style={{ fontSize: '20px', color: 'var(--primary)' }} />
            <h3>Giỏ hàng ({cartItems.length})</h3>
          </div>
          <button className="btn btn-icon btn-ghost" onClick={onClose}>
            <FiX style={{ fontSize: '20px' }} />
          </button>
        </div>

        <div className="cart-drawer-body">
          {cartItems.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🛒</div>
              <div className="empty-state-title">Giỏ hàng trống</div>
              <p className="empty-state-desc">Hãy thêm sản phẩm vào giỏ hàng nhé!</p>
              <button className="btn btn-primary mt-16" onClick={onClose}>Khám phá ngay</button>
            </div>
          ) : (
            <div className="cart-items">
              {cartItems.map((item) => (
                <div key={item.itemKey} className="cart-item">
                  <img src={item.imageUrl} alt={item.name} className="cart-item-img" />
                  <div className="cart-item-info">
                    <h4 className="cart-item-name">{item.name}</h4>
                    {(item.colorName || item.sizeName) && (
                      <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                        Phân loại: {item.colorName} {item.sizeName ? `- ${item.sizeName}` : ''}
                      </p>
                    )}
                    <div className="cart-item-price">{formatCurrency(item.price)}</div>
                    <div className="qty-control" style={{ marginTop: '8px' }}>
                      <button className="qty-btn" onClick={() => updateQuantity(item.itemKey, item.quantity - 1)}><FiMinus /></button>
                      <input className="qty-input" value={item.quantity} readOnly />
                      <button className="qty-btn" onClick={() => updateQuantity(item.itemKey, item.quantity + 1)}><FiPlus /></button>
                    </div>
                  </div>
                  <button
                    className="cart-item-remove"
                    onClick={() => removeFromCart(item.itemKey)}
                    title="Xóa"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal">
              <span>Tạm tính:</span>
              <span className="cart-subtotal-price">{formatCurrency(cartTotal)}</span>
            </div>
            <button className="btn btn-primary btn-lg btn-block" onClick={handleCheckout}>
              Đặt hàng ngay →
            </button>
            <button className="btn btn-ghost btn-block mt-8" onClick={onClose} style={{ marginTop: '8px' }}>
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
