"use client"

import { useState, useEffect, useRef } from "react"
import "./Home2.css"

import cartIcon from "../assets/cart.png"
import notificationIcon from "../assets/notification.png"
import searchIcon from "../assets/search.png"
import bannerImage from "../assets/banner.png"
import bannerlast from "../assets/home-banner.png"
import testBanner1 from "../assets/test-banner-1.png"
import testBanner2 from "../assets/test-banner-2.png"
import categoryIcon from "../assets/category.png"
import mypageIcon from "../assets/mypage.png"
import favoriteIcon from "../assets/favorite.png"
import ichomeIcon from "../assets/ichome.png"
import userIcon from "../assets/user.png"
import chicken from "../assets/chicken.png"
import heart from "../assets/heart.png"        
import heartGrey from "../assets/heart_grey.png" 
import apiService from "../api/apiService"
import { useAuth } from "../context/AuthContext" // AuthContext 사용

// 목업 데이터 (API 없을 때 사용)
const mockRecommendedProducts = [
  { id: 1, name: "단백질 쉐이크", price: "15,800원", image: chicken },
  { id: 2, name: "닭가슴살 큐브", price: "27,800원", image: chicken },
  { id: 3, name: "훈제 닭가슴살", price: "19,800원", image: chicken },
  { id: 4, name: "칠리 닭가슴살", price: "21,800원", image: chicken },
  { id: 5, name: "갈릭 바베큐 닭가슴살", price: "18,800원", image: chicken },
  { id: 6, name: "스팀 닭가슴살", price: "17,500원", image: chicken },
]

const mockCategoryProducts = [
  { id: 1, name: "무신사", subtitle: "제안하기", image: "/placeholder.svg?height=160&width=160" },
  { id: 2, name: "무신사", subtitle: "제안하기", image: "/placeholder.svg?height=160&width=160" },
  { id: 3, name: "무신사", subtitle: "제안하기", image: "/placeholder.svg?height=160&width=160" },
  { id: 4, name: "무신사", subtitle: "제안하기", image: "/placeholder.svg?height=160&width=160" },
  { id: 5, name: "무신사", subtitle: "제안하기", image: "/placeholder.svg?height=160&width=160" },
  { id: 6, name: "무신사", subtitle: "제안하기", image: "/placeholder.svg?height=160&width=160" },
]

function HomeLoggedIn() {
  // AuthContext에서 사용자 정보 가져오기
  const { userInfo, handleLogout } = useAuth()
  
  const [activeCategory, setActiveCategory] = useState("전체")
  const [likedRecommended, setLikedRecommended] = useState([])
  const [likedCategory, setLikedCategory] = useState([])
  
  // 배너 슬라이드를 위한 상태 (HomeGuest와 동일)
  const [banners, setBanners] = useState([
    { 
      url: bannerlast, 
      chatPhrase: "인기 최고 판매율 1위 닭가슴살을 만나보세요!" 
    },
    { 
      url: testBanner1, 
      chatPhrase: "신선한 닭가슴살로 건강한 다이어트!" 
    },
    { 
      url: testBanner2, 
      chatPhrase: "부드럽고 맛있는 프리미엄 닭가슴살" 
    }
  ])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  
  // 스와이프 기능을 위한 상태 (HomeGuest와 동일)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [currentX, setCurrentX] = useState(0)
  const [dragOffset, setDragOffset] = useState(0)
  const [autoSlideEnabled, setAutoSlideEnabled] = useState(true)
  const bannerSlidesRef = useRef(null)
  const autoSlideRef = useRef(null)
  
  // API 연동을 위한 상태 추가
  const [recommendedProducts, setRecommendedProducts] = useState(mockRecommendedProducts)
  const [loading, setLoading] = useState(false)

  const categories = ["전체", "베스트", "오늘특가", "대량구매", "신상품"]

  // 사용자 이름 처리 (AuthContext에서 가져온 정보 사용)
  const displayName = userInfo?.nickname || userInfo?.username || "사용자"

  // 컴포넌트 마운트 시 API 데이터 로드
  useEffect(() => {
    loadApiData()
  }, [])

  // 자동 슬라이드 (5초마다) - 스와이프 중일 때는 멈춤 (HomeGuest와 동일)
  useEffect(() => {
    if (banners.length > 1 && autoSlideEnabled && !isDragging) {
      autoSlideRef.current = setInterval(() => {
        setCurrentBannerIndex((prev) => {
          const nextIndex = (prev + 1) % banners.length
          console.log(`Auto slide: ${prev} -> ${nextIndex}`)
          return nextIndex
        })
      }, 5000)
      
      return () => {
        if (autoSlideRef.current) {
          clearInterval(autoSlideRef.current)
        }
      }
    } else {
      if (autoSlideRef.current) {
        clearInterval(autoSlideRef.current)
      }
    }
  }, [banners.length, autoSlideEnabled, isDragging])

  // API 데이터 로드 함수
  const loadApiData = async () => {
    setLoading(true)
    try {
      // 1. 배너 이미지 및 리포트 생성
      await loadBannerWithReport()
      
      // 2. 개인별 추천 상품 로드 시도
      await loadRecommendedProducts()
      
      // 3. 리뷰 수집 (백그라운드에서)
      await collectReviews()
      
    } catch (error) {
      console.error("API 데이터 로드 실패:", error)
      // 에러 시 목업 데이터 유지
    } finally {
      setLoading(false)
    }
  }

  // 배너 이미지 및 리포트 생성
  const loadBannerWithReport = async () => {
    try {
      const response = await apiService.reports.generate();
      
      if (response) {
        const newBanner = {
          url: response.imageBannerUrl || bannerlast,
          chatPhrase: response.chatPhraseKo || "인기 최고 판매율 1위 닭가슴살을 만나보세요!"
        }
        
        // 새로운 배너를 맨 앞에 추가
        setBanners(prev => {
          const filteredPrev = prev.filter(banner => banner.url !== newBanner.url)
          return [newBanner, ...filteredPrev].slice(0, 3)
        })
        
        setCurrentBannerIndex(0)
        console.log("배너 및 리포트 생성 성공:", response);
      }
    } catch (error) {
      console.log("배너 API 호출 실패, 기본 배너 사용:", error.message);
    }
  }

  // 리뷰 수집
  const collectReviews = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log("토큰 없음, 리뷰 수집 건너뛰기");
        return;
      }

      const response = await apiService.reviews.collect();
      console.log("리뷰 수집 완료:", response);
      
      if (response && Array.isArray(response) && response.length > 0) {
        console.log(`${response.length}개의 새로운 리뷰가 수집되었습니다.`);
      }
    } catch (error) {
      console.log("리뷰 수집 실패 (정상적인 경우일 수 있음):", error.message);
    }
  }

  // 개인별 추천 상품 로드
  const loadRecommendedProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log("토큰 없음, 목업 데이터 사용");
        return;
      }

      const response = await apiService.products.getRecommended();
      
      if (response && Array.isArray(response)) {
        const formattedProducts = response.map(product => ({
          id: product.id,
          name: product.name,
          price: `${product.price.toLocaleString()}원`,
          image: product.imageUrl || chicken
        }));
        setRecommendedProducts(formattedProducts);
      }
    } catch (error) {
      console.log("추천 상품 API 아직 미구현, 목업 데이터 사용:", error.message);
    }
  }

  // 배너 슬라이드 제어 (HomeGuest와 동일)
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

  // 스와이프 이벤트 핸들러들 (HomeGuest와 동일)
  const handleTouchStart = (e) => {
    if (banners.length <= 1) return
    
    setIsDragging(true)
    setAutoSlideEnabled(false)
    const touch = e.touches[0]
    setStartX(touch.clientX)
    setCurrentX(touch.clientX)
    setDragOffset(0)
    
    console.log('Touch start:', touch.clientX)
  }

  const handleTouchMove = (e) => {
    if (!isDragging || banners.length <= 1) return
    
    e.preventDefault()
    const touch = e.touches[0]
    setCurrentX(touch.clientX)
    const offset = touch.clientX - startX
    setDragOffset(offset)
    
    console.log('Touch move:', offset)
  }

  const handleTouchEnd = (e) => {
    if (!isDragging || banners.length <= 1) return
    
    setIsDragging(false)
    const offset = currentX - startX
    const threshold = 80
    
    console.log('Touch end, offset:', offset)
    
    if (Math.abs(offset) > threshold) {
      if (offset > 0) {
        goToPrevBanner()
      } else {
        goToNextBanner()
      }
    }
    
    setDragOffset(0)
    
    setTimeout(() => {
      setAutoSlideEnabled(true)
    }, 100)
  }

  // 마우스 이벤트 핸들러들 (HomeGuest와 동일)
  const handleMouseDown = (e) => {
    if (banners.length <= 1) return
    
    setIsDragging(true)
    setAutoSlideEnabled(false)
    setStartX(e.clientX)
    setCurrentX(e.clientX)
    setDragOffset(0)
    
    console.log('Mouse down:', e.clientX)
  }

  const handleMouseMove = (e) => {
    if (!isDragging || banners.length <= 1) return
    
    setCurrentX(e.clientX)
    const offset = e.clientX - startX
    setDragOffset(offset)
    
    console.log('Mouse move:', offset)
  }

  const handleMouseUp = (e) => {
    if (!isDragging || banners.length <= 1) return
    
    setIsDragging(false)
    const offset = currentX - startX
    const threshold = 80
    
    console.log('Mouse up, offset:', offset)
    
    if (Math.abs(offset) > threshold) {
      if (offset > 0) {
        goToPrevBanner()
      } else {
        goToNextBanner()
      }
    }
    
    setDragOffset(0)
    
    setTimeout(() => {
      setAutoSlideEnabled(true)
    }, 100)
  }

  const toggleRecommendedLike = (productId) => {
    setLikedRecommended((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  const toggleCategoryLike = (productId) => {
    setLikedCategory((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    )
  }

  // 현재 배너의 캐치프레이즈
  const currentCatchPhrase = banners[currentBannerIndex]?.chatPhrase || "인기 최고 판매율 1위 닭가슴살을 만나보세요!"

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

      {/* 배너 존 - 스와이프 기능 (HomeGuest와 동일) */}
      <div className={`home-banner-zone ${banners.length > 1 ? 'multiple-banners' : ''}`}>
        <div className="banner-slider">
          <div 
            ref={bannerSlidesRef}
            className="banner-slides"
            style={{
              cursor: isDragging ? 'grabbing' : 'grab',
              userSelect: 'none'
            }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {banners.map((banner, index) => {
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
              
              const SLIDE = 298
              const GAP = 20      
              const STEP = SLIDE + GAP
              let translateX = position * STEP
              
              if (isDragging) {
                translateX += dragOffset
              }
              
              const scale = 1
              const opacity = position === 0 ? 1 : 0.7
              
              return (
                <div 
                  key={`${banner.url}-${index}`}
                  className={className}
                  style={{
                    transform: `translateX(${translateX}px) scale(${scale})`,
                    opacity: opacity,
                    zIndex: position === 0 ? 10 : 5,
                    transition: isDragging ? 'none' : 'transform 420ms cubic-bezier(.22,.61,.36,1), opacity 300ms ease'
                  }}
                  onClick={(e) => {
                    if (isDragging || Math.abs(dragOffset) > 10) {
                      e.preventDefault()
                      return
                    }
                    if (position !== 0) {
                      goToBanner(index)
                    }
                  }}
                >
                  <img
                    src={banner.url}
                    alt={banner.chatPhrase}
                    className="home-banner-image"
                    onError={(e) => {
                      e.target.src = bannerlast
                    }}
                    draggable={false}
                  />
                </div>
              )
            })}
          </div>
          
          {/* 배너가 여러 개일 때만 인디케이터 표시 */}
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

      {/* 사용자 프로필 창 - 로그인 후 */}
      <div className="home-user-profile-section">
        <div className="home-user-profile-top">
          <div className="home-user-avatar">
            <img src={userIcon || "/placeholder.svg"} alt="사용자" />
          </div>
          <div className="home-user-info">
            <h3 className="home-user-name">{displayName}님</h3>
            <p className="home-user-description">
              {currentCatchPhrase || "오늘도 맛있게 단백질 챙기세요!"}
            </p>
          </div>
        </div>
      </div>

      {/* 추천상품 - API 연동 */}
      <section className="recommended-section">
        <h2 className="section-title">나를 위한 추천 상품</h2>
        {loading ? (
          <div className="loading-message" style={{ textAlign: 'center', padding: '20px' }}>
            추천 상품을 불러오는 중...
          </div>
        ) : (
          <div className="products-scroll">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <img 
                    src={product.image || chicken} 
                    alt={product.name} 
                    className="product-image"
                    onError={(e) => {
                      e.target.src = chicken
                    }}
                  />
                  <button className="heart-button" onClick={() => toggleRecommendedLike(product.id)}>
                    <img
                      src={likedRecommended.includes(product.id) ? heart : heartGrey}
                      alt="찜하기"
                      className="heart-icon"
                    />
                  </button>
                </div>
                <div className="product-info">
                  <h4 className="product-name">{product.name}</h4>
                  <p className="product-price">{product.price}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
                <p className="category-product-subtitle">{product.subtitle} {">"}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 하단 네비게이션 */}
      <nav className="home-bottom-nav">
        <div className="home-nav-item active">
          <img src={ichomeIcon || "/placeholder.svg"} alt="홈" className="home-nav-icon" />
          <span className="home-nav-label">홈</span>
        </div>
        <div className="home-nav-item">
          <img src={categoryIcon || "/placeholder.svg"} alt="카테고리" className="home-nav-icon" />
          <span className="home-nav-label">카테고리</span>
        </div>
        <div className="home-nav-item">
          <img src={favoriteIcon || "/placeholder.svg"} alt="찜" className="home-nav-icon" />
          <span className="home-nav-label">찜</span>
        </div>
        <div className="home-nav-item">
          <img src={mypageIcon || "/placeholder.svg"} alt="마이" className="home-nav-icon" />
          <span className="home-nav-label">마이</span>
        </div>
      </nav>
    </div>
  )
}

export default HomeLoggedIn