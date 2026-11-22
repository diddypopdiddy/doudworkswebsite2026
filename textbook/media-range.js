'use strict';

const mediaPath = new URL('media/', self.registration.scope).pathname;
const budget = 48 * 1024 * 1024;
const cached = new Map();
const inFlight = new Map();
let usedBytes = 0;

self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));

async function wholeMedia(url) {
  const hit = cached.get(url);
  if (hit) {
    cached.delete(url);
    cached.set(url, hit);
    return hit;
  }
  if (inFlight.has(url)) return inFlight.get(url);

  const download = (async () => {
    const response = await fetch(url, { credentials: 'omit' });
    if (response.status !== 200) throw new Error('Full media file unavailable.');
    const blob = await response.blob();
    if (blob.size <= budget) {
      while (usedBytes + blob.size > budget) {
        const oldest = cached.keys().next().value;
        usedBytes -= cached.get(oldest).size;
        cached.delete(oldest);
      }
      cached.set(url, blob);
      usedBytes += blob.size;
    }
    return blob;
  })();
  inFlight.set(url, download);
  try {
    return await download;
  } finally {
    inFlight.delete(url);
  }
}

async function mediaRange(request, range) {
  try {
    const blob = await wholeMedia(request.url);
    const [, first, last] = range;
    const total = blob.size;
    const start = first ? Number(first) : Math.max(0, total - Number(last));
    const end = first && last ? Math.min(total - 1, Number(last)) : total - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
      return new Response(null, {status: 416, headers: {
        'Accept-Ranges': 'bytes',
        'Content-Range': 'bytes */' + total,
      }});
    }
    const part = blob.slice(start, end + 1, blob.type);
    return new Response(part, {status: 206, headers: {
      'Accept-Ranges': 'bytes',
      'Content-Length': String(part.size),
      'Content-Range': 'bytes ' + start + '-' + end + '/' + total,
      'Content-Type': part.type || 'application/octet-stream',
    }});
  } catch {
    return fetch(request);
  }
}

// The static host sends a complete file for Range requests. Serve those
// requests from the complete same-origin media file in the browser.
self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(mediaPath)) return;
  if (!/\.(?:mp4|webm|m4a|wav|mp3)$/i.test(url.pathname)) return;
  const range = /^bytes=(\d*)-(\d*)$/i.exec(request.headers.get('range') || '');
  if (range && (range[1] || range[2])) event.respondWith(mediaRange(request, range));
});
