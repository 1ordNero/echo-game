const asset = (path: string) => `${import.meta.env.BASE_URL}${path}`

export const riverbank = {
  id: 'riverbank',
  name: 'Flussufer',
  role: 'Umweltpuzzle',
  conflict: 'Die Strömung ist blockiert.',
  states: ['MURKY', 'OPEN', 'REDIRECTED'] as const,
  subtitle: 'Zwischen Treibholz und Steinen staut sich das Wasser. Der Fluss findet keinen freien Weg.',
  background: asset('assets/world/locations/riverbank/backgrounds/river-base.webp'),
  echoes: {
    dropi: asset('assets/echoes/drip/dropi-idle.webp'),
    dropiRipple: asset('assets/echoes/drip/dropi-ripple.webp'),
  },
  layers: {
    dam: asset('assets/world/locations/riverbank/layers/river-dam.webp'),
    waterSlow: asset('assets/world/locations/riverbank/layers/river-water-slow.webp'),
    water: asset('assets/world/locations/riverbank/layers/river-water.webp'),
    streambed: asset('assets/world/locations/riverbank/layers/river-streambed.webp'),
    echoStone: asset('assets/world/locations/riverbank/layers/river-echo-stone.webp'),
    echo: asset('assets/world/locations/riverbank/layers/river-echo.webp'),
  },
  hotspots: [
    { id: 'blockage', label: 'Verkeilte Äste', x: 49, y: 55 },
    { id: 'shallows', label: 'Trübes Flachwasser', x: 27, y: 69 },
    { id: 'channel', label: 'Schmaler Nebenarm', x: 73, y: 47 },
  ],
} as const
