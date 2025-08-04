import { useEffect, useState } from "react";
import apiService from "../../api/apiService"; // API Service 사용

const TabInfo = ({ productData }) => {
  const [productDetails, setProductDetails] = useState(productData); // 초기값을 받아온 productData로 설정
  const [loading, setLoading] = useState(false);

  // API로부터 상품 정보 (상세 내용, 이미지 등) 받아오기
  useEffect(() => {
    // productData가 이미 있으면 별도 API 호출 안함
    if (productData && productData.description) {
      setProductDetails(productData);
      return;
    }

    // productData가 없거나 상세정보가 부족한 경우에만 API 호출
    fetchProductDetails();
  }, [productData]);

  const fetchProductDetails = async () => {
    if (!productData?.id) return;

    try {
      setLoading(true);
      const response = await apiService.products.getDetail(productData.id);
      if (response) {
        // API 데이터와 기존 데이터 병합
        const mergedData = {
          ...productDetails,
          ...response,
          // API에서 받은 description을 사용
          description: response.description || productDetails.description,
          detailInfo: response.description || productDetails.detailInfo,
        };
        setProductDetails(mergedData);
      }
    } catch (error) {
      console.error("상품 상세정보 데이터 로드 실패", error);
      // 에러 시 기존 데이터 유지
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="tab-content">
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          상세 정보를 불러오는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="tab-content">
      <div className="product-info">
        {/* API 연동 - 상품 설명 */}
        <h3 className="product-description">{productDetails.description}</h3>
        <div className="protein-info">
          <p className="protein-text">
            고단백질 <span className="highlight">20g</span>까지!
          </p>
          {/* API 연동 - 상세 정보 텍스트 */}
          <p className="detail-text">{productDetails.detailInfo}</p>
        </div>
      </div>

      {/* 상품 상세 이미지 */}
      <div className="product-image-container">
        <img
          src={productDetails.detailImage || "/placeholder.svg?height=300&width=400&text=상품 상세 이미지"}
          alt="상품 상세 이미지"
          className="product-detail-image"
          onError={(e) => {
            // 이미지 로드 실패 시 placeholder로 대체
            e.target.src = "/placeholder.svg?height=300&width=400&text=상품 상세 이미지"
          }}
        />
      </div>

      {/* 영양 성분 - 하드코딩 */}
      <div className="nutrition-info">
        <div className="nutrition-notes">
          {(productDetails.nutritionNotes || [
            "* 단백질20g : 스리라차마요 기준",
            "* 식품영양성분 DB 기준 - 달걀 삶은 것 50g 기준 단백질 6.74g",
            "* 고단백 : 식품 표시기준 고시 전문"
          ]).map((note, idx) => (
            <p key={idx}>{note}</p>
          ))}
        </div>

        <div className="nutrition-table">
          <div className="nutrition-grid">
            {(productDetails.nutritionTable || [
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
  );
};

export default TabInfo;