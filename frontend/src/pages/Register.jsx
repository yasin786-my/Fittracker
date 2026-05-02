import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Zap } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

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
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 bg-gradient-to-br from-brand-50 via-white to-emerald-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="mb-8 text-center"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 shadow-lg shadow-brand-500/30 mb-4">
          <Zap size={32} className="text-white" fill="white" />
        </div>
        <h1 className="font-display text-3xl font-bold text-slate-900 dark:text-white">FitTracker</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Start your journey today</p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-sm"
      >
        <div className="card p-8">
          <h2 className="font-display text-xl font-semibold text-slate-900 dark:text-white mb-6">
            Create account
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
              <label className="label">Your name</label>
              <input
                className="input"
                type="text"
                placeholder="Alex"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  className="input pr-12"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Min 8 characters"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="label">Confirm password</label>
              <input
                className="input"
                type={showPw ? 'text' : 'password'}
                placeholder="Same as above"
                value={form.confirm}
                onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}
