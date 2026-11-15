import { rotate, sampleDeviation } from './math.js'

/** Advances the simulation by one frame and reports pocketed balls. */
export class Physics {
  constructor(config, table) {
    this.config = config
    this.table = table
    // Deviation used for ball-ball collisions; updated on every shot.
    this.sigma = config.defaultSigma
  }

  /** @returns {Ball[]} balls that fell into a pocket this frame */
  step(balls) {
    const pocketed = []

    for (const ball of [...balls]) {
      this.#move(ball)
      if (this.#inPocket(ball)) {
        pocketed.push(ball)
        balls.splice(balls.indexOf(ball), 1)
      }
    }

    for (let i = 0; i < balls.length; i++) {
      for (let j = 0; j < balls.length; j++) {
        if (i !== j && this.#overlaps(balls[i], balls[j])) {
          this.#resolve(balls[i], balls[j])
        }
      }
    }

    return pocketed
  }

  #move(ball) {
    const { friction, stopThreshold, ballRadius } = this.config
    const { width, height } = this.table

    ball.dx *= friction
    ball.dy *= friction
    if (Math.abs(ball.dx) < stopThreshold) ball.dx = 0
    if (Math.abs(ball.dy) < stopThreshold) ball.dy = 0

    ball.x += ball.dx
    ball.y += ball.dy

    if (ball.x - ballRadius < 0 || ball.x + ballRadius > width) ball.dx = -ball.dx
    if (ball.y - ballRadius < 0 || ball.y + ballRadius > height) ball.dy = -ball.dy
  }

  #inPocket(ball) {
    return this.table.pockets.some(
      (p) => Math.hypot(p.x - ball.x, p.y - ball.y) < this.table.pocketRadius,
    )
  }

  #overlaps(a, b) {
    return Math.hypot(b.x - a.x, b.y - a.y) < this.config.ballRadius * 2
  }

  #resolve(a, b) {
    const { ballRadius } = this.config
    const dx = b.x - a.x
    const dy = b.y - a.y
    const distance = Math.hypot(dx, dy)

    // Push the balls apart so they no longer overlap.
    const overlap = ballRadius * 2 - distance
    const adjustX = (overlap * dx) / distance
    const adjustY = (overlap * dy) / distance
    a.x -= adjustX / 2
    a.y -= adjustY / 2
    b.x += adjustX / 2
    b.y += adjustY / 2

    const nx = dx / distance
    const ny = dy / distance
    const approach = (b.dx - a.dx) * nx + (b.dy - a.dy) * ny
    if (approach > 0) return // already separating

    // Equal masses: unit impulse along the normal, with a quantum deviation.
    const impulse = rotate(nx, ny, sampleDeviation(this.sigma))
    a.dx -= impulse.x
    a.dy -= impulse.y
    b.dx += impulse.x
    b.dy += impulse.y
  }
}
