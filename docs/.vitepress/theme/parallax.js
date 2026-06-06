export default {
    enhanceApp({ app, router }) {
        if (typeof window === 'undefined') return

        let ticking = false
        let mouseX = window.innerWidth / 2
        let mouseY = window.innerHeight / 2
        let scrollY = 0

        // 视差强度配置
        const MOUSE_PARALLAX_INTENSITY = 15   // 鼠标跟随强度（像素）
        const SCROLL_PARALLAX_INTENSITY = 0.2 // 滚动视差强度

        function updateParallax() {
            const bgLayer = document.querySelector('.VPHome .parallax-bg')
            if (!bgLayer) return

            const centerX = window.innerWidth / 2
            const centerY = window.innerHeight / 2

            // 计算鼠标偏移量（-1 到 1）
            const mouseOffsetX = (mouseX - centerX) / centerX
            const mouseOffsetY = (mouseY - centerY) / centerY

            // 计算位移（像素）- 反转 Y 轴方向
            const translateX = mouseOffsetX * MOUSE_PARALLAX_INTENSITY
            const translateY = -mouseOffsetY * MOUSE_PARALLAX_INTENSITY - scrollY * SCROLL_PARALLAX_INTENSITY

            // 应用 transform 到背景层
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
            
            // 创建背景层 DOM 元素
            let bgLayer = document.querySelector('.VPHome .parallax-bg')
            if (isHomePage && !bgLayer) {
                bgLayer = document.createElement('div')
                bgLayer.className = 'parallax-bg'
                isHomePage.insertBefore(bgLayer, isHomePage.firstChild)
            }
            
            if (isHomePage) {
                window.addEventListener('scroll', onScroll, { passive: true })
                window.addEventListener('mousemove', onMouseMove, { passive: true })
                updateParallax()
            }
        }

        // 路由切换时重新初始化
        router.onAfterRouteChanged = () => {
            setTimeout(init, 100)
        }

        // 首次加载
        init()
    }
}
