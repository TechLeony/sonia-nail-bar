import { useCallback, useEffect, useState } from 'react'

export function useBookingClock() {
  const [now, setNow] = useState(() => Date.now())
  const updateNow = useCallback(() => setNow(Date.now()), [])
  useEffect(() => {
    const timer = window.setInterval(updateNow, 30_000)
    window.addEventListener('focus', updateNow)
    return () => { window.clearInterval(timer); window.removeEventListener('focus', updateNow) }
  }, [updateNow])
  return { now, updateNow }
}
