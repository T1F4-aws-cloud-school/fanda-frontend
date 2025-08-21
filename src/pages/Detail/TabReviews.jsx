import { useEffect, useState } from "react";
import StarIcon from "../../assets/star.png";
import GoodIcon from "../../assets/good.png";
import apiService from "../../api/apiService"; // API Service 사용

// 목업 데이터 (API 없을 때)
const mockProduct = {
  rating: 4.8,
  reviewCount: 2543,
};

const mockReviews = [
  {
    id: 1,
    username: "소정소정소정",
    date: "2025.07.12",
    rating: 5,
    content:
      "다이어트 시작하고 나서 닭가슴살 계속 먹고 있는데 여러 맛으로 질리지 않고, 여러 종류의 닭가슴살을 맛 볼 수 있어서 좋아요!",
    images: [
      "https://via.placeholder.com/150x150?text=MUSINSA1",
      "https://via.placeholder.com/150x150?text=MUSINSA2",
    ],
  },
  {
    id: 2,
    username: "홍정민",
    date: "2025.07.11",
    rating: 4,
    content: "배송도 빠르고 맛도 괜찮아요. 한 달치 구매했어요!",
    images: ["https://via.placeholder.com/150x150?text=MUSINSA3"],
  },
  {
    id: 3,
    username: "김철수",
    date: "2025.07.10",
    rating: 5,
    content: "맛있고 단백질도 많아서 운동할 때 좋아요!",
    images: [
      "https://via.placeholder.com/150x150?text=Review1",
      "https://via.placeholder.com/150x150?text=Review2",
    ],
  },
];

const TabReviews = ({ productId, productData }) => {
  const [reviews, setReviews] = useState([]); // 빈 배열로 시작
  const [currentProductData, setCurrentProductData] = useState(mockProduct);
  const [loading, setLoading] = useState(true); // 로딩 시작
  
  // 도움돼요 버튼 상태 관리 (리뷰 ID를 키로 사용)
  const [helpfulClicked, setHelpfulClicked] = useState({});

  // API 받아올때
  useEffect(() => {
    loadReviewData();
  }, [productId]);

  const loadReviewData = async () => {
    setLoading(true);
    try {
      console.log("리뷰 데이터 로드 시작 - productId:", productId);

      // 1. productData가 props로 넘어온 경우 (Detail.jsx에서 이미 API 호출함)
      if (productData && productData.reviews !== undefined) {
        console.log("Props에서 받은 productData 사용:", productData);
        
        setCurrentProductData({
          rating: productData.averageRating || 0,
          reviewCount: productData.reviews.length || 0
        });

        if (productData.reviews && productData.reviews.length > 0) {
          // 새로운 API 구조에 맞게 리뷰 데이터 변환
          const formattedReviews = productData.reviews.map((review, index) => ({
            id: review.userId || index + 1,
            username: review.nickname || "익명",
            date: formatDate(review.createdAt),
            rating: review.rating || 0,
            content: review.content || "",
            images: review.images ? review.images.map(img => img.imageUrl || img) : []
          }));
          
          console.log("변환된 리뷰 데이터:", formattedReviews);
          setReviews(formattedReviews);
        } else {
          console.log("리뷰가 없음, 목업 데이터 사용");
          setReviews(mockReviews);
        }
      } else {
        // 2. productData가 없으면 직접 API 호출 시도
        console.log("직접 API 호출 시도");
        try {
          const response = await apiService.products.getDetail(productId);
          console.log("직접 호출 API 응답:", response);
          
          if (response) {
            setCurrentProductData({
              rating: response.averageRating || 0,
              reviewCount: response.reviews ? response.reviews.length : 0
            });

            if (response.reviews && response.reviews.length > 0) {
              const formattedReviews = response.reviews.map((review, index) => ({
                id: review.userId || index + 1,
                username: review.nickname || "익명",
                date: formatDate(review.createdAt),
                rating: review.rating || 0,
                content: review.content || "",
                images: review.images ? review.images.map(img => img.imageUrl || img) : []
              }));
              
              setReviews(formattedReviews);
            } else {
              console.log("API에서 리뷰 없음, 목업 데이터 사용");
              setReviews(mockReviews);
            }
          } else {
            throw new Error("API 응답이 없음");
          }
        } catch (apiError) {
          console.log("API 호출 실패, 목업 데이터 사용:", apiError.message);
          setReviews(mockReviews);
        }
      }
    } catch (error) {
      console.error("리뷰 데이터 로드 실패, 목업 데이터 사용:", error);
      setReviews(mockReviews);
    } finally {
      setLoading(false);
    }
  };

  // 도움돼요 버튼 클릭 핸들러
  const handleHelpfulClick = (reviewId) => {
    setHelpfulClicked(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId] // 토글
    }));
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return "2025.01.01";
    
    try {
      const date = new Date(dateString);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}.${month}.${day}`;
    } catch (error) {
      console.log("날짜 변환 실패:", error);
      return "2025.01.01";
    }
  };

  // 별점 렌더링
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <img key={i} src={StarIcon} alt="별점" className={`star-icon ${i < rating ? "filled" : ""}`} />
    ));

  return (
    <div className="review-content">
      {/* 리뷰 헤더 */}
      <div className="review-header">
        <div className="review-summary">
          <span className="review-title">후기</span>
          <div className="rating-info">
            <img src={StarIcon} alt="별점" className="star-icon filled" />
            <span className="rating-score">{currentProductData.rating}</span>
            <span className="review-count">({currentProductData.reviewCount.toLocaleString()}건)</span>
          </div>
        </div>

        {/* 필터 버튼들 */}
        <div className="filter-buttons">
          <button className="filter-btn active">전체</button>
          <button className="filter-btn">베스트</button>
          <button className="filter-btn">한달 후기</button>
          <button className="filter-btn">식단 추천</button>
        </div>

        {/* 정렬 옵션 */}
        <div className="sort-option">
          <button className="sort-btn">유용한순 ▼</button>
        </div>
      </div>

      {/* 로딩 중 표시 */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          리뷰를 불러오는 중...
        </div>
      )}

      {/* 리뷰 목록 */}
      <div className="review-list">
        {!loading && reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
            <div>아직 등록된 리뷰가 없습니다.</div>
            <div style={{ fontSize: '14px', marginTop: '8px' }}>
              첫 번째 리뷰를 작성해보세요!
            </div>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="review-item">
              {/* 사용자 정보 레이아웃 */}
              <div className="review-user-horizontal">
                <div className="user-avatar">👤</div>
                <div className="user-info-vertical">
                  {/* 이름과 날짜를 가로로 */}
                  <div className="user-name-date">
                    <span className="username">{review.username}</span>
                    <span className="review-date">{review.date}</span>
                  </div>
                  {/* 별점을 그 아래에 - API 연동 */}
                  <div className="review-rating">{renderStars(review.rating)}</div>
                </div>
              </div>

              {/* 상품명 - 하드코딩 */}
              <div className="product-purchase-info">부드러운 수비드 닭가슴살 | 매운맛 구매</div>

              {/* 리뷰 내용 - API 연동 */}
              <p className="review-text">{review.content}</p>

              {/* 리뷰 이미지 - API 연동 (최대 2장만 표시) */}
              {review.images && review.images.length > 0 && (
                <div className="review-images">
                  {review.images.slice(0, 2).map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`리뷰 이미지 ${index + 1}`}
                      className="review-image"
                      onError={(e) => {
                        // 이미지 로드 실패 시 기본 이미지로 대체
                        e.target.src = "https://via.placeholder.com/80x80?text=IMG"
                      }}
                    />
                  ))}
                </div>
              )}

              {/* 도움돼요 버튼 - 클릭 가능 */}
              <button 
                className={`helpful-btn ${helpfulClicked[review.id] ? 'active' : ''}`}
                onClick={() => handleHelpfulClick(review.id)}
              >
                <img src={GoodIcon} alt="도움돼요" className="good-icon" />
                도움돼요
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TabReviews;