export class Ball {
  constructor({ x, y, color }) {
    this.x = x
    this.y = y
    this.dx = 0
    this.dy = 0
    this.color = color
  }

  get isWhite() {
    return this.color === 'white'
  }

  get isMoving() {
    return this.dx !== 0 || this.dy !== 0
  }

  stop() {
    this.dx = 0
    this.dy = 0
  }
}
