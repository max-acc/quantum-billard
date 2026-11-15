const RAIL = 40 // wooden rail width around the playing surface, in table units

const PALETTE = {
  white: '#f5f3ea',
  black: '#1b1b1f',
  green: '#1f9d55',
  orange: '#f08a24',
  lime: '#9bd62f',
  red: '#d6312f',
  blue: '#2f6fd6',
  yellow: '#f2cf2a',
}

export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.game = game
    this.logicalWidth = game.table.width + RAIL * 2
    this.logicalHeight = game.table.height + RAIL * 2
    this.aimState = null

    new ResizeObserver(() => this.#resize()).observe(canvas)
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
    this.#drawShadows()
    if (this.aimState) this.#drawAimLine()
    this.#drawBalls()
    if (this.aimState) this.#drawCue()
    ctx.restore()
  }

  #resize() {
    const dpr = window.devicePixelRatio || 1
    const rect = this.canvas.getBoundingClientRect()
    this.canvas.width = Math.round(rect.width * dpr)
    this.canvas.height = Math.round(rect.height * dpr)
    this.scale = this.canvas.width / this.logicalWidth
    this.draw() // resizing clears the canvas, so repaint right away
  }

  #drawRails() {
    const { ctx, logicalWidth: w, logicalHeight: h } = this
    const wood = ctx.createLinearGradient(0, 0, 0, h)
    wood.addColorStop(0, '#6b3f1f')
    wood.addColorStop(0.5, '#4a2a14')
    wood.addColorStop(1, '#5c3519')
    ctx.fillStyle = wood
    roundRect(ctx, 0, 0, w, h, 26)
    ctx.fill()

    // subtle grain
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)'
    ctx.lineWidth = 1
    for (let y = 4; y < h; y += 6) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.bezierCurveTo(w * 0.3, y + 3, w * 0.7, y - 3, w, y)
      ctx.stroke()
    }

    // bevelled edges
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)'
    ctx.lineWidth = 2
    roundRect(ctx, 1, 1, w - 2, h - 2, 25)
    ctx.stroke()

    // diamond sights
    ctx.fillStyle = '#e8d8a8'
    const { width, height } = this.game.table
    for (let i = 1; i < 8; i++) {
      if (i === 4) continue
      const x = RAIL + (width * i) / 8
      diamond(ctx, x, RAIL / 2)
      diamond(ctx, x, h - RAIL / 2)
    }
    for (let i = 1; i < 4; i++) {
      if (i === 2) continue
      const y = RAIL + (height * i) / 4
      diamond(ctx, RAIL / 2, y)
      diamond(ctx, w - RAIL / 2, y)
    }
  }

  #drawFelt() {
    const { ctx } = this
    const { width, height, color } = this.game.table

    // cushion lip
    ctx.fillStyle = '#0c3a2c'
    ctx.fillRect(-8, -8, width + 16, height + 16)

    ctx.save()
    ctx.beginPath()
    ctx.rect(0, 0, width, height)
    ctx.clip()
    ctx.fillStyle = color
    ctx.fillRect(0, 0, width, height)

    const light = ctx.createRadialGradient(
      width / 2,
      height / 2,
      height * 0.1,
      width / 2,
      height / 2,
      width * 0.65,
    )
    light.addColorStop(0, 'rgba(120, 230, 170, 0.22)')
    light.addColorStop(1, 'rgba(0, 0, 0, 0.45)')
    ctx.fillStyle = light
    ctx.fillRect(0, 0, width, height)

    // inner cushion shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.35)'
    ctx.lineWidth = 10
    ctx.strokeRect(0, 0, width, height)
    ctx.restore()
  }

  #drawPockets() {
    const { ctx } = this
    const { pockets, pocketRadius } = this.game.table
    for (const { x, y } of pockets) {
      ctx.beginPath()
      ctx.arc(x, y, pocketRadius + 4, 0, Math.PI * 2)
      ctx.fillStyle = '#b08d3c'
      ctx.fill()

      const hole = ctx.createRadialGradient(x, y, 2, x, y, pocketRadius)
      hole.addColorStop(0, '#000')
      hole.addColorStop(1, '#101010')
      ctx.beginPath()
      ctx.arc(x, y, pocketRadius, 0, Math.PI * 2)
      ctx.fillStyle = hole
      ctx.fill()
    }
  }

  #drawShadows() {
    const { ctx } = this
    const r = this.game.config.ballRadius
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    for (const ball of this.game.balls) {
      ctx.beginPath()
      ctx.ellipse(ball.x + 3, ball.y + 4, r * 1.05, r * 0.9, 0, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  #drawBalls() {
    const { ctx } = this
    const r = this.game.config.ballRadius
    for (const ball of this.game.balls) {
      const base = PALETTE[ball.color] ?? ball.color
      const shade = ctx.createRadialGradient(
        ball.x - r * 0.35,
        ball.y - r * 0.4,
        r * 0.1,
        ball.x,
        ball.y,
        r,
      )
      shade.addColorStop(0, '#ffffff')
      shade.addColorStop(0.25, base)
      shade.addColorStop(1, shadeColor(base))
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, r, 0, Math.PI * 2)
      ctx.fillStyle = shade
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
    ctx.setLineDash([2, 7])
    ctx.lineCap = 'round'
    ctx.lineWidth = 2.5
    const line = ctx.createLinearGradient(
      whiteBall.x + dir.x * start,
      whiteBall.y + dir.y * start,
      whiteBall.x + dir.x * end,
      whiteBall.y + dir.y * end,
    )
    line.addColorStop(0, 'rgba(255, 255, 255, 0.85)')
    line.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.strokeStyle = line
    ctx.beginPath()
    ctx.moveTo(whiteBall.x + dir.x * start, whiteBall.y + dir.y * start)
    ctx.lineTo(whiteBall.x + dir.x * end, whiteBall.y + dir.y * end)
    ctx.stroke()
    ctx.restore()
  }

  #drawCue() {
    const { ctx } = this
    const { whiteBall, config } = this.game
    const { aim, power } = this.aimState
    const length = Math.hypot(aim.x, aim.y) || 1
    const dir = { x: aim.x / length, y: aim.y / length } // cue sits behind the ball
    const gap = config.ballRadius + 6 + power * 60
    const cueLength = 260

    ctx.save()
    ctx.translate(whiteBall.x + dir.x * gap, whiteBall.y + dir.y * gap)
    ctx.rotate(Math.atan2(dir.y, dir.x))

    // shaft: tapered, tip at x = 0
    ctx.beginPath()
    ctx.moveTo(0, -2)
    ctx.lineTo(cueLength, -4.5)
    ctx.lineTo(cueLength, 4.5)
    ctx.lineTo(0, 2)
    ctx.closePath()
    const shaft = ctx.createLinearGradient(0, -4, 0, 4)
    shaft.addColorStop(0, '#f1d49b')
    shaft.addColorStop(1, '#b98a4a')
    ctx.fillStyle = shaft
    ctx.fill()

    // butt and tip
    ctx.fillStyle = '#2a1a10'
    ctx.fillRect(cueLength * 0.6, -4.8, cueLength * 0.4, 9.6)
    ctx.fillStyle = '#4aa3df'
    ctx.fillRect(0, -2, 5, 4)
    ctx.restore()

    // power meter under the cue
    const meterX = whiteBall.x - 24
    const meterY = whiteBall.y + config.ballRadius + 16
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)'
    roundRect(ctx, meterX, meterY, 48, 5, 2.5)
    ctx.fill()
    ctx.fillStyle = `hsl(${120 - power * 120}, 80%, 55%)`
    roundRect(ctx, meterX, meterY, Math.max(5, 48 * power), 5, 2.5)
    ctx.fill()
  }
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}

function diamond(ctx, x, y) {
  ctx.beginPath()
  ctx.moveTo(x, y - 4)
  ctx.lineTo(x + 3, y)
  ctx.lineTo(x, y + 4)
  ctx.lineTo(x - 3, y)
  ctx.closePath()
  ctx.fill()
}

/** Darkens a #rrggbb colour for the shaded side of a ball. */
function shadeColor(hex) {
  if (!/^#[0-9a-f]{6}$/i.test(hex)) return '#000'
  const n = parseInt(hex.slice(1), 16)
  const f = (v) => Math.round(v * 0.45)
  return `rgb(${f(n >> 16)}, ${f((n >> 8) & 255)}, ${f(n & 255)})`
}
