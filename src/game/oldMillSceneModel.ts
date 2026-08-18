import { oldMill } from '../content/oldMill'
import type { SceneHotspot, SceneLayer } from '../components/LocationScene'

export type OldMillLayerId = keyof typeof oldMill.layers
export type OldMillLayerLayout = {
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

export type OldMillLayouts = Record<OldMillLayerId, OldMillLayerLayout>

export function oldMillLayerStyle(value: OldMillLayerLayout) {
  return {
    left: `${value.x}%`,
    top: `${value.y}%`,
    width: `${value.width}%`,
    opacity: value.visible ? value.opacity : 0,
    transformOrigin: 'center center',
    transform: `perspective(${value.perspective}px) rotateX(${value.rotateX}deg) rotateY(${value.rotateY}deg) rotateZ(${value.rotation}deg) skew(${value.skewX}deg, ${value.skewY}deg) scale(${value.scaleX}, ${value.scaleY})`,
  }
}

export function buildOldMillLayers(layouts: OldMillLayouts, choice: 'repair' | 'preserve' | null): SceneLayer[] {
  const layers: SceneLayer[] = []
  const add = (id: OldMillLayerId, className = 'scene-sprite', blendMode?: SceneLayer['blendMode']) => layers.push({
    id,
    src: oldMill.layers[id],
    style: oldMillLayerStyle(layouts[id]),
    className,
    blendMode,
  })

  if (choice === 'repair') {
    add('waterwheel')
    add('splash', 'scene-vfx')
    add('ripples', 'scene-vfx')
    add('vines')
  }
  if (choice) {
    add('window')
    add('glow', 'scene-vfx window-vfx', 'screen')
    add('motes', 'scene-vfx motes-vfx', 'screen')
  }
  if (choice === 'preserve') add('nest')
  return layers
}

export function buildOldMillHotspots(onSelect: (id: (typeof oldMill.hotspots)[number]['id']) => void): SceneHotspot[] {
  return oldMill.hotspots.map(item => ({
    id: item.id,
    x: item.x,
    y: item.y,
    label: item.label,
    onClick: () => onSelect(item.id),
  }))
}
