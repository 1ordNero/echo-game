import { forgottenForest } from './content/forgottenForest'

export type ForestLayerId = keyof typeof forgottenForest.layers
export type LayerLayout = {
  x: number; y: number; width: number; rotation: number; opacity: number
  scaleX: number; scaleY: number; skewX: number; skewY: number
  rotateX: number; rotateY: number; perspective: number; visible: boolean
}
export type ForestLayouts = Record<ForestLayerId, LayerLayout>

const base = { scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true }
export const defaultForestLayouts: ForestLayouts = {
  roots: { x: 4.9541015625, y: 46.127190907796226, width: 60.73155466404468, rotation: 6.240752671611318, opacity: .85, ...base },
  stones: { x: 53.0302734375, y: 31.129638671875, width: 29.5, rotation: 0, opacity: .8, ...base },
  moss: { x: 15.8349609375, y: 48.887939453125, width: 64.35866148706144, rotation: .8196354972508004, opacity: .72, ...base },
  leaves: { x: 7, y: 8, width: 35.18935973972441, rotation: -22.55176293369384, opacity: .46, ...base, visible: false },
  particles: { x: -.6591796875, y: -.396728515625, width: 100, rotation: 0, opacity: .75, ...base },
  light: { x: 0, y: 0, width: 100, rotation: 0, opacity: .52, ...base },
}
export const forestLayerIds = Object.keys(forgottenForest.layers) as ForestLayerId[]
export const forestIsVfx = (id: ForestLayerId) => id === 'light' || id === 'particles' || id === 'leaves'

const STORAGE_KEY = 'echo-forgotten-forest-layout-v2'
const VERSION_KEY = 'echo-forgotten-forest-layout-version'
const CURRENT_VERSION = '2'

export function loadForestLayouts(): ForestLayouts {
  try {
    if (localStorage.getItem(VERSION_KEY) !== CURRENT_VERSION) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultForestLayouts))
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
      return defaultForestLayouts
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultForestLayouts
    const parsed = JSON.parse(raw) as Partial<Record<ForestLayerId, Partial<LayerLayout>>>
    return Object.fromEntries(forestLayerIds.map(id => [id, { ...defaultForestLayouts[id], ...(parsed[id] ?? {}) }])) as ForestLayouts
  } catch { return defaultForestLayouts }
}
export function saveForestLayouts(layouts: ForestLayouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts))
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
}
export const forestLayerStyle = (value: LayerLayout) => ({
  left: `${value.x}%`, top: `${value.y}%`, width: `${value.width}%`, opacity: value.visible ? value.opacity : 0,
  transformOrigin: 'center center',
  transform: `perspective(${value.perspective}px) rotateX(${value.rotateX}deg) rotateY(${value.rotateY}deg) rotateZ(${value.rotation}deg) skew(${value.skewX}deg, ${value.skewY}deg) scale(${value.scaleX}, ${value.scaleY})`,
})
