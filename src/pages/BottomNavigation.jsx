import { useNavigate, useLocation } from "react-router-dom"
import categoryIcon from "../assets/category.png"
import mypageIcon from "../assets/mypage.png"
import favoriteIcon from "../assets/favorite.png"
import ichomeIcon from "../assets/ichome.png"

const BottomNavigation = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const navItems = [
    {
      id: 'home',
      icon: ichomeIcon,
      label: '홈',
      path: '/',
    },
    {
      id: 'category',
      icon: categoryIcon,
      label: '카테고리',
      path: '/category',
    },
    {
      id: 'favorite',
      icon: favoriteIcon,
      label: '찜',
      path: '/favorite',
    },
    {
      id: 'mypage',
      icon: mypageIcon,
      label: '마이',
      path: '/mypage',
    },
  ]

  const handleNavClick = (path) => {
    navigate(path)
  }

  return (
    <nav className="home-bottom-nav">
      {navItems.map((item) => (
        <div
          key={item.id}
          className={`home-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          onClick={() => handleNavClick(item.path)}
        >
          <img
            src={item.icon || "/placeholder.svg"}
            alt={item.label}
            className="home-nav-icon"
          />
          <span className="home-nav-label">{item.label}</span>
        </div>
      ))}
    </nav>
  )
}

export default BottomNavigation