import { useEffect, useRef, useState } from 'react'

export default function CountUp({ target = 0, duration = 1200, suffix = '', prefix = '', decimals = 0 }) {
  const [value, setValue] = useState(0)
  const startTime = useRef(null)
  const frameRef = useRef(null)
  const prevTarget = useRef(0)

  useEffect(() => {
    const from = prevTarget.current
    const to = target
    prevTarget.current = target

    if (from === to) return

    const animate = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = from + (to - from) * eased
      setValue(current)

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate)
      } else {
        setValue(to)
      }
    }

    startTime.current = null
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = requestAnimationFrame(animate)

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [target, duration])

  const formatted = decimals > 0
    ? value.toFixed(decimals)
    : Math.round(value).toLocaleString()

  return (
    <span className="tabular-nums">
      {prefix}{formatted}{suffix}
    </span>
  )
}
