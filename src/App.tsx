import { useState } from 'react'
import OldMillScene from './components/OldMillScene'
import { oldMill } from './content/oldMill'
import { buildOldMillHotspots, buildOldMillLayers } from './game/oldMillSceneModel'
import {
  completeOldMill,
  isOldMillFollowUpReady,
  loadGame,
  resolveOldMillFollowUp,
  saveGame,
  timeUntilOldMillFollowUp,
  type GameSave,
  type MillChoice,
} from './game/saveGame'
import { loadOldMillLayouts } from './oldMillLayout'

type Screen = 'map' | 'mill' | 'echo' | 'choice' | 'result' | 'journal' | 'followup'
type HotspotId = (typeof oldMill.hotspots)[number]['id']

const formatWait = (milliseconds: number | null) => {
  if (milliseconds === null || milliseconds <= 0) return 'jetzt'
  const hours = Math.ceil(milliseconds / (60 * 60 * 1000))
  if (hours < 24) return `in etwa ${hours} Std.`
  const days = Math.ceil(hours / 24)
  return `in etwa ${days} ${days === 1 ? 'Tag' : 'Tagen'}`
}

export default function App() {
  const [screen, setScreen] = useState<Screen>('map')
  const [hotspot, setHotspot] = useState<HotspotId>('window')
  const [save, setSave] = useState<GameSave>(loadGame)
  const [sessionChoice, setSessionChoice] = useState<MillChoice | null>(null)
  const layouts = loadOldMillLayouts()

  const activeChoice = sessionChoice ?? save.oldMill.choice
  const millChanged = save.oldMill.state !== 'ABANDONED' || sessionChoice !== null
  const followUpReady = isOldMillFollowUpReady(save)
  const followUpPending = Boolean(save.oldMill.choice && save.oldMill.followUpDueAt && !save.oldMill.followUpSeenAt)
  const followUpSeen = Boolean(save.oldMill.followUpSeenAt)
  const followUpWait = timeUntilOldMillFollowUp(save)
  const millStatus = followUpReady
    ? 'etwas Neues ist geschehen'
    : followUpSeen
      ? 'der Ort lebt weiter'
      : save.oldMill.state === 'REPAIRED'
        ? 'das Rad läuft wieder'
        : save.oldMill.state === 'DISCOVERED'
          ? 'ein geschützter Ort'
          : 'etwas wartet hier'

  const riverStatus = save.riverbank.state === 'RESTORED'
    ? 'der Fluss bewegt sich wieder'
    : save.riverbank.state === 'DROPI_FOUND'
      ? 'Dropi lauscht der Strömung'
      : save.riverbank.state === 'ECHO_REVEALED'
        ? 'eine Erinnerung liegt im Wasser'
        : 'die Strömung ist blockiert'

  const journalText = activeChoice === 'preserve'
    ? 'Lumen fand Wärme im alten Gemäuer. Wir ließen das Nest unberührt und öffneten nur den Weg zum Rad.'
    : 'Lumen zeigte uns den verborgenen Mechanismus. Wir schnitten die Ranken zurück und brachten das Rad wieder in Bewegung.'
  const followUpText = save.oldMill.choice === 'preserve'
    ? 'Zwischen den alten Balken liegen neue Halme und eine kleine Feder. Das Nest ist nicht länger nur geschützt – es wird benutzt.'
    : 'Das Rad läuft gleichmäßig. Im flacheren Wasser am Ufer haben sich erste frische Pflanzen gesammelt.'
  const followUpJournal = save.oldMill.choice === 'preserve'
    ? 'Als wir zur Alten Mühle zurückkehrten, lag das Nest noch sicher zwischen den Balken. Neue Halme und Federn zeigten, dass der geschützte Ort angenommen worden war.'
    : 'Bei unserer Rückkehr lief das Rad ruhig weiter. Am Ufer hatten sich frische Wasserpflanzen gesammelt – die Bewegung des Bachs hatte den Ort bereits verändert.'

  const commitChoice = (choice: MillChoice) => {
    const next = completeOldMill(save, choice)
    saveGame(next); setSave(next); setSessionChoice(choice); setScreen('result')
  }
  const rememberFollowUp = () => {
    const next = resolveOldMillFollowUp(save)
    saveGame(next); setSave(next); setScreen('journal')
  }
  const openForest = () => { window.location.href = `${import.meta.env.BASE_URL}?forest=1` }
  const openRiver = () => { window.location.href = `${import.meta.env.BASE_URL}?river=1` }

  if (screen === 'journal') return <main className="game-shell"><section className="journal-screen screen"><header className="journal-header"><button className="icon-button" onClick={() => setScreen('map')}>←</button><div><p className="eyebrow">Tagebuch</p><h1>Erinnerungen</h1></div></header>{save.journal.length ? <div className="journal-list">{save.journal.map(entry => <article className="journal-entry" key={entry.id}><p className="eyebrow">{entry.title}</p><p>{entry.body}</p></article>)}</div> : <p className="journal-empty">Noch wurde keine Erinnerung festgehalten.</p>}</section></main>

  if (screen === 'map') return <main className="game-shell"><section className="map-screen screen"><header className="map-header"><p className="eyebrow">ECHO · Weltkarte</p><div className="map-title-row"><h1>Die Welt erinnert sich.</h1><span className="resource-pill">✦ 3</span></div><p className="map-intro">Nur wenige Orte antworten noch. Drei davon sind bereits erreichbar.</p><button className="journal-button" onClick={() => setScreen('journal')}>Tagebuch <span>{save.journal.length}</span></button></header><div className="map-stage"><div className="map-haze map-haze-a"/><div className="map-haze map-haze-b"/><div className="river"/><button className="location-node village-node" disabled><span className="node-dot muted"/><span className="location-label"><strong>Dorf am Fluss</strong><small>später</small></span></button><button className={`location-node mill-node active ${followUpReady ? 'followup-ready' : ''}`} onClick={() => { setSessionChoice(null); setScreen('mill') }}><span className="node-dot"/><span className="location-label"><strong>Alte Mühle</strong><small>{millStatus}</small></span></button><button className="location-node forest-node active" onClick={openForest}><span className="node-dot"/><span className="location-label"><strong>Vergessener Wald</strong><small>{save.forgottenForest.state === 'STILL' ? 'etwas wartet zwischen den Stämmen' : 'der Wald erinnert sich'}</small></span></button><button className="location-node riverbank-node active" onClick={openRiver}><span className="node-dot"/><span className="location-label"><strong>Flussufer</strong><small>{riverStatus}</small></span></button></div><div className="map-footer"><span className="map-footer-line"/><p>{followUpReady ? 'An der Alten Mühle hat sich erneut etwas verändert.' : 'Deine Entscheidungen bleiben in der Welt bestehen.'}</p></div></section></main>

  const sceneLayers = buildOldMillLayers(layouts, activeChoice)
  const sceneHotspots = screen === 'mill' && save.oldMill.state === 'ABANDONED'
    ? buildOldMillHotspots(id => { setHotspot(id); setScreen('echo') })
    : []
  const eyebrow = followUpReady ? 'Der Ort ruft erneut' : save.oldMill.state === 'ABANDONED' ? 'Ort entdeckt' : 'Ort erinnert sich'
  const subtitle = save.oldMill.state === 'ABANDONED' ? oldMill.subtitle : millStatus

  return <main className="game-shell"><section className="location-screen screen">
    <OldMillScene eyebrow={eyebrow} subtitle={subtitle} changed={millChanged} layers={sceneLayers} hotspots={sceneHotspots} onBack={() => setScreen('map')} />

    {screen === 'mill' && save.oldMill.state === 'ABANDONED' && <div className="story-card"><span className="story-handle"/><p>Das Rad steht still. Im oberen Fenster liegt nur Dunkelheit. Zwischen den Balken raschelt etwas.</p><p className="instruction">Untersuche einen leuchtenden Punkt.</p></div>}
    {screen === 'mill' && save.oldMill.state !== 'ABANDONED' && <div className={`story-card persistent-card ${followUpReady ? 'followup-card' : ''}`}><span className="story-handle"/><p className="eyebrow">{followUpReady ? 'Neue Spur' : followUpSeen ? 'Der Ort lebt weiter' : 'Gespeicherter Weltzustand'}</p><p>{followUpReady ? 'Seit deinem letzten Besuch ist etwas Neues entstanden. Die Veränderung war nicht das Ende.' : followUpSeen ? followUpText : save.oldMill.state === 'REPAIRED' ? 'Das Rad arbeitet wieder. Wasser und Licht sind an die Alte Mühle zurückgekehrt.' : 'Das Nest bleibt geschützt. Lumen erinnert sich an das Licht zwischen den Balken.'}</p>{followUpReady && <button className="primary-button followup-button" onClick={() => setScreen('followup')}>Nachsehen</button>}{followUpPending && !followUpReady && <div className="followup-timer"><span>Die Welt arbeitet weiter</span><strong>{formatWait(followUpWait)}</strong></div>}<div className="persistent-actions"><button className="secondary-button" onClick={() => setScreen('journal')}>Tagebuch</button></div></div>}
    {screen === 'echo' && <div className="bottom-sheet"><span className="sheet-handle"/><p className="eyebrow">Echo wählen</p><h3>Wer soll sich das ansehen?</h3><button className="echo-card" onClick={() => setScreen('choice')}><img src={oldMill.lumen} alt="Lumen"/><span><strong>Lumen</strong><small>Licht · verborgenes sichtbar machen</small></span><b>→</b></button><p className="context-note">Lumen schaut neugierig zum {hotspot === 'window' ? 'dunklen Fenster' : hotspot === 'wheel' ? 'alten Rad' : 'dichten Bewuchs'}.</p></div>}
    {screen === 'choice' && <div className="bottom-sheet consequence-sheet"><span className="sheet-handle"/><div className="echo-reaction"><img src={oldMill.lumen} alt="Lumen"/><div><p className="eyebrow">Lumen reagiert</p><h3>Im Holz verlaufen alte Spuren von Licht.</h3></div></div><p>Lumen macht einen verborgenen Mechanismus sichtbar. Hinter den Ranken liegt zugleich ein kleines Nest.</p><div className="choice-grid"><button onClick={() => commitChoice('preserve')}><strong>Das Nest schützen</strong><small>Nur vorsichtig Platz schaffen.</small></button><button onClick={() => commitChoice('repair')}><strong>Das Rad reparieren</strong><small>Ranken zurückschneiden und den Mechanismus öffnen.</small></button></div></div>}
    {screen === 'result' && <div className="bottom-sheet result-sheet"><span className="sheet-handle"/><p className="eyebrow">Die Welt hat sich verändert</p><h3>{activeChoice === 'repair' ? 'Wasser läuft wieder durch das alte Rad.' : 'Zwischen den alten Balken bleibt ein geschützter Ort.'}</h3><div className="journal-note"><span>Tagebuch · gespeichert</span><p>{journalText}</p></div><p className="followup-hint">Diese Veränderung kann später weitere Folgen haben.</p><div className="result-actions"><button className="primary-button" onClick={() => setScreen('mill')}>Ort ansehen</button><button className="secondary-button" onClick={() => setScreen('map')}>Zur Weltkarte</button></div></div>}
    {screen === 'followup' && <div className="bottom-sheet followup-sheet"><span className="sheet-handle"/><p className="eyebrow">Rückkehr · Alte Mühle</p><h3>{save.oldMill.choice === 'preserve' ? 'Jemand hat den geschützten Ort gefunden.' : 'Das Wasser trägt die Veränderung weiter.'}</h3><p>{followUpText}</p><div className="journal-note"><span>Neue Erinnerung</span><p>{followUpJournal}</p></div><div className="result-actions"><button className="primary-button" onClick={rememberFollowUp}>Im Tagebuch festhalten</button><button className="secondary-button" onClick={() => setScreen('mill')}>Später</button></div></div>}
  </section></main>
}
