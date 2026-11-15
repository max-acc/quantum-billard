import './style.css'
import { Game } from './Game.js'
import { Input } from './Input.js'
import { Renderer } from './Renderer.js'

const canvas = document.getElementById('billiardTable')

const game = new Game()
const renderer = new Renderer(canvas, game)
const input = new Input(canvas, renderer, game)

function frame() {
  game.update()
  renderer.setAim(
    input.canAim ? { aim: input.aim, power: game.previewShot(input.aim).power } : null,
  )
  renderer.draw()
  requestAnimationFrame(frame)
}

frame()
