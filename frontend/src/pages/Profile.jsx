import { useState } from 'react'
import { motion } from 'framer-motion'
import { User, Moon, Sun, LogOut, ChevronRight, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

const GOALS = ['Build strength', 'Lose fat', 'Run farther', 'Daily energy']

function Section({ title, children }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-3">{title}</p>
      <div className="card divide-y divide-slate-100 dark:divide-slate-700/50 overflow-hidden">
        {children}
      </div>
    </div>
  )
}

function RowItem({ icon: Icon, label, value, onClick, danger, color }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left ${danger ? 'text-red-500' : ''}`}
    >
      {Icon && (
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: danger ? '#fef2f2' : (color ? `${color}15` : '#f1f5f9') }}
        >
          <Icon size={16} style={{ color: danger ? '#ef4444' : (color || '#64748b') }} />
        </div>
      )}
      <span className={`flex-1 font-body text-sm ${danger ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}`}>
        {label}
      </span>
      {value && <span className="text-xs text-slate-400 mr-1">{value}</span>}
      <ChevronRight size={16} className="text-slate-300 dark:text-slate-600 flex-shrink-0" />
    </button>
  )
}

function EditProfileModal({ user, onSave, onClose }) {
  const [form, setForm] = useState({
    name: user.name || '',
    age: user.age || '',
    gender: user.gender || '',
    height_cm: user.height_cm || '',
    weight_kg: user.weight_kg || '',
    goal: user.goal || 'Daily energy',
  })
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/profile/', {
        name: form.name,
        age: parseInt(form.age) || undefined,
        gender: form.gender || undefined,
        height_cm: parseFloat(form.height_cm) || undefined,
        weight_kg: parseFloat(form.weight_kg) || undefined,
        goal: form.goal,
      })
      onSave(res.data.user)
      toast.success('Profile updated!')
      onClose()
    } catch (err) {
      const msgs = err.response?.data?.errors || ['Failed to update profile']
      toast.error(msgs[0])
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Edit Profile</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label">Name</label>
            <input className="input" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Age</label>
              <input className="input" type="number" value={form.age} onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))} min="10" max="100" />
            </div>
            <div>
              <label className="label">Gender</label>
              <select className="input" value={form.gender} onChange={(e) => setForm((f) => ({ ...f, gender: e.target.value }))}>
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
              <label className="label">Height (cm)</label>
              <input className="input" type="number" value={form.height_cm} onChange={(e) => setForm((f) => ({ ...f, height_cm: e.target.value }))} min="100" max="250" />
            </div>
            <div>
              <label className="label">Weight (kg)</label>
              <input className="input" type="number" value={form.weight_kg} onChange={(e) => setForm((f) => ({ ...f, weight_kg: e.target.value }))} min="30" max="300" step="0.5" />
            </div>
          </div>
          <div>
            <label className="label">Main Goal</label>
            <select className="input" value={form.goal} onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value }))}>
              {GOALS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-primary w-full mt-6 flex items-center justify-center gap-2"
        >
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={16} /> Save changes</>}
        </button>
      </motion.div>
    </motion.div>
  )
}

function GoalSettingsModal({ user, onSave, onClose }) {
  const [stepGoal, setStepGoal] = useState(user.daily_step_goal || 8000)
  const [activeMinGoal, setActiveMinGoal] = useState(user.daily_active_min_goal || 30)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await api.patch('/profile/', {
        daily_step_goal: parseInt(stepGoal),
        daily_active_min_goal: parseInt(activeMinGoal),
      })
      onSave(res.data.user)
      toast.success('Goals updated!')
      onClose()
    } catch (err) {
      toast.error('Failed to update goals')
    } finally {
      setSaving(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 280, damping: 28 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-t-3xl p-6 pb-10"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">Goal Settings</h3>
          <button onClick={onClose} className="p-2 text-slate-400"><X size={20} /></button>
        </div>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between mb-2">
              <label className="label mb-0">Daily Steps</label>
              <span className="font-display font-bold text-brand-600 text-sm">{parseInt(stepGoal).toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="2000" max="20000" step="500"
              value={stepGoal}
              onChange={(e) => setStepGoal(e.target.value)}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>2,000</span><span>20,000</span>
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <label className="label mb-0">Active Minutes/Day</label>
              <span className="font-display font-bold text-brand-600 text-sm">{activeMinGoal} min</span>
            </div>
            <input
              type="range"
              min="10" max="120" step="5"
              value={activeMinGoal}
              onChange={(e) => setActiveMinGoal(e.target.value)}
              className="w-full accent-brand-500"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>10 min</span><span>120 min</span>
            </div>
          </div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn-primary w-full mt-6 flex items-center justify-center gap-2">
          {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Save goals'}
        </button>
      </motion.div>
    </motion.div>
  )
}

export default function Profile() {
  const { user, updateUser, logout } = useAuth()
  const { dark, toggle: toggleTheme } = useTheme()
  const [showEditProfile, setShowEditProfile] = useState(false)
  const [showGoals, setShowGoals] = useState(false)

  const handleLogout = () => {
    logout()
    toast('Logged out. See you next time! 👋')
  }

  const avatarLetter = (user?.name || user?.email || 'U').charAt(0).toUpperCase()
  const bmi = user?.height_cm && user?.weight_kg
    ? (user.weight_kg / Math.pow(user.height_cm / 100, 2)).toFixed(1)
    : null

  return (
    <div className="page">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-6">Profile</h1>

      {/* Avatar + name */}
      <motion.div
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 mb-6"
      >
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-brand-400 to-emerald-500 flex items-center justify-center shadow-lg shadow-brand-500/20">
          <span className="font-display font-bold text-2xl text-white">{avatarLetter}</span>
        </div>
        <div>
          <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">{user?.name || 'Athlete'}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          {user?.goal && (
            <span className="inline-block mt-1 text-xs bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-lg font-medium">
              {user.goal}
            </span>
          )}
        </div>
      </motion.div>

      {/* Body stats */}
      {(user?.height_cm || user?.weight_kg) && (
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="card p-4 mb-6 grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-700"
        >
          {[
            { label: 'Height', val: user.height_cm ? `${user.height_cm} cm` : '—' },
            { label: 'Weight', val: user.weight_kg ? `${user.weight_kg} kg` : '—' },
            { label: 'BMI', val: bmi || '—' },
          ].map(({ label, val }) => (
            <div key={label} className="text-center px-2">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="font-display font-bold text-slate-900 dark:text-white mt-0.5">{val}</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Profile section */}
      <Section title="Account">
        <RowItem icon={User} label="Edit Profile" color="#22c55e" onClick={() => setShowEditProfile(true)} />
        <RowItem
          icon={dark ? Sun : Moon}
          label={dark ? 'Light mode' : 'Dark mode'}
          color="#8b5cf6"
          onClick={toggleTheme}
        />
      </Section>

      <Section title="Goals & Settings">
        <RowItem
          icon={null}
          label="Daily step goal"
          value={`${(user?.daily_step_goal || 8000).toLocaleString()} steps`}
          onClick={() => setShowGoals(true)}
        />
        <RowItem
          icon={null}
          label="Active minutes/day"
          value={`${user?.daily_active_min_goal || 30} min`}
          onClick={() => setShowGoals(true)}
        />
      </Section>

      <Section title="Session">
        <RowItem
          icon={LogOut}
          label="Sign out"
          danger
          onClick={handleLogout}
        />
      </Section>

      {/* App version */}
      <p className="text-center text-xs text-slate-300 dark:text-slate-600 mt-4">
        FitTracker v1.0.0 — Track smarter. Move better.
      </p>

      {/* Modals */}
      {showEditProfile && (
        <EditProfileModal
          user={user}
          onSave={updateUser}
          onClose={() => setShowEditProfile(false)}
        />
      )}
      {showGoals && (
        <GoalSettingsModal
          user={user}
          onSave={updateUser}
          onClose={() => setShowGoals(false)}
        />
      )}
    </div>
  )
}
