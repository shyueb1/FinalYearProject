console.log('service worker loaded');

self.addEventListener('push', (e) => {
    self.registration.showNotification(e.data.text());
});