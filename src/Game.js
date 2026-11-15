import { Ball } from './Ball.js'
import { BALL_SETUP, DEFAULTS } from './config.js'
import { rotate, sampleDeviation, scaleRange } from './math.js'
import { Physics } from './Physics.js'
import { Table } from './Table.js'

export class Game {
  constructor(config = DEFAULTS) {
    this.config = config
    this.table = new Table(config.table, config.pocketRadius)
    this.physics = new Physics(config, this.table)
    this.balls = BALL_SETUP.map((setup) => new Ball(setup))
    this.whiteBall = this.balls[0]
    this.whiteInGame = true
  }

  get areBallsAtRest() {
    return this.balls.every((ball) => !ball.isMoving)
  }

  update() {
    const pocketed = this.physics.step(this.balls)
    if (pocketed.some((ball) => ball.isWhite)) this.whiteInGame = false

    if (!this.whiteInGame && this.areBallsAtRest) this.#respawnWhite()
  }

  /**
   * Hits the white ball. `aim` is the vector from the white ball to the cursor;
   * the ball is shot in the opposite direction, with a quantum angular deviation.
   */
  shoot(aim) {
    if (!this.whiteInGame || !this.areBallsAtRest) return

    const { maxVelocity, shotScale } = this.config
    const ball = this.whiteBall
    ball.dx = clamp(-aim.x / shotScale, maxVelocity)
    ball.dy = clamp(-aim.y / shotScale, maxVelocity)

    const speed = Math.hypot(ball.dx, ball.dy)
    const maxSpeed = Math.hypot(maxVelocity, maxVelocity)
    this.physics.sigma = scaleRange(speed, 0, maxSpeed, 0, Math.PI / 2)
    if (this.physics.sigma === 0) return // no shot, nothing to deviate

    const deviated = rotate(ball.dx, ball.dy, sampleDeviation(this.physics.sigma))
    ball.dx = deviated.x
    ball.dy = deviated.y
  }

  #respawnWhite() {
    const ball = this.whiteBall
    ball.stop()
    ball.x = this.config.whiteStart.x
    ball.y = this.table.centerY
    this.balls.unshift(ball)
    this.whiteInGame = true
  }
}

function clamp(value, limit) {
  return Math.max(-limit, Math.min(limit, value))
}
