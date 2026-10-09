import { playDawnScene } from './dawnScene.js'

const clamp = value => Math.max(0, Math.min(1, value))
const smooth = value => { const t = clamp(value); return t * t * (3 - 2 * t) }
const noise = (index, salt = 1) => {
  const value = Math.sin(index * 127.1 + salt * 311.7) * 43758.5453
  return value - Math.floor(value)
}

// 场景仅在切换期间绘制；按视口限制分辨率与粒子数量，结束即释放帧循环。
export function playThemeScene(canvas, direction, origin, onCovered, onComplete) {
  if (direction === 'dawn') return playDawnScene(canvas, origin, onCovered, onComplete)
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
  const duration = 2300
  const shortSide = Math.min(width, height)
  const mobile = width < 600
  let frame
  let covered = false
  let cancelled = false
  let started

  // 共用柔光纹理，避免对每一颗火星执行昂贵的实时模糊。
  const glow = document.createElement('canvas')
  glow.width = glow.height = 96
  const light = glow.getContext('2d')
  const gradient = light.createRadialGradient(48, 48, 0, 48, 48, 48)
  gradient.addColorStop(0, 'rgba(255, 248, 219, .9)')
  gradient.addColorStop(.1, 'rgba(255, 220, 147, .5)')
  gradient.addColorStop(.4, 'rgba(239, 161, 81, .12)')
  gradient.addColorStop(1, 'rgba(239, 161, 81, 0)')
  light.fillStyle = gradient
  light.fillRect(0, 0, 96, 96)

  function halo(x, y, radius, opacity) {
    context.globalAlpha = opacity
    context.drawImage(glow, x - radius, y - radius, radius * 2, radius * 2)
    context.globalAlpha = 1
  }

  // 仙女棒尖端沿弯曲轨迹从切换按钮掠向左下，火星出生位置跟随轨迹。
  function flight(t) {
    const p = smooth(t)
    const endX = width * .06
    const endY = height * .72
    return {
      x: (1 - p) ** 2 * origin.x + 2 * (1 - p) * p * width * .45 + p * p * endX,
      y: (1 - p) ** 2 * origin.y + 2 * (1 - p) * p * height * .65 + p * p * endY
    }
  }

  const particles = Array.from({ length: mobile ? 110 : 230 }, (_, index) => {
    const group = index % 4
    const burstTime = .15 + group * .075
    const born = burstTime + noise(index, 2) * .035
    const center = flight((burstTime - .07) / .48)
    const angle = noise(index, 3) * Math.PI * 2
    const speed = shortSide * (.22 + noise(index, 4) * .98)
    return { ...center, born, angle, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed, life: .32 + noise(index, 5) * .45, seed: index }
  })

  function emberPosition(particle, age) {
    const travel = (1 - Math.exp(-age * 3)) / 3
    return {
      x: particle.x + particle.vx * travel + Math.sin(age * 13 + particle.seed) * age * 6,
      y: particle.y + particle.vy * travel + age * age * shortSide * .25
    }
  }

  function drawFireworks(t) {
    const night = smooth((t - .10) / .24) * (1 - smooth((t - .57) / .35))
    // 蓝紫暮色先笼住旧页面，暖金照亮局部，交接过程中保持可辨认的内容。
    const dusk = context.createRadialGradient(width * .58, height * .32, 0, width * .5, height * .5, Math.max(width, height))
    dusk.addColorStop(0, `rgba(48, 38, 59, ${night * .18})`)
    dusk.addColorStop(.6, `rgba(17, 24, 46, ${night * .52})`)
    dusk.addColorStop(1, `rgba(13, 20, 39, ${night * .68})`)
    context.fillStyle = dusk
    context.fillRect(0, 0, width, height)
    context.globalCompositeOperation = 'lighter'

    // 每次迸裂有短暂的白金热芯，再散成金丝，形成几次不同大小的花火呼吸。
    for (let bloom = 0; bloom < 4; bloom++) {
      const age = t - (.15 + bloom * .075)
      if (age <= 0 || age > .21) continue
      const center = flight((.15 + bloom * .075 - .07) / .48)
      const heat = Math.sin(clamp(age / .21) * Math.PI) ** 1.5
      halo(center.x, center.y, shortSide * (.12 + age * .55), heat * .6)
      halo(center.x, center.y, 26 + age * 45, heat * .95)
    }

    const flightTime = clamp((t - .025) / .50)
    const tip = flight(flightTime)
    if (t < .61) {
      const brightness = smooth(t / .07) * (1 - smooth((t - .49) / .12))
      // 不规则尾迹像挥动仙女棒留下的细光，逐段衰减，不出现硬质扫描线。
      for (let segment = 0; segment < 28; segment++) {
        const head = flight(Math.max(0, flightTime - segment * .010))
        const tail = flight(Math.max(0, flightTime - (segment + 1) * .010))
        context.strokeStyle = `rgba(255, ${222 - segment}, 151, ${brightness * (1 - segment / 28) * .72})`
        context.lineWidth = 1 + (1 - segment / 28) * 1.5
        context.beginPath()
        context.moveTo(head.x, head.y)
        context.lineTo(tail.x, tail.y)
        context.stroke()
      }
      halo(tip.x, tip.y, 54 + Math.sin(t * 31) * 9, brightness * .85)
      halo(tip.x, tip.y, 160, brightness * .22)
      context.fillStyle = `rgba(255, 253, 225, ${brightness})`
      context.beginPath()
      context.arc(tip.x, tip.y, 3, 0, Math.PI * 2)
      context.fill()
    }

    particles.forEach(particle => {
      const age = (t - particle.born) * 2.3
      if (age <= 0 || age > particle.life * 2.3) return
      const fade = (1 - smooth(age / (particle.life * 2.3))) * smooth(age / .045)
      const position = emberPosition(particle, age)
      const tailLength = Math.min(age, .07 + noise(particle.seed, 8) * .20)
      context.beginPath()
      for (let point = 0; point <= 7; point++) {
        const dot = emberPosition(particle, age - tailLength + tailLength * point / 7)
        if (point === 0) context.moveTo(dot.x, dot.y)
        else context.lineTo(dot.x, dot.y)
      }
      context.strokeStyle = `rgba(255, ${Math.round(185 + fade * 52)}, ${Math.round(91 + fade * 95)}, ${fade * .85})`
      context.lineWidth = .7 + noise(particle.seed, 9) * 1.2
      context.stroke()
      // 金丝末端的热芯、断续支火与下坠余烬，避免规则放射状图案。
      const flicker = .68 + Math.sin(age * 42 + particle.seed) * .23
      if (particle.seed % 3 === 0) halo(position.x, position.y, 9 + fade * 9, fade * .55)
      context.fillStyle = `rgba(255, 244, 200, ${fade * flicker})`
      context.fillRect(position.x, position.y, 1 + fade, 1 + fade)
      if (particle.seed % 5 === 0 && age < .55) {
        context.beginPath()
        context.moveTo(position.x, position.y)
        context.lineTo(position.x + Math.cos(particle.angle + .8) * age * 24, position.y + Math.sin(particle.angle + .8) * age * 24)
        context.stroke()
      }
    })

    // 火花之后保留短暂的失焦暖光，呈现夏夜空气中的余温。
    for (let index = 0; index < (mobile ? 12 : 24); index++) {
      const opacity = smooth((t - .2) / .35) * (1 - smooth((t - .65) / .35))
      const x = noise(index, 12) * width
      const y = noise(index, 13) * height + t * 14
      halo(x, y, 3 + noise(index, 14) * 14, opacity * .19)
    }
    context.globalCompositeOperation = 'source-over'
  }

  function draw(now) {
    if (cancelled) return
    started ??= now
    const progress = clamp((now - started) / duration)
    context.clearRect(0, 0, width, height)
    drawFireworks(progress)
    if (!covered && progress >= .31) {
      covered = true
      onCovered()
    }
    if (progress < 1) frame = requestAnimationFrame(draw)
    else onComplete()
  }
  frame = requestAnimationFrame(draw)
  return () => {
    cancelled = true
    cancelAnimationFrame(frame)
    context.clearRect(0, 0, width, height)
    canvas.width = canvas.height = 0
  }
}
