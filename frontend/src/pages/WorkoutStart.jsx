import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import FloatingShapes from '../components/ui/FloatingShapes'

const ACCENTS = ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35', '#7B2FFF']
const BORDERS = ['#FFE600', '#FF3AF2', '#7B2FFF', '#00F5D4', '#FF6B35']
const SHADOWS = [
  '8px 8px 0 #FFE600, 16px 16px 0 #7B2FFF',
  '8px 8px 0 #FF3AF2, 16px 16px 0 #FF6B35',
  '8px 8px 0 #7B2FFF, 16px 16px 0 #FF3AF2',
  '8px 8px 0 #00F5D4, 16px 16px 0 #FFE600',
  '8px 8px 0 #FF6B35, 16px 16px 0 #00F5D4',
  '8px 8px 0 #FFE600, 16px 16px 0 #FF3AF2',
  '8px 8px 0 #FF3AF2, 16px 16px 0 #7B2FFF',
  '8px 8px 0 #7B2FFF, 16px 16px 0 #FF6B35',
]

const QUICK_TYPES = [
  { type: 'Walk', emoji: '🚶', desc: 'Easy pace, low impact' },
  { type: 'Run', emoji: '🏃', desc: 'Cardio boost, burn fat' },
  { type: 'Strength', emoji: '💪', desc: 'Lift, build, grow' },
  { type: 'HIIT', emoji: '🔥', desc: 'High intensity intervals' },
  { type: 'Yoga', emoji: '🧘', desc: 'Flow, stretch, breathe' },
  { type: 'Cycling', emoji: '🚴', desc: 'Pedal your way to fit' },
  { type: 'Swimming', emoji: '🏊', desc: 'Full body, easy joints' },
  { type: 'Custom', emoji: '⚡', desc: 'Define your own session' },
]

export default function WorkoutStart() {
  const navigate = useNavigate()
  const [starting, setStarting] = useState(null)

  const handleStart = async (type) => {
    setStarting(type)
    try {
      const res = await api.post('/workouts/start', { workout_type: type })
      const session = res.data.session
      navigate(`/workout/active/${session.id}`, { state: { session, workout_type: type } })
    } catch {
      toast.error('Could not start session. Please try again.')
      setStarting(null)
    }
  }

  return (
    <div className="page relative">
      <FloatingShapes seed={5} count={6} />

      {/* Header */}
      <div className="flex items-center gap-3 mb-8 relative z-10">
        <button onClick={() => navigate('/')} className="w-11 h-11 rounded-full flex items-center justify-center transition-all hover:scale-110"
          style={{ background: 'rgba(45,27,78,0.8)', border: '4px solid #FF3AF2', boxShadow: '4px 4px 0 #FFE600' }}>
          <ArrowLeft size={18} style={{ color: '#FF3AF2' }} />
        </button>
        <div>
          <h1 className="font-display font-black text-3xl text-white text-shadow-triple leading-tight">START WORKOUT</h1>
          <p className="text-sm font-display font-bold uppercase tracking-widest" style={{ color: '#00F5D4' }}>What are you crushing today?</p>
        </div>
      </div>

      <p className="text-xs font-display font-black uppercase tracking-widest mb-4 relative z-10" style={{ color: '#FFE600', textShadow: '1px 1px 0 #FF3AF2' }}>
        ⚡ QUICK START
      </p>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        {QUICK_TYPES.map((wt, i) => {
          const accent = ACCENTS[i % 5]
          const border = BORDERS[i % 5]
          const shadow = SHADOWS[i % 8]
          const rot = i % 2 === 0 ? 'rotate-1' : '-rotate-1'
          const isStarting = starting === wt.type

          return (
            <motion.button
              key={wt.type}
              initial={{ y: 20, opacity: 0, rotate: i % 2 === 0 ? 3 : -3 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: i * 0.06, type: 'spring' }}
              whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
              whileTap={{ scale: 0.93 }}
              onClick={() => handleStart(wt.type)}
              disabled={!!starting}
              className={`relative overflow-hidden flex flex-col items-start gap-3 text-left disabled:opacity-60 ${rot}`}
              style={{
                background: isStarting ? `${accent}20` : 'rgba(45,27,78,0.85)',
                border: `4px solid ${isStarting ? accent : border}`,
                borderRadius: '20px',
                boxShadow: shadow,
                padding: '18px',
                minHeight: '120px',
                transition: 'all 250ms cubic-bezier(0.68,-0.55,0.265,1.55)',
              }}
            >
              <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`, backgroundSize: '18px 18px' }} />

              {isStarting ? (
                <div className="w-12 h-12 rounded-full flex items-center justify-center relative z-10"
                  style={{ background: `${accent}25`, border: `3px solid ${accent}` }}>
                  <div className="w-5 h-5 rounded-full animate-spin border-2 border-t-transparent" style={{ borderColor: `${accent}40`, borderTopColor: accent }} />
                </div>
              ) : (
                <div className="relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce-subtle"
                  style={{ background: `${accent}20`, border: `3px solid ${accent}` }}>
                  {wt.emoji}
                </div>
              )}

              <div className="relative z-10">
                <p className="font-display font-black text-base text-white" style={{ textShadow: `1px 1px 0 ${border}` }}>{wt.type.toUpperCase()}</p>
                <p className="text-xs font-body leading-snug" style={{ color: `${accent}cc` }}>{wt.desc}</p>
              </div>
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
