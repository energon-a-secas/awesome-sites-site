import { state } from './state.js';
import { filteredSites } from './data.js';
import { escHtml, domainFromUrl, previewSrc } from './utils.js';

function renderListPills() {
  const row = document.getElementById('listPills');
  if (!row) return;
  const allActive = !state.activeListId;
  let html =
    '<button type="button" class="list-pill' +
    (allActive ? ' active' : '') +
    '" aria-pressed="' +
    (allActive ? 'true' : 'false') +
    '" data-list="">All sites</button>';
  state.lists.forEach((list) => {
    const active = state.activeListId === list.id;
    const count = (list.siteIds || []).length;
    html +=
      '<button type="button" class="list-pill' +
      (active ? ' active' : '') +
      '" aria-pressed="' +
      (active ? 'true' : 'false') +
      '" data-list="' +
      escHtml(list.id) +
      '">' +
      escHtml(list.label) +
      (count ? ' (' + count + ')' : '') +
      '</button>';
  });
  row.innerHTML = html;
}

function renderListHint() {
  const el = document.getElementById('listHint');
  if (!el) return;
  if (!state.activeListId) {
    el.textContent = '';
    el.hidden = true;
    return;
  }
  const list = state.lists.find((l) => l.id === state.activeListId);
  if (!list) {
    el.hidden = true;
    return;
  }
  el.textContent = list.description || '';
  el.hidden = !list.description;
}

function siteRow(site) {
  const domain = domainFromUrl(site.url);
  const preview = previewSrc(site);
  const labels = (site.labels || [])
    .map((l) => '<span class="site-row__tag">' + escHtml(l) + '</span>')
    .join('');
  const hub = site.featuredOnHub ? '<span class="site-row__hub">On hub</span>' : '';

  let previewHtml;
  if (preview) {
    previewHtml =
      '<img src="' +
      escHtml(preview) +
      '" alt="" loading="lazy">' +
      '<div class="preview-fallback" aria-hidden="true">Preview</div>';
  } else {
    previewHtml = '<div class="preview-fallback is-visible" aria-hidden="true">No preview</div>';
  }

  return (
    '<a class="site-row" data-site-id="' +
    escHtml(site.id) +
    '" href="' +
    escHtml(site.url) +
    '" target="_blank" rel="noopener noreferrer">' +
    '<div class="site-row__preview">' +
    previewHtml +
    '</div>' +
    '<div class="site-row__body">' +
    '<div class="site-row__meta">' +
    '<span class="site-row__domain">' +
    escHtml(domain) +
    '</span>' +
    hub +
    '</div>' +
    '<h2 class="site-row__name">' +
    escHtml(site.name) +
    '</h2>' +
    '<p class="site-row__desc">' +
    escHtml(site.description) +
    '</p>' +
    (labels ? '<div class="site-row__tags">' + labels + '</div>' : '') +
    '</div>' +
    '<span class="visually-hidden"> (opens in a new tab)</span>' +
    '</a>'
  );
}

function renderFeed() {
  const feed = document.getElementById('sitesFeed');
  const empty = document.getElementById('emptyState');
  const count = document.getElementById('resultCount');
  if (!feed) return;

  const items = filteredSites();
  if (count) {
    // Every site is on the page at rest, so the count shows only once a list or a search narrows
    // it. At rest the total stays visually hidden, so a screen reader still hears it after Clear.
    const narrowed = Boolean(state.activeListId || state.query.trim());
    count.textContent = items.length ? items.length + (narrowed ? ' shown' : ' sites') : '';
    count.classList.toggle('visually-hidden', !narrowed);
  }

  if (state.loading) {
    feed.innerHTML = '<p class="status-msg">Loading catalog…</p>';
    if (empty) empty.hidden = true;
    return;
  }

  if (state.error) {
    feed.innerHTML =
      '<p class="status-msg status-msg--error">' + escHtml(state.error) + '</p>';
    if (empty) empty.hidden = true;
    return;
  }

  if (!items.length) {
    feed.innerHTML = '';
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;
  feed.innerHTML = items.map(siteRow).join('');
}

export function render() {
  renderListPills();
  renderListHint();
  renderFeed();
}
