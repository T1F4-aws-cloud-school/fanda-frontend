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
    name: "무신사",
    subtitle: "구매하기",
    image: "https://placehold.co/160x160",
  },
  {
    id: 2,
    name: "무신사",
    subtitle: "구매하기",
    image: "https://placehold.co/160x160",
  },
  {
    id: 3,
    name: "무신사",
    subtitle: "구매하기",
    image: "https://placehold.co/160x160",
  },
  {
    id: 4,
    name: "무신사",
    subtitle: "구매하기",
    image: "https://placehold.co/160x160",
  },
  {
    id: 5,
    name: "무신사",
    subtitle: "구매하기",
    image: "https://placehold.co/160x160",
  },
  {
    id: 6,
    name: "무신사",
    subtitle: "구매하기",
    image: "https://placehold.co/160x160",
  },
]

function HomeGuest() {
  const [activeCategory, setActiveCategory] = useState("전체")
  const [likedRecommended, setLikedRecommended] = useState([])
  const [likedCategory, setLikedCategory] = useState([])
  
  // 새로운 배너 시스템 - 메타데이터 포함
  const [banners, setBanners] = useState([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  
  // 스와이프 기능을 위한 상태
  const [isDragging, setIsDragging] = useState(false)
  const [dragStarted, setDragStarted] = useState(false) // 드래그 시작 여부
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const bannerSlidesRef = useRef(null)
  
  // 뒤집기 관련 새로운 상태 추가
  const [flippedBanners, setFlippedBanners] = useState({}) // 배너별 뒤집기 상태
  const [flipProgress, setFlipProgress] = useState({}) // 배너별 진행률
  const [isHovering, setIsHovering] = useState(false) // 호버 상태
  const flipTimeouts = useRef({}) // 배너별 타이머
  const progressIntervals = useRef({}) // 진행률 타이머
  
  const navigate = useNavigate()
  const categories = ["전체", "베스트", "오늘특가", "대량구매", "신상품"]

  // 컴포넌트 마운트 시 초기 데이터 로드
  useEffect(() => {
    loadInitialData()
  }, [])

  // 배너 인덱스 변경 시 다른 배너들을 앞면으로 리셋하는 useEffect 추가
  useEffect(() => {
    if (banners.length === 0) return;

    // 현재 활성 배너가 아닌 모든 배너들을 앞면으로 리셋
    const resetOtherBanners = () => {
      const currentBannerId = banners[currentBannerIndex]?.id || `banner-${currentBannerIndex}`;
      
      // 새로운 flippedBanners 객체 생성
      const newFlippedBanners = {};
      banners.forEach((banner, index) => {
        const bannerId = banner.id || `banner-${index}`;
        // 현재 활성 배너가 아닌 경우 false로 리셋, 현재 배너는 기존 상태 유지
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
          // 현재 배너는 기존 상태 유지
          newFlippedBanners[bannerId] = flippedBanners[bannerId] || false;
        }
      });

      // 상태 업데이트
      setFlippedBanners(newFlippedBanners);
      
      // 진행률도 리셋 (현재 배너 제외)
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
    };

    // 약간의 지연을 두어 배너 전환이 완료된 후 리셋
    const resetTimer = setTimeout(resetOtherBanners, 100);

    return () => clearTimeout(resetTimer);
  }, [currentBannerIndex, banners]); // flippedBanners와 flipProgress는 의존성에서 제외하여 무한 루프 방지

  // 배너 뒤집기 관리 useEffect 추가 (자동 슬라이드 대신)
  useEffect(() => {
    if (banners.length === 0 || isDragging) return
    // 모바일에서는 호버 체크하지 않음 (isHovering 제거)

    // 현재 활성 배너에 대해서만 뒤집기 타이머 설정
    const currentBanner = banners[currentBannerIndex]
    if (!currentBanner) return

    const bannerId = currentBanner.id || `banner-${currentBannerIndex}`

    // 이미 수동으로 뒤집어져 있으면 자동 타이머 설정하지 않음
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
        const newProgress = Math.min(current + 2, 100) // 5초 = 5000ms, 100ms마다 2%씩 증가
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
      
      // backToFrontTimeout도 관리하기 위해 저장
      flipTimeouts.current[`${bannerId}-back`] = backToFrontTimeout
    }, 5000)

    flipTimeouts.current[bannerId] = flipTimeout

    // 정리 함수
    return () => {
      clearTimeout(flipTimeout)
      clearInterval(progressInterval)
      // 추가 타이머도 정리
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
      return bannerList.slice(0, 3) // 최신 3개만 유지
    }
    return bannerList
  }

  // 초기 데이터 로드
  const loadInitialData = async () => {
    try {
      // 배너 목록 로드 (캐시된 배너들 또는 기본 배너들)
      await loadInitialBanners()
      
      
    } catch (error) {
      console.error("초기 데이터 로드 실패:", error)
    }
  }

  // 초기 배너들 로드
  const loadInitialBanners = async () => {
    try {
      const bannerList = await apiService.banner.getBannerList()
      const limitedBanners = maintainMaxBanners(bannerList)
      setBanners(limitedBanners)
      setCurrentBannerIndex(0) // 첫 번째 배너로 설정
      console.log("게스트 초기 배너들 로드 완료:", limitedBanners)
    } catch (error) {
      console.error("배너 로드 실패:", error)
      // 에러 시 기본 배너들 사용
      const defaultBanners = apiService.banner.getDefaultBanners()
      setBanners(maintainMaxBanners(defaultBanners))
      setCurrentBannerIndex(0) // 첫 번째 배너로 설정
    }
  }

  // 새 배너 생성 시도 (게스트용 - 권한 없으면 무시)
  const tryGenerateNewBanner = async () => {
    try {
      const response = await apiService.reports.generate()
      
      if (response) {
        const additionalData = {
          productName: "닭가슴살",
          reviewCount: "최신",
          sentiment: "긍정적"
        }
        
        const updatedBanners = await apiService.banner.generateAndAddBanner(banners, {
          ...response,
          ...additionalData
        })
        
        const limitedBanners = maintainMaxBanners(updatedBanners)
        setBanners(limitedBanners)
        setCurrentBannerIndex(0) // 새 배너를 첫 번째로 설정
        console.log("게스트 새 배너 생성 성공:", response)
      }
    } catch (error) {
      console.log("게스트 배너 생성 실패 (정상적인 경우), 기본 배너 사용:", error.message)
    }
  }

  // 로그인 핸들러 함수
  const handleLogin = () => {
    navigate("/login")
  }

  // 배너 슬라이드 제어 (수동 슬라이드만)
  const goToPrevBanner = () => {
    setCurrentBannerIndex((prev) => {
      const newIndex = (prev - 1 + banners.length) % banners.length
      console.log(`Manual prev: ${prev} -> ${newIndex}`)
      return newIndex
    })
  }

  const goToNextBanner = () => {
    setCurrentBannerIndex((prev) => {
      const newIndex = (prev + 1) % banners.length
      console.log(`Manual next: ${prev} -> ${newIndex}`)
      return newIndex
    })
  }

  const goToBanner = (index) => {
    console.log(`Direct go to banner: ${currentBannerIndex} -> ${index}`)
    setCurrentBannerIndex(index)
  }

  // 통합된 포인터 이벤트 핸들러 (터치와 마우스 모두 처리)
  const handlePointerStart = (e) => {
    if (banners.length <= 1) return
    
    // 터치와 마우스 이벤트 구분
    const isTouch = e.type === 'touchstart'
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    
    setIsDragging(true)
    setDragStarted(false)
    setStartX(clientX)
    setCurrentX(clientX)
    setDragOffset(0)
    
    console.log('Pointer start:', clientX, 'isTouch:', isTouch)
    
    // 마우스 이벤트의 경우 기본 동작 방지
    if (!isTouch) {
      e.preventDefault()
    }
  }

  const handlePointerMove = (e) => {
    if (!isDragging || banners.length <= 1) return
    
    const isTouch = e.type === 'touchmove'
    const clientX = isTouch ? e.touches[0].clientX : e.clientX
    
    setCurrentX(clientX)
    const offset = clientX - startX
    setDragOffset(offset)
    
    // 드래그가 일정 거리 이상이면 드래그 시작으로 표시
    if (Math.abs(offset) > 10) {
      setDragStarted(true)
    }
    
    // 터치 이벤트에서는 기본 스크롤 방지
    if (isTouch && Math.abs(offset) > 10) {
      e.preventDefault()
    }
    
    console.log('Pointer move:', offset, 'dragStarted:', Math.abs(offset) > 10)
  }

  const handlePointerEnd = (e) => {
    if (!isDragging || banners.length <= 1) return
    
    setIsDragging(false)
    const offset = currentX - startX
    const threshold = 80 // 스와이프 인식 임계값
    
    console.log('Pointer end, offset:', offset, 'dragStarted:', dragStarted)
    
    // 드래그가 충분히 이루어졌고 임계값을 넘었으면 슬라이드 변경
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

  // 마우스 호버 이벤트 핸들러 추가
  const handleBannerMouseEnter = () => {
    setIsHovering(true)
  }

  const handleBannerMouseLeave = () => {
    setIsHovering(false)
  }

  // 배너 클릭/탭 핸들러 (뒤집기용)
  const handleBannerClick = (e, bannerId, position) => {
    console.log('=== BANNER CLICK DEBUG ===')
    console.log('Event type:', e.type)
    console.log('Banner ID:', bannerId)
    console.log('Position:', position)
    console.log('Is dragging:', isDragging)
    console.log('Drag started:', dragStarted)
    console.log('Drag offset:', dragOffset)
    console.log('Current flipped state:', flippedBanners[bannerId])
    
    // 다른 배너를 클릭하면 해당 배너로 이동
    if (position !== 0) {
      e.preventDefault()
      console.log('Switching to banner at position:', position)
      const index = banners.findIndex((banner, idx) => (banner.id || `banner-${idx}`) === bannerId)
      if (index !== -1) {
        goToBanner(index)
      }
      return
    }
    
    // 현재 배너 클릭 시 - 드래그가 아닐 때만 뒤집기
    const touchThreshold = 30 // 더욱 관대하게 증가
    const shouldFlip = !dragStarted && Math.abs(dragOffset) < touchThreshold
    
    console.log('Should flip:', shouldFlip)
    console.log('Touch threshold:', touchThreshold)
    console.log('Drag offset abs:', Math.abs(dragOffset))
    
    if (shouldFlip) {
      e.preventDefault()
      e.stopPropagation()
      
      // 현재 뒤집기 상태 확인
      const currentFlipped = flippedBanners[bannerId] || false
      const newFlippedState = !currentFlipped
      
      console.log('Flipping banner from', currentFlipped, 'to', newFlippedState)
      
      // 모든 기존 타이머들 정리
      console.log('Clearing all existing timers for banner:', bannerId)
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
      
      // 뒤집기 상태 업데이트
      setFlippedBanners(prev => {
        const updated = { ...prev, [bannerId]: newFlippedState }
        console.log('Updated flipped banners:', updated)
        return updated
      })
      
      // 수동 뒤집기 후 타이머 설정
      if (newFlippedState) {
        // 뒤집을 때: 7초 후 자동으로 앞면으로
        console.log('Setting 7-second timer to flip back to front')
        const backToFrontTimeout = setTimeout(() => {
          console.log('Manual flip timer: flipping back to front for banner:', bannerId)
          setFlippedBanners(prev => ({ ...prev, [bannerId]: false }))
          setFlipProgress(prev => ({ ...prev, [bannerId]: 0 }))
        }, 7000)
        
        flipTimeouts.current[`${bannerId}-manual`] = backToFrontTimeout
      } else {
        // 앞면으로 뒤집을 때: 진행바 재시작하고 새로운 자동 사이클 시작
        console.log('Manual flip to front - restarting auto cycle')
        setFlipProgress(prev => ({ ...prev, [bannerId]: 0 }))
      }
      
      console.log('Banner flip completed for:', bannerId)
    } else {
      console.log('Banner flip blocked - drag detected or threshold exceeded')
      console.log('Drag started:', dragStarted)
      console.log('Drag offset:', dragOffset)
      console.log('Threshold:', touchThreshold)
    }
    
    console.log('=== END BANNER CLICK DEBUG ===')
  }

  // 배너 이미지 에러 처리 함수
  const handleBannerImageError = (e, banner) => {
    console.error(`배너 이미지 로드 실패: ${banner.url}`)
    
    // S3 URL이 실패하면 기본 이미지로 대체
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

  // 현재 배너의 캐치프레이즈
  const currentCatchPhrase = banners[currentBannerIndex]?.chatPhrase || "인기 최고 판매율 1위 닭가슴살을 만나보세요!"

  // 배너 렌더링 함수 - 수정된 위치 계산
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
            // 수정된 transform - 중앙 정렬 + X축 이동
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

              {/* 배너 번호 표시 (오른쪽 상단) */}
              {position === 0 && (
                <div className="banner-number">
                  {currentBannerIndex + 1}/{banners.length}
                </div>
              )}

              {/* 진행률 표시 (현재 활성 배너에서만) */}
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
            
            {/* 배너 뒷면 - 감성적인 하얀 배경의 리뷰 정보 */}
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
      {/* 헤더 */}
      <header className="header">
        <h1 className="logo">세 끼 통 살</h1>
        <div className="header-icons">
          <img src={cartIcon || "/placeholder.svg"} alt="장바구니" className="header-icon cart-icon" />
          <img src={notificationIcon || "/placeholder.svg"} alt="알림" className="header-icon" />
        </div>
      </header>

      {/* 검색창 */}
      <div className="search-container">
        <div className="search-bar">
          <img src={searchIcon || "/placeholder.svg"} alt="검색" className="search-icon" />
          <input type="text" placeholder="세끼통살에서 검색해보세요!" className="search-input" />
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

      {/* 캐치프레이즈 */}
      <div className="catch-phrase">
        {currentCatchPhrase}
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