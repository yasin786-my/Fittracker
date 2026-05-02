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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
          <p className="text-slate-500 font-body text-sm">Loading...</p>
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
              className: 'font-body text-sm',
              style: {
                background: 'rgb(var(--card, 255 255 255))',
                color: 'rgb(var(--text, 15 23 42))',
                border: '1px solid rgb(var(--border, 226 232 240))',
                borderRadius: '12px',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
              },
              duration: 3500,
            }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
