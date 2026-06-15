const LABELS = [
  { key: 'feat',   text: 'Feature',  cls: 'label-feat'   },
  { key: 'bug',    text: 'Bug',      cls: 'label-bug'    },
  { key: 'design', text: 'Design',   cls: 'label-design' },
  { key: 'urgent', text: 'Urgent',   cls: 'label-urgent' },
  { key: 'done',   text: 'Done',     cls: 'label-done'   },
];

const COL_COLORS = ['#5b6af0','#f0a05b','#5bbff0','#a05bf0','#5bf09a','#f05b8a'];

const DEFAULT_DATA = {
  columns: [
    {
      id: 'col-1', title: 'To Do', color: '#5b6af0',
      cards: [
        { id: 'c1', text: 'Set up project repository on GitHub', labels: ['feat'], due: '' },
        { id: 'c2', text: 'Design wireframes for landing page', labels: ['design'], due: '' },
        { id: 'c3', text: 'Fix navigation bug on mobile', labels: ['bug','urgent'], due: '' },
      ]
    },
    {
      id: 'col-2', title: 'In Progress', color: '#f0a05b',
      cards: [
        { id: 'c4', text: 'Build Kanban board UI', labels: ['feat'], due: '' },
        { id: 'c5', text: 'Write README documentation', labels: ['done'], due: '' },
      ]
    },
    {
      id: 'col-3', title: 'Review', color: '#a05bf0',
      cards: [
        { id: 'c6', text: 'Code review: movie search app', labels: ['feat'], due: '' },
      ]
    },
    {
      id: 'col-4', title: 'Done', color: '#5bf09a',
      cards: [
        { id: 'c7', text: 'Deploy movie search app to GitHub Pages', labels: ['done'], due: '' },
      ]
    },
  ]
};

let state = loadState();
let dragCard = null, dragSourceCol = null;
let editingCard = null, editingColId = null;
let isDark = false;

function loadState() {
  try {
    const s = localStorage.getItem('taskflow_v2');
    return s ? JSON.parse(s) : JSON.parse(JSON.stringify(DEFAULT_DATA));
  } catch {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function saveState() {
  localStorage.setItem('taskflow_v2', JSON.stringify(state));
  updateStats();
}

function uid() {
  return 'id-' + Math.random().toString(36).slice(2, 9);
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

// ── STATS ──────────────────────────────────────────────
function updateStats() {
  const bar = document.getElementById('stats-bar');
  const total = state.columns.reduce((a, c) => a + c.cards.length, 0);
  bar.innerHTML =
    state.columns.map(col =>
      `<span class="stat"><strong style="color:${col.color}">${col.cards.length}</strong> ${col.title}</span>`
    ).join('') +
    `<span class="stat" style="margin-left:auto"><strong>${total}</strong> total tasks</span>`;
}

// ── RENDER ─────────────────────────────────────────────
function render() {
  const board = document.getElementById('board');
  const addColBtn = document.getElementById('add-col-btn');
  board.innerHTML = '';
  board.appendChild(addColBtn);

  state.columns.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'column';
    colEl.dataset.colId = col.id;

    colEl.innerHTML = `
      <div class="col-header">
        <div class="col-title-wrap">
          <div class="col-dot" style="background:${col.color}"></div>
          <input class="col-title" value="${escHtml(col.title)}" data-col-id="${col.id}" />
        </div>
        <span class="col-count">${col.cards.length}</span>
        <button class="col-menu-btn" data-col-id="${col.id}" title="Delete column">✕</button>
      </div>
      <div class="cards-list" data-col-id="${col.id}"></div>
      <div class="col-footer">
        <button class="add-card-btn" data-col-id="${col.id}">+ Add card</button>
        <div class="add-card-form" data-col-id="${col.id}">
          <textarea placeholder="Card title..." rows="2"></textarea>
          <div class="add-card-actions">
            <button class="btn-add-confirm" data-col-id="${col.id}">Add</button>
            <button class="btn-add-cancel" data-col-id="${col.id}">Cancel</button>
          </div>
        </div>
      </div>`;

    const list = colEl.querySelector('.cards-list');
    col.cards.forEach(card => list.appendChild(makeCard(card, col.id)));

    colEl.addEventListener('dragover', e => {
      e.preventDefault();
      colEl.classList.add('drag-over');
      const afterEl = getDragAfterElement(list, e.clientY);
      const placeholder = document.querySelector('.drag-placeholder');
      if (afterEl) list.insertBefore(placeholder, afterEl);
      else list.appendChild(placeholder);
    });

    colEl.addEventListener('dragleave', e => {
      if (!colEl.contains(e.relatedTarget)) colEl.classList.remove('drag-over');
    });

    colEl.addEventListener('drop', e => {
      e.preventDefault();
      colEl.classList.remove('drag-over');
      document.querySelector('.drag-placeholder')?.remove();
      if (!dragCard) return;
      const afterEl = getDragAfterElement(list, e.clientY);
      const cardIdx = afterEl
        ? col.cards.findIndex(c => c.id === afterEl.dataset.cardId)
        : col.cards.length;
      const srcCol = state.columns.find(c => c.id === dragSourceCol);
      const cardObj = srcCol.cards.find(c => c.id === dragCard);
      srcCol.cards = srcCol.cards.filter(c => c.id !== dragCard);
      col.cards.splice(cardIdx < 0 ? col.cards.length : cardIdx, 0, cardObj);
      dragCard = null;
      dragSourceCol = null;
      saveState();
      render();
    });

    board.insertBefore(colEl, addColBtn);
  });

  attachHandlers();
  updateStats();
}

function makeCard(card, colId) {
  const el = document.createElement('div');
  el.className = 'card';
  el.dataset.cardId = card.id;
  el.draggable = true;

  const today = new Date().toISOString().slice(0, 10);
  const isOverdue = card.due && card.due < today;

  const labelsHtml = (card.labels || []).map(k => {
    const l = LABELS.find(x => x.key === k);
    return l ? `<span class="label-pill ${l.cls}">${l.text}</span>` : '';
  }).join('');

  const dueHtml = card.due
    ? `<span class="card-due ${isOverdue ? 'overdue' : ''}">📅 ${card.due}</span>`
    : '<span></span>';

  el.innerHTML = `
    ${labelsHtml ? `<div class="card-labels">${labelsHtml}</div>` : ''}
    <div class="card-text">${escHtml(card.text)}</div>
    <div class="card-footer">
      ${dueHtml}
      <div class="card-actions">
        <button class="card-action-btn edit-btn" data-card-id="${card.id}" data-col-id="${colId}" title="Edit">✏</button>
        <button class="card-action-btn del-btn" data-card-id="${card.id}" data-col-id="${colId}" title="Delete">🗑</button>
      </div>
    </div>`;

  el.addEventListener('dragstart', () => {
    dragCard = card.id;
    dragSourceCol = colId;
    setTimeout(() => el.classList.add('dragging'), 0);
    const ph = document.createElement('div');
    ph.className = 'drag-placeholder';
    el.parentNode.insertBefore(ph, el.nextSibling);
  });

  el.addEventListener('dragend', () => {
    el.classList.remove('dragging');
    document.querySelector('.drag-placeholder')?.remove();
  });

  return el;
}

function getDragAfterElement(container, y) {
  const els = [...container.querySelectorAll('.card:not(.dragging)')];
  return els.reduce((closest, el) => {
    const box = el.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) return { offset, element: el };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

function attachHandlers() {
  document.querySelectorAll('.col-title').forEach(input => {
    input.addEventListener('change', e => {
      const col = state.columns.find(c => c.id === e.target.dataset.colId);
      if (col) { col.title = e.target.value; saveState(); updateStats(); }
    });
  });

  document.querySelectorAll('.col-menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!confirm('Delete this column and all its cards?')) return;
      state.columns = state.columns.filter(c => c.id !== btn.dataset.colId);
      saveState(); render();
    });
  });

  document.querySelectorAll('.add-card-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const colId = btn.dataset.colId;
      btn.style.display = 'none';
      const form = document.querySelector(`.add-card-form[data-col-id="${colId}"]`);
      form.classList.add('open');
      form.querySelector('textarea').focus();
    });
  });

  document.querySelectorAll('.btn-add-confirm').forEach(btn => {
    btn.addEventListener('click', () => {
      const colId = btn.dataset.colId;
      const form = document.querySelector(`.add-card-form[data-col-id="${colId}"]`);
      const text = form.querySelector('textarea').value.trim();
      if (!text) return;
      const col = state.columns.find(c => c.id === colId);
      col.cards.push({ id: uid(), text, labels: [], due: '' });
      saveState(); render();
    });
  });

  document.querySelectorAll('.btn-add-cancel').forEach(btn => {
    btn.addEventListener('click', () => {
      const colId = btn.dataset.colId;
      const form = document.querySelector(`.add-card-form[data-col-id="${colId}"]`);
      form.classList.remove('open');
      form.querySelector('textarea').value = '';
      document.querySelector(`.add-card-btn[data-col-id="${colId}"]`).style.display = '';
    });
  });

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      openModal(btn.dataset.cardId, btn.dataset.colId);
    });
  });

  document.querySelectorAll('.del-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const col = state.columns.find(c => c.id === btn.dataset.colId);
      col.cards = col.cards.filter(c => c.id !== btn.dataset.cardId);
      saveState(); render();
      showToast('Card deleted');
    });
  });
}

// ── ADD COLUMN ─────────────────────────────────────────
document.getElementById('add-col-btn').addEventListener('click', () => {
  const title = prompt('Column name:');
  if (!title?.trim()) return;
  const color = COL_COLORS[state.columns.length % COL_COLORS.length];
  state.columns.push({ id: uid(), title: title.trim(), color, cards: [] });
  saveState(); render();
});

// ── MODAL ──────────────────────────────────────────────
function buildLabelPicker(selectedLabels) {
  const picker = document.getElementById('label-picker');
  picker.innerHTML = '';
  LABELS.forEach(l => {
    const btn = document.createElement('button');
    btn.className = `label-option label-pill ${l.cls} ${selectedLabels.includes(l.key) ? 'selected' : ''}`;
    btn.textContent = l.text;
    btn.dataset.key = l.key;
    btn.addEventListener('click', () => btn.classList.toggle('selected'));
    picker.appendChild(btn);
  });
}

function openModal(cardId, colId) {
  const col = state.columns.find(c => c.id === colId);
  const card = col.cards.find(c => c.id === cardId);
  editingCard = cardId;
  editingColId = colId;
  document.getElementById('modal-heading').textContent = 'Edit card';
  document.getElementById('modal-text').value = card.text;
  document.getElementById('modal-due').value = card.due || '';
  buildLabelPicker(card.labels || []);
  document.getElementById('modal-overlay').classList.add('open');
  document.getElementById('modal-text').focus();
}

document.getElementById('modal-save').addEventListener('click', () => {
  const text = document.getElementById('modal-text').value.trim();
  if (!text) return;
  const labels = [...document.querySelectorAll('.label-option.selected')].map(b => b.dataset.key);
  const due = document.getElementById('modal-due').value;
  const col = state.columns.find(c => c.id === editingColId);
  const card = col.cards.find(c => c.id === editingCard);
  card.text = text; card.labels = labels; card.due = due;
  document.getElementById('modal-overlay').classList.remove('open');
  saveState(); render();
  showToast('Card saved');
});

document.getElementById('modal-cancel').addEventListener('click', () => {
  document.getElementById('modal-overlay').classList.remove('open');
});

document.getElementById('modal-overlay').addEventListener('click', e => {
  if (e.target === document.getElementById('modal-overlay'))
    document.getElementById('modal-overlay').classList.remove('open');
});

// ── THEME ──────────────────────────────────────────────
const themeBtn = document.getElementById('theme-btn');
themeBtn.addEventListener('click', () => {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : '');
  themeBtn.textContent = isDark ? '☀ Light' : '🌙 Dark';
});

// ── CLEAR ──────────────────────────────────────────────
document.getElementById('clear-btn').addEventListener('click', () => {
  if (!confirm('Reset board to default? This will clear all your changes.')) return;
  localStorage.removeItem('taskflow_v2');
  state = JSON.parse(JSON.stringify(DEFAULT_DATA));
  saveState(); render();
  showToast('Board reset');
});

// ── INIT ───────────────────────────────────────────────
render();
