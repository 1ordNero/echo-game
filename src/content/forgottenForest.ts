const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const forgottenForest = {
  id: 'forgotten-forest',
  name: 'Vergessener Wald',
  role: 'Mystery / Echo-Bindung',
  conflict: 'Der Wald schläft.',
  states: ['STILL', 'AWAKENING', 'CHANGED'] as const,
  subtitle: 'Zwischen den stillen Stämmen liegt etwas, das nicht ganz verschwunden ist.',
  background: asset('assets/world/locations/forgotten-forest/backgrounds/forest-base.webp'),
  echoes: {
    mossi: asset('assets/echoes/mossi/mossi-idle.webp'),
  },
  layers: {
    roots: asset('assets/world/locations/forgotten-forest/layers/forest-roots.webp'),
    stones: asset('assets/world/locations/forgotten-forest/layers/memory-stones.webp'),
    moss: asset('assets/world/locations/forgotten-forest/layers/moss-clusters.webp'),
    leaves: asset('assets/vfx/forgotten-forest/falling-leaves.webp'),
    particles: asset('assets/vfx/forgotten-forest/forest-particles.webp'),
    light: asset('assets/vfx/forgotten-forest/light-rays.webp'),
  },
  hotspots: [
    { id: 'roots', label: 'Verschlungene Wurzeln', x: 29, y: 66 },
    { id: 'stones', label: 'Überwachsene Steine', x: 72, y: 58 },
    { id: 'canopy', label: 'Stilles Blätterdach', x: 52, y: 26 },
  ],
} as const
