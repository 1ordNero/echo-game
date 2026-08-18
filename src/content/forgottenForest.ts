const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const forgottenForest = {
  id: 'forgotten-forest',
  name: 'Vergessener Wald',
  role: 'Mystery / Echo-Bindung',
  conflict: 'Der Wald schläft.',
  states: ['STILL', 'AWAKENING', 'CHANGED'] as const,
  subtitle: 'Zwischen den stillen Stämmen liegt etwas, das nicht ganz verschwunden ist.',
  background: asset('assets/world/locations/forgotten-forest/backgrounds/forgotten-forest-still.webp'),
  echoes: {
    mossi: asset('assets/echoes/mossi/mossi-idle.webp'),
  },
  layers: {
    rootsAwake: asset('assets/world/locations/forgotten-forest/layers/roots-awake.webp'),
    mossBloom: asset('assets/world/locations/forgotten-forest/layers/moss-bloom.webp'),
    memoryStones: asset('assets/world/locations/forgotten-forest/layers/memory-stones.webp'),
    canopyLight: asset('assets/vfx/forgotten-forest/canopy-light.webp'),
    leafDrift: asset('assets/vfx/forgotten-forest/leaf-drift.webp'),
    spores: asset('assets/vfx/forgotten-forest/spores.webp'),
  },
  hotspots: [
    { id: 'roots', label: 'Verschlungene Wurzeln', x: 39, y: 65 },
    { id: 'stones', label: 'Überwachsene Steine', x: 63, y: 57 },
    { id: 'canopy', label: 'Stilles Blätterdach', x: 51, y: 27 },
  ],
} as const
