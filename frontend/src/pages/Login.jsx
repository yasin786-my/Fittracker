import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors([])
    setLoading(true)
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back! 👋`)
      navigate(user.onboarding_complete ? '/' : '/onboarding', { replace: true })
    } catch (err) {
      const msgs = err.response?.data?.errors || ['Login failed. Please try again.']
      setErrors(msgs)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Logo */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30 mb-4">
          <Zap size={32} className="text-white" fill="white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">FitTracker</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Track smarter. Move better.</p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <div className="card p-8">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Sign in
          </h2>

          {errors.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              {errors.map((e, i) => (
                <p key={i} className="text-red-600 dark:text-red-400 text-sm">{e}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                autoComplete="email"
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Sign in'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
