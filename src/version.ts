export const APP_VERSION = '0.3.0-beta.1'

export type ChangelogEntry = {
  version: string
  date: string
  title: string
  changes: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.3.0-beta.1',
    date: '2026-08-18',
    title: 'Vergessener Wald & UI-Pass',
    changes: [
      'Vergessener Wald als zweite spielbare Location ergänzt.',
      'Gemeinsamer Scene Editor für Mühle und Wald.',
      'Persistente Weltzustände und Tagebuch für beide Orte.',
      'Kompaktere gemeinsame Location-UI mit stärkerem Fokus auf die Szenengrafik.',
      'Zentrales Beta-Menü für Testfunktionen und Editor-Zugang.',
    ],
  },
  {
    version: '0.2.0-beta',
    date: '2026-08-18',
    title: 'Persistenter Location Loop',
    changes: [
      'Savegame und Weltzustände eingeführt.',
      'Tagebuch und Mühlen-Follow-up ergänzt.',
      'Alte Mühle mit positionierbaren Sprite-Layern aufgebaut.',
    ],
  },
  {
    version: '0.1.0-beta',
    date: '2026-08-18',
    title: 'Vertical Slice',
    changes: [
      'Weltkarte, Alte Mühle, Lumen-Auswahl und erste Konsequenz umgesetzt.',
      'GitHub Pages Deployment eingerichtet.',
    ],
  },
]
