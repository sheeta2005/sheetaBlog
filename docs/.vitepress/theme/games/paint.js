// 画布按实际展示尺寸与像素密度绘制，手机和桌面都保持细边缘清楚。
export function boardCanvas(canvas, columns, rows) {
  if (!canvas) return null
  const width = canvas.getBoundingClientRect().width
  if (!width) return null
  const scale = Math.min(window.devicePixelRatio || 1, 2)
  const height = width * rows / columns
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  const context = canvas.getContext('2d')
  context.scale(scale, scale)
  const style = getComputedStyle(canvas)
  const color = name => style.getPropertyValue(name).trim()
  context.fillStyle = color('--game-board')
  context.fillRect(0, 0, width, height)
  const cell = width / columns
  context.strokeStyle = color('--game-grid')
  context.lineWidth = .6
  context.beginPath()
  for (let x = 1; x < columns; x++) { context.moveTo(x * cell, 0); context.lineTo(x * cell, height) }
  for (let y = 1; y < rows; y++) { context.moveTo(0, y * cell); context.lineTo(width, y * cell) }
  context.stroke()
  return { context, cell, color }
}
export function roundCell(context, x, y, cell, color, inset = 1.5) {
  context.fillStyle = color
  context.beginPath()
  context.roundRect(x * cell + inset, y * cell + inset, cell - inset * 2, cell - inset * 2, Math.max(2, cell * .18))
  context.fill()
}
