import { oldMill } from './content/oldMill'
import type { OldMillLayerId, OldMillLayerLayout, OldMillLayouts } from './game/oldMillSceneModel'

const base = { scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true }

export const defaultOldMillLayouts: OldMillLayouts = {
  waterwheel: { x: 33.02083333333333, y: 38.00700505574543, width: 31, rotation: 0, opacity: 1, ...base, scaleY: .95, rotateY: 6, perspective: 1000 },
  window: { x: 53, y: 21, width: 9.5, rotation: 0, opacity: 1, ...base },
  vines: { x: 27.66796875, y: 54.38427734375, width: 14, rotation: 90, opacity: 1, ...base },
  nest: { x: 28.474609375, y: 47.4990218480428, width: 12, rotation: -14, opacity: .75, ...base, rotateX: -29 },
  glow: { x: 50.43359375, y: 18.594482421875, width: 12, rotation: 180, opacity: .63, ...base },
  splash: { x: 51.515625, y: 64.609619140625, width: 15.5, rotation: 0, opacity: .78, ...base },
  ripples: { x: 47.5537109375, y: 68.64404296875, width: 19.5, rotation: -8, opacity: .62, ...base },
  motes: { x: 25.294921875, y: 43.1022965113322, width: 21.868958987422268, rotation: 2.060939621710247, opacity: .65, ...base },
}

export const oldMillLayerIds = Object.keys(oldMill.layers) as OldMillLayerId[]
const STORAGE_KEY = 'echo-old-mill-layout-v2'
const VERSION_KEY = 'echo-old-mill-layout-version'
const CURRENT_VERSION = '2026-08-18-v4'

export function loadOldMillLayouts(): OldMillLayouts {
  try {
    if (localStorage.getItem(VERSION_KEY) !== CURRENT_VERSION) {
      saveOldMillLayouts(defaultOldMillLayouts)
      return defaultOldMillLayouts
    }
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultOldMillLayouts
    const parsed = JSON.parse(raw) as Partial<Record<OldMillLayerId, Partial<OldMillLayerLayout>>>
    return Object.fromEntries(oldMillLayerIds.map(id => [id, { ...defaultOldMillLayouts[id], ...(parsed[id] ?? {}) }])) as OldMillLayouts
  } catch { return defaultOldMillLayouts }
}

export function saveOldMillLayouts(layouts: OldMillLayouts) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts))
  localStorage.setItem(VERSION_KEY, CURRENT_VERSION)
}
