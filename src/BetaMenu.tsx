import { useEffect, useRef, useState } from 'react'
import { accelerateOldMillFollowUp, loadGame, saveGame } from './game/saveGame'
import { APP_VERSION, CHANGELOG } from './version'

const SAVE_KEY = 'echo-save-v1'

export default function BetaMenu() {
  const [open, setOpen] = useState(false)
  const [showChangelog, setShowChangelog] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) {
        setOpen(false)
        setShowChangelog(false)
      }
    }
    window.addEventListener('pointerdown', close)
    return () => window.removeEventListener('pointerdown', close)
  }, [open])

  const resetGame = () => {
    if (!window.confirm('Gesamten Beta-Spielstand wirklich zurücksetzen?')) return
    localStorage.removeItem(SAVE_KEY)
    window.location.href = import.meta.env.BASE_URL
  }

  const openEditor = () => {
    const params = new URLSearchParams(window.location.search)
    const scene = params.get('forest') === '1' ? 'forest' : 'mill'
    window.location.href = `${import.meta.env.BASE_URL}?editor=1&scene=${scene}`
  }

  const unlockMillFollowUp = () => {
    const current = loadGame()
    if (!current.oldMill.choice || current.oldMill.followUpSeenAt) {
      window.alert('Aktuell gibt es kein ausstehendes Mühlen-Follow-up.')
      return
    }
    saveGame(accelerateOldMillFollowUp(current))
    window.location.reload()
  }

  return <div className="beta-menu" ref={panelRef}>
    <button className="beta-menu-trigger" aria-label="Beta-Menü" aria-expanded={open} onClick={() => setOpen(value => !value)}>•••</button>
    {open && <div className="beta-menu-panel">
      <div className="beta-menu-heading"><div><p className="beta-menu-label">ECHO Beta</p><span>v{APP_VERSION}</span></div><button className="beta-close" aria-label="Beta-Menü schließen" onClick={() => { setOpen(false); setShowChangelog(false) }}>×</button></div>
      {!showChangelog ? <>
        <button onClick={openEditor}>Scene Editor</button>
        <button onClick={unlockMillFollowUp}>Mühlen-Follow-up freischalten</button>
        <button onClick={() => setShowChangelog(true)}>Changelog</button>
        <button className="danger" onClick={resetGame}>Spielstand zurücksetzen</button>
      </> : <div className="beta-changelog">
        <button className="beta-back" onClick={() => setShowChangelog(false)}>← Beta-Funktionen</button>
        {CHANGELOG.map(entry => <article key={entry.version}>
          <div><strong>v{entry.version}</strong><span>{entry.date}</span></div>
          <h3>{entry.title}</h3>
          <ul>{entry.changes.map(change => <li key={change}>{change}</li>)}</ul>
        </article>)}
      </div>}
    </div>}
  </div>
}
