import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

/**
 * Animated circular progress ring — MAXIMALISM edition
 * Multi-color glow, gradient stroke, bold center text with text shadows
 */
export default function ProgressRing({
  pct = 0,
  size = 200,
  strokeWidth = 16,
  color = '#FF3AF2',
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
    const timer = setTimeout(() => {
      setAnimatedPct(Math.max(0, Math.min(100, pct)))
    }, 100)
    return () => clearTimeout(timer)
  }, [pct])

  const gradientId = `ring-gradient-${Math.random().toString(36).slice(2, 6)}`

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        width={size}
        height={size}
        className="-rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF3AF2" />
            <stop offset="50%" stopColor="#00F5D4" />
            <stop offset="100%" stopColor="#FFE600" />
          </linearGradient>
        </defs>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor || '#2D1B4E'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}80) drop-shadow(0 0 20px ${color}40)`,
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
              className="font-display font-black text-4xl text-white leading-none text-shadow-double"
            >
              {Math.round(animatedPct)}%
            </motion.span>
            {label && (
              <span className="font-display font-bold text-xs text-max-accent uppercase tracking-widest mt-1">
                {label}
              </span>
            )}
            {sublabel && (
              <span className="font-body text-[10px] text-white/50">
                {sublabel}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}
