export type RiverLayerId = 'dam' | 'waterSlow' | 'water' | 'streambed' | 'echoStone' | 'echo' | 'dropi' | 'dropiRipple'

export type LayerLayout = {
  x: number
  y: number
  width: number
  rotation: number
  opacity: number
  scaleX: number
  scaleY: number
  skewX: number
  skewY: number
  rotateX: number
  rotateY: number
  perspective: number
  visible: boolean
}

export type RiverLayouts = Record<RiverLayerId, LayerLayout>

export const riverLayerIds: RiverLayerId[] = ['dam', 'waterSlow', 'water', 'streambed', 'echoStone', 'echo', 'dropi', 'dropiRipple']

const base = (patch: Partial<LayerLayout> = {}): LayerLayout => ({
  x: 0, y: 0, width: 30, rotation: 0, opacity: 1,
  scaleX: 1, scaleY: 1, skewX: 0, skewY: 0,
  rotateX: 0, rotateY: 0, perspective: 800, visible: true,
  ...patch,
})

export const defaultRiverLayouts: RiverLayouts = {
  dam: base({ x: 29, y: 39, width: 44 }),
  waterSlow: base({ x: 15, y: 42, width: 65, opacity: .55 }),
  water: base({ x: 11, y: 45, width: 72, opacity: .75, visible: false }),
  streambed: base({ x: 13, y: 48, width: 70, opacity: .75, visible: false }),
  echoStone: base({ x: 41, y: 60, width: 18, opacity: .9, visible: false }),
  echo: base({ x: 28, y: 47, width: 42, opacity: .45, visible: false }),
  dropi: base({ x: 63, y: 54, width: 15, opacity: 1, visible: false }),
  dropiRipple: base({ x: 57, y: 67, width: 27, opacity: .45, visible: false }),
}

const STORAGE_KEY = 'echo-riverbank-layout-v1'

export function loadRiverLayouts(): RiverLayouts {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultRiverLayouts
    const parsed = JSON.parse(raw) as Partial<RiverLayouts>
    return Object.fromEntries(riverLayerIds.map(id => [id, { ...defaultRiverLayouts[id], ...(parsed[id] ?? {}) }])) as RiverLayouts
  } catch {
    return defaultRiverLayouts
  }
}

export function saveRiverLayouts(layouts: RiverLayouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts))
}

export function riverLayerStyle(layout: LayerLayout): React.CSSProperties {
  return {
    left: `${layout.x}%`, top: `${layout.y}%`, width: `${layout.width}%`, opacity: layout.opacity,
    display: layout.visible ? 'block' : 'none', transformOrigin: 'center center',
    transform: `perspective(${layout.perspective}px) rotate(${layout.rotation}deg) rotateX(${layout.rotateX}deg) rotateY(${layout.rotateY}deg) skew(${layout.skewX}deg, ${layout.skewY}deg) scale(${layout.scaleX}, ${layout.scaleY})`,
  }
}

export const riverIsVfx = (id: RiverLayerId) => id === 'echo' || id === 'dropiRipple'
