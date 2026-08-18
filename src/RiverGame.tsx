import { useEffect, useMemo, useState } from 'react'
import LocationScene, { type SceneLayer } from './components/LocationScene'
import { riverbank } from './content/riverbank'
import { completeRiverbank, loadGame, saveGame, setRiverState, type GameSave, type RiverState } from './game/saveGame'
import { preloadImages, preloadWhenIdle } from './game/assetPreload'
import { loadRiverLayouts, riverIsVfx, riverLayerStyle, riverVisibleInState, type RiverLayerId, type RiverPreviewState } from './riverbankLayout'

type RiverScreen = 'scene' | 'stone' | 'echo' | 'restore' | 'result'

const previewStateFor = (state: RiverState, screen: RiverScreen): RiverPreviewState => {
  if (state === 'RESTORED') return 'restored'
  if (screen === 'stone' || state === 'INVESTIGATING') return 'investigating'
  if (screen === 'echo' || screen === 'restore' || state === 'ECHO_REVEALED' || state === 'DROPI_FOUND') return 'echo_revealed'
  return 'discovered'
}

const sourceFor = (id: RiverLayerId) => {
  if (id === 'dropi') return riverbank.echoes.dropi
  if (id === 'dropiRipple') return riverbank.echoes.dropiRipple
  return riverbank.layers[id]
}

export default function RiverGame() {
  const [save, setSave] = useState<GameSave>(loadGame)
  const [screen, setScreen] = useState<RiverScreen>('scene')
  const layouts = loadRiverLayouts()
  const previewState = previewStateFor(save.riverbank.state, screen)
  const restored = save.riverbank.state === 'RESTORED'

  useEffect(() => {
    preloadImages([riverbank.background, riverbank.layers.dam, riverbank.layers.streambed], 'high')
    preloadWhenIdle([
      riverbank.layers.waterSlow,
      riverbank.layers.echoStone,
      riverbank.layers.echo,
    ])
  }, [])

  const persistState = (state: RiverState) => {
    const next = setRiverState(save, state)
    saveGame(next)
    setSave(next)
  }

  const revealStone = () => {
    persistState('INVESTIGATING')
    setScreen('stone')
  }

  const revealEcho = () => {
    persistState('ECHO_REVEALED')
    setScreen('echo')
  }

  const restoreRiver = () => {
    const next = completeRiverbank(save)
    saveGame(next)
    setSave(next)
    setScreen('result')
  }

  const back = () => { window.location.href = import.meta.env.BASE_URL }

  const layers = useMemo<SceneLayer[]>(() => {
    const ids: RiverLayerId[] = ['dam', 'waterSlow', 'streambed', 'echoStone', 'echo']
    return ids
      .filter(id => layouts[id].visible && riverVisibleInState(id, previewState))
      .map(id => ({
        id,
        src: sourceFor(id),
        style: riverLayerStyle({ ...layouts[id], visible: true }),
        className: riverIsVfx(id) ? 'scene-vfx' : undefined,
        blendMode: riverIsVfx(id) ? 'screen' : undefined,
      }))
  }, [layouts, previewState])

  const hotspots = screen === 'scene' && !restored
    ? riverbank.hotspots.map(h => ({ ...h, onClick: revealStone }))
    : []

  const subtitle = restored
    ? 'Eine ruhige Strömung zieht wieder durch das Flussbett.'
    : save.riverbank.state === 'BLOCKED'
      ? riverbank.subtitle
      : save.riverbank.state === 'INVESTIGATING'
        ? 'Zwischen dem freiliegenden Geröll liegt etwas, das nicht zum Fluss gehört.'
        : 'Der Stein trägt eine Erinnerung an eine ältere Strömung.'

  return <main className="game-shell"><section className="location-screen screen">
    <LocationScene
      name={riverbank.name}
      eyebrow={restored ? 'Ort erinnert sich' : 'Ort entdeckt'}
      subtitle={subtitle}
      background={riverbank.background}
      changed={restored}
      layers={layers}
      hotspots={hotspots}
      onBack={back}
    />

    {screen === 'scene' && !restored && <div className="story-card"><span className="story-handle"/><p>Das Flussbett liegt zwischen Treibholz und nassen Steinen beinahe frei. Die Blockade hält das Wasser zurück, und am Rand schimmert etwas im Geröll.</p><p className="instruction">Untersuche einen leuchtenden Punkt.</p></div>}

    {screen === 'scene' && restored && <div className="story-card persistent-card"><span className="story-handle"/><p className="eyebrow">Gespeicherter Weltzustand</p><p>Die Blockade ist fort. Eine ruhige Strömung zieht wieder durch den alten Lauf, während das Spiralzeichen am Ufer sichtbar bleibt.</p><div className="persistent-actions"><button className="secondary-button" onClick={back}>Zur Weltkarte</button></div></div>}

    {screen === 'stone' && <div className="bottom-sheet"><span className="sheet-handle"/><p className="eyebrow">Etwas wurde sichtbar</p><h3>Ein Zeichen liegt zwischen den Steinen.</h3><p>Der Stein ist glatt geschliffen. In seiner Oberfläche liegt eine Spirale, so flach, dass sie fast verschwunden wäre.</p><div className="result-actions"><button className="primary-button" onClick={revealEcho}>Den Stein berühren</button><button className="secondary-button" onClick={() => setScreen('scene')}>Zurück</button></div></div>}

    {screen === 'echo' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><p className="eyebrow">Echo</p><h3>Für einen Moment erinnert sich das Wasser.</h3><p>Keine Stimme. Kein Bild. Nur die Spur einer Strömung, die hier einmal durch das Flussbett gezogen ist.</p><div className="result-actions"><button className="primary-button" onClick={() => setScreen('restore')}>Der alten Strömung folgen</button><button className="secondary-button" onClick={() => setScreen('stone')}>Zurück</button></div></div>}

    {screen === 'restore' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><p className="eyebrow">Flussufer</p><h3>Zwischen den Ästen ist Bewegung.</h3><p>Das Echo zeigt, wo der alte Lauf unter dem Treibholz weiterführt. Ein Ast löst sich, dann ein zweiter. Dahinter findet das Wasser wieder Platz.</p><div className="result-actions"><button className="primary-button" onClick={restoreRiver}>Die Blockade lösen</button><button className="secondary-button" onClick={() => setScreen('echo')}>Noch warten</button></div></div>}

    {screen === 'result' && <div className="bottom-sheet result-sheet"><span className="sheet-handle"/><p className="eyebrow">Die Welt hat sich verändert</p><h3>Der Fluss bewegt sich wieder.</h3><div className="journal-note"><span>Tagebuch · gespeichert</span><p>Das alte Spiralzeichen zeigte die Spur einer vergessenen Strömung. Als das Treibholz nachgab, fand das Wasser zurück in seinen alten Lauf.</p></div><div className="result-actions"><button className="primary-button" onClick={() => setScreen('scene')}>Ort ansehen</button><button className="secondary-button" onClick={back}>Zur Weltkarte</button></div></div>}
  </section></main>
}
