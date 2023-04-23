// 0

const assets = [
  './',
  './manifest.json',
  './desktop/sources/links/main.css',
  './desktop/sources/scripts/lib/acels.js',
  './desktop/sources/scripts/lib/theme.js',
  './desktop/sources/scripts/lib/history.js',
  './desktop/sources/scripts/lib/source.js',
  './desktop/sources/scripts/core/library.js',
  './desktop/sources/scripts/core/io.js',
  './desktop/sources/scripts/core/operator.js',
  './desktop/sources/scripts/core/orcinus.js',
  './desktop/sources/scripts/core/transpose.js',
  './desktop/sources/scripts/core/io/poly.js',
  './desktop/sources/scripts/clock.js',
  './desktop/sources/scripts/commander.js',
  './desktop/sources/scripts/cursor.js',
  './desktop/sources/scripts/client.js'
]

self.addEventListener('install', async function () {
  const cache = await caches.open('orcinus')
  assets.forEach(function (asset) {
    cache.add(asset).catch(function () {
      console.error('serviceWorker', 'Cound not cache:', asset)
    })
  })
})

self.addEventListener('fetch', async function (event) {
  const request = event.request
  event.respondWith(cacheFirst(request))
})

async function cacheFirst (request) {
  const cachedResponse = await caches.match(request)
  if (cachedResponse === undefined) {
    console.error('serviceWorker', 'Not cached:', request.url)
    return fetch(request)
  }
  return cachedResponse
}
