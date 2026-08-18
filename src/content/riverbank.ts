const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const riverbank = {
  id: 'riverbank',
  name: 'Flussufer',
  role: 'Umweltpuzzle',
  conflict: 'Die Strömung ist blockiert.',
  states: ['MURKY', 'OPEN', 'REDIRECTED'] as const,
  subtitle: 'Zwischen Treibholz und Steinen staut sich das Wasser. Der Fluss findet keinen freien Weg.',
  background: asset('assets/world/locations/riverbank/backgrounds/riverbank-murky.webp'),
  echoes: {
    drip: asset('assets/echoes/drip/drip-idle.webp'),
  },
  layers: {
    blockage: asset('assets/world/locations/riverbank/layers/blockage.webp'),
    openFlow: asset('assets/world/locations/riverbank/layers/open-flow.webp'),
    redirectedFlow: asset('assets/world/locations/riverbank/layers/redirected-flow.webp'),
    reeds: asset('assets/world/locations/riverbank/layers/reeds-fresh.webp'),
    ripples: asset('assets/vfx/riverbank/ripples.webp'),
    droplets: asset('assets/vfx/riverbank/droplets.webp'),
    reflections: asset('assets/vfx/riverbank/reflections.webp'),
  },
  hotspots: [
    { id: 'blockage', label: 'Verkeilte Äste', x: 49, y: 55 },
    { id: 'shallows', label: 'Trübes Flachwasser', x: 27, y: 69 },
    { id: 'channel', label: 'Schmaler Nebenarm', x: 73, y: 47 },
  ],
} as const
