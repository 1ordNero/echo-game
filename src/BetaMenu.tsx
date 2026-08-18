import { useEffect, useRef, useState } from 'react'

const SAVE_KEY = 'echo-save-v1'

export default function BetaMenu() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const close = (event: PointerEvent) => {
      if (!panelRef.current?.contains(event.target as Node)) setOpen(false)
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

  return <div className="beta-menu" ref={panelRef}>
    <button className="beta-menu-trigger" aria-label="Beta-Menü" aria-expanded={open} onClick={() => setOpen(value => !value)}>•••</button>
    {open && <div className="beta-menu-panel">
      <p className="beta-menu-label">Beta</p>
      <button onClick={openEditor}>Scene Editor</button>
      <button className="danger" onClick={resetGame}>Spielstand zurücksetzen</button>
      <button onClick={() => setOpen(false)}>Schließen</button>
    </div>}
  </div>
}
