// Central place for every tunable value, so a settings menu can override them later.
export const DEFAULTS = Object.freeze({
  table: { width: 800, height: 400, color: '#155843' },
  pocketRadius: 15,
  ballRadius: 10,
  friction: Math.sqrt(0.99),
  stopThreshold: 0.1,
  maxVelocity: 15,
  shotScale: 10,
  whiteStart: { x: 100 },
  // Standard deviation of the angular deviation used before any shot was made.
  defaultSigma: Math.PI / 8,
})

export const BALL_SETUP = Object.freeze([
  { x: 100, y: 200, color: 'white' },
  { x: 150, y: 220, color: 'black' },
  { x: 160, y: 240, color: 'green' },
  { x: 190, y: 290, color: 'orange' },
  { x: 200, y: 320, color: 'lime' },
  { x: 250, y: 200, color: 'red' },
  { x: 300, y: 150, color: 'blue' },
  { x: 500, y: 250, color: 'yellow' },
])
