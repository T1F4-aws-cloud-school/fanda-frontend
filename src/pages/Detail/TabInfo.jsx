const TabInfo = ({ productData }) => {
  return (
    <div className="tab-content">
      <div className="product-info">
        <h3 className="product-description">{productData.description}</h3>
        <div className="protein-info">
          <p className="protein-text">
            고단백질 <span className="highlight">20g</span>까지!
          </p>
          <p className="detail-text">{productData.detailInfo}</p>
        </div>
      </div>

      {/* 상품 상세 이미지 */}
      <div className="product-image-container">
        <img
          src={productData.detailImage || "/placeholder.svg?height=300&width=400&text=상품 상세 이미지"}
          alt="상품 상세 이미지"
          className="product-detail-image"
        />
      </div>

      {/* 영양 성분 */}
      <div className="nutrition-info">
        <div className="nutrition-notes">
          {(productData.nutritionNotes || [
            "* 단백질20g : 스리라차마요 기준",
            "* 식품영양성분 DB 기준 - 달걀 삶은 것 50g 기준 단백질 6.74g",
            "* 고단백 : 식품 표시기준 고시 전문"
          ]).map((note, idx) => (
            <p key={idx}>{note}</p>
          ))}
        </div>

        <div className="nutrition-table">
          <div className="nutrition-grid">
            {(productData.nutritionTable || [
              { label: "탄수화물", value: "0g" },
              { label: "나트륨", value: "0g" },
              { label: "단백질", value: "0g" },
              { label: "콜레스테롤", value: "0g" },
              { label: "지방", value: "0g" },
              { label: "포화지방", value: "0g" },
            ]).map((item, i) => (
              <div key={i} className="nutrition-item">
                <span className="nutrition-label">{item.label}</span>
                <span className="nutrition-value">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TabInfo
