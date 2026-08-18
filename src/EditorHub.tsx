import { useState } from 'react'
import ForestEditor from './ForestEditor'
import MillEditor from './MillEditor'
import RiverEditor from './RiverEditor'

type SceneId = 'old-mill' | 'forgotten-forest' | 'riverbank'

function readScene(): SceneId {
  const scene = new URLSearchParams(window.location.search).get('scene')
  if (scene === 'forest' || scene === 'forgotten-forest') return 'forgotten-forest'
  if (scene === 'river' || scene === 'riverbank') return 'riverbank'
  return 'old-mill'
}

export default function EditorHub() {
  const [scene, setScene] = useState<SceneId>(readScene)

  const changeScene = (next: SceneId) => {
    setScene(next)
    const params = new URLSearchParams(window.location.search)
    params.set('editor', '1')
    params.set('scene', next === 'forgotten-forest' ? 'forest' : next === 'riverbank' ? 'river' : 'mill')
    window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`)
  }

  return <div className="editor-hub">
    <div className="editor-scene-picker">
      <label htmlFor="scene-picker">Szene</label>
      <select id="scene-picker" value={scene} onChange={event => changeScene(event.target.value as SceneId)}>
        <option value="old-mill">Alte Mühle</option>
        <option value="forgotten-forest">Vergessener Wald</option>
        <option value="riverbank">Flussufer</option>
      </select>
    </div>
    {scene === 'forgotten-forest' ? <ForestEditor /> : scene === 'riverbank' ? <RiverEditor /> : <MillEditor />}
  </div>
}
