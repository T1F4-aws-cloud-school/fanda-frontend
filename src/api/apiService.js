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

  // 리뷰 관련 API
  reviews = {
    // 수집 되지 않은 리뷰만 수집 (사용자 토큰 필요)
    collect: async () => {
      const response = await axios.post('/reviews/collect');
      return response.data;
    }
  };

  // 리포트 및 배너 관련 API
  reports = {
    // 긍/부정 리포트 생성 및 배너 이미지 생성 (관리자 토큰 필요)
    generate: async () => {
      const response = await axios.get('/reports/generate');
      return response.data;
    }
  }

  // 배너 관련 API
  banner = {
    // 기존 방식 
    getLatest: async () => {
      try {
        // 먼저 새로운 API 시도
        const response = await this.reports.generate();
        return {
          imageUrl: response.imageBannerUrl,
          chatPhrase: response.chatPhraseKo
        };
      } catch (error) {
        // 실패 시 기존 API 시도
        const response = await axios.get('/banner/latest');
        return response.data;
      }
    },

    // 리포트 생성과 함께
    generateWithReport: async () => {
      const response = await this.reports.generate();
      return {
        imageUrl: response.imageBannerUrl,
        chatPhrase: response.chatPhraseKo,
        fullResponse: response
      };
    }
  };
}

// 싱글톤 인스턴스 생성
const apiService = new ApiService();

export default apiService;