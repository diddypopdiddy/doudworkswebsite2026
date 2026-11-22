(function () {
  'use strict';
  const workerURL = new URL('media-range.js', document.currentScript.src);
  const entries = [...document.querySelectorAll('script[type="text/textbook-script"]')];

  function enableMediaSeeking() {
    if (!/^https?:$/.test(location.protocol) || !navigator.serviceWorker) return;
    const worker = navigator.serviceWorker;
    const registration = worker.register(workerURL);
    if (worker.controller?.scriptURL === workerURL.href) {
      registration.catch(() => {});
      return;
    }
    return new Promise(resolve => {
      const timer = setTimeout(finish, 3500);
      function finish() {
        clearTimeout(timer);
        worker.removeEventListener('controllerchange', check);
        resolve();
      }
      function check() {
        if (worker.controller?.scriptURL === workerURL.href) finish();
      }
      worker.addEventListener('controllerchange', check);
      registration.then(check, finish);
      check();
    });
  }

  async function launch() {
    for (const entry of entries) {
      if (!entry.src) continue;
      const preload = document.createElement('link');
      preload.rel = 'preload';
      preload.as = 'script';
      preload.href = entry.src;
      document.head.append(preload);
    }
    await enableMediaSeeking();
    for (const entry of entries) {
      const script = document.createElement('script');
      if (entry.src) {
        script.src = entry.src;
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = () => reject(new Error('Could not load ' + entry.src));
          entry.after(script);
        });
      } else {
        script.textContent = entry.textContent;
        entry.after(script);
      }
      entry.remove();
    }
    document.dispatchEvent(new Event('textbook-ready'));
  }

  launch().catch(error => {
    const app = document.getElementById('app');
    if (app) app.textContent = 'The page could not load. Reload to try again.';
    console.error(error);
  });
})();
