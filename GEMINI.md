# Repository Runbook & Operational Guidelines

## Overview
This repository hosts the **Management & Systems Pulse** static knowledge portal, an academic research portal tracking **Technology & AI Adoption**, **Socio-Technical & Diffusion Frameworks**, and **Engineering Systems Design & Innovation**.

---

## Architecture & Directory Layout

The application separates the static user interface from content data to optimize update speed and conserve tokens:

* `index.html` - Static application shell, header, domain tabs, search, and modal container.
* `css/style.css` - Visual styling, typography, responsive rules, and theme variables.
* `js/app.js` - Data loader, multi-field search filtering, and modal interaction logic.
* `serve.js` - Zero-dependency local development server (`node serve.js`).
* `validate.js` - Automated schema, content quality, and placeholder guardrail auditor.
* `scripts/get_remote_time.js` - Multi-server atomic NTP & HTTPS remote time synchronizer.
* `UPDATE.md` - Operational runbook for on-demand site updates and `/updatesite` protocol.
* `.agents/skills/updatesite/SKILL.md` - Repository-scoped Antigravity trigger skill for `/updatesite`.
* `data/adoption.json` - Technology & AI Adoption in Organizations and Workplaces.
* `data/frameworks.json` - Socio-Technical & Diffusion Evaluation Frameworks.
* `data/systems-innovation.json` - Bridging Engineering Systems Design, Management & Innovation.
* `.github/workflows/deploy.yml` - Automated GitHub Pages deployment pipeline with CI test gate.

---

## Single-Turn Update Protocol

When requested to add or update research records, execute these steps in a single turn:

### 1. Select Target Data File
* Workplace / AI Adoption / Productivity $\rightarrow$ `data/adoption.json`
* Formal Models / TAM / UTAUT / STS / TOE / CFIR $\rightarrow$ `data/frameworks.json`
* Systems Design / Conway's Law / Modularity / Strategy $\rightarrow$ `data/systems-innovation.json`

### 2. Record Schema
Append the new record using this structure:

```json
{
  "id": "short-slug-id",
  "year": 2026,
  "title": "Clear Academic Title",
  "authors": "Primary Researchers / Institution or Journal",
  "tags": ["Tag1", "Tag2"],
  "paperUrl": "https://doi.org/...",
  "isRecommended": true,
  "isPeerReviewed": true,
  "publicationType": "Peer-Reviewed Article",
  "levelOfAnalysis": "Organization & Firm",
  "teaser": "One sentence academic thesis describing practical and empirical significance.",
  "summaryPoints": [
    "Core Theoretical Model: Theoretical framework and primary mechanisms.",
    "Methodology & Sample: Empirical design, sample size, or formal model.",
    "Empirical Findings: Key quantitative or qualitative discoveries.",
    "Socio-Technical Mechanisms: Interaction between technical systems and social structure.",
    "Executive & Practical Implications: Actionable takeaways for organizational and engineering leaders."
  ]
}
```

### 3. Update Publish Timestamp
Update the `data-publish-utc` attribute and label in `index.html`:
```html
<div class="version-badge" data-publish-utc="YYYY-MM-DDTHH:MM:SSZ">
  Published: YYYY-MM-DDTHH:MM:SSZ
</div>
```

### 4. Verification & Guardrail Audit
Run the automated guardrail validation before staging:
```bash
node validate.js
```
*Never commit if `validate.js` fails.*

### 5. Commit Locally
**Vendor-Neutral Commit Policy:** Strictly forbid highlighting or naming corporate entities, consultancies, or universities in git commit messages.
```bash
node validate.js --check-commit "feat(data): update management research catalogue and synchronize publish timestamp"
git add . && git commit -m "feat(data): update management research catalogue and synchronize publish timestamp"
```

---

## On-Demand Trigger Command: `/updatesite`
When `/updatesite` is mentioned in chat while operating in `mgmt-tech-research`:
1. **Remote Atomic Time:** Run `node scripts/get_remote_time.js` to query atomic NTP/HTTPS servers and update `data-publish-utc` in `index.html`.
2. **Audit Existing Records:** Verify data across all 3 domain collections (`data/*.json`).
3. **Gap & Sourcing Analysis:** Incorporate newly recognized top-tier publications without unnecessary paraphrasing of existing content.
4. **Guardrail Audit:** Execute `node validate.js --check-commit "<msg>"`.
5. **Neutral Commit:** Commit with vendor-neutral description.

---

## Content Integrity & Sourcing Rules
* Always provide direct public HTTPS URLs (such as official DOIs, SSRN, NBER, arXiv, AIS eLibrary, or open access portals).
* All descriptions must be original academic synthesis. Do not reproduce verbatim abstract text.
* Macro trends must highlight broad scholarly movements without promotional bias.
* Commit messages must never highlight corporate or academic institution names. Consult [UPDATE.md](UPDATE.md) for full operational procedures.
