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
        const response = await axios.post(
          `/api/v1/reports/feedback/compare?productId=${productId}&baselineKey=${encodeURIComponent(baselineKey)}&startAt=${startAt}&endAt=${endAt}`
        );
        console.log('개선 비교 리포트 생성 성공:', response.data);
        return response.data;
      } catch (error) {
        console.error('개선 비교 리포트 생성 실패:', error);
        throw error;
      }
    },

    // 리뷰 수집과 동시에 비교 리포트 생성 (통합 메소드)
    collectAndGenerateReport: async (productId, startAt, endAt, baselineKey = null) => {
      try {
        console.log('리뷰 수집 및 비교 리포트 생성 시작:', {
          productId,
          startAt,
          endAt,
          baselineKey
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
            // 리포트 생성 실패해도 리뷰 수집은 성공했으므로 계속 진행
          }
        }

        return {
          collect: collectResult,
          report: reportResult,
          success: true
        };
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
        const response = await axios.post('/banner/api/v1/reports/generate');
        console.log('배너 및 리포트 생성 성공:', response.data);
        return response.data;
      } catch (error) {
        console.error('배너 생성 실패:', error);
        // 관리자 권한이 없거나 토큰이 없는 경우에도 에러를 던지지 않고 null 반환
        if (error.response?.status === 401 || error.response?.status === 403) {
          console.log('관리자 권한 없음, 기본 배너 사용');
          return null;
        }
        throw error;
      }
    }
  };

  // 배너 관련 API - 개선된 캐싱 및 관리 로직
  banner = {
    // 배너 캐시 키
    CACHE_KEY: 'banner_cache',
    CACHE_DURATION: 30 * 60 * 1000, // 30분

    // 캐시된 배너들 가져오기
    getCachedBanners: function() {
      try {
        const cached = localStorage.getItem(this.CACHE_KEY);
        if (cached) {
          const { banners, timestamp } = JSON.parse(cached);
          if (Date.now() - timestamp < this.CACHE_DURATION) {
            console.log('캐시된 배너들 사용:', banners);
            return banners;
          } else {
            console.log('캐시 만료, 새 배너 요청 필요');
            localStorage.removeItem(this.CACHE_KEY);
          }
        }
      } catch (error) {
        console.error('배너 캐시 읽기 실패:', error);
        localStorage.removeItem(this.CACHE_KEY);
      }
      return null;
    },

    // 배너들 캐시에 저장
    cacheBanners: function(banners) {
      try {
        const cacheData = {
          banners,
          timestamp: Date.now()
        };
        localStorage.setItem(this.CACHE_KEY, JSON.stringify(cacheData));
        console.log('배너들 캐시 저장 완료');
      } catch (error) {
        console.error('배너 캐시 저장 실패:', error);
      }
    },

    // 새 배너 추가 (최대 3개 유지)
    addNewBanner: function(currentBanners, newBannerData) {
      const newBanner = {
        id: Date.now(), // 고유 ID
        url: newBannerData.imageBannerUrl,
        chatPhrase: newBannerData.chatPhraseKo,
        createdAt: new Date().toISOString(),
        // 리뷰 기반 정보 추가
        reviewInfo: {
          productName: newBannerData.productName || "수비드 닭가슴살",
          reviewCount: newBannerData.reviewCount || "최신",
          sentiment: newBannerData.sentiment || "긍정적",
          generatedAt: new Date().toLocaleString('ko-KR')
        }
      };

      // 새 배너를 맨 앞에 추가하고, 3개까지만 유지
      const updatedBanners = [newBanner, ...currentBanners].slice(0, 3);
      
      // 캐시에 저장
      this.cacheBanners(updatedBanners);
      
      console.log('새 배너 추가 완료:', newBanner);
      return updatedBanners;
    },

    // 기본 배너들 생성 (초기 로드용)
    getDefaultBanners: function() {
      return [
        {
          id: 1,
          url: "https://via.placeholder.com/298x298/006AFF/FFFFFF?text=Banner+1",
          chatPhrase: "인기 최고 판매율 1위 닭가슴살을 만나보세요!",
          createdAt: new Date().toISOString(),
          reviewInfo: {
            productName: "수비드 닭가슴살",
            reviewCount: "1,250+",
            sentiment: "긍정적",
            generatedAt: "기본 배너"
          }
        },
        {
          id: 2,
          url: "https://via.placeholder.com/298x298/FF6B35/FFFFFF?text=Banner+2",
          chatPhrase: "신선한 닭가슴살로 건강한 다이어트!",
          createdAt: new Date().toISOString(),
          reviewInfo: {
            productName: "프리미엄 닭가슴살",
            reviewCount: "890+",
            sentiment: "매우 긍정적",
            generatedAt: "기본 배너"
          }
        },
        {
          id: 3,
          url: "https://via.placeholder.com/298x298/28A745/FFFFFF?text=Banner+3",
          chatPhrase: "부드럽고 맛있는 프리미엄 닭가슴살",
          createdAt: new Date().toISOString(),
          reviewInfo: {
            productName: "허브 닭가슴살",
            reviewCount: "567+",
            sentiment: "긍정적",
            generatedAt: "기본 배너"
          }
        }
      ];
    },

    // 배너 목록 가져오기 (캐시 우선)
    getBannerList: async function() {
      // 1. 캐시된 배너들 확인
      const cached = this.getCachedBanners();
      if (cached && cached.length > 0) {
        return cached;
      }

      // 2. 캐시가 없으면 기본 배너들 반환
      const defaultBanners = this.getDefaultBanners();
      this.cacheBanners(defaultBanners);
      return defaultBanners;
    },

    // 새 배너 생성 및 추가
    generateAndAddBanner: async function(currentBanners, additionalData = {}) {
      try {
        const response = await apiService.reports.generate();
        if (response) {
          // 추가 메타데이터와 함께 새 배너 생성
          const newBannerData = {
            ...response,
            ...additionalData // productName, reviewCount 등
          };
          
          const updatedBanners = this.addNewBanner(currentBanners, newBannerData);
          console.log('새 배너 생성 및 추가 완료:', updatedBanners);
          return updatedBanners;
        }
      } catch (error) {
        console.error('새 배너 생성 실패:', error);
        throw error;
      }
    },

    // 기존 방식 - 캐싱 로직 추가 (호환성 유지)
    getLatest: async function() {
      // 1. 캐시된 배너 확인
      const cached = this.getCachedBanners();
      if (cached && cached.length > 0) {
        return {
          imageUrl: cached[0].url,
          chatPhrase: cached[0].chatPhrase
        };
      }

      // 2. 새 배너 생성 시도
      try {
        const response = await apiService.reports.generate();
        if (response) {
          const banner = {
            imageUrl: response.imageBannerUrl,
            chatPhrase: response.chatPhraseKo
          };
          
          // 새 배너를 배너 목록에 추가
          const currentBanners = this.getDefaultBanners();
          const newBannerData = {
            imageBannerUrl: response.imageBannerUrl,
            chatPhraseKo: response.chatPhraseKo
          };
          this.addNewBanner(currentBanners, newBannerData);
          
          return banner;
        }
      } catch (error) {
        console.log("배너 생성 실패, 기본값 사용:", error.message);
      }

      // 3. 실패 시 기본값 반환
      return {
        imageUrl: null,
        chatPhrase: "인기 최고 판매율 1위 닭가슴살을 만나보세요!"
      };
    },

    // 리포트 생성과 함께 - 새로운 배너 강제 생성
    generateWithReport: async function() {
      try {
        const response = await apiService.reports.generate();
        if (response) {
          const banner = {
            imageUrl: response.imageBannerUrl,
            chatPhrase: response.chatPhraseKo,
            fullResponse: response
          };
          
          // 새 배너를 배너 목록에 추가
          const currentBanners = await this.getBannerList();
          const newBannerData = {
            imageBannerUrl: response.imageBannerUrl,
            chatPhraseKo: response.chatPhraseKo
          };
          this.addNewBanner(currentBanners, newBannerData);
          
          return banner;
        }
      } catch (error) {
        console.error('새 배너 생성 실패:', error);
        throw error;
      }
    },

    // 캐시 초기화 (관리자용)
    clearCache: function() {
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