import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import FloatingShapes from '../components/ui/FloatingShapes'

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 relative overflow-hidden pattern-mesh">
      <FloatingShapes count={10} seed={42} />

      {/* Massive background text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-accent text-[16rem] leading-none text-max-accent/10 pointer-events-none select-none whitespace-nowrap"
        aria-hidden="true"
      >
        FIT
      </div>

      {/* Logo */}
      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="mb-8 text-center relative z-10"
      >
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 border-4 border-max-tertiary animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, #FF3AF2, #7B2FFF)',
            boxShadow: '0 0 30px rgba(255,58,242,0.5), 8px 8px 0 #00F5D4',
          }}
        >
          <Zap size={40} className="text-white" fill="white" />
        </div>
        <h1 className="font-display text-5xl font-black text-white uppercase tracking-tight text-shadow-triple">
          FitTracker
        </h1>
        <p className="text-max-secondary font-display font-bold text-sm mt-2 uppercase tracking-widest">
          Track smarter. Move better. ⚡
        </p>
      </motion.div>

      {/* Card */}
      <motion.div
        initial={{ y: 30, opacity: 0, rotate: -1 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ duration: 0.5, delay: 0.15, type: 'spring' }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="card p-8">
          <h2 className="font-display text-2xl font-black text-white mb-6 uppercase tracking-wide text-shadow-single">
            Sign in 🔐
          </h2>

          {errors.length > 0 && (
            <div className="mb-4 p-4 rounded-2xl border-4 border-max-quaternary" style={{ background: 'rgba(255,107,53,0.15)' }}>
              {errors.map((e, i) => (
                <p key={i} className="text-max-quaternary font-bold text-sm">{e}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
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
                  className="input pr-14"
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-max-accent hover:text-max-secondary transition-colors"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'SIGN IN ⚡'}
            </button>
          </form>

          <p className="text-center text-sm text-white/60 mt-6 font-body">
            Don't have an account?{' '}
            <Link to="/register" className="text-max-secondary font-bold hover:text-max-tertiary transition-colors underline underline-offset-4 decoration-wavy decoration-max-secondary/50">
              Create one 🚀
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
