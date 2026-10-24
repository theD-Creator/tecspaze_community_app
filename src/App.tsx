import React, { useEffect, useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { TopNav, BottomNav } from './components/navigation'
import { HomePage } from './pages/Home'
import { CommunityPage } from './pages/Community'
import { EmployeesPage } from './pages/Employees'
import { RatingsPage } from './pages/Ratings'
import { ProfilePage } from './pages/Profile'
import { LoginPage } from './pages/Auth/Login'
import { RegisterPage } from './pages/Auth/Register'
import { NotificationContainer } from './components/layout/NotificationContainer'
import { SideMenu } from './components/layout/SideMenu'
import { useAuth } from './hooks/useAuth'
import './styles/index.css'

const App: React.FC = () => {
  const { user, loading, checkAuth } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  // Show loading state while checking auth
  if (loading) {
    return (
      <div className="app-loading">
        <div className="animate-pulse">Lädt...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="app">
        {/* Top Navigation */}
        <TopNav onMenuClick={() => setMenuOpen(true)} />

        {/* Side Menu (Desktop) */}
        <SideMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

        {/* Main Content */}
        <main className="app-main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/community" element={<CommunityPage />} />
            <Route path="/employees" element={<EmployeesPage />} />
            <Route path="/ratings" element={<RatingsPage />} />
            <Route path="/profile" element={user ? <ProfilePage /> : <Navigate to="/login" />} />
            <Route path="/login" element={user ? <Navigate to="/" /> : <LoginPage />} />
            <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>

        {/* Bottom Navigation (Mobile) */}
        <BottomNav />

        {/* Notifications */}
        <NotificationContainer />
      </div>
    </Router>
  )
}

export default App
