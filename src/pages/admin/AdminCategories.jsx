import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiTag, FiX, FiCheck } from 'react-icons/fi';
import { useShop } from '../../contexts/ShopContext';
import AdminLayout from '../../components/layout/AdminLayout';
import { toast } from 'react-toastify';

const EMPTY_FORM = { name: '', description: '' };

const AdminCategories = () => {
  const { categories, addCategory, updateCategory, deleteCategory } = useShop();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditingId(cat.id);
    setForm({ name: cat.name, description: cat.description || '' });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error('Vui lòng nhập tên danh mục!');
      return;
    }
    setSaving(true);
    try {
      if (editingId) {
        await updateCategory(editingId, form);
        toast.success('Cập nhật danh mục thành công!');
      } else {
        await addCategory(form);
        toast.success('Thêm danh mục thành công!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || err?.message || 'Lỗi lưu danh mục! Kiểm tra kết nối server.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCategory(id);
      setDeleteConfirm(null);
      toast.success('Đã xóa danh mục!');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Lỗi xóa danh mục (có thể có sản phẩm đang dùng danh mục này)!');
    }
  };

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <FiTag style={{ color: 'var(--primary)' }} /> Quản lý Danh mục
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
              Tạo danh mục trước khi thêm sản phẩm — {categories.length} danh mục
            </p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>
            <FiPlus /> Thêm danh mục
          </button>
        </div>

        {/* Category Grid */}
        {categories.length === 0 ? (
          <div className="empty-state" style={{ marginTop: '60px' }}>
            <div className="empty-state-icon">🏷️</div>
            <div className="empty-state-title">Chưa có danh mục nào</div>
            <p className="empty-state-desc">Tạo danh mục trước để có thể thêm sản phẩm vào hệ thống.</p>
            <button className="btn btn-primary mt-16" onClick={openCreate}>
              <FiPlus /> Tạo danh mục đầu tiên
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
            {categories.map(cat => (
              <div key={cat.id} className="card" style={{ transition: 'transform 0.2s, box-shadow 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
              >
                <div style={{ padding: '20px 20px 16px' }}>
                  {/* Icon + Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
                    <div style={{
                      width: '44px', height: '44px', borderRadius: '12px',
                      background: 'linear-gradient(135deg, var(--primary-bg), #fff0ed)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', flexShrink: 0,
                    }}>
                      🏷️
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cat.name}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: #{cat.id}</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, minHeight: '40px',
                    overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {cat.description || <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>Chưa có mô tả</span>}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-light)', display: 'flex', gap: '8px' }}>
                  <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => openEdit(cat)}>
                    <FiEdit2 /> Sửa
                  </button>
                  {deleteConfirm === cat.id ? (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-sm" style={{ background: 'var(--error)', color: '#fff', border: 'none' }}
                        onClick={() => handleDelete(cat.id)}>
                        <FiCheck /> Xác nhận
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setDeleteConfirm(null)}>
                        <FiX />
                      </button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--error)' }}
                      onClick={() => setDeleteConfirm(cat.id)}>
                      <FiTrash2 /> Xóa
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal thêm/sửa danh mục */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px', animation: 'slideUp 0.2s ease' }}>
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '16px' }}>
                {editingId ? '✏️ Sửa danh mục' : '➕ Thêm danh mục mới'}
              </span>
              <button className="btn btn-ghost btn-sm" onClick={() => setModalOpen(false)} style={{ padding: '4px' }}>
                <FiX />
              </button>
            </div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Name */}
              <div className="form-group">
                <label className="form-label">Tên danh mục <span style={{ color: 'var(--error)' }}>*</span></label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="Ví dụ: Áo, Quần, Váy..."
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  onKeyDown={e => e.key === 'Enter' && handleSave()}
                  autoFocus
                />
              </div>
              {/* Description */}
              <div className="form-group">
                <label className="form-label">Mô tả</label>
                <textarea
                  className="form-input"
                  placeholder="Mô tả ngắn về danh mục này..."
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  style={{ resize: 'vertical' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button className="btn btn-ghost" onClick={() => setModalOpen(false)} disabled={saving}>
                  Hủy
                </button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? (
                    <><span className="spinner" style={{ width: '14px', height: '14px', borderWidth: '2px' }} /> Đang lưu...</>
                  ) : (
                    <><FiCheck /> {editingId ? 'Cập nhật' : 'Thêm mới'}</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
