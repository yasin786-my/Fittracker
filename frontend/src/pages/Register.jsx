import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'
import FloatingShapes from '../components/ui/FloatingShapes'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])

  const validate = () => {
    const errs = []
    if (!form.name.trim() || form.name.length < 2) errs.push('Name must be at least 2 characters.')
    if (!form.email.includes('@')) errs.push('Enter a valid email.')
    if (form.password.length < 8) errs.push('Password must be at least 8 characters.')
    if (form.password !== form.confirm) errs.push('Passwords do not match.')
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const clientErrors = validate()
    if (clientErrors.length) { setErrors(clientErrors); return }
    setErrors([])
    setLoading(true)
    try {
      await register(form.email, form.password, form.name)
      toast.success('Account created! Let\'s set up your profile 🎉')
      navigate('/onboarding', { replace: true })
    } catch (err) {
      const msgs = err.response?.data?.errors || ['Registration failed. Please try again.']
      setErrors(msgs)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden pattern-mesh">
      <FloatingShapes count={10} seed={99} />

      {/* Massive background text */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-accent text-[14rem] leading-none text-max-secondary/10 pointer-events-none select-none whitespace-nowrap"
        aria-hidden="true"
      >
        GO!
      </div>

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center relative z-10"
      >
        <div
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-4 border-4 border-max-quaternary animate-pulse-glow"
          style={{
            background: 'linear-gradient(135deg, #00F5D4, #7B2FFF)',
            boxShadow: '0 0 30px rgba(0,245,212,0.5), 8px 8px 0 #FF3AF2',
          }}
        >
          <Zap size={40} className="text-white" fill="white" />
        </div>
        <h1 className="font-display text-5xl font-black text-white uppercase tracking-tight text-shadow-triple">
          FitTracker
        </h1>
        <p className="text-max-tertiary font-display font-bold text-sm mt-2 uppercase tracking-widest">
          Start your journey today 🚀
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 30, opacity: 0, rotate: 1 }}
        animate={{ y: 0, opacity: 1, rotate: 0 }}
        transition={{ delay: 0.1, type: 'spring' }}
        className="w-full max-w-sm relative z-10"
      >
        <div className="card p-8" style={{ borderColor: '#00F5D4', boxShadow: '8px 8px 0 #FF6B35, 16px 16px 0 #FF3AF2' }}>
          <h2 className="font-display text-2xl font-black text-white mb-6 uppercase tracking-wide text-shadow-single">
            Create account ✨
          </h2>

          {errors.length > 0 && (
            <div className="mb-4 p-4 rounded-2xl border-4 border-max-quaternary" style={{ background: 'rgba(255,107,53,0.15)' }}>
              {errors.map((e, i) => (
                <p key={i} className="text-max-quaternary font-bold text-sm">{e}</p>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" style={{ color: '#00F5D4' }}>Your name</label>
              <input
                className="input"
                type="text"
                placeholder="Alex"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
                style={{ borderColor: '#00F5D4' }}
              />
            </div>
            <div>
              <label className="label" style={{ color: '#00F5D4' }}>Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
                style={{ borderColor: '#00F5D4' }}
              />
            </div>
            <div>
              <label className="label" style={{ color: '#00F5D4' }}>Password</label>
              <div className="relative">
                <input
                  className="input pr-14"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                  style={{ borderColor: '#00F5D4' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-max-secondary hover:text-max-tertiary transition-colors"
                >
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label" style={{ color: '#00F5D4' }}>Confirm password</label>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Same as above"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                required
                style={{ borderColor: '#00F5D4' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'CREATE ACCOUNT 🚀'}
            </button>
          </form>

          <p className="text-center text-sm text-white/60 mt-6 font-body">
            Already have an account?{' '}
            <Link to="/login" className="text-max-accent font-bold hover:text-max-tertiary transition-colors underline underline-offset-4 decoration-wavy decoration-max-accent/50">
              Sign in ⚡
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
