import { motion } from 'framer-motion'

const ACCENT_COLORS = ['#FF3AF2', '#00F5D4', '#FFE600', '#FF6B35', '#7B2FFF']

const SHAPES = [
  // Stars
  { type: 'star', path: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z' },
  // Sparkle
  { type: 'sparkle', path: 'M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z' },
  // Circle (rendered as div)
  { type: 'circle' },
  // Diamond
  { type: 'diamond', path: 'M12 0L24 12L12 24L0 12Z' },
  // Triangle
  { type: 'triangle', path: 'M12 2L22 20H2L12 2Z' },
]

const EMOJIS = ['✨', '💫', '⚡', '🔥', '💥', '🌟', '⭐', '🎯', '🚀', '💪']

function seededRandom(seed) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function FloatingShapes({ count = 8, seed = 42 }) {
  const elements = []

  for (let i = 0; i < count; i++) {
    const r1 = seededRandom(seed + i * 7)
    const r2 = seededRandom(seed + i * 13 + 3)
    const r3 = seededRandom(seed + i * 19 + 7)
    const r4 = seededRandom(seed + i * 23 + 11)
    const r5 = seededRandom(seed + i * 29 + 17)

    const isEmoji = r1 > 0.6
    const color = ACCENT_COLORS[Math.floor(r2 * ACCENT_COLORS.length)]
    const size = 16 + r3 * 48 // 16-64px
    const top = `${r4 * 90 + 2}%`
    const left = `${r5 * 90 + 2}%`
    const animType = ['float', 'float-reverse', 'wiggle', 'bounce-subtle', 'spin-slow'][Math.floor(r1 * 5)]
    const delay = r2 * 3

    if (isEmoji) {
      const emoji = EMOJIS[Math.floor(r3 * EMOJIS.length)]
      elements.push(
        <motion.div
          key={`shape-${i}`}
          aria-hidden="true"
          className={`absolute pointer-events-none animate-${animType} will-change-transform`}
          style={{
            top,
            left,
            fontSize: `${size * 0.6}px`,
            animationDelay: `${delay}s`,
            opacity: 0.4 + r4 * 0.3,
            zIndex: 0,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.4 + r4 * 0.3, scale: 1 }}
          transition={{ delay: delay * 0.3, duration: 0.6, type: 'spring' }}
        >
          {emoji}
        </motion.div>
      )
    } else {
      const shape = SHAPES[Math.floor(r2 * SHAPES.length)]

      if (shape.type === 'circle') {
        elements.push(
          <motion.div
            key={`shape-${i}`}
            aria-hidden="true"
            className={`absolute pointer-events-none rounded-full border-4 animate-${animType} will-change-transform`}
            style={{
              top,
              left,
              width: size,
              height: size,
              borderColor: color,
              backgroundColor: `${color}15`,
              animationDelay: `${delay}s`,
              opacity: 0.3 + r4 * 0.3,
              zIndex: 0,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3 + r4 * 0.3, scale: 1 }}
            transition={{ delay: delay * 0.3, duration: 0.6, type: 'spring' }}
          />
        )
      } else {
        elements.push(
          <motion.svg
            key={`shape-${i}`}
            aria-hidden="true"
            className={`absolute pointer-events-none animate-${animType} will-change-transform`}
            style={{
              top,
              left,
              width: size,
              height: size,
              animationDelay: `${delay}s`,
              opacity: 0.3 + r4 * 0.3,
              zIndex: 0,
            }}
            viewBox="0 0 24 24"
            fill={`${color}40`}
            stroke={color}
            strokeWidth="1.5"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 0.3 + r4 * 0.3, scale: 1 }}
            transition={{ delay: delay * 0.3, duration: 0.6, type: 'spring' }}
          >
            <path d={shape.path} />
          </motion.svg>
        )
      }
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true" style={{ zIndex: 0 }}>
      {elements}
    </div>
  )
}
