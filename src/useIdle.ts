import { useEffect, useRef, useState } from "react"
import { UseIdle } from "./types"

export const useIdle: UseIdle = (options) => {
  const {
    storageKey = "last-activity",
    interval,
    threshold,
    events = ["mousemove", "mouseup", "keyup", "focus", "resize"],
  } = options

  const idleRef = useRef(false)
  const [tick, setTick] = useState(0)
  const triggerTick = () => setTick((tick) => tick + 1)

  const readLastActivity = (): Date => {
    const datetime = localStorage.getItem(storageKey) ?? ""

    if (isNaN(Date.parse(datetime))) {
      writeLastActivity()

      return readLastActivity()
    }

    return new Date(datetime)
  }

  const writeLastActivity = () =>
    localStorage.setItem(storageKey, new Date().toISOString())

  const updateActivity = () => {
    writeLastActivity()
    if (idleRef.current) {
      idleRef.current = false
      triggerTick()
    }
  }

  const checkActivity = () => {
    if (idleRef.current) return

    const lastActivity = readLastActivity()
    const differenceInSeconds = Date.now() - lastActivity.getTime()

    if (differenceInSeconds >= threshold) {
      if (!idleRef.current) {
        idleRef.current = true
        triggerTick()
      }
    }
  }

  const setupIdleChecks = () => {
    writeLastActivity()

    const intervalId = setInterval(checkActivity, interval)

    events.forEach((eventName) =>
      window.addEventListener(eventName, updateActivity)
    )

    const clearAllIntervals = () => {
      clearInterval(intervalId)

      events.forEach((eventName) =>
        window.removeEventListener(eventName, updateActivity)
      )
    }

    return clearAllIntervals
  }

  useEffect(setupIdleChecks, [])

  return idleRef.current
}
