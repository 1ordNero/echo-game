import { oldMill } from './oldMill'
import { forgottenForest } from './forgottenForest'

export type LocationId = 'old-mill' | 'forgotten-forest'

export type LocationDefinition = {
  id: LocationId
  name: string
  background: string
  route: string
  editorScene: 'mill' | 'forest'
  preload: {
    critical: readonly string[]
    idle: readonly string[]
  }
}

export const locations: Record<LocationId, LocationDefinition> = {
  'old-mill': {
    id: 'old-mill',
    name: oldMill.name,
    background: oldMill.background,
    route: '?mill=1',
    editorScene: 'mill',
    preload: {
      critical: [oldMill.background],
      idle: [oldMill.lumen, ...Object.values(oldMill.layers)],
    },
  },
  'forgotten-forest': {
    id: 'forgotten-forest',
    name: forgottenForest.name,
    background: forgottenForest.background,
    route: '?forest=1',
    editorScene: 'forest',
    preload: {
      critical: [forgottenForest.background],
      idle: [forgottenForest.echoes.mossi, ...Object.values(forgottenForest.layers)],
    },
  },
}

export const locationList = Object.values(locations)

export function getLocation(id: LocationId) {
  return locations[id]
}
