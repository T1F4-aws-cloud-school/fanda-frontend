"use client"

import { useState } from "react"
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
import heart from "../assets/heart.png"  // 빨간 하트
import heartGrey from "../assets/heart_grey.png"  // 회색 하트

import { useNavigate } from "react-router-dom"

const mockRecommendedProducts = [
  {
    id: 1,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 2,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 3,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 4,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 5,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: "/placeholder.svg?height=120&width=120",
  },
  {
    id: 6,
    name: "갈릭 바베큐 닭가슴살",
    price: "18,800원",
    image: "/placeholder.svg?height=120&width=120",
  },
]

const mockCategoryProducts = [
  {
    id: 1,
    name: "무신사",
    subtitle: "구매하기",
    image: "/placeholder.svg?height=160&width=160",
  },
  {
    id: 2,
    name: "무신사",
    subtitle: "구매하기",
    image: "/placeholder.svg?height=160&width=160",
  },
  {
    id: 3,
    name: "무신사",
    subtitle: "구매하기",
    image: "/placeholder.svg?height=160&width=160",
  },
  {
    id: 4,
    name: "무신사",
    subtitle: "구매하기",
    image: "/placeholder.svg?height=160&width=160",
  },
  {
    id: 5,
    name: "무신사",
    subtitle: "구매하기",
    image: "/placeholder.svg?height=160&width=160",
  },
  {
    id: 6,
    name: "무신사",
    subtitle: "구매하기",
    image: "/placeholder.svg?height=160&width=160",
  },
]

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userName, setUserName] = useState("소정소정")
  const [activeCategory, setActiveCategory] = useState("전체")
  const [likedRecommended, setLikedRecommended] = useState([])
  const [likedCategory, setLikedCategory] = useState([])
  const navigate = useNavigate()

  const categories = ["전체", "베스트", "오늘특가", "대량구매", "신상품"]

  // 로그인 핸들러 함수
  const handleLogin = () => {
    navigate("/login")
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

  return (
    <div className="app">
      {/* 헤더 */}
      <header className="header">
        <h1 className="logo">안 효 민 바 보</h1>
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

      {/* 사용자 프로필창 */}
      <div className="home-user-profile-section">
        <div className="home-user-profile-top">
          <div className="home-user-avatar">
            <img src={userIcon || "/placeholder.svg"} alt="사용자" />
          </div>
          <div className="home-user-info">
            <h3 className="home-user-name">세끼통살사랑님</h3>
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

      {/* 배너 */}
      <div className="banner">
        <img
          src={bannerImage || "/placeholder.svg"}
          alt="DELICIOUS CHICKEN BREAST Try it now!"
          className="banner-image"
        />
      </div>

      {/* 추천상품 */}
      <section className="recommended-section">
        <h2 className="section-title">나를 위한 추천 상품</h2>
        <div className="products-scroll">
          {mockRecommendedProducts.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img src={chicken || "/placeholder.svg"} alt={product.name} className="product-image" />
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
                <p className="category-product-subtitle">
                  {product.subtitle} {">"}
                </p>
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

export default App