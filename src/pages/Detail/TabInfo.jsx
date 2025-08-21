import { useEffect, useState } from "react";

const TabInfo = ({ productData }) => {
  const [productDetails, setProductDetails] = useState(productData);

  // productData가 변경될 때마다 업데이트
  useEffect(() => {
    setProductDetails(productData);
  }, [productData]);

  return (
    <div className="tab-content">
      <div className="product-info">
        {/* API 연동 - 상품 설명 */}
        <h3 className="product-description">{productData.description}</h3>
        <div className="protein-info">
          <p className="protein-text">
            고단백질 <span className="highlight">20g</span>까지!
          </p>
        </div>
      </div>

      {/* 영양 성분 - 하드코딩 */}
      <div className="nutrition-info">
        <div className="nutrition-notes">
          <p>* 단백질20g : 스리라차마요 기준</p>
          <p>* 식품영양성분 DB 기준 - 달걀 삶은 것 50g 기준 단백질 6.74g</p>
          <p>* 고단백 : 식품 표시기준 고시 전문</p>
        </div>

        <div className="nutrition-table">
          <div className="nutrition-grid">
            <div className="nutrition-item">
              <span className="nutrition-label">탄수화물</span>
              <span className="nutrition-value">0g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">나트륨</span>
              <span className="nutrition-value">0g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">단백질</span>
              <span className="nutrition-value">0g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">콜레스테롤</span>
              <span className="nutrition-value">0g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">지방</span>
              <span className="nutrition-value">0g</span>
            </div>
            <div className="nutrition-item">
              <span className="nutrition-label">포화지방</span>
              <span className="nutrition-value">0g</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabInfo;