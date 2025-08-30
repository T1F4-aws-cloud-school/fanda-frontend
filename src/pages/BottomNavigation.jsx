import { useState } from "react"
import { useAuth } from "../context/AuthContext"
import { useNavigate, useLocation } from "react-router-dom"
import categoryIcon from "../assets/category.png"
import mypageIcon from "../assets/mypage.png"
import favoriteIcon from "../assets/favorite.png"
import ichomeIcon from "../assets/ichome.png"

const BottomNavigation = ({ onShowNotification }) => {
  const { handleLogout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [clickCount, setClickCount] = useState(0)

  // 마이 버튼 클릭 시 숨겨진 로그아웃 기능
  const handleMyPageClick = () => {
    const newCount = clickCount + 1
    setClickCount(newCount)
    
    if (newCount === 3) {
      if (window.confirm('로그아웃 하시겠습니까?')) {
        // apiService의 로그아웃 함수 사용
        try {
          handleLogout()
          console.log('로그아웃 완료')
          // 홈으로 이동
          navigate('/')
        } catch (error) {
          console.error('로그아웃 실패:', error)
        }
      }
      setClickCount(0)
    }
    
    // 3초 후 카운트 리셋
    setTimeout(() => {
      setClickCount(0)
    }, 3000)
  }

  // 찜 버튼 클릭 핸들러
  const handleFavoriteClick = () => {
    // 알림만 표시하고 페이지 이동 안함
    if (onShowNotification) {
      onShowNotification()
    }
  }

  const navItems = [
    {
      id: 'home',
      icon: ichomeIcon,
      label: '홈',
      path: '/',
      onClick: () => navigate('/')
    },
    {
      id: 'category',
      icon: categoryIcon,
      label: '카테고리',
      path: '/category',
      onClick: () => navigate('/category')
    },
    {
      id: 'favorite',
      icon: favoriteIcon,
      label: '찜',
      path: '/favorite',
      onClick: handleFavoriteClick
    },
    {
      id: 'mypage',
      icon: mypageIcon,
      label: '마이',
      path: '/mypage',
      onClick: handleMyPageClick // 마이 버튼만 특별한 핸들러 사용
    },
  ]

  return (
    <nav className="home-bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`home-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={item.onClick}
          style={{ position: 'relative' }}
        >
          <img
            src={item.icon || "/placeholder.svg"}
            alt={item.label}
            className="home-nav-icon"
          />
          <span className="home-nav-label">{item.label}</span>
          
          {/* 개발 환경에서만 클릭 카운트 표시 (마이 버튼에만) */}
          {item.id === 'mypage' && process.env.NODE_ENV === 'development' && clickCount > 0 && (
            <div style={{
              position: 'absolute',
              top: '-20px',
              right: '50%',
              transform: 'translateX(50%)',
              fontSize: '10px',
              color: '#999',
              opacity: 0.5,
              backgroundColor: 'rgba(255,255,255,0.8)',
              padding: '2px 4px',
              borderRadius: '4px'
            }}>
              {clickCount}/3
            </div>
          )}
        </div>
      ))}
    </nav>
  )
}

export default BottomNavigation