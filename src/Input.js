/** Tracks the cursor in table coordinates and turns clicks into shots. */
export class Input {
  constructor(canvas, renderer, game) {
    this.canvas = canvas
    this.renderer = renderer
    this.game = game
    this.cursor = null

    document.addEventListener('mousemove', (event) => this.#track(event))
    document.addEventListener('click', (event) => {
      this.#track(event)
      if (this.canAim) this.game.shoot(this.aim)
    })
    document.addEventListener('touchstart', (event) => this.#track(event.touches[0]), {
      passive: true,
    })
    document.addEventListener('touchmove', (event) => this.#track(event.touches[0]), {
      passive: true,
    })
  }

  get canAim() {
    return this.cursor !== null && this.game.whiteInGame && this.game.areBallsAtRest
  }

  /** Vector from the white ball to the cursor in table coordinates. */
  get aim() {
    const { whiteBall } = this.game
    return { x: this.cursor.x - whiteBall.x, y: this.cursor.y - whiteBall.y }
  }

  #track({ clientX, clientY }) {
    this.cursor = this.renderer.toTable(clientX, clientY)
  }
}
