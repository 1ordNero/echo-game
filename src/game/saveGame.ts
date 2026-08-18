export type MillChoice = 'preserve' | 'repair'
export type MillState = 'ABANDONED' | 'DISCOVERED' | 'REPAIRED'
export type ForestChoice = 'awaken-roots' | 'reveal-stones'
export type ForestState = 'STILL' | 'AWAKENING' | 'CHANGED'
export type RiverState = 'BLOCKED' | 'INVESTIGATING' | 'ECHO_REVEALED' | 'DROPI_FOUND' | 'RESTORED'

export type JournalEntry = {
  id: string
  title: string
  body: string
  createdAt: number
}

export type GameSave = {
  version: 4
  oldMill: {
    state: MillState
    choice: MillChoice | null
    tags: string[]
    lumenVisited: boolean
    completedAt: number | null
    followUpDueAt: number | null
    followUpSeenAt: number | null
  }
  forgottenForest: {
    state: ForestState
    choice: ForestChoice | null
    tags: string[]
    mossiVisited: boolean
    completedAt: number | null
  }
  riverbank: {
    state: RiverState
    tags: string[]
    dropiVisited: boolean
    completedAt: number | null
  }
  journal: JournalEntry[]
}

const SAVE_KEY = 'echo-save-v1'
const DAY = 24 * 60 * 60 * 1000

export const createNewGame = (): GameSave => ({
  version: 4,
  oldMill: {
    state: 'ABANDONED',
    choice: null,
    tags: [],
    lumenVisited: false,
    completedAt: null,
    followUpDueAt: null,
    followUpSeenAt: null,
  },
  forgottenForest: {
    state: 'STILL',
    choice: null,
    tags: [],
    mossiVisited: false,
    completedAt: null,
  },
  riverbank: {
    state: 'BLOCKED',
    tags: [],
    dropiVisited: false,
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
    const oldMill = { ...fresh.oldMill, ...(parsed.oldMill ?? {}) }
    const forgottenForest = { ...fresh.forgottenForest, ...(parsed.forgottenForest ?? {}) }
    const riverbank = { ...fresh.riverbank, ...(parsed.riverbank ?? {}) }

    // Compatibility with beta.8 saves: the removed Dropi step now resumes at the Echo.
    if (riverbank.state === 'DROPI_FOUND') riverbank.state = 'ECHO_REVEALED'

    if (oldMill.completedAt && !oldMill.followUpDueAt && !oldMill.followUpSeenAt) {
      oldMill.followUpDueAt = oldMill.completedAt + (oldMill.choice === 'repair' ? 2 * DAY : DAY)
    }

    return {
      ...fresh,
      ...parsed,
      version: 4,
      oldMill,
      forgottenForest,
      riverbank,
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
  const now = Date.now()
  const body = choice === 'preserve'
    ? 'Lumen fand Wärme im alten Gemäuer. Wir ließen das Nest unberührt und öffneten nur den Weg zum Rad.'
    : 'Lumen zeigte uns den verborgenen Mechanismus. Wir schnitten die Ranken zurück und brachten das Rad wieder in Bewegung.'
  const tags = choice === 'preserve' ? ['nest_saved', 'lumen_used'] : ['vines_cut', 'wheel_repaired', 'lumen_used']
  const entryId = `old-mill-${choice}`
  const journal = save.journal.some(entry => entry.id === entryId)
    ? save.journal
    : [{ id: entryId, title: 'Alte Mühle', body, createdAt: now }, ...save.journal]

  return {
    ...save,
    version: 4,
    oldMill: {
      state: choice === 'repair' ? 'REPAIRED' : 'DISCOVERED',
      choice,
      tags,
      lumenVisited: true,
      completedAt: now,
      followUpDueAt: now + (choice === 'repair' ? 2 * DAY : DAY),
      followUpSeenAt: null,
    },
    journal,
  }
}

export function completeForgottenForest(save: GameSave, choice: ForestChoice): GameSave {
  const now = Date.now()
  const roots = choice === 'awaken-roots'
  const body = roots
    ? 'Mossi lauschte tief unter dem Waldboden. Die alten Wurzeln lösten sich aus ihrer starren Ruhe und frisches Moos erschien zwischen ihnen.'
    : 'Mossi schob Moos und Wurzeln behutsam zur Seite. Unter dem Bewuchs kamen drei alte Steine mit fast vergessenen Kreiszeichen zum Vorschein.'
  const entryId = `forgotten-forest-${choice}`
  const journal = save.journal.some(entry => entry.id === entryId)
    ? save.journal
    : [{ id: entryId, title: 'Vergessener Wald', body, createdAt: now }, ...save.journal]

  return {
    ...save,
    version: 4,
    forgottenForest: {
      state: roots ? 'AWAKENING' : 'CHANGED',
      choice,
      tags: roots ? ['roots_awake', 'mossi_used'] : ['memory_stones_revealed', 'mossi_used'],
      mossiVisited: true,
      completedAt: now,
    },
    journal,
  }
}

export function setRiverState(save: GameSave, state: RiverState): GameSave {
  return { ...save, version: 4, riverbank: { ...save.riverbank, state } }
}

export function completeRiverbank(save: GameSave): GameSave {
  const now = Date.now()
  const body = 'Das alte Spiralzeichen zeigte die Spur einer vergessenen Strömung. Als das Treibholz nachgab, fand das Wasser zurück in seinen alten Lauf.'
  const entryId = 'riverbank-restored'
  const existing = save.journal.find(entry => entry.id === entryId)
  const journal = existing
    ? save.journal.map(entry => entry.id === entryId ? { ...entry, body } : entry)
    : [{ id: entryId, title: 'Flussufer', body, createdAt: now }, ...save.journal]

  return {
    ...save,
    version: 4,
    riverbank: {
      state: 'RESTORED',
      tags: ['river_restored', 'memory_stone_revealed'],
      dropiVisited: false,
      completedAt: now,
    },
    journal,
  }
}

export function isOldMillFollowUpReady(save: GameSave, now = Date.now()) {
  return Boolean(save.oldMill.choice && save.oldMill.followUpDueAt && !save.oldMill.followUpSeenAt && now >= save.oldMill.followUpDueAt)
}

export function timeUntilOldMillFollowUp(save: GameSave, now = Date.now()) {
  if (!save.oldMill.followUpDueAt || save.oldMill.followUpSeenAt) return null
  return Math.max(0, save.oldMill.followUpDueAt - now)
}

export function accelerateOldMillFollowUp(save: GameSave): GameSave {
  if (!save.oldMill.choice || save.oldMill.followUpSeenAt) return save
  return { ...save, oldMill: { ...save.oldMill, followUpDueAt: Date.now() - 1 } }
}

export function resolveOldMillFollowUp(save: GameSave): GameSave {
  if (!save.oldMill.choice || save.oldMill.followUpSeenAt) return save
  const now = Date.now()
  const preserve = save.oldMill.choice === 'preserve'
  const body = preserve
    ? 'Als wir zur Alten Mühle zurückkehrten, lag das Nest noch sicher zwischen den Balken. Neue Halme und Federn zeigten, dass der geschützte Ort angenommen worden war.'
    : 'Bei unserer Rückkehr lief das Rad ruhig weiter. Am Ufer hatten sich frische Wasserpflanzen gesammelt – die Bewegung des Bachs hatte den Ort bereits verändert.'
  const entryId = `old-mill-followup-${save.oldMill.choice}`
  const journal = save.journal.some(entry => entry.id === entryId)
    ? save.journal
    : [{ id: entryId, title: 'Alte Mühle · Rückkehr', body, createdAt: now }, ...save.journal]

  return {
    ...save,
    oldMill: {
      ...save.oldMill,
      tags: [...new Set([...save.oldMill.tags, preserve ? 'nest_inhabited' : 'stream_restored'])],
      followUpSeenAt: now,
    },
    journal,
  }
}
