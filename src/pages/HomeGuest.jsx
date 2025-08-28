"use client"

import { useState, useEffect, useRef } from "react"
import "./Home2.css"

import cartIcon from "../assets/cart.png"
import notificationIcon from "../assets/notification.png"
import searchIcon from "../assets/search.png"
import testBanner1 from "../assets/test-banner-1.png"
import testBanner2 from "../assets/test-banner-2.png"
import bannerlast from "../assets/home-banner.png"
import userIcon from "../assets/user.png"
import chicken from "../assets/chicken.png"
import heart from "../assets/heart.png"
import heartGrey from "../assets/heart_grey.png"
import apiService from "../api/apiService"
import BottomNavigation from "./BottomNavigation"
import FakeNotification from "./FakeNotification"  // 추가

import banner1 from "../assets/banner_20250808_173006.png"
import banner2 from "../assets/banner_20250808_174545.png" 
import banner3 from "../assets/banner_20250813_163542.png"

import mock_garlic from "../assets/mock_Garlic.png"
import mock_steam from "../assets/mock_steam.png"
import mock_spicy from "../assets/mock_spicy.png"
import mock_grill from "../assets/mock_grill.png"
import mock_s from "../assets/mock_s.png"
import mock_t from "../assets/mock_t.png"

import { useNavigate } from "react-router-dom"

// 하드코딩 목업 데이터 (비로그인용)
const mockRecommendedProducts = [
  {
    id: 1,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: chicken,
  },
  {
    id: 2,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: chicken,
  },
  {
    id: 3,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: chicken,
  },
  {
    id: 4,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: chicken,
  },
  {
    id: 5,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: chicken,
  },
  {
    id: 6,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: chicken,
  },
]

const mockCategoryProducts = [
  {
    id: 1,
    name: "갈릭 허브 닭가슴살",
    subtitle: "구매하기",
    image: mock_garlic,
  },
  {
    id: 2,
    name: "직화 스팀 닭가슴살",
    subtitle: "구매하기",
    image: mock_steam,
  },
  {
    id: 3,
    name: "매콤 바베큐 닭가슴살",
    subtitle: "구매하기",
    image: mock_spicy,
  },
  {
    id: 4,
    name: "그릴 바베큐 닭가슴살",
    subtitle: "구매하기",
    image: mock_grill,
  },
  {
    id: 5,
    name: "튀김 닭가슴살",
    subtitle: "구매하기",
    image: mock_t,
  },
  {
    id: 6,
    name: "수비드 닭가슴살",
    subtitle: "구매하기",
    image: mock_s,
  },
]

function HomeGuest() {
  const [activeCategory, setActiveCategory] = useState("전체")
  const [likedRecommended, setLikedRecommended] = useState([])
  const [likedCategory, setLikedCategory] = useState([])
  
  // 새로운 배너 시스템 - 메타데이터 포함
  const [banners, setBanners] = useState([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [catchPhraseHighlight, setCatchPhraseHighlight] = useState(false)
  const [displayCatchPhrase, setDisplayCatchPhrase] = useState("인기 최고 판매율 1위 닭가슴살을 만나보세요!")

  // 스와이프 기능을 위한 상태
  const [isDragging, setIsDragging] = useState(false)
  const [dragStarted, setDragStarted] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const bannerSlidesRef = useRef(null)
  
  // 뒤집기 관련 새로운 상태 추가
  const [flippedBanners, setFlippedBanners] = useState({})
  const [flipProgress, setFlipProgress] = useState({})
  const [isHovering, setIsHovering] = useState(false)
  const flipTimeouts = useRef({})
  const progressIntervals = useRef({})
  
  // 가짜 알림 상태 추가
  const [showNotification, setShowNotification] = useState(false)
  
  const navigate = useNavigate()
  const categories = ["전체", "베스트", "오늘특가", "대량구매", "신상품"]

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData()
    
    // 2초 후에 알림 표시
    const notificationTimer = setTimeout(() => {
      setShowNotification(true)
    }, 2000)
    
    return () => clearTimeout(notificationTimer)
  }, [])

  // 핵심 수정: 캐치프레이즈 업데이트 useEffect
  useEffect(() => {
    if (banners.length === 0) return

    const currentBanner = banners[currentBannerIndex]
    if (!currentBanner) return

    const newCatchPhrase = currentBanner.chatPhrase || "인기 최고 판매율 1위 닭가슴살을 만나보세요!"
    
    console.log('배너 인덱스 변경으로 인한 캐치프레이즈 업데이트:', {
      bannerIndex: currentBannerIndex,
      bannerId: currentBanner.id,
      oldPhrase: displayCatchPhrase,
      newPhrase: newCatchPhrase,
      bannerInfo: {
        id: currentBanner.id,
        chatPhrase: currentBanner.chatPhrase,
        url: currentBanner.url
      }
    })

    // 캐치프레이즈가 실제로 변경된 경우에만 업데이트
    if (newCatchPhrase !== displayCatchPhrase) {
      console.log('캐치프레이즈 변경 시작:', { from: displayCatchPhrase, to: newCatchPhrase })
      
      // 하이라이트 효과와 함께 즉시 업데이트
      setCatchPhraseHighlight(true)
      setDisplayCatchPhrase(newCatchPhrase)
      
      // 하이라이트 효과 종료
      const highlightTimer = setTimeout(() => {
        setCatchPhraseHighlight(false)
      }, 1000)

      return () => clearTimeout(highlightTimer)
    }
  }, [currentBannerIndex, banners])

  // 배너 인덱스 변경 시 다른 배너들을 앞면으로 리셋하는 useEffect
  useEffect(() => {
    if (banners.length === 0) return;

    const currentBannerId = banners[currentBannerIndex]?.id || `banner-${currentBannerIndex}`;
    
    // 새로운 flippedBanners 객체 생성
    const newFlippedBanners = {};
    banners.forEach((banner, index) => {
      const bannerId = banner.id || `banner-${index}`;
      if (bannerId !== currentBannerId) {
        newFlippedBanners[bannerId] = false;
        
        // 해당 배너의 모든 타이머 정리
        if (flipTimeouts.current[bannerId]) {
          clearTimeout(flipTimeouts.current[bannerId]);
          delete flipTimeouts.current[bannerId];
        }
        if (flipTimeouts.current[`${bannerId}-back`]) {
          clearTimeout(flipTimeouts.current[`${bannerId}-back`]);
          delete flipTimeouts.current[`${bannerId}-back`];
        }
        if (flipTimeouts.current[`${bannerId}-manual`]) {
          clearTimeout(flipTimeouts.current[`${bannerId}-manual`]);
          delete flipTimeouts.current[`${bannerId}-manual`];
        }
        if (progressIntervals.current[bannerId]) {
          clearInterval(progressIntervals.current[bannerId]);
          delete progressIntervals.current[bannerId];
        }
      } else {
        newFlippedBanners[bannerId] = flippedBanners[bannerId] || false;
      }
    });

    setFlippedBanners(newFlippedBanners);
    
    // 진행률도 리셋
    const newFlipProgress = {};
    banners.forEach((banner, index) => {
      const bannerId = banner.id || `banner-${index}`;
      if (bannerId !== currentBannerId) {
        newFlipProgress[bannerId] = 0;
      } else {
        newFlipProgress[bannerId] = flipProgress[bannerId] || 0;
      }
    });
    setFlipProgress(newFlipProgress);
    
    console.log('배너 변경으로 인한 다른 배너들 리셋 완료, 현재 배너:', currentBannerId);
  }, [currentBannerIndex, banners]);

  // 배너 뒤집기 관리 useEffect
  useEffect(() => {
    if (banners.length === 0 || isDragging) return

    const currentBanner = banners[currentBannerIndex]
    if (!currentBanner) return

    const bannerId = currentBanner.id || `banner-${currentBannerIndex}`

    if (flippedBanners[bannerId]) return

    // 기존 타이머들 정리
    Object.values(flipTimeouts.current).forEach(timeout => clearTimeout(timeout))
    Object.values(progressIntervals.current).forEach(interval => clearInterval(interval))
    flipTimeouts.current = {}
    progressIntervals.current = {}

    // 진행률 초기화
    setFlipProgress(prev => ({ ...prev, [bannerId]: 0 }))

    console.log('Starting auto flip timer for banner:', bannerId)

    // 진행률 업데이트 (100ms마다)
    const progressInterval = setInterval(() => {
      setFlipProgress(prev => {
        const current = prev[bannerId] || 0
        const newProgress = Math.min(current + 2, 100)
        return { ...prev, [bannerId]: newProgress }
      })
    }, 100)
    
    progressIntervals.current[bannerId] = progressInterval

    // 5초 후 뒤집기
    const flipTimeout = setTimeout(() => {
      console.log('Auto flipping banner to back:', bannerId)
      setFlippedBanners(prev => ({ ...prev, [bannerId]: true }))
      
      // 3초 후 다시 앞면으로
      const backToFrontTimeout = setTimeout(() => {
        console.log('Auto flipping banner to front:', bannerId)
        setFlippedBanners(prev => ({ ...prev, [bannerId]: false }))
        setFlipProgress(prev => ({ ...prev, [bannerId]: 0 }))
      }, 3000)
      
      flipTimeouts.current[`${bannerId}-back`] = backToFrontTimeout
    }, 5000)

    flipTimeouts.current[bannerId] = flipTimeout

    return () => {
      clearTimeout(flipTimeout)
      clearInterval(progressInterval)
      if (flipTimeouts.current[`${bannerId}-back`]) {
        clearTimeout(flipTimeouts.current[`${bannerId}-back`])
      }
    }
  }, [currentBannerIndex, banners, isDragging, flippedBanners])
  
  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      Object.values(flipTimeouts.current).forEach(timeout => clearTimeout(timeout))
      Object.values(progressIntervals.current).forEach(interval => clearInterval(interval))
    }
  }, [])

  // 배너 최대 3개 유지하는 함수
  const maintainMaxBanners = (bannerList) => {
    if (bannerList.length > 3) {
      return bannerList.slice(0, 3)
    }
    return bannerList
  }

  // 캐치프레이즈 업데이트 헬퍼 함수 추가
  const updateCatchPhraseFromBanner = (bannerIndex, bannerList) => {
    if (!bannerList || bannerList.length === 0 || bannerIndex < 0 || bannerIndex >= bannerList.length) {
      return
    }
    
    const targetBanner = bannerList[bannerIndex]
    const newPhrase = targetBanner?.chatPhrase || "인기 최고 판매율 1위 닭가슴살을 만나보세요!"
    
    console.log('캐치프레이즈 헬퍼 함수 호출:', {
      bannerIndex,
      newPhrase,
      currentPhrase: displayCatchPhrase
    })
    
    if (newPhrase !== displayCatchPhrase) {
      setDisplayCatchPhrase(newPhrase)
      setCatchPhraseHighlight(true)
      setTimeout(() => setCatchPhraseHighlight(false), 1000)
    }
  }

  // 수정된 초기 데이터 로드
  const loadInitialData = async () => {
  console.log('초기 데이터 로드 시작...')
  
  try {
    // 1. 먼저 기본 배너들로 초기화
    const defaultBanners = apiService.banner.getDefaultBanners()
    const limitedDefaults = maintainMaxBanners(defaultBanners)
    setBanners(limitedDefaults)
    setCurrentBannerIndex(0)
    
    // 첫 번째 배너의 캐치프레이즈 즉시 설정
    if (limitedDefaults.length > 0) {
      const firstPhrase = limitedDefaults[0].chatPhrase || "인기 최고 판매율 1위 닭가슴살을 만나보세요!"
      setDisplayCatchPhrase(firstPhrase)
      console.log('초기 캐치프레이즈 설정:', firstPhrase)
    }
    
    // 2. reports.generate()로 실제 배너들 로드 시도
    try {
      await loadBannersFromAPI()
    } catch (bannerError) {
      console.log('배너 API 로드 실패, 기본 배너 유지')
    }
    
    console.log('초기 데이터 로드 완료')
    
  } catch (error) {
    console.error('초기 데이터 로드 중 치명적 오류:', error)
  }
}

// 새로운 함수 - API에서 배너 로드
const loadBannersFromAPI = async () => {
  try {
    const bannerList = await apiService.banner.getBannerList()
    if (bannerList && bannerList.length > 0) {
      console.log('API에서 배너 로드 성공:', bannerList.length, '개')
      const limitedBanners = maintainMaxBanners(bannerList)
      setBanners(limitedBanners)
      setCurrentBannerIndex(0)
      
      // 첫 번째 배너의 캐치프레이즈 설정
      if (limitedBanners.length > 0) {
        const firstPhrase = limitedBanners[0].chatPhrase || "인기 최고 판매율 1위 닭가슴살을 만나보세요!"
        setDisplayCatchPhrase(firstPhrase)
        setCatchPhraseHighlight(true)
        setTimeout(() => setCatchPhraseHighlight(false), 1000)
        console.log('API 배너 로드 후 캐치프레이즈 업데이트 완료:', firstPhrase)
      }
    }
  } catch (error) {
    console.log('API 배너 로드 실패:', error.message)
    throw error // loadInitialData에서 catch하도록
  }
};

// 테스트용 함수도 추가하세요 (개발 중에만 사용)
const testBannerAPI = async () => {
  console.log('=== 배너 API 테스트 시작 ===');
  
  try {
    console.log('1. 토큰 확인:', localStorage.getItem('accessToken') ? '있음' : '없음');
    
    console.log('2. API 직접 호출 테스트...');
    const result = await apiService.reports.generate();
    
    console.log('3. API 결과:', result);
    
    if (result && Array.isArray(result)) {
      console.log('4. 배너 상태 업데이트 시도...');
      setBanners(result);
      setCurrentBannerIndex(0);
      
      if (result.length > 0) {
        setDisplayCatchPhrase(result[0].chatPhrase);
        setCatchPhraseHighlight(true);
        setTimeout(() => setCatchPhraseHighlight(false), 1000);
        console.log('5. 캐치프레이즈 업데이트:', result[0].chatPhrase);
      }
      
      console.log('6. 테스트 완료 - 성공!');
    } else {
      console.log('4. API 결과가 올바르지 않음');
    }
    
  } catch (error) {
    console.error('테스트 실패:', error);
  }
  
  console.log('=== 배너 API 테스트 종료 ===');
};

  // 로그인 핸들러 함수
  const handleLogin = () => {
    navigate("/login")
  }

  // 알림 숨기기 함수 추가
  const handleHideNotification = () => {
    setShowNotification(false)
  }

  // 수정된 배너 슬라이드 제어 함수들 - 헬퍼 함수 사용
  const goToPrevBanner = () => {
    setCurrentBannerIndex((prev) => {
      const newIndex = (prev - 1 + banners.length) % banners.length
      console.log(`Manual prev: ${prev} -> ${newIndex}`)
      
      // 캐치프레이즈 즉시 업데이트
      setTimeout(() => updateCatchPhraseFromBanner(newIndex, banners), 0)
      
      return newIndex
    })
  }

  const goToNextBanner = () => {
    setCurrentBannerIndex((prev) => {
      const newIndex = (prev + 1) % banners.length
      console.log(`Manual next: ${prev} -> ${newIndex}`)
      
      // 캐치프레이즈 즉시 업데이트  
      setTimeout(() => updateCatchPhraseFromBanner(newIndex, banners), 0)
      
      return newIndex
    })
  }

  const goToBanner = (index) => {
    console.log(`Direct go to banner: ${currentBannerIndex} -> ${index}`)
    setCurrentBannerIndex(index)
    
    // 캐치프레이즈 즉시 업데이트
    setTimeout(() => updateCatchPhraseFromBanner(index, banners), 0)
  }

  const handlePointerMove = (e) => {
    if (!isDragging || banners.length <= 1) return
    
    const isTouch = e.type === 'touchmove'
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    
    setCurrentX(clientX)
    const offset = clientX - startX
    setDragOffset(offset)
    
    if (Math.abs(offset) > 10) {
      setDragStarted(true)
    }
    
    if (isTouch && Math.abs(offset) > 10) {
      e.preventDefault()
    }
  }

  const handlePointerEnd = (e) => {
    if (!isDragging || banners.length <= 1) return
    
    setIsDragging(false)
    const offset = currentX - startX
    const threshold = 80
    
    if (dragStarted && Math.abs(offset) > threshold) {
      if (offset > 0) {
        goToPrevBanner()
      } else {
        goToNextBanner()
      }
    }
    
    setDragOffset(0)
    setDragStarted(false)
  }

  const handleBannerMouseEnter = () => {
    setIsHovering(true)
  }

  const handleBannerMouseLeave = () => {
    setIsHovering(false)
  }

  const handlePointerStart = (e) => {
    if (banners.length <= 1) return
    
    const isTouch = e.type === 'touchstart'
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    
    setIsDragging(true)
    setDragStarted(false)
    setStartX(clientX)
    setCurrentX(clientX)
    setDragOffset(0)
    
    if (!isTouch) {
      e.preventDefault()
    }
  }

  // 배너 클릭/탭 핸들러 (뒤집기용)
  const handleBannerClick = (e, bannerId, position) => {
    // 다른 배너를 클릭하면 해당 배너로 이동
    if (position !== 0) {
      e.preventDefault()
      const index = banners.findIndex((banner, idx) => (banner.id || `banner-${idx}`) === bannerId)
      if (index !== -1) {
        goToBanner(index)
      }
      return
    }
    
    // 현재 배너 클릭 시 - 드래그가 아닐 때만 뒤집기
    const touchThreshold = 30
    const shouldFlip = !dragStarted && Math.abs(dragOffset) < touchThreshold
    
    if (shouldFlip) {
      e.preventDefault()
      e.stopPropagation()
      
      const currentFlipped = flippedBanners[bannerId] || false
      const newFlippedState = !currentFlipped
      
      // 모든 기존 타이머들 정리
      if (flipTimeouts.current[bannerId]) {
        clearTimeout(flipTimeouts.current[bannerId])
        delete flipTimeouts.current[bannerId]
      }
      if (flipTimeouts.current[`${bannerId}-back`]) {
        clearTimeout(flipTimeouts.current[`${bannerId}-back`])
        delete flipTimeouts.current[`${bannerId}-back`]
      }
      if (flipTimeouts.current[`${bannerId}-manual`]) {
        clearTimeout(flipTimeouts.current[`${bannerId}-manual`])
        delete flipTimeouts.current[`${bannerId}-manual`]
      }
      if (progressIntervals.current[bannerId]) {
        clearInterval(progressIntervals.current[bannerId])
        delete progressIntervals.current[bannerId]
      }
      
      setFlippedBanners(prev => ({ ...prev, [bannerId]: newFlippedState }))
      
      if (newFlippedState) {
        const backToFrontTimeout = setTimeout(() => {
          setFlippedBanners(prev => ({ ...prev, [bannerId]: false }))
          setFlipProgress(prev => ({ ...prev, [bannerId]: 0 }))
        }, 7000)
        
        flipTimeouts.current[`${bannerId}-manual`] = backToFrontTimeout
      } else {
        setFlipProgress(prev => ({ ...prev, [bannerId]: 0 }))
      }
    }
  }

  // 배너 이미지 에러 처리 함수
  const handleBannerImageError = (e, banner) => {
    console.error(`배너 이미지 로드 실패: ${banner.url}`)
    
    if (banner.url && banner.url.includes('s3.amazonaws.com')) {
      console.log('S3 이미지 실패, 기본 이미지로 대체')
      e.target.src = bannerlast
    } else {
      e.target.src = bannerlast
    }
  }

  // 모의 리뷰 데이터 생성 함수
  const getMockReviewsForBanner = (banner) => {
    const mockReviews = [
      {
        id: 1,
        rating: 5,
        text: "정말 부드럽고 맛있어요! 다이어트에 최고",
        author: "김**님"
      },
      {
        id: 2,
        rating: 5,
        text: "단백질 함량 높고 맛도 좋아서 계속 주문해요",
        author: "이**님"
      },
      {
        id: 3,
        rating: 4,
        text: "배송도 빠르고 포장도 깔끔해서 만족!",
        author: "박**님"
      }
    ]
    return mockReviews
  }

  const toggleRecommendedLike = (productId) => {
    setLikedRecommended((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  const toggleCategoryLike = (productId) => {
    setLikedCategory((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId],
    )
  }

  // 배너 렌더링 함수
  const renderBanners = () => {
    return banners.map((banner, index) => {
      let position = index - currentBannerIndex
      
      if (position > banners.length / 2) {
        position -= banners.length
      } else if (position < -banners.length / 2) {
        position += banners.length
      }
      
      let className = 'banner-slide'
      if (position === 0) {
        className += ' active'
      } else {
        className += ' side'
      }
      
      const bannerId = banner.id || `banner-${index}`
      const isFlipped = flippedBanners[bannerId] || false
      const progress = flipProgress[bannerId] || 0
      
      if (isFlipped) {
        className += ' flipped'
      }
      
      const SLIDE = 298
      const GAP = 20      
      const STEP = SLIDE + GAP
      let translateX = position * STEP
      
      if (isDragging) {
        translateX += dragOffset
      }
      
      const scale = 1
      const opacity = position === 0 ? 1 : 0.7

      const mockReviews = getMockReviewsForBanner(banner)
      
      return (
        <div 
          key={bannerId}
          className={className}
          style={{
            transform: `translateX(calc(-50% + ${translateX}px)) translateY(-50%) scale(${scale})`,
            opacity: opacity,
            zIndex: position === 0 ? 10 : 5,
            transition: isDragging ? 'none' : 'transform 420ms cubic-bezier(.22,.61,.36,1), opacity 300ms ease'
          }}
          onMouseEnter={handleBannerMouseEnter}
          onMouseLeave={handleBannerMouseLeave}
          onClick={(e) => handleBannerClick(e, bannerId, position)}
        >
          <div className="banner-slide-inner">
            {/* 배너 앞면 */}
            <div className="banner-front">
              <img
                src={banner.url}
                alt={banner.chatPhrase}
                className="home-banner-image"
                onError={(e) => handleBannerImageError(e, banner)}
                draggable={false}
              />
              
              {/* 리뷰 기반 배지 */}
              <div className="review-based-badge">
                리뷰 기반
              </div>

              {/* 배너 번호 표시 */}
              {position === 0 && (
                <div className="banner-number">
                  {currentBannerIndex + 1}/{banners.length}
                </div>
              )}

              {/* 진행률 표시 */}
              {position === 0 && !isDragging && (
                <div className="flip-progress">
                  <span>리뷰 보기</span>
                  <div className="flip-progress-bar">
                    <div 
                      className="flip-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            {/* 배너 뒷면 */}
            <div className="banner-back">
              <div className="review-info-header">
                <div className="review-info-title">
                   {banner.reviewInfo?.productName || "수비드 닭가슴살"}
                </div>
                <div className="review-info-meta">
                  <span>⭐ 4.8점</span>
                  <span>📝 {banner.reviewInfo?.reviewCount || "1,247"}개</span>
                  <span>✨ AI 분석</span>
                </div>
              </div>
              
              <div className="reviews-display-container">
                {mockReviews.map((review) => (
                  <div key={review.id} className="review-display-item">
                    <div className="review-display-rating">
                      {"⭐".repeat(review.rating)}
                    </div>
                    <div className="review-display-text">
                      "{review.text}"
                    </div>
                    <div className="review-display-author">- {review.author}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    })
  }

  return (
    <div className="app">
      {/* 가짜 알림 컴포넌트 추가 */}
      <FakeNotification 
        show={showNotification} 
        onHide={handleHideNotification} 
      />

      {/* 헤더 */}
      <header className="header">
        <h1 className="logo">세 라 통 살</h1>
        <div className="header-icons">
          <img src={cartIcon || "/placeholder.svg"} alt="장바구니" className="header-icon cart-icon" />
          <img src={notificationIcon || "/placeholder.svg"} alt="알림" className="header-icon" />
        </div>
      </header>

      {/* 검색창 */}
      <div className="search-container">
        <div className="search-bar">
          <img src={searchIcon || "/placeholder.svg"} alt="검색" className="search-icon" />
          <input type="text" placeholder="세라통살에서 검색해보세요!" className="search-input" />
        </div>
      </div>
      
      {/* 리뷰 기반 추천 텍스트 */}
      <div className="review-recommendation-text">
        * 고객님들의 리뷰를 기반으로 상품을 추천드립니다.
      </div>

      {/* 배너 존 - 새로운 뒤집기 시스템 */}
      <div className={`home-banner-zone ${banners.length > 1 ? 'multiple-banners' : ''}`}>
        <div className="banner-slider">
          <div 
            ref={bannerSlidesRef}
            className={`banner-slides ${isDragging ? 'dragging' : ''}`}
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
            onTouchStart={handlePointerStart}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerEnd}
            onMouseDown={handlePointerStart}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerEnd}
            onMouseLeave={handlePointerEnd}
          >
            {renderBanners()}
          </div>
          
          {/* 인디케이터 */}
          {banners.length > 1 && (
            <div className="banner-indicators">
              {banners.map((_, index) => (
                <div
                  key={index}
                  className={`banner-indicator ${index === currentBannerIndex ? 'active' : ''}`}
                  onClick={() => goToBanner(index)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 수정된 캐치프레이즈 */}
      <div className={`catch-phrase ${catchPhraseHighlight ? 'highlight' : ''}`}>
        {displayCatchPhrase}
      </div>

      {/* 사용자 프로필창 */}
      <div className="home-user-profile-section">
        <div className="home-user-profile-top">
          <div className="home-user-avatar">
            <img src={userIcon || "/placeholder.svg"} alt="사용자" />
          </div>
          <div className="home-user-info">
            <h3 className="home-user-name">세라통살사랑님</h3>
            <p className="home-user-description">
              로그인을 하면 고객님에게{"\n"}
              딱 맞는 상품을 추천해드려요!
            </p>
          </div>
        </div>
        <button className="login-button" onClick={handleLogin}>
          로그인 하러 가기
        </button>
      </div>

      {/* 카테고리 탭 */}
      <div className="category-tabs">
        {categories.map((category) => (
          <button
            key={category}
            className={`category-tab ${activeCategory === category ? "active" : ""}`}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      {/* 카테고리 */}
      <section className="category-section">
        <div className="category-products-grid">
          {mockCategoryProducts.map((product) => (
            <div key={product.id} className="category-product-card">
              <div className="category-product-image-container">
                <img src={product.image || "/placeholder.svg"} alt={product.name} className="category-product-image" />
                <button className="heart-button" onClick={() => toggleCategoryLike(product.id)}>
                  <img 
                    src={likedCategory.includes(product.id) ? heart : heartGrey} 
                    alt="찜하기" 
                    className="heart-icon" 
                  />
                </button>
              </div>
              <div className="category-product-info">
                <h4 className="category-product-name">{product.name}</h4>
                <p className="category-product-subtitle">
                  {product.subtitle} {">"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 네비게이션 */}
      <BottomNavigation />
    </div>
  )
}

export default HomeGuest