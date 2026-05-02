import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, TrendingUp, Flame, Award } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar,
} from 'recharts'
import toast from 'react-hot-toast'
import api from '../api/client'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

function CalendarDay({ day, onClick, selected }) {
  const statusColors = {
    met: 'bg-brand-500',
    partial: 'bg-energy-400',
    missed: 'bg-slate-200 dark:bg-slate-700',
    future: 'bg-transparent',
  }

  const isToday = day.date === new Date().toISOString().split('T')[0]

  return (
    <button
      onClick={() => day.status !== 'future' && onClick(day)}
      className={`aspect-square flex items-center justify-center rounded-xl text-xs font-display font-semibold relative
        transition-all duration-150 active:scale-90
        ${selected ? 'ring-2 ring-offset-1 ring-brand-500 dark:ring-offset-slate-900' : ''}
        ${day.status === 'future' ? 'opacity-30 cursor-default' : 'cursor-pointer hover:opacity-80'}
      `}
    >
      <div
        className={`absolute inset-1 rounded-lg ${statusColors[day.status] || ''} transition-all`}
        style={{ opacity: day.status === 'missed' ? 0.4 : 1 }}
      />
      <span
        className={`relative z-10 ${
          day.status === 'met'
            ? 'text-white'
            : day.status === 'partial'
            ? 'text-white'
            : 'text-slate-600 dark:text-slate-400'
        } ${isToday ? 'underline' : ''}`}
      >
        {day.day}
      </span>
      {day.sessions_count > 0 && day.status !== 'met' && (
        <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-400" />
      )}
    </button>
  )
}

function DayDetail({ dayData, onClose }) {
  if (!dayData) return null
  const { date, summary, sessions, comparison } = dayData

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="card p-4 mt-3"
    >
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-display font-bold text-slate-900 dark:text-white">
          {format(parseISO(date), 'EEEE, MMM d')}
        </h3>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg leading-none">×</button>
      </div>

      {summary ? (
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { label: 'Steps', val: summary.steps?.toLocaleString() || '0' },
            { label: 'Active min', val: `${summary.active_minutes || 0} min` },
            { label: 'Calories', val: `${summary.calories_burned || 0} kcal` },
            { label: 'Sleep', val: `${summary.sleep_hours || 0} hrs` },
          ].map(({ label, val }) => (
            <div key={label} className="bg-slate-50 dark:bg-slate-800 rounded-xl p-2.5">
              <p className="text-xs text-slate-500">{label}</p>
              <p className="font-display font-bold text-sm text-slate-900 dark:text-white">{val}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-slate-400 text-sm mb-3">No data recorded this day.</p>
      )}

      {sessions?.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-display font-semibold text-slate-500 uppercase tracking-wider">Sessions</p>
          {sessions.map((s) => (
            <div key={s.id} className="flex items-center gap-2 p-2 rounded-xl bg-slate-50 dark:bg-slate-800">
              <span className="text-base">
                {s.workout_type === 'Walk' ? '🚶' : s.workout_type === 'Run' ? '🏃' :
                 s.workout_type === 'Strength' ? '💪' : s.workout_type === 'HIIT' ? '🔥' : '⚡'}
              </span>
              <div className="flex-1">
                <p className="font-display font-medium text-xs text-slate-900 dark:text-white">{s.workout_type}</p>
                <p className="text-xs text-slate-500">{s.duration_min} min · {s.calories_burned} kcal</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {comparison?.last_week_summary && summary && (
        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
          <p className="text-xs text-slate-500">vs last week</p>
          <p className="text-sm font-display font-semibold mt-1">
            {summary.steps > comparison.last_week_summary.steps
              ? <span className="text-brand-600">▲ {(summary.steps - comparison.last_week_summary.steps).toLocaleString()} more steps</span>
              : <span className="text-energy-500">▼ {(comparison.last_week_summary.steps - summary.steps).toLocaleString()} fewer steps</span>
            }
          </p>
        </div>
      )}
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="card px-3 py-2 text-xs shadow-lg">
        <p className="text-slate-500 mb-0.5">{label}</p>
        <p className="font-display font-bold text-slate-900 dark:text-white">
          {payload[0].value?.toLocaleString()} {payload[0].unit || ''}
        </p>
      </div>
    )
  }
  return null
}

export default function History() {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth() + 1)
  const [calendarDays, setCalendarDays] = useState([])
  const [trends, setTrends] = useState(null)
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 })
  const [selectedDay, setSelectedDay] = useState(null)
  const [dayDetail, setDayDetail] = useState(null)
  const [prs, setPrs] = useState([])
  const [activeTab, setActiveTab] = useState('calendar') // calendar | trends | prs
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadCalendar()
  }, [year, month])

  useEffect(() => {
    loadTrends()
    loadStreak()
    loadPrs()
  }, [])

  const loadCalendar = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/progress/calendar?year=${year}&month=${month}`)
      setCalendarDays(res.data.days)
    } catch {
      toast.error('Failed to load calendar')
    } finally {
      setLoading(false)
    }
  }

  const loadTrends = async () => {
    try {
      const res = await api.get('/progress/trends?days=30')
      setTrends(res.data)
    } catch { /* silent */ }
  }

  const loadStreak = async () => {
    try {
      const res = await api.get('/progress/streak')
      setStreak(res.data)
    } catch { /* silent */ }
  }

  const loadPrs = async () => {
    try {
      const res = await api.get('/progress/strength-prs')
      setPrs(res.data.prs || [])
    } catch { /* silent */ }
  }

  const handleDayClick = async (day) => {
    setSelectedDay(day.date)
    try {
      const res = await api.get(`/progress/day/${day.date}`)
      setDayDetail(res.data)
    } catch {
      setDayDetail({ date: day.date, summary: day.summary, sessions: [] })
    }
  }

  const navigateMonth = (dir) => {
    let m = month + dir
    let y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setMonth(m)
    setYear(y)
    setSelectedDay(null)
    setDayDetail(null)
  }

  // First day of month for calendar offset
  const firstDayOfWeek = calendarDays.length > 0
    ? new Date(year, month - 1, 1).getDay()
    : 0

  const trendSteps = trends?.steps?.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  })) || []

  const trendActiveMin = trends?.active_minutes?.map((d) => ({
    ...d,
    date: format(parseISO(d.date), 'MMM d'),
  })) || []

  return (
    <div className="page">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white mb-5">History</h1>

      {/* Streak badges */}
      <div className="flex gap-3 mb-5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex-1 card p-3 flex items-center gap-2"
        >
          <span className="text-2xl animate-flame">🔥</span>
          <div>
            <p className="text-xs text-slate-500">Current streak</p>
            <p className="font-display font-bold text-lg text-slate-900 dark:text-white">{streak.current_streak} days</p>
          </div>
        </motion.div>
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex-1 card p-3 flex items-center gap-2"
        >
          <Award size={22} className="text-energy-500" />
          <div>
            <p className="text-xs text-slate-500">Best streak</p>
            <p className="font-display font-bold text-lg text-slate-900 dark:text-white">{streak.longest_streak} days</p>
          </div>
        </motion.div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 rounded-2xl p-1 mb-5">
        {[
          { id: 'calendar', label: 'Calendar' },
          { id: 'trends', label: 'Trends' },
          { id: 'prs', label: 'PRs' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 rounded-xl text-sm font-display font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Month navigator */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => navigateMonth(-1)} className="btn-ghost p-2">
              <ChevronLeft size={18} />
            </button>
            <h2 className="font-display font-bold text-slate-900 dark:text-white">
              {MONTHS[month - 1]} {year}
            </h2>
            <button
              onClick={() => navigateMonth(1)}
              disabled={year === today.getFullYear() && month === today.getMonth() + 1}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Legend */}
          <div className="flex gap-3 mb-3 text-xs text-slate-500">
            {[
              { color: 'bg-brand-500', label: 'Goal met' },
              { color: 'bg-energy-400', label: 'Partial' },
              { color: 'bg-slate-200 dark:bg-slate-700', label: 'Missed' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded ${color}`} />
                {label}
              </div>
            ))}
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-center text-xs font-display font-semibold text-slate-400 py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {/* Empty cells for first day offset */}
              {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}
              {calendarDays.map((day) => (
                <CalendarDay
                  key={day.date}
                  day={day}
                  selected={selectedDay === day.date}
                  onClick={handleDayClick}
                />
              ))}
            </div>
          )}

          {/* Day detail */}
          <AnimatePresence>
            {dayDetail && (
              <DayDetail
                dayData={dayDetail}
                onClose={() => { setSelectedDay(null); setDayDetail(null) }}
              />
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5">
          {/* Steps chart */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp size={16} className="text-brand-500" />
              <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white">Daily Steps (30 days)</h3>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={trendSteps}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  activeDot={{ r: 4, fill: '#22c55e' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Active minutes chart */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <Flame size={16} className="text-energy-500" />
              <h3 className="font-display font-semibold text-sm text-slate-900 dark:text-white">Active Minutes (30 days)</h3>
            </div>
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={trendActiveMin}>
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: '#94a3b8' }}
                  tickLine={false}
                  axisLine={false}
                  interval={4}
                />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="value" fill="#f97316" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {/* PRs Tab */}
      {activeTab === 'prs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {prs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-5xl mb-3">🏆</div>
              <p className="text-slate-500 font-body">No PRs yet.</p>
              <p className="text-slate-400 text-sm mt-1">Complete strength sessions to track your records.</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-display font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Personal Records — Max Weight
              </p>
              {/* Bar chart */}
              <div className="card p-4 mb-4">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={prs.slice(0, 8)} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 10, fill: '#94a3b8' }}
                      width={100}
                      tickLine={false}
                      axisLine={false}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="max_weight" fill="#f97316" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {prs.map((pr) => (
                <div key={pr.name} className="card p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-energy-500/10 flex items-center justify-center">
                    <Award size={18} className="text-energy-500" />
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-semibold text-sm text-slate-900 dark:text-white">{pr.name}</p>
                    <p className="text-xs text-slate-500">{format(parseISO(pr.date), 'MMM d, yyyy')} · {pr.reps} reps</p>
                  </div>
                  <span className="font-display font-bold text-energy-500">{pr.max_weight} kg</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
