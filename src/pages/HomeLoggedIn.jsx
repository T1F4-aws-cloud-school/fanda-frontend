"use client"

import { useState, useEffect } from "react"
import "./Home2.css"

import cartIcon from "../assets/cart.png"
import notificationIcon from "../assets/notification.png"
import searchIcon from "../assets/search.png"
import bannerImage from "../assets/banner.png"
import categoryIcon from "../assets/category.png"
import mypageIcon from "../assets/mypage.png"
import favoriteIcon from "../assets/favorite.png"
import ichomeIcon from "../assets/ichome.png"
import userIcon from "../assets/user.png"
import chicken from "../assets/chicken.png"
import heart from "../assets/heart.png"        // 빨간 하트
import heartGrey from "../assets/heart_grey.png" // 회색 하트
import apiService from "../api/apiService" // API Service 사용

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
  const [userName] = useState("소정소정") // 로그인된 사용자명
  const [activeCategory, setActiveCategory] = useState("전체")
  const [likedRecommended, setLikedRecommended] = useState([])
  const [likedCategory, setLikedCategory] = useState([])
  
  // API 연동을 위한 상태 추가
  const [bannerUrl, setBannerUrl] = useState(bannerImage) // 기본 배너
  const [recommendedProducts, setRecommendedProducts] = useState(mockRecommendedProducts) // 추천 상품
  const [loading, setLoading] = useState(false)

  const categories = ["전체", "베스트", "오늘특가", "대량구매", "신상품"]

  // 컴포넌트 마운트 시 API 데이터 로드
  useEffect(() => {
    loadApiData()
  }, [])

  // API 데이터 로드 함수
  const loadApiData = async () => {
    setLoading(true)
    try {
      // 1. 배너 이미지 로드 시도
      await loadBannerImage()
      
      // 2. 개인별 추천 상품 로드 시도
      await loadRecommendedProducts()
      
    } catch (error) {
      console.error("API 데이터 로드 실패:", error)
      // 에러 시 목업 데이터 유지
    } finally {
      setLoading(false)
    }
  }

  // 배너 이미지 로드 (Bedrock S3 API 연동 예정)
  const loadBannerImage = async () => {
    try {
      const response = await apiService.banner.getLatest();
      if (response && response.imageUrl) {
        setBannerUrl(response.imageUrl);
      }
    } catch (error) {
      console.log("배너 API 아직 미구현, 기본 배너 사용:", error.message);
      // 기본 배너 유지
    }
  }

  // 개인별 추천 상품 로드 (API 연동 예정)
  const loadRecommendedProducts = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        console.log("토큰 없음, 목업 데이터 사용");
        return;
      }

      const response = await apiService.products.getRecommended();
      
      if (response && Array.isArray(response)) {
        // API 응답 데이터를 프론트엔드 형식으로 변환
        const formattedProducts = response.map(product => ({
          id: product.id,
          name: product.name,
          price: `${product.price.toLocaleString()}원`,
          image: product.imageUrl || chicken // 이미지 없으면 기본 이미지
        }));
        setRecommendedProducts(formattedProducts);
      }
    } catch (error) {
      console.log("추천 상품 API 아직 미구현, 목업 데이터 사용:", error.message);
      // 목업 데이터 유지
    }
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

      {/* 사용자 프로필 창- 로그인 후 */}
      <div className="home-user-profile-section">
        <div className="home-user-profile-top">
          <div className="home-user-avatar">
            <img src={userIcon || "/placeholder.svg"} alt="사용자" />
          </div>
          <div className="home-user-info">
            <h3 className="home-user-name">{userName}님</h3>
            <p className="home-
            home-user-description">오늘도 맛있게 단백질 챙기세요!</p>
          </div>
        </div>
      </div>

      {/* 배너 - API 연동 */}
      <div className="banner">
        <img
          src={bannerUrl}
          alt="DELICIOUS CHICKEN BREAST Try it now!"
          className="banner-image"
          onError={(e) => {
            // 이미지 로드 실패 시 기본 이미지로 대체
            e.target.src = bannerImage
          }}
        />
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
                      // 상품 이미지 로드 실패 시 기본 이미지로 대체
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
        <div className="nav-item active">
          <img src={ichomeIcon || "/placeholder.svg"} alt="홈" className="nav-icon" />
          <span className="nav-label">홈</span>
        </div>
        <div className="nav-item">
          <img src={categoryIcon || "/placeholder.svg"} alt="카테고리" className="nav-icon" />
          <span className="nav-label">카테고리</span>
        </div>
        <div className="nav-item">
          <img src={favoriteIcon || "/placeholder.svg"} alt="찜" className="nav-icon" />
          <span className="nav-label">찜</span>
        </div>
        <div className="nav-item">
          <img src={mypageIcon || "/placeholder.svg"} alt="마이" className="nav-icon" />
          <span className="nav-label">마이</span>
        </div>
      </nav>
    </div>
  )
}

export default HomeLoggedIn