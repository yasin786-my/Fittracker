import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ChevronLeft, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

const GOALS = [
  { value: 'Build strength', emoji: '💪', desc: 'Get stronger, lift heavier' },
  { value: 'Lose fat', emoji: '🔥', desc: 'Burn calories, shed weight' },
  { value: 'Run farther', emoji: '🏃', desc: 'Build endurance and stamina' },
  { value: 'Daily energy', emoji: '⚡', desc: 'Feel energized every day' },
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
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-brand-500 via-emerald-500 to-teal-500 dark:from-brand-800 dark:via-emerald-800 dark:to-teal-800">
      {/* Progress dots */}
      <div className="flex items-center justify-center pt-14 gap-2">
        {STEPS.map((_, i) => (
          <motion.div
            key={i}
            animate={{
              width: i === step ? 24 : 8,
              opacity: i <= step ? 1 : 0.4,
            }}
            className="h-2 rounded-full bg-white"
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        <div className="w-full max-w-sm">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3 }}
            >
              {step === 0 && (
                <div className="text-center text-white">
                  <div className="text-6xl mb-6">👋</div>
                  <h1 className="font-display text-3xl font-bold mb-3">
                    Hey {user?.name?.split(' ')[0] || 'there'}!
                  </h1>
                  <p className="text-white/80 text-lg leading-relaxed mb-8">
                    Let's personalize FitTracker for you. Takes less than 60 seconds.
                  </p>
                  <div className="space-y-3 text-left bg-white/10 rounded-2xl p-5">
                    {['Set your fitness goal', 'Get gentle daily targets', 'Track every workout'].map((t) => (
                      <div key={t} className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                          <Check size={14} className="text-white" />
                        </div>
                        <span className="text-white/90 text-sm">{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="text-white">
                  <h2 className="font-display text-2xl font-bold mb-2">Your body stats</h2>
                  <p className="text-white/70 mb-6 text-sm">Used to calculate calories & personalize goals. Optional.</p>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-white/80 text-sm font-medium block mb-1">Age</label>
                        <input
                          className="input bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50"
                          type="number"
                          placeholder="25"
                          min="10" max="100"
                          value={form.age}
                          onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-white/80 text-sm font-medium block mb-1">Gender</label>
                        <select
                          className="input bg-white/20 border-white/20 text-white focus:ring-white/50"
                          value={form.gender}
                          onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}
                          style={{ colorScheme: 'dark' }}
                        >
                          <option value="" className="text-slate-900">Select...</option>
                          <option value="male" className="text-slate-900">Male</option>
                          <option value="female" className="text-slate-900">Female</option>
                          <option value="non-binary" className="text-slate-900">Non-binary</option>
                          <option value="prefer-not-to-say" className="text-slate-900">Prefer not to say</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-white/80 text-sm font-medium block mb-1">Height (cm)</label>
                        <input
                          className="input bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50"
                          type="number"
                          placeholder="170"
                          min="100" max="250"
                          value={form.height_cm}
                          onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))}
                        />
                      </div>
                      <div>
                        <label className="text-white/80 text-sm font-medium block mb-1">Weight (kg)</label>
                        <input
                          className="input bg-white/20 border-white/20 text-white placeholder:text-white/50 focus:ring-white/50"
                          type="number"
                          placeholder="70"
                          min="30" max="300"
                          value={form.weight_kg}
                          onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="text-white">
                  <h2 className="font-display text-2xl font-bold mb-2">Main goal</h2>
                  <p className="text-white/70 mb-6 text-sm">What brings you here? We'll tailor your daily targets.</p>
                  <div className="space-y-3">
                    {GOALS.map((g) => (
                      <button
                        key={g.value}
                        onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-150 text-left ${
                          form.goal === g.value
                            ? 'border-white bg-white/20 shadow-lg'
                            : 'border-white/20 bg-white/10 hover:bg-white/15'
                        }`}
                      >
                        <span className="text-2xl">{g.emoji}</span>
                        <div>
                          <div className="font-display font-semibold text-white">{g.value}</div>
                          <div className="text-white/70 text-xs">{g.desc}</div>
                        </div>
                        {form.goal === g.value && (
                          <div className="ml-auto w-6 h-6 rounded-full bg-white flex items-center justify-center">
                            <Check size={14} className="text-brand-600" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="text-center text-white">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 12 }}
                    className="text-7xl mb-6"
                  >
                    🚀
                  </motion.div>
                  <h2 className="font-display text-3xl font-bold mb-3">You're all set!</h2>
                  <p className="text-white/80 mb-8 leading-relaxed">
                    Based on your goal, we've set:
                  </p>
                  <div className="bg-white/10 rounded-2xl p-5 text-left space-y-3 mb-8">
                    {[
                      { label: 'Daily steps', val: form.goal === 'Lose fat' ? '10,000' : '8,000' },
                      { label: 'Active minutes/day', val: form.goal === 'Lose fat' ? '45 min' : '30 min' },
                      { label: 'Goal', val: form.goal || 'Daily energy' },
                    ].map(({ label, val }) => (
                      <div key={label} className="flex justify-between">
                        <span className="text-white/70 text-sm">{label}</span>
                        <span className="font-display font-semibold text-white text-sm">{val}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-white/60 text-xs">No guilt for off days. Every step counts. 💚</p>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="px-6 pb-12 flex gap-3 max-w-sm mx-auto w-full">
        {step > 0 && (
          <button
            onClick={back}
            className="flex items-center gap-1 px-5 py-3 rounded-xl bg-white/20 text-white font-display font-medium hover:bg-white/30 transition-all"
          >
            <ChevronLeft size={18} />
            Back
          </button>
        )}

        {step < STEPS.length - 1 ? (
          <button
            onClick={next}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-brand-600 font-display font-bold hover:bg-white/90 active:scale-95 transition-all shadow-lg"
          >
            Continue
            <ChevronRight size={18} />
          </button>
        ) : (
          <button
            onClick={handleFinish}
            disabled={loading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-brand-600 font-display font-bold hover:bg-white/90 active:scale-95 transition-all shadow-lg"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-brand-500/30 border-t-brand-600 rounded-full animate-spin" />
            ) : (
              <>Let's go! <span>🎉</span></>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
