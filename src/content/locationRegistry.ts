import { oldMill } from './oldMill'
import { forgottenForest } from './forgottenForest'
import { riverbank } from './riverbank'

export type LocationId = 'old-mill' | 'forgotten-forest' | 'riverbank'

export type LocationDefinition = {
  id: LocationId
  name: string
  background: string
  route: string
  editorScene: 'mill' | 'forest' | 'river'
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
  riverbank: {
    id: 'riverbank',
    name: riverbank.name,
    background: riverbank.background,
    route: '?river=1',
    editorScene: 'river',
    preload: {
      critical: [riverbank.background, riverbank.layers.dam, riverbank.layers.waterSlow],
      idle: [riverbank.echoes.dropi, riverbank.echoes.dropiRipple, ...Object.values(riverbank.layers)],
    },
  },
}

export const locationList = Object.values(locations)

export function getLocation(id: LocationId) {
  return locations[id]
}
