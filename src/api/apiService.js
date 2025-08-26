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

  // 배너 관련 API - (최대 3개 · 최신순 · presigned 만료 자동 갱신)
  banner = {
    CACHE_KEY: 'banner_cache',

    // 캐시 읽기 (만료 60초 전이면 무효화)
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

    // 캐시 쓰기
    cacheBanners(banners, expiresAt) {
      try {
        localStorage.setItem(this.CACHE_KEY, JSON.stringify({ banners, expiresAt }));
        console.log('배너 캐시 저장:', banners.length, '개');
      } catch (error) {
        console.error('캐시 저장 실패:', error);
      }
    },

    // presigned 쿼리에서 만료 시각 계산
    _computeExpiry(urlStr) {
      const u = new URL(urlStr);
      const amzDate = u.searchParams.get('X-Amz-Date'); // e.g. 20250825T052139Z
      const expires = parseInt(u.searchParams.get('X-Amz-Expires') || '900', 10) * 1000; // ms
      if (!amzDate) return Date.now() + 5 * 60 * 1000; // 안전망: 5분
      const y = amzDate.slice(0,4), m = amzDate.slice(4,6), d = amzDate.slice(6,8);
      const hh = amzDate.slice(9,11), mm = amzDate.slice(11,13), ss = amzDate.slice(13,15);
      const issuedAt = Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss);
      return issuedAt + expires;
    },

    // 파일명에서 생성시각 파싱 (banner_YYYYMMDD_HHMMSS.png)
    _parseKeyTimestamp(urlStr) {
      const key = decodeURIComponent(new URL(urlStr).pathname); // /.../banners/banner_20250807_160500.png
      const m = key.match(/banner_(\d{8})_(\d{6})\./);
      if (!m) return 0;
      const [_, d8, t6] = m; // 20250807, 160500
      const y = d8.slice(0,4), mo = d8.slice(4,6), da = d8.slice(6,8);
      const hh = t6.slice(0,2), mi = t6.slice(2,4), ss = t6.slice(4,6);
      return Date.UTC(+y, +mo - 1, +da, +hh, +mi, +ss);
    },

    // 서버에서 presigned URL 목록을 받아 최신 3개만 가공
    async _fetchFromServer() {
      const res = await axios.get('/banner/api/v1/images/urls'); // ADMIN 필요
      const items = (res.data || [])
        .map(({ url }) => ({
          id: decodeURIComponent(new URL(url).pathname).split('/').pop(), // 파일명
          url,
          createdAtMs: this._parseKeyTimestamp(url)
        }))
        .sort((a, b) => b.createdAtMs - a.createdAtMs)
        .slice(0, 3)
        .map(x => ({
          id: x.id,
          url: x.url,
          createdAt: new Date(x.createdAtMs).toISOString(),
          chatPhrase: null, // 문구는 별도 API로 받을 때 채우기 (없어도 표시엔 지장 X)
          reviewInfo: { productName: "수비드 닭가슴살", reviewCount: "최신", sentiment: "긍정적", generatedAt: "S3" }
        }));

      // presigned 중 가장 짧은 만료를 캐시 만료로 채택
      const expiresAt = Math.min(...items.map(i => this._computeExpiry(i.url)));
      this.cacheBanners(items, expiresAt);
      return items;
    },

    // 공개 API: 배너 3개 반환(캐시 우선, API 실패시 하드코딩된 이미지)
    async getBannerList() {
      const cached = this.getCachedBanners();
      if (cached) return cached;
      
      try {
        console.log('API에서 배너 데이터 가져오기 시도...');
        return await this._fetchFromServer();
      } catch (e) {
        console.log('API 실패로 하드코딩된 배너 사용:', e.message);
        // API 실패시 하드코딩된 실제 이미지들 사용
        const hardcodedBanners = this.getHardcodedBanners();
        const fallbackExpire = Date.now() + 10 * 60 * 1000;
        this.cacheBanners(hardcodedBanners, fallbackExpire);
        return hardcodedBanners;
      }
    },

    // 하드코딩된 실제 배너 이미지들 (API 실패시만 사용)
    getHardcodedBanners() {
      // import는 HomeGuest.jsx에서 처리하고 여기서는 상대경로 사용
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

    // 기본 배너들 (초기 로딩용 placeholder)
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

    // 캐치프레이즈만 업데이트 (기존 이미지 유지) - 캐치프레이즈 로직 완전 유지
    async generateAndAddBanner(currentBanners, additionalData = {}) {
      console.log('새 배너 생성 시작:', additionalData);
      
      // 서버에서 리포트+배너 생성 실행 (새 캐치프레이즈만 받기 위해)
      const reportResult = await apiService.reports.generate();
      console.log('리포트 생성 결과 (RAW):', reportResult);
      console.log('리포트 결과 타입:', typeof reportResult);
      console.log('리포트 결과 배열 여부:', Array.isArray(reportResult));
      
      if (Array.isArray(reportResult)) {
        console.log('각 배너별 캐치프레이즈:');
        reportResult.forEach((item, index) => {
          console.log(`  배너 ${index}:`, {
            chatPhraseKo: item.chatPhraseKo,
            imageBannerUrl: item.imageBannerUrl
          });
        });
      }
      
      if (!reportResult || !Array.isArray(reportResult) || reportResult.length === 0) {
        console.log('새 배너 생성 결과가 없음 또는 잘못된 형식');
        return currentBanners;
      }

      // 핵심: 기존 배너 이미지는 그대로 유지하고 캐치프레이즈만 업데이트
      const updatedBanners = currentBanners.map((banner, index) => {
        // 해당 인덱스의 새 캐치프레이즈가 있으면 사용, 없으면 기존 것 유지
        const newCatchPhrase = reportResult[index]?.chatPhraseKo;
        
        console.log(`배너 ${index} 업데이트:`, {
          기존이미지: banner.url,
          기존캐치프레이즈: banner.chatPhrase,
          새캐치프레이즈: newCatchPhrase,
          최종캐치프레이즈: newCatchPhrase || banner.chatPhrase
        });

        return {
          ...banner, // 기존 배너 정보(이미지 URL 포함) 모두 유지
          // 캐치프레이즈만 새걸로 업데이트 (없으면 기존 것 유지)
          chatPhrase: newCatchPhrase || banner.chatPhrase,
          reviewInfo: {
            ...(banner.reviewInfo || {}),
            ...additionalData,
            generatedAt: new Date().toLocaleString('ko-KR'),
            updatedAt: new Date().toLocaleString('ko-KR') // 업데이트 시간 추가
          }
        };
      });

      console.log('최종 업데이트된 배너들:', updatedBanners.map(b => ({
        id: b.id,
        url: b.url, // 기존 이미지 URL 유지됨
        chatPhrase: b.chatPhrase // 새 캐치프레이즈
      })));

      // 캐시도 업데이트 (기존 이미지 URL 기반으로)
      if (updatedBanners.length > 0) {
        // 기존 배너들의 만료시간 중 가장 짧은 것 사용 (또는 기본값)
        const defaultExpiry = Date.now() + 10 * 60 * 1000; // 10분
        let cacheExpiry = defaultExpiry;
        
        // 기존 배너 중에 presigned URL이 있다면 그 만료시간 사용
        try {
          const expiryTimes = updatedBanners
            .filter(banner => banner.url && banner.url.includes('amazonaws.com'))
            .map(banner => this._computeExpiry(banner.url))
            .filter(time => time > Date.now()); // 유효한 시간만
          
          if (expiryTimes.length > 0) {
            cacheExpiry = Math.min(...expiryTimes);
          }
        } catch (error) {
          console.log('만료시간 계산 실패, 기본값 사용:', error.message);
        }
        
        this.cacheBanners(updatedBanners, cacheExpiry);
      }
      
      return updatedBanners;
    },

    // (호환용) 최신 배너 1개만 필요할 때
    async getLatest() {
      const list = await this.getBannerList();
      const top = list?.[0];
      return {
        imageUrl: top?.url ?? null,
        chatPhrase: top?.chatPhrase ?? "인기 최고 판매율 1위 닭가슴살을 만나보세요!"
      };
    },

    // (호환용) 리포트 생성과 함께 새 배너 생성 후 최신 배너 반환
    async generateWithReport() {
      const r = await apiService.reports.generate();
      if (!r) {
        // 실패 시 현재 최신 리턴
        return this.getLatest();
      }
      // 생성 성공 → 목록 리프레시
      const list = await this._fetchFromServer();
      const top = list?.[0];
      return {
        imageUrl: top?.url ?? r.imageBannerUrl ?? null,
        chatPhrase: r.chatPhraseKo ?? top?.chatPhrase ?? null,
        fullResponse: r
      };
    },

    // 캐시 초기화 (관리자용)
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