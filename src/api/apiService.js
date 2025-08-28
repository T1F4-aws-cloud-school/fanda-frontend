import axios from "./axios";

class ApiService {
  // 인증 관련 API
  auth = {
    // 회원가입
    signup: async (userData) => {
      const response = await axios.post('/auth/api/v1/user/join', {
        username: userData.username,
        password: userData.password,
        nickname: userData.nickname
      });
      return response.data;
    },

    // 로그인
    login: async (credentials) => {
      const response = await axios.post('/auth/api/v1/user/login', {
        username: credentials.username,
        password: credentials.password
      });
      return response.data;
    },

    // 토큰 새로고침 
    refreshToken: async (refreshToken) => {
      const response = await axios.post('/auth/api/v1/user/refresh', {
        refreshToken
      });
      return response.data;
    },

    logout: () => {
    // 로컬 스토리지에서 토큰들 삭제
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // 배너 캐시도 삭제
    apiService.banner.clearCache();
    
    // 기타 사용자 데이터가 있다면 모두 삭제
    localStorage.removeItem('userInfo');
    localStorage.removeItem('userPreferences');
    
    console.log('로그아웃 완료 - 클라이언트 데이터 모두 삭제');
    return true;
  }


  };

  // 상품 관련 API
  products = {
    // 상품 상세 조회 (리뷰 포함)
    getDetail: async (productId) => {
      try {
        const response = await axios.get(`/shop/api/v1/products/${productId}`);
        console.log(`상품 ${productId} 상세 조회 성공:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`상품 ${productId} 상세 조회 실패:`, error);
        // 네트워크 에러나 서버 에러 시 null 반환하여 fallback 데이터 사용
        if (error.response?.status >= 500 || !error.response) {
          console.log('서버 에러 또는 네트워크 에러, fallback 데이터 사용');
          return null;
        }
        throw error;
      }
    },

    // 상품별 리뷰 조회 (기간 지정 가능)
    getReviews: async (productId, startAt = null, endAt = null) => {
      try {
        let url = `/shop/api/v1/reviews/by-product?productId=${productId}`;
        // 기간이 지정된 경우 파라미터 추가
        if (startAt && endAt) {
          url += `&startAt=${startAt}&endAt=${endAt}`;
        }
        const response = await axios.get(url);
        console.log(`상품 ${productId} 리뷰 조회 성공:`, response.data);
        return response.data;
      } catch (error) {
        console.error(`상품 ${productId} 리뷰 조회 실패:`, error);
        return [];
      }
    },

    // 개인별 추천 상품
    getRecommended: async () => {
      try {
        // 먼저 추천 API 시도
        const response = await axios.get('/shop/api/v1/products/recommended');
        console.log('추천 상품 조회 성공:', response.data);
        return response.data;
      } catch (error) {
        console.log('추천 상품 API 실패, 전체 상품에서 일부 추천:', error.message);
        try {
          // 추천 API 실패 시 전체 상품 목록에서 일부를 추천으로 사용
          const response = await axios.get('/shop/api/v1/products');
          console.log('전체 상품 목록 조회 성공:', response.data);
          // 처음 6개를 추천 상품으로 반환
          return response.data ? response.data.slice(0, 6) : null;
        } catch (listError) {
          console.log('상품 목록 조회도 실패, 목업 데이터 사용:', listError.message);
          return null;
        }
      }
    },

    // 상품 목록 조회 
    getList: async (category = 'all', page = 1) => {
      try {
        const response = await axios.get(`/shop/api/v1/products?category=${category}&page=${page}`);
        return response.data;
      } catch (error) {
        console.log('상품 목록 조회 실패, 목업 데이터 사용:', error.message);
        return null;
      }
    }
  };

  // 관리자 전용 API
  admin = {
    // 기간별 리뷰 수집 (관리자 전용)
    collectReviewsByPeriod: async (productId, startAt, endAt) => {
      try {
        const response = await axios.post(
          `/feedback/api/v1/admin/products/${productId}/reviews/collect?startAt=${startAt}&endAt=${endAt}`
        );
        console.log('기간별 리뷰 수집 성공:', response.data);
        return response.data;
      } catch (error) {
        console.error('기간별 리뷰 수집 실패:', error);
        throw error;
      }
    },

    // 개선 비교 리포트 생성 및 슬랙 전송 (관리자 전용)
    generateCompareReport: async (productId, baselineKey, startAt, endAt) => {
      try {
        // ✅ URLSearchParams를 사용해서 안전하게 파라미터 인코딩
        const params = new URLSearchParams({
          productId: productId.toString(),
          baselineKey: baselineKey, // 자동으로 URL 인코딩됨
          startAt: startAt,
          endAt: endAt
        });
        
        const url = `/feedback/api/v1/reports/feedback/compare?${params.toString()}`;
        
        console.log('비교 리포트 생성 요청:', {
          '최종 URL': url,
          '파라미터들': { productId, baselineKey, startAt, endAt },
          'baselineKey 원본': baselineKey,
          'baselineKey 인코딩됨': encodeURIComponent(baselineKey)
        });

        const response = await axios.post(url);
        console.log('개선 비교 리포트 생성 성공:', response.data);
        return response.data;
      } catch (error) {
        console.error('개선 비교 리포트 생성 실패:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers
          }
        });
        throw error;
      }
    },

    // 리뷰 수집과 동시에 비교 리포트 생성 (통합 메소드)
    collectAndGenerateReport: async (productId, startAt, endAt, baselineKey = null) => {
      try {
        console.log('리뷰 수집 및 비교 리포트 생성 시작:', {
          productId, startAt, endAt, baselineKey
        });

        // 1단계: 기간별 리뷰 수집
        const collectResult = await apiService.admin.collectReviewsByPeriod(productId, startAt, endAt);
        
        // 2단계: 비교 리포트 생성 (baselineKey가 제공된 경우에만)
        let reportResult = null;
        if (baselineKey) {
          try {
            reportResult = await apiService.admin.generateCompareReport(productId, baselineKey, startAt, endAt);
          } catch (reportError) {
            console.warn('비교 리포트 생성은 실패했지만 리뷰 수집은 성공:', reportError);
          }
        }

        return { collect: collectResult, report: reportResult, success: true };
      } catch (error) {
        console.error('리뷰 수집 및 비교 리포트 생성 실패:', error);
        throw error;
      }
    },

    // 관리자 권한 체크
    checkAdminAuth: () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        throw new Error('로그인이 필요합니다');
      }
      
      // JWT 토큰에서 권한 정보 추출 (간단한 구현)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isAdmin = payload.role === 'ADMIN' || payload.authorities?.includes('ADMIN');
        if (!isAdmin) {
          throw new Error('관리자 권한이 필요합니다');
        }
        return true;
      } catch (error) {
        throw new Error('유효하지 않은 토큰입니다');
      }
    }
  };

  // 리뷰 관련 API
  reviews = {
    // 상품별 리뷰 조회
    getByProduct: async (productId, startAt = null, endAt = null) => {
      return await apiService.products.getReviews(productId, startAt, endAt);
    },

    // 수집되지 않은 리뷰만 수집 (사용자 토큰 필요)
    collect: async () => {
      try {
        const response = await axios.post('/banner/api/v1/reviews/collect');
        console.log('리뷰 수집 성공:', response.data);
        return response.data;
      } catch (error) {
        console.log('리뷰 수집 실패 (정상적인 경우일 수 있음):', error.message);
        // 이미 모든 리뷰가 수집된 경우 빈 배열 반환
        if (error.response?.status === 404 || error.response?.status === 409) {
          return [];
        }
        throw error;
      }
    }
  };

  // 리포트 및 배너 관련 API
  reports = {
  // 긍/부정 리포트 생성 및 배너 이미지 생성 (관리자 토큰 필요)
  generate: async () => {
    try {
      console.log('배너 생성 API 호출 시작');
      
      const response = await axios.post('/banner/api/v1/reports/generate');
      console.log('배너 생성 API 원시 응답:', response);
      console.log('배너 생성 API 데이터:', response.data);
      
      // 응답 데이터 검증
      if (!response.data) {
        console.warn('응답 데이터가 없습니다');
        return null;
      }
      
      // 배열 형태의 응답 처리
      if (Array.isArray(response.data)) {
        console.log(`${response.data.length}개의 배너 데이터 받음`);
        
        const transformedBanners = response.data.map((item, index) => {
          console.log(`배너 ${index + 1} 변환 전:`, item);
          
          const transformed = {
            id: `api-banner-${Date.now()}-${index}`,
            url: item.imageBannerUrl,
            chatPhrase: item.chatPhraseKo,
            createdAt: new Date().toISOString(),
            reviewInfo: {
              productName: "수비드 닭가슴살",
              reviewCount: "최신",
              sentiment: "긍정적",
              generatedAt: "API"
            }
          };
          
          console.log(`배너 ${index + 1} 변환 완료:`, transformed);
          return transformed;
        });
        
        console.log('모든 배너 변환 완료:', transformedBanners);
        return transformedBanners;
      }
      
      // 단일 객체 응답 처리
      if (typeof response.data === 'object') {
        console.log('단일 객체 응답 처리');
        const transformed = {
          id: `api-banner-${Date.now()}`,
          url: response.data.imageBannerUrl,
          chatPhrase: response.data.chatPhraseKo,
          createdAt: new Date().toISOString(),
          reviewInfo: {
            productName: "수비드 닭가슴살",
            reviewCount: "최신",
            sentiment: "긍정적",
            generatedAt: "API"
          }
        };
        
        console.log('단일 배너 변환 완료:', transformed);
        return [transformed];
      }
      
      console.warn('예상치 못한 응답 형식:', typeof response.data);
      return null;
      
    } catch (error) {
      console.error('배너 생성 실패:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url
      });
      
      // 상태 코드별 구체적인 로깅
      if (error.response) {
        switch (error.response.status) {
          case 400:
            console.error('잘못된 요청 - 요청 형식을 확인해주세요');
            break;
          case 401:
            console.error('인증 실패 - 토큰을 확인해주세요');
            break;
          case 403:
            console.error('권한 부족 - 관리자 권한이 필요합니다');
            break;
          case 404:
            console.error('엔드포인트를 찾을 수 없습니다');
            break;
          case 500:
            console.error('서버 내부 오류');
            break;
        }
      }
      
      // 권한 관련 에러는 null 반환 (정상적인 처리)
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.log('권한 없음 - 기본 배너 사용');
        return null;
      }
      
      throw error;
    }
  }
};

  // 배너 관련 API - (최대 3개 · 최신순 · presigned 만료 자동 갱신)
  // apiService.js에서 banner 섹션을 이렇게 완전히 교체하세요

banner = {
  CACHE_KEY: 'banner_cache',

  getCachedBanners() {
    try {
      const raw = localStorage.getItem(this.CACHE_KEY);
      if (!raw) return null;
      const { banners, expiresAt } = JSON.parse(raw);
      if (Date.now() < (expiresAt - 60 * 1000) && Array.isArray(banners) && banners.length) {
        return banners;
      }
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    } catch {
      localStorage.removeItem(this.CACHE_KEY);
      return null;
    }
  },

  cacheBanners(banners, expiresAt) {
    try {
      localStorage.setItem(this.CACHE_KEY, JSON.stringify({ banners, expiresAt }));
      console.log('배너 캐시 저장:', banners.length, '개');
    } catch (error) {
      console.error('캐시 저장 실패:', error);
    }
  },

  getHardcodedBanners() {
    return [
      {
        id: 'hardcoded-1',
        url: "/src/assets/banner_20250808_173006.png",
        chatPhrase: "부드러운 수비드 닭가슴살, 건강한 한 끼 식사",
        createdAt: new Date('2025-08-08T17:30:06').toISOString(),
        reviewInfo: {
          productName: "수비드 닭가슴살",
          reviewCount: "1,250+",
          sentiment: "긍정적",
          generatedAt: "하드코딩"
        }
      },
      {
        id: 'hardcoded-2',
        url: "/src/assets/banner_20250808_174545.png",
        chatPhrase: "맛과 영양을 모두 잡은 다이어트 필수품",
        createdAt: new Date('2025-08-08T17:45:45').toISOString(),
        reviewInfo: {
          productName: "프리미엄 닭가슴살",
          reviewCount: "890+",
          sentiment: "매우 긍정적",
          generatedAt: "하드코딩"
        }
      },
      {
        id: 'hardcoded-3',
        url: "/src/assets/banner_20250813_163542.png",
        chatPhrase: "수비드 공법의 촉촉함, 허브의 은은한 향기",
        createdAt: new Date('2025-08-13T16:35:42').toISOString(),
        reviewInfo: {
          productName: "허브 닭가슴살",
          reviewCount: "567+",
          sentiment: "긍정적",
          generatedAt: "하드코딩"
        }
      }
    ];
  },

  getDefaultBanners() {
    return [
      {
        id: 'placeholder-1',
        url: "https://placehold.co/298x298/006AFF/FFFFFF?text=Loading...",
        chatPhrase: "데이터를 불러오는 중...",
        createdAt: new Date().toISOString(),
        reviewInfo: {
          productName: "로딩 중",
          reviewCount: "-",
          sentiment: "로딩 중",
          generatedAt: "Placeholder"
        }
      }
    ];
  },

  async getBannerList() {
    const cached = this.getCachedBanners();
    if (cached) return cached;
    
    try {
      console.log('reports.generate() API로 배너 생성...');
      const generatedBanners = await apiService.reports.generate();
      
      if (generatedBanners && Array.isArray(generatedBanners) && generatedBanners.length > 0) {
        console.log('배너 생성 성공:', generatedBanners.length, '개');
        const expiresAt = Date.now() + 10 * 60 * 1000;
        this.cacheBanners(generatedBanners, expiresAt);
        return generatedBanners;
      } else {
        console.log('배너 생성 실패, 하드코딩 배너 사용');
        const hardcodedBanners = this.getHardcodedBanners();
        const fallbackExpire = Date.now() + 10 * 60 * 1000;
        this.cacheBanners(hardcodedBanners, fallbackExpire);
        return hardcodedBanners;
      }
    } catch (e) {
      console.log('배너 생성 API 실패, 하드코딩 배너 사용:', e.message);
      const hardcodedBanners = this.getHardcodedBanners();
      const fallbackExpire = Date.now() + 10 * 60 * 1000;
      this.cacheBanners(hardcodedBanners, fallbackExpire);
      return hardcodedBanners;
    }
  },

  async getLatest() {
    const list = await this.getBannerList();
    const top = list?.[0];
    return {
      imageUrl: top?.url ?? null,
      chatPhrase: top?.chatPhrase ?? "인기 최고 판매율 1위 닭가슴살을 만나보세요!"
    };
  },

  clearCache() {
    localStorage.removeItem(this.CACHE_KEY);
    console.log('배너 캐시 초기화 완료');
  }
};

// 유틸리티 메서드
utils = {
  // 토큰 존재 여부 확인
  hasToken: () => {
    return !!localStorage.getItem('accessToken');
    },

    // 관리자 여부 확인 (간단한 버전)
    isAdmin: () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return false;
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role === 'ADMIN' || payload.authorities?.includes('ADMIN');
      } catch (error) {
        return false;
      }
    },

    // API 에러 메시지 추출
    getErrorMessage: (error) => {
      if (error.response?.data?.message) {
        return error.response.data.message;
      }
      if (error.message) {
        return error.message;
      }
      return '알 수 없는 오류가 발생했습니다';
    }
  };
}

// 싱글톤 인스턴스 생성
const apiService = new ApiService();

export default apiService;