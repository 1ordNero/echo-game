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
  roots: { x: 2, y: 47, width: 45, rotation: 0, opacity: 1, ...base },
  stones: { x: 59, y: 42, width: 31, rotation: 0, opacity: 1, ...base },
  moss: { x: 10, y: 45, width: 75, rotation: 0, opacity: .72, ...base },
  leaves: { x: 7, y: 8, width: 86, rotation: 0, opacity: .46, ...base },
  particles: { x: 0, y: 0, width: 100, rotation: 0, opacity: .45, ...base },
  light: { x: 0, y: 0, width: 100, rotation: 0, opacity: .52, ...base },
}
export const forestLayerIds = Object.keys(forgottenForest.layers) as ForestLayerId[]
export const forestIsVfx = (id: ForestLayerId) => id === 'light' || id === 'particles' || id === 'leaves'
export function loadForestLayouts(): ForestLayouts {
  try {
    const raw = localStorage.getItem('echo-forgotten-forest-layout-v1')
    if (!raw) return defaultForestLayouts
    const parsed = JSON.parse(raw) as Partial<Record<ForestLayerId, Partial<LayerLayout>>>
    return Object.fromEntries(forestLayerIds.map(id => [id, { ...defaultForestLayouts[id], ...(parsed[id] ?? {}) }])) as ForestLayouts
  } catch { return defaultForestLayouts }
}
export const forestLayerStyle = (value: LayerLayout) => ({
  left: `${value.x}%`, top: `${value.y}%`, width: `${value.width}%`, opacity: value.visible ? value.opacity : 0,
  transformOrigin: 'center center',
  transform: `perspective(${value.perspective}px) rotateX(${value.rotateX}deg) rotateY(${value.rotateY}deg) rotateZ(${value.rotation}deg) skew(${value.skewX}deg, ${value.skewY}deg) scale(${value.scaleX}, ${value.scaleY})`,
})
