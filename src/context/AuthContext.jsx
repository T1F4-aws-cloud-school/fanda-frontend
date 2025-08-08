// context/AuthContext.jsx - 새로 생성할 파일

import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

// 로그인 상태 확인 함수
const checkAuthStatus = () => {
  const accessToken = localStorage.getItem('accessToken');
  const refreshToken = localStorage.getItem('refreshToken');
  
  // 토큰이 둘 다 있으면 로그인 상태
  return !!(accessToken && refreshToken);
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // 초기 로딩 상태

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = checkAuthStatus();
        setIsLoggedIn(authStatus);
        
        if (authStatus) {
          console.log("로그인 상태 유지됨");
        } else {
          console.log("비로그인 상태");
        }
      } catch (error) {
        console.error("인증 확인 실패:", error);
        setIsLoggedIn(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 로그인 성공 시 호출할 함수
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  // 로그아웃 시 호출할 함수
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
  };

  const value = {
    isLoggedIn,
    isLoading,
    handleLoginSuccess,
    handleLogout,
    checkAuthStatus: () => checkAuthStatus()
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};