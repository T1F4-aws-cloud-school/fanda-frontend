import StarIcon from "../../assets/star.png"

const ProductMainInfo = ({ category, productData, rating, reviewCount, discountRate }) => {
  return (
    <div className="product-details">
      <p className="category">{category}</p>
      <h1 className="product-name">{productData.name}</h1>

      <div className="rating-section">
        <img src={StarIcon} alt="별점" className="star-icon filled" />
        <span className="rating-score">{rating}</span>
        <span className="review-count">후기 {reviewCount.toLocaleString()}개</span>
      </div>

      <div className="price-section">
        <span className="discount-badge">{discountRate}%</span>
        <span className="price">{productData.price.toLocaleString()}원</span>
      </div>

      <button className="buy-button">구매하기</button>
      <p className="detail-link">상품 상세보기</p>
    </div>
  )
}

export default ProductMainInfo
