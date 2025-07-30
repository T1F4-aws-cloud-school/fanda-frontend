import BuyIcon from "../../assets/buy.png"
import NotificationIcon from "../../assets/notification.png"

const ProductHeader = () => {
  return (
    <div className="header">
      <button className="back-button">
        <span className="back-arrow">‹</span>
      </button>
      <div className="header-icons">
        <div className="icon-container">
          <img src={BuyIcon} alt="장바구니" className="header-icon" />
        </div>
        <div className="icon-container">
          <img src={NotificationIcon} alt="알림" className="header-icon" />
        </div>
      </div>
    </div>
  )
}

export default ProductHeader