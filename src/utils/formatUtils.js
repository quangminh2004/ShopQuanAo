export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateOnly = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const ORDER_STATUS_LABEL = {
  DANG_DAT: 'Đang đặt',
  DA_NHAN: 'Đã nhận',
  DA_HUY: 'Đã hủy',
};

export const ORDER_STATUS_COLOR = {
  DANG_DAT: '#f9a825',
  DA_NHAN: '#2e7d32',
  DA_HUY: '#c62828',
};
