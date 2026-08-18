import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import BetaMenu from './BetaMenu'
import EditorHub from './EditorHub'
import ForestGame from './ForestGame'
import { locationList, locations } from './content/locationRegistry'
import { preloadImages, preloadWhenIdle } from './game/assetPreload'
import './styles/global.css'
import './styles/editor.css'
import './styles/phase2.css'
import './styles/location-ui.css'
import './styles/beta-menu.css'

const params = new URLSearchParams(window.location.search)
const editor = params.get('editor') === '1'
const forestGame = params.get('forest') === '1'

// Location registry owns loading policy so adding a new place does not require editing the bootstrap code.
if (!editor) {
  const activeLocation = forestGame ? locations['forgotten-forest'] : locations['old-mill']
  const otherBackgrounds = locationList
    .filter(location => location.id !== activeLocation.id)
    .map(location => location.background)

  preloadImages(activeLocation.preload.critical, 'high')
  preloadWhenIdle([
    ...activeLocation.preload.idle,
    ...otherBackgrounds,
    ...locationList
      .filter(location => location.id !== activeLocation.id)
      .flatMap(location => location.preload.idle),
  ])
}

const Root = editor ? EditorHub : forestGame ? ForestGame : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
    {!editor && <BetaMenu />}
  </React.StrictMode>,
)
