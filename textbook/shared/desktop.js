/* A self-contained file-management simulation. The filesystem lives in memory. */
(function () {
  'use strict';
  const T = window.Textbook, el = T.el;
  const label = node => node.name || node.label;
  const copy = node => JSON.parse(JSON.stringify(node));
  const addressOf = nodes => nodes.map(label).join(' > ');

  T.desktopSim = block => {
    const fs = copy(block.fs);
    const root = el('section', { className: 'desktop-sim' });
    const title = el('h3');
    const address = el('input', { className: 'desktop-address', 'aria-label': 'Address bar' });
    const search = el('input', { type: 'search', placeholder: 'Search the current folder', 'aria-label': 'Search the current folder' });
    const locationRow = el('form', { className: 'desktop-location' });
    const view = el('ul', { className: 'desktop-view', tabindex: '0', 'aria-label': 'Files and folders' });
    const status = el('p', { className: 'desktop-status', role: 'status', text: 'Select a file or open a folder.' });
    const count = el('p', { className: 'desktop-count', 'aria-live': 'polite' });
    const panel = el('div', { className: 'desktop-preview', hidden: true });
    const menu = el('div', { className: 'desktop-menu', hidden: true, 'aria-label': 'File actions' });
    const drives = el('nav', { className: 'desktop-drives', 'aria-label': 'Simulated drives' });
    const tasks = el('ol', { className: 'desktop-tasks' });
    const opened = [], closed = [], previewed = [], copiedTo = [], searched = [];
    const marked = new Set();
    const completed = new Set();
    let path = [fs.drives.find(n => n.id === block.start) || fs.drives[0]];
    let selected = null, clipboard = null, dragging = null, chromebook = false;
    const here = () => path.at(-1);
    const displayName = node => chromebook && node.label === 'This PC' ? 'My files' : label(node);

    function locate(raw) {
      const parts = raw.split(/\s*(?:>|\/|\\)\s*/).map(x => x.trim()).filter(Boolean);
      if (!parts.length) return null;
      let node = fs.drives.find(d => [d.label, d.id, displayName(d)].some(name => String(name).toLowerCase() === parts[0].toLowerCase()));
      if (!node) return null;
      const nodes = [node];
      for (const bit of parts.slice(1)) {
        node = (node.children || []).find(child => label(child).toLowerCase() === bit.toLowerCase());
        if (!node) return null;
        nodes.push(node);
      }
      return { nodes, path: nodes.map(label), node, folder: Array.isArray(node.children) };
    }

    function updateTasks() {
      const state = {
        path: path.map(label), selected, selection: [...marked], fs, copied: clipboard?.mode === 'copy',
        copiedTo, previewed, opened, closed, searched, count: here().children.length, locate
      };
      tasks.replaceChildren(...(block.tasks || []).map((task, i) => {
        const done = !!task.check(state) || (task.sticky && completed.has(i));
        if (done) completed.add(i);
        return el('li', { className: done ? 'done' : '', text: (done ? '✓ ' : '○ ') + task.text });
      }));
    }
    function choose(node, add = false) {
      if (!add) marked.clear();
      if (add && marked.has(node)) marked.delete(node);
      else marked.add(node);
      selected = node;
      view.querySelectorAll('.desktop-item').forEach(button => {
        const active = marked.has(button.fileNode);
        button.classList.toggle('selected', active);
        button.setAttribute('aria-pressed', String(active));
      });
      status.textContent = marked.size > 1 ? marked.size + ' items selected.' : label(node) + ' selected.';
      updateTasks();
    }
    function navigate(nodes, message) {
      if (!Array.isArray(nodes.at(-1).children)) return;
      path = nodes;
      selected = null;
      marked.clear();
      search.value = '';
      menu.hidden = true;
      panel.hidden = true;
      panel.replaceChildren();
      address.value = path.map(displayName).join(' > ');
      status.textContent = message || 'Opened ' + displayName(here()) + '.';
      render();
    }
    function open(node, parent) {
      const location = [...parent, node];
      const filePath = addressOf(location);
      opened.push(filePath);
      if (node.folder) {
        navigate(location);
      } else {
        previewed.push(filePath);
        panel.hidden = false;
        const media = node.media && T.mediaRecord(node.media);
        const video = media && media.status !== 'placeholder' ? el('video', { controls: true, playsinline: true, preload: 'metadata', src: T.mediaURL(media), 'aria-label': 'Practice preview of ' + node.name }) : null;
        if (video) {
          const player = { stop: () => video.pause() };
          T.players.add(player);
          video.addEventListener('play', () => T.stopPlayers(player));
        }
        panel.replaceChildren(el('strong', { text: 'Preview · ' + node.name }), video,
          el('p', { text: video ? media.alt : 'Simulated preview. The file opens from ' + addressOf(parent) + '.' }));
        status.textContent = 'Opened ' + node.name + '.';
        updateTasks();
      }
    }
    function transfer(nodes, source, destination, mode) {
      const dest = destination.at(-1), sourceFolder = source.at(-1);
      if (mode === 'move' && nodes.some(node => destination.includes(node))) {
        status.textContent = 'Choose a destination outside the folder you are moving.';
        return;
      }
      const duplicate = nodes.find(node => dest.children.some(child => child !== node && label(child) === label(node)));
      if (duplicate) { status.textContent = 'A file or folder with that name already exists here. Choose a different destination or rename it.'; return; }
      if (mode === 'move' && dest === sourceFolder) {
        status.textContent = 'Those items are already in this folder.';
        return;
      }
      for (const node of nodes) {
        const moved = mode === 'copy' ? copy(node) : node;
        if (mode === 'move') sourceFolder.children = sourceFolder.children.filter(child => child !== node);
        if (mode === 'copy' && dest.children.some(child => label(child) === label(moved))) {
          const i = moved.name.lastIndexOf('.');
          let num = 1;
          do {
            moved.name = (i > 0 ? node.name.slice(0, i) : node.name) + ' (copy' + (num > 1 ? ' ' + num : '') + ')' + (i > 0 ? node.name.slice(i) : '');
            num++;
          } while (dest.children.some(child => child.name === moved.name));
        }
        dest.children.push(moved);
        if (mode === 'copy') copiedTo.push(addressOf([...destination, moved]));
      }
      status.textContent = (mode === 'move' ? 'Moved ' : 'Copied ') + nodes.length + (nodes.length === 1 ? ' item into ' : ' items into ') + label(dest) + '.';
      if (mode === 'move') { clipboard = null; marked.clear(); selected = null; }
      render();
    }
    function useClipboard(mode) {
      const items = [...marked].filter(n => here().children.includes(n));
      if (!items.length) { status.textContent = 'Select items in this folder first.'; return; }
      clipboard = { nodes: items, path: path.slice(), mode };
      status.textContent = items.length + (mode === 'copy' ? ' ready to copy.' : ' ready to move.') + ' Open a destination, then choose Paste.';
      updateTasks();
    }
    function paste() {
      if (clipboard) transfer(clipboard.nodes, clipboard.path, path, clipboard.mode);
      else status.textContent = 'Copy or cut a file before pasting.';
    }
    function rename(node, parent) {
      menu.hidden = true;
      const input = el('input', { value: node?.name || '', 'aria-label': node ? 'New name' : 'Folder name' });
      const form = el('form', { className: 'desktop-name-form' }, input, el('button', { type: 'submit', className: 'button small', text: node ? 'Save name' : 'Create folder' }),
        T.button('Cancel', () => { panel.hidden = true; panel.replaceChildren(); view.focus(); }, 'small'));
      form.addEventListener('submit', event => {
        event.preventDefault();
        const value = input.value.trim();
        if (!value || /[<>:"/\\|?*]/.test(value) || parent.children.some(child => child !== node && label(child).toLowerCase() === value.toLowerCase())) {
          status.textContent = 'Choose a valid name that is not already in this folder.';
          input.focus();
          return;
        }
        if (node) node.name = value;
        else parent.children.push({ name: value, folder: true, children: [] });
        panel.hidden = true;
        panel.replaceChildren();
        status.textContent = node ? 'Renamed to ' + value + '.' : 'Created ' + value + '.';
        render();
        view.focus();
      });
      panel.hidden = false;
      panel.replaceChildren(form);
      input.focus();
      input.select();
    }
    function showMenu(entry) {
      if (!entry) return;
      const { node, parents } = entry;
      choose(node);
      const buttons = [
        T.button('Open', () => open(node, parents), 'small'),
        T.button('Copy', () => { useClipboard('copy'); menu.hidden = true; view.focus(); }, 'small'),
        T.button('Rename', () => rename(node, parents.at(-1)), 'small')
      ];
      menu.replaceChildren(...buttons);
      menu.hidden = false;
      buttons[0].focus();
    }
    function entries() {
      const query = search.value.trim().toLowerCase();
      if (!query) return here().children.map(node => ({ node, parents: path }));
      const matches = [];
      const walk = (node, parents) => {
        if (label(node).toLowerCase().includes(query)) matches.push({ node, parents });
        (node.children || []).forEach(child => walk(child, [...parents, node]));
      };
      here().children.forEach(node => walk(node, path));
      return matches;
    }
    function render() {
      const items = entries();
      view.replaceChildren(...items.map(entry => {
        const { node, parents } = entry;
        const button = el('button', {
          className: 'desktop-item' + (marked.has(node) ? ' selected' : ''), type: 'button', draggable: 'true',
          'aria-label': (node.folder ? 'Folder: ' : 'File: ') + node.name, 'aria-pressed': String(marked.has(node))
        }, el('span', { className: 'desktop-icon ' + (node.folder ? 'folder' : 'file'), text: node.folder ? '▰' : '▤', 'aria-hidden': 'true' }),
        el('span', { text: node.name }));
        button.fileNode = node;
        button.entry = entry;
        button.onclick = event => { menu.hidden = true; choose(node, event.ctrlKey || event.metaKey || event.shiftKey); };
        button.ondblclick = () => open(node, parents);
        button.oncontextmenu = event => { event.preventDefault(); showMenu(entry); };
        button.ondragstart = event => { dragging = entry; event.dataTransfer.setData('text/plain', node.name); };
        button.ondragend = () => { dragging = null; };
        if (node.folder) dropTarget(button, [...parents, node]);
        return el('li', {}, button);
      }));
      count.textContent = items.length + (items.length === 1 ? ' item' : ' items') + (search.value ? ' found.' : ' in ' + displayName(here()) + '.');
      drives.querySelectorAll('button').forEach((button, i) => {
        button.textContent = displayName(fs.drives[i]);
        button.setAttribute('aria-pressed', String(fs.drives[i] === path[0]));
      });
      updateTasks();
    }
    function dropTarget(element, dest) {
      element.addEventListener('dragover', event => {
        if (dragging && dragging.node !== dest.at(-1)) event.preventDefault();
      });
      element.addEventListener('drop', event => {
        if (!dragging) return;
        event.preventDefault();
        const mode = dest[0] === dragging.parents[0] ? 'move' : 'copy';
        transfer([dragging.node], dragging.parents, dest, mode);
        dragging = null;
      });
    }
    fs.drives.forEach((drive, i) => {
      const button = T.button(drive.label, () => navigate([drive]), 'small');
      dropTarget(button, [drive]);
      drives.append(button);
    });
    const toggle = T.button('On a Chromebook', () => {
      chromebook = !chromebook;
      showPlatform();
      address.value = path.map(displayName).join(' > ');
      render();
    }, 'small');
    function showPlatform() {
      title.textContent = chromebook ? 'Chromebook Files practice' : 'Windows File Explorer practice';
      toggle.textContent = chromebook ? 'Use Windows names' : 'On a Chromebook';
      toggle.setAttribute('aria-pressed', String(chromebook));
    }
    locationRow.append(address, el('button', { type: 'submit', className: 'button small', text: 'Go' }));
    locationRow.onsubmit = event => {
      event.preventDefault();
      const result = locate(address.value);
      if (result?.folder) navigate(result.nodes);
      else if (result) open(result.node, result.nodes.slice(0, -1));
      else status.textContent = 'That path was not found. Check the drive and folder names.';
    };
    search.oninput = () => {
      for (const match of entries()) if (search.value.trim()) searched.push(addressOf([...match.parents, match.node]));
      render();
    };
    view.addEventListener('keydown', event => {
      const entry = event.target.entry || entries().find(e => e.node === selected);
      if ((event.metaKey || event.ctrlKey) && ['c', 'x', 'v'].includes(event.key.toLowerCase())) {
        event.preventDefault();
        if (event.key.toLowerCase() === 'v') paste();
        else useClipboard(event.key.toLowerCase() === 'c' ? 'copy' : 'move');
      } else if (event.key === 'Enter' && entry) {
        event.preventDefault();
        open(entry.node, entry.parents);
        view.focus();
      } else if (event.key === 'F10' && event.shiftKey && entry) {
        event.preventDefault();
        showMenu(entry);
      } else if (['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key)) {
        event.preventDefault();
        const buttons = [...view.querySelectorAll('button')];
        const direction = ['ArrowLeft','ArrowUp'].includes(event.key) ? -1 : 1;
        const i = buttons.findIndex(button => button.entry === event.target.entry || button.fileNode === selected);
        const target = buttons[Math.max(0, Math.min(buttons.length - 1, i + direction))];
        if (target) { choose(target.fileNode, event.shiftKey); target.focus(); }
      } else if (event.key === 'Backspace' && path.length > 1) {
        event.preventDefault();
        navigate(path.slice(0, -1));
      }
    });
    root.addEventListener('keydown', event => {
      if (event.key === 'Escape' && !menu.hidden) { menu.hidden = true; view.focus(); }
    });
    const toolbar = el('div', { className: 'desktop-toolbar' },
      T.button('Back', () => { if (path.length > 1) navigate(path.slice(0, -1)); }, 'small'),
      T.button('Close window', () => {
        if (!panel.hidden) { panel.hidden = true; panel.replaceChildren(); return; }
        if (path.length > 1) { closed.push(addressOf(path)); navigate(path.slice(0, -1), 'Returned to the parent folder.'); }
      }, 'small'),
      T.button('New folder', () => rename(null, here()), 'small'),
      T.button('Copy selected', () => useClipboard('copy'), 'small'),
      T.button('Cut selected', () => useClipboard('move'), 'small'),
      T.button('Paste', paste, 'small'));
    root.append(el('header', {}, title, toggle), drives, locationRow, toolbar, search, count, view, menu, panel, status,
      el('p', { className: 'desktop-help', text: 'Double-click or press Enter to open. Use Shift+F10 for file actions. Ctrl+C, Ctrl+X and Ctrl+V copy, cut and paste. On a Mac, use Command with those letters.' }), tasks);
    showPlatform();
    navigate(path);
    return root;
  };

  T.blocks['desktop-sim'] = b => ({
    el: T.desktopSim(b), wide: true, interactive: true,
    printNote: 'Desktop practice. Open this topic to try the file-management tasks.'
  });

  const groupedSorter = T.blocks.sorter;
  T.blocks.sorter = b => {
    if (b.mode !== 'order') return groupedSorter(b);
    let misses = 0;
    const feedback = el('p', { className: 'sort-result', 'aria-live': 'polite' });
    const list = el('ol', { className: 'sort-items' });
    const order = b.items.map((_, i) => i);
    function draw() {
      list.replaceChildren(...order.map((item, pos) => {
        const entry = b.items[item];
        const text = typeof entry === 'string' ? entry : entry.text;
        const move = (dir, name, icon) => {
          const button = T.button(icon, () => {
            [order[pos], order[pos + dir]] = [order[pos + dir], order[pos]];
            feedback.textContent = '';
            draw();
            const row = list.children[pos + dir], buttons = row.querySelectorAll('button');
            (buttons[dir < 0 ? 0 : 1].disabled ? buttons[dir < 0 ? 1 : 0] : buttons[dir < 0 ? 0 : 1]).focus();
          }, 'small');
          button.setAttribute('aria-label', name + ': ' + text);
          button.disabled = pos + dir < 0 || pos + dir >= order.length;
          return button;
        };
        return el('li', { className: 'sort-card' }, el('span', { html: T.rich(text) }),
          el('div', { className: 'actions' }, move(-1, 'Move earlier', '↑'), move(1, 'Move later', '↓')));
      }));
    }
    const check = T.button('Check order', () => {
      const wrong = order.findIndex((item, i) => item !== b.correct[i]);
      if (wrong < 0) {
        T.feedback(feedback, '<strong>Correct order.</strong> ' + (b.success || b.closing || 'You put the steps in a workable sequence.'), true);
      } else {
        misses++;
        const clue = b.items[order[wrong]].clue || 'Look at what needs to happen before this step.';
        T.feedback(feedback, clue + (misses > 1 && b.hint ? ' ' + b.hint : ''), false);
      }
    }, 'primary small');
    draw();
    return { el: el('div', { className: 'card practice-card' }, el('p', { className: 'q', text: b.prompt || 'Put the cards in order.' }), list, check, feedback), wide: true, interactive: true };
  };
})();
