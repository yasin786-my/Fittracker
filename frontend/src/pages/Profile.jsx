import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, ChevronRight, Save, X, Target, Footprints } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import FloatingShapes from '../components/ui/FloatingShapes'

const ACCENTS = ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35', '#7B2FFF']
const GOALS = ['Build strength', 'Lose fat', 'Run farther', 'Daily energy']

function RowItem({ icon: Icon, label, value, onClick, danger, accentColor }) {
  const color = danger ? '#FF3AF2' : (accentColor || '#00F5D4')
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 text-left transition-all hover:scale-[1.01]"
      style={{ borderBottom: '2px solid rgba(255,58,242,0.15)' }}>
      {Icon && (
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}20`, border: `2px solid ${color}` }}>
          <Icon size={16} style={{ color }} strokeWidth={2.5} />
        </div>
      )}
      <span className="flex-1 font-display font-bold text-sm text-white">{label}</span>
      {value && <span className="text-xs font-display font-black mr-2" style={{ color }}>{value}</span>}
      <ChevronRight size={16} style={{ color: `${color}60` }} />
    </button>
  )
}

function MaxModal({ title, onClose, children }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(13,13,26,0.85)', backdropFilter: 'blur(8px)' }}>
      <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto relative"
        style={{ background: '#0D0D1A', border: '4px solid #FF3AF2', borderBottom: 'none', borderRadius: '24px 24px 0 0', boxShadow: '0 -8px 0 #FFE600, 0 -16px 0 #7B2FFF' }}>
        <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #FF3AF2 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="relative z-10 p-6 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-black text-xl text-white text-shadow-double">{title}</h3>
            <button onClick={onClose} className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xl transition-all hover:scale-110"
              style={{ background: '#FF3AF2', color: '#0D0D1A', border: '2px solid #FFE600' }}>×</button>
          </div>
          {children}
        </div>
      </motion.div>
    </motion.div>
  )
}

function EditProfileModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user.name || '', age: user.age || '', gender: user.gender || '',
    height_cm: user.height_cm || '', weight_kg: user.weight_kg || '', goal: user.goal || 'Daily energy',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/profile/', {
        name: form.name, age: parseInt(form.age) || undefined, gender: form.gender || undefined,
        height_cm: parseFloat(form.height_cm) || undefined, weight_kg: parseFloat(form.weight_kg) || undefined, goal: form.goal,
      })
      onSave(res.data.user); toast.success('Profile updated! 🔥'); onClose()
    } catch (err) {
      toast.error((err.response?.data?.errors || ['Failed to update'])[0])
    } finally { setSaving(false) }
  }

  const fields = [
    { label: 'NAME', key: 'name', type: 'text', placeholder: 'Your name', accent: '#FF3AF2' },
    { label: 'AGE', key: 'age', type: 'number', placeholder: '25', accent: '#00F5D4' },
    { label: 'HEIGHT (cm)', key: 'height_cm', type: 'number', placeholder: '175', accent: '#FFE600' },
    { label: 'WEIGHT (kg)', key: 'weight_kg', type: 'number', placeholder: '70', accent: '#FF6B35' },
  ]

  return (
    <MaxModal title="EDIT PROFILE ✨" onClose={onClose}>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {fields.map(({ label, key, type, placeholder, accent }) => (
            <div key={key}>
              <label className="label" style={{ color: accent }}>{label}</label>
              <input className="input text-sm" type={type} placeholder={placeholder}
                value={form[key]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} />
            </div>
          ))}
        </div>
        <div>
          <label className="label" style={{ color: '#7B2FFF' }}>GENDER</label>
          <select className="input" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
            <option value="">Select...</option>
            {['male','female','non-binary','prefer-not-to-say'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="label" style={{ color: '#FF3AF2' }}>MAIN GOAL</label>
          <div className="grid grid-cols-2 gap-2">
            {GOALS.map((g, i) => (
              <button key={g} onClick={() => setForm(f => ({ ...f, goal: g }))}
                className="py-3 px-3 rounded-2xl text-xs font-display font-black uppercase transition-all hover:scale-105"
                style={form.goal === g
                  ? { background: ACCENTS[i % 5], color: '#0D0D1A', border: `3px solid #FFE600`, boxShadow: `4px 4px 0 #7B2FFF` }
                  : { background: 'rgba(45,27,78,0.5)', color: ACCENTS[i % 5], border: `3px solid ${ACCENTS[i % 5]}40` }
                }>{g}</button>
            ))}
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2 mt-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> SAVE CHANGES</>}
        </button>
      </div>
    </MaxModal>
  )
}

function GoalSettingsModal({ user, onSave, onClose }) {
  const [stepGoal, setStepGoal] = useState(user.daily_step_goal || 8000)
  const [activeMinGoal, setActiveMinGoal] = useState(user.daily_active_min_goal || 30)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/profile/', { daily_step_goal: parseInt(stepGoal), daily_active_min_goal: parseInt(activeMinGoal) })
      onSave(res.data.user); toast.success('Goals locked in! 🎯'); onClose()
    } catch { toast.error('Failed to update goals') }
    finally { setSaving(false) }
  }

  return (
    <MaxModal title="GOAL SETTINGS 🎯" onClose={onClose}>
      <div className="space-y-6">
        {[
          { label: 'DAILY STEPS', val: parseInt(stepGoal).toLocaleString(), state: stepGoal, set: setStepGoal, min: 2000, max: 20000, step: 500, accent: '#00F5D4', low: '2,000', high: '20,000' },
          { label: 'ACTIVE MINUTES / DAY', val: `${activeMinGoal} min`, state: activeMinGoal, set: setActiveMinGoal, min: 10, max: 120, step: 5, accent: '#FF6B35', low: '10 min', high: '120 min' },
        ].map(({ label, val, state, set, min, max, step, accent, low, high }) => (
          <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(45,27,78,0.6)', border: `3px solid ${accent}` }}>
            <div className="flex justify-between items-center mb-3">
              <label className="label mb-0" style={{ color: accent }}>{label}</label>
              <span className="font-accent text-xl" style={{ color: accent, textShadow: `1px 1px 0 #0D0D1A` }}>{val}</span>
            </div>
            <input type="range" min={min} max={max} step={step} value={state}
              onChange={(e) => set(e.target.value)} className="w-full" />
            <div className="flex justify-between text-xs font-display font-bold mt-1" style={{ color: `${accent}80` }}>
              <span>{low}</span><span>{high}</span>
            </div>
          </div>
        ))}
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'SAVE GOALS 🎯'}
        </button>
      </div>
    </MaxModal>
  )
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showGoals, setShowGoals] = useState(false)

  const handleLogout = () => { logout(); toast('Logged out. See you next time! 👋') }
  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase()
  const bmi = user?.height_cm && user?.weight_kg
    ? (user.weight_kg / Math.pow(user.height_cm / 100, 2)).toFixed(1) : null

  const STAT_ITEMS = [
    { label: 'HEIGHT', val: user?.height_cm ? `${user.height_cm} cm` : '—', accent: '#FF3AF2', shadow: '#7B2FFF' },
    { label: 'WEIGHT', val: user?.weight_kg ? `${user.weight_kg} kg` : '—', accent: '#00F5D4', shadow: '#FF3AF2' },
    { label: 'BMI', val: bmi || '—', accent: '#FFE600', shadow: '#FF6B35' },
  ]

  return (
    <div className="page relative">
      <FloatingShapes seed={4} count={5} />

      <h1 className="font-display font-black text-4xl text-white text-shadow-triple mb-6 relative z-10">PROFILE 🧑‍💪</h1>

      {/* Avatar + name */}
      <motion.div initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-5 mb-6 relative z-10">
        <div className="relative">
          <div className="w-20 h-20 rounded-full flex items-center justify-center animate-pulse-glow"
            style={{
              background: 'linear-gradient(135deg, #FF3AF2, #7B2FFF, #00F5D4, #FFE600)',
              border: '4px solid #FFE600',
              boxShadow: '6px 6px 0 #FF3AF2, 0 0 30px rgba(255,58,242,0.5)',
              backgroundSize: '200% 200%',
            }}>
            <span className="font-accent text-3xl text-white" style={{ textShadow: '2px 2px 0 #0D0D1A' }}>{avatarLetter}</span>
          </div>
          <span className="absolute -bottom-1 -right-1 text-xl animate-wiggle">⚡</span>
        </div>
        <div>
          <h2 className="font-display font-black text-2xl text-white text-shadow-double leading-tight">{user?.name || 'ATHLETE'}</h2>
          <p className="text-sm font-body mt-0.5" style={{ color: '#00F5D4' }}>{user?.email}</p>
          {user?.goal && (
            <span className="inline-block mt-2 text-xs font-display font-black uppercase tracking-wider px-3 py-1 rounded-full"
              style={{ background: '#FF3AF2', color: '#0D0D1A', border: '2px solid #FFE600', boxShadow: '3px 3px 0 #7B2FFF' }}>
              {user.goal}
            </span>
          )}
        </div>
      </motion.div>

      {/* Body stats */}
      {(user?.height_cm || user?.weight_kg) && (
        <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="relative overflow-hidden mb-6 relative z-10 grid grid-cols-3"
          style={{ background: 'rgba(45,27,78,0.85)', border: '4px solid #7B2FFF', borderRadius: '20px', boxShadow: '8px 8px 0 #FF3AF2' }}>
          {STAT_ITEMS.map(({ label, val, accent, shadow }, i) => (
            <div key={label} className="text-center py-5 px-2" style={{ borderRight: i < 2 ? `2px solid rgba(255,58,242,0.2)` : 'none' }}>
              <p className="text-xs font-display font-black uppercase tracking-wider mb-1" style={{ color: accent }}>{label}</p>
              <p className="font-accent text-xl text-white" style={{ textShadow: `2px 2px 0 ${shadow}` }}>{val}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Account section */}
      {[
        {
          title: 'ACCOUNT 👤', accent: '#FF3AF2', border: '#FFE600', shadow: '8px 8px 0 #7B2FFF',
          rows: [
            { icon: User, label: 'Edit Profile', value: null, onClick: () => setShowEditProfile(true), accentColor: '#FF3AF2' },
          ]
        },
        {
          title: 'GOALS & SETTINGS 🎯', accent: '#00F5D4', border: '#FF3AF2', shadow: '8px 8px 0 #FF6B35',
          rows: [
            { icon: Footprints, label: 'Daily step goal', value: `${(user?.daily_step_goal || 8000).toLocaleString()} steps`, onClick: () => setShowGoals(true), accentColor: '#00F5D4' },
            { icon: Target, label: 'Active minutes/day', value: `${user?.daily_active_min_goal || 30} min`, onClick: () => setShowGoals(true), accentColor: '#FFE600' },
          ]
        },
        {
          title: 'SESSION 🔒', accent: '#FF6B35', border: '#7B2FFF', shadow: '8px 8px 0 #FF3AF2',
          rows: [
            { icon: LogOut, label: 'Sign out', value: null, onClick: handleLogout, danger: true, accentColor: '#FF3AF2' },
          ]
        }
      ].map(({ title, accent, border, shadow, rows }, sIdx) => (
        <motion.div key={title} initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 + sIdx * 0.1 }}
          className="mb-5 relative z-10">
          <p className="text-xs font-display font-black uppercase tracking-widest mb-3" style={{ color: accent, textShadow: `1px 1px 0 ${border}` }}>{title}</p>
          <div className="relative overflow-hidden"
            style={{ background: 'rgba(45,27,78,0.85)', border: `4px solid ${border}`, borderRadius: '20px', boxShadow: shadow }}>
            {rows.map((row, i) => (
              <RowItem key={i} {...row} />
            ))}
          </div>
        </motion.div>
      ))}

      <p className="text-center text-xs font-display font-bold mt-6 relative z-10" style={{ color: 'rgba(255,58,242,0.4)' }}>
        FITTRACKER v1.0.0 — CRUSH YOUR GOALS 🔥
      </p>

      <AnimatePresence>
        {showEditProfile && <EditProfileModal user={user} onSave={updateUser} onClose={() => setShowEditProfile(false)} />}
        {showGoals && <GoalSettingsModal user={user} onSave={updateUser} onClose={() => setShowGoals(false)} />}
      </AnimatePresence>
    </div>
  )
}
