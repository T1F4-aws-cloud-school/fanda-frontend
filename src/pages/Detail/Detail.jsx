"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import "./Detail.css"

// 하위 컴포넌트
import ProductHeader from "./ProductHeader"
import ProductMainInfo from "./ProductMainInfo"
import TabNavigation from "./TabNavigation"
import TabInfo from "./TabInfo"
import TabReviews from "./TabReviews"
import Tab from "./Tab"
import BottomActions from "./BottomActions"

import apiService from "../../api/apiService" // API Service 사용

const Detail = () => {
  const { id } = useParams() // URL에서 상품 ID 가져오기
  const [activeTab, setActiveTab] = useState("정보")

  // 하드코딩된 초기 데이터 (API 실패 시 사용)
  const fallbackProductData = {
    id: id || "1",
    name: "수비드 닭가슴살",
    price: 43800,
    images: ["/placeholder.svg?height=400&width=400"],
    averageRating: 4.8,
    reviewCount: 0,
    discountRate: 35, // 하드코딩 (API에 없음)
    category: "닭가슴살 > 수비드", // 하드코딩 (API에 없음)
    description: "손쉬운 단백질 충전",
    reviews: []
  }

  const [productData, setProductData] = useState(fallbackProductData)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // API 연동 - 상품 상세정보 및 리뷰 로드
  useEffect(() => {
    loadProductData()
  }, [id])

  const loadProductData = async () => {
    if (!id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      console.log("상품 상세 정보 요청 - 상품 ID:", id);

      // 새로운 API 엔드포인트 사용: /shop/api/v1/products/{id}
      const response = await apiService.products.getDetail(id);
      
      console.log("상품 상세 API 응답:", response);

      if (response) {
        // 새로운 API 응답 구조에 맞게 데이터 변환
        const apiData = {
          id: response.id,
          name: response.name,
          description: response.description,
          price: response.price,
          averageRating: response.averageRating || 0,
          reviewCount: response.reviews ? response.reviews.length : 0,
          reviews: response.reviews || [],
          
          // API에 없는 필드들은 하드코딩으로 유지
          images: ["/placeholder.svg?height=400&width=400"], // API에 상품 이미지 필드 없음
          discountRate: 35, // 하드코딩
          category: "닭가슴살 > 수비드", // 하드코딩
        }

        console.log("변환된 상품 데이터:", apiData);
        setProductData(apiData)
      } else {
        throw new Error("상품 데이터가 없습니다")
      }
    } catch (error) {
      console.error("상품 데이터 로드 실패:", error)
      
      // 에러 상세 정보 표시
      let errorMessage = "상품 정보를 불러오는데 실패했습니다";
      if (error.response?.status === 404) {
        errorMessage = "상품을 찾을 수 없습니다";
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      setError(errorMessage)
      
      // 에러 시 기본 데이터 유지하되 ID는 URL에서 가져온 것으로 설정
      setProductData(prev => ({ ...prev, id: id || "1" }))
    } finally {
      setLoading(false)
    }
  }

  const tabs = ["정보", "구매 안내", "리뷰", "문의"]

  const renderTabContent = () => {
    switch (activeTab) {
      case "정보":
        return <TabInfo productData={productData} />
      case "리뷰":
        return <TabReviews productId={productData.id} productData={productData} />
      case "구매 안내":
        return <Tab type="구매 안내" />
      case "문의":
        return <Tab type="문의" />
      default:
        return null
    }
  }

  // 로딩 중 표시
  if (loading) {
    return (
      <div className="mobile-app">
        <ProductHeader />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '16px',
          color: '#666',
          flexDirection: 'column',
          gap: '10px'
        }}>
          <div>상품 정보를 불러오는 중...</div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            상품 ID: {id}
          </div>
        </div>
      </div>
    )
  }

  // 에러 상태 표시
  if (error) {
    return (
      <div className="mobile-app">
        <ProductHeader />
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '50vh',
          fontSize: '16px',
          color: '#666',
          flexDirection: 'column',
          gap: '10px',
          textAlign: 'center',
          padding: '20px'
        }}>
          <div style={{ color: '#ff4444' }}>{error}</div>
          <div style={{ fontSize: '14px', color: '#999' }}>
            상품 ID: {id}
          </div>
          <button 
            onClick={loadProductData}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#006aff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            다시 시도
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="mobile-app">
      <ProductHeader />

      {/* 상품 대표 이미지 - 현재 API에 이미지 필드 없어서 기본 이미지 */}
      <div className="main-product-image">
        {productData.images?.[0] ? (
          <img
            src={productData.images[0]}
            alt={productData.name}
            onError={(e) => {
              // 이미지 로드 실패 시 MUSINSA 로고 표시
              e.target.style.display = 'none'
              e.target.nextSibling.style.display = 'flex'
            }}
          />
        ) : null}
        <span className="brand-logo">세 끼 통 살</span>
      </div>

      <ProductMainInfo
        category={productData.category}
        productData={productData}
        rating={productData.averageRating}
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