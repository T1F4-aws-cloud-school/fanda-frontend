const Tab = ({ type }) => {
  console.log("Tab 컴포넌트 type:", type); // 확인용
  return (
    <div className="tab-default">
      {type === "구매 안내" && (
        <p className="detail-text">
          상품 구매, 결제, 배송 관련 안내를 확인하세요.
        </p>
      )}
      {type === "문의" && (
        <p className="detail-text">
          상품 및 배송 관련 문의는 고객센터 또는 Q&A를 이용해주세요.
        </p>
      )}
    </div>
  )
}

export default Tab
