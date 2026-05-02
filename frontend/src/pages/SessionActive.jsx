import { useState, useEffect, useRef, useCallback } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Pause, Square, Plus, Trash2, ChevronDown, ChevronUp, Check } from 'lucide-react'
import toast from 'react-hot-toast'
import confetti from 'canvas-confetti'
import api from '../api/client'

// ---- Timer ----
function useTimer() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed((e) => e + 1), 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const toggle = () => setRunning((r) => !r)
  const stop = () => { setRunning(false); clearInterval(intervalRef.current) }

  const format = (s) => {
    const h = Math.floor(s / 3600)
    const m = Math.floor((s % 3600) / 60)
    const sec = s % 60
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
  }

  return { elapsed, running, toggle, stop, display: format(elapsed) }
}

// ---- Exercise Row ----
function ExerciseRow({ exercise, onUpdateSets, onDelete, sessionId }) {
  const [expanded, setExpanded] = useState(true)
  const [sets, setSets] = useState(exercise.sets?.length ? exercise.sets : [{ reps: '', weight_kg: '', completed: false }])
  const [saving, setSaving] = useState(false)

  const saveSets = useCallback(async (newSets) => {
    setSaving(true)
    try {
      await api.patch(`/workouts/${sessionId}/exercises/${exercise.id}`, { sets: newSets })
      onUpdateSets(exercise.id, newSets)
    } catch {
      // silent
    } finally {
      setSaving(false)
    }
  }, [sessionId, exercise.id, onUpdateSets])

  const updateSet = (idx, field, val) => {
    const updated = sets.map((s, i) => i === idx ? { ...s, [field]: val } : s)
    setSets(updated)
    saveSets(updated)
  }

  const addSet = () => {
    const last = sets[sets.length - 1] || {}
    const newSet = { reps: last.reps || '', weight_kg: last.weight_kg || '', completed: false }
    const updated = [...sets, newSet]
    setSets(updated)
    saveSets(updated)
  }

  const removeSet = (idx) => {
    const updated = sets.filter((_, i) => i !== idx)
    setSets(updated.length ? updated : [{ reps: '', weight_kg: '', completed: false }])
    saveSets(updated)
  }

  const toggleComplete = (idx) => {
    const updated = sets.map((s, i) => i === idx ? { ...s, completed: !s.completed } : s)
    setSets(updated)
    saveSets(updated)
  }

  const completedCount = sets.filter((s) => s.completed).length

  return (
    <motion.div
      layout
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ opacity: 0, height: 0 }}
      className="card overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center p-3 gap-2">
        <button onClick={() => setExpanded((e) => !e)} className="flex-1 flex items-center gap-2 text-left">
          <div className="w-7 h-7 rounded-lg bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center">
            💪
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-sm text-slate-900 dark:text-white truncate">{exercise.name}</p>
            <p className="text-xs text-slate-500">{completedCount}/{sets.length} sets done</p>
          </div>
          {saving && <div className="w-3 h-3 border border-brand-500 border-t-transparent rounded-full animate-spin" />}
          {expanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
        </button>
        <button onClick={() => onDelete(exercise.id)} className="p-1.5 text-slate-400 hover:text-red-500 transition-colors">
          <Trash2 size={15} />
        </button>
      </div>

      {/* Sets */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-2">
              {/* Column headers */}
              <div className="grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 text-xs text-slate-400 font-medium px-1">
                <span>Set</span>
                <span>Reps</span>
                <span>kg</span>
                <span></span>
              </div>
              {sets.map((set, idx) => (
                <div key={idx} className={`grid grid-cols-[2rem_1fr_1fr_2rem] gap-2 items-center transition-opacity ${set.completed ? 'opacity-60' : ''}`}>
                  <span className="text-xs font-display font-bold text-center text-slate-500 dark:text-slate-400">{idx + 1}</span>
                  <input
                    className="input py-2 text-sm text-center"
                    type="number"
                    placeholder="10"
                    value={set.reps}
                    onChange={(e) => updateSet(idx, 'reps', e.target.value)}
                    min="0"
                  />
                  <input
                    className="input py-2 text-sm text-center"
                    type="number"
                    placeholder="0"
                    value={set.weight_kg}
                    onChange={(e) => updateSet(idx, 'weight_kg', e.target.value)}
                    step="0.5"
                    min="0"
                  />
                  <button
                    onClick={() => toggleComplete(idx)}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${
                      set.completed
                        ? 'bg-brand-500 text-white'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                    }`}
                  >
                    <Check size={13} />
                  </button>
                </div>
              ))}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={addSet}
                  className="flex items-center gap-1.5 text-xs text-brand-600 dark:text-brand-400 font-display font-medium px-3 py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/30 hover:bg-brand-100 dark:hover:bg-brand-900/50 transition-colors"
                >
                  <Plus size={13} />
                  Add set
                </button>
                {sets.length > 1 && (
                  <button
                    onClick={() => removeSet(sets.length - 1)}
                    className="text-xs text-slate-400 hover:text-red-500 font-medium px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Remove last
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

// ---- Add Exercise Modal ----
const COMMON_EXERCISES = [
  'Bench Press', 'Squat', 'Deadlift', 'Pull-Up', 'Push-Up',
  'Shoulder Press', 'Bicep Curl', 'Tricep Extension', 'Lunge', 'Plank',
  'Romanian Deadlift', 'Lat Pulldown', 'Cable Row', 'Hip Thrust', 'Leg Press',
]

function AddExerciseModal({ onAdd, onClose }) {
  const [query, setQuery] = useState('')
  const filtered = COMMON_EXERCISES.filter((e) =>
    e.toLowerCase().includes(query.toLowerCase())
  )

  const handleAdd = (name) => {
    onAdd(name)
    onClose()
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl p-6 max-h-[75vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white mb-4">Add Exercise</h3>
        <input
          className="input mb-3"
          placeholder="Search or type exercise name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
        />
        <div className="overflow-y-auto flex-1 space-y-1.5 scrollbar-hide">
          {query && !COMMON_EXERCISES.some((e) => e.toLowerCase() === query.toLowerCase()) && (
            <button
              onClick={() => handleAdd(query)}
              className="w-full text-left p-3 rounded-xl bg-brand-50 dark:bg-brand-900/30 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 font-display font-medium text-sm"
            >
              + Add "{query}"
            </button>
          )}
          {filtered.map((ex) => (
            <button
              key={ex}
              onClick={() => handleAdd(ex)}
              className="w-full text-left p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-body text-sm transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---- End Session Modal ----
function EndModal({ sessionId, elapsed, workoutType, onConfirm, onCancel }) {
  const [notes, setNotes] = useState('')
  const [ending, setEnding] = useState(false)

  const handleEnd = async () => {
    setEnding(true)
    try {
      await onConfirm(notes)
    } catch {
      setEnding(false)
    }
  }

  const mins = Math.max(1, Math.floor(elapsed / 60))

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.85, opacity: 0 }}
        className="w-full max-w-sm card p-6"
      >
        <div className="text-center mb-5">
          <div className="text-4xl mb-2">🏁</div>
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">End {workoutType}?</h3>
          <p className="text-slate-500 text-sm mt-1">{mins} min · great work!</p>
        </div>

        <div className="mb-4">
          <label className="label">Session notes (optional)</label>
          <textarea
            className="input resize-none"
            rows={3}
            placeholder="How did it feel? Any PRs? 🎯"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="flex gap-3">
          <button onClick={onCancel} className="btn-secondary flex-1">Keep going</button>
          <button
            onClick={handleEnd}
            disabled={ending}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {ending ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : 'Finish 🎉'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

// ---- Main ----
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

  // Cardio state
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
      const res = await api.post(`/workouts/${sessionId}/exercises`, {
        name,
        order_index: exercises.length,
        sets: [{ reps: '', weight_kg: '', completed: false }],
      })
      setExercises((ex) => [...ex, res.data.exercise])
    } catch {
      toast.error('Failed to add exercise')
    }
  }

  const handleUpdateSets = (exerciseId, newSets) => {
    setExercises((exs) => exs.map((e) => e.id === exerciseId ? { ...e, sets: newSets } : e))
  }

  const handleDeleteExercise = async (exerciseId) => {
    try {
      await api.delete(`/workouts/${sessionId}/exercises/${exerciseId}`)
      setExercises((exs) => exs.filter((e) => e.id !== exerciseId))
    } catch {
      toast.error('Failed to delete exercise')
    }
  }

  const handleEndSession = async (notes) => {
    timer.stop()
    try {
      await api.post(`/workouts/${sessionId}/end`, {
        notes,
        steps: steps || 0,
        distance_km: parseFloat(distance) || 0,
      })

      // Confetti!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#86efac', '#f97316', '#fbbf24', '#3b82f6'],
      })

      toast.success('Great session! 🎉', { duration: 4000 })
      setTimeout(() => navigate('/'), 1800)
    } catch {
      toast.error('Failed to save session')
      throw new Error('save failed')
    }
  }

  const typeEmoji = {
    Walk: '🚶', Run: '🏃', Strength: '💪', HIIT: '🔥',
    Yoga: '🧘', Cycling: '🚴', Swimming: '🏊', Custom: '⚡',
  }[workoutType] || '⚡'

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col pb-6 select-none">
      {/* Header */}
      <div className="pt-safe px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{typeEmoji}</span>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-tight">{workoutType}</h1>
            <p className="text-slate-400 text-xs">
              {timer.running ? '● Recording' : '⏸ Paused'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowEnd(true)}
          className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-display font-medium text-sm hover:bg-slate-700 transition-colors flex items-center gap-1.5"
        >
          <Square size={14} />
          End
        </button>
      </div>

      {/* Timer */}
      <div className="flex flex-col items-center py-6">
        <motion.div
          key={timer.running ? 'running' : 'paused'}
          animate={{ opacity: [0.7, 1] }}
          transition={{ duration: 0.3 }}
          className="timer-display text-7xl font-bold text-white mb-2"
        >
          {timer.display}
        </motion.div>
        <p className="text-slate-500 text-xs">
          {Math.floor(timer.elapsed / 60)} min elapsed
        </p>

        {/* Play/Pause */}
        <motion.button
          whileTap={{ scale: 0.92 }}
          onClick={timer.toggle}
          className={`mt-5 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all ${
            timer.running
              ? 'bg-slate-700 hover:bg-slate-600'
              : 'bg-brand-500 hover:bg-brand-600 animate-breathe'
          }`}
        >
          {timer.running
            ? <Pause size={26} className="text-white" />
            : <Play size={26} className="text-white ml-1" />
          }
        </motion.button>
      </div>

      {/* Cardio stats / Strength exercises */}
      <div className="flex-1 px-4 overflow-y-auto scrollbar-hide">
        {!isStrength ? (
          // Cardio inputs
          <motion.div
            initial={{ y: 16, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-3"
          >
            <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Log Activity
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1">Steps</label>
                <input
                  className="input bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-center text-xl font-display"
                  type="number"
                  placeholder="0"
                  value={steps || ''}
                  onChange={(e) => setSteps(parseInt(e.target.value) || 0)}
                  min="0"
                />
              </div>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1">Distance (km)</label>
                <input
                  className="input bg-slate-800 border-slate-700 text-white placeholder:text-slate-600 text-center text-xl font-display"
                  type="number"
                  placeholder="0.0"
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  step="0.1"
                  min="0"
                />
              </div>
            </div>

            {/* Estimated pace */}
            {steps > 0 && timer.elapsed > 0 && (
              <div className="card bg-slate-800 border-slate-700 p-3 text-center">
                <p className="text-slate-400 text-xs">Est. Pace</p>
                <p className="font-display font-bold text-white text-xl">
                  {Math.round((timer.elapsed / 60) / Math.max(parseFloat(distance) || 0.001, 0.001))} min/km
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          // Strength exercises
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider">
                Exercises
              </p>
              <button
                onClick={() => setShowAddEx(true)}
                className="flex items-center gap-1.5 text-xs text-brand-400 font-display font-semibold px-3 py-1.5 rounded-lg bg-brand-500/10 hover:bg-brand-500/20 transition-colors"
              >
                <Plus size={13} />
                Add
              </button>
            </div>

            {exercises.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="text-4xl mb-3">🏋️</div>
                <p className="text-slate-500 font-body">No exercises yet.</p>
                <button
                  onClick={() => setShowAddEx(true)}
                  className="mt-4 btn-primary text-sm py-2"
                >
                  + Add first exercise
                </button>
              </motion.div>
            ) : (
              <AnimatePresence>
                {exercises.map((ex) => (
                  <ExerciseRow
                    key={ex.id}
                    exercise={ex}
                    sessionId={sessionId}
                    onUpdateSets={handleUpdateSets}
                    onDelete={handleDeleteExercise}
                  />
                ))}
              </AnimatePresence>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <AnimatePresence>
        {showAddEx && (
          <AddExerciseModal
            onAdd={handleAddExercise}
            onClose={() => setShowAddEx(false)}
          />
        )}
        {showEnd && (
          <EndModal
            sessionId={sessionId}
            elapsed={timer.elapsed}
            workoutType={workoutType}
            onConfirm={handleEndSession}
            onCancel={() => setShowEnd(false)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
