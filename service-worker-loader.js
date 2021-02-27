let enableServiceWorker = ('serviceWorker' in navigator)
enableServiceWorker = false
if (enableServiceWorker) {
  console.log('👍', 'navigator.serviceWorker is supported');
  navigator.serviceWorker.register('./service-worker.js');
}