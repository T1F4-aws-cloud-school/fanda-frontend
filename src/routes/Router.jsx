import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "../pages/Login"
import SignUp from "../pages/Signup/SignUp.jsx"
import PrivacyPolicy from "../pages/Signup/PrivacyPolicy.jsx"
import PersonalInfoConsent from "../pages/Signup/PersonalInfoConsent.jsx";
import UserTerms from "../pages/Signup/UserTerms.jsx";
import NamedInput from "../pages/Signup/NameIdInput.jsx";
import PasswordInput from "../pages/Signup/PasswordInput.jsx";
import SignUpComplete from "../pages/Signup/SignUpComplete.jsx";
import Detail from "../pages/Detail/Detail.jsx";
import HomeGuest from "../pages/HomeGuest.jsx";
import HomeLoggedIn from "../pages/HomeLoggedIn.jsx";
import Manager from "../pages/Manager/Manager.jsx"; // 관리자 페이지
import ReviewCollectionResult from "../pages/Manager/ReviewCollectionResult.jsx"; // 리뷰 수집 결과 페이지
import { useAuth } from "../context/AuthContext";
import apiService from "../api/apiService"; // 관리자 권한 체크를 위해 추가

// 홈 라우트 컴포넌트 - 관리자 권한에 따른 자동 라우팅
const HomeRoute = () => {
  const { isLoggedIn } = useAuth();

  // 비로그인 사용자는 게스트 홈
  if (!isLoggedIn) {
    return <HomeGuest />;
  }

  // 로그인된 사용자 중 관리자 체크
  const isAdmin = apiService.utils.isAdmin();
  
  if (isAdmin) {
    // 관리자면 Manager 페이지로 자동 리다이렉트
    return <Navigate to="/manager" replace />;
  }

  // 일반 사용자면 로그인 홈
  return <HomeLoggedIn />;
};

const Router = () => {
  const { isLoggedIn, isLoading } = useAuth();

  // 로딩 중일 때 스피너 표시
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '16px',
        color: '#666'
      }}>
        로딩 중...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* 홈 화면 - 로그인 상태 및 관리자 권한에 따라 자동 라우팅 */}
        <Route 
          path="/" 
          element={<HomeRoute />}
        />
        
        {/* 관리자 페이지들 */}
        <Route 
          path="/manager" 
          element={<Manager />} 
        />
        
        {/* 리뷰 수집 결과 페이지 */}
        <Route 
          path="/admin/review-result" 
          element={<ReviewCollectionResult />} 
        />
        
        {/* 일반 사용자 홈 (관리자가 아닌 경우에만 접근 가능) */}
        <Route 
          path="/home" 
          element={isLoggedIn ? <HomeLoggedIn /> : <Navigate to="/login" replace />} 
        />
        
        {/* 로그인/회원가입 - 이미 로그인된 경우 홈으로 리다이렉트 */}
        <Route 
          path="/login" 
          element={isLoggedIn ? <Navigate to="/" replace /> : <Login />} 
        />
        
        <Route 
          path="/signup" 
          element={isLoggedIn ? <Navigate to="/" replace /> : <SignUp />} 
        />
        
        {/* 회원가입 관련 페이지들 - 이미 로그인된 경우 홈으로 리다이렉트 */}
        <Route 
          path="/terms/privacy" 
          element={isLoggedIn ? <Navigate to="/" replace /> : <PrivacyPolicy />} 
        />
        <Route 
          path="/terms/personal" 
          element={isLoggedIn ? <Navigate to="/" replace /> : <PersonalInfoConsent />} 
        />
        <Route 
          path="/terms/use" 
          element={isLoggedIn ? <Navigate to="/" replace /> : <UserTerms />} 
        />
        <Route 
          path="/signup/name" 
          element={isLoggedIn ? <Navigate to="/" replace /> : <NamedInput />} 
        />
        <Route 
          path="/signup/password" 
          element={isLoggedIn ? <Navigate to="/" replace /> : <PasswordInput />} 
        />
        <Route 
          path="/signup/complete" 
          element={isLoggedIn ? <Navigate to="/" replace /> : <SignUpComplete />} 
        />
        
        {/* 상품 상세 - 로그인 상관없이 접근 가능 */}
        <Route path="/product/detail" element={<Detail />} />
        <Route path="/detail/:id" element={<Detail />} />
        
        {/* 기존 homelogin 라우트는 제거 (이제 /에서 자동 처리) */}
        <Route path="/homelogin" element={<Navigate to="/" replace />} />
        
        {/* 404 페이지 - 존재하지 않는 경로일 때 홈으로 리다이렉트 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default Router