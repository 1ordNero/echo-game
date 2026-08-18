import { useMemo, useState } from 'react'
import { oldMill } from './content/oldMill'

type Screen = 'map' | 'mill' | 'echo' | 'choice' | 'result'

type HotspotId = (typeof oldMill.hotspots)[number]['id']

export default function App() {
  const [screen, setScreen] = useState<Screen>('map')
  const [hotspot, setHotspot] = useState<HotspotId>('window')
  const [choice, setChoice] = useState<'preserve' | 'repair' | null>(null)

  const journal = useMemo(() => {
    if (choice === 'preserve') {
      return 'Lumen fand Wärme im alten Gemäuer. Wir ließen das Nest unberührt und öffneten nur den Weg zum Rad.'
    }
    if (choice === 'repair') {
      return 'Lumen zeigte uns den verborgenen Mechanismus. Wir schnitten die Ranken zurück und brachten das Rad wieder in Bewegung.'
    }
    return ''
  }, [choice])

  const inspectHotspot = (id: HotspotId) => {
    setHotspot(id)
    setScreen('echo')
  }

  const reset = () => {
    setScreen('map')
    setHotspot('window')
    setChoice(null)
  }

  return (
    <main className="game-shell">
      {screen === 'map' && (
        <section className="map-screen screen">
          <header className="topbar">
            <div>
              <p className="eyebrow">ECHO · Weltkarte</p>
              <h1>Die Welt erinnert sich.</h1>
            </div>
            <span className="resource-pill">✦ 3</span>
          </header>

          <div className="map-stage" aria-label="Weltkarte">
            <div className="river" />
            <button className="location-node village-node" type="button" disabled>
              <span className="node-dot muted" />
              <strong>Dorf am Fluss</strong>
              <small>später</small>
            </button>
            <button className="location-node mill-node active" type="button" onClick={() => setScreen('mill')}>
              <span className="node-dot" />
              <strong>Alte Mühle</strong>
              <small>etwas hat sich verändert</small>
            </button>
            <button className="location-node forest-node" type="button" disabled>
              <span className="node-dot muted" />
              <strong>Vergessener Wald</strong>
              <small>unentdeckt</small>
            </button>
          </div>

          <p className="map-hint">Tippe auf die Alte Mühle.</p>
        </section>
      )}

      {screen !== 'map' && (
        <section className="location-screen screen">
          <header className="location-header">
            <button className="icon-button" type="button" onClick={() => setScreen('map')} aria-label="Zur Weltkarte">←</button>
            <div>
              <p className="eyebrow">Ort entdeckt</p>
              <h2>{oldMill.name}</h2>
              <p>{oldMill.subtitle}</p>
            </div>
          </header>

          <div className={`mill-scene ${choice ? 'changed' : ''}`}>
            <img className="scene-background" src={oldMill.background} alt="Verlassene alte Wassermühle" />

            {choice === 'repair' && (
              <>
                <img className="scene-sprite wheel-sprite" src={oldMill.layers.waterwheel} alt="" />
                <img className="scene-vfx splash-vfx" src={oldMill.layers.splash} alt="" />
                <img className="scene-vfx ripples-vfx" src={oldMill.layers.ripples} alt="" />
                <img className="scene-sprite vines-sprite" src={oldMill.layers.vines} alt="" />
              </>
            )}

            {choice && (
              <>
                <img className="scene-sprite window-sprite" src={oldMill.layers.window} alt="" />
                <img className="scene-vfx window-vfx" src={oldMill.layers.glow} alt="" />
                <img className="scene-vfx motes-vfx" src={oldMill.layers.motes} alt="" />
              </>
            )}

            {choice === 'preserve' && <img className="scene-sprite nest-sprite" src={oldMill.layers.nest} alt="" />}

            {screen === 'mill' && !choice && oldMill.hotspots.map((item) => (
              <button
                key={item.id}
                type="button"
                className="hotspot"
                style={{ left: `${item.x}%`, top: `${item.y}%` }}
                onClick={() => inspectHotspot(item.id)}
                aria-label={item.label}
              >
                <span />
              </button>
            ))}
          </div>

          {screen === 'mill' && !choice && (
            <div className="story-card">
              <p>Das Rad steht still. Im oberen Fenster liegt nur Dunkelheit. Zwischen den Balken raschelt etwas.</p>
              <p className="instruction">Untersuche einen leuchtenden Punkt.</p>
            </div>
          )}

          {screen === 'echo' && (
            <div className="bottom-sheet">
              <p className="eyebrow">Echo wählen</p>
              <h3>Wer soll sich das ansehen?</h3>
              <button className="echo-card" type="button" onClick={() => setScreen('choice')}>
                <img src={oldMill.lumen} alt="Lumen" />
                <span>
                  <strong>Lumen</strong>
                  <small>Licht · verborgenes sichtbar machen</small>
                </span>
                <b>→</b>
              </button>
              <p className="context-note">Lumen schaut neugierig zum {hotspot === 'window' ? 'dunklen Fenster' : hotspot === 'wheel' ? 'alten Rad' : 'dichten Bewuchs'}.</p>
            </div>
          )}

          {screen === 'choice' && (
            <div className="bottom-sheet consequence-sheet">
              <div className="echo-reaction">
                <img src={oldMill.lumen} alt="Lumen" />
                <div>
                  <p className="eyebrow">Lumen reagiert</p>
                  <h3>Im Holz verlaufen alte Spuren von Licht.</h3>
                </div>
              </div>
              <p>Lumen macht einen verborgenen Mechanismus sichtbar. Hinter den Ranken liegt zugleich ein kleines Nest.</p>
              <div className="choice-grid">
                <button type="button" onClick={() => { setChoice('preserve'); setScreen('result') }}>
                  <strong>Das Nest schützen</strong>
                  <small>Nur vorsichtig Platz schaffen.</small>
                </button>
                <button type="button" onClick={() => { setChoice('repair'); setScreen('result') }}>
                  <strong>Das Rad reparieren</strong>
                  <small>Ranken zurückschneiden und den Mechanismus öffnen.</small>
                </button>
              </div>
            </div>
          )}

          {screen === 'result' && (
            <div className="bottom-sheet result-sheet">
              <p className="eyebrow">Die Welt hat sich verändert</p>
              <h3>{choice === 'repair' ? 'Wasser läuft wieder durch das alte Rad.' : 'Zwischen den alten Balken bleibt ein geschützter Ort.'}</h3>
              <div className="journal-note">
                <span>Tagebuch</span>
                <p>{journal}</p>
              </div>
              <div className="result-actions">
                <button className="primary-button" type="button" onClick={() => setScreen('mill')}>Ort ansehen</button>
                <button className="secondary-button" type="button" onClick={reset}>Von vorn testen</button>
              </div>
            </div>
          )}
        </section>
      )}
    </main>
  )
}
