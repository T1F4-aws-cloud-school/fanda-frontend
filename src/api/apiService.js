import axios from "./axios";

class ApiService {
  // 인증 관련 API
  auth = {
    // 회원가입
    signup: async (userData) => {
      const response = await axios.post('/user/join', {
        username: userData.username,
        password: userData.password,
        nickname: userData.nickname
      });
      return response.data;
    },

    // 로그인
    login: async (credentials) => {
      const response = await axios.post('/user/login', {
        username: credentials.username,
        password: credentials.password
      });
      return response.data;
    },

    // 토큰 새로고침 
    refreshToken: async (refreshToken) => {
      const response = await axios.post('/user/refresh', {
        refreshToken
      });
      return response.data;
    }
  };

  // 상품 관련 API
  products = {
    // 상품 상세 조회 (리뷰 포함)
    getDetail: async (productId) => {
      const response = await axios.get(`/products/${productId}`);
      return response.data;
    },

    // 개인별 추천 상품
    getRecommended: async () => {
      // 백엔드에서 API 구현 후 연동
      const response = await axios.get('/products/recommended');
      return response.data;
    },

    // 상품 목록 조회 
    getList: async (category = 'all', page = 1) => {
      // 백엔드에서 API 구현 후 연동
      const response = await axios.get(`/products?category=${category}&page=${page}`);
      return response.data;
    }
  };

  // 배너 관련 API
  banner = {
    // 최신 배너 조회 
    getLatest: async () => {
      // 백엔드에서 Bedrock S3 배너 API 구현 후 연동
      const response = await axios.get('/banner/latest');
      return response.data;
    }
  };


}

// 싱글톤 인스턴스 생성
const apiService = new ApiService();

export default apiService;