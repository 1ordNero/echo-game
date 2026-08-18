import { useEffect, useState } from 'react'
import LocationScene, { type SceneLayer } from './components/LocationScene'
import { forgottenForest } from './content/forgottenForest'
import { completeForgottenForest, loadGame, saveGame, type ForestChoice, type GameSave } from './game/saveGame'
import { preloadImages, preloadWhenIdle } from './game/assetPreload'
import { forestLayerStyle, loadForestLayouts } from './forestLayout'

type ForestScreen = 'scene' | 'echo' | 'choice' | 'result'

export default function ForestGame() {
  const [save, setSave] = useState<GameSave>(loadGame)
  const [screen, setScreen] = useState<ForestScreen>('scene')
  const [choice, setChoice] = useState<ForestChoice | null>(save.forgottenForest.choice)
  const layouts = loadForestLayouts()
  const changed = Boolean(choice)

  useEffect(() => {
    preloadImages([forgottenForest.background, forgottenForest.echoes.mossi], 'high')
    preloadWhenIdle(Object.values(forgottenForest.layers))
  }, [])

  const complete = (nextChoice: ForestChoice) => {
    const next = completeForgottenForest(save, nextChoice)
    saveGame(next); setSave(next); setChoice(nextChoice); setScreen('result')
  }
  const back = () => { window.location.href = import.meta.env.BASE_URL }

  const subtitle = save.forgottenForest.state === 'STILL'
    ? forgottenForest.subtitle
    : save.forgottenForest.state === 'AWAKENING'
      ? 'Unter der Erde beginnt sich etwas zu regen.'
      : 'Zwischen Moos und Stein ist eine alte Erinnerung sichtbar geworden.'

  const layers: SceneLayer[] = []
  if (choice === 'awaken-roots') {
    layers.push(
      { id: 'roots', src: forgottenForest.layers.roots, style: forestLayerStyle(layouts.roots) },
      { id: 'moss', src: forgottenForest.layers.moss, style: forestLayerStyle(layouts.moss) },
    )
  }
  if (choice === 'reveal-stones') layers.push({ id: 'stones', src: forgottenForest.layers.stones, style: forestLayerStyle(layouts.stones) })
  if (changed) {
    layers.push(
      { id: 'light', src: forgottenForest.layers.light, style: forestLayerStyle(layouts.light), className: 'scene-vfx', blendMode: 'screen' },
      { id: 'particles', src: forgottenForest.layers.particles, style: forestLayerStyle(layouts.particles), className: 'scene-vfx', blendMode: 'screen' },
      { id: 'leaves', src: forgottenForest.layers.leaves, style: forestLayerStyle(layouts.leaves), className: 'scene-vfx', blendMode: 'screen' },
    )
  }

  const hotspots = screen === 'scene' && save.forgottenForest.state === 'STILL'
    ? forgottenForest.hotspots.map(h => ({ ...h, onClick: () => setScreen('echo') }))
    : []

  return <main className="game-shell"><section className="location-screen screen">
    <LocationScene
      name={forgottenForest.name}
      eyebrow={save.forgottenForest.state === 'STILL' ? 'Ort entdeckt' : 'Ort erinnert sich'}
      subtitle={subtitle}
      background={forgottenForest.background}
      changed={changed}
      layers={layers}
      hotspots={hotspots}
      onBack={back}
    />

    {screen === 'scene' && save.forgottenForest.state === 'STILL' && <div className="story-card"><span className="story-handle"/><p>Kein Blatt bewegt sich. Selbst der Wind scheint zwischen den Stämmen stehen geblieben zu sein.</p><p className="instruction">Untersuche einen leuchtenden Punkt.</p></div>}
    {screen === 'scene' && save.forgottenForest.state !== 'STILL' && <div className="story-card persistent-card"><span className="story-handle"/><p className="eyebrow">Gespeicherter Weltzustand</p><p>{choice === 'awaken-roots' ? 'Die Wurzeln haben ihre starre Ruhe verloren. Frisches Moos breitet sich zwischen ihnen aus.' : 'Die drei alten Steine sind wieder sichtbar. Ihre Zeichen wirken älter als der Pfad selbst.'}</p><div className="persistent-actions"><button className="secondary-button" onClick={back}>Zur Weltkarte</button></div></div>}
    {screen === 'echo' && <div className="bottom-sheet"><span className="sheet-handle"/><p className="eyebrow">Echo wählen</p><h3>Wer soll dem Wald zuhören?</h3><button className="echo-card" onClick={() => setScreen('choice')}><img src={forgottenForest.echoes.mossi} alt="Mossi" decoding="async"/><span><strong>Mossi</strong><small>Wurzeln · Moos · verborgene Spuren</small></span><b>→</b></button><p className="context-note">Mossi wird still. Unter dem Pfad scheint etwas zu antworten.</p></div>}
    {screen === 'choice' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><div className="echo-reaction"><img src={forgottenForest.echoes.mossi} alt="Mossi" decoding="async"/><div><p className="eyebrow">Mossi reagiert</p><h3>Der Wald schläft nicht. Er wartet.</h3></div></div><p>Unter den Wurzeln liegt Bewegung. Zwischen den Steinen sitzt zugleich eine ältere Erinnerung fest.</p><div className="choice-grid"><button onClick={() => complete('awaken-roots')}><strong>Die Wurzeln wecken</strong><small>Mossi folgt dem lebenden Geflecht unter dem Boden.</small></button><button onClick={() => complete('reveal-stones')}><strong>Die Steine freilegen</strong><small>Moos und Wurzeln behutsam zur Seite führen.</small></button></div></div>}
    {screen === 'result' && <div className="bottom-sheet result-sheet"><span className="sheet-handle"/><p className="eyebrow">Die Welt hat sich verändert</p><h3>{choice === 'awaken-roots' ? 'Unter dem Waldboden beginnt wieder Bewegung.' : 'Drei vergessene Zeichen sind sichtbar geworden.'}</h3><div className="journal-note"><span>Tagebuch · gespeichert</span><p>{choice === 'awaken-roots' ? 'Mossi lauschte tief unter dem Waldboden. Die alten Wurzeln lösten sich aus ihrer starren Ruhe.' : 'Mossi schob Moos und Wurzeln zur Seite. Drei alte Steine kamen wieder zum Vorschein.'}</p></div><div className="result-actions"><button className="primary-button" onClick={() => setScreen('scene')}>Ort ansehen</button><button className="secondary-button" onClick={back}>Zur Weltkarte</button></div></div>}
  </section></main>
}
