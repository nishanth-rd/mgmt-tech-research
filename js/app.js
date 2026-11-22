// Strategic Technology Management & Adaptation - SPA Engine (Nordic Forest Theme)
let currentTab = 'adoption';
const cache = {};
let currentSearch = '';
let selectedYear = 'all';

// DOM Elements
const contentContainer = document.getElementById('content-container');
const tabButtons = document.querySelectorAll('.tab-tile');
const searchInput = document.getElementById('search-input');
const yearFilterBar = document.getElementById('year-filter-bar');
const modalOverlay = document.getElementById('modal-overlay');
const modalCloseBtn = document.getElementById('modal-close-btn');
const modalTitle = document.getElementById('modal-title');
const modalMeta = document.getElementById('modal-meta');
const modalWarningBox = document.getElementById('modal-warning-box');
const modalPointsList = document.getElementById('modal-points-list');
const modalPaperLink = document.getElementById('modal-paper-link');

// Tab Configuration Mapping
const TABS = {
  adoption: { file: './data/adoption.json' },
  frameworks: { file: './data/frameworks.json' },
  'systems-innovation': { file: './data/systems-innovation.json' }
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners();
  loadTab(currentTab);
});

function setupEventListeners() {
  // Tab Switching
  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const tabId = btn.getAttribute('data-tab');
      if (tabId === currentTab) return;

      tabButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentTab = tabId;
      currentSearch = '';
      if (searchInput) searchInput.value = '';
      loadTab(currentTab);
    });
  });

  // Search Filter
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      currentSearch = e.target.value.toLowerCase().trim();
      renderCurrentTab();
    });
  }

  // Modal Close Events
  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });
}

// Fetch and Cache Tab Data
async function loadTab(tabId) {
  contentContainer.innerHTML = '<div style="text-align:center; padding: 3rem; color: #7d968b;">Loading research catalogue...</div>';

  try {
    if (!cache[tabId]) {
      const response = await fetch(TABS[tabId].file);
      if (!response.ok) throw new Error(`HTTP error ${response.status}`);
      cache[tabId] = await response.json();
    }
    const items = cache[tabId].papers || [];
    const availableYears = [...new Set(items.map(p => p.year))].sort((a, b) => b - a);
    selectedYear = availableYears.length > 0 ? String(availableYears[0]) : 'all';

    renderYearPills();
    renderCurrentTab();
  } catch (error) {
    console.error('Failed to load tab data:', error);
    contentContainer.innerHTML = `
      <div style="text-align:center; padding: 3rem; color: #f69494; border: 1px solid rgba(224, 102, 102, 0.3); border-radius: 12px; background: rgba(224, 102, 102, 0.08);">
        <p style="font-weight: 600; margin-bottom: 0.5rem;">Failed to load catalogue data.</p>
        <p style="font-size: 0.85rem; color: #b5c7bf;">Please verify data files in <code>./data/</code> or check network status.</p>
      </div>
    `;
  }
}

// Render Year Navigation Filter Bar
function renderYearPills() {
  if (!yearFilterBar) return;
  const data = cache[currentTab];
  if (!data) return;

  const items = data.papers || [];
  const availableYears = [...new Set(items.map(p => p.year))].sort((a, b) => b - a);

  let pillsHtml = `
    <button class="year-pill ${selectedYear === 'all' ? 'active' : ''}" data-year="all" type="button">
      All Years (${items.length})
    </button>
  `;

  availableYears.forEach(year => {
    const count = items.filter(p => p.year === year).length;
    pillsHtml += `
      <button class="year-pill ${selectedYear === String(year) ? 'active' : ''}" data-year="${year}" type="button">
        ${year} (${count})
      </button>
    `;
  });

  yearFilterBar.innerHTML = pillsHtml;

  yearFilterBar.querySelectorAll('.year-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedYear = pill.getAttribute('data-year');
      yearFilterBar.querySelectorAll('.year-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderCurrentTab();
    });
  });
}

// Render Current Tab
function renderCurrentTab() {
  const data = cache[currentTab];
  if (!data) return;

  let html = '';
  const items = data.papers || [];
  const availableYears = [...new Set(items.map(p => p.year))].sort((a, b) => b - a);
  const latestYearStr = availableYears.length > 0 ? String(availableYears[0]) : '';

  // 1. Render Macro Trends Card (shown if 'all' or latest year, and query matches or is empty)
  if (data.macroTrends && (selectedYear === 'all' || selectedYear === latestYearStr) && (!currentSearch || 'macro trends theoretical shifts horizon'.includes(currentSearch))) {
    html += renderMacroTrendsCard(data.macroTrends);
  }

  // 2. Filter and Group Papers
  const filteredPapers = items.filter(p => {
    if (selectedYear !== 'all' && String(p.year) !== selectedYear) {
      return false;
    }
    if (!currentSearch) return true;
    const matchTitle = p.title.toLowerCase().includes(currentSearch);
    const matchTeaser = p.teaser.toLowerCase().includes(currentSearch);
    const matchTags = p.tags.some(t => t.toLowerCase().includes(currentSearch));
    const matchAuthors = p.authors.toLowerCase().includes(currentSearch);
    const matchYear = String(p.year).includes(currentSearch);
    const matchLevel = (p.levelOfAnalysis || '').toLowerCase().includes(currentSearch);
    const matchType = (p.publicationType || '').toLowerCase().includes(currentSearch);
    const matchPoints = (p.summaryPoints || []).some(pt => pt.toLowerCase().includes(currentSearch));
    return matchTitle || matchTeaser || matchTags || matchAuthors || matchYear || matchLevel || matchType || matchPoints;
  });

  if (filteredPapers.length === 0) {
    html += '<div style="text-align:center; padding: 3rem 1rem; color: #7d968b;">No publications match your search or filter.</div>';
    contentContainer.innerHTML = html;
    attachCardListeners(data);
    return;
  }

  const years = [...new Set(filteredPapers.map(p => p.year))].sort((a, b) => b - a);

  years.forEach(year => {
    const yearPapers = filteredPapers.filter(p => p.year === year);
    html += `
      <section class="year-section" id="year-${year}">
        <h3 class="year-heading">
          <span>${year} Research & Industry Milestones</span>
          <span class="year-count-badge">${yearPapers.length}</span>
        </h3>
        <div class="articles-stack">
          ${yearPapers.map(paper => renderArticleTile(paper)).join('')}
        </div>
      </section>
    `;
  });

  contentContainer.innerHTML = html;
  attachCardListeners(data);
}

// Render Macro Trends Card
function renderMacroTrendsCard(trends) {
  return `
    <div class="macro-trends-card" data-action="macro-trends">
      <div class="macro-trends-header">
        <div class="macro-trends-title">
          <span>⚡</span>
          <span>${escapeHtml(trends.title)}</span>
        </div>
        <span class="macro-trends-timeframe">${escapeHtml(trends.timeframe)}</span>
      </div>
      <p class="macro-trends-teaser">${escapeHtml(trends.points[0])}</p>
      <span class="click-hint">Click for full executive & theoretical synthesis &rarr;</span>
    </div>
  `;
}

// Render Article Tile with Red Notice for Non-Peer-Reviewed items
function renderArticleTile(item) {
  let badgeHtml = '';
  if (item.isPeerReviewed === false) {
    badgeHtml = `<span class="badge-not-peer-reviewed">⚠️ Not Peer-Reviewed</span>`;
  } else if (item.isRecommended) {
    badgeHtml = `<span class="badge-recommended">★ Foundational / High-Impact</span>`;
  }

  const noticeHtml = (item.isPeerReviewed === false)
    ? `<div class="article-notice-red">⚠️ Not Peer-Reviewed: ${escapeHtml(item.publicationType || 'Industry/University Report')}</div>`
    : '';

  const levelHtml = item.levelOfAnalysis
    ? `<span class="tag-level">${escapeHtml(item.levelOfAnalysis)}</span>`
    : '';

  return `
    <div class="article-tile" data-item-id="${escapeHtml(item.id)}">
      <div class="article-tile-header">
        <h4 class="article-title">${escapeHtml(item.title)}</h4>
        ${badgeHtml}
      </div>
      <div class="article-authors">${escapeHtml(item.authors || '')}</div>
      ${noticeHtml}
      <p class="article-teaser">${escapeHtml(item.teaser)}</p>
      <div class="article-footer">
        <div class="tags-list">
          ${levelHtml}
          ${item.tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}
        </div>
        <a href="${escapeHtml(item.paperUrl)}" class="tile-link-out" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">
          View Publication / Document &nearr;
        </a>
      </div>
    </div>
  `;
}

// Attach Event Listeners
function attachCardListeners(data) {
  const macroCard = contentContainer.querySelector('[data-action="macro-trends"]');
  if (macroCard && data.macroTrends) {
    macroCard.addEventListener('click', () => {
      openMacroTrendsModal(data.macroTrends);
    });
  }

  const tiles = contentContainer.querySelectorAll('.article-tile');
  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const id = tile.getAttribute('data-item-id');
      const item = (data.papers || []).find(p => p.id === id);
      if (item) openPaperModal(item);
    });
  });
}

// Open Macro Trends Modal
function openMacroTrendsModal(trends) {
  modalTitle.textContent = trends.title;
  modalMeta.textContent = `Horizon: ${trends.timeframe}`;
  
  modalWarningBox.style.display = 'block';
  modalWarningBox.textContent = trends.disclaimer;

  modalPointsList.innerHTML = trends.points.map(pt => `
    <li class="modal-point-item">${escapeHtml(pt)}</li>
  `).join('');

  modalPaperLink.style.display = 'none';
  modalOverlay.classList.add('active');
}

// Open Paper Modal (with Red Warning Box for Non-Peer-Reviewed items)
function openPaperModal(item) {
  modalTitle.textContent = item.title;
  modalMeta.textContent = `${item.year} • ${item.authors || ''} • Level: ${item.levelOfAnalysis || 'General'}`;

  if (item.isPeerReviewed === false) {
    modalWarningBox.style.display = 'block';
    modalWarningBox.textContent = `⚠️ Non-Peer-Reviewed Material: This publication is a credible ${item.publicationType || 'industry white paper or university research report'}. It has not undergone formal academic peer review.`;
  } else {
    modalWarningBox.style.display = 'none';
  }

  modalPointsList.innerHTML = item.summaryPoints.map(pt => {
    const parts = pt.split(': ');
    if (parts.length > 1) {
      return `<li class="modal-point-item"><strong>${escapeHtml(parts[0])}:</strong> ${escapeHtml(parts.slice(1).join(': '))}</li>`;
    }
    return `<li class="modal-point-item">${escapeHtml(pt)}</li>`;
  }).join('');

  if (item.paperUrl) {
    modalPaperLink.style.display = 'inline-flex';
    modalPaperLink.href = item.paperUrl;
    modalPaperLink.textContent = 'Read Original Publication / Document ↗';
  } else {
    modalPaperLink.style.display = 'none';
  }

  modalOverlay.classList.add('active');
}

// Close Modal
function closeModal() {
  modalOverlay.classList.remove('active');
}

// Utility: Escape HTML
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
