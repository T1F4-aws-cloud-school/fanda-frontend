import React, { useState } from "react"; // useState 추가
import { useLocation, useNavigate } from "react-router-dom";
import BackButton from "../../components/BackButton";
import "./ReviewCollectionResult.css";
import apiService from "../../api/apiService"; 

export default function ReviewCollectionResult() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 숨겨진 로그아웃 버튼 상태
  const [clickCount, setClickCount] = useState(0);

  // Manager.jsx에서 전달받은 결과 데이터
  const resultData = location.state?.resultData;
  const reportData = location.state?.reportData;
  const statusMessage = location.state?.statusMessage;
  const success = location.state?.success;
  const errorMessage = location.state?.errorMessage;

  // 개발자 전용 숨겨진 로그아웃 기능
  const handleSecretClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    if (newCount === 5) {
      if (window.confirm('개발자 로그아웃 하시겠습니까?')) {
        // 모든 로컬 데이터 삭제
        localStorage.clear();
        sessionStorage.clear();
        
        // 홈으로 이동 후 새로고침
        navigate('/');
        window.location.reload();
      }
      setClickCount(0);
    }
    
    // 3초 후 카운트 리셋
    setTimeout(() => {
      setClickCount(0);
    }, 3000);
  };

  // 실패한 경우
  if (!success) {
    return (
      <div className="result-container">
        <div className="result-header">
          <BackButton to="/manager" />
          
          {/* 숨겨진 개발자 영역 */}
          <div 
            onClick={handleSecretClick}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40px',
              height: '40px',
              opacity: 0,
              cursor: 'default',
              zIndex: 999
            }}
          />
        </div>
        <div className="error-content">
          <div className="success-icon" style={{ fontSize: '60px' }}>
            ❌
          </div>
          <h2 style={{ color: '#ef4444' }}>작업이 실패했습니다</h2>
          <p>{errorMessage}</p>
          
          {/* 상태 메시지 표시 */}
          {statusMessage && (
            <div className="status-message">
              <div className="info-message" style={{ 
                backgroundColor: '#fef2f2', 
                borderColor: '#ef4444',
                color: '#dc2626' 
              }}>
                <p>📄 {statusMessage}</p>
              </div>
            </div>
          )}
          
          <button 
            className="action-button primary"
            onClick={() => navigate("/manager")}
          >
            다시 시도하기
          </button>
        </div>
      </div>
    );
  }

  // 결과 데이터가 없는 경우
  if (!resultData) {
    return (
      <div className="result-container">
        <div className="result-header">
          <BackButton to="/manager" />
          
          {/* 숨겨진 개발자 영역 */}
          <div 
            onClick={handleSecretClick}
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '40px',
              height: '40px',
              opacity: 0,
              cursor: 'default',
              zIndex: 999
            }}
          />
        </div>
        <div className="error-content">
          <h2>결과 데이터를 찾을 수 없습니다</h2>
          <p>관리자 페이지에서 다시 시도해주세요.</p>
          <button 
            className="action-button primary"
            onClick={() => navigate("/manager")}
          >
            관리자 페이지로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  const handleViewProduct = () => {
    navigate(`/detail/${resultData.productId}`);
  };

  const handleBackToManager = () => {
    navigate("/manager");
  };

  return (
    <div className="result-container">
      <div className="result-header">
        <BackButton to="/manager" />
        
        {/* 숨겨진 개발자 영역 - 오른쪽 상단 모서리 */}
        <div 
          onClick={handleSecretClick}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '40px',
            height: '40px',
            opacity: 0,
            cursor: 'default',
            zIndex: 999
          }}
        />
        
        {/* 개발 환경에서만 클릭 카운트 표시 */}
        {process.env.NODE_ENV === 'development' && clickCount > 0 && (
          <div style={{
            position: 'absolute',
            top: '45px',
            right: '16px',
            fontSize: '10px',
            color: '#999',
            opacity: 0.5
          }}>
            {clickCount}/5
          </div>
        )}
      </div>

      <div className="result-content">
        <h2 className="result-title">
          {reportData ? '리뷰 수집 및 비교 리포트\n생성이 완료되었습니다!' : '리뷰 수집이\n완료되었습니다!'}
        </h2>

        {/* 결과 카드 */}
        <div className="result-card">
          <div className="result-item">
            <span className="result-label">상품 ID</span>
            <span className="result-value">{resultData.productId}</span>
          </div>
          
          <div className="result-item">
            <span className="result-label">수집 기간</span>
            <span className="result-value">
              {resultData.startAt} ~ {resultData.endAt}
            </span>
          </div>
          
          <div className="result-item highlight">
            <span className="result-label">새로 수집된 리뷰</span>
            <span className="result-value-highlight">
              {resultData.savedCount}개
            </span>
          </div>

          {/* 비교 리포트 정보 */}
          {reportData && (
            <div className="result-item highlight" style={{
              backgroundColor: '#f0f9f0',
              borderColor: '#4caf50'
            }}>
              <span className="result-label">비교 리포트</span>
              <span className="result-value" style={{ color: '#2e7d32' }}>
                S3에 저장 완료
              </span>
            </div>
          )}
        </div>

        {/* 상태 메시지 표시 */}
        {statusMessage && (
          <div className="status-message">
            <div className={reportData ? "success-message" : "info-message"}>
              <p>📄 {statusMessage}</p>
              {reportData && (
                <p>생성된 비교 리포트가 S3에 저장되었습니다.</p>
              )}
            </div>
          </div>
        )}

        {/* 상태 메시지 */}
        <div className="status-message">
          {resultData.savedCount > 0 ? (
            <div className="success-message">
              <p>{resultData.savedCount}개의 새로운 리뷰가 수집되었습니다!</p>
              <p>상품 상세 페이지에서 확인해보세요.</p>
            </div>
          ) : (
            <div className="info-message">
              <p>ℹ️ 해당 기간에 새로 수집된 리뷰가 없습니다.</p>
              <p>이미 모든 리뷰가 수집되었거나, 해당 기간에 작성된 리뷰가 없을 수 있습니다.</p>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div className="action-buttons">
          <button 
            className="action-button secondary"
            onClick={handleBackToManager}
          >
            다시 수집하기
          </button>
          
          <button 
            className="action-button primary"
            onClick={handleViewProduct}
          >
            상품 상세 보기
          </button>
        </div>
      </div>
    </div>
  );
}