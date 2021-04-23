'use strict'

import { skipWaiting, clientsClaim, cacheNames } from 'workbox-core'
import { registerRoute, setDefaultHandler, setCatchHandler } from 'workbox-routing'
import { matchPrecache, precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching'
import { NetworkFirst, NetworkOnly, StaleWhileRevalidate, CacheFirst } from 'workbox-strategies'
import { Queue } from 'workbox-background-sync'
import { ExpirationPlugin } from 'workbox-expiration'

/** CONSTANTS **/
const FALLBACK_URL = '/fallback'
const FALLBACK_CACHE_NAME = 'fallback'
const API_CALL_ID_HEADER = 'Api-Call-Id'
const API_BROADCAST_CHANNEL = 'api-channel'
const API_QUEUE = 'api-queue'
const MessageType = {
    SyncActivity: 'SYNC_ACTIVITY',
    SyncInProgress: 'SYNC_INPROGRESS',
    SyncCompleted: 'SYNC_COMPLETED',
    SyncFailed: 'SYNC_FAILED',
    TriggerSync: 'TRIGGER_SYNC'
}
// Length of time in seconds
const ONE_YEAR = 365 * 24 * 60 * 60
const THIRTY_DAYS = 30 * 24 * 60 * 60
const TWO_WEEKS = 14 * 24 * 60 * 60

// This is used to force the updated service worker
// to activate immediately rather than wait for all
// clients (e.g. tabs or windows) to be closed.
skipWaiting()
clientsClaim()

// https://developers.google.com/web/tools/workbox/guides/get-started?hl=en#precaching
// https://developers.google.com/web/tools/workbox/guides/using-bundlers?hl=en#optional_inject_a_precache_manifest
precacheAndRoute(self.__WB_MANIFEST)
cleanupOutdatedCaches()

// Warm up the runtime cache to precache the fallback endpoint
// Reference: https://github.com/GoogleChrome/workbox/issues/2418#issuecomment-604446048
self.addEventListener('install', (event) => {
    const urls = [FALLBACK_URL]
    const cacheName = cacheNames.runtime
    event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(urls)))
})

registerRoute(
    FALLBACK_URL,
    new StaleWhileRevalidate({
        cacheName: FALLBACK_CACHE_NAME,
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    // MUST be the same as "start_url" in manifest.json
    '/',
    // use NetworkFirst or NetworkOnly if you redirect un-authenticated user to login page
    // use StaleWhileRevalidate if you want to prompt user to reload when new version available
    new NetworkFirst({
        // don't change cache name
        cacheName: 'start-url',
        plugins: [new ExpirationPlugin({ maxEntries: 1, maxAgeSeconds: 86400, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
    new CacheFirst({
        cacheName: 'google-fonts',
        plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: ONE_YEAR, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /^maps\.googleapis.com\/.*/i,
    new StaleWhileRevalidate({
        cacheName: 'google-maps',
        // NB can't cache for more than 30 days: https://stackoverflow.com/questions/6109369/how-to-cache-google-map-tiles-for-offline-usage
        plugins: [new ExpirationPlugin({ maxEntries: 10, maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,
    new StaleWhileRevalidate({
        cacheName: 'static-font-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 4, maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,
    new StaleWhileRevalidate({
        cacheName: 'static-image-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /\.(?:js)$/i,
    new StaleWhileRevalidate({
        cacheName: 'static-js-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 64, maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /\.(?:css|less)$/i,
    new StaleWhileRevalidate({
        cacheName: 'static-style-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /\.(?:json|xml|csv)$/i,
    new NetworkFirst({
        cacheName: 'static-data-assets',
        plugins: [new ExpirationPlugin({ maxEntries: 32, maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /\/api\/.*$/i,
    new NetworkFirst({
        cacheName: 'apis',
        // fall back to cache if api does not response within 10 seconds
        networkTimeoutSeconds: 10,
        plugins: [new ExpirationPlugin({ maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /\/apollo\/.*$/i,
    new NetworkFirst({
        cacheName: 'apollo',
        // fall back to cache if api does not response within 10 seconds
        networkTimeoutSeconds: 10,
        plugins: [new ExpirationPlugin({ maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true })]
    }),
    'GET'
)

registerRoute(
    /.*/i,
    new NetworkFirst({
        cacheName: 'others',
        networkTimeoutSeconds: 10,
        plugins: [new ExpirationPlugin({ maxAgeSeconds: THIRTY_DAYS, purgeOnQuotaError: true, maxEntries: 32 })]
    }),
    'GET'
)

/** BACKGROUND SYNC **/

/**
  * Loops through each request in the queue and attempts to re-fetch it.
  * If the request succeeds, broadcast the result and activity ID which
  * the mobile app listens and actions accordingly. If any request fails
  * to re-fetch, it's put back in the same position in  the queue (which
  * registers a retry for the next sync event).
  */
const backgroundSync = async ({ queue }) => {
    const channel = new BroadcastChannel(API_BROADCAST_CHANNEL)
    channel.postMessage({ type: MessageType.SyncInProgress })

    let entry
    while ((entry = await queue.shiftRequest())) {
        try {
            // We need to clone the Request object since it cannot be reused twice.
            // Reference: https://developer.mozilla.org/en-US/docs/Web/API/Request/clone
            const request = entry.request.clone()
            const apiCallId = entry.request.headers.get(API_CALL_ID_HEADER)

            const result = await fetch(request)
            const text = await result.text()
            let data

            try {
                data = JSON.parse(text)
            } catch (err) {
                data = text
            }

            channel.postMessage({ apiCallId, result: data, type: MessageType.SyncActivity })

            console.log('REPLAY SUCCESSFUL: ', data)
        } catch (error) {
            console.error('REPLAY FAILED', entry.request, error)

            channel.postMessage({ type: MessageType.SyncFailed })
            await queue.unshiftRequest(entry)
            throw error
        }
    }

    console.log('Replay complete!')
    channel.postMessage({ type: MessageType.SyncCompleted })
    channel.close()
}

const registerApiRoutes = ({ queue }) => {
    // We need to explicitly define the HTTP methods
    // for the API routes for the request to be properly
    // piped to the background sync queue.
    for (const method of ['POST', 'PATCH', 'DELETE', 'PUT']) {
        registerRoute(
            /\/(api|apollo)\/.*$/i,
            new NetworkOnly({
                plugins: [{
                    // To enable triggering of background sync on demand, we
                    // need to use the BackgroundSync Queue rather the plugin.
                    // The plugin implements fetchDidFail for us, so in this
                    // this instance we need to implement it ourselves.
                    // Reference: https://github.com/GoogleChrome/workbox/blob/e5e08fbb4dec254a6a33684df165fee1b659a005/packages/workbox-background-sync/src/BackgroundSyncPlugin.ts#L39
                    fetchDidFail: async ({ request }) => {
                        await queue.pushRequest({ request })
                    }
                }]
            }),
            method
        )
    }
}

const apiQueue = new Queue(
    API_QUEUE, {
    onSync: backgroundSync,
    // TODO: What happens if the user doesn't go online within 7 days?
    // Normally what would happen is that the request would be discarded
    // after 7 days.
    maxRetentionTime: TWO_WEEKS // Retry for max of 7 days
})

// Set up a broadcast channel to listen for any request to sync
const apiChannel = new BroadcastChannel(API_BROADCAST_CHANNEL)
apiChannel.onmessage = (event) => {
    if (event.data && event.data.type === MessageType.TriggerSync) {
        backgroundSync({ queue: apiQueue })
    }
}

registerApiRoutes({ queue: apiQueue })


// Global fallbacks to deal with any handler function failures
// Reference: https://developers.google.com/web/tools/workbox/guides/advanced-recipes?hl=en#comprehensive_fallbacks

// Use a stale-while-revalidate strategy for all other requests.
setDefaultHandler(new StaleWhileRevalidate())
setCatchHandler(({ event }) => {
    // The FALLBACK_URL entries must be added to the cache ahead of time, either
    // via runtime or precaching. If they are precached, then callb
    // `matchPrecache(FALLBACK_URL)` (from the `workbox-precaching` package)
    // to get the response from the correct cache.
    //
    // Use event, request, and url to figure out how to respond.
    // One approach would be to use request.destination, see
    // https://medium.com/dev-channel/service-worker-caching-strategies-based-on-request-types-57411dd7652c
    switch (event.request.destination) {
        case 'document':
            return caches.match(FALLBACK_CACHE_NAME)
        // NOTE: We could also add fallbacks for images and fonts
        // case 'image':
        // case 'font':
        default:
            // If we don't have a fallback, just return an error response.
            return Response.error()
    }
})
