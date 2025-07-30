import StarIcon from "../../assets/Star.png";
import GoodIcon from "../../assets/Good.png";

const TabReviews = ({ rating, reviewCount, reviewsData }) => {
  // 별점 렌더링
  const renderStars = (rating) =>
    [...Array(5)].map((_, i) => (
      <img
        key={i}
        src={StarIcon}
        alt="별점"
        className={`star-icon ${i < rating ? "filled" : ""}`}
      />
    ));

  return (
    <div className="review-content">
      {/* 리뷰 헤더 */}
      <div className="review-header">
        <div className="review-summary">
          <span className="review-title">후기</span>
          <div className="rating-info">
            <img src={StarIcon} alt="별점" className="star-icon filled" />
            <span className="rating-score">{rating}</span>
            <span className="review-count">({reviewCount.toLocaleString()}건)</span>
          </div>
        </div>

        {/* 필터 버튼 */}
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

      {/* 리뷰 리스트 */}
      <div className="review-list">
        {reviewsData.map((review) => (
          <div key={review.id} className="review-item">
            {/* 사용자 정보 */}
            <div className="review-user">
              <div className="user-avatar">👤</div>
              <span className="username">{review.username}</span>
              <span className="review-date">{review.date}</span>
            </div>

            {/* 별점 */}
            <div className="review-rating">{renderStars(review.rating)}</div>

            {/* 리뷰 텍스트 */}
            <p className="review-text">{review.content}</p>

            {/* 리뷰 이미지 (최대 2장 옆으로 배치) */}
            {review.images && review.images.length > 0 && (
              <div className="review-images">
                {review.images.map((image, index) => (
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
