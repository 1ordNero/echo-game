export type RiverLayerId = 'dam' | 'waterSlow' | 'water' | 'streambed' | 'echoStone' | 'echo' | 'dropi' | 'dropiRipple'
export type RiverPreviewState = 'undiscovered' | 'discovered' | 'investigating' | 'echo_revealed' | 'restored'

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
export const riverPreviewStates: RiverPreviewState[] = ['undiscovered', 'discovered', 'investigating', 'echo_revealed', 'restored']

const base = (patch: Partial<LayerLayout> = {}): LayerLayout => ({
  x: 0, y: 0, width: 30, rotation: 0, opacity: 1,
  scaleX: 1, scaleY: 1, skewX: 0, skewY: 0,
  rotateX: 0, rotateY: 0, perspective: 800, visible: true,
  ...patch,
})

export const defaultRiverLayouts: RiverLayouts = {
  dam: base({ x: 15.9384765625, y: 34.477294921875, width: 53.734616004897816, rotation: -0.5888912671790116 }),
  waterSlow: base({ x: -39.1015625, y: 33.113274892171226, width: 109.55760020552054, rotation: -13.216365795398787, opacity: .85 }),
  water: base({ x: -19.65234375, y: 32.89917627970378, width: 81.87176012966792, rotation: -4.077231605872981, opacity: .9 }),
  streambed: base({ x: -6.189453125, y: 39.11327489217122, width: 64.08887316254818, rotation: 8.63506075399581, opacity: .75 }),
  echoStone: base({ x: 51.2978515625, y: 62.865228017171226, width: 8, opacity: .9 }),
  echo: base({ x: 47.7705078125, y: 46.603277842203774, width: 28, rotation: -12, opacity: .32 }),
  dropi: base({ x: 52.7705078125, y: 55.666259765625, width: 13.5 }),
  dropiRipple: base({ x: 52.80078125, y: 41.212640126546226, width: 14.5, rotation: -1, opacity: .32 }),
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

export function riverVisibleInState(id: RiverLayerId, state: RiverPreviewState) {
  // Blocked river: only the physical blockage and exposed streambed are visible.
  if (state === 'undiscovered' || state === 'discovered') return id === 'dam' || id === 'streambed'
  // The stone sequence builds on the same blocked state.
  if (state === 'investigating') return id === 'dam' || id === 'streambed' || id === 'echoStone'
  if (state === 'echo_revealed') return id === 'dam' || id === 'streambed' || id === 'echoStone' || id === 'echo'
  // Once the blockage is released, the slow current replaces dam + streambed.
  return id === 'waterSlow' || id === 'echoStone'
}
