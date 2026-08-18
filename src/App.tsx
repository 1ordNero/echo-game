import { useMemo, useState } from 'react'
import { oldMill } from './content/oldMill'

type Screen = 'map' | 'mill' | 'echo' | 'choice' | 'result'
type HotspotId = (typeof oldMill.hotspots)[number]['id']
type LayerId = keyof typeof oldMill.layers
type LayerLayout = { x: number; y: number; width: number; rotation: number; opacity: number }
type Layouts = Record<LayerId, LayerLayout>

const defaultLayouts: Layouts = {
  waterwheel: { x: 30, y: 28, width: 32, rotation: 0, opacity: 1 },
  window: { x: 58, y: 19, width: 15, rotation: 0, opacity: 1 },
  vines: { x: 68, y: 36, width: 29, rotation: 0, opacity: 1 },
  nest: { x: 75, y: 24, width: 9, rotation: 0, opacity: 1 },
  glow: { x: 55, y: 15, width: 22, rotation: 0, opacity: .68 },
  splash: { x: 33, y: 56, width: 18, rotation: 0, opacity: .78 },
  ripples: { x: 19, y: 72, width: 34, rotation: 0, opacity: .52 },
  motes: { x: 48, y: 7, width: 43, rotation: 0, opacity: .65 },
}

const layerIds = Object.keys(oldMill.layers) as LayerId[]

function loadLayouts(): Layouts {
  try {
    const saved = localStorage.getItem('echo-old-mill-layout')
    return saved ? { ...defaultLayouts, ...JSON.parse(saved) } : defaultLayouts
  } catch {
    return defaultLayouts
  }
}

export default function App() {
  const editorMode = new URLSearchParams(window.location.search).get('editor') === '1'
  const [screen, setScreen] = useState<Screen>('map')
  const [hotspot, setHotspot] = useState<HotspotId>('window')
  const [choice, setChoice] = useState<'preserve' | 'repair' | null>(null)
  const [layouts, setLayouts] = useState<Layouts>(loadLayouts)
  const [selectedLayer, setSelectedLayer] = useState<LayerId>('waterwheel')
  const [copied, setCopied] = useState(false)

  const journal = useMemo(() => {
    if (choice === 'preserve') return 'Lumen fand Wärme im alten Gemäuer. Wir ließen das Nest unberührt und öffneten nur den Weg zum Rad.'
    if (choice === 'repair') return 'Lumen zeigte uns den verborgenen Mechanismus. Wir schnitten die Ranken zurück und brachten das Rad wieder in Bewegung.'
    return ''
  }, [choice])

  const inspectHotspot = (id: HotspotId) => { setHotspot(id); setScreen('echo') }
  const reset = () => { setScreen('map'); setHotspot('window'); setChoice(null) }
  const updateLayer = (id: LayerId, patch: Partial<LayerLayout>) => {
    setLayouts(current => {
      const next = { ...current, [id]: { ...current[id], ...patch } }
      localStorage.setItem('echo-old-mill-layout', JSON.stringify(next))
      return next
    })
  }
  const layerStyle = (id: LayerId) => ({
    left: `${layouts[id].x}%`, top: `${layouts[id].y}%`, width: `${layouts[id].width}%`,
    opacity: layouts[id].opacity, transform: `rotate(${layouts[id].rotation}deg)`,
  })
  const copyLayout = async () => {
    await navigator.clipboard.writeText(JSON.stringify(layouts, null, 2))
    setCopied(true); window.setTimeout(() => setCopied(false), 1400)
  }

  if (editorMode) {
    const active = layouts[selectedLayer]
    return (
      <main className="editor-shell">
        <section className="editor-scene" aria-label="Alte Mühle Sprite Editor">
          <img className="scene-background" src={oldMill.background} alt="Alte Mühle" />
          {layerIds.map(id => (
            <img key={id} src={oldMill.layers[id]} alt={id}
              className={`editor-layer ${selectedLayer === id ? 'selected' : ''}`}
              style={layerStyle(id)} onPointerDown={event => {
                event.preventDefault(); setSelectedLayer(id)
                const scene = event.currentTarget.parentElement!.getBoundingClientRect()
                const startX = event.clientX, startY = event.clientY
                const origin = layouts[id]
                event.currentTarget.setPointerCapture(event.pointerId)
                const move = (e: PointerEvent) => updateLayer(id, {
                  x: origin.x + ((e.clientX - startX) / scene.width) * 100,
                  y: origin.y + ((e.clientY - startY) / scene.height) * 100,
                })
                const up = () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
                window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
              }} />
          ))}
        </section>
        <section className="editor-panel">
          <div className="editor-title"><div><p className="eyebrow">Scene Editor</p><h1>Alte Mühle</h1></div><button onClick={copyLayout}>{copied ? 'Kopiert' : 'Layout kopieren'}</button></div>
          <div className="layer-tabs">{layerIds.map(id => <button key={id} className={id === selectedLayer ? 'active' : ''} onClick={() => setSelectedLayer(id)}>{id}</button>)}</div>
          <div className="editor-controls">
            {(['x','y','width','rotation','opacity'] as const).map(key => {
              const step = key === 'opacity' ? .05 : key === 'rotation' ? 1 : .5
              return <div className="editor-control" key={key}><span>{key}</span><button onClick={() => updateLayer(selectedLayer,{[key]: active[key]-step})}>−</button><output>{active[key].toFixed(key === 'opacity' ? 2 : 1)}</output><button onClick={() => updateLayer(selectedLayer,{[key]: active[key]+step})}>+</button></div>
            })}
          </div>
          <p className="editor-help">Sprite antippen und direkt im Bild ziehen. Die Werte werden automatisch auf diesem Gerät gespeichert.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="game-shell">
      {screen === 'map' && <section className="map-screen screen"><header className="map-header"><p className="eyebrow">ECHO · Weltkarte</p><div className="map-title-row"><h1>Die Welt erinnert sich.</h1><span className="resource-pill">✦ 3</span></div><p className="map-intro">Nur wenige Orte antworten noch. Einer davon ruft nach dir.</p></header><div className="map-stage" aria-label="Weltkarte"><div className="map-haze map-haze-a"/><div className="map-haze map-haze-b"/><div className="river"/><button className="location-node village-node" type="button" disabled><span className="node-dot muted"/><span className="location-label"><strong>Dorf am Fluss</strong><small>später</small></span></button><button className="location-node mill-node active" type="button" onClick={()=>setScreen('mill')}><span className="node-dot"/><span className="location-label"><strong>Alte Mühle</strong><small>etwas hat sich verändert</small></span></button><button className="location-node forest-node" type="button" disabled><span className="node-dot muted"/><span className="location-label"><strong>Vergessener Wald</strong><small>unentdeckt</small></span></button></div><div className="map-footer"><span className="map-footer-line"/><p>Tippe auf die Alte Mühle.</p></div></section>}
      {screen !== 'map' && <section className="location-screen screen"><div className={`mill-scene ${choice?'changed':''}`}><img className="scene-background" src={oldMill.background} alt="Verlassene alte Wassermühle"/><div className="scene-shade"/><header className="location-header"><button className="icon-button" type="button" onClick={()=>setScreen('map')} aria-label="Zur Weltkarte">←</button><div><p className="eyebrow">Ort entdeckt</p><h2>{oldMill.name}</h2><p>{oldMill.subtitle}</p></div></header>
      {choice==='repair'&&<><img className="scene-sprite" style={layerStyle('waterwheel')} src={oldMill.layers.waterwheel} alt=""/><img className="scene-vfx" style={layerStyle('splash')} src={oldMill.layers.splash} alt=""/><img className="scene-vfx" style={layerStyle('ripples')} src={oldMill.layers.ripples} alt=""/><img className="scene-sprite" style={layerStyle('vines')} src={oldMill.layers.vines} alt=""/></>}
      {choice&&<><img className="scene-sprite" style={layerStyle('window')} src={oldMill.layers.window} alt=""/><img className="scene-vfx window-vfx" style={layerStyle('glow')} src={oldMill.layers.glow} alt=""/><img className="scene-vfx motes-vfx" style={layerStyle('motes')} src={oldMill.layers.motes} alt=""/></>}{choice==='preserve'&&<img className="scene-sprite" style={layerStyle('nest')} src={oldMill.layers.nest} alt=""/>}
      {screen==='mill'&&!choice&&oldMill.hotspots.map(item=><button key={item.id} type="button" className="hotspot" style={{left:`${item.x}%`,top:`${item.y}%`}} onClick={()=>inspectHotspot(item.id)} aria-label={item.label}><span className="hotspot-core"/><span className="hotspot-ring"/></button>)}</div>
      {screen==='mill'&&!choice&&<div className="story-card"><span className="story-handle"/><p>Das Rad steht still. Im oberen Fenster liegt nur Dunkelheit. Zwischen den Balken raschelt etwas.</p><p className="instruction">Untersuche einen leuchtenden Punkt.</p></div>}
      {screen==='echo'&&<div className="bottom-sheet"><span className="sheet-handle"/><p className="eyebrow">Echo wählen</p><h3>Wer soll sich das ansehen?</h3><button className="echo-card" type="button" onClick={()=>setScreen('choice')}><img src={oldMill.lumen} alt="Lumen"/><span><strong>Lumen</strong><small>Licht · verborgenes sichtbar machen</small></span><b>→</b></button><p className="context-note">Lumen schaut neugierig zum {hotspot==='window'?'dunklen Fenster':hotspot==='wheel'?'alten Rad':'dichten Bewuchs'}.</p></div>}
      {screen==='choice'&&<div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><div className="echo-reaction"><img src={oldMill.lumen} alt="Lumen"/><div><p className="eyebrow">Lumen reagiert</p><h3>Im Holz verlaufen alte Spuren von Licht.</h3></div></div><p>Lumen macht einen verborgenen Mechanismus sichtbar. Hinter den Ranken liegt zugleich ein kleines Nest.</p><div className="choice-grid"><button type="button" onClick={()=>{setChoice('preserve');setScreen('result')}}><strong>Das Nest schützen</strong><small>Nur vorsichtig Platz schaffen.</small></button><button type="button" onClick={()=>{setChoice('repair');setScreen('result')}}><strong>Das Rad reparieren</strong><small>Ranken zurückschneiden und den Mechanismus öffnen.</small></button></div></div>}
      {screen==='result'&&<div className="bottom-sheet result-sheet"><span className="sheet-handle"/><p className="eyebrow">Die Welt hat sich verändert</p><h3>{choice==='repair'?'Wasser läuft wieder durch das alte Rad.':'Zwischen den alten Balken bleibt ein geschützter Ort.'}</h3><div className="journal-note"><span>Tagebuch</span><p>{journal}</p></div><div className="result-actions"><button className="primary-button" type="button" onClick={()=>setScreen('mill')}>Ort ansehen</button><button className="secondary-button" type="button" onClick={reset}>Von vorn testen</button></div></div>}</section>}
    </main>
  )
}
