export class Table {
  constructor({ width, height, color }, pocketRadius) {
    this.width = width
    this.height = height
    this.color = color
    this.pocketRadius = pocketRadius
    this.pockets = [
      { x: 0, y: 0 },
      { x: width / 2, y: 0 },
      { x: width, y: 0 },
      { x: 0, y: height },
      { x: width / 2, y: height },
      { x: width, y: height },
    ]
  }

  get centerY() {
    return this.height / 2
  }
}
