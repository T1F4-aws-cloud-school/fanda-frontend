import axios from "axios";

const instance = axios.create({
  // nginx 프록시를 사용하는 경우 - 현재 도메인 사용
  baseURL: window.location.origin, // 프론트엔드와 같은 도메인
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
    
    // 요청 로그 (개발 시에만)
    console.log(`API 요청: ${config.method?.toUpperCase()} ${config.url}`, config.data);
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 만료 처리
instance.interceptors.response.use(
  (response) => {
    // 응답 로그 (개발 시에만)
    console.log(`API 응답: ${response.config.url}`, response.data);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    console.error(`API 에러: ${error.config?.url}`, error.response?.data || error.message);

    // 401 에러이고 토큰 재발급을 시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          // 토큰 재발급 API 호출 - nginx 프록시를 통해
          const response = await axios.post('/auth/api/v1/user/refresh', {
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
        console.error('토큰 재발급 실패:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default instance;
