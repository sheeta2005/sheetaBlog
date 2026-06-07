export default {
    enhanceApp({ app, router }) {
        if (typeof window === 'undefined') return

        const prevHandler = router.onAfterRouteChanged
        router.onAfterRouteChanged = (to) => {
            prevHandler?.(to)
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, 100)
        }

        window.addEventListener('load', () => {
            setTimeout(() => {
                window.dispatchEvent(new Event('resize'))
            }, 200)
        })
    }
}
