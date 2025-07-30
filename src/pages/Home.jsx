"use client"
import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./Home.css"

// 이미지 import
import cartIcon from "../assets/Cart.png"
import notificationIcon from "../assets/Notification.png"
import searchIcon from "../assets/Search.png"
import userIcon from "../assets/User.png"
import bannerImage from "../assets/Banner.png"
import homeIcon from "../assets/Home.png"
import categoryIcon from "../assets/Category.png"
import mypageIcon from "../assets/Mypage.png"
import chickenImage from "../assets/Chicken.png"
import favoriteIcon from "../assets/Favorite.png"
import redHeartIcon from "../assets/Heart.png"
import greyHearIcon from "../assets/Heart_grey.png"

const HomePage = () => {
  const navigate = useNavigate()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userNickname, setUserNickname] = useState("세끼통살사랑")
  const [selectedCategory, setSelectedCategory] = useState("전체")

  // 추천 상품 데이터 (6개 - chicken.png 사용)
  const recommendedProducts = [
    {
      id: 1,
      name: "갈릭 바베큐 닭가슴살",
      price: "18,800원",
      image: chickenImage,
      isLiked: false,
      brand: "무신사",
    },
    {
      id: 2,
      name: "갈릭 바베큐 닭가슴살",
      price: "18,800원",
      image: chickenImage,
      isLiked: true,
      brand: "무신사",
    },
    {
      id: 3,
      name: "갈릭 바베큐 닭가슴살",
      price: "18,800원",
      image: chickenImage,
      isLiked: false,
      brand: "무신사",
    },
    {
      id: 4,
      name: "갈릭 바베큐 닭가슴살",
      price: "18,800원",
      image: chickenImage,
      isLiked: false,
      brand: "무신사",
    },
    {
      id: 5,
      name: "갈릭 바베큐 닭가슴살",
      price: "18,800원",
      image: chickenImage,
      isLiked: true,
      brand: "무신사",
    },
    {
      id: 6,
      name: "갈릭 바베큐 닭가슴살",
      price: "18,800원",
      image: chickenImage,
      isLiked: false,
      brand: "무신사",
    },
  ]

  // 카테고리별 상품 데이터 (각 카테고리당 6개씩)
  const categoryProducts = {
    전체: [
      { id: 7, name: "갈릭 바베큐 닭가슴살", price: "18,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 8, name: "갈릭 바베큐 닭가슴살", price: "18,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 9, name: "갈릭 바베큐 닭가슴살", price: "18,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 10, name: "갈릭 바베큐 닭가슴살", price: "18,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 11, name: "갈릭 바베큐 닭가슴살", price: "18,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 12, name: "갈릭 바베큐 닭가슴살", price: "18,800원", image: chickenImage, isLiked: false, brand: "무신사" },
    ],
    베스트: [
      { id: 13, name: "베스트 닭가슴살", price: "19,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 14, name: "베스트 닭가슴살", price: "19,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 15, name: "베스트 닭가슴살", price: "19,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 16, name: "베스트 닭가슴살", price: "19,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 17, name: "베스트 닭가슴살", price: "19,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 18, name: "베스트 닭가슴살", price: "19,800원", image: chickenImage, isLiked: false, brand: "무신사" },
    ],
    오늘특가: [
      { id: 19, name: "특가 닭가슴살", price: "15,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 20, name: "특가 닭가슴살", price: "15,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 21, name: "특가 닭가슴살", price: "15,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 22, name: "특가 닭가슴살", price: "15,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 23, name: "특가 닭가슴살", price: "15,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 24, name: "특가 닭가슴살", price: "15,800원", image: chickenImage, isLiked: false, brand: "무신사" },
    ],
    대량구매: [
      { id: 25, name: "대량 닭가슴살", price: "89,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 26, name: "대량 닭가슴살", price: "89,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 27, name: "대량 닭가슴살", price: "89,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 28, name: "대량 닭가슴살", price: "89,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 29, name: "대량 닭가슴살", price: "89,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 30, name: "대량 닭가슴살", price: "89,800원", image: chickenImage, isLiked: false, brand: "무신사" },
    ],
    신상품: [
      { id: 31, name: "신상 닭가슴살", price: "22,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 32, name: "신상 닭가슴살", price: "22,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 33, name: "신상 닭가슴살", price: "22,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 34, name: "신상 닭가슴살", price: "22,800원", image: chickenImage, isLiked: false, brand: "무신사" },
      { id: 35, name: "신상 닭가슴살", price: "22,800원", image: chickenImage, isLiked: true, brand: "무신사" },
      { id: 36, name: "신상 닭가슴살", price: "22,800원", image: chickenImage, isLiked: false, brand: "무신사" },
    ],
  }

  const categories = ["전체", "베스트", "오늘특가", "대량구매", "신상품"]

  // JWT 토큰 확인
  useEffect(() => {
    const token = localStorage.getItem("jwt_token")
    if (token) {
      setIsLoggedIn(true)
      setUserNickname("홍길동님")
    }
  }, [])

  const handleLogin = () => {
    navigate("/login")
  }

  const handleLike = (productId) => {
    console.log(`상품 ${productId} 찜하기 토글`)
  }

  return (
    <div className="mobile-container">
      {/* 헤더 */}
      <header className="header">
        <h1 className="logo">세끼통살</h1>
        <div className="header-icons">
          <img src={cartIcon || "/placeholder.svg"} alt="장바구니" className="header-icon cart-icon" />
          <div className="notification-wrapper">
            <img src={notificationIcon || "/placeholder.svg"} alt="알림" className="header-icon notification-icon" />
          </div>
        </div>
      </header>

      <div className="content">
        {/* 검색바 - 항상 표시 */}
        <div className="search-section">
          <div className="search-bar">
            <img src={searchIcon || "/placeholder.svg"} alt="검색" className="search-icon" />
            <input type="text" placeholder="세끼통살에서 검색해보세요!" className="search-input" />
          </div>
        </div>

        {/* 로그인 유도 섹션 - 항상 표시 */}
        <div className="login-prompt">
          <div className="login-content">
            <div className="user-avatar">
              <img src={userIcon || "/placeholder.svg"} alt="사용자" />
            </div>
            <div className="login-text">
              <h3>세끼통살사랑님</h3>
              <p>
                로그인을 하면 고객님에게
                <br />딱 맞는 상품을 추천해드려요!
              </p>
            </div>
          </div>
          <button className="login-button" onClick={handleLogin}>
            로그인 하러 가기
          </button>
        </div>

        {/* 배너 섹션 - 항상 표시 */}
        <div className="banner-section">
          <img src={bannerImage || "/placeholder.svg"} alt="DELICIOUS CHICKEN BREAST" className="banner-image" />
        </div>

        {/* 추천 상품 섹션 - 항상 표시 (6개 가로 스크롤) */}
        <div className="products-section">
          <h2 className="section-title">나를 위한 추천 상품</h2>
          <div className="products-horizontal">
            {recommendedProducts.map((product) => (
              <div key={product.id} className="product-card-horizontal">
                <div className="product-image-horizontal">
                  <img src={product.image || "/placeholder.svg"} alt={product.name} />
                  <button
                    className={`heart-button-horizontal ${product.isLiked ? "liked" : ""}`}
                    onClick={() => handleLike(product.id)}
                  >
                    <img src={favoriteIcon || "/placeholder.svg"} alt="찜하기" />
                  </button>
                </div>
                <div className="product-info-horizontal">
                  <div className="product-name">{product.name}</div>
                  <div className="product-price">{product.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 카테고리 탭 - 항상 표시 */}
        <div className="category-tabs-bottom">
          {categories.map((category) => (
            <button
              key={category}
              className={`category-tab ${selectedCategory === category ? "active" : ""}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        {/* 카테고리별 상품 섹션 - 항상 표시 (6개 2x3 그리드) */}
        <div className="products-section">
          <div className="products-grid">
            {categoryProducts[selectedCategory].map((product) => (
              <div key={product.id} className="product-card">
                <div className="product-image-container">
                  <div className="product-image-placeholder">
                    <span className="brand-name">MUSINSA</span>
                  </div>
                  <button
                    className={`heart-button ${product.isLiked ? "liked" : ""}`}
                    onClick={() => handleLike(product.id)}
                  >
                    <img src={greyHearIcon || "/placeholder.svg"} alt="찜하기" />
                  </button>
                </div>
                <div className="product-info">
                  <div className="product-brand">{product.brand}</div>
                  <div className="product-action">제안하기 &gt;</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <nav className="bottom-nav">
        <div className="nav-item active">
          <img src={homeIcon || "/placeholder.svg"} alt="홈" className="nav-icon" />
          <span>홈</span>
        </div>
        <div className="nav-item">
          <img src={categoryIcon || "/placeholder.svg"} alt="카테고리" className="nav-icon" />
          <span>카테고리</span>
        </div>
        <div className="nav-item">
          <img src={favoriteIcon || "/placeholder.svg"} alt="찜" className="nav-icon" />
          <span>찜</span>
        </div>
        <div className="nav-item">
          <img src={mypageIcon || "/placeholder.svg"} alt="마이" className="nav-icon" />
          <span>마이</span>
        </div>
      </nav>
    </div>
  )
}

export default HomePage
