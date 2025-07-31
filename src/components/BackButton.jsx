import { useNavigate } from "react-router-dom";

const BackButton = ({ to = -1 }) => {
  const navigate = useNavigate();

  return (
    <button className="back-button" onClick={() => navigate(to)}>
      <span className="back-arrow">‹</span>
    </button>
  );
};

export default BackButton;