import { useRef, useState } from 'react'
import { forgottenForest } from './content/forgottenForest'
import { completeForgottenForest, loadGame, saveGame, type ForestChoice, type GameSave } from './game/saveGame'

type ForestLayerId = keyof typeof forgottenForest.layers
type LayerLayout = {
  x: number; y: number; width: number; rotation: number; opacity: number
  scaleX: number; scaleY: number; skewX: number; skewY: number
  rotateX: number; rotateY: number; perspective: number; visible: boolean
}
type Layouts = Record<ForestLayerId, LayerLayout>
type ForestScreen = 'scene' | 'echo' | 'choice' | 'result'

const base = { scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true }
const defaultLayouts: Layouts = {
  roots: { x: 2, y: 47, width: 45, rotation: 0, opacity: 1, ...base },
  stones: { x: 59, y: 42, width: 31, rotation: 0, opacity: 1, ...base },
  moss: { x: 10, y: 45, width: 75, rotation: 0, opacity: .72, ...base },
  leaves: { x: 7, y: 8, width: 86, rotation: 0, opacity: .46, ...base },
  particles: { x: 0, y: 0, width: 100, rotation: 0, opacity: .45, ...base },
  light: { x: 0, y: 0, width: 100, rotation: 0, opacity: .52, ...base },
}
const ids = Object.keys(forgottenForest.layers) as ForestLayerId[]
const basicKeys = ['x', 'y', 'width', 'rotation', 'opacity'] as const
const advancedKeys = ['scaleX', 'scaleY', 'skewX', 'skewY', 'rotateX', 'rotateY', 'perspective'] as const
type NumericKey = typeof basicKeys[number] | typeof advancedKeys[number]
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function loadLayouts(): Layouts {
  try {
    const raw = localStorage.getItem('echo-forgotten-forest-layout-v1')
    if (!raw) return defaultLayouts
    const parsed = JSON.parse(raw) as Partial<Record<ForestLayerId, Partial<LayerLayout>>>
    return Object.fromEntries(ids.map(id => [id, { ...defaultLayouts[id], ...(parsed[id] ?? {}) }])) as Layouts
  } catch { return defaultLayouts }
}
function styleFor(value: LayerLayout) {
  return {
    left: `${value.x}%`, top: `${value.y}%`, width: `${value.width}%`, opacity: value.visible ? value.opacity : 0,
    transformOrigin: 'center center',
    transform: `perspective(${value.perspective}px) rotateX(${value.rotateX}deg) rotateY(${value.rotateY}deg) rotateZ(${value.rotation}deg) skew(${value.skewX}deg, ${value.skewY}deg) scale(${value.scaleX}, ${value.scaleY})`,
  }
}
const isVfx = (id: ForestLayerId) => id === 'light' || id === 'particles' || id === 'leaves'

export function ForgottenForestEditor() {
  const [layouts, setLayouts] = useState<Layouts>(loadLayouts)
  const [selected, setSelected] = useState<ForestLayerId>('roots')
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem('echo-forest-editor-zoom')) || 100)
  const [advanced, setAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<Layouts[]>([])
  const pointers = useRef(new Map<number, React.PointerEvent<HTMLImageElement>>())
  const gesture = useRef<{ id: ForestLayerId; x: number; y: number; width: number; rotation: number; startX: number; startY: number; distance?: number; angle?: number } | null>(null)

  const persist = (next: Layouts) => localStorage.setItem('echo-forgotten-forest-layout-v1', JSON.stringify(next))
  const update = (id: ForestLayerId, patch: Partial<LayerLayout>, remember = false) => setLayouts(current => {
    if (remember) setHistory(items => [...items.slice(-29), current])
    const next = { ...current, [id]: { ...current[id], ...patch } }
    persist(next); return next
  })
  const setNumeric = (key: NumericKey, raw: string) => {
    const n = Number(raw.replace(',', '.')); if (!Number.isFinite(n)) return
    const value = key === 'opacity' ? clamp(n, 0, 1) : key === 'scaleX' || key === 'scaleY' ? clamp(n, .1, 4) : key === 'perspective' ? clamp(n, 100, 3000) : n
    update(selected, { [key]: value }, true)
  }
  const step = (key: NumericKey) => key === 'opacity' ? .05 : key === 'scaleX' || key === 'scaleY' ? .05 : key === 'perspective' ? 50 : key === 'x' || key === 'y' || key === 'width' ? .5 : 1
  const active = layouts[selected]
  const control = (key: NumericKey) => <div className="editor-control" key={key}><span>{key}</span><button onClick={() => update(selected, { [key]: active[key] - step(key) }, true)}>−</button><input type="text" inputMode="decimal" value={Number(active[key].toFixed(key === 'opacity' || key === 'scaleX' || key === 'scaleY' ? 2 : 1))} onChange={e => setNumeric(key, e.target.value)} /><button onClick={() => update(selected, { [key]: active[key] + step(key) }, true)}>+</button></div>
  const undo = () => setHistory(items => {
    if (!items.length) return items
    const previous = items[items.length - 1]; setLayouts(previous); persist(previous); return items.slice(0, -1)
  })
  const copy = async () => { await navigator.clipboard.writeText(JSON.stringify(layouts, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  const setZoom = (value: number) => { const z = clamp(value, 100, 300); setZoomState(z) }
  const [zoomState, setZoomState] = useState(zoom)
  const zoomTo = (value: number) => { const z = clamp(value, 100, 300); setZoomState(z); localStorage.setItem('echo-forest-editor-zoom', String(z)) }
  const distance = (a: React.PointerEvent, b: React.PointerEvent) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
  const angle = (a: React.PointerEvent, b: React.PointerEvent) => Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI
  const down = (e: React.PointerEvent<HTMLImageElement>, id: ForestLayerId) => {
    e.preventDefault(); setSelected(id); e.currentTarget.setPointerCapture(e.pointerId); pointers.current.set(e.pointerId, e)
    const v = layouts[id]; gesture.current = { id, x: v.x, y: v.y, width: v.width, rotation: v.rotation, startX: e.clientX, startY: e.clientY }
    setHistory(items => [...items.slice(-29), layouts])
  }
  const move = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!gesture.current) return
    pointers.current.set(e.pointerId, e); const pts = [...pointers.current.values()]; const g = gesture.current
    const rect = e.currentTarget.parentElement!.getBoundingClientRect()
    if (pts.length >= 2) {
      const [a,b] = pts
      if (!g.distance) { g.distance = distance(a,b); g.angle = angle(a,b); g.width = layouts[g.id].width; g.rotation = layouts[g.id].rotation; return }
      update(g.id, { width: clamp(g.width * distance(a,b) / g.distance, 2, 110), rotation: g.rotation + angle(a,b) - (g.angle ?? 0) })
    } else update(g.id, { x: g.x + (e.clientX - g.startX) / rect.width * 100, y: g.y + (e.clientY - g.startY) / rect.height * 100 })
  }
  const up = (e: React.PointerEvent<HTMLImageElement>) => { pointers.current.delete(e.pointerId); if (!pointers.current.size) gesture.current = null }

  return <main className="editor-shell"><div className="editor-preview"><div className="zoom-bar"><span>Vergessener Wald</span><button onClick={() => zoomTo(zoomState - 25)}>−</button><output>{zoomState}%</output><button onClick={() => zoomTo(zoomState + 25)}>+</button><button className="zoom-fit" onClick={() => zoomTo(100)}>Einpassen</button></div><div className="editor-viewport"><section className="editor-scene" style={{ width: `${zoomState}%` }}><img className="scene-background" src={forgottenForest.background} alt="Vergessener Wald" />{ids.map(id => <img key={id} src={forgottenForest.layers[id]} alt={id} className={`editor-layer ${selected === id ? 'selected' : ''}`} style={{ ...styleFor(layouts[id]), mixBlendMode: isVfx(id) ? 'screen' : undefined }} onPointerDown={e => down(e,id)} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />)}</section></div></div><section className="editor-panel"><div className="editor-title"><div><p className="eyebrow">Scene Editor V2</p><h1>Vergessener Wald</h1></div><button onClick={copy}>{copied ? 'Kopiert' : 'Layout kopieren'}</button></div><div className="editor-toolbar"><button onClick={undo} disabled={!history.length}>↶ Undo</button><button onClick={() => update(selected, defaultLayouts[selected], true)}>Zurücksetzen</button><button className={active.visible ? 'active' : ''} onClick={() => update(selected, { visible: !active.visible }, true)}>{active.visible ? 'Sichtbar' : 'Ausgeblendet'}</button></div><div className="layer-tabs">{ids.map(id => <button key={id} className={id === selected ? 'active' : ''} onClick={() => setSelected(id)}>{id}</button>)}</div><div className="editor-section-label">Position & Größe</div><div className="editor-controls">{basicKeys.map(control)}</div><button className="advanced-toggle" onClick={() => setAdvanced(v => !v)}><span>Perspektive & Neigung</span><span>{advanced ? '▴' : '▾'}</span></button>{advanced && <div className="editor-controls advanced-controls">{advancedKeys.map(control)}</div>}<p className="editor-help"><strong>Touch:</strong> 1 Finger verschiebt. 2 Finger skalieren und drehen. Alles wird lokal gespeichert.</p></section></main>
}

export function ForgottenForestGame() {
  const [save, setSave] = useState<GameSave>(loadGame)
  const [screen, setScreen] = useState<ForestScreen>('scene')
  const [choice, setChoice] = useState<ForestChoice | null>(save.forgottenForest.choice)
  const layouts = loadLayouts()
  const changed = Boolean(choice)
  const complete = (nextChoice: ForestChoice) => { const next = completeForgottenForest(save, nextChoice); saveGame(next); setSave(next); setChoice(nextChoice); setScreen('result') }
  const back = () => { window.location.href = import.meta.env.BASE_URL }

  return <main className="game-shell"><section className="location-screen screen"><div className={`mill-scene ${changed ? 'changed' : ''}`}><img className="scene-background" src={forgottenForest.background} alt="Vergessener Wald"/><div className="scene-shade"/><header className="location-header"><button className="icon-button" onClick={back}>←</button><div><p className="eyebrow">{save.forgottenForest.state === 'STILL' ? 'Ort entdeckt' : 'Ort erinnert sich'}</p><h2>{forgottenForest.name}</h2><p>{save.forgottenForest.state === 'STILL' ? forgottenForest.subtitle : save.forgottenForest.state === 'AWAKENING' ? 'Unter der Erde beginnt sich etwas zu regen.' : 'Zwischen Moos und Stein ist eine alte Erinnerung sichtbar geworden.'}</p></div></header>{choice === 'awaken-roots' && <><img className="scene-sprite" style={styleFor(layouts.roots)} src={forgottenForest.layers.roots} alt=""/><img className="scene-sprite" style={styleFor(layouts.moss)} src={forgottenForest.layers.moss} alt=""/></>}{choice === 'reveal-stones' && <img className="scene-sprite" style={styleFor(layouts.stones)} src={forgottenForest.layers.stones} alt=""/>}{changed && <><img className="scene-vfx" style={{...styleFor(layouts.light),mixBlendMode:'screen'}} src={forgottenForest.layers.light} alt=""/><img className="scene-vfx" style={{...styleFor(layouts.particles),mixBlendMode:'screen'}} src={forgottenForest.layers.particles} alt=""/><img className="scene-vfx" style={{...styleFor(layouts.leaves),mixBlendMode:'screen'}} src={forgottenForest.layers.leaves} alt=""/></>}{screen === 'scene' && save.forgottenForest.state === 'STILL' && forgottenForest.hotspots.map(h => <button key={h.id} className="hotspot" style={{left:`${h.x}%`,top:`${h.y}%`}} onClick={() => setScreen('echo')}><span className="hotspot-core"/><span className="hotspot-ring"/></button>)}</div>{screen === 'scene' && save.forgottenForest.state === 'STILL' && <div className="story-card"><span className="story-handle"/><p>Kein Blatt bewegt sich. Selbst der Wind scheint zwischen den Stämmen stehen geblieben zu sein.</p><p className="instruction">Untersuche einen leuchtenden Punkt.</p></div>}{screen === 'scene' && save.forgottenForest.state !== 'STILL' && <div className="story-card persistent-card"><span className="story-handle"/><p className="eyebrow">Gespeicherter Weltzustand</p><p>{choice === 'awaken-roots' ? 'Die Wurzeln haben ihre starre Ruhe verloren. Frisches Moos breitet sich zwischen ihnen aus.' : 'Die drei alten Steine sind wieder sichtbar. Ihre Zeichen wirken älter als der Pfad selbst.'}</p><div className="persistent-actions"><button className="secondary-button" onClick={back}>Zur Weltkarte</button><button className="secondary-button" onClick={() => window.location.href = `${import.meta.env.BASE_URL}?editor=1&scene=forest`}>Im Editor öffnen</button></div></div>}{screen === 'echo' && <div className="bottom-sheet"><span className="sheet-handle"/><p className="eyebrow">Echo wählen</p><h3>Wer soll dem Wald zuhören?</h3><button className="echo-card" onClick={() => setScreen('choice')}><img src={forgottenForest.echoes.mossi} alt="Mossi"/><span><strong>Mossi</strong><small>Wurzeln · Moos · verborgene Spuren</small></span><b>→</b></button><p className="context-note">Mossi wird still. Unter dem Pfad scheint etwas zu antworten.</p></div>}{screen === 'choice' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><div className="echo-reaction"><img src={forgottenForest.echoes.mossi} alt="Mossi"/><div><p className="eyebrow">Mossi reagiert</p><h3>Der Wald schläft nicht. Er wartet.</h3></div></div><p>Unter den Wurzeln liegt Bewegung. Zwischen den Steinen sitzt zugleich eine ältere Erinnerung fest.</p><div className="choice-grid"><button onClick={() => complete('awaken-roots')}><strong>Die Wurzeln wecken</strong><small>Mossi folgt dem lebenden Geflecht unter dem Boden.</small></button><button onClick={() => complete('reveal-stones')}><strong>Die Steine freilegen</strong><small>Moos und Wurzeln behutsam zur Seite führen.</small></button></div></div>}{screen === 'result' && <div className="bottom-sheet result-sheet"><span className="sheet-handle"/><p className="eyebrow">Die Welt hat sich verändert</p><h3>{choice === 'awaken-roots' ? 'Unter dem Waldboden beginnt wieder Bewegung.' : 'Drei vergessene Zeichen sind sichtbar geworden.'}</h3><div className="journal-note"><span>Tagebuch · gespeichert</span><p>{choice === 'awaken-roots' ? 'Mossi lauschte tief unter dem Waldboden. Die alten Wurzeln lösten sich aus ihrer starren Ruhe.' : 'Mossi schob Moos und Wurzeln zur Seite. Drei alte Steine kamen wieder zum Vorschein.'}</p></div><div className="result-actions"><button className="primary-button" onClick={() => setScreen('scene')}>Ort ansehen</button><button className="secondary-button" onClick={back}>Zur Weltkarte</button></div></div>}</section></main>
}
