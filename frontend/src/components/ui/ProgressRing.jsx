import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Animated circular progress ring using SVG + framer-motion
 * Props:
 *  - pct: 0-100
 *  - size: px (default 200)
 *  - strokeWidth: px (default 14)
 *  - color: tailwind/CSS color (default brand green)
 *  - trackColor: background ring color
 *  - label: center label text
 *  - sublabel: center sublabel text
 *  - children: override center content
 */
export default function ProgressRing({
  pct = 0,
  size = 200,
  strokeWidth = 14,
  color = '#22c55e',
  trackColor,
  label,
  sublabel,
  children,
  className = '',
}) {
  const [animatedPct, setAnimatedPct] = useState(0)

  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (animatedPct / 100) * circumference

  useEffect(() => {
    // Animate to target pct on mount/change
    const timer = setTimeout(() => {
      setAnimatedPct(Math.max(0, Math.min(100, pct)))
    }, 100)
    return () => clearTimeout(timer)
  }, [pct])

  const isDark = document.documentElement.classList.contains('dark')
  const defaultTrack = isDark ? '#1e293b' : '#f1f5f9'

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor || defaultTrack}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            filter: `drop-shadow(0 0 6px ${color}60)`,
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {children || (
          <>
            <motion.span
              key={pct}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="font-display font-bold text-4xl text-slate-900 dark:text-white leading-none"
            >
              {Math.round(animatedPct)}%
            </motion.span>
            {label && (
              <span className="font-body text-xs text-slate-500 dark:text-slate-400 mt-1">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="font-body text-[10px] text-slate-400 dark:text-slate-500">
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
