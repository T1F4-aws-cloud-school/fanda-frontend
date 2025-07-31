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
import StarIcon from "../../assets/star.png"
import GoodIcon from "../../assets/good.png"

const Detail = () => {
  const [activeTab, setActiveTab] = useState("정보")

  // 하드코딩된 초기 데이터 (백엔드 없을 때 fallback 용)
  const fallbackProductData = {
    id: "1",
    name: "수비드 닭가슴살",
    price: 43800,
    images: ["/placeholder.svg?height=400&width=400"],
    rating: 4.8,
    reviewCount: 2430,
    discountRate: 35,
    category: "닭가슴살 > 수비드",
    description: "손쉬운 단백질 충전",
    detailInfo: "손쉬운 단백질 충전\n고단백질 20g까지!\n삶은 달걀 2개 이상 단백질 함량으로 맛있고 간편하게 챙길 수 있어요",
  }

  const [productData, setProductData] = useState(fallbackProductData)

  // API 연동
  useEffect(() => {
    // 상품 정보
    fetch("http://localhost:4000/products/1")
      .then((res) => res.json())
      .then((data) => {
        // 필요한 필드만 안전하게 업데이트 (없으면 기존 목업 유지)
        setProductData((prev) => ({
          ...prev,
          ...data, // API 데이터 덮어쓰기
        }))
      })
      .catch(() => console.log("상품 데이터 로드 실패"))
  }, [])

  const tabs = ["정보", "구매 안내", "리뷰", "문의"]

  const renderTabContent = () => {
    switch (activeTab) {
      case "정보":
        return <TabInfo productData={productData} />
      case "리뷰":
        return <TabReviews productId={productData.id} />
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
        <img
          src={productData.images?.[0] || "/placeholder.svg?height=400&width=400"}
          alt={productData.name}
        />
        <span className="brand-logo">MUSINSA</span>
      </div>

      <ProductMainInfo
        category={productData.category}
        productData={productData}
        rating={productData.rating}
        reviewCount={productData.reviewCount}
        discountRate={productData.discountRate}
      />

      <TabNavigation tabs={tabs} activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="tab-content-area">{renderTabContent()}</div>

      <BottomActions />
      <div className="bottom-spacer"></div>
    </div>
  )
}

export default Detail
