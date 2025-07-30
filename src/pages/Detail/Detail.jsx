"use client"

import { useState, useEffect } from "react"
import "./Detail.css"

// 하위 컴포넌트
import ProductHeader from "./ProductHeader"
import ProductMainInfo from "./ProductMainInfo"
import TabNavigation from "./TabNavigation"
import TabInfo from "./TabInfo"
import TabReviews from "./TabReviews"
import Tab from "./Tab"
import BottomActions from "./BottomActions"

// 아이콘
import StarIcon from "../../assets/Star.png"
import GoodIcon from "../../assets/Good.png"

const Detail = () => {
  const [activeTab, setActiveTab] = useState("정보")

  // 하드코딩된 초기 데이터 (백엔드 없을 때 fallback 용)
  const category = "닭가슴살 > 수비드"
  const discountRate = 35
  const rating = 4.8
  const reviewCount = 2430

  const [productData, setProductData] = useState({
    id: "1",
    name: "수비드 닭가슴살",
    price: 43800,
    images: ["/placeholder.svg?height=400&width=400"],
    description: "손쉬운 단백질 충전",
    detailInfo:
      "고단백질 20g까지! 쉽은 달걀 2개 이상의 단백질 함량으로 맛있고, 간편하게 고단백질을 챙길 수 있어요",
  })

  const [reviewsData, setReviewsData] = useState([
    {
      id: "1",
      username: "소정소정소정",
      rating: 5,
      date: "2025.07.12",
      content:
        "부드러운 수비드 닭가슴살 | 매운맛 구매\n\n다이어트 시작하고 나서 닭가슴살 계속 먹는데, 질리지 않고 여러 맛을 볼 수 있어 좋아요!",
      images: ["/placeholder.svg?height=200&width=200", "/placeholder.svg?height=200&width=200"],
      helpful: 0,
    },
    {
      id: "2",
      username: "소정소정소정",
      rating: 5,
      date: "2025.07.12",
      content: "부드러운 수비드 닭가슴살 | 매운맛 구매",
      helpful: 0,
    },
  ])

  // 🔹 API 연동
  useEffect(() => {
    // 상품 정보
    fetch("http://localhost:4000/products/1")
      .then((res) => res.json())
      .then((data) => setProductData(data))
      .catch(() => console.log("상품 데이터 로드 실패"))

    // 리뷰 정보
    fetch("http://localhost:4000/reviews?productId=1")
      .then((res) => res.json())
      .then((data) => setReviewsData(data))
      .catch(() => console.log("리뷰 데이터 로드 실패"))
  }, [])

  const tabs = ["정보", "구매 안내", "리뷰", "문의"]

  const renderTabContent = () => {
    switch (activeTab) {
      case "정보":
        return <TabInfo productData={productData} />
      case "리뷰":
        return (
          <TabReviews
            rating={productData.rating || rating}
            reviewCount={productData.reviewCount || reviewCount}
            reviewsData={reviewsData}
          />
        )
      case "구매 안내":
        return <Tab type="구매 안내" />
      case "문의":
        return <Tab type="문의" />
      default:
        return null
    }
  }

  return (
    <div className="mobile-app">
      <ProductHeader />

      {/* 상품 대표 이미지 */}
      <div className="main-product-image">
        <span className="brand-logo">MUSINSA</span>
      </div>

      <ProductMainInfo
        category={productData.category || category}
        productData={productData}
        rating={productData.rating || rating}
        reviewCount={productData.reviewCount || reviewCount}
        discountRate={productData.discountRate || discountRate}
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="tab-content-area">{renderTabContent()}</div>

      <BottomActions />
      <div className="bottom-spacer"></div>
    </div>
  )
}

export default Detail
