import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiTag, FiArrowLeft, FiTrash2 } from 'react-icons/fi';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { useShop } from '../../contexts/ShopContext';
import { formatCurrency } from '../../utils/formatUtils';
import { getDiscount, RANK_CONFIG } from '../../utils/rankUtils';
import RankBadge from '../../components/common/RankBadge';
import Header from '../../components/layout/Header';
import { toast } from 'react-toastify';

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, removeFromCart } = useCart();
  const { currentUser, addSpending } = useAuth();
  const { placeOrder } = useShop();
  const navigate = useNavigate();

  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);

  const discount = getDiscount(currentUser?.rank || 'NORMAL');
  const discountAmount = Math.round(cartTotal * discount);
  const finalTotal = cartTotal - discountAmount;

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      toast.error('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }
    if (cartItems.length === 0) {
      toast.error('Giỏ hàng trống!');
      return;
    }
    setLoading(true);
    try {
      const result = await placeOrder({
        userId: currentUser.id,
        deliveryAddress: address,
        items: cartItems.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.name,
          sizeName: item.sizeName,
          colorName: item.colorName,
          quantity: item.quantity,
          unitPrice: item.price,
          price: item.price,
          imageUrl: item.imageUrl,
        })),
        totalAmount: finalTotal,
        discountApplied: discountAmount,
      });

      if (result) {
        addSpending(currentUser.id, finalTotal);
        clearCart();
        toast.success('🎉 Đặt hàng thành công!');
        navigate('/orders');
      } else {
        toast.error('Đặt hàng thất bại, vui lòng thử lại!');
      }
    } catch (err) {
      console.error(err);
      toast.error('Có lỗi xảy ra khi đặt hàng!');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="page-wrapper">
        <Header />
        <div className="container section">
          <div className="empty-state">
            <div className="empty-state-icon">🛒</div>
            <div className="empty-state-title">Giỏ hàng trống</div>
            <button className="btn btn-primary mt-16" onClick={() => navigate('/')}>Mua sắm ngay</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <Header />
      <div className="container section">
        <button className="btn btn-ghost btn-sm mb-16" onClick={() => navigate(-1)}>
          <FiArrowLeft /> Quay lại giỏ hàng
        </button>
        <h2 style={{ marginBottom: '24px', fontSize: '22px', fontWeight: 800 }}>🛒 Thanh toán</h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>
          {/* Left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Address */}
            <div className="card">
              <div className="card-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiMapPin style={{ color: 'var(--primary)' }} /> Địa chỉ giao hàng
                </div>
              </div>
              <div className="card-body">
                <input
                  className="form-input"
                  type="text"
                  placeholder="Nhập địa chỉ giao hàng chi tiết..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>
            </div>

            {/* Items */}
            <div className="card">
              <div className="card-header">🛍️ Sản phẩm ({cartItems.length})</div>
              <div className="card-body" style={{ padding: '8px 16px' }}>
                {cartItems.map((item) => (
                  <div key={item.itemKey} style={{ display: 'flex', gap: '12px', padding: '12px 0', borderBottom: '1px solid var(--border-light)' }}>
                    <img src={item.imageUrl} alt={item.name} style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: '14px', fontWeight: 600, marginBottom: '4px' }}>{item.name}</p>
                      {(item.colorName || item.sizeName) && (
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                          {item.colorName} {item.sizeName ? `- Size ${item.sizeName}` : ''}
                        </p>
                      )}
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>x{item.quantity}</p>
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--primary)', flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'center', gap: '8px' }}>
                      {formatCurrency(item.price * item.quantity)}
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ padding: '4px', color: 'red', height: 'auto', minHeight: 'auto' }}
                        onClick={() => removeFromCart(item.itemKey)}
                        title="Xóa sản phẩm"
                      >
                        <FiTrash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right - Summary */}
          <div className="card" style={{ position: 'sticky', top: '80px' }}>
            <div className="card-header">📋 Tóm tắt đơn hàng</div>
            <div className="card-body">
              {/* User rank */}
              {currentUser?.rank !== 'NORMAL' && (
                <div style={{ background: 'var(--bg)', borderRadius: 'var(--radius-md)', padding: '12px', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Hạng thẻ của bạn</p>
                    <RankBadge rank={currentUser.rank} />
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Chiết khấu</p>
                    <p style={{ fontSize: '18px', fontWeight: 800, color: 'var(--success)' }}>-{discount * 100}%</p>
                  </div>
                </div>
              )}

              {/* Price breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Tạm tính</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Phí vận chuyển</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>Miễn phí</span>
                </div>
                {discountAmount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                    <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <FiTag /> Chiết khấu hạng thẻ ({discount * 100}%)
                    </span>
                    <span style={{ color: 'var(--success)', fontWeight: 700 }}>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div style={{ height: '1px', background: 'var(--border)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 800 }}>
                  <span>Tổng cộng</span>
                  <span style={{ color: 'var(--primary)' }}>{formatCurrency(finalTotal)}</span>
                </div>
              </div>

              <button
                className="btn btn-primary btn-lg btn-block"
                onClick={handlePlaceOrder}
                disabled={loading}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> Đang xử lý...</>
                ) : '🎉 Đặt hàng ngay'}
              </button>

              <p style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', marginTop: '10px' }}>
                Bạn sẽ được chuyển tới trang lịch sử đơn hàng
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
