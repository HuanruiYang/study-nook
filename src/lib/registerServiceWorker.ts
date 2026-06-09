export function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !import.meta.env.PROD) return

  window.addEventListener('load', () => {
    const swUrl = new URL('./sw.js', window.location.href)
    navigator.serviceWorker.register(swUrl).catch(error => {
      console.warn('Service worker registration failed:', error)
    })
  })
}
