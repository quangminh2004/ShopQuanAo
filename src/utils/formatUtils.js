export const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

const parseBackendDate = (dateStr) => {
  if (!dateStr) return null;
  const raw = String(dateStr).trim();
  const hasTimezone = /(?:Z|[+-]\d{2}:\d{2})$/.test(raw);
  const normalized = hasTimezone ? raw : `${raw}Z`;
  const d = new Date(normalized);
  if (Number.isNaN(d.getTime())) return null;
  return d;
};

export const formatDate = (dateStr) => {
  const d = parseBackendDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};

export const formatDateOnly = (dateStr) => {
  const d = parseBackendDate(dateStr);
  if (!d) return '';
  return d.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Ho_Chi_Minh',
  });
};

export const ORDER_STATUS_LABEL = {
  0: 'Đang đặt',
  1: 'Đã nhận',
  2: 'Đã hủy',
};

export const ORDER_STATUS_COLOR = {
  0: '#f9a825',
  1: '#2e7d32',
  2: '#c62828',
};
