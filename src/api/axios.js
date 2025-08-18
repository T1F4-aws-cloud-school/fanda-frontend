import axios from "axios";

const instance = axios.create({
  baseURL: "http://192.168.2.100:30801", // API Gateway 주소
  withCredentials: false,
  timeout: 30000, // 30초 타임아웃
});

// 요청 인터셉터 - 토큰 자동 추가
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 만료 처리
instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 401 에러이고 토큰 재발급을 시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // 토큰 재발급 API 호출
          const response = await axios.post(`${instance.defaults.baseURL}/auth/api/v1/user/refresh`, {
            refreshToken
          });

          // 새 토큰 저장
          if (response.data.statusCode === "OK" && response.data.content?.accessToken) {
            localStorage.setItem('accessToken', response.data.content.accessToken);
            localStorage.setItem('refreshToken', response.data.content.refreshToken);
            
            // 원래 요청에 새 토큰 적용
            originalRequest.headers.Authorization = `Bearer ${response.data.content.accessToken}`;
            
            // 원래 요청 재시도
            return instance(originalRequest);
          }
        }
      } catch (refreshError) {
        // 토큰 재발급 실패 시 로그아웃 처리
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
