import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'

const QUICK_TYPES = [
  { type: 'Walk', emoji: '🚶', desc: 'Easy pace, low impact', color: '#22c55e', bgLight: '#f0fdf4', bgDark: 'rgba(34,197,94,0.15)' },
  { type: 'Run', emoji: '🏃', desc: 'Cardio boost, burn fat', color: '#3b82f6', bgLight: '#eff6ff', bgDark: 'rgba(59,130,246,0.15)' },
  { type: 'Strength', emoji: '💪', desc: 'Lift, build, grow', color: '#f97316', bgLight: '#fff7ed', bgDark: 'rgba(249,115,22,0.15)' },
  { type: 'HIIT', emoji: '🔥', desc: 'High intensity intervals', color: '#ef4444', bgLight: '#fef2f2', bgDark: 'rgba(239,68,68,0.15)' },
  { type: 'Yoga', emoji: '🧘', desc: 'Flow, stretch, breathe', color: '#8b5cf6', bgLight: '#f5f3ff', bgDark: 'rgba(139,92,246,0.15)' },
  { type: 'Cycling', emoji: '🚴', desc: 'Pedal your way to fit', color: '#0ea5e9', bgLight: '#f0f9ff', bgDark: 'rgba(14,165,233,0.15)' },
  { type: 'Swimming', emoji: '🏊', desc: 'Full body, easy joints', color: '#06b6d4', bgLight: '#ecfeff', bgDark: 'rgba(6,182,212,0.15)' },
  { type: 'Custom', emoji: '⚡', desc: 'Define your own session', color: '#94a3b8', bgLight: '#f8fafc', bgDark: 'rgba(148,163,184,0.15)' },
]

export default function WorkoutStart() {
  const navigate = useNavigate()
  const [starting, setStarting] = useState(null)
  const isDark = document.documentElement.classList.contains('dark')

  const handleStart = async (type) => {
    setStarting(type)
    try {
      const res = await api.post('/workouts/start', { workout_type: type })
      const session = res.data.session
      navigate(`/workout/active/${session.id}`, {
        state: { session, workout_type: type },
      })
    } catch {
      toast.error('Could not start session. Please try again.')
      setStarting(null)
    }
  }

  return (
    <div className="page">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/')}
          className="btn-ghost p-2 -ml-2"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Start Workout</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">What are you doing today?</p>
        </div>
      </div>

      {/* Quick types grid */}
      <p className="text-xs font-display font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
        Quick Start
      </p>
      <div className="grid grid-cols-2 gap-3">
        {QUICK_TYPES.map((wt, i) => (
          <motion.button
            key={wt.type}
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: i * 0.05 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => handleStart(wt.type)}
            disabled={!!starting}
            className="card p-4 flex flex-col items-start gap-2 text-left hover:shadow-md transition-all duration-150 active:scale-95 disabled:opacity-60"
            style={{
              borderColor: starting === wt.type ? wt.color : undefined,
              backgroundColor: starting === wt.type
                ? (isDark ? wt.bgDark : wt.bgLight)
                : undefined,
            }}
          >
            {starting === wt.type ? (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: isDark ? wt.bgDark : wt.bgLight }}
              >
                <div
                  className="w-5 h-5 border-2 border-t-transparent rounded-full animate-spin"
                  style={{ borderColor: `${wt.color}40`, borderTopColor: wt.color }}
                />
              </div>
            ) : (
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                style={{ backgroundColor: isDark ? wt.bgDark : wt.bgLight }}
              >
                {wt.emoji}
              </div>
            )}
            <div>
              <p className="font-display font-semibold text-sm text-slate-900 dark:text-white">{wt.type}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-snug">{wt.desc}</p>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  )
}
