import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 
import BackButton from "../../components/BackButton";
import apiService from "../../api/apiService";
import "./Manager.css";

export default function Manager() {
  const navigate = useNavigate();
  
  const [productId, setProductId] = useState("4"); // 기본값: 허브맛 수비드 닭가슴살
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [baselineKey, setBaselineKey] = useState(""); // 비교 기준 리포트 파일명
  const [generateReport, setGenerateReport] = useState(false); // 비교 리포트 생성 여부
  const [isLoading, setIsLoading] = useState(false);

  // 컴포넌트 마운트 시 현재 날짜 기준으로 기본값 설정
  useEffect(() => {
    const today = new Date();
    const todayString = today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
    
    // 1개월 전 날짜 계산
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const oneMonthAgoString = oneMonthAgo.toISOString().split('T')[0];
    
    setStartDate(oneMonthAgoString);
    setEndDate(todayString);
    
    console.log('기본 날짜 설정:', {
      시작일: oneMonthAgoString,
      종료일: todayString
    });
  }, []);

  const handleStartCollection = async () => {
  try {
    setIsLoading(true);
    
    // 입력값 검증
    if (!productId || !startDate || !endDate) {
      alert("필수 필드를 모두 입력해주세요.");
      return;
    }

    // 🎯 상세한 파라미터 로깅
    const requestParams = {
      productId: parseInt(productId),
      startDate,
      endDate,
      generateReport,
      baselineKey: generateReport ? baselineKey.trim() : null
    };
    
    console.log('🚀 리뷰 수집 및 리포트 생성 요청 파라미터:', requestParams);
    console.log('🔑 현재 토큰 상태:', {
      accessToken: localStorage.getItem('accessToken') ? '있음' : '없음',
      refreshToken: localStorage.getItem('refreshToken') ? '있음' : '없음'
    });

    let result;
    let slackMessage = "";

    if (generateReport && baselineKey.trim()) {
      // 🎯 비교 리포트 생성 전 추가 검증
      console.log('📊 비교 리포트 생성 모드:', {
        baselineKey: baselineKey.trim(),
        baselineKeyLength: baselineKey.trim().length,
        containsSlash: baselineKey.includes('/'),
        containsPdf: baselineKey.includes('.pdf')
      });

      try {
        result = await apiService.admin.collectAndGenerateReport(
          parseInt(productId), 
          startDate, 
          endDate,
          baselineKey.trim()
        );
        
        console.log("✅ 리뷰 수집 및 비교 리포트 생성 성공:", result);
        
        if (result.report) {
          slackMessage = "슬랙에 전송이 완료되었습니다";
        } else {
          slackMessage = "리뷰 수집은 완료되었지만, 슬랙 전송에 실패했습니다";
        }
        
      } catch (error) {
        console.error("❌ 리뷰 수집 및 비교 리포트 생성 실패:", {
          error: error,
          status: error.response?.status,
          data: error.response?.data,
          message: error.message
        });
        
        // 🎯 구체적인 에러 메시지 분석
        if (error.response?.status === 500) {
          console.error('🔥 서버 내부 오류 상세:', {
            url: error.config?.url,
            method: error.config?.method,
            requestData: error.config?.data,
            responseData: error.response?.data
          });
        }
        
        slackMessage = "슬랙 전송 실패했습니다";
        throw error;
      }
    } else {
      // 리뷰 수집만
      try {
        console.log('📝 리뷰 수집 전용 모드');
        const collectResult = await apiService.admin.collectReviewsByPeriod(
          parseInt(productId), 
          startDate, 
          endDate
        );
        
        result = {
          collect: collectResult,
          report: null,
          success: true
        };
        
        console.log("✅ 리뷰 수집 성공:", collectResult);
        slackMessage = "리뷰 수집이 완료되었습니다";
        
      } catch (error) {
        console.error("❌ 리뷰 수집 실패:", error);
        slackMessage = "리뷰 수집에 실패했습니다";
        throw error;
      }
    }

    // 성공 시 결과 페이지로 이동
    navigate("/admin/review-result", { 
      state: { 
        resultData: result.collect,
        reportData: result.report,
        slackMessage: slackMessage,
        success: true
      } 
    });

  } catch (error) {
    console.error("💥 전체 작업 실패:", error);
    
    // 🎯 에러 상황별 상세 분석
    let errorMessage = "작업에 실패했습니다.";
    let slackMessage = "슬랙 전송 실패했습니다";
    
    if (error.response?.status === 401) {
      errorMessage = "관리자 권한이 필요합니다. 로그인을 확인해주세요.";
    } else if (error.response?.status === 404) {
      errorMessage = "해당 상품 또는 기준 리포트를 찾을 수 없습니다.";
    } else if (error.response?.status === 500) {
      errorMessage = "서버 내부 오류가 발생했습니다. 관리자에게 문의하세요.";
      console.error('🔥 500 에러 추가 정보:', {
        requestURL: error.config?.url,
        requestMethod: error.config?.method,
        requestHeaders: error.config?.headers,
        responseData: error.response?.data
      });
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    // 실패 시에도 결과 페이지로 이동하여 실패 메시지 표시
    navigate("/admin/review-result", { 
      state: { 
        resultData: null,
        reportData: null,
        slackMessage: slackMessage,
        success: false,
        errorMessage: errorMessage
      } 
    });
    
  } finally {
    setIsLoading(false);
  }
};

  // 현재 날짜 최대값 설정 (미래 날짜 선택 방지)
  const today = new Date().toISOString().split('T')[0];

  // 폼 유효성 검사
  const isFormValid = productId && startDate && endDate && !isLoading && 
    (!generateReport || (generateReport && baselineKey.trim()));

  return (
    <div className="manager-container">
      <div className="manager-header">
        <BackButton to="/" />
      </div>

      <h2 className="manager-title">
        제품 개선 이후의{'\n'}리뷰 데이터를 수집하여,{'\n'}개선 전후를 비교한{'\n'}분석 보고서를 생성합니다.
      </h2>

      {/* 상품 ID 입력 카드 */}
      <div className="white-card">
        <div className="product-name-container">
          <span className="product-name-label">상품 ID</span>
          <input
            type="number"
            className="product-name-input"
            placeholder="상품 ID를 입력하세요"
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={isLoading}
            min="1"
          />
        </div>
        <div style={{ 
          fontSize: '12px', 
          color: '#6e6e6e', 
          marginTop: '8px',
          lineHeight: '1.4'
        }}>
          * 상품 상세 페이지 URL에서 확인할 수 있습니다
        </div>
      </div>

      {/* 리뷰 데이터 수집 시작 날짜 카드 */}
      <div className="white-card">
        <div className="card-title">리뷰 데이터 수집 시작 날짜</div>
        <input
          type="date"
          className="date-picker"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          disabled={isLoading}
          max={endDate || today} // 종료 날짜나 오늘 날짜보다 늦을 수 없음
        />
        <div style={{ 
          fontSize: '12px', 
          color: '#6e6e6e', 
          marginTop: '8px'
        }}>
          * 기본값: 1개월 전 날짜
        </div>
      </div>

      {/* 리뷰 데이터 수집 종료 날짜 카드 */}
      <div className="white-card">
        <div className="card-title">리뷰 데이터 수집 종료 날짜</div>
        <input
          type="date"
          className="date-picker"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          disabled={isLoading}
          min={startDate} // 시작 날짜보다 빠를 수 없음
          max={today} // 오늘 날짜보다 늦을 수 없음
        />
        <div style={{ 
          fontSize: '12px', 
          color: '#6e6e6e', 
          marginTop: '8px'
        }}>
          * 기본값: 오늘 날짜 (최대 {today})
        </div>
      </div>

      {/* 비교 리포트 생성 옵션 카드 */}
      <div className="white-card">
        <div className="card-title">
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={generateReport}
              onChange={(e) => setGenerateReport(e.target.checked)}
              disabled={isLoading}
              style={{ marginRight: '8px' }}
            />
            개선 비교 리포트 생성 및 슬랙 전송
          </label>
        </div>
        
        {generateReport && (
          <div style={{ marginTop: '12px' }}>
            <input
              type="text"
              className="product-name-input"
              placeholder="기준 리포트 파일명 입력"
              value={baselineKey}
              onChange={(e) => setBaselineKey(e.target.value)}
              disabled={isLoading}
              style={{ width: '100%' }}
            />
            <div style={{ 
              fontSize: '12px', 
              color: '#6e6e6e', 
              marginTop: '8px',
              lineHeight: '1.4'
            }}>
              * 예시: reports/negative/negative_20250808_173006.pdf<br/>
              * 비교할 기준이 되는 부정 리포트 파일명을 입력하세요
            </div>
          </div>
        )}
      </div>

      <button
        className={`start-button ${!isFormValid ? 'disabled' : ''}`}
        onClick={handleStartCollection}
        disabled={!isFormValid}
      >
        {isLoading 
          ? (generateReport ? "리뷰 수집 및 슬랙 전송 중..." : "수집 중...")
          : (generateReport ? "리뷰 수집 및 비교 리포트 생성" : "리뷰 데이터 수집 시작")
        }
      </button>
    </div>
  );
}