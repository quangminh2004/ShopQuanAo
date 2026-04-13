import axios from 'axios';

const BASE_URL = 'https://lunina-production.up.railway.app/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để nhét token vào mỗi request nếu có
api.interceptors.request.use(
  (config) => {
    // Sẽ thêm logic đọc token từ local storage sau khi hoàn thiện phần Auth
    const user = localStorage.getItem('lunina_current_user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        // Nếu API backend trả về field 'token'
        if (parsedUser.token) {
           config.headers.Authorization = `Bearer ${parsedUser.token}`;
        }
      } catch (err) {
        console.error('Failed to parse current user for token', err);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Thêm interceptor để xử lý response (ví dụ 401 thì logout)
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token hết hạn hoặc sai
      // Có thể emit event hoặc gọi hàm logout ở đây
      console.warn("Unauthorized, please login again.");
    }
    return Promise.reject(error);
  }
);

export default api;
