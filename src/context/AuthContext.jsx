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
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(null); // 사용자 정보 상태

  // 앱 시작 시 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = checkAuthStatus();
        setIsLoggedIn(authStatus);
        
        if (authStatus) {
          // 로그인 상태라면 저장된 사용자 정보도 불러오기
          const storedUserInfo = localStorage.getItem('userInfo');
          if (storedUserInfo) {
            const parsedUserInfo = JSON.parse(storedUserInfo);
            setUserInfo(parsedUserInfo);
            console.log("저장된 사용자 정보 불러옴:", parsedUserInfo);
          }
          console.log("로그인 상태 유지됨");
        } else {
          console.log("비로그인 상태");
          setUserInfo(null);
        }
      } catch (error) {
        console.error("인증 확인 실패:", error);
        setIsLoggedIn(false);
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 로그인 성공 시 호출할 함수
  const handleLoginSuccess = (userData = null) => {
    setIsLoggedIn(true);
    
    if (userData) {
      setUserInfo(userData);
      console.log("AuthContext에 사용자 정보 저장:", userData);
    }
  };

  // 로그아웃 시 호출할 함수
  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userInfo');
    
    setIsLoggedIn(false);
    setUserInfo(null);
    
    console.log("로그아웃 완료");
  };

  const value = {
    isLoggedIn,
    isLoading,
    userInfo, // 사용자 정보 제공
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