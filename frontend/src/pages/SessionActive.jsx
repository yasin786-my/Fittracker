import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import api from '../api/client'

const ACCENTS = ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35', '#7B2FFF']

function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) { intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000) }
    else { clearInterval(intervalRef.current) }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const toggle = () => setRunning((r) => !r)
  const stop = () => { setRunning(false); clearInterval(intervalRef.current) }
  const format = (s) => {
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
    return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  }

  return { elapsed, running, toggle, stop, display: format(elapsed) }
}

function ExerciseRow({ exercise, onUpdateSets, onDelete, sessionId, idx }) {
  const [expanded, setExpanded] = useState(true)
  const [sets, setSets] = useState(exercise.sets?.length ? exercise.sets : [{ reps: '', weight_kg: '', completed: false }])
  const [saving, setSaving] = useState(false)

  const saveSets = useCallback(async (newSets) => {
    setSaving(true)
    try {
      await api.patch(`/workouts/${sessionId}/exercises/${exercise.id}`, { sets: newSets })
      onUpdateSets(exercise.id, newSets)
    } catch {} finally { setSaving(false) }
  }, [sessionId, exercise.id, onUpdateSets])

  const updateSet = (i, field, val) => { const u = sets.map((s, j) => j === i ? { ...s, [field]: val } : s); setSets(u); saveSets(u) }
  const addSet = () => { const last = sets[sets.length-1]||{}; const u = [...sets, { reps: last.reps||'', weight_kg: last.weight_kg||'', completed: false }]; setSets(u); saveSets(u) }
  const removeSet = (i) => { const u = sets.filter((_,j)=>j!==i); setSets(u.length?u:[{reps:'',weight_kg:'',completed:false}]); saveSets(u) }
  const toggleComplete = (i) => { const u = sets.map((s,j)=>j===i?{...s,completed:!s.completed}:s); setSets(u); saveSets(u) }

  const completedCount = sets.filter((s) => s.completed).length
  const accent = ACCENTS[idx % 5]
  const border = ACCENTS[(idx + 1) % 5]

  return (
    <motion.div layout initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ opacity: 0 }}
      className="relative overflow-hidden"
      style={{ background: 'rgba(45,27,78,0.85)', border: `4px solid ${accent}`, borderRadius: '20px', boxShadow: `6px 6px 0 ${border}`, marginBottom: '12px' }}>
      <div className="absolute inset-0 opacity-8" style={{ backgroundImage: `radial-gradient(circle, ${accent} 1px, transparent 1px)`, backgroundSize: '18px 18px', pointerEvents: 'none' }} />
      <div className="relative z-10">
        <div className="flex items-center p-4 gap-3">
          <button onClick={() => setExpanded(e => !e)} className="flex-1 flex items-center gap-3 text-left">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl animate-bounce-subtle"
              style={{ background: `${accent}20`, border: `3px solid ${accent}` }}>💪</div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-black text-sm text-white truncate" style={{ textShadow: `1px 1px 0 ${accent}` }}>{exercise.name.toUpperCase()}</p>
              <p className="text-xs font-display font-bold" style={{ color: border }}>{completedCount}/{sets.length} SETS DONE</p>
            </div>
            {saving && <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${accent}40`, borderTopColor: accent }} />}
            {expanded ? <ChevronUp size={18} style={{ color: accent }} /> : <ChevronDown size={18} style={{ color: accent }} />}
          </button>
          <button onClick={() => onDelete(exercise.id)} className="w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{ background: 'rgba(255,58,242,0.15)', border: '2px solid #FF3AF2' }}>
            <Trash2 size={15} style={{ color: '#FF3AF2' }} />
          </button>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
              <div className="px-4 pb-4 space-y-2">
                <div className="grid grid-cols-[2.5rem_1fr_1fr_2.5rem] gap-2 text-xs font-display font-black uppercase tracking-wider px-1 mb-1"
                  style={{ color: accent }}>
                  <span>SET</span><span>REPS</span><span>KG</span><span></span>
                </div>
                {sets.map((set, i) => (
                  <div key={i} className={`grid grid-cols-[2.5rem_1fr_1fr_2.5rem] gap-2 items-center transition-opacity ${set.completed ? 'opacity-50' : ''}`}>
                    <span className="text-xs font-accent text-center text-2xl" style={{ color: border }}>{i+1}</span>
                    <input className="input py-2 text-sm text-center font-black" type="number" placeholder="10"
                      value={set.reps} onChange={(e) => updateSet(i, 'reps', e.target.value)} min="0" />
                    <input className="input py-2 text-sm text-center font-black" type="number" placeholder="0"
                      value={set.weight_kg} onChange={(e) => updateSet(i, 'weight_kg', e.target.value)} step="0.5" min="0" />
                    <button onClick={() => toggleComplete(i)}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
                      style={set.completed
                        ? { background: accent, border: `2px solid #FFE600`, boxShadow: `3px 3px 0 #FFE600` }
                        : { background: 'rgba(45,27,78,0.5)', border: `2px solid ${accent}40` }}>
                      <Check size={14} style={{ color: set.completed ? '#0D0D1A' : accent }} strokeWidth={3} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2 pt-2">
                  <button onClick={addSet} className="flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-wider px-4 py-2 rounded-full transition-all hover:scale-105"
                    style={{ background: `${accent}20`, border: `2px solid ${accent}`, color: accent }}>
                    <Plus size={13} /> ADD SET
                  </button>
                  {sets.length > 1 && (
                    <button onClick={() => removeSet(sets.length-1)} className="text-xs font-display font-bold px-4 py-2 rounded-full transition-all hover:scale-105"
                      style={{ background: 'rgba(255,58,242,0.1)', border: '2px solid rgba(255,58,242,0.3)', color: '#FF3AF2' }}>
                      REMOVE LAST
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

const COMMON_EXERCISES = [
  'Bench Press','Squat','Deadlift','Pull-Up','Push-Up','Shoulder Press',
  'Bicep Curl','Tricep Extension','Lunge','Plank','Romanian Deadlift',
  'Lat Pulldown','Cable Row','Hip Thrust','Leg Press',
]

function AddExerciseModal({ onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const filtered = COMMON_EXERCISES.filter((e) => e.toLowerCase().includes(query.toLowerCase()))

  const handleAdd = (name) => { onAdd(name); onClose() }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-lg max-h-[75vh] flex flex-col relative overflow-hidden"
        style={{ background: '#0D0D1A', border: '4px solid #00F5D4', borderBottom: 'none', borderRadius: '24px 24px 0 0', boxShadow: '0 -6px 0 #FFE600' }}
        onClick={(e) => e.stopPropagation()}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #00F5D4 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 p-6 pb-4">
          <h3 className="font-display font-black text-xl text-white text-shadow-double mb-4">ADD EXERCISE 💪</h3>
          <input className="input" placeholder="Search or type exercise name..."
            value={query} onChange={(e) => setQuery(e.target.value)} autoFocus />
        </div>
        <div className="relative z-10 overflow-y-auto flex-1 px-6 pb-8 space-y-2 scrollbar-hide">
          {query && !COMMON_EXERCISES.some((e) => e.toLowerCase() === query.toLowerCase()) && (
            <button onClick={() => handleAdd(query)} className="w-full text-left py-3 px-4 rounded-2xl font-display font-black text-sm transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(0,245,212,0.15)', border: '3px solid #00F5D4', color: '#00F5D4' }}>
              + ADD "{query.toUpperCase()}"
            </button>
          )}
          {filtered.map((ex, i) => (
            <button key={ex} onClick={() => handleAdd(ex)}
              className="w-full text-left py-3 px-4 rounded-2xl font-display font-bold text-sm text-white transition-all hover:scale-[1.02]"
              style={{ background: 'rgba(45,27,78,0.6)', border: `2px solid ${ACCENTS[i % 5]}40`, color: ACCENTS[i % 5] }}>
              {ex.toUpperCase()}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function EndModal({ elapsed, workoutType, onConfirm, onCancel }) {
  const [notes, setNotes] = useState('')
  const [ending, setEnding] = useState(false)
  const mins = Math.max(1, Math.floor(elapsed / 60))

  const handleEnd = async () => { setEnding(true); try { await onConfirm(notes) } catch { setEnding(false) } }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(12px)' }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
        transition={{ type: 'spring' }}
        className="w-full max-w-sm relative overflow-hidden"
        style={{ background: '#0D0D1A', border: '4px solid #FF3AF2', borderRadius: '24px', boxShadow: '12px 12px 0 #FFE600, 24px 24px 0 #7B2FFF', padding: '28px' }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #FF3AF2 8px, #FF3AF2 16px)' }} />
        <div className="relative z-10">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3 animate-bounce-subtle">🏁</div>
            <h3 className="font-display font-black text-2xl text-white text-shadow-double mb-1">END {workoutType.toUpperCase()}?</h3>
            <p className="font-display font-bold" style={{ color: '#00F5D4' }}>{mins} MIN · GREAT WORK! 🔥</p>
          </div>
          <div className="mb-5">
            <label className="label">SESSION NOTES (OPTIONAL)</label>
            <textarea className="input resize-none" rows={3} placeholder="How did it feel? Any PRs? 🎯"
              value={notes} onChange={(e) => setNotes(e.target.value)} style={{ borderRadius: '16px' }} />
          </div>
          <div className="flex gap-3">
            <button onClick={onCancel} className="btn-secondary flex-1 text-sm py-3">KEEP GOING</button>
            <button onClick={handleEnd} disabled={ending} className="btn-primary flex-1 text-sm py-3 flex items-center justify-center gap-2">
              {ending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'FINISH 🎉'}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export default function SessionActive() {
  const { sessionId } = useParams()
  const { state } = useLocation()
  const navigate = useNavigate()
  const workoutType = state?.workout_type || 'Workout'
  const isStrength = workoutType === 'Strength'
  const timer = useTimer()
  const [exercises, setExercises] = useState([])
  const [showAddEx, setShowAddEx] = useState(false)
  const [showEnd, setShowEnd] = useState(false)
  const [steps, setSteps] = useState(0)
  const [distance, setDistance] = useState('')

  const feedbackMessages = [
    { at: 60, msg: "Warming up nicely! 🔥" },
    { at: 300, msg: "You're in the zone! Keep going 💪" },
    { at: 600, msg: "10 minutes strong! 🚀" },
    { at: 1200, msg: "20 min milestone! You're crushing it 🏆" },
    { at: 1800, msg: "30 minutes! Elite territory 👑" },
  ]
  const [shownFeedback, setShownFeedback] = useState(new Set())

  useEffect(() => {
    feedbackMessages.forEach(({ at, msg }) => {
      if (timer.elapsed >= at && !shownFeedback.has(at)) {
        toast(msg, { icon: null, duration: 3000 })
        setShownFeedback((s) => new Set([...s, at]))
      }
    })
  }, [timer.elapsed])

  const handleAddExercise = async (name) => {
    try {
      const res = await api.post(`/workouts/${sessionId}/exercises`, { name, order_index: exercises.length, sets: [{ reps: '', weight_kg: '', completed: false }] })
      setExercises((ex) => [...ex, res.data.exercise])
    } catch { toast.error('Failed to add exercise') }
  }

  const handleUpdateSets = (exerciseId, newSets) => {
    setExercises((exs) => exs.map((e) => e.id === exerciseId ? { ...e, sets: newSets } : e))
  }

  const handleDeleteExercise = async (exerciseId) => {
    try {
      await api.delete(`/workouts/${sessionId}/exercises/${exerciseId}`)
      setExercises((exs) => exs.filter((e) => e.id !== exerciseId))
    } catch { toast.error('Failed to delete exercise') }
  }

  const handleEndSession = async (notes) => {
    timer.stop()
    try {
      await api.post(`/workouts/${sessionId}/end`, { notes, steps: steps || 0, distance_km: parseFloat(distance) || 0 })
      confetti({ particleCount: 150, spread: 90, origin: { y: 0.6 }, colors: ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35', '#7B2FFF'] })
      toast.success('AMAZING SESSION! 🎉🔥', { duration: 4000 })
      setTimeout(() => navigate('/'), 1800)
    } catch { toast.error('Failed to save session'); throw new Error('save failed') }
  }

  const typeEmoji = { Walk:'🚶', Run:'🏃', Strength:'💪', HIIT:'🔥', Yoga:'🧘', Cycling:'🚴', Swimming:'🏊', Custom:'⚡' }[workoutType] || '⚡'

  return (
    <div className="min-h-screen flex flex-col pb-6 select-none relative overflow-hidden" style={{ background: '#0D0D1A' }}>
      {/* Global patterns */}
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, rgba(255,58,242,0.06) 1px, transparent 1px)', backgroundSize: '30px 30px', zIndex: 0 }} />
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 14px, rgba(0,245,212,0.02) 14px, rgba(0,245,212,0.02) 28px)', zIndex: 0 }} />
      {/* Ambient glows */}
      <div className="absolute top-0 left-0 right-0 h-48 pointer-events-none" style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(255,58,242,0.15) 0%, transparent 70%)', zIndex: 0 }} />

      {/* Header */}
      <div className="relative z-10 pt-6 px-5 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl animate-bounce-subtle"
            style={{ background: 'rgba(45,27,78,0.8)', border: '3px solid #FF3AF2', boxShadow: '4px 4px 0 #FFE600' }}>
            {typeEmoji}
          </div>
          <div>
            <h1 className="font-display font-black text-xl text-white text-shadow-single leading-tight">{workoutType.toUpperCase()}</h1>
            <p className="text-xs font-display font-bold" style={{ color: timer.running ? '#00F5D4' : '#FFE600' }}>
              {timer.running ? '● RECORDING' : '⏸ PAUSED'}
            </p>
          </div>
        </div>
        <button onClick={() => setShowEnd(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full font-display font-black text-xs uppercase transition-all hover:scale-105"
          style={{ background: 'rgba(255,58,242,0.15)', border: '3px solid #FF3AF2', color: '#FF3AF2', boxShadow: '4px 4px 0 #7B2FFF' }}>
          <Square size={14} /> END
        </button>
      </div>

      {/* Timer */}
      <div className="relative z-10 flex flex-col items-center py-6">
        <motion.div
          key={timer.running ? 'running' : 'paused'}
          animate={{ opacity: [0.8, 1] }}
          transition={{ duration: 0.3 }}
          className="timer-display font-black leading-none text-gradient-max text-shadow-mega"
          style={{ fontSize: '5rem' }}>
          {timer.display}
        </motion.div>
        <p className="text-xs font-display font-bold mt-2" style={{ color: '#7B2FFF' }}>
          {Math.floor(timer.elapsed / 60)} MIN ELAPSED
        </p>

        <motion.button
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={timer.toggle}
          className="mt-5 w-20 h-20 rounded-full flex items-center justify-center transition-all"
          style={timer.running
            ? { background: 'linear-gradient(135deg, #7B2FFF, #FF3AF2)', border: '4px solid #FFE600', boxShadow: '6px 6px 0 #FFE600, 0 0 25px rgba(255,58,242,0.5)' }
            : { background: 'linear-gradient(135deg, #FF3AF2, #7B2FFF, #00F5D4)', border: '4px solid #FFE600', boxShadow: '6px 6px 0 #FFE600, 0 0 30px rgba(255,58,242,0.7)', animation: 'pulse-glow 2s ease-in-out infinite' }
          }>
          {timer.running
            ? <Pause size={30} className="text-white" />
            : <Play size={30} className="text-white ml-1" />
          }
        </motion.button>
      </div>

      {/* Content */}
      <div className="relative z-10 flex-1 px-4 overflow-y-auto scrollbar-hide">
        {!isStrength ? (
          <motion.div initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="space-y-4">
            <p className="text-xs font-display font-black uppercase tracking-widest" style={{ color: '#FFE600', textShadow: '1px 1px 0 #FF3AF2' }}>LOG ACTIVITY ⚡</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'STEPS 👟', val: steps || '', set: (v) => setSteps(parseInt(v)||0), placeholder: '0', accent: '#00F5D4' },
                { label: 'DISTANCE (km) 📍', val: distance, set: setDistance, placeholder: '0.0', accent: '#FF6B35', step: '0.1' },
              ].map(({ label, val, set, placeholder, accent, step }) => (
                <div key={label} className="relative overflow-hidden rounded-2xl p-4"
                  style={{ background: 'rgba(45,27,78,0.85)', border: `4px solid ${accent}`, boxShadow: `6px 6px 0 ${ACCENTS[ACCENTS.indexOf(accent)+1]||'#7B2FFF'}` }}>
                  <label className="label" style={{ color: accent }}>{label}</label>
                  <input className="input text-center text-2xl font-black py-3 mt-1" type="number" placeholder={placeholder}
                    value={val} onChange={(e) => set(e.target.value)} min="0" step={step || '1'} />
                </div>
              ))}
            </div>
            {steps > 0 && timer.elapsed > 0 && (
              <div className="relative overflow-hidden rounded-2xl p-4 text-center"
                style={{ background: 'rgba(45,27,78,0.85)', border: '4px dashed #7B2FFF', boxShadow: '6px 6px 0 #FF3AF2' }}>
                <p className="text-xs font-display font-black uppercase tracking-wider mb-1" style={{ color: '#7B2FFF' }}>EST. PACE</p>
                <p className="font-accent text-3xl text-white" style={{ textShadow: '2px 2px 0 #7B2FFF' }}>
                  {Math.round((timer.elapsed/60) / Math.max(parseFloat(distance)||0.001, 0.001))} min/km
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-xs font-display font-black uppercase tracking-widest" style={{ color: '#FF3AF2', textShadow: '1px 1px 0 #7B2FFF' }}>EXERCISES 💪</p>
              <button onClick={() => setShowAddEx(true)}
                className="flex items-center gap-1.5 text-xs font-display font-black uppercase tracking-wider px-4 py-2 rounded-full transition-all hover:scale-105"
                style={{ background: 'rgba(255,58,242,0.15)', border: '3px solid #FF3AF2', color: '#FF3AF2', boxShadow: '4px 4px 0 #7B2FFF' }}>
                <Plus size={13} /> ADD
              </button>
            </div>
            {exercises.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
                <div className="text-6xl mb-4 animate-bounce-subtle">🏋️</div>
                <p className="font-display font-black text-xl text-white text-shadow-double mb-2">NO EXERCISES YET!</p>
                <p className="font-body text-white/60 mb-6">Add your first exercise to start tracking sets.</p>
                <button onClick={() => setShowAddEx(true)} className="btn-primary text-sm">+ ADD FIRST EXERCISE</button>
              </motion.div>
            ) : (
              <AnimatePresence>
                {exercises.map((ex, i) => (
                  <ExerciseRow key={ex.id} exercise={ex} sessionId={sessionId} onUpdateSets={handleUpdateSets} onDelete={handleDeleteExercise} idx={i} />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>
        {showAddEx && <AddExerciseModal onAdd={handleAddExercise} onClose={() => setShowAddEx(false)} />}
        {showEnd && <EndModal elapsed={timer.elapsed} workoutType={workoutType} onConfirm={handleEndSession} onCancel={() => setShowEnd(false)} />}
      </AnimatePresence>
    </div>
  )
}
