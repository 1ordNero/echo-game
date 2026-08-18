import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import ForestEditor from './ForestEditor'
import ForestGame from './ForestGame'
import './styles/global.css'
import './styles/editor.css'
import './styles/phase2.css'

const params = new URLSearchParams(window.location.search)
const forestEditor = params.get('editor') === '1' && params.get('scene') === 'forest'
const forestGame = params.get('forest') === '1'
const Root = forestEditor ? ForestEditor : forestGame ? ForestGame : App

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
