import HeartIcon from "../../assets/heart.png"

const BottomActions = () => {
  return (
    <div className="bottom-actions">
      <button className="wishlist-btn">
        <img src={HeartIcon} alt="찜하기" className="heart-icon" />
      </button>
      <button className="purchase-btn">구매하기</button>
    </div>
  )
}

export default BottomActions
