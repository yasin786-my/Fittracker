import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Dashboard from './pages/Dashboard'
import WorkoutStart from './pages/WorkoutStart'
import SessionActive from './pages/SessionActive'
import History from './pages/History'
import Profile from './pages/Profile'
import BottomNav from './components/layout/BottomNav'

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0D0D1A' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-full border-4 border-max-accent border-t-transparent animate-spin"
            style={{ boxShadow: '0 0 20px rgba(255,58,242,0.5), 0 0 40px rgba(0,245,212,0.3)' }}
          />
          <p className="font-display font-bold text-max-accent text-sm uppercase tracking-widest text-shadow-single">
            Loading...
          </p>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/login" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <>
      <Routes>
        {/* Public */}
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to="/" replace /> : <Register />}
        />

        {/* Onboarding */}
        <Route
          path="/onboarding"
          element={
            <ProtectedRoute>
              {user?.onboarding_complete ? <Navigate to="/" replace /> : <Onboarding />}
            </ProtectedRoute>
          }
        />

        {/* Protected app routes */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              {user && !user.onboarding_complete
                ? <Navigate to="/onboarding" replace />
                : <Dashboard />
              }
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout"
          element={
            <ProtectedRoute>
              <WorkoutStart />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workout/active/:sessionId"
          element={
            <ProtectedRoute>
              <SessionActive />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Bottom nav — only on app pages */}
      {user && user.onboarding_complete && <BottomNav />}
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <Toaster
            position="top-center"
            toastOptions={{
              className: 'font-body font-bold text-sm',
              style: {
                background: 'rgba(45, 27, 78, 0.95)',
                color: '#FFFFFF',
                border: '4px solid #FF3AF2',
                borderRadius: '9999px',
                boxShadow: '0 0 20px rgba(255,58,242,0.4), 8px 8px 0 #7B2FFF',
                textShadow: '1px 1px 0 #7B2FFF',
                padding: '12px 24px',
              },
              duration: 3500,
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
