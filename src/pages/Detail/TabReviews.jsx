import { useEffect, useState } from "react";
import StarIcon from "../../assets/star.png";
import GoodIcon from "../../assets/good.png";

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
      "https://via.placeholder.com/150x150?text=Extra",
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
];

const TabReviews = ({ productId }) => {
  const [reviews, setReviews] = useState(mockReviews);
  const [productData, setProductData] = useState(mockProduct);

  // API 받아올때
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 상품 정보
        const productRes = await fetch(`http://localhost:4000/products/${productId}`);
        if (productRes.ok) {
          const productJson = await productRes.json();
          if (productJson) setProductData(productJson);
        }

        // 리뷰 정보
        const reviewsRes = await fetch(`http://localhost:4000/reviews?productId=${productId}`);
        if (reviewsRes.ok) {
          const reviewsJson = await reviewsRes.json();
          if (Array.isArray(reviewsJson) && reviewsJson.length > 0) {
            setReviews(reviewsJson);
          }
        }
      } catch (error) {
        console.error("데이터 로드 실패, 목업 데이터 사용:", error);
      }
    };

    fetchData();
  }, [productId]);

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
            <span className="rating-score">{productData.rating}</span>
            <span className="review-count">({productData.reviewCount.toLocaleString()}건)</span>
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

      {/* 리뷰 목록 */}
      <div className="review-list">
        {reviews.map((review) => (
          <div key={review.id} className="review-item">
            {/* 사용자 정보 */}
            <div className="review-user">
              <div className="user-avatar">👤</div>
              <span className="username">{review.username}</span>
              <span className="review-date">{review.date}</span>
            </div>

            {/* 별점 */}
            <div className="review-rating">{renderStars(review.rating)}</div>

            {/* 리뷰 내용 */}
            <p className="review-text">{review.content}</p>

            {/* 리뷰 이미지 (최대 2장만 표시) */}
            {review.images && review.images.length > 0 && (
              <div className="review-images">
                {review.images.slice(0, 2).map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`리뷰 이미지 ${index + 1}`}
                    className="review-image"
                  />
                ))}
              </div>
            )}

            {/* 도움돼요 버튼 */}
            <button className="helpful-btn">
              <img src={GoodIcon} alt="도움돼요" className="good-icon" />
              도움돼요
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabReviews;
