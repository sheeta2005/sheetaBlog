export default {
    enhanceApp({ app, router }) {
        if (typeof window === 'undefined') return

        router.onAfterRouteChanged = (to) => {
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
