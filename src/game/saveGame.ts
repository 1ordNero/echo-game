export type MillChoice = 'preserve' | 'repair'
export type MillState = 'ABANDONED' | 'DISCOVERED' | 'REPAIRED'

export type JournalEntry = {
  id: string
  title: string
  body: string
  createdAt: number
}

export type GameSave = {
  version: 1
  oldMill: {
    state: MillState
    choice: MillChoice | null
    tags: string[]
    lumenVisited: boolean
    completedAt: number | null
  }
  journal: JournalEntry[]
}

const SAVE_KEY = 'echo-save-v1'

export const createNewGame = (): GameSave => ({
  version: 1,
  oldMill: {
    state: 'ABANDONED',
    choice: null,
    tags: [],
    lumenVisited: false,
    completedAt: null,
  },
  journal: [],
})

export function loadGame(): GameSave {
  try {
    const raw = localStorage.getItem(SAVE_KEY)
    if (!raw) return createNewGame()
    const parsed = JSON.parse(raw) as Partial<GameSave>
    const fresh = createNewGame()
    return {
      ...fresh,
      ...parsed,
      oldMill: { ...fresh.oldMill, ...(parsed.oldMill ?? {}) },
      journal: Array.isArray(parsed.journal) ? parsed.journal : [],
    }
  } catch {
    return createNewGame()
  }
}

export function saveGame(save: GameSave) {
  localStorage.setItem(SAVE_KEY, JSON.stringify(save))
}

export function completeOldMill(save: GameSave, choice: MillChoice): GameSave {
  const body = choice === 'preserve'
    ? 'Lumen fand Wärme im alten Gemäuer. Wir ließen das Nest unberührt und öffneten nur den Weg zum Rad.'
    : 'Lumen zeigte uns den verborgenen Mechanismus. Wir schnitten die Ranken zurück und brachten das Rad wieder in Bewegung.'
  const tags = choice === 'preserve' ? ['nest_saved', 'lumen_used'] : ['vines_cut', 'wheel_repaired', 'lumen_used']
  const entryId = `old-mill-${choice}`
  const journal = save.journal.some(entry => entry.id === entryId)
    ? save.journal
    : [{ id: entryId, title: 'Alte Mühle', body, createdAt: Date.now() }, ...save.journal]

  return {
    ...save,
    oldMill: {
      state: choice === 'repair' ? 'REPAIRED' : 'DISCOVERED',
      choice,
      tags,
      lumenVisited: true,
      completedAt: Date.now(),
    },
    journal,
  }
}
