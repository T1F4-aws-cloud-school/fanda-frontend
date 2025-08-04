import BuyIcon from "../../assets/buy.png";
import NotificationIcon from "../../assets/notification.png";
import BackButton from "../../components/BackButton";

const ProductHeader = () => {
  return (
    <div className="detail-header">
      <BackButton to="/" />
      <div className="header-icons">
        <div className="icon-container">
          <img src={BuyIcon} alt="장바구니" className="header-icon" />
        </div>
        <div className="icon-container">
          <img src={NotificationIcon} alt="알림" className="header-icon" />
        </div>
      </div>
    </div>
  );
};

export default ProductHeader;
