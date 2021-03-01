'use strict';

const version = '1.0';

addEventListener('install', event => {
    skipWaiting();
});

addEventListener('activate', event => {
    clients.claim();
});

addEventListener('fetch', event => {
    if (event.request.method !== 'POST') {
        return;
    }

    if (event.request.url.startsWith('https://pulipulichen.github.io/PWA-Add-To-Read-Webpage-List/share-target-file/upload') === false) {
        return;
    }

    event.respondWith(Response.redirect('https://pulipulichen.github.io/PWA-Add-To-Read-Webpage-List/share-target-file/output.html'));
    event.waitUntil(async function() {
        const data = await event.request.formData();
        const client = await self.clients.get(event.resultingClientId || event.clientId);

        const file = data.get('file');
        client.postMessage({ 
          file, 
          action: 'load-image',
          title: data.get('title'),
          text: data.get('text'),
          url: data.get('url'),
        });
    }());
});