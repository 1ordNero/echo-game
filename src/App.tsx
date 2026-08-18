import { useRef, useState } from 'react'
import { oldMill } from './content/oldMill'
import { completeOldMill, createNewGame, loadGame, saveGame, type GameSave, type MillChoice } from './game/saveGame'

type Screen = 'map' | 'mill' | 'echo' | 'choice' | 'result' | 'journal'
type HotspotId = (typeof oldMill.hotspots)[number]['id']
type LayerId = keyof typeof oldMill.layers
type LayerLayout = {
  x: number; y: number; width: number; rotation: number; opacity: number
  scaleX: number; scaleY: number; skewX: number; skewY: number
  rotateX: number; rotateY: number; perspective: number; visible: boolean
}
type Layouts = Record<LayerId, LayerLayout>

const baseTransform = { scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true }
const defaultLayouts: Layouts = {
  waterwheel: { x: 32.52083333333333, y: 37.50700505574543, width: 32, rotation: 0, opacity: 1, ...baseTransform, rotateY: -14 },
  window: { x: 53, y: 21, width: 9.5, rotation: 0, opacity: 1, ...baseTransform },
  vines: { x: 27.66796875, y: 54.38427734375, width: 14, rotation: 90, opacity: 1, ...baseTransform },
  nest: { x: 28.474609375, y: 47.4990218480428, width: 12, rotation: -14, opacity: .75, ...baseTransform, rotateX: -29 },
  glow: { x: 50.43359375, y: 18.594482421875, width: 12, rotation: 180, opacity: .63, ...baseTransform },
  splash: { x: 51.515625, y: 64.609619140625, width: 15.5, rotation: 0, opacity: .78, ...baseTransform },
  ripples: { x: 47.5537109375, y: 68.64404296875, width: 19.5, rotation: -8, opacity: .62, ...baseTransform },
  motes: { x: 25.294921875, y: 43.1022965113322, width: 21.868958987422268, rotation: 2.060939621710247, opacity: .65, ...baseTransform },
}

const layerIds = Object.keys(oldMill.layers) as LayerId[]
const basicKeys = ['x', 'y', 'width', 'rotation', 'opacity'] as const
const advancedKeys = ['scaleX', 'scaleY', 'skewX', 'skewY', 'rotateX', 'rotateY', 'perspective'] as const
type NumericKey = typeof basicKeys[number] | typeof advancedKeys[number]

function normalizeLayouts(raw?: Partial<Record<LayerId, Partial<LayerLayout>>>): Layouts {
  return Object.fromEntries(layerIds.map(id => [id, { ...defaultLayouts[id], ...(raw?.[id] ?? {}) }])) as Layouts
}
function loadLayouts(): Layouts {
  try {
    const saved = localStorage.getItem('echo-old-mill-layout-v2') || localStorage.getItem('echo-old-mill-layout')
    return saved ? normalizeLayouts(JSON.parse(saved)) : defaultLayouts
  } catch { return defaultLayouts }
}
function loadZoom() {
  const saved = Number(localStorage.getItem('echo-scene-editor-zoom'))
  return Number.isFinite(saved) && saved >= 100 && saved <= 300 ? saved : 100
}
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const angleBetween = (a: PointerEvent | React.PointerEvent, b: PointerEvent | React.PointerEvent) => Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI
const distanceBetween = (a: PointerEvent | React.PointerEvent, b: PointerEvent | React.PointerEvent) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)

export default function App() {
  const editorMode = new URLSearchParams(window.location.search).get('editor') === '1'
  const [screen, setScreen] = useState<Screen>('map')
  const [hotspot, setHotspot] = useState<HotspotId>('window')
  const [save, setSave] = useState<GameSave>(loadGame)
  const [sessionChoice, setSessionChoice] = useState<MillChoice | null>(null)
  const [layouts, setLayouts] = useState<Layouts>(loadLayouts)
  const [selectedLayer, setSelectedLayer] = useState<LayerId>('waterwheel')
  const [copied, setCopied] = useState(false)
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [history, setHistory] = useState<Layouts[]>([])
  const [sceneZoom, setSceneZoom] = useState(loadZoom)
  const pointers = useRef(new Map<number, PointerEvent | React.PointerEvent>())
  const gesture = useRef<{ id: LayerId; x: number; y: number; width: number; rotation: number; startX: number; startY: number; distance?: number; angle?: number } | null>(null)

  const persistedChoice = save.oldMill.choice
  const activeChoice = sessionChoice ?? persistedChoice
  const millChanged = save.oldMill.state !== 'ABANDONED' || sessionChoice !== null
  const millStatus = save.oldMill.state === 'REPAIRED' ? 'das Rad läuft wieder' : save.oldMill.state === 'DISCOVERED' ? 'ein geschützter Ort' : 'etwas wartet hier'
  const journalText = activeChoice === 'preserve'
    ? 'Lumen fand Wärme im alten Gemäuer. Wir ließen das Nest unberührt und öffneten nur den Weg zum Rad.'
    : 'Lumen zeigte uns den verborgenen Mechanismus. Wir schnitten die Ranken zurück und brachten das Rad wieder in Bewegung.'

  const commitChoice = (choice: MillChoice) => {
    const next = completeOldMill(save, choice)
    saveGame(next)
    setSave(next)
    setSessionChoice(choice)
    setScreen('result')
  }
  const resetGame = () => {
    const next = createNewGame()
    saveGame(next)
    setSave(next)
    setSessionChoice(null)
    setHotspot('window')
    setScreen('map')
  }

  const persistLayout = (next: Layouts) => localStorage.setItem('echo-old-mill-layout-v2', JSON.stringify(next))
  const updateLayer = (id: LayerId, patch: Partial<LayerLayout>, addHistory = false) => setLayouts(current => {
    if (addHistory) setHistory(items => [...items.slice(-29), current])
    const next = { ...current, [id]: { ...current[id], ...patch } }
    persistLayout(next)
    return next
  })
  const layerStyle = (id: LayerId) => {
    const value = layouts[id]
    return {
      left: `${value.x}%`, top: `${value.y}%`, width: `${value.width}%`, opacity: value.visible ? value.opacity : 0,
      transformOrigin: 'center center',
      transform: `perspective(${value.perspective}px) rotateX(${value.rotateX}deg) rotateY(${value.rotateY}deg) rotateZ(${value.rotation}deg) skew(${value.skewX}deg, ${value.skewY}deg) scale(${value.scaleX}, ${value.scaleY})`,
    }
  }
  const copyLayout = async () => {
    await navigator.clipboard.writeText(JSON.stringify(layouts, null, 2))
    setCopied(true); window.setTimeout(() => setCopied(false), 1400)
  }
  const undo = () => setHistory(items => {
    if (!items.length) return items
    const previous = items[items.length - 1]
    setLayouts(previous); persistLayout(previous)
    return items.slice(0, -1)
  })
  const resetSelected = () => updateLayer(selectedLayer, defaultLayouts[selectedLayer], true)
  const setNumeric = (key: NumericKey, raw: string) => {
    const value = Number(raw.replace(',', '.'))
    if (!Number.isFinite(value)) return
    const bounded = key === 'opacity' ? clamp(value, 0, 1) : key === 'scaleX' || key === 'scaleY' ? clamp(value, .1, 4) : key === 'perspective' ? clamp(value, 100, 3000) : value
    updateLayer(selectedLayer, { [key]: bounded }, true)
  }
  const stepFor = (key: NumericKey) => key === 'opacity' ? .05 : key === 'rotation' || key === 'skewX' || key === 'skewY' || key === 'rotateX' || key === 'rotateY' ? 1 : key === 'scaleX' || key === 'scaleY' ? .05 : key === 'perspective' ? 50 : .5
  const changeZoom = (value: number) => {
    const next = clamp(value, 100, 300)
    setSceneZoom(next)
    localStorage.setItem('echo-scene-editor-zoom', String(next))
  }
  const pointerDown = (event: React.PointerEvent<HTMLImageElement>, id: LayerId) => {
    event.preventDefault(); setSelectedLayer(id); event.currentTarget.setPointerCapture(event.pointerId); pointers.current.set(event.pointerId, event)
    const origin = layouts[id]
    gesture.current = { id, x: origin.x, y: origin.y, width: origin.width, rotation: origin.rotation, startX: event.clientX, startY: event.clientY }
    setHistory(items => [...items.slice(-29), layouts])
  }
  const pointerMove = (event: React.PointerEvent<HTMLImageElement>) => {
    if (!gesture.current) return
    pointers.current.set(event.pointerId, event)
    const points = [...pointers.current.values()]
    const scene = event.currentTarget.parentElement!.getBoundingClientRect()
    const state = gesture.current
    if (points.length >= 2) {
      const [a, b] = points
      if (!state.distance) { state.distance = distanceBetween(a, b); state.angle = angleBetween(a, b); state.width = layouts[state.id].width; state.rotation = layouts[state.id].rotation; return }
      updateLayer(state.id, { width: clamp(state.width * (distanceBetween(a, b) / state.distance), 2, 90), rotation: state.rotation + angleBetween(a, b) - (state.angle ?? 0) })
    } else updateLayer(state.id, { x: state.x + ((event.clientX - state.startX) / scene.width) * 100, y: state.y + ((event.clientY - state.startY) / scene.height) * 100 })
  }
  const pointerUp = (event: React.PointerEvent<HTMLImageElement>) => {
    pointers.current.delete(event.pointerId)
    if (pointers.current.size === 0) gesture.current = null
    else if (gesture.current) {
      const remaining = [...pointers.current.values()][0]
      gesture.current.startX = remaining.clientX; gesture.current.startY = remaining.clientY
      gesture.current.x = layouts[gesture.current.id].x; gesture.current.y = layouts[gesture.current.id].y
      gesture.current.distance = undefined; gesture.current.angle = undefined
    }
  }

  if (editorMode) {
    const active = layouts[selectedLayer]
    const renderControl = (key: NumericKey) => {
      const step = stepFor(key)
      const decimals = key === 'opacity' || key === 'scaleX' || key === 'scaleY' ? 2 : 1
      return <div className="editor-control" key={key}><span>{key}</span><button onClick={() => updateLayer(selectedLayer, { [key]: active[key] - step }, true)}>−</button><input aria-label={key} type="text" inputMode="decimal" value={Number(active[key].toFixed(decimals))} onChange={e => setNumeric(key, e.target.value)} /><button onClick={() => updateLayer(selectedLayer, { [key]: active[key] + step }, true)}>+</button></div>
    }
    return <main className="editor-shell"><div className="editor-preview"><div className="zoom-bar"><span>Ansicht</span><button onClick={() => changeZoom(sceneZoom - 25)} disabled={sceneZoom <= 100}>−</button><output>{sceneZoom}%</output><button onClick={() => changeZoom(sceneZoom + 25)} disabled={sceneZoom >= 300}>+</button><button className="zoom-fit" onClick={() => changeZoom(100)}>Einpassen</button></div><div className="editor-viewport"><section className="editor-scene" style={{ width: `${sceneZoom}%` }}><img className="scene-background" src={oldMill.background} alt="Alte Mühle" />{layerIds.map(id => <img key={id} src={oldMill.layers[id]} alt={id} className={`editor-layer ${selectedLayer === id ? 'selected' : ''} ${!layouts[id].visible ? 'hidden-layer' : ''}`} style={layerStyle(id)} onPointerDown={e => pointerDown(e, id)} onPointerMove={pointerMove} onPointerUp={pointerUp} onPointerCancel={pointerUp} />)}</section></div></div><section className="editor-panel"><div className="editor-title"><div><p className="eyebrow">Scene Editor V2</p><h1>Alte Mühle</h1></div><button onClick={copyLayout}>{copied ? 'Kopiert' : 'Layout kopieren'}</button></div><div className="editor-toolbar"><button onClick={undo} disabled={!history.length}>↶ Undo</button><button onClick={resetSelected}>Zurücksetzen</button><button className={active.visible ? 'active' : ''} onClick={() => updateLayer(selectedLayer, { visible: !active.visible }, true)}>{active.visible ? 'Sichtbar' : 'Ausgeblendet'}</button></div><div className="layer-tabs">{layerIds.map(id => <button key={id} className={id === selectedLayer ? 'active' : ''} onClick={() => setSelectedLayer(id)}>{id}</button>)}</div><div className="editor-section-label">Position & Größe</div><div className="editor-controls">{basicKeys.map(renderControl)}</div><button className="advanced-toggle" onClick={() => setAdvancedOpen(open => !open)}><span>Perspektive & Neigung</span><span>{advancedOpen ? '▴' : '▾'}</span></button>{advancedOpen && <div className="editor-controls advanced-controls">{advancedKeys.map(renderControl)}</div>}<p className="editor-help"><strong>Touch:</strong> 1 Finger verschiebt. 2 Finger skalieren und drehen. Die Werte werden lokal gespeichert.</p></section></main>
  }

  if (screen === 'journal') return <main className="game-shell"><section className="journal-screen screen"><header className="journal-header"><button className="icon-button" onClick={() => setScreen('map')}>←</button><div><p className="eyebrow">Tagebuch</p><h1>Erinnerungen</h1></div></header>{save.journal.length ? <div className="journal-list">{save.journal.map(entry => <article className="journal-entry" key={entry.id}><p className="eyebrow">{entry.title}</p><p>{entry.body}</p></article>)}</div> : <p className="journal-empty">Noch wurde keine Erinnerung festgehalten.</p>}</section></main>

  if (screen === 'map') return <main className="game-shell"><section className="map-screen screen"><header className="map-header"><p className="eyebrow">ECHO · Weltkarte</p><div className="map-title-row"><h1>Die Welt erinnert sich.</h1><span className="resource-pill">✦ 3</span></div><p className="map-intro">Nur wenige Orte antworten noch. Einer davon ruft nach dir.</p><button className="journal-button" onClick={() => setScreen('journal')}>Tagebuch <span>{save.journal.length}</span></button></header><div className="map-stage"><div className="map-haze map-haze-a"/><div className="map-haze map-haze-b"/><div className="river"/><button className="location-node village-node" disabled><span className="node-dot muted"/><span className="location-label"><strong>Dorf am Fluss</strong><small>später</small></span></button><button className="location-node mill-node active" onClick={() => { setSessionChoice(null); setScreen('mill') }}><span className="node-dot"/><span className="location-label"><strong>Alte Mühle</strong><small>{millStatus}</small></span></button><button className="location-node forest-node" disabled><span className="node-dot muted"/><span className="location-label"><strong>Vergessener Wald</strong><small>unentdeckt</small></span></button></div><div className="map-footer"><span className="map-footer-line"/><p>{save.oldMill.state === 'ABANDONED' ? 'Tippe auf die Alte Mühle.' : 'Deine Entscheidung bleibt in der Welt bestehen.'}</p></div></section></main>

  return <main className="game-shell"><section className="location-screen screen"><div className={`mill-scene ${millChanged ? 'changed' : ''}`}><img className="scene-background" src={oldMill.background} alt="Verlassene alte Wassermühle"/><div className="scene-shade"/><header className="location-header"><button className="icon-button" onClick={() => setScreen('map')}>←</button><div><p className="eyebrow">{save.oldMill.state === 'ABANDONED' ? 'Ort entdeckt' : 'Ort erinnert sich'}</p><h2>{oldMill.name}</h2><p>{save.oldMill.state === 'ABANDONED' ? oldMill.subtitle : millStatus}</p></div></header>
  {activeChoice === 'repair' && <><img className="scene-sprite" style={layerStyle('waterwheel')} src={oldMill.layers.waterwheel} alt=""/><img className="scene-vfx" style={layerStyle('splash')} src={oldMill.layers.splash} alt=""/><img className="scene-vfx" style={layerStyle('ripples')} src={oldMill.layers.ripples} alt=""/><img className="scene-sprite" style={layerStyle('vines')} src={oldMill.layers.vines} alt=""/></>}
  {activeChoice && <><img className="scene-sprite" style={layerStyle('window')} src={oldMill.layers.window} alt=""/><img className="scene-vfx window-vfx" style={layerStyle('glow')} src={oldMill.layers.glow} alt=""/><img className="scene-vfx motes-vfx" style={layerStyle('motes')} src={oldMill.layers.motes} alt=""/></>}
  {activeChoice === 'preserve' && <img className="scene-sprite" style={layerStyle('nest')} src={oldMill.layers.nest} alt=""/>}
  {screen === 'mill' && save.oldMill.state === 'ABANDONED' && oldMill.hotspots.map(item => <button key={item.id} className="hotspot" style={{left:`${item.x}%`,top:`${item.y}%`}} onClick={() => { setHotspot(item.id); setScreen('echo') }}><span className="hotspot-core"/><span className="hotspot-ring"/></button>)}</div>
  {screen === 'mill' && save.oldMill.state === 'ABANDONED' && <div className="story-card"><span className="story-handle"/><p>Das Rad steht still. Im oberen Fenster liegt nur Dunkelheit. Zwischen den Balken raschelt etwas.</p><p className="instruction">Untersuche einen leuchtenden Punkt.</p></div>}
  {screen === 'mill' && save.oldMill.state !== 'ABANDONED' && <div className="story-card persistent-card"><span className="story-handle"/><p className="eyebrow">Gespeicherter Weltzustand</p><p>{save.oldMill.state === 'REPAIRED' ? 'Das Rad arbeitet wieder. Wasser und Licht sind an die Alte Mühle zurückgekehrt.' : 'Das Nest bleibt geschützt. Lumen erinnert sich an das Licht zwischen den Balken.'}</p><div className="persistent-actions"><button className="secondary-button" onClick={() => setScreen('journal')}>Tagebuch</button><button className="secondary-button" onClick={resetGame}>Spielstand zurücksetzen</button></div></div>}
  {screen === 'echo' && <div className="bottom-sheet"><span className="sheet-handle"/><p className="eyebrow">Echo wählen</p><h3>Wer soll sich das ansehen?</h3><button className="echo-card" onClick={() => setScreen('choice')}><img src={oldMill.lumen} alt="Lumen"/><span><strong>Lumen</strong><small>Licht · verborgenes sichtbar machen</small></span><b>→</b></button><p className="context-note">Lumen schaut neugierig zum {hotspot === 'window' ? 'dunklen Fenster' : hotspot === 'wheel' ? 'alten Rad' : 'dichten Bewuchs'}.</p></div>}
  {screen === 'choice' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><div className="echo-reaction"><img src={oldMill.lumen} alt="Lumen"/><div><p className="eyebrow">Lumen reagiert</p><h3>Im Holz verlaufen alte Spuren von Licht.</h3></div></div><p>Lumen macht einen verborgenen Mechanismus sichtbar. Hinter den Ranken liegt zugleich ein kleines Nest.</p><div className="choice-grid"><button onClick={() => commitChoice('preserve')}><strong>Das Nest schützen</strong><small>Nur vorsichtig Platz schaffen.</small></button><button onClick={() => commitChoice('repair')}><strong>Das Rad reparieren</strong><small>Ranken zurückschneiden und den Mechanismus öffnen.</small></button></div></div>}
  {screen === 'result' && <div className="bottom-sheet result-sheet"><span className="sheet-handle"/><p className="eyebrow">Die Welt hat sich verändert</p><h3>{activeChoice === 'repair' ? 'Wasser läuft wieder durch das alte Rad.' : 'Zwischen den alten Balken bleibt ein geschützter Ort.'}</h3><div className="journal-note"><span>Tagebuch · gespeichert</span><p>{journalText}</p></div><div className="result-actions"><button className="primary-button" onClick={() => setScreen('mill')}>Ort ansehen</button><button className="secondary-button" onClick={() => setScreen('map')}>Zur Weltkarte</button></div></div>}
  </section></main>
}
