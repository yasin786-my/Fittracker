import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Footprints, Flame, Clock, Moon, ChevronRight, Zap, Play } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import ProgressRing from '../components/ui/ProgressRing'
import CountUp from '../components/ui/CountUp'

function ReadinessBar({ score = 50 }) {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f97316' : '#ef4444'
  const label = score >= 70 ? 'High' : score >= 40 ? 'Moderate' : 'Low'
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-display font-semibold" style={{ color }}>{label}</span>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, unit, suffix, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ y: 16, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="stat-card"
    >
      <div className="flex items-center gap-2 mb-1">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
          <Icon size={15} style={{ color }} />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</span>
      </div>
      <div className="font-display font-bold text-xl text-slate-900 dark:text-white">
        <CountUp target={value} />
        {unit && <span className="text-sm font-normal text-slate-500 ml-1">{unit}</span>}
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

  useEffect(() => {
    fetchDashboard()
  }, [fetchDashboard])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  if (loading) {
    return (
      <div className="page flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading your day...</p>
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

  const ringColor = goalPct >= 80 ? '#22c55e' : goalPct >= 40 ? '#f97316' : '#94a3b8'

  return (
    <div className="page scrollbar-hide">
      {/* Header */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-start justify-between mb-6"
      >
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-sm font-body">{greeting()},</p>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">
            {user?.name?.split(' ')[0] || 'Athlete'} 👋
          </h1>
        </div>
        {streak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="flex items-center gap-1 bg-energy-500/10 dark:bg-energy-500/20 px-3 py-1.5 rounded-xl"
          >
            <span className="text-lg animate-flame">🔥</span>
            <span className="font-display font-bold text-energy-500 text-sm">{streak}</span>
          </motion.div>
        )}
      </motion.div>

      {/* Central Progress Ring */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col items-center mb-6"
      >
        <ProgressRing
          pct={goalPct}
          size={200}
          strokeWidth={16}
          color={ringColor}
          className="drop-shadow-xl"
        >
          <div className="flex flex-col items-center justify-center">
            <motion.span
              key={goalPct}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="font-display font-extrabold text-4xl text-slate-900 dark:text-white"
            >
              {Math.round(goalPct)}%
            </motion.span>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">daily goal</span>
            {goalPct >= 100 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.8 }}
                className="text-lg mt-1"
              >
                🎉
              </motion.span>
            )}
          </div>
        </ProgressRing>

        {/* Readiness */}
        <div className="w-full mt-4 card p-3">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-xs font-display font-medium text-slate-600 dark:text-slate-400 flex items-center gap-1">
              <Zap size={12} className="text-energy-500" />
              Energy / Readiness
            </span>
            <span className="font-mono text-xs font-semibold text-slate-700 dark:text-slate-300">
              {readiness}/100
            </span>
          </div>
          <ReadinessBar score={readiness} />
        </div>
      </motion.div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard
          icon={Footprints}
          label="Steps"
          value={summary.steps || 0}
          color="#22c55e"
          delay={0.2}
        />
        <StatCard
          icon={Flame}
          label="Calories"
          value={summary.calories_burned || 0}
          unit="kcal"
          color="#f97316"
          delay={0.25}
        />
        <StatCard
          icon={Clock}
          label="Active"
          value={summary.active_minutes || 0}
          unit="min"
          color="#3b82f6"
          delay={0.3}
        />
        <StatCard
          icon={Moon}
          label="Sleep"
          value={summary.sleep_hours || 0}
          unit="hrs"
          color="#8b5cf6"
          delay={0.35}
        />
      </div>

      {/* Goal mini bars */}
      <motion.div
        initial={{ y: 12, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="card p-4 mb-4 space-y-3"
      >
        <p className="text-xs font-display font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Progress</p>
        {[
          {
            label: 'Steps',
            val: summary.steps || 0,
            goal: userGoals.daily_step_goal || 8000,
            color: '#22c55e',
          },
          {
            label: 'Active minutes',
            val: summary.active_minutes || 0,
            goal: userGoals.daily_active_min_goal || 30,
            color: '#3b82f6',
          },
        ].map(({ label, val, goal, color }) => {
          const pct = Math.min(100, (val / goal) * 100)
          return (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-600 dark:text-slate-400">{label}</span>
                <span className="font-display font-semibold text-slate-700 dark:text-slate-300">
                  {val.toLocaleString()} / {goal.toLocaleString()}
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Insight Card */}
      {insight.title && (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="card p-4 mb-6 bg-gradient-to-br from-brand-50 to-emerald-50 dark:from-brand-900/20 dark:to-emerald-900/20 border-brand-200 dark:border-brand-800"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl flex-shrink-0">{insight.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-display font-semibold text-sm text-slate-900 dark:text-white">{insight.title}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">{insight.body}</p>
            </div>
            {insight.suggested_workout && (
              <button
                onClick={() => navigate('/workout')}
                className="flex-shrink-0 flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-display font-semibold"
              >
                Start
                <ChevronRight size={14} />
              </button>
            )}
          </div>
        </motion.div>
      )}

      {/* Start Workout FAB */}
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => navigate('/workout')}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-display font-bold text-base shadow-lg shadow-brand-500/30 transition-colors animate-breathe mb-4"
      >
        <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
          <Play size={18} fill="white" className="ml-0.5" />
        </div>
        Start Workout
      </motion.button>

      {/* Today's sessions */}
      {data?.sessions_today?.length > 0 && (
        <motion.div
          initial={{ y: 12, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.55 }}
        >
          <p className="text-xs font-display font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
            Today's sessions
          </p>
          <div className="space-y-2">
            {data.sessions_today.map((s) => (
              <div key={s.id} className="card p-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center text-lg">
                  {s.workout_type === 'Walk' ? '🚶' :
                   s.workout_type === 'Run' ? '🏃' :
                   s.workout_type === 'Strength' ? '💪' :
                   s.workout_type === 'Yoga' ? '🧘' :
                   s.workout_type === 'HIIT' ? '🔥' : '⚡'}
                </div>
                <div className="flex-1">
                  <p className="font-display font-semibold text-sm text-slate-900 dark:text-white">{s.workout_type}</p>
                  <p className="text-xs text-slate-500">{s.duration_min} min · {s.calories_burned} kcal</p>
                </div>
                <span className="text-xs text-brand-600 dark:text-brand-400 font-medium">Done ✓</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
