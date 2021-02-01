export type UseIdleOptions = {
  interval: number
  threshold: number
  storageKey?: string
  events?: (keyof WindowEventMap)[]
}

export type UseIdle = (options: UseIdleOptions) => boolean
