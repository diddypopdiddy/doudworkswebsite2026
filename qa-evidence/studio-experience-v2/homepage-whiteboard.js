import { perspective } from './homepage-art.js?v=20260927';

// Show the approved handwriting itself, clipped from the detail panel of the
// mockup. These corners exclude its frame; the original room frame stays visible.
const source = [[1438,158],[1888,204],[1889,598],[1434,488]];
const destination = [[1099,111],[1272,174],[1262,317],[1093,242]];
const room = document.querySelector('#room-world');

if (room) {
  const style = document.createElement('style');
  style.textContent = `
    .room-whiteboard{position:absolute;inset:0;z-index:2;overflow:hidden;pointer-events:none;mix-blend-mode:multiply;transition:translate 210ms var(--ease-out)}
    .room-whiteboard-plane{position:absolute;left:0;top:0;width:1522px;height:1033px;transform-origin:0 0;transform:scale(var(--board-scale,1))}
    .room-whiteboard-image{position:absolute;left:0;top:0;width:1981px;height:794px;max-width:none;transform-origin:0 0;pointer-events:none;user-select:none}
    .room-world[data-highlight="teaching"] .room-whiteboard{translate:0 -1px}
    @media(prefers-reduced-motion:reduce){.room-whiteboard{transition:none}}
  `;
  document.head.append(style);
  const overlay = document.createElement('div');
  overlay.className = 'room-whiteboard';
  overlay.setAttribute('aria-hidden', 'true');
  const plane = document.createElement('div');
  plane.className = 'room-whiteboard-plane';
  const image = document.createElement('img');
  image.className = 'room-whiteboard-image';
  image.src = new URL('./homepage-assets/daily-board-approved.png', import.meta.url).href;
  image.alt = '';
  image.width = 1981;
  image.height = 794;
  image.draggable = false;
  image.style.clipPath = `polygon(${source.map(([x,y]) => `${x}px ${y}px`).join(',')})`;
  image.style.transform = perspective(source, destination);
  plane.append(image);
  overlay.append(plane);
  room.querySelector('.room-highlights').after(overlay);
  const resize = () => overlay.style.setProperty('--board-scale', String(room.clientWidth / 1522));
  new ResizeObserver(resize).observe(room);
  resize();
}
