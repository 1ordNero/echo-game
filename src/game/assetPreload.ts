type IdleWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number
}

const loaded = new Set<string>()

export function preloadImage(src: string, priority: 'high' | 'low' = 'low') {
  if (!src || loaded.has(src)) return
  loaded.add(src)

  const link = document.createElement('link')
  link.rel = 'preload'
  link.as = 'image'
  link.href = src
  if ('fetchPriority' in link) (link as HTMLLinkElement & { fetchPriority: string }).fetchPriority = priority
  document.head.appendChild(link)

  const image = new Image()
  if ('fetchPriority' in image) image.fetchPriority = priority
  image.decoding = 'async'
  image.src = src
}

export function preloadImages(sources: readonly string[], priority: 'high' | 'low' = 'low') {
  sources.forEach(src => preloadImage(src, priority))
}

export function preloadWhenIdle(sources: readonly string[]) {
  const run = () => preloadImages(sources, 'low')
  const idleWindow = window as IdleWindow
  if (idleWindow.requestIdleCallback) idleWindow.requestIdleCallback(run, { timeout: 1600 })
  else window.setTimeout(run, 500)
}
