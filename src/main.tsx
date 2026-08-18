import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import BetaMenu from './BetaMenu'
import EditorHub from './EditorHub'
import ForestGame from './ForestGame'
import './styles/global.css'
import './styles/editor.css'
import './styles/phase2.css'
import './styles/location-ui.css'
import './styles/beta-menu.css'

const OFFICIAL_MILL_LAYOUT_VERSION = '2026-08-18-v3'
const officialMillLayout = {
  waterwheel: { x: 33.02083333333333, y: 38.00700505574543, width: 31, rotation: 0, opacity: 1, scaleX: 1, scaleY: 0.95, skewX: 0, skewY: 0, rotateX: 0, rotateY: 6, perspective: 1000, visible: true },
  window: { x: 53, y: 21, width: 9.5, rotation: 0, opacity: 1, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true },
  vines: { x: 27.66796875, y: 54.38427734375, width: 14, rotation: 90, opacity: 1, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true },
  nest: { x: 28.474609375, y: 47.4990218480428, width: 12, rotation: -14, opacity: 0.7499999999999998, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: -29, rotateY: 0, perspective: 800, visible: true },
  glow: { x: 50.43359375, y: 18.594482421875, width: 12, rotation: 180, opacity: 0.63, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true },
  splash: { x: 51.515625, y: 64.609619140625, width: 15.5, rotation: 0, opacity: 0.78, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true },
  ripples: { x: 47.5537109375, y: 68.64404296875, width: 19.5, rotation: -8, opacity: 0.6200000000000001, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true },
  motes: { x: 25.294921875, y: 43.1022965113322, width: 21.868958987422268, rotation: 2.060939621710247, opacity: 0.65, scaleX: 1, scaleY: 1, skewX: 0, skewY: 0, rotateX: 0, rotateY: 0, perspective: 800, visible: true },
}

if (localStorage.getItem('echo-old-mill-layout-version') !== OFFICIAL_MILL_LAYOUT_VERSION) {
  localStorage.setItem('echo-old-mill-layout-v2', JSON.stringify(officialMillLayout))
  localStorage.setItem('echo-old-mill-layout-version', OFFICIAL_MILL_LAYOUT_VERSION)
}

const params = new URLSearchParams(window.location.search)
const editor = params.get('editor') === '1'
const forestGame = params.get('forest') === '1'
const Root = editor ? EditorHub : forestGame ? ForestGame : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
    {!editor && <BetaMenu />}
  </React.StrictMode>,
)
