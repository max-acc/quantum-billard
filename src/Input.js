/** Aiming indicator and shooting; listeners are registered exactly once. */
export class Input {
  constructor(canvas, indicator, game) {
    this.canvas = canvas
    this.indicator = indicator
    this.game = game
    this.cursor = null

    document.addEventListener('mousemove', (event) => {
      this.cursor = { x: event.clientX, y: event.clientY }
    })
    document.addEventListener('click', (event) => {
      this.cursor = { x: event.clientX, y: event.clientY }
      this.game.shoot(this.#aimVector())
    })
  }

  /** Call once per frame to keep the indicator in sync with the game. */
  update() {
    const visible = this.cursor && this.game.whiteInGame && this.game.areBallsAtRest
    this.indicator.style.visibility = visible ? 'visible' : 'hidden'
    if (!visible) return

    const origin = this.#ballPosition()
    const aim = this.#aimVector()
    // The indicator sits opposite the cursor, pointing in the shot direction.
    const x = origin.x - aim.x / 2
    const y = origin.y - aim.y / 2
    const angle = Math.atan2(aim.y, aim.x) + Math.PI / 2 + Math.PI
    this.indicator.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) rotate(${angle}rad)`
  }

  /** White ball centre in page coordinates (inside the canvas border). */
  #ballPosition() {
    const rect = this.canvas.getBoundingClientRect()
    const { whiteBall } = this.game
    return {
      x: rect.left + this.canvas.clientLeft + whiteBall.x,
      y: rect.top + this.canvas.clientTop + whiteBall.y,
    }
  }

  #aimVector() {
    const origin = this.#ballPosition()
    return { x: this.cursor.x - origin.x, y: this.cursor.y - origin.y }
  }
}
