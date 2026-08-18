import type { CSSProperties, ReactNode } from 'react'

export type SceneLayer = {
  id: string
  src: string
  style: CSSProperties
  className?: string
  blendMode?: CSSProperties['mixBlendMode']
}

export type SceneHotspot = {
  id: string
  x: number
  y: number
  label?: string
  onClick: () => void
}

type LocationSceneProps = {
  name: string
  eyebrow: string
  subtitle: string
  background: string
  changed?: boolean
  layers?: SceneLayer[]
  hotspots?: SceneHotspot[]
  onBack: () => void
  children?: ReactNode
}

export default function LocationScene({
  name,
  eyebrow,
  subtitle,
  background,
  changed = false,
  layers = [],
  hotspots = [],
  onBack,
  children,
}: LocationSceneProps) {
  return <>
    <header className="location-topbar">
      <button className="icon-button" onClick={onBack} aria-label="Zurück">←</button>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{name}</h2>
        <p>{subtitle}</p>
      </div>
    </header>
    <div className={`mill-scene ${changed ? 'changed' : ''}`}>
      <img className="scene-background" src={background} alt={name} decoding="async" fetchPriority="high" />
      <div className="scene-shade" />
      {layers.map(layer => <img
        key={layer.id}
        className={layer.className ?? 'scene-sprite'}
        style={{ ...layer.style, mixBlendMode: layer.blendMode }}
        src={layer.src}
        alt=""
        decoding="async"
      />)}
      {hotspots.map(hotspot => <button
        key={hotspot.id}
        className="hotspot"
        style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
        onClick={hotspot.onClick}
        aria-label={hotspot.label ?? 'Untersuchen'}
      ><span className="hotspot-core"/><span className="hotspot-ring"/></button>)}
      {children}
    </div>
  </>
}
