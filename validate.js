#!/usr/bin/env node

/**
 * Automated Content Guardrails & Integrity Validator
 * Enforces schema compliance, academic & white paper URL validity, placeholder prevention,
 * personal absolute path prevention, isPeerReviewed verification, and vendor-neutral commit messaging.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const DATA_DIR = path.join(ROOT_DIR, 'data');
const EXPECTED_TABS = ['adoption', 'frameworks', 'systems-innovation', 'agentic-organizing', 'ai-governance'];

console.log('🔍 Running Strategic Technology Management & Adaptation Guardrails (Nordic Forest Edition)...\n');

let hasErrors = false;
const globalIds = new Set();

function error(msg) {
  console.error(`❌ [GUARDRAIL ERROR] ${msg}`);
  hasErrors = true;
}

function success(msg) {
  console.log(`✅ ${msg}`);
}

// 1. Prohibited Personal Absolute Paths Guardrail
const PROHIBITED_PATH_PATTERNS = [
  /\/home\/[a-zA-Z0-9_.-]+/i,
  /\/Users\/[a-zA-Z0-9_.-]+/i,
  /[a-zA-Z]:\\[Uu]sers\\[a-zA-Z0-9_.-]+/i,
  /file:\/\/\/(home|Users|[a-zA-Z]:)/i
];

function checkProhibitedPaths(text, context) {
  PROHIBITED_PATH_PATTERNS.forEach(pattern => {
    const match = text.match(pattern);
    if (match) {
      error(`Personal system absolute path detected in ${context}: "${match[0]}". Always use repository references (mgmt-tech-research) or relative paths.`);
    }
  });
}

// 2. Prohibited Corporate & Academic Brands in Commit Messages (Neutrality Guardrail)
const PROHIBITED_COMMIT_ENTITIES = [
  // Tech Corporates
  'Google', 'Microsoft', 'Meta', 'Apple', 'OpenAI', 'DeepMind', 'NVIDIA', 'Amazon', 'AWS', 'Salesforce', 'IBM',
  // Management Consultancies & Advisory
  'McKinsey', 'BCG', 'Bain', 'Gartner', 'Forrester', 'Accenture', 'Deloitte', 'PwC', 'EY', 'KPMG',
  // Universities & Business Schools
  'Harvard', 'Stanford', 'MIT', 'Oxford', 'Cambridge', 'Wharton', 'INSEAD', 'Berkeley', 'Columbia', 'Princeton'
];

function validateCommitMessage(msg) {
  if (!msg) return;
  checkProhibitedPaths(msg, 'commit message');
  const violated = PROHIBITED_COMMIT_ENTITIES.filter(entity => new RegExp(`\\b${entity}\\b`, 'i').test(msg));
  if (violated.length > 0) {
    error(`Commit message contains highlighted corporate/academic entities: [${violated.join(', ')}]. Keep commit messages strictly vendor-neutral.`);
  } else {
    success(`Commit message verified vendor-neutral: "${msg}"`);
  }
}

// Process CLI flag --check-commit "<msg>"
const checkCommitArgIdx = process.argv.indexOf('--check-commit');
if (checkCommitArgIdx !== -1 && process.argv[checkCommitArgIdx + 1]) {
  validateCommitMessage(process.argv[checkCommitArgIdx + 1]);
}

// 3. Validate Core Viewer Files Exist & Are Non-Empty
const requiredViewerFiles = [
  'index.html',
  'css/style.css',
  'js/app.js',
  'serve.js',
  'LICENSE',
  'README.md',
  'GEMINI.md',
  'UPDATE.md',
  'scripts/get_remote_time.js',
  '.agents/skills/updatesite/SKILL.md'
];

// Prohibited Placeholder Tokens
const prohibitedTokens = [
  /\bTODO\b/i,
  /\bFIXME\b/i,
  /\bLOREM IPSUM\b/i,
  /\bUNDEFINED\b/i,
  /\[INSERT/i
];

function checkProhibitedTokens(text, context) {
  if (context.endsWith('.js')) {
    checkProhibitedPaths(text, context);
    return;
  }
  prohibitedTokens.forEach(pattern => {
    if (pattern.test(text)) {
      error(`Prohibited placeholder token matching ${pattern} found in ${context}`);
    }
  });
  checkProhibitedPaths(text, context);
}

requiredViewerFiles.forEach(file => {
  const filePath = path.join(ROOT_DIR, file);
  if (!fs.existsSync(filePath)) {
    error(`Required file missing: ${file}`);
  } else {
    const stat = fs.statSync(filePath);
    if (stat.size === 0) {
      error(`Required file is empty: ${file}`);
    } else {
      try {
        const content = fs.readFileSync(filePath, 'utf-8');
        checkProhibitedTokens(content, file);
        checkProhibitedPaths(content, file);
      } catch (e) {
        error(`Failed to read ${file}: ${e.message}`);
      }
    }
  }
});
success('Core repository files verified.');

// 4. Validate index.html Publish Timestamp
const indexPath = path.join(ROOT_DIR, 'index.html');
if (fs.existsSync(indexPath)) {
  const indexHtml = fs.readFileSync(indexPath, 'utf-8');
  const match = indexHtml.match(/data-publish-utc="(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z)"/);
  if (!match) {
    error('index.html missing valid ISO 8601 UTC timestamp in data-publish-utc attribute.');
  } else {
    success(`index.html publication timestamp validated: ${match[1]}`);
  }
}

// Helper: Validate Topic Relevance Today Block
function validateTopicRelevance(rel, context) {
  if (!rel || typeof rel !== 'object') {
    error(`${context} missing topicRelevance object`);
    return;
  }
  if (!rel.title || typeof rel.title !== 'string') {
    error(`${context} topicRelevance missing valid title`);
  }
  if (!rel.verifiedUtc || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(rel.verifiedUtc)) {
    error(`${context} topicRelevance missing valid ISO 8601 UTC timestamp in verifiedUtc`);
  }
  if (!rel.verifiedDate || !/^\d{4}-\d{2}-\d{2}$/.test(rel.verifiedDate)) {
    error(`${context} topicRelevance missing valid YYYY-MM-DD verifiedDate`);
  }
  if (!rel.timeServer || typeof rel.timeServer !== 'string') {
    error(`${context} topicRelevance missing timeServer reference`);
  }
  const requiredFields = [
    'verdict',
    'worthLookingInto',
    'publishingTrends',
    'topResearchers',
    'futureTrend',
    'researcherRelevance',
    'coreOutcomes'
  ];
  requiredFields.forEach(field => {
    if (!rel[field] || typeof rel[field] !== 'string' || rel[field].trim().length < 15) {
      error(`${context} topicRelevance missing or too short field "${field}"`);
    }
  });
}

// 5. Validate Domain Data Files in data/
let totalRecordCount = 0;

EXPECTED_TABS.forEach(tabId => {
  const fileName = `${tabId}.json`;
  const filePath = path.join(DATA_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    error(`Missing required data file: data/${fileName}`);
    return;
  }

  let data;
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    checkProhibitedTokens(raw, `data/${fileName}`);
    data = JSON.parse(raw);
  } catch (e) {
    error(`Failed to parse JSON in data/${fileName}: ${e.message}`);
    return;
  }

  // Schema checks
  if (data.tabId !== tabId) {
    error(`data/${fileName} has mismatched tabId "${data.tabId}", expected "${tabId}"`);
  }

  if (!data.tabTitle || typeof data.tabTitle !== 'string') {
    error(`data/${fileName} missing valid tabTitle`);
  }

  // Macro Trends Check
  if (!data.macroTrends) {
    error(`data/${fileName} missing macroTrends object`);
  } else {
    const mt = data.macroTrends;
    if (!mt.title || !mt.timeframe || !Array.isArray(mt.points) || mt.points.length === 0) {
      error(`data/${fileName} macroTrends has incomplete structure or empty points`);
    }
    if (!mt.disclaimer || !mt.disclaimer.includes('AI-Generated')) {
      error(`data/${fileName} macroTrends missing required AI disclaimer text`);
    }
  }

  // Topic Relevance Today Check
  validateTopicRelevance(data.topicRelevance, `data/${fileName}`);

  // Item bounds check: minimum 20, maximum 50 records per tab
  const items = data.papers || [];
  if (items.length < 20) {
    error(`data/${fileName} expected at least 20 academic records, found ${items.length}`);
  }
  if (items.length > 50) {
    error(`data/${fileName} exceeds maximum 50 academic records, found ${items.length}`);
  }
  totalRecordCount += items.length;

  items.forEach((item, idx) => {
    const prefix = `data/${fileName} item #${idx + 1} (${item.id || 'unknown'})`;

    if (!item.id || typeof item.id !== 'string') {
      error(`${prefix}: missing valid id`);
    } else {
      if (globalIds.has(item.id)) {
        error(`${prefix}: duplicate id detected "${item.id}" across catalogue`);
      }
      globalIds.add(item.id);
    }

    if (!item.title || item.title.trim().length < 5) {
      error(`${prefix}: title too short or missing`);
    }

    const currentMaxYear = Math.max(2030, new Date().getUTCFullYear() + 1);
    if (typeof item.year !== 'number' || item.year < 1950 || item.year > currentMaxYear) {
      error(`${prefix}: invalid year "${item.year}". Must be between 1950 and ${currentMaxYear}.`);
    }

    if (!Array.isArray(item.tags) || item.tags.length === 0) {
      error(`${prefix}: missing tags array`);
    }

    if (!item.paperUrl || !item.paperUrl.startsWith('https://')) {
      error(`${prefix}: paperUrl must be a secure https:// link, found: "${item.paperUrl}"`);
    }

    if (/arxiv\.org\/abs\/.*(1234|0123|2345|3456|4567|5678|6789|7890|8901|9876|1122)/.test(item.paperUrl)) {
      error(`${prefix}: suspicious placeholder link sequence: "${item.paperUrl}"`);
    }

    if (!item.teaser || item.teaser.trim().length < 10) {
      error(`${prefix}: teaser is too short or missing`);
    }

    if (!item.levelOfAnalysis || typeof item.levelOfAnalysis !== 'string') {
      error(`${prefix}: missing valid levelOfAnalysis`);
    }

    if (!Array.isArray(item.summaryPoints) || item.summaryPoints.length < 3) {
      error(`${prefix}: summaryPoints must contain at least 3 bullet points`);
    }

    // Peer-Reviewed vs Non-Peer-Reviewed Validation
    if (typeof item.isPeerReviewed !== 'boolean') {
      error(`${prefix}: missing boolean property isPeerReviewed`);
    } else if (item.isPeerReviewed === false) {
      if (!item.publicationType || typeof item.publicationType !== 'string' || item.publicationType.trim().length < 3) {
        error(`${prefix}: non-peer-reviewed publication missing valid publicationType (e.g. Industry White Paper, University Report)`);
      }
    }
  });

  const peerReviewedCount = items.filter(p => p.isPeerReviewed === true).length;
  const nonPeerReviewedCount = items.filter(p => p.isPeerReviewed === false).length;
  success(`data/${fileName} passed all validations (${items.length} records: ${peerReviewedCount} peer-reviewed, ${nonPeerReviewedCount} industry/university reports).`);
});

console.log(`\n📊 Total verified catalogue entries across all tabs: ${totalRecordCount}`);

if (totalRecordCount < 100 || totalRecordCount > 250) {
  error(`Expected total catalogue records between 100 and 250, found ${totalRecordCount}`);
}

// 6. Validate Domain-Scoped Research & GenAI Tools (data/research-tools.json)
const toolsFilePath = path.join(DATA_DIR, 'research-tools.json');
if (!fs.existsSync(toolsFilePath)) {
  error('Missing required data file: data/research-tools.json');
} else {
  let toolsData;
  try {
    const rawTools = fs.readFileSync(toolsFilePath, 'utf-8');
    checkProhibitedTokens(rawTools, 'data/research-tools.json');
    toolsData = JSON.parse(rawTools);
  } catch (e) {
    error(`Failed to parse JSON in data/research-tools.json: ${e.message}`);
  }

  if (toolsData) {
    if (toolsData.tabId !== 'research-tools') {
      error(`data/research-tools.json has mismatched tabId "${toolsData.tabId}", expected "research-tools"`);
    }
    if (!toolsData.tabTitle || typeof toolsData.tabTitle !== 'string') {
      error('data/research-tools.json missing valid tabTitle');
    }
    if (!toolsData.macroTrends || !toolsData.macroTrends.title || !Array.isArray(toolsData.macroTrends.points) || toolsData.macroTrends.points.length === 0) {
      error('data/research-tools.json missing complete macroTrends object');
    } else if (!toolsData.macroTrends.disclaimer || !toolsData.macroTrends.disclaimer.includes('AI-Generated')) {
      error('data/research-tools.json macroTrends missing required AI disclaimer text');
    }

    validateTopicRelevance(toolsData.topicRelevance, 'data/research-tools.json');

    const tools = toolsData.tools || [];
    if (tools.length < 15 || tools.length > 50) {
      error(`data/research-tools.json expected between 15 and 50 tools, found ${tools.length}`);
    }

    const allowedTopics = new Set([
      'Technology & AI Adoption',
      'Socio-Technical Frameworks',
      'Systems Design & Innovation',
      'Agentic AI & Multi-Agent Organizing',
      'AI Governance & Assurance'
    ]);

    tools.forEach((tool, idx) => {
      const prefix = `data/research-tools.json item #${idx + 1} (${tool.id || 'unknown'})`;
      if (!tool.id || typeof tool.id !== 'string') {
        error(`${prefix}: missing valid id`);
      } else {
        if (globalIds.has(tool.id)) {
          error(`${prefix}: duplicate id detected "${tool.id}" across catalogue`);
        }
        globalIds.add(tool.id);
      }
      if (!tool.name || tool.name.trim().length < 2) {
        error(`${prefix}: name too short or missing`);
      }
      if (!tool.category || typeof tool.category !== 'string') {
        error(`${prefix}: missing valid category`);
      }
      if (!Array.isArray(tool.topicAlignment) || tool.topicAlignment.length === 0 || tool.topicAlignment.some(t => !allowedTopics.has(t))) {
        error(`${prefix}: topicAlignment must contain valid domain topic names`);
      }
      if (typeof tool.isGenAI !== 'boolean') {
        error(`${prefix}: missing boolean property isGenAI`);
      }
      if (!tool.toolUrl || !tool.toolUrl.startsWith('https://')) {
        error(`${prefix}: toolUrl must be a secure https:// link, found: "${tool.toolUrl}"`);
      }
      if (!Array.isArray(tool.tags) || tool.tags.length === 0) {
        error(`${prefix}: missing tags array`);
      }
      ['whyUsed', 'whereItHelps', 'topicFeatures', 'howResearchersUse'].forEach(field => {
        if (!tool[field] || typeof tool[field] !== 'string' || tool[field].trim().length < 15) {
          error(`${prefix}: missing or too short field "${field}"`);
        }
      });
    });

    const genAiCount = tools.filter(t => t.isGenAI).length;
    success(`data/research-tools.json passed all validations (${tools.length} active tools: ${genAiCount} GenAI research accelerators, ${tools.length - genAiCount} empirical/modeling tools).`);
  }
}

if (hasErrors) {
  console.error('\n❌ Guardrail verification FAILED. Please correct errors before committing.\n');
  process.exit(1);
} else {
  console.log('\n✅ ALL CONTENT & VIEWING GUARDRAILS PASSED SUCCESSFULLY.\n');
  process.exit(0);
}
