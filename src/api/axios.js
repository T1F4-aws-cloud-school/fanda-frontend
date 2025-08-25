// axios.js
import axios from "axios";

const instance = axios.create({
  baseURL: 'http://192.168.2.100:30801', // 실제 API 서버 주소
  withCredentials: false,
  timeout: 30000,
});

// 요청 인터셉터 - 토큰 자동 추가
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // 상세한 요청 로그
    console.log('API 요청 상세:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      baseURL: config.baseURL,
      fullURL: `${config.baseURL}${config.url}`,
      headers: {
        'Authorization': config.headers.Authorization ? '있음' : '없음',
        'Content-Type': config.headers['Content-Type']
      },
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error('요청 인터셉터 에러:', error);
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 처리 및 토큰 만료 처리
instance.interceptors.response.use(
  (response) => {
    // 성공 응답 로그
    console.log('API 응답 성공:', {
      status: response.status,
      url: response.config.url,
      data: response.data
    });
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 상세한 에러 로그
    console.error('API 에러 상세:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      method: error.config?.method,
      headers: error.config?.headers,
      data: error.response?.data,
      message: error.message
    });

    // 401 에러이고 토큰 재발급을 시도하지 않은 경우
    if (error.response?.status === 401 && !originalRequest._retry) {
      console.log('토큰 재발급 시도 중...');
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
          console.log('리프레시 토큰으로 재발급 요청');
          
          // 토큰 재발급 API 호출
          const response = await axios.post('/auth/api/v1/user/refresh', {
            refreshToken
          });

          // 새 토큰 저장
          if (response.data.statusCode === "OK" && response.data.content?.accessToken) {
            const newAccessToken = response.data.content.accessToken;
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('refreshToken', response.data.content.refreshToken);
            
            console.log('토큰 재발급 성공, 원래 요청 재시도');
            
            // 원래 요청에 새 토큰 적용
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            
            // 원래 요청 재시도
            return instance(originalRequest);
          }
        }
      } catch (refreshError) {
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