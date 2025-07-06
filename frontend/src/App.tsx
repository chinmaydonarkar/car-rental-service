import { useState, useEffect } from 'react'
import Login from './components/Login'
import Register from './components/Register'
import CustomerDashboard from './components/CustomerDashboard'
import { apiService } from './services/api'
import type { AuthUser } from './types'
import './App.css'

function App() {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      const token = apiService.getToken()
      if (token) {
        const currentUser = await apiService.getCurrentUser()
        setUser(currentUser)
      }
    } catch (error) {
      apiService.logout()
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = () => {
    checkAuthStatus()
  }

  const handleRegister = () => {
    setAuthMode('login')
    checkAuthStatus()
  }

  const handleLogout = () => {
    apiService.logout()
    setUser(null)
  }

  const switchToRegister = () => {
    setAuthMode('register')
  }

  const switchToLogin = () => {
    setAuthMode('login')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <p>Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="app">
        {authMode === 'login' ? (
          <Login onLogin={handleLogin} onSwitchToRegister={switchToRegister} />
        ) : (
          <Register onRegister={handleRegister} onSwitchToLogin={switchToLogin} />
        )}
      </div>
    )
  }

  return (
    <div className="app">
      <CustomerDashboard user={user} onLogout={handleLogout} />
    </div>
  )
}

export default App
