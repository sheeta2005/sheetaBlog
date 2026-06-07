export default {
    enhanceApp({ app, router }) {
        if (typeof window === 'undefined') return

        let ticking = false
        let mouseX = window.innerWidth / 2
        let mouseY = window.innerHeight / 2
        let scrollY = 0

        const MOUSE_PARALLAX_INTENSITY = 15
        const SCROLL_PARALLAX_INTENSITY = 0.05

        function updateParallax() {
            const bgLayer = document.querySelector('.VPHome .parallax-bg')
            if (!bgLayer) return

            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2

            const mouseOffsetX = (mouseX - centerX) / centerX
            const mouseOffsetY = (mouseY - centerY) / centerY

            const translateX = mouseOffsetX * MOUSE_PARALLAX_INTENSITY
            const translateY = -mouseOffsetY * MOUSE_PARALLAX_INTENSITY - scrollY * SCROLL_PARALLAX_INTENSITY

            bgLayer.style.transform = `translate(${translateX}px, ${translateY}px)`

            ticking = false
        }

        function onScroll() {
            scrollY = window.pageYOffset
            if (!ticking) {
                requestAnimationFrame(updateParallax)
                ticking = true
            }
        }

        function onMouseMove(e) {
            mouseX = e.clientX
            mouseY = e.clientY
            
            if (!ticking) {
                requestAnimationFrame(updateParallax)
                ticking = true
            }
        }

        function init() {
            const isHomePage = document.querySelector('.VPHome')
            
            let bgLayer = document.querySelector('.VPHome .parallax-bg')
            if (isHomePage && !bgLayer) {
                bgLayer = document.createElement('div')
                bgLayer.className = 'parallax-bg'
                bgLayer.setAttribute('data-parallax', 'true')
                isHomePage.insertBefore(bgLayer, isHomePage.firstChild)
            }
            
            if (isHomePage) {
                window.addEventListener('scroll', onScroll, { passive: true })
                window.addEventListener('mousemove', onMouseMove, { passive: true })
                requestAnimationFrame(updateParallax)
            }
        }

        router.onAfterRouteChanged = (to) => {
            if (to === '/' || to === '/index.html') {
                setTimeout(init, 150)
            }
        }

        if (typeof window !== 'undefined') {
            if (document.readyState === 'complete') {
                init()
            } else {
                window.addEventListener('load', init)
            }
        }
    }
}
