// Strategic Technology Management & Adaptation - SPA Engine (Nordic Forest Theme)
let currentTab = 'adoption';
const cache = {};
let currentSearch = '';
let selectedYear = 'all';
let selectedToolFilter = 'all';

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
  'systems-innovation': { file: './data/systems-innovation.json' },
  'agentic-organizing': { file: './data/agentic-organizing.json' },
  'ai-governance': { file: './data/ai-governance.json' },
  'research-tools': { file: './data/research-tools.json' }
};

const TOOL_TOPICS = [
  'Technology & AI Adoption',
  'Socio-Technical Frameworks',
  'Systems Design & Innovation',
  'Agentic AI & Multi-Agent Organizing',
  'AI Governance & Assurance'
];

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

    if (tabId === 'research-tools') {
      selectedToolFilter = 'all';
      renderToolFilterPills();
      renderCurrentTab();
      return;
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

// Render Tool Domain / GenAI Filter Bar
function renderToolFilterPills() {
  if (!yearFilterBar) return;
  const data = cache['research-tools'];
  if (!data) return;

  const tools = data.tools || [];
  const genaiCount = tools.filter(t => t.isGenAI).length;

  let pillsHtml = `
    <button class="year-pill ${selectedToolFilter === 'all' ? 'active' : ''}" data-filter="all" type="button">
      All Tools (${tools.length})
    </button>
    <button class="year-pill ${selectedToolFilter === 'genai' ? 'active' : ''}" data-filter="genai" type="button">
      ✦ GenAI Advantage (${genaiCount})
    </button>
  `;

  TOOL_TOPICS.forEach(topic => {
    const count = tools.filter(t => (t.topicAlignment || []).includes(topic)).length;
    pillsHtml += `
      <button class="year-pill ${selectedToolFilter === topic ? 'active' : ''}" data-filter="${escapeHtml(topic)}" type="button">
        ${escapeHtml(topic)} (${count})
      </button>
    `;
  });

  yearFilterBar.innerHTML = pillsHtml;

  yearFilterBar.querySelectorAll('.year-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      selectedToolFilter = pill.getAttribute('data-filter');
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

  if (currentTab === 'research-tools') {
    renderToolsTab(data);
    return;
  }

  let html = '';
  const items = data.papers || [];
  const availableYears = [...new Set(items.map(p => p.year))].sort((a, b) => b - a);
  const latestYearStr = availableYears.length > 0 ? String(availableYears[0]) : '';

  // 1. Render Hero Insights Grid (Macro Trends + Topic Relevance Today)
  const showMacro = data.macroTrends && (selectedYear === 'all' || selectedYear === latestYearStr) && (!currentSearch || 'macro trends theoretical shifts horizon'.includes(currentSearch));
  const showRel = data.topicRelevance && (selectedYear === 'all' || selectedYear === latestYearStr) && (!currentSearch || 'relevance today publishing trends researchers future outcomes worth'.includes(currentSearch));
  if (showMacro || showRel) {
    html += '<div class="hero-insights-grid">';
    if (showMacro) html += renderMacroTrendsCard(data.macroTrends);
    if (showRel) html += renderRelevanceTodayCard(data.topicRelevance);
    html += '</div>';
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
      <div>
        <div class="macro-trends-header">
          <div class="macro-trends-title">
            <span>⚡</span>
            <span>${escapeHtml(trends.title)}</span>
          </div>
          <span class="macro-trends-timeframe">${escapeHtml(trends.timeframe)}</span>
        </div>
        <p class="macro-trends-teaser">${escapeHtml(trends.points[0])}</p>
      </div>
      <span class="click-hint">Click for full executive & theoretical synthesis &rarr;</span>
    </div>
  `;
}

// Render Topic Relevance Today Card
function renderRelevanceTodayCard(rel) {
  return `
    <div class="relevance-today-card" data-action="topic-relevance">
      <div>
        <div class="macro-trends-header">
          <div class="macro-trends-title">
            <span>🧭</span>
            <span>${escapeHtml(rel.title)}</span>
          </div>
          <span class="relevance-date-pill">Verified ${escapeHtml(rel.verifiedDate)} UTC</span>
        </div>
        <p class="macro-trends-teaser">${escapeHtml(rel.verdict)}</p>
      </div>
      <span class="click-hint">Click for publishing trends, top scholars & outcomes &rarr;</span>
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

// Render Tools Tab
function renderToolsTab(data) {
  let html = '';
  const tools = data.tools || [];

  const showMacro = data.macroTrends && (selectedToolFilter === 'all' || selectedToolFilter === 'genai') && (!currentSearch || 'macro trends hybrid genai toolchain'.includes(currentSearch));
  const showRel = data.topicRelevance && (selectedToolFilter === 'all' || selectedToolFilter === 'genai') && (!currentSearch || 'relevance today publishing trends researchers future outcomes worth'.includes(currentSearch));
  if (showMacro || showRel) {
    html += '<div class="hero-insights-grid">';
    if (showMacro) html += renderMacroTrendsCard(data.macroTrends);
    if (showRel) html += renderRelevanceTodayCard(data.topicRelevance);
    html += '</div>';
  }

  const filteredTools = tools.filter(t => {
    if (selectedToolFilter === 'genai' && !t.isGenAI) return false;
    if (selectedToolFilter !== 'all' && selectedToolFilter !== 'genai' && !(t.topicAlignment || []).includes(selectedToolFilter)) {
      return false;
    }
    if (!currentSearch) return true;
    const haystack = [
      t.name,
      t.category,
      ...(t.topicAlignment || []),
      ...(t.tags || []),
      t.whyUsed,
      t.whereItHelps,
      t.topicFeatures,
      t.howResearchersUse,
      t.isGenAI ? 'genai generative ai' : ''
    ].join(' ').toLowerCase();
    return haystack.includes(currentSearch);
  });

  if (filteredTools.length === 0) {
    html += '<div style="text-align:center; padding: 3rem 1rem; color: #7d968b;">No research tools match your search or filter.</div>';
    contentContainer.innerHTML = html;
    attachCardListeners(data);
    return;
  }

  const sections = [];
  const genaiTools = filteredTools.filter(t => t.isGenAI);
  const nonGenaiTools = filteredTools.filter(t => !t.isGenAI);

  if (genaiTools.length > 0) {
    const genaiHeading = (selectedToolFilter !== 'all' && selectedToolFilter !== 'genai')
      ? `GenAI Research Accelerators for ${selectedToolFilter}`
      : 'GenAI Tools & Research Accelerators (Methodological Advantage)';
    sections.push({ heading: genaiHeading, items: genaiTools });
  }

  if (selectedToolFilter !== 'all' && selectedToolFilter !== 'genai') {
    if (nonGenaiTools.length > 0) {
      sections.push({
        heading: `${selectedToolFilter} — Empirical & Modeling Toolchains`,
        items: nonGenaiTools
      });
    }
  } else {
    TOOL_TOPICS.forEach(topic => {
      const topicTools = nonGenaiTools.filter(t => (t.topicAlignment || [])[0] === topic);
      if (topicTools.length > 0) {
        sections.push({
          heading: `${topic} — Empirical & Modeling Toolchains`,
          items: topicTools
        });
      }
    });
  }

  sections.forEach(sec => {
    html += `
      <section class="year-section">
        <h3 class="year-heading">
          <span>${escapeHtml(sec.heading)}</span>
          <span class="year-count-badge">${sec.items.length}</span>
        </h3>
        <div class="articles-stack">
          ${sec.items.map(tool => renderToolTile(tool)).join('')}
        </div>
      </section>
    `;
  });

  contentContainer.innerHTML = html;
  attachCardListeners(data);
}

// Render Individual Research Tool Tile
function renderToolTile(tool) {
  let badgeHtml = '';
  if (tool.isGenAI) {
    badgeHtml = '<span class="badge-genai">✦ GenAI Advantage</span>';
  } else if (tool.isRecommended) {
    badgeHtml = '<span class="badge-recommended">★ Standard Research Tool</span>';
  }

  const topicPills = (tool.topicAlignment || [])
    .map(topic => `<span class="tag-level">${escapeHtml(topic)}</span>`)
    .join('');

  return `
    <div class="article-tile" data-item-id="${escapeHtml(tool.id)}">
      <div class="article-tile-header">
        <h4 class="article-title">${escapeHtml(tool.name)}</h4>
        ${badgeHtml}
      </div>
      <div class="article-authors">${escapeHtml(tool.category)}</div>
      <p class="article-teaser">${escapeHtml(tool.whyUsed)}</p>
      <p class="tool-preview-line"><strong>Where it helps:</strong> ${escapeHtml(tool.whereItHelps)}</p>
      <div class="article-footer">
        <div class="tags-list">
          ${topicPills}
          ${tool.tags.map(t => `<span class="tag-pill">${escapeHtml(t)}</span>`).join('')}
        </div>
        <a href="${escapeHtml(tool.toolUrl)}" class="tile-link-out" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation();">
          Open Tool Portal &nearr;
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

  const relCard = contentContainer.querySelector('[data-action="topic-relevance"]');
  if (relCard && data.topicRelevance) {
    relCard.addEventListener('click', () => {
      openRelevanceModal(data.topicRelevance);
    });
  }

  const tiles = contentContainer.querySelectorAll('.article-tile');
  tiles.forEach(tile => {
    tile.addEventListener('click', () => {
      const id = tile.getAttribute('data-item-id');
      if (currentTab === 'research-tools') {
        const tool = (data.tools || []).find(t => t.id === id);
        if (tool) openToolModal(tool);
      } else {
        const item = (data.papers || []).find(p => p.id === id);
        if (item) openPaperModal(item);
      }
    });
  });
}

// Open Macro Trends Modal
function openMacroTrendsModal(trends) {
  modalTitle.textContent = trends.title;
  modalMeta.textContent = `Horizon: ${trends.timeframe}`;
  
  modalWarningBox.classList.remove('genai-advantage-box');
  modalWarningBox.style.display = 'block';
  modalWarningBox.textContent = trends.disclaimer;

  modalPointsList.className = 'modal-points-list';
  modalPointsList.innerHTML = trends.points.map(pt => `
    <li class="modal-point-item">${escapeHtml(pt)}</li>
  `).join('');

  modalPaperLink.style.display = 'none';
  modalOverlay.classList.add('active');
}

// Open Topic Relevance Today Modal
function openRelevanceModal(rel) {
  modalTitle.textContent = rel.title;
  modalMeta.textContent = `Verified UTC: ${rel.verifiedUtc} • Time Source: ${rel.timeServer}`;

  modalWarningBox.classList.add('genai-advantage-box');
  modalWarningBox.style.display = 'block';
  modalWarningBox.textContent = `🕒 Time-Server Verified Assessment (${rel.verifiedDate}): ${rel.verdict}`;

  const qaItems = [
    { q: 'Is This Topic Worth Looking Into?', a: rel.worthLookingInto },
    { q: 'What Are the Publishing Trends?', a: rel.publishingTrends },
    { q: 'Who Are the Top / Leading Researchers?', a: rel.topResearchers },
    { q: 'What Is the Future Trend of This Topic?', a: rel.futureTrend },
    { q: 'Does This Topic Remain Relevant for Researchers to Pursue (and Caveats)?', a: rel.researcherRelevance },
    { q: 'What Are the Most Potential / Critical / Core Outcomes?', a: rel.coreOutcomes }
  ];

  modalPointsList.className = 'relevance-qa-list';
  modalPointsList.innerHTML = qaItems.map(item => `
    <li class="relevance-qa-item">
      <div class="relevance-qa-label">${escapeHtml(item.q)}</div>
      <div class="relevance-qa-answer">${escapeHtml(item.a)}</div>
    </li>
  `).join('');

  modalPaperLink.style.display = 'none';
  modalOverlay.classList.add('active');
}

// Open Paper Modal (with Red Warning Box for Non-Peer-Reviewed items)
function openPaperModal(item) {
  modalTitle.textContent = item.title;
  modalMeta.textContent = `${item.year} • ${item.authors || ''} • Level: ${item.levelOfAnalysis || 'General'}`;

  modalWarningBox.classList.remove('genai-advantage-box');
  if (item.isPeerReviewed === false) {
    modalWarningBox.style.display = 'block';
    modalWarningBox.textContent = `⚠️ Non-Peer-Reviewed Material: This publication is a credible ${item.publicationType || 'industry white paper or university research report'}. It has not undergone formal academic peer review.`;
  } else {
    modalWarningBox.style.display = 'none';
  }

  modalPointsList.className = 'modal-points-list';
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

// Open Research Tool Modal
function openToolModal(tool) {
  modalTitle.textContent = tool.name;
  modalMeta.textContent = `${tool.category} • Domains: ${(tool.topicAlignment || []).join(' / ')}`;

  if (tool.isGenAI) {
    modalWarningBox.classList.add('genai-advantage-box');
    modalWarningBox.style.display = 'block';
    modalWarningBox.textContent = '✦ GenAI Research Accelerator: Used by professors, postdocs, and PhD scholars alongside human verification to accelerate synthesis, coding, and empirical modeling.';
  } else {
    modalWarningBox.classList.remove('genai-advantage-box');
    modalWarningBox.style.display = 'none';
  }

  const points = [
    { label: 'Why It Is Used', value: tool.whyUsed },
    { label: 'Where It Helps', value: tool.whereItHelps },
    { label: 'Features Connected to the Topic', value: tool.topicFeatures },
    { label: 'How Researchers Use It', value: tool.howResearchersUse }
  ];

  modalPointsList.className = 'modal-points-list';
  modalPointsList.innerHTML = points.map(pt => `
    <li class="modal-point-item"><strong>${escapeHtml(pt.label)}:</strong> ${escapeHtml(pt.value)}</li>
  `).join('');

  if (tool.toolUrl) {
    modalPaperLink.style.display = 'inline-flex';
    modalPaperLink.href = tool.toolUrl;
    modalPaperLink.textContent = 'Open Official Tool Portal ↗';
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
