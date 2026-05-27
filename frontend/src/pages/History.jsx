import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, TrendingUp, Flame, Award } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'
import api from '../api/client'
import FloatingShapes from '../components/ui/FloatingShapes'

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
const DAYS_OF_WEEK = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']
const ACCENTS = ['#FF3AF2','#00F5D4','#FFE600','#FF6B35','#7B2FFF']

function CalendarDay({ day, onClick, selected }) {
  const isToday = day.date === new Date().toISOString().split('T')[0]
  const statusStyle = {
    met: { bg: '#00F5D4', text: '#0D0D1A', shadow: '0 0 12px rgba(0,245,212,0.7)', border: '2px solid #FFE600' },
    partial: { bg: '#FF6B35', text: '#FFFFFF', shadow: '0 0 10px rgba(255,107,53,0.5)', border: '2px solid #FF3AF2' },
    missed: { bg: 'rgba(45,27,78,0.5)', text: 'rgba(255,255,255,0.4)', shadow: 'none', border: '2px solid rgba(123,47,255,0.3)' },
    future: { bg: 'transparent', text: 'rgba(255,255,255,0.2)', shadow: 'none', border: '2px solid transparent' },
  }
  const s = statusStyle[day.status] || statusStyle.future

  return (
    <button
      onClick={() => day.status !== 'future' && onClick(day)}
      className="aspect-square flex items-center justify-center relative transition-all duration-150 active:scale-90"
      style={{
        background: selected ? '#FF3AF2' : s.bg,
        borderRadius: '10px',
        border: selected ? '3px solid #FFE600' : s.border,
        boxShadow: selected ? '4px 4px 0 #FFE600, 0 0 15px rgba(255,58,242,0.6)' : s.shadow,
        opacity: day.status === 'future' ? 0.3 : 1,
        cursor: day.status === 'future' ? 'default' : 'pointer',
      }}
    >
      <span className="text-xs font-display font-black relative z-10"
        style={{ color: selected ? '#0D0D1A' : s.text, textDecoration: isToday ? 'underline' : 'none' }}>
        {day.day}
      </span>
    </button>
  )
}

function DayDetail({ dayData, onClose }) {
  if (!dayData) return null
  const { date, summary, sessions, comparison } = dayData
  const statItems = [
    { label: 'Steps', val: summary?.steps?.toLocaleString() || '0', color: '#00F5D4' },
    { label: 'Active min', val: `${summary?.active_minutes || 0} min`, color: '#FF6B35' },
    { label: 'Calories', val: `${summary?.calories_burned || 0} kcal`, color: '#FF3AF2' },
    { label: 'Sleep', val: `${summary?.sleep_hours || 0} hrs`, color: '#7B2FFF' },
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
      className="mt-4 relative overflow-hidden"
      style={{ background: 'rgba(45,27,78,0.9)', border: '4px solid #FF3AF2', borderRadius: '20px', boxShadow: '8px 8px 0 #FFE600', padding: '20px' }}>
      <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 8px, #FF3AF2 8px, #FF3AF2 16px)' }} />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-black text-lg text-white" style={{ textShadow: '2px 2px 0 #7B2FFF' }}>
            {format(parseISO(date), 'EEEE, MMM d').toUpperCase()}
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center font-black text-lg"
            style={{ background: '#FF3AF2', color: '#0D0D1A', border: '2px solid #FFE600' }}>×</button>
        </div>
        {summary ? (
          <div className="grid grid-cols-2 gap-3 mb-4">
            {statItems.map(({ label, val, color }) => (
              <div key={label} className="rounded-2xl p-3" style={{ background: `${color}15`, border: `3px solid ${color}` }}>
                <p className="text-xs font-display font-bold uppercase tracking-wider mb-1" style={{ color }}>{label}</p>
                <p className="font-display font-black text-sm text-white">{val}</p>
              </div>
            ))}
          </div>
        ) : <p className="text-white/60 text-sm mb-4">No data recorded this day.</p>}
        {sessions?.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-display font-black uppercase tracking-widest mb-2" style={{ color: '#FFE600' }}>SESSIONS</p>
            {sessions.map((s, i) => (
              <div key={s.id} className="flex items-center gap-2 rounded-2xl p-3"
                style={{ background: `${ACCENTS[i % 5]}15`, border: `3px solid ${ACCENTS[i % 5]}` }}>
                <span className="text-xl">{s.workout_type === 'Walk' ? '🚶' : s.workout_type === 'Run' ? '🏃' : s.workout_type === 'Strength' ? '💪' : s.workout_type === 'HIIT' ? '🔥' : '⚡'}</span>
                <div className="flex-1">
                  <p className="font-display font-black text-xs text-white">{s.workout_type}</p>
                  <p className="text-xs font-body" style={{ color: ACCENTS[i % 5] }}>{s.duration_min} min · {s.calories_burned} kcal</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {comparison?.last_week_summary && summary && (
          <div className="mt-3 pt-3" style={{ borderTop: '2px dashed rgba(255,58,242,0.3)' }}>
            <p className="text-xs font-display font-bold uppercase tracking-wider mb-1" style={{ color: '#7B2FFF' }}>VS LAST WEEK</p>
            <p className="text-sm font-display font-black">
              {summary.steps > comparison.last_week_summary.steps
                ? <span style={{ color: '#00F5D4' }}>▲ {(summary.steps - comparison.last_week_summary.steps).toLocaleString()} more steps!</span>
                : <span style={{ color: '#FF6B35' }}>▼ {(comparison.last_week_summary.steps - summary.steps).toLocaleString()} fewer steps</span>}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  )
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-2xl px-3 py-2" style={{ background: 'rgba(45,27,78,0.95)', border: '3px solid #FF3AF2', boxShadow: '4px 4px 0 #FFE600' }}>
        <p className="text-xs font-display font-bold uppercase tracking-wider mb-1" style={{ color: '#00F5D4' }}>{label}</p>
        <p className="font-display font-black text-white">{payload[0].value?.toLocaleString()} {payload[0].unit || ''}</p>
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
  const [activeTab, setActiveTab] = useState('calendar')
  const [loading, setLoading] = useState(true)

  useEffect(() => { loadCalendar() }, [year, month])
  useEffect(() => { loadTrends(); loadStreak(); loadPrs() }, [])

  const loadCalendar = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/progress/calendar?year=${year}&month=${month}`)
      setCalendarDays(res.data.days)
    } catch { toast.error('Failed to load calendar') }
    finally { setLoading(false) }
  }

  const loadTrends = async () => { try { const res = await api.get('/progress/trends?days=30'); setTrends(res.data) } catch {} }
  const loadStreak = async () => { try { const res = await api.get('/progress/streak'); setStreak(res.data) } catch {} }
  const loadPrs = async () => { try { const res = await api.get('/progress/strength-prs'); setPrs(res.data.prs || []) } catch {} }

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
    let m = month + dir, y = year
    if (m < 1) { m = 12; y-- }
    if (m > 12) { m = 1; y++ }
    setMonth(m); setYear(y); setSelectedDay(null); setDayDetail(null)
  }

  const firstDayOfWeek = calendarDays.length > 0 ? new Date(year, month - 1, 1).getDay() : 0
  const trendSteps = trends?.steps?.map((d) => ({ ...d, date: format(parseISO(d.date), 'MMM d') })) || []
  const trendActiveMin = trends?.active_minutes?.map((d) => ({ ...d, date: format(parseISO(d.date), 'MMM d') })) || []

  const TABS = [
    { id: 'calendar', label: '📅 CALENDAR', accent: '#FF3AF2' },
    { id: 'trends', label: '📈 TRENDS', accent: '#00F5D4' },
    { id: 'prs', label: '🏆 PRs', accent: '#FFE600' },
  ]

  return (
    <div className="page relative">
      <FloatingShapes seed={3} count={6} />

      <h1 className="font-display font-black text-4xl text-white text-shadow-triple mb-6 relative z-10">HISTORY 📊</h1>

      {/* Streak badges */}
      <div className="flex gap-3 mb-6 relative z-10">
        {[
          { label: 'CURRENT STREAK', val: `${streak.current_streak} DAYS`, emoji: '🔥', accent: '#FF3AF2', border: '#FFE600', shadow: '6px 6px 0 #7B2FFF' },
          { label: 'BEST STREAK', val: `${streak.longest_streak} DAYS`, emoji: '🏆', accent: '#FFE600', border: '#FF3AF2', shadow: '6px 6px 0 #00F5D4' },
        ].map((item, i) => (
          <motion.div key={i} initial={{ scale: 0.85, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: i * 0.1 }}
            className="flex-1 relative overflow-hidden"
            style={{ background: 'rgba(45,27,78,0.85)', border: `4px solid ${item.border}`, borderRadius: '20px', boxShadow: item.shadow, padding: '16px' }}>
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle, ${item.accent} 1px, transparent 1px)`, backgroundSize: '14px 14px' }} />
            <span className="text-3xl block mb-1 animate-bounce-subtle relative z-10">{item.emoji}</span>
            <p className="text-xs font-display font-black uppercase tracking-wider relative z-10" style={{ color: item.accent }}>{item.label}</p>
            <p className="font-accent text-2xl text-white relative z-10" style={{ textShadow: `2px 2px 0 ${item.border}` }}>{item.val}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 relative z-10">
        {TABS.map((tab) => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className="flex-1 py-3 rounded-full text-xs font-display font-black uppercase tracking-wider transition-all duration-200"
            style={activeTab === tab.id
              ? { background: tab.accent, color: '#0D0D1A', border: `3px solid #FFE600`, boxShadow: `4px 4px 0 #7B2FFF`, transform: 'scale(1.05)' }
              : { background: 'rgba(45,27,78,0.6)', color: tab.accent, border: `3px solid ${tab.accent}50` }
            }
          >{tab.label}</button>
        ))}
      </div>

      {/* Calendar Tab */}
      {activeTab === 'calendar' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
          {/* Month navigator */}
          <div className="flex items-center justify-between mb-4 relative overflow-hidden rounded-2xl p-3"
            style={{ background: 'rgba(45,27,78,0.8)', border: '4px solid #7B2FFF', boxShadow: '6px 6px 0 #FF3AF2' }}>
            <button onClick={() => navigateMonth(-1)} className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110"
              style={{ background: '#FF3AF2', border: '2px solid #FFE600' }}>
              <ChevronLeft size={18} style={{ color: '#0D0D1A' }} />
            </button>
            <h2 className="font-accent text-2xl text-white" style={{ textShadow: '2px 2px 0 #7B2FFF' }}>
              {MONTHS[month - 1].toUpperCase()} {year}
            </h2>
            <button onClick={() => navigateMonth(1)}
              disabled={year === today.getFullYear() && month === today.getMonth() + 1}
              className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-110 disabled:opacity-30"
              style={{ background: '#FF3AF2', border: '2px solid #FFE600' }}>
              <ChevronRight size={18} style={{ color: '#0D0D1A' }} />
            </button>
          </div>

          {/* Legend */}
          <div className="flex gap-4 mb-3 text-xs">
            {[
              { color: '#00F5D4', label: 'Goal met' },
              { color: '#FF6B35', label: 'Partial' },
              { color: 'rgba(45,27,78,0.5)', label: 'Missed' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-4 h-4 rounded-md" style={{ background: color, border: '2px solid rgba(255,255,255,0.2)' }} />
                <span className="font-display font-bold text-white/70">{label}</span>
              </div>
            ))}
          </div>

          {/* Day of week headers */}
          <div className="grid grid-cols-7 gap-1 mb-1">
            {DAYS_OF_WEEK.map((d) => (
              <div key={d} className="text-center text-xs font-display font-black py-1" style={{ color: '#FF3AF2' }}>{d}</div>
            ))}
          </div>

          {/* Calendar grid */}
          {loading ? (
            <div className="flex justify-center py-8">
              <div className="w-8 h-8 rounded-full animate-spin" style={{ border: '3px solid #7B2FFF', borderTopColor: '#FF3AF2' }} />
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-1">
              {Array.from({ length: firstDayOfWeek }).map((_, i) => <div key={`empty-${i}`} />)}
              {calendarDays.map((day) => (
                <CalendarDay key={day.date} day={day} selected={selectedDay === day.date} onClick={handleDayClick} />
              ))}
            </div>
          )}

          <AnimatePresence>
            {dayDetail && <DayDetail dayData={dayDetail} onClose={() => { setSelectedDay(null); setDayDetail(null) }} />}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Trends Tab */}
      {activeTab === 'trends' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5 relative z-10">
          {[
            { title: 'DAILY STEPS (30 DAYS)', data: trendSteps, icon: TrendingUp, color: '#00F5D4', ChartComp: LineChart, DataComp: Line, isLine: true },
            { title: 'ACTIVE MINUTES (30 DAYS)', data: trendActiveMin, icon: Flame, color: '#FF6B35', ChartComp: BarChart, DataComp: Bar, isLine: false },
          ].map(({ title, data, icon: Icon, color, ChartComp, DataComp, isLine }, idx) => (
            <div key={idx} className="relative overflow-hidden"
              style={{ background: 'rgba(45,27,78,0.85)', border: `4px solid ${color}`, borderRadius: '20px', boxShadow: `8px 8px 0 ${ACCENTS[(idx + 2) % 5]}`, padding: '20px' }}>
              <div className="absolute inset-0 opacity-5" style={{ backgroundImage: `radial-gradient(circle, ${color} 1px, transparent 1px)`, backgroundSize: '20px 20px' }} />
              <div className="flex items-center gap-2 mb-4 relative z-10">
                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: `${color}25`, border: `2px solid ${color}` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <h3 className="font-display font-black text-sm text-white" style={{ textShadow: `1px 1px 0 ${color}` }}>{title}</h3>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <ChartComp data={data}>
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.5)', fontFamily: 'Outfit' }} tickLine={false} axisLine={false} interval={4} />
                  <YAxis hide />
                  <Tooltip content={<CustomTooltip />} />
                  {isLine
                    ? <Line type="monotone" dataKey="value" stroke={color} strokeWidth={3} dot={false} activeDot={{ r: 5, fill: color, stroke: '#FFE600', strokeWidth: 2 }} />
                    : <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} />
                  }
                </ChartComp>
              </ResponsiveContainer>
            </div>
          ))}
        </motion.div>
      )}

      {/* PRs Tab */}
      {activeTab === 'prs' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative z-10">
          {prs.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4 animate-bounce-subtle">🏆</div>
              <p className="font-display font-black text-xl text-white text-shadow-double mb-2">NO PRs YET!</p>
              <p className="font-body text-white/60">Complete strength sessions to track your records.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs font-display font-black uppercase tracking-widest mb-4" style={{ color: '#FFE600', textShadow: '1px 1px 0 #FF3AF2' }}>
                PERSONAL RECORDS — MAX WEIGHT 🏆
              </p>
              <div className="relative overflow-hidden mb-5"
                style={{ background: 'rgba(45,27,78,0.85)', border: '4px solid #FFE600', borderRadius: '20px', boxShadow: '8px 8px 0 #FF3AF2', padding: '20px' }}>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={prs.slice(0, 8)} layout="vertical">
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.7)', fontFamily: 'Outfit', fontWeight: 700 }} width={90} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="max_weight" fill="#FFE600" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {prs.map((pr, i) => (
                <motion.div key={pr.name} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                  className="relative overflow-hidden"
                  style={{ background: 'rgba(45,27,78,0.85)', border: `4px solid ${ACCENTS[i % 5]}`, borderRadius: '20px', boxShadow: `6px 6px 0 ${ACCENTS[(i + 1) % 5]}`, padding: '16px' }}>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: `${ACCENTS[i % 5]}20`, border: `3px solid ${ACCENTS[i % 5]}` }}>
                      <Award size={18} style={{ color: ACCENTS[i % 5] }} />
                    </div>
                    <div className="flex-1">
                      <p className="font-display font-black text-sm text-white" style={{ textShadow: `1px 1px 0 ${ACCENTS[i % 5]}` }}>{pr.name.toUpperCase()}</p>
                      <p className="text-xs font-display font-bold" style={{ color: ACCENTS[(i + 2) % 5] }}>{format(parseISO(pr.date), 'MMM d, yyyy')} · {pr.reps} REPS</p>
                    </div>
                    <span className="font-accent text-2xl" style={{ color: ACCENTS[i % 5], textShadow: `2px 2px 0 ${ACCENTS[(i+1)%5]}` }}>{pr.max_weight}kg</span>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
