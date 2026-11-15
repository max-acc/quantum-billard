export class Renderer {
  constructor(canvas, game) {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d')
    this.game = game
    canvas.width = game.table.width
    canvas.height = game.table.height
  }

  draw() {
    this.#drawTable()
    this.#drawBalls()
  }

  #drawTable() {
    const { ctx } = this
    const { table } = this.game

    ctx.fillStyle = table.color
    ctx.fillRect(0, 0, table.width, table.height)

    ctx.fillStyle = 'black'
    for (const pocket of table.pockets) {
      ctx.beginPath()
      ctx.arc(pocket.x, pocket.y, table.pocketRadius, 0, Math.PI * 2)
      ctx.fill()
    }
  }

  #drawBalls() {
    const { ctx } = this
    for (const ball of this.game.balls) {
      ctx.beginPath()
      ctx.arc(ball.x, ball.y, this.game.config.ballRadius, 0, Math.PI * 2)
      ctx.fillStyle = ball.color
      ctx.fill()
    }
  }
}
