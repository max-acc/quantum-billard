const RAIL = 40 // wooden rail width around the playing surface, in table units

const PALETTE = {
  white: '#f2f2f2',
  black: '#111111',
  green: '#2e9e4f',
  orange: '#f08a24',
  lime: '#9bd62f',
  red: '#d6312f',
  blue: '#2f6fd6',
  yellow: '#f2cf2a',
}

export class Renderer {
  /** `overlay` is a full-window canvas on top of the table, so the cue is never clipped. */
  constructor(canvas, overlay, game) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.overlay = overlay
    this.overlayCtx = overlay.getContext('2d')
    this.game = game
    this.logicalWidth = game.table.width + RAIL * 2
    this.logicalHeight = game.table.height + RAIL * 2
    this.aimState = null

    new ResizeObserver(() => this.#resize()).observe(canvas)
    window.addEventListener('resize', () => this.#resize())
    this.#resize()
  }

  /** Converts page coordinates to table coordinates (origin = top-left of the felt). */
  toTable(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect()
    return {
      x: ((clientX - rect.left) / rect.width) * this.logicalWidth - RAIL,
      y: ((clientY - rect.top) / rect.height) * this.logicalHeight - RAIL,
    }
  }

  /** Sets (or clears with null) the aiming overlay: { aim, power }. */
  setAim(aimState) {
    this.aimState = aimState
  }

  draw() {
    const { ctx } = this
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0)
    ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight)

    this.#drawRails()
    ctx.save()
    ctx.translate(RAIL, RAIL)
    this.#drawFelt()
    this.#drawPockets()
    if (this.aimState) this.#drawAimLine()
    this.#drawBalls()
    if (this.aimState) this.#drawPowerMeter()
    ctx.restore()

    this.#drawCue()
  }

  #resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = Math.round(rect.width * dpr)
    this.canvas.height = Math.round(rect.height * dpr)
    this.scale = this.canvas.width / this.logicalWidth
    this.overlay.width = Math.round(window.innerWidth * dpr)
    this.overlay.height = Math.round(window.innerHeight * dpr)
    this.draw() // resizing clears the canvas, so repaint right away
  }

  #drawRails() {
    const { ctx, logicalWidth: w, logicalHeight: h } = this
    ctx.fillStyle = '#5a3a22'
    roundRect(ctx, 0, 0, w, h, 16)
    ctx.fill()
  }

  #drawFelt() {
    const { ctx } = this
    const { width, height, color } = this.game.table
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)
  }

  #drawPockets() {
    const { ctx } = this
    const { pockets, pocketRadius } = this.game.table
    ctx.fillStyle = '#000'
    for (const { x, y } of pockets) {
      ctx.beginPath()
      ctx.arc(x, y, pocketRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  #drawBalls() {
    const { ctx } = this
    const r = this.game.config.ballRadius
    for (const ball of this.game.balls) {
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2)
      ctx.fillStyle = PALETTE[ball.color] ?? ball.color
      ctx.fill()
    }
  }

  #drawAimLine() {
    const { ctx } = this
    const { whiteBall, config } = this.game
    const { aim, power } = this.aimState
    const length = Math.hypot(aim.x, aim.y) || 1
    const dir = { x: -aim.x / length, y: -aim.y / length }
    const start = config.ballRadius + 4
    const end = start + 40 + power * 140

    ctx.save()
    ctx.setLineDash([4, 6])
    ctx.lineWidth = 2
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)'
    ctx.beginPath()
    ctx.moveTo(whiteBall.x + dir.x * start, whiteBall.y + dir.y * start)
    ctx.lineTo(whiteBall.x + dir.x * end, whiteBall.y + dir.y * end)
    ctx.stroke()
    ctx.restore()
  }

  #drawCue() {
    const { overlayCtx: ctx, overlay } = this
    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.clearRect(0, 0, overlay.width, overlay.height)
    if (!this.aimState) return

    const { whiteBall, config } = this.game
    const { aim, power } = this.aimState
    const length = Math.hypot(aim.x, aim.y) || 1
    const dir = { x: aim.x / length, y: aim.y / length } // cue sits behind the ball
    const gap = config.ballRadius + 6 + power * 220
    const cueLength = 300

    // Draw in table coordinates, mapped onto the page.
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    const k = (rect.width / this.logicalWidth) * dpr
    ctx.setTransform(k, 0, 0, k, rect.left * dpr + RAIL * k, rect.top * dpr + RAIL * k)

    ctx.translate(whiteBall.x + dir.x * gap, whiteBall.y + dir.y * gap)
    ctx.rotate(Math.atan2(dir.y, dir.x))
    ctx.fillStyle = '#d9b77e'
    ctx.fillRect(0, -3, cueLength, 6)
  }

  #drawPowerMeter() {
    const { ctx } = this
    const { whiteBall, config } = this.game
    const { power } = this.aimState
    const meterX = whiteBall.x - 24
    const meterY = whiteBall.y + config.ballRadius + 16
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    roundRect(ctx, meterX, meterY, 48, 5, 2.5)
    ctx.fill()
    ctx.fillStyle = '#ffffff'
    roundRect(ctx, meterX, meterY, Math.max(5, 48 * power), 5, 2.5)
    ctx.fill()
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}
