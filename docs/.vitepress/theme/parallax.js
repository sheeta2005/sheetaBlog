import { nextTick } from 'vue'

export default {
    enhanceApp({ app, router }) {
        if (typeof window === 'undefined') return

        const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
        const pointer = window.matchMedia('(hover: hover) and (pointer: fine)')
        const revealed = new WeakSet()
        const animations = new Set()
        let home
        let observer
        let frame = 0
        let mouseX = 0
        let mouseY = 0

        function updateParallax() {
            frame = 0
            const background = home?.querySelector('.parallax-bg')
            if (!background) return
            // 恢复原有方向和幅度：鼠标最大位移 15px，滚动位移为距离的 5%。
            const scrollOffset = window.scrollY * 0.05
            background.style.transform = `translate(${mouseX * 15}px, ${-mouseY * 15 - scrollOffset}px)`
            home.style.setProperty('--avatar-x', `${mouseX * 4}px`)
            home.style.setProperty('--avatar-y', `${mouseY * 4}px`)
        }

        function scheduleUpdate() {
            if (!frame) frame = requestAnimationFrame(updateParallax)
        }

        function onMouseMove(event) {
            mouseX = (event.clientX / window.innerWidth - 0.5) * 2
            mouseY = (event.clientY / window.innerHeight - 0.5) * 2
            scheduleUpdate()
        }

        function cleanup() {
            observer?.disconnect()
            window.removeEventListener('scroll', scheduleUpdate)
            window.removeEventListener('mousemove', onMouseMove)
            cancelAnimationFrame(frame)
            frame = 0
            animations.forEach(animation => animation.cancel())
            animations.clear()
            home?.querySelector('.parallax-bg')?.style.removeProperty('transform')
            home?.style.removeProperty('--avatar-x')
            home?.style.removeProperty('--avatar-y')
        }

        function init() {
            cleanup()
            home = document.querySelector('.VPHome')
            if (!home || motion.matches) return

            // 鼠标视差仅在精细指针设备启用，手机保持插画稳定。
            if (pointer.matches) {
                window.addEventListener('scroll', scheduleUpdate, { passive: true })
                window.addEventListener('mousemove', onMouseMove, { passive: true })
                mouseX = mouseY = 0
                scheduleUpdate()
            }

            if (!('IntersectionObserver' in window)) return
            observer = new IntersectionObserver(entries => {
                entries.forEach(({ target, isIntersecting }) => {
                    if (!isIntersecting) return
                    observer.unobserve(target)
                    revealed.add(target)
                    // 进入视口才启动动画；任何初始化失败都不会把内容永久隐藏。
                    const animation = target.animate([
                        { opacity: 0, transform: 'translateY(8px)' },
                        { opacity: 1, transform: 'translateY(0)' }
                    ], { duration: 600, easing: 'cubic-bezier(.2,.65,.3,1)' })
                    animations.add(animation)
                    animation.finished.then(() => animations.delete(animation), () => {})
                })
            }, { threshold: 0.05 })

            home.querySelectorAll('.home-section-heading, .VPFeatures, .home-panel, .home-closing-note').forEach(section => {
                if (revealed.has(section)) return
                if (section.getBoundingClientRect().top < window.innerHeight) {
                    revealed.add(section)
                } else {
                    observer.observe(section)
                }
            })
        }

        const previous = router.onAfterRouteChanged
        router.onAfterRouteChanged = async to => {
            await previous?.(to)
            await nextTick()
            init()
        }

        // 根组件挂载后初始化；离开页面或偏好改变时清理，不重复绑定。
        app.mixin({
            mounted() {
                if (!this.$parent) nextTick(init)
            },
            unmounted() {
                if (!this.$parent) {
                    cleanup()
                    motion.removeEventListener('change', init)
                    pointer.removeEventListener('change', init)
                }
            }
        })
        motion.addEventListener('change', init)
        pointer.addEventListener('change', init)
    }
}
