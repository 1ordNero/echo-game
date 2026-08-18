import LocationScene, { type SceneHotspot, type SceneLayer } from './LocationScene'
import { oldMill } from '../content/oldMill'

type OldMillSceneProps = {
  eyebrow: string
  subtitle: string
  changed: boolean
  layers: SceneLayer[]
  hotspots?: SceneHotspot[]
  onBack: () => void
}

/**
 * Old Mill adapter for the shared location renderer.
 * Gameplay state stays outside; this component only renders the scene.
 */
export default function OldMillScene({ eyebrow, subtitle, changed, layers, hotspots = [], onBack }: OldMillSceneProps) {
  return <LocationScene
    name={oldMill.name}
    eyebrow={eyebrow}
    subtitle={subtitle}
    background={oldMill.background}
    changed={changed}
    layers={layers}
    hotspots={hotspots}
    onBack={onBack}
  />
}
