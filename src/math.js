// Numerical helpers for the quantum-style angular deviation of shots and collisions.

export function gaussian(x, sigma) {
  const coefficient = 1 / Math.sqrt(2 * Math.PI * sigma ** 2)
  return coefficient * Math.exp(-(x ** 2) / (2 * sigma ** 2))
}

/** Abramowitz-Stegun approximation of the error function. */
export function erf(x) {
  const a1 = 0.254829592
  const a2 = -0.284496736
  const a3 = 1.421413741
  const a4 = -1.453152027
  const a5 = 1.061405429
  const p = 0.3275911

  const sign = x < 0 ? -1 : 1
  const ax = Math.abs(x)
  const t = 1 / (1 + p * ax)
  const y = 1 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-ax * ax)
  return sign * y
}

/** Density of the angular deviation on [-pi, pi]: a Gaussian plus a uniform offset. */
export function deviationDensity(x, sigma) {
  return -(erf(Math.PI / (Math.SQRT2 * sigma)) - 1) / (sigma * Math.PI) + gaussian(x, sigma)
}

export function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

export function scaleRange(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin
}

/** Rejection-samples an angle (radians) from the deviation density. */
export function sampleDeviation(sigma) {
  for (;;) {
    const angle = randomBetween(-Math.PI, Math.PI)
    const y = randomBetween(0, 50)
    if (y < deviationDensity(angle, sigma)) return angle
  }
}

export function rotate(vx, vy, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return { x: vx * cos - vy * sin, y: vx * sin + vy * cos }
}
