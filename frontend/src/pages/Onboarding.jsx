import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import FloatingShapes from '../components/ui/FloatingShapes'

const ACCENT_COLORS = ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35', '#7B2FFF']

const GOALS = [
  { value: 'Build strength', emoji: '💪', desc: 'Get stronger, lift heavier', color: '#FF3AF2' },
  { value: 'Lose fat', emoji: '🔥', desc: 'Burn calories, shed weight', color: '#FF6B35' },
  { value: 'Run farther', emoji: '🏃', desc: 'Build endurance and stamina', color: '#00F5D4' },
  { value: 'Daily energy', emoji: '⚡', desc: 'Feel energized every day', color: '#FFE600' },
]

const STEPS = ['welcome', 'body', 'goal', 'ready']

export default function Onboarding() {
  const { user, updateUser } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState(0)
  const [form, setForm] = useState({
    age: '',
    gender: '',
    height_cm: '',
    weight_kg: '',
    goal: '',
  })
  const [loading, setLoading] = useState(false)

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1))
  const back = () => setStep((s) => Math.max(s - 1, 0))

  const handleFinish = async () => {
    setLoading(true)
    try {
      const payload = {
        age: parseInt(form.age) || null,
        gender: form.gender || null,
        height_cm: parseFloat(form.height_cm) || null,
        weight_kg: parseFloat(form.weight_kg) || null,
        goal: form.goal || 'Daily energy',
      }
      const res = await api.post('/dashboard/onboarding', payload)
      updateUser(res.data.user)
      toast.success(res.data.message)
      navigate('/', { replace: true })
    } catch {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const variants = {
    enter: { x: 80, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -80, opacity: 0 },
  }

  const stepColor = ACCENT_COLORS[step % ACCENT_COLORS.length]

  return (
    <div
      className="min-h-screen flex flex-col relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, #0D0D1A 0%, #2D1B4E 50%, #0D0D1A 100%)`,
      }}
    >
      <FloatingShapes count={12} seed={step * 10 + 77} />

      {/* Pattern overlay */}
      <div className="absolute inset-0 pattern-stripes opacity-30 pointer-events-none" />
      <div className="absolute inset-0 pattern-dots opacity-20 pointer-events-none" style={{
        backgroundImage: `radial-gradient(circle, ${stepColor}30 1px, transparent 1px)`,
      }} />

      {/* Progress dots */}
      <div className="flex items-center justify-center pt-14 gap-3 relative z-10">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 32 : 12,
              opacity: i <= step ? 1 : 0.3,
            }}
            className="h-3 rounded-full border-2"
            style={{
              backgroundColor: i <= step ? ACCENT_COLORS[i % ACCENT_COLORS.length] : 'transparent',
              borderColor: ACCENT_COLORS[i % ACCENT_COLORS.length],
              boxShadow: i === step ? `0 0 12px ${ACCENT_COLORS[i % ACCENT_COLORS.length]}80` : 'none',
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8 relative z-10">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
            >
              {step === 0 && (
                <div className="text-center text-white">
                  <motion.div
                    className="text-7xl mb-6"
                    animate={{ rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                  >
                    👋
                  </motion.div>
                  <h1 className="font-display text-4xl font-black mb-3 uppercase text-shadow-triple">
                    Hey {user?.name?.split(' ')[0] || 'there'}!
                  </h1>
                  <p className="text-white/70 text-lg leading-relaxed mb-8 font-body">
                    Let's personalize FitTracker for you. Takes less than 60 seconds.
                  </p>
                  <div
                    className="space-y-4 text-left rounded-3xl p-6 border-4 border-dashed"
                    style={{
                      borderColor: '#FF3AF2',
                      background: 'rgba(255,58,242,0.1)',
                      boxShadow: '8px 8px 0 #7B2FFF',
                    }}
                  >
                    {['Set your fitness goal', 'Get gentle daily targets', 'Track every workout'].map((t, i) => (
                      <div key={t} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border-4 flex items-center justify-center flex-shrink-0"
                          style={{
                            borderColor: ACCENT_COLORS[i % ACCENT_COLORS.length],
                            background: `${ACCENT_COLORS[i % ACCENT_COLORS.length]}20`,
                          }}
                        >
                          <Check size={14} className="text-white" />
                        </div>
                        <span className="text-white/90 font-display font-bold text-sm uppercase tracking-wide">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="text-white">
                  <h2 className="font-display text-3xl font-black mb-2 uppercase text-shadow-double">Your body stats</h2>
                  <p className="text-white/50 mb-6 text-sm font-body">Used to calculate calories & personalize goals. Optional.</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label" style={{ color: '#00F5D4' }}>Age</label>
                        <input
                          className="input"
                          type="number"
                          placeholder="25"
                          min="10" max="100"
                          value={form.age}
                          onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                          style={{ borderColor: '#00F5D4' }}
                        />
                      </div>
                      <div>
                        <label className="label" style={{ color: '#FFE600' }}>Gender</label>
                        <select
                          className="input"
                          value={form.gender}
                          onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                          style={{ borderColor: '#FFE600' }}
                        >
                          <option value="">Select...</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="non-binary">Non-binary</option>
                          <option value="prefer-not-to-say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="label" style={{ color: '#FF6B35' }}>Height (cm)</label>
                        <input
                          className="input"
                          type="number"
                          placeholder="170"
                          min="100" max="250"
                          value={form.height_cm}
                          onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
                          style={{ borderColor: '#FF6B35' }}
                        />
                      </div>
                      <div>
                        <label className="label" style={{ color: '#7B2FFF' }}>Weight (kg)</label>
                        <input
                          className="input"
                          type="number"
                          placeholder="70"
                          min="30" max="300"
                          value={form.weight_kg}
                          onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                          style={{ borderColor: '#7B2FFF' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-white">
                  <h2 className="font-display text-3xl font-black mb-2 uppercase text-shadow-double">Main goal</h2>
                  <p className="text-white/50 mb-6 text-sm font-body">What brings you here? We'll tailor your daily targets.</p>
                  <div className="space-y-3">
                    {GOALS.map((g, i) => {
                      const isSelected = form.goal === g.value
                      return (
                        <motion.button
                          key={g.value}
                          whileTap={{ scale: 0.96 }}
                          onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
                          className="w-full flex items-center gap-4 p-5 rounded-3xl border-4 transition-all duration-200 text-left"
                          style={{
                            borderColor: isSelected ? g.color : `${g.color}40`,
                            borderStyle: isSelected ? 'solid' : 'dashed',
                            background: isSelected ? `${g.color}20` : 'rgba(45,27,78,0.5)',
                            boxShadow: isSelected
                              ? `0 0 20px ${g.color}40, 8px 8px 0 ${ACCENT_COLORS[(i + 2) % 5]}`
                              : 'none',
                            transform: isSelected ? 'rotate(-1deg)' : 'none',
                          }}
                        >
                          <span className="text-3xl">{g.emoji}</span>
                          <div className="flex-1">
                            <div className="font-display font-black text-white uppercase tracking-wide">{g.value}</div>
                            <div className="text-white/50 text-xs font-body">{g.desc}</div>
                          </div>
                          {isSelected && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="w-8 h-8 rounded-full border-4 flex items-center justify-center"
                              style={{ borderColor: g.color, background: g.color }}
                            >
                              <Check size={16} className="text-white" />
                            </motion.div>
                          )}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="text-8xl mb-6"
                  >
                    🚀
                  </motion.div>
                  <h2 className="font-display text-4xl font-black mb-3 uppercase text-gradient-max">
                    You're all set!
                  </h2>
                  <p className="text-white/60 mb-8 leading-relaxed font-body">
                    Based on your goal, we've set:
                  </p>
                  <div
                    className="rounded-3xl p-6 text-left space-y-4 mb-8 border-4"
                    style={{
                      borderColor: '#FFE600',
                      borderStyle: 'dashed',
                      background: 'rgba(45,27,78,0.6)',
                      boxShadow: '8px 8px 0 #FF3AF2, 16px 16px 0 #00F5D4',
                    }}
                  >
                    {[
                      { label: 'Daily steps', val: form.goal === 'Lose fat' ? '10,000' : '8,000', color: '#00F5D4' },
                      { label: 'Active minutes/day', val: form.goal === 'Lose fat' ? '45 min' : '30 min', color: '#FF6B35' },
                      { label: 'Goal', val: form.goal || 'Daily energy', color: '#FF3AF2' },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex justify-between items-center">
                        <span className="text-white/50 text-sm font-body">{label}</span>
                        <span className="font-display font-black text-sm uppercase" style={{ color }}>{val}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/40 text-xs font-body">No guilt for off days. Every step counts. 💚</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-12 flex gap-3 max-w-sm mx-auto w-full relative z-10">
        {step > 0 && (
          <button
            onClick={back}
            className="flex items-center gap-1 px-6 py-3.5 rounded-full font-display font-bold uppercase tracking-wide transition-all border-4 border-dashed"
            style={{
              borderColor: stepColor,
              color: stepColor,
              background: 'transparent',
            }}
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            CONTINUE
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>LET'S GO! <span className="text-xl">🎉</span></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
