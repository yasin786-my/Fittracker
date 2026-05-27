import { NavLink, useLocation } from 'react-router-dom'
import { Home, BarChart2, Dumbbell, User } from 'lucide-react'
import { motion } from 'framer-motion'

const ACCENT_COLORS = ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35']

const NAV_ITEMS = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/history', icon: BarChart2, label: 'History' },
  { to: '/workout', icon: Dumbbell, label: 'Workouts' },
  { to: '/profile', icon: User, label: 'Profile' },
]

export default function BottomNav() {
  const location = useLocation()

  // Hide during active session
  if (location.pathname.startsWith('/workout/active')) return null

  return (
    <nav className="bottom-nav">
      {NAV_ITEMS.map(({ to, icon: Icon, label }, index) => {
        const active = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to)

        const color = ACCENT_COLORS[index % ACCENT_COLORS.length]

        return (
          <NavLink
            key={to}
            to={to}
            className="relative flex flex-col items-center gap-0.5 px-4 py-1 group"
          >
            <div className="relative">
              {active && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 -m-2.5 rounded-2xl"
                  style={{
                    background: `${color}20`,
                    boxShadow: `0 0 15px ${color}40`,
                    border: `2px solid ${color}60`,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={24}
                className="relative transition-all duration-300"
                style={{
                  color: active ? color : '#64748b',
                  filter: active ? `drop-shadow(0 0 6px ${color}80)` : 'none',
                }}
                strokeWidth={active ? 2.8 : 2}
              />
            </div>
            <span
              className="text-[10px] font-display font-bold uppercase tracking-wider transition-colors duration-300"
              style={{ color: active ? color : '#64748b' }}
            >
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
