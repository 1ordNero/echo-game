import { useState } from 'react'
import { forgottenForest } from './content/forgottenForest'
import { completeForgottenForest, loadGame, saveGame, type ForestChoice, type GameSave } from './game/saveGame'
import { forestLayerStyle, loadForestLayouts } from './forestLayout'

type ForestScreen = 'scene' | 'echo' | 'choice' | 'result'

export default function ForestGame() {
  const [save, setSave] = useState<GameSave>(loadGame)
  const [screen, setScreen] = useState<ForestScreen>('scene')
  const [choice, setChoice] = useState<ForestChoice | null>(save.forgottenForest.choice)
  const layouts = loadForestLayouts()
  const changed = Boolean(choice)

  const complete = (nextChoice: ForestChoice) => {
    const next = completeForgottenForest(save, nextChoice)
    saveGame(next); setSave(next); setChoice(nextChoice); setScreen('result')
  }
  const back = () => { window.location.href = import.meta.env.BASE_URL }

  return <main className="game-shell"><section className="location-screen screen"><div className={`mill-scene ${changed ? 'changed' : ''}`}><img className="scene-background" src={forgottenForest.background} alt="Vergessener Wald"/><div className="scene-shade"/><header className="location-header"><button className="icon-button" onClick={back}>←</button><div><p className="eyebrow">{save.forgottenForest.state === 'STILL' ? 'Ort entdeckt' : 'Ort erinnert sich'}</p><h2>{forgottenForest.name}</h2><p>{save.forgottenForest.state === 'STILL' ? forgottenForest.subtitle : save.forgottenForest.state === 'AWAKENING' ? 'Unter der Erde beginnt sich etwas zu regen.' : 'Zwischen Moos und Stein ist eine alte Erinnerung sichtbar geworden.'}</p></div></header>
    {choice === 'awaken-roots' && <><img className="scene-sprite" style={forestLayerStyle(layouts.roots)} src={forgottenForest.layers.roots} alt=""/><img className="scene-sprite" style={forestLayerStyle(layouts.moss)} src={forgottenForest.layers.moss} alt=""/></>}
    {choice === 'reveal-stones' && <img className="scene-sprite" style={forestLayerStyle(layouts.stones)} src={forgottenForest.layers.stones} alt=""/>}
    {changed && <><img className="scene-vfx" style={{...forestLayerStyle(layouts.light),mixBlendMode:'screen'}} src={forgottenForest.layers.light} alt=""/><img className="scene-vfx" style={{...forestLayerStyle(layouts.particles),mixBlendMode:'screen'}} src={forgottenForest.layers.particles} alt=""/><img className="scene-vfx" style={{...forestLayerStyle(layouts.leaves),mixBlendMode:'screen'}} src={forgottenForest.layers.leaves} alt=""/></>}
    {screen === 'scene' && save.forgottenForest.state === 'STILL' && forgottenForest.hotspots.map(h => <button key={h.id} className="hotspot" style={{left:`${h.x}%`,top:`${h.y}%`}} onClick={() => setScreen('echo')}><span className="hotspot-core"/><span className="hotspot-ring"/></button>)}
  </div>
  {screen === 'scene' && save.forgottenForest.state === 'STILL' && <div className="story-card"><span className="story-handle"/><p>Kein Blatt bewegt sich. Selbst der Wind scheint zwischen den Stämmen stehen geblieben zu sein.</p><p className="instruction">Untersuche einen leuchtenden Punkt.</p></div>}
  {screen === 'scene' && save.forgottenForest.state !== 'STILL' && <div className="story-card persistent-card"><span className="story-handle"/><p className="eyebrow">Gespeicherter Weltzustand</p><p>{choice === 'awaken-roots' ? 'Die Wurzeln haben ihre starre Ruhe verloren. Frisches Moos breitet sich zwischen ihnen aus.' : 'Die drei alten Steine sind wieder sichtbar. Ihre Zeichen wirken älter als der Pfad selbst.'}</p><div className="persistent-actions"><button className="secondary-button" onClick={back}>Zur Weltkarte</button><button className="secondary-button" onClick={() => window.location.href = `${import.meta.env.BASE_URL}?editor=1&scene=forest`}>Im Editor öffnen</button></div></div>}
  {screen === 'echo' && <div className="bottom-sheet"><span className="sheet-handle"/><p className="eyebrow">Echo wählen</p><h3>Wer soll dem Wald zuhören?</h3><button className="echo-card" onClick={() => setScreen('choice')}><img src={forgottenForest.echoes.mossi} alt="Mossi"/><span><strong>Mossi</strong><small>Wurzeln · Moos · verborgene Spuren</small></span><b>→</b></button><p className="context-note">Mossi wird still. Unter dem Pfad scheint etwas zu antworten.</p></div>}
  {screen === 'choice' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><div className="echo-reaction"><img src={forgottenForest.echoes.mossi} alt="Mossi"/><div><p className="eyebrow">Mossi reagiert</p><h3>Der Wald schläft nicht. Er wartet.</h3></div></div><p>Unter den Wurzeln liegt Bewegung. Zwischen den Steinen sitzt zugleich eine ältere Erinnerung fest.</p><div className="choice-grid"><button onClick={() => complete('awaken-roots')}><strong>Die Wurzeln wecken</strong><small>Mossi folgt dem lebenden Geflecht unter dem Boden.</small></button><button onClick={() => complete('reveal-stones')}><strong>Die Steine freilegen</strong><small>Moos und Wurzeln behutsam zur Seite führen.</small></button></div></div>}
  {screen === 'result' && <div className="bottom-sheet result-sheet"><span className="sheet-handle"/><p className="eyebrow">Die Welt hat sich verändert</p><h3>{choice === 'awaken-roots' ? 'Unter dem Waldboden beginnt wieder Bewegung.' : 'Drei vergessene Zeichen sind sichtbar geworden.'}</h3><div className="journal-note"><span>Tagebuch · gespeichert</span><p>{choice === 'awaken-roots' ? 'Mossi lauschte tief unter dem Waldboden. Die alten Wurzeln lösten sich aus ihrer starren Ruhe.' : 'Mossi schob Moos und Wurzeln zur Seite. Drei alte Steine kamen wieder zum Vorschein.'}</p></div><div className="result-actions"><button className="primary-button" onClick={() => setScreen('scene')}>Ort ansehen</button><button className="secondary-button" onClick={back}>Zur Weltkarte</button></div></div>}
  </section></main>
}
