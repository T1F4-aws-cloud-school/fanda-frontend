// routes/Router.jsx 수정
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
import { useAuth } from "../context/AuthContext"; // 새로 추가

const Router = () => {
  const { isLoggedIn, isLoading } = useAuth(); // 인증 상태 가져오기

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
        {/* 홈 화면 - 로그인 상태에 따라 다른 컴포넌트 */}
        <Route 
          path="/" 
          element={isLoggedIn ? <HomeLoggedIn /> : <HomeGuest />} 
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
      </Routes>
    </BrowserRouter>
  )
}

export default Router