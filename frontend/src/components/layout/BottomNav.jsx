import { NavLink, useLocation } from 'react-router-dom'
import { Home, BarChart2, Dumbbell, User } from 'lucide-react'
import { motion } from 'framer-motion'

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
      {NAV_ITEMS.map(({ to, icon: Icon, label }) => {
        const active = to === '/'
          ? location.pathname === '/'
          : location.pathname.startsWith(to)

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
                  className="absolute inset-0 -m-2 rounded-xl bg-brand-50 dark:bg-brand-900/30"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon
                size={22}
                className={`relative transition-colors duration-200 ${
                  active
                    ? 'text-brand-600 dark:text-brand-400'
                    : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400'
                }`}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[10px] font-display font-medium transition-colors duration-200 ${
                active
                  ? 'text-brand-600 dark:text-brand-400'
                  : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
