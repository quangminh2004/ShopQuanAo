import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiSave } from 'react-icons/fi';
import { useShop } from '../../contexts/ShopContext';
import { formatCurrency, formatDateOnly } from '../../utils/formatUtils';
import AdminLayout from '../../components/layout/AdminLayout';
import Modal from '../../components/common/Modal';
import { toast } from 'react-toastify';

const EMPTY_FORM = {
  name: '', description: '', price: '', categoryId: 1,
  imageUrl: '', stockQuantity: '',
};

const EMPTY_VARIANT_FORM = {
  sizeName: '', colorName: '', price: '', stock: '', variantImageUrl: ''
};

const AdminProducts = () => {
  const { 
    products, categories, addProduct, updateProduct, deleteProduct, getCategoryName,
    getVariantsByProduct, addVariant, updateVariant, deleteVariant 
  } = useShop();
  const [search, setSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Variant states
  const [variantModalOpen, setVariantModalOpen] = useState(false);
  const [activeProductId, setActiveProductId] = useState(null);
  const [editingVariantId, setEditingVariantId] = useState(null);
  const [variantForm, setVariantForm] = useState(EMPTY_VARIANT_FORM);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });
  const setV = (field) => (e) => setVariantForm({ ...variantForm, [field]: e.target.value });

  const filtered = products.filter((p) => {
    const matchCat = filterCategoryId === 'all' || p.categoryId === parseInt(filterCategoryId);
    const matchSearch = !search.trim() || p.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price,
      categoryId: product.categoryId,
      imageUrl: product.imageUrl,
      stockQuantity: product.stockQuantity,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name.trim() || !form.price || !form.stockQuantity) {
      toast.error('Vui lòng điền đủ thông tin bắt buộc!');
      return;
    }
    if (editingId) {
      updateProduct(editingId, {
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        categoryId: parseInt(form.categoryId),
      });
      toast.success('Cập nhật sản phẩm thành công!');
    } else {
      addProduct({
        ...form,
        price: parseFloat(form.price),
        stockQuantity: parseInt(form.stockQuantity),
        categoryId: parseInt(form.categoryId),
        sold: 0,
      });
      toast.success('Thêm sản phẩm thành công!');
    }
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    deleteProduct(id);
    setDeleteConfirm(null);
    toast.success('Đã xóa sản phẩm!');
  };

  // ---- Variants Logic ----
  const activeVariants = activeProductId ? getVariantsByProduct(activeProductId) : [];
  
  const openVariants = (product) => {
    setActiveProductId(product.id);
    setVariantForm(EMPTY_VARIANT_FORM);
    setEditingVariantId(null);
    setVariantModalOpen(true);
  };

  const handleSaveVariant = () => {
    if (!variantForm.sizeName?.trim() && !variantForm.colorName?.trim()) {
      toast.error('Cần nhập Kích cỡ hoặc Màu sắc!'); return;
    }
    if (!variantForm.price || !variantForm.stock) {
      toast.error('Cần nhập giá và tồn kho riêng cho phân loại này!'); return;
    }
    const data = {
      ...variantForm,
      productId: activeProductId,
      price: parseFloat(variantForm.price),
      stock: parseInt(variantForm.stock),
    };
    if (editingVariantId) {
      updateVariant(editingVariantId, data);
      setEditingVariantId(null);
      toast.success('Đã cập nhật phân loại!');
    } else {
      addVariant(data);
      toast.success('Đã thêm phân loại!');
    }
    setVariantForm(EMPTY_VARIANT_FORM);
  };

  const startEditVariant = (v) => {
    setEditingVariantId(v.id);
    setVariantForm({
      sizeName: v.sizeName || '',
      colorName: v.colorName || '',
      price: v.price || '',
      stock: v.stock || 0,
      variantImageUrl: v.variantImageUrl || '',
    });
  };

  return (
    <AdminLayout>
      <div style={{ padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 800 }}>🛍️ Quản lý sản phẩm</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginTop: '4px' }}>{products.length} sản phẩm</p>
          </div>
          <button className="btn btn-primary" onClick={openAdd}>
            <FiPlus /> Thêm sản phẩm
          </button>
        </div>

        {/* Filters */}
        <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', padding: '16px', boxShadow: 'var(--shadow-sm)', marginBottom: '20px', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div className="search-bar" style={{ flex: 1, maxWidth: '340px' }}>
            <FiSearch className="search-bar-icon" />
            <input type="text" placeholder="Tìm sản phẩm..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <button
              className={`category-chip ${filterCategoryId === 'all' ? 'active' : ''}`}
              onClick={() => setFilterCategoryId('all')}
              style={{ padding: '7px 14px', borderRadius: '9999px', border: '1.5px solid var(--border)', background: filterCategoryId === 'all' ? 'var(--primary)' : '#fff', color: filterCategoryId === 'all' ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
            >
              Tất cả
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`category-chip ${filterCategoryId === c.id ? 'active' : ''}`}
                onClick={() => setFilterCategoryId(c.id)}
                style={{ padding: '7px 14px', borderRadius: '9999px', border: '1.5px solid var(--border)', background: filterCategoryId === c.id ? 'var(--primary)' : '#fff', color: filterCategoryId === c.id ? '#fff' : 'var(--text-secondary)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="card">
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '60px' }}>Ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Giá</th>
                  <th>Tồn kho</th>
                  <th>Đã bán</th>
                  <th>Ngày tạo</th>
                  <th style={{ textAlign: 'center' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <img src={p.imageUrl} alt={p.name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px' }} />
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '14px', maxWidth: '200px' }} className="line-clamp-2">{p.name}</div>
                    </td>
                    <td>
                      <span style={{ background: 'var(--primary-bg)', color: 'var(--primary)', fontSize: '12px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px' }}>
                        {getCategoryName(p.categoryId)}
                      </span>
                    </td>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{formatCurrency(p.price)}</td>
                    <td>
                      <span style={{ color: p.stockQuantity < 20 ? 'var(--error)' : 'var(--success)', fontWeight: 700 }}>
                        {p.stockQuantity}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{p.sold || 0}</td>
                    <td style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{formatDateOnly(p.createdAt)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Phân loại" onClick={() => openVariants(p)}>
                          📦
                        </button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Sửa" onClick={() => openEdit(p)}>
                          <FiEdit2 style={{ color: 'var(--info)' }} />
                        </button>
                        <button className="btn btn-ghost btn-sm btn-icon" title="Xóa" onClick={() => setDeleteConfirm(p)}>
                          <FiTrash2 style={{ color: 'var(--error)' }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="empty-state"><div className="empty-state-icon">📦</div><div className="empty-state-title">Không có sản phẩm</div></div>
            )}
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingId ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setModalOpen(false)}><FiX /> Hủy</button>
            <button className="btn btn-primary" onClick={handleSave}><FiSave /> {editingId ? 'Cập nhật' : 'Thêm mới'}</button>
          </>
        }
      >
        <div className="form-group">
          <label className="form-label">Tên sản phẩm *</label>
          <input className="form-input" type="text" placeholder="Nhập tên sản phẩm..." value={form.name} onChange={set('name')} />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Giá (VNĐ) *</label>
            <input className="form-input" type="number" placeholder="199000" value={form.price} onChange={set('price')} />
          </div>
          <div className="form-group">
            <label className="form-label">Tồn kho *</label>
            <input className="form-input" type="number" placeholder="100" value={form.stockQuantity} onChange={set('stockQuantity')} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Danh mục</label>
          <select className="form-select" value={form.categoryId} onChange={set('categoryId')}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">URL ảnh sản phẩm</label>
          <input className="form-input" type="text" placeholder="https://images.unsplash.com/..." value={form.imageUrl} onChange={set('imageUrl')} />
          {form.imageUrl && (
            <img src={form.imageUrl} alt="preview" style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '10px', marginTop: '8px' }}
              onError={(e) => { e.target.style.display = 'none'; }} />
          )}
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Mô tả</label>
          <textarea className="form-textarea" placeholder="Mô tả sản phẩm..." value={form.description} onChange={set('description')} />
        </div>
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="⚠️ Xác nhận xóa"
        size="sm"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Hủy</button>
            <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Xóa</button>
          </>
        }
      >
        <p style={{ fontSize: '14px' }}>Bạn có chắc muốn xóa <strong>"{deleteConfirm?.name}"</strong>?<br />Hành động này không thể hoàn tác.</p>
      </Modal>

      {/* Variant Manager Modal */}
      <Modal
        isOpen={variantModalOpen}
        onClose={() => setVariantModalOpen(false)}
        title={`📦 Quản lý Phân loại (Sản phẩm #${activeProductId})`}
        size="lg"
      >
        <div style={{ display: 'flex', gap: '16px', flexDirection: 'column' }}>
          
          {/* Variant Form */}
          <div style={{ background: 'var(--bg)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <h4 style={{ fontSize: '14px', marginBottom: '12px', fontWeight: 700 }}>
              {editingVariantId ? 'Sửa phân loại' : 'Thêm phân loại mới (Giá riêng & Tồn kho riêng)'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Kích cỡ (VD: S, M, XL)</label>
                <input className="form-input" style={{ padding: '6px 12px', fontSize: '14px' }} type="text" value={variantForm.sizeName} onChange={setV('sizeName')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Màu sắc (VD: Đen, Trắng)</label>
                <input className="form-input" style={{ padding: '6px 12px', fontSize: '14px' }} type="text" value={variantForm.colorName} onChange={setV('colorName')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Giá riêng (VNĐ) *</label>
                <input className="form-input" style={{ padding: '6px 12px', fontSize: '14px' }} type="number" placeholder="Cao hơn gía gốc..." value={variantForm.price} onChange={setV('price')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Số lượng tồn kho *</label>
                <input className="form-input" style={{ padding: '6px 12px', fontSize: '14px' }} type="number" value={variantForm.stock} onChange={setV('stock')} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, gridColumn: '1 / -1' }}>
                <label className="form-label" style={{ fontSize: '12px' }}>Ảnh phân loại (tùy chọn)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input className="form-input" style={{ padding: '6px 12px', fontSize: '14px', flex: 1 }} type="text" placeholder="https://..." value={variantForm.variantImageUrl} onChange={setV('variantImageUrl')} />
                  {variantForm.variantImageUrl && <img src={variantForm.variantImageUrl} alt="preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button className="btn btn-primary btn-sm" onClick={handleSaveVariant}>
                {editingVariantId ? 'Lưu cập nhật' : '+ Lưu phân loại'}
              </button>
              {editingVariantId && (
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditingVariantId(null); setVariantForm(EMPTY_VARIANT_FORM); }}>Hủy</button>
              )}
            </div>
          </div>

          {/* Variants List */}
          <table className="table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Màu</th>
                <th>Giá</th>
                <th>Tồn kho</th>
                <th style={{ width: '80px', textAlign: 'center' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {activeVariants.map((v) => (
                <tr key={v.id}>
                  <td style={{ fontWeight: 600 }}>{v.sizeName || '—'}</td>
                  <td style={{ fontWeight: 600 }}>{v.colorName || '—'}</td>
                  <td style={{ color: 'var(--primary)', fontWeight: 800 }}>{formatCurrency(v.price)}</td>
                  <td style={{ color: v.stock > 0 ? 'var(--success)' : 'var(--error)' }}>
                    {v.stock}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => startEditVariant(v)} title="Sửa">
                        <FiEdit2 style={{ color: 'var(--info)', fontSize: '13px' }} />
                      </button>
                      <button className="btn btn-ghost btn-sm btn-icon" onClick={() => { deleteVariant(v.id); toast.success('Đã xóa!'); }} title="Xóa">
                        <FiTrash2 style={{ color: 'var(--error)', fontSize: '13px' }} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {activeVariants.length === 0 && (
                <tr><td colSpan={5} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Chưa có phân loại nào</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Modal>

    </AdminLayout>
  );
};

export default AdminProducts;
