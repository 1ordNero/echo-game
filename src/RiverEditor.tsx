import { useRef, useState } from 'react'
import { riverbank } from './content/riverbank'
import { defaultRiverLayouts, loadRiverLayouts, riverIsVfx, riverLayerIds, riverLayerStyle, riverPreviewStates, riverVisibleInState, saveRiverLayouts, type LayerLayout, type RiverLayerId, type RiverLayouts, type RiverPreviewState } from './riverbankLayout'

const basicKeys = ['x', 'y', 'width', 'rotation', 'opacity'] as const
const advancedKeys = ['scaleX', 'scaleY', 'skewX', 'skewY', 'rotateX', 'rotateY', 'perspective'] as const
type NumericKey = typeof basicKeys[number] | typeof advancedKeys[number]
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const stateLabels: Record<RiverPreviewState, string> = {
  undiscovered: 'Unentdeckt', discovered: 'Blockiert', investigating: 'Stein', echo_revealed: 'Echo', restored: 'Freigelegt',
}

const sourceFor = (id: RiverLayerId) => {
  if (id === 'dropi') return riverbank.echoes.dropi
  if (id === 'dropiRipple') return riverbank.echoes.dropiRipple
  return riverbank.layers[id]
}

export default function RiverEditor() {
  const [layouts, setLayouts] = useState<RiverLayouts>(loadRiverLayouts)
  const [selected, setSelected] = useState<RiverLayerId>('dam')
  const [previewState, setPreviewState] = useState<RiverPreviewState>('discovered')
  const [zoom, setZoom] = useState(() => Number(localStorage.getItem('echo-river-editor-zoom')) || 100)
  const [advanced, setAdvanced] = useState(false)
  const [copied, setCopied] = useState(false)
  const [history, setHistory] = useState<RiverLayouts[]>([])
  const pointers = useRef(new Map<number, React.PointerEvent<HTMLImageElement>>())
  const gesture = useRef<{ id: RiverLayerId; x: number; y: number; width: number; rotation: number; startX: number; startY: number; distance?: number; angle?: number } | null>(null)

  const persist = (next: RiverLayouts) => saveRiverLayouts(next)
  const update = (id: RiverLayerId, patch: Partial<LayerLayout>, remember = false) => setLayouts(current => {
    if (remember) setHistory(items => [...items.slice(-29), current])
    const next = { ...current, [id]: { ...current[id], ...patch } }
    persist(next)
    return next
  })
  const active = layouts[selected]
  const setNumeric = (key: NumericKey, raw: string) => {
    const n = Number(raw.replace(',', '.'))
    if (!Number.isFinite(n)) return
    const value = key === 'opacity' ? clamp(n, 0, 1) : key === 'scaleX' || key === 'scaleY' ? clamp(n, .1, 4) : key === 'perspective' ? clamp(n, 100, 3000) : n
    update(selected, { [key]: value }, true)
  }
  const step = (key: NumericKey) => key === 'opacity' ? .05 : key === 'scaleX' || key === 'scaleY' ? .05 : key === 'perspective' ? 50 : key === 'x' || key === 'y' || key === 'width' ? .5 : 1
  const control = (key: NumericKey) => <div className="editor-control" key={key}><span>{key}</span><button onClick={() => update(selected, { [key]: active[key] - step(key) }, true)}>−</button><input type="text" inputMode="decimal" value={Number(active[key].toFixed(key === 'opacity' || key === 'scaleX' || key === 'scaleY' ? 2 : 1))} onChange={e => setNumeric(key, e.target.value)} /><button onClick={() => update(selected, { [key]: active[key] + step(key) }, true)}>+</button></div>
  const undo = () => setHistory(items => {
    if (!items.length) return items
    const previous = items[items.length - 1]
    setLayouts(previous); persist(previous)
    return items.slice(0, -1)
  })
  const copy = async () => { await navigator.clipboard.writeText(JSON.stringify(layouts, null, 2)); setCopied(true); setTimeout(() => setCopied(false), 1200) }
  const zoomTo = (value: number) => { const z = clamp(value, 100, 300); setZoom(z); localStorage.setItem('echo-river-editor-zoom', String(z)) }
  const distance = (a: React.PointerEvent, b: React.PointerEvent) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY)
  const angle = (a: React.PointerEvent, b: React.PointerEvent) => Math.atan2(b.clientY - a.clientY, b.clientX - a.clientX) * 180 / Math.PI
  const down = (e: React.PointerEvent<HTMLImageElement>, id: RiverLayerId) => {
    e.preventDefault(); setSelected(id); e.currentTarget.setPointerCapture(e.pointerId); pointers.current.set(e.pointerId, e)
    const v = layouts[id]
    gesture.current = { id, x: v.x, y: v.y, width: v.width, rotation: v.rotation, startX: e.clientX, startY: e.clientY }
    setHistory(items => [...items.slice(-29), layouts])
  }
  const move = (e: React.PointerEvent<HTMLImageElement>) => {
    if (!gesture.current) return
    pointers.current.set(e.pointerId, e)
    const pts = [...pointers.current.values()]
    const g = gesture.current
    const rect = e.currentTarget.parentElement!.getBoundingClientRect()
    if (pts.length >= 2) {
      const [a, b] = pts
      if (!g.distance) { g.distance = distance(a, b); g.angle = angle(a, b); g.width = layouts[g.id].width; g.rotation = layouts[g.id].rotation; return }
      update(g.id, { width: clamp(g.width * distance(a, b) / g.distance, 2, 110), rotation: g.rotation + angle(a, b) - (g.angle ?? 0) })
    } else update(g.id, { x: g.x + (e.clientX - g.startX) / rect.width * 100, y: g.y + (e.clientY - g.startY) / rect.height * 100 })
  }
  const up = (e: React.PointerEvent<HTMLImageElement>) => { pointers.current.delete(e.pointerId); if (!pointers.current.size) gesture.current = null }

  return <main className="editor-shell"><div className="editor-preview"><div className="zoom-bar"><span>Flussufer</span><button onClick={() => zoomTo(zoom - 25)}>−</button><output>{zoom}%</output><button onClick={() => zoomTo(zoom + 25)}>+</button><button className="zoom-fit" onClick={() => zoomTo(100)}>Einpassen</button></div><div className="editor-viewport"><section className="editor-scene" style={{ width: `${zoom}%` }}><img className="scene-background" src={riverbank.background} alt="Flussufer" />{riverLayerIds.map(id => <img key={id} src={sourceFor(id)} alt={id} className={`editor-layer ${selected === id ? 'selected' : ''}`} style={{ ...riverLayerStyle({ ...layouts[id], visible: layouts[id].visible && riverVisibleInState(id, previewState) }), mixBlendMode: riverIsVfx(id) ? 'screen' : undefined }} onPointerDown={e => down(e, id)} onPointerMove={move} onPointerUp={up} onPointerCancel={up} />)}</section></div></div><section className="editor-panel"><div className="editor-title"><div><p className="eyebrow">Scene Editor V2</p><h1>Flussufer</h1></div><button onClick={copy}>{copied ? 'Kopiert' : 'Layout kopieren'}</button></div><div className="editor-section-label">Vorschau-Zustand</div><div className="layer-tabs river-state-tabs">{riverPreviewStates.map(state => <button key={state} className={state === previewState ? 'active' : ''} onClick={() => setPreviewState(state)}>{stateLabels[state]}</button>)}</div><div className="editor-toolbar"><button onClick={undo} disabled={!history.length}>↶ Undo</button><button onClick={() => update(selected, defaultRiverLayouts[selected], true)}>Zurücksetzen</button><button className={active.visible ? 'active' : ''} onClick={() => update(selected, { visible: !active.visible }, true)}>{active.visible ? 'Sichtbar' : 'Ausgeblendet'}</button></div><div className="layer-tabs">{riverLayerIds.map(id => <button key={id} className={id === selected ? 'active' : ''} onClick={() => setSelected(id)}>{id}</button>)}</div><div className="editor-section-label">Position & Größe</div><div className="editor-controls">{basicKeys.map(control)}</div><button className="advanced-toggle" onClick={() => setAdvanced(v => !v)}><span>Perspektive & Neigung</span><span>{advanced ? '▴' : '▾'}</span></button>{advanced && <div className="editor-controls advanced-controls">{advancedKeys.map(control)}</div>}<p className="editor-help"><strong>Touch:</strong> 1 Finger verschiebt. 2 Finger skalieren und drehen. Die Vorschau zeigt jetzt den blockierten Zustand, die Stein-/Echo-Sequenz und den freigelegten Fluss. Dropi bleibt als Asset im Editor erhalten, ist aber nicht mehr Teil der Spielsequenz.</p></section></main>
}
