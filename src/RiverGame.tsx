import { useEffect, useMemo, useState } from 'react'
import LocationScene, { type SceneLayer } from './components/LocationScene'
import { riverbank } from './content/riverbank'
import { completeRiverbank, loadGame, saveGame, setRiverState, type GameSave, type RiverState } from './game/saveGame'
import { preloadImages, preloadWhenIdle } from './game/assetPreload'
import { loadRiverLayouts, riverIsVfx, riverLayerStyle, riverVisibleInState, type RiverLayerId, type RiverPreviewState } from './riverbankLayout'

type RiverScreen = 'scene' | 'stone' | 'echo' | 'dropi' | 'restore' | 'result'

const previewStateFor = (state: RiverState, screen: RiverScreen): RiverPreviewState => {
  if (state === 'RESTORED') return 'restored'
  if (screen === 'stone' || state === 'INVESTIGATING') return 'investigating'
  if (screen === 'echo' || state === 'ECHO_REVEALED') return 'echo_revealed'
  if (screen === 'dropi' || screen === 'restore' || state === 'DROPI_FOUND') return 'dropi_appears'
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
    preloadImages([riverbank.background, riverbank.layers.dam, riverbank.layers.waterSlow], 'high')
    preloadWhenIdle([
      riverbank.layers.water,
      riverbank.layers.streambed,
      riverbank.layers.echoStone,
      riverbank.layers.echo,
      riverbank.echoes.dropi,
      riverbank.echoes.dropiRipple,
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

  const revealDropi = () => {
    persistState('DROPI_FOUND')
    setScreen('dropi')
  }

  const restoreRiver = () => {
    const next = completeRiverbank(save)
    saveGame(next)
    setSave(next)
    setScreen('result')
  }

  const back = () => { window.location.href = import.meta.env.BASE_URL }

  const layers = useMemo<SceneLayer[]>(() => {
    const ids: RiverLayerId[] = ['dam', 'waterSlow', 'water', 'streambed', 'echoStone', 'echo', 'dropi', 'dropiRipple']
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
    ? 'Die Strömung zieht wieder durch das Flussbett.'
    : save.riverbank.state === 'BLOCKED'
      ? riverbank.subtitle
      : save.riverbank.state === 'INVESTIGATING'
        ? 'Zwischen dem nassen Geröll liegt etwas, das nicht zum Fluss gehört.'
        : save.riverbank.state === 'ECHO_REVEALED'
          ? 'Der Stein trägt eine Erinnerung an eine ältere Strömung.'
          : 'Dropi lauscht dem Wasser unter dem Treibholz.'

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

    {screen === 'scene' && !restored && <div className="story-card"><span className="story-handle"/><p>Das Wasser steht beinahe still. Treibholz hält die Strömung fest, und am Rand des Flussbetts schimmert etwas zwischen den Steinen.</p><p className="instruction">Untersuche einen leuchtenden Punkt.</p></div>}

    {screen === 'scene' && restored && <div className="story-card persistent-card"><span className="story-handle"/><p className="eyebrow">Gespeicherter Weltzustand</p><p>Der Fluss zieht wieder durch das alte Bett. Wo zuvor das Wasser stand, bleiben nasse Steine und ein beinahe vergessenes Zeichen zurück.</p><div className="persistent-actions"><button className="secondary-button" onClick={back}>Zur Weltkarte</button></div></div>}

    {screen === 'stone' && <div className="bottom-sheet"><span className="sheet-handle"/><p className="eyebrow">Etwas wurde sichtbar</p><h3>Ein Zeichen liegt unter dem Wasser.</h3><p>Der Stein ist glatt geschliffen. In seiner Oberfläche liegt eine Spirale, so flach, dass sie fast verschwunden wäre.</p><div className="result-actions"><button className="primary-button" onClick={revealEcho}>Den Stein berühren</button><button className="secondary-button" onClick={() => setScreen('scene')}>Zurück</button></div></div>}

    {screen === 'echo' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><p className="eyebrow">Echo</p><h3>Für einen Moment erinnert sich das Wasser.</h3><p>Keine Stimme. Kein Bild. Nur eine Strömung, die hier einmal einen anderen Weg genommen hat.</p><button className="echo-card" onClick={revealDropi}><img src={riverbank.echoes.dropi} alt="Dropi" decoding="async"/><span><strong>Dropi</strong><small>Wasser · Strömung · verborgene Wege</small></span><b>→</b></button><p className="context-note">Zwischen den nassen Steinen öffnen sich zwei kleine bernsteinfarbene Augen.</p></div>}

    {screen === 'dropi' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><div className="echo-reaction"><img src={riverbank.echoes.dropi} alt="Dropi" decoding="async"/><div><p className="eyebrow">Dropi reagiert</p><h3>Der Fluss will weiter.</h3></div></div><p>Dropi folgt einer schwachen Bewegung unter dem Treibholz. Die Blockade hält nicht nur Wasser zurück – sie verdeckt auch den alten Lauf des Flusses.</p><div className="choice-grid"><button onClick={() => setScreen('restore')}><strong>Der Strömung folgen</strong><small>Dropi sucht den Weg, an dem das Wasser noch zieht.</small></button></div></div>}

    {screen === 'restore' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><p className="eyebrow">Flussufer</p><h3>Zwischen den Ästen ist Bewegung.</h3><p>Ein Ast löst sich, dann ein zweiter. Das Wasser drängt nicht – es findet nur wieder Platz.</p><div className="result-actions"><button className="primary-button" onClick={restoreRiver}>Die Blockade lösen</button><button className="secondary-button" onClick={() => setScreen('dropi')}>Noch warten</button></div></div>}

    {screen === 'result' && <div className="bottom-sheet result-sheet"><span className="sheet-handle"/><p className="eyebrow">Die Welt hat sich verändert</p><h3>Der Fluss bewegt sich wieder.</h3><div className="journal-note"><span>Tagebuch · gespeichert</span><p>Dropi folgte der schwachen Strömung unter dem Treibholz. Als die Blockade nachgab, begann der Fluss wieder zu ziehen. Zwischen nassen Steinen blieb ein altes Spiralzeichen zurück.</p></div><div className="result-actions"><button className="primary-button" onClick={() => setScreen('scene')}>Ort ansehen</button><button className="secondary-button" onClick={back}>Zur Weltkarte</button></div></div>}
  </section></main>
}
