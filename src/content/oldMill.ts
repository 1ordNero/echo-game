const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const oldMill = {
  id: 'old-mill',
  name: 'Alte Mühle',
  subtitle: 'Etwas im Inneren wartet darauf, gesehen zu werden.',
  background: asset('assets/world/locations/old-mill/backgrounds/old-mill-abandoned.webp'),
  lumen: asset('assets/echoes/lumen/lumen-idle.webp'),
  layers: {
    waterwheel: asset('assets/world/locations/old-mill/layers/waterwheel-active.webp'),
    window: asset('assets/world/locations/old-mill/layers/window-warm.webp'),
    vines: asset('assets/world/locations/old-mill/layers/vines-maintained.webp'),
    nest: asset('assets/world/locations/old-mill/layers/nest.webp'),
    glow: asset('assets/vfx/old-mill/window-glow.webp'),
    splash: asset('assets/vfx/old-mill/waterwheel-splash.webp'),
    ripples: asset('assets/vfx/old-mill/water-ripples.webp'),
    motes: asset('assets/vfx/old-mill/memory-motes.webp'),
  },
  hotspots: [
    { id: 'window', label: 'Dunkles Fenster', x: 66, y: 31 },
    { id: 'wheel', label: 'Stillstehendes Rad', x: 46, y: 56 },
    { id: 'vines', label: 'Dichte Ranken', x: 72, y: 52 },
  ],
} as const
