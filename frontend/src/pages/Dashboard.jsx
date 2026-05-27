import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Footprints, Flame, Clock, Moon, ChevronRight, Zap, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import ProgressRing from '../components/ui/ProgressRing'
import CountUp from '../components/ui/CountUp'
import FloatingShapes from '../components/ui/FloatingShapes'

const ACCENTS = ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35', '#7B2FFF']
const BORDERS = ['#FFE600', '#FF3AF2', '#7B2FFF', '#00F5D4', '#FF6B35']
const SHADOWS = [
  '8px 8px 0 #FFE600, 16px 16px 0 #7B2FFF',
  '8px 8px 0 #FF3AF2, 16px 16px 0 #00F5D4',
  '8px 8px 0 #7B2FFF, 16px 16px 0 #FF6B35',
  '8px 8px 0 #00F5D4, 16px 16px 0 #FF3AF2',
  '8px 8px 0 #FF6B35, 16px 16px 0 #FFE600',
]

function ReadinessBar({ score = 50 }) {
  const color = score >= 70 ? '#00F5D4' : score >= 40 ? '#FF6B35' : '#FF3AF2'
  const label = score >= 70 ? 'HIGH ⚡' : score >= 40 ? 'MODERATE 🔥' : 'LOW 💫'
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-3 rounded-full overflow-hidden" style={{ background: 'rgba(45,27,78,0.8)', border: '2px solid rgba(255,58,242,0.3)' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1.2, ease: 'easeOut', delay: 0.4 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${color}, ${ACCENTS[2]})`, boxShadow: `0 0 10px ${color}80` }}
        />
      </div>
      <span className="text-xs font-display font-black tracking-widest" style={{ color, textShadow: `1px 1px 0 #0D0D1A` }}>{label}</span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, unit, color, delay = 0, idx = 0 }) {
  const accent = ACCENTS[idx % 5]
  const border = BORDERS[idx % 5]
  const shadow = SHADOWS[idx % 5]
  const rot = idx % 2 === 0 ? 'rotate-1' : '-rotate-1'
  return (
    <motion.div
      initial={{ y: 20, opacity: 0, rotate: idx % 2 === 0 ? 2 : -2 }}
      animate={{ y: 0, opacity: 1, rotate: 0 }}
      transition={{ delay, duration: 0.4, type: 'spring' }}
      whileHover={{ scale: 1.05, rotate: idx % 2 === 0 ? 2 : -2 }}
      className={`relative overflow-hidden ${rot}`}
      style={{
        background: 'rgba(45,27,78,0.85)',
        border: `4px solid ${border}`,
        borderRadius: '20px',
        boxShadow: shadow,
        padding: '16px',
      }}
    >
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`, backgroundSize: '16px 16px' }} />
      <div className="relative z-10 flex items-center gap-2 mb-2">
        <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${accent}25`, border: `2px solid ${accent}` }}>
          <Icon size={16} style={{ color: accent }} strokeWidth={2.5} />
        </div>
        <span className="text-xs font-display font-bold uppercase tracking-widest" style={{ color: accent }}>{label}</span>
      </div>
      <div className="relative z-10 font-display font-black text-2xl text-white" style={{ textShadow: `2px 2px 0 ${border}` }}>
        <CountUp target={value} />
        {unit && <span className="text-sm font-bold ml-1" style={{ color: accent }}>{unit}</span>}
      </div>
    </motion.div>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await api.get('/dashboard/today')
      setData(res.data)
    } catch {
      toast.error('Failed to load dashboard')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchDashboard() }, [fetchDashboard])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'GOOD MORNING'
    if (h < 17) return 'GOOD AFTERNOON'
    return 'GOOD EVENING'
  }

  if (loading) {
    return (
      <div className="page flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full animate-spin-slow" style={{ border: '4px solid #7B2FFF', borderTopColor: '#FF3AF2', boxShadow: '0 0 20px rgba(255,58,242,0.5)' }} />
          <p className="font-accent text-2xl text-gradient-max">LOADING...</p>
        </div>
      </div>
    )
  }

  const summary = data?.summary || {}
  const goalPct = data?.goal_pct || 0
  const insight = data?.insight || {}
  const readiness = data?.readiness_score || 50
  const streak = data?.streak || 0
  const userGoals = data?.user_goals || {}

  return (
    <div className="page scrollbar-hide relative">
      <FloatingShapes seed={1} count={7} />

      {/* Header */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex items-start justify-between mb-6 relative z-10">
        <div>
          <p className="font-display font-black text-xs uppercase tracking-widest mb-1" style={{ color: '#00F5D4' }}>{greeting()},</p>
          <h1 className="font-display font-black text-4xl text-white text-shadow-double leading-tight">
            {user?.name?.split(' ')[0] || 'ATHLETE'} 👋
          </h1>
        </div>
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full"
            style={{ background: 'rgba(45,27,78,0.9)', border: '4px solid #FFE600', boxShadow: '4px 4px 0 #FF3AF2', }}
          >
            <span className="text-xl animate-wiggle">🔥</span>
            <span className="font-accent text-2xl" style={{ color: '#FFE600', textShadow: '1px 1px 0 #FF3AF2' }}>{streak}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Central Progress Ring */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-col items-center mb-6 relative z-10"
      >
        <div className="relative">
          <div className="absolute inset-0 rounded-full animate-pulse-glow" style={{ transform: 'scale(1.1)' }} />
          <ProgressRing pct={goalPct} size={200} strokeWidth={16} color="#FF3AF2" className="relative z-10" >
            <div className="flex flex-col items-center justify-center">
              <motion.span
                key={goalPct}
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="font-accent text-5xl text-gradient-max"
              >
                {Math.round(goalPct)}%
              </motion.span>
              <span className="text-xs font-display font-bold uppercase tracking-widest mt-1" style={{ color: '#00F5D4' }}>DAILY GOAL</span>
              {goalPct >= 100 && (
                <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.8 }} className="text-2xl mt-1 animate-bounce-subtle">🎉</motion.span>
              )}
            </div>
          </ProgressRing>
        </div>

        {/* Readiness */}
        <div className="w-full mt-4 relative overflow-hidden" style={{ background: 'rgba(45,27,78,0.8)', border: '4px solid #7B2FFF', borderRadius: '20px', boxShadow: '6px 6px 0 #00F5D4', padding: '16px' }}>
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #FFE600 8px, #FFE600 16px)' }} />
          <div className="relative z-10 flex justify-between items-center mb-2">
            <span className="text-xs font-display font-black uppercase tracking-widest flex items-center gap-1" style={{ color: '#FFE600' }}>
              <Zap size={12} style={{ color: '#FFE600' }} /> ENERGY / READINESS
            </span>
            <span className="font-accent text-lg" style={{ color: '#00F5D4' }}>{readiness}/100</span>
          </div>
          <ReadinessBar score={readiness} />
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <StatCard icon={Footprints} label="Steps" value={summary.steps || 0} color="#00F5D4" delay={0.2} idx={0} />
        <StatCard icon={Flame} label="Calories" value={summary.calories_burned || 0} unit="kcal" color="#FF6B35" delay={0.25} idx={1} />
        <StatCard icon={Clock} label="Active" value={summary.active_minutes || 0} unit="min" color="#FF3AF2" delay={0.3} idx={2} />
        <StatCard icon={Moon} label="Sleep" value={summary.sleep_hours || 0} unit="hrs" color="#7B2FFF" delay={0.35} idx={3} />
      </div>

      {/* Goal progress bars */}
      <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}
        className="relative overflow-hidden mb-6"
        style={{ background: 'rgba(45,27,78,0.8)', border: '4px dashed #FF3AF2', borderRadius: '20px', boxShadow: '8px 8px 0 #FFE600', padding: '20px' }}
      >
        <div className="absolute inset-0 opacity-8" style={{ backgroundImage: 'conic-gradient(from 90deg at 1px 1px, transparent 90deg, rgba(0,245,212,0.05) 0)', backgroundSize: '30px 30px' }} />
        <p className="text-xs font-display font-black uppercase tracking-widest mb-4 relative z-10" style={{ color: '#FFE600', textShadow: '1px 1px 0 #FF3AF2' }}>TODAY'S PROGRESS ✨</p>
        {[
          { label: 'Steps', val: summary.steps || 0, goal: userGoals.daily_step_goal || 8000, color: '#00F5D4', shadow: '#7B2FFF' },
          { label: 'Active Minutes', val: summary.active_minutes || 0, goal: userGoals.daily_active_min_goal || 30, color: '#FF6B35', shadow: '#FF3AF2' },
        ].map(({ label, val, goal, color, shadow }) => {
          const pct = Math.min(100, (val / goal) * 100)
          return (
            <div key={label} className="mb-3 relative z-10">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-display font-bold uppercase tracking-wider" style={{ color }}>{label}</span>
                <span className="font-display font-black" style={{ color: '#FFE600' }}>{val.toLocaleString()} / {goal.toLocaleString()}</span>
              </div>
              <div className="h-4 rounded-full overflow-hidden" style={{ background: 'rgba(13,13,26,0.6)', border: `2px solid ${color}50` }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1.2, ease: 'easeOut', delay: 0.6 }}
                  className="h-full rounded-full"
                  style={{ background: `linear-gradient(90deg, ${color}, ${shadow})`, boxShadow: `0 0 10px ${color}80` }}
                />
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Insight Card */}
      {insight.title && (
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }}
          className="relative overflow-hidden mb-6"
          style={{ background: 'rgba(45,27,78,0.8)', border: '4px dashed #00F5D4', borderRadius: '20px', boxShadow: '8px 8px 0 #FF6B35', padding: '20px' }}
        >
          <div className="absolute top-2 right-2 opacity-20 font-accent text-6xl" style={{ color: '#00F5D4' }}>💡</div>
          <div className="flex items-start gap-3 relative z-10">
            <span className="text-3xl flex-shrink-0 animate-bounce-subtle">{insight.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-black text-base text-white mb-1" style={{ textShadow: '1px 1px 0 #00F5D4' }}>{insight.title}</p>
              <p className="text-sm text-white/70 leading-relaxed font-body">{insight.body}</p>
            </div>
            {insight.suggested_workout && (
              <button onClick={() => navigate('/workout')} className="flex-shrink-0 flex items-center gap-1 text-xs font-display font-black uppercase tracking-wider px-3 py-1 rounded-full"
                style={{ background: '#00F5D4', color: '#0D0D1A', border: '2px solid #FFE600' }}>
                GO <ChevronRight size={12} />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Start Workout Button */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate('/workout')}
        className="btn-primary w-full flex items-center justify-center gap-3 mb-6 animate-pulse-glow"
        style={{ fontSize: '1.1rem', padding: '18px 40px' }}
      >
        <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center" style={{ border: '2px solid rgba(255,255,255,0.4)' }}>
          <Play size={20} fill="white" className="ml-0.5" />
        </div>
        START WORKOUT 🔥
      </motion.button>

      {/* Today's sessions */}
      {data?.sessions_today?.length > 0 && (
        <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }}>
          <p className="text-xs font-display font-black uppercase tracking-widest mb-3" style={{ color: '#FF3AF2', textShadow: '1px 1px 0 #7B2FFF' }}>TODAY'S SESSIONS ⚡</p>
          <div className="space-y-3">
            {data.sessions_today.map((s, i) => (
              <div key={s.id} className="relative overflow-hidden"
                style={{ background: 'rgba(45,27,78,0.8)', border: `4px solid ${ACCENTS[i % 5]}`, borderRadius: '20px', boxShadow: `6px 6px 0 ${BORDERS[i % 5]}`, padding: '16px' }}>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce-subtle"
                    style={{ background: `${ACCENTS[i % 5]}20`, border: `3px solid ${ACCENTS[i % 5]}` }}>
                    {s.workout_type === 'Walk' ? '🚶' : s.workout_type === 'Run' ? '🏃' : s.workout_type === 'Strength' ? '💪' : s.workout_type === 'Yoga' ? '🧘' : s.workout_type === 'HIIT' ? '🔥' : '⚡'}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-black text-base text-white" style={{ textShadow: `1px 1px 0 ${ACCENTS[i % 5]}` }}>{s.workout_type}</p>
                    <p className="text-xs font-display font-bold" style={{ color: BORDERS[i % 5] }}>{s.duration_min} min · {s.calories_burned} kcal</p>
                  </div>
                  <span className="font-accent text-lg" style={{ color: '#00F5D4', textShadow: '1px 1px 0 #7B2FFF' }}>DONE ✓</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
