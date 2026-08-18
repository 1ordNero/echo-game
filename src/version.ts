export const APP_VERSION = '0.3.0-beta.9'

export type ChangelogEntry = {
  version: string
  date: string
  title: string
  changes: string[]
}

export const CHANGELOG: ChangelogEntry[] = [
  {
    version: '0.3.0-beta.9',
    date: '2026-08-18',
    title: 'Flussufer Zustandslogik korrigiert',
    changes: [
      'Blockierter Ausgangszustand zeigt nur Treibholz-Barriere und freiliegendes Flussbett.',
      'Nach dem Freilegen wird die ruhige Strömung eingeblendet; die Barriere verschwindet.',
      'Memory-Stone- und Echo-Sequenz bleiben erhalten.',
      'Dropi-Sequenz aus dem spielbaren Flussufer-Ablauf entfernt.',
      'Tagebuchtext und gespeicherte Riverbank-Tags an den vereinfachten Ablauf angepasst.',
    ],
  },
  {
    version: '0.3.0-beta.8',
    date: '2026-08-18',
    title: 'Flussufer playable slice',
    changes: [
      'Flussufer als dritte spielbare Location registriert und auf der Weltkarte freigeschaltet.',
      'Persistente Riverbank-State-Machine von blockierter Strömung bis zur Wiederherstellung ergänzt.',
      'Dropi, Memory Stone, Echo und Wasserzustände in den gemeinsamen LocationScene-Renderer integriert.',
      'Scene Editor für das Flussufer um Vorschau-Zustände für Entdeckung, Echo, Dropi und Wiederherstellung erweitert.',
      'Finale Riverbank-Sprite-Positionen als gemeinsame Standardwerte für Spiel und Editor übernommen.',
      'Flussufer-Erinnerung wird nach Abschluss im Tagebuch gespeichert.',
    ],
  },
  {
    version: '0.3.0-beta.7',
    date: '2026-08-18',
    title: 'Shared location runtime',
    changes: [
      'Alte Mühle auf denselben LocationScene-Renderer wie der Vergessene Wald migriert.',
      'Mühlen-Sprite-Layer und Hotspots werden jetzt über ein gemeinsames Scene-Model erzeugt.',
      'Scene Editor der Alten Mühle aus der App herausgelöst und als eigener Editor implementiert.',
      'Mühlen-Layout und Layout-Migration zentralisiert, damit Spiel und Editor dieselbe Quelle verwenden.',
      'Vergessener Wald auf der Weltkarte wieder direkt erreichbar.',
    ],
  },
  {
    version: '0.3.0-beta.6',
    date: '2026-08-18',
    title: 'Location registry foundation',
    changes: [
      'Locations are now registered centrally with route, editor scene and preload policy metadata.',
      'Asset preloading is driven by the location registry instead of hard-coded bootstrap lists.',
      'Shared LocationScene header integration fixed so the common GDD UI styling is preserved.',
      'Foundation prepared for moving the Alte Mühle and future locations onto the same data-driven runtime.',
    ],
  },
  {
    version: '0.3.0-beta.5',
    date: '2026-08-18',
    title: 'Asset loading & shared location scene',
    changes: [
      'Location backgrounds are preloaded with high priority and optional sprites are loaded during idle time.',
      'Forest rendering moved onto a reusable LocationScene canvas for future locations.',
      'Shared scene canvas handles header, background, layers and hotspots with the same 3:2 coordinate system.',
    ],
  },
  {
    version: '0.3.0-beta.4',
    date: '2026-08-18',
    title: 'GDD UI alignment pass',
    changes: [
      'Location title and status moved into a dedicated top band so they no longer cover the hero illustration.',
      'Location artwork starts lower while keeping the exact 3:2 Scene Editor coordinate system.',
      'Typography, result sheets and choice cards made more compact to keep one dominant action per screen.',
      'World map adjusted so the map itself occupies more of the screen.',
    ],
  },
  {
    version: '0.3.0-beta.3',
    date: '2026-08-18',
    title: 'Forest alignment fix',
    changes: [
      'Location canvas uses a deterministic 3:2 coordinate system independent of image layout.',
      'Forest sprites and background now share the same coordinate reference as the Scene Editor.',
    ],
  },
  {
    version: '0.3.0-beta.2',
    date: '2026-08-18',
    title: 'Sprite-Ausrichtung korrigiert',
    changes: [
      '3:2-Szenenkoordinaten im Spiel wiederhergestellt, damit Editor-Positionen nicht verrutschen.',
    ],
  },
  {
    version: '0.3.0-beta.1',
    date: '2026-08-18',
    title: 'Vergessener Wald & UI-Pass',
    changes: [
      'Vergessener Wald als zweite spielbare Location ergänzt.',
      'Gemeinsamer Scene Editor für Alte Mühle und Vergessenen Wald.',
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
