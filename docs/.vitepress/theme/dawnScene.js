const clamp = value => Math.max(0, Math.min(1, value))
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t) }

// 一缕晨光从主题按钮掠过，奶金光尖与薄荷尾迹共享一条舒展曲线。
export function playDawnScene(canvas, origin, onCovered, onComplete) {
  const context = canvas?.getContext('2d')
  if (!context) {
    onCovered()
    onComplete()
    return () => {}
  }
  const width = window.innerWidth
  const height = window.innerHeight
  const scale = Math.min(window.devicePixelRatio || 1, width < 600 ? 1.5 : 2)
  canvas.width = Math.round(width * scale)
  canvas.height = Math.round(height * scale)
  context.scale(scale, scale)
  let frame
  let started
  let stopped = false
  let covered = false

  // 局部柔光只在细线尖端出现，纹理复用，避免逐帧模糊整张页面。
  const glow = document.createElement('canvas')
  glow.width = glow.height = 96
  const light = glow.getContext('2d')
  const gradient = light.createRadialGradient(48, 48, 0, 48, 48, 48)
  gradient.addColorStop(0, 'rgba(255, 248, 220, .65)')
  gradient.addColorStop(.12, 'rgba(249, 239, 193, .28)')
  gradient.addColorStop(.4, 'rgba(184, 225, 198, .10)')
  gradient.addColorStop(1, 'rgba(148, 205, 178, 0)')
  light.fillStyle = gradient
  light.fillRect(0, 0, 96, 96)

  function path(t) {
    const inverse = 1 - t
    return {
      x: inverse ** 3 * origin.x + 3 * inverse ** 2 * t * width * .76 + 3 * inverse * t ** 2 * width * .25 + t ** 3 * width * .05,
      y: inverse ** 3 * origin.y + 3 * inverse ** 2 * t * height * .55 + 3 * inverse * t ** 2 * height * .27 + t ** 3 * height * .73
    }
  }

  function draw(now) {
    if (stopped) return
    started ??= now
    const progress = clamp((now - started) / 1400)
    const head = smooth((progress - .02) / .76)
    const brightness = smooth(progress / .08) * (1 - smooth((progress - .64) / .34))
    const tail = Math.max(0, head - .38)
    context.clearRect(0, 0, width, height)

    // 尾端渐细、渐淡、转青；保持单条光线，不增加粒子或大面积光幕。
    for (let segment = 0; segment < 32; segment++) {
      const ratio = (segment + 1) / 32
      const from = path(tail + (head - tail) * segment / 32)
      const to = path(tail + (head - tail) * ratio)
      const red = Math.round(145 + ratio * 110)
      const green = Math.round(206 + ratio * 37)
      const blue = Math.round(183 + ratio * 19)
      const opacity = brightness * ratio ** 1.4
      context.beginPath()
      context.moveTo(from.x, from.y)
      context.lineTo(to.x, to.y)
      context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${opacity * .07})`
      context.lineWidth = 7
      context.stroke()
      context.strokeStyle = `rgba(${red}, ${green}, ${blue}, ${opacity * .86})`
      context.lineWidth = .45 + ratio * 1.1
      context.stroke()
    }

    const tip = path(head)
    context.globalAlpha = brightness
    context.drawImage(glow, tip.x - 36, tip.y - 36, 72, 72)
    context.fillStyle = 'rgba(255, 250, 221, .86)'
    context.beginPath()
    context.arc(tip.x, tip.y, 1.4, 0, Math.PI * 2)
    context.fill()
    context.globalAlpha = 1

    if (!covered && progress >= .45) {
      covered = true
      onCovered()
    }
    if (progress < 1) frame = requestAnimationFrame(draw)
    else {
      stopped = true
      onComplete()
    }
  }

  frame = requestAnimationFrame(draw)
  return () => {
    stopped = true
    cancelAnimationFrame(frame)
    context.clearRect(0, 0, width, height)
    canvas.width = canvas.height = 0
    glow.width = glow.height = 0
  }
}
