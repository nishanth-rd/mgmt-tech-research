# Management & Systems Pulse

> **Academic Minimalist Research Portal & Systems Knowledge Base**  
> High-density curation for researchers, PhD scholars, and technology executives. Zero fluff.

[![Content Guardrails](https://img.shields.io/badge/Guardrails-Passing-34d399?style=flat-square&logo=github)](validate.js)
[![License: MIT & CC-BY-4.0](https://img.shields.io/badge/License-MIT%20%26%20CC--BY--4.0-38bdf8?style=flat-square)](LICENSE)
[![Zero Dependencies](https://img.shields.io/badge/Dependencies-Zero%20(Pure%20Node.js)-818cf8?style=flat-square)](serve.js)

---

## 1. Tracked Academic Domains

This repository provides rigorous, peer-reviewed academic tracking across three interdependent domains:

1. **Technology & AI Adoption in Organizations and Workplaces (`data/adoption.json`)**  
   *Empirical research on workforce productivity, organizational absorptive capacity, human-AI teaming, the automation-augmentation paradox, and algorithmic workplace management.*
2. **Socio-Technical & Diffusion Evaluation Frameworks (`data/frameworks.json`)**  
   *Formal adoption, acceptance, and implementation science frameworks including TAM, TAM2, TAM3, UTAUT, UTAUT2, Rogers' Diffusion of Innovations (DOI), TOE, Socio-Technical Systems (STS) theory, CFIR, RE-AIM, and Institutional Isomorphism.*
3. **Bridging Engineering Systems Design, Management & Innovation (`data/systems-innovation.json`)**  
   *Socio-technical alignment, Conway's Law, product and software modularity (Baldwin & Clark, Ulrich, Ethiraj & Levinthal), dynamic capabilities, architectural innovation, platform governance, and systems engineering trade-offs.*

---

## 2. Architecture & Design Principles

* **Zero External Dependencies:** Built with pure vanilla HTML5, modern CSS3 variables, and standard browser JavaScript. No npm packages or build transpilers required.
* **Decoupled Static Data Engine:** Content is stored in clean JSON files under `data/`, loaded asynchronously on demand to maintain ultra-fast navigation and conserve context tokens.
* **Native Development Server:** A lightweight development server (`serve.js`) implemented exclusively using Node.js built-ins (`http`, `fs`, `path`).
* **Automated Guardrail Verification:** Continuous pre-commit validation (`validate.js`) enforcing schema validity, HTTPS academic links, unique IDs, absence of placeholder tokens, and vendor-neutral commit messaging.
* **Atomic Remote Time Synchronization:** Dedicated synchronization script (`scripts/get_remote_time.js`) retrieving authoritative UTC timestamps from global NTP servers (`time.cloudflare.com`, `time.google.com`, etc.).

---

## 3. Quick Start & Local Review

To preview the portal in your local browser:

```bash
# Start zero-dependency local development server
node serve.js
```

Open your browser to:
```
http://localhost:8000
```

*(You can override the port by passing `PORT=xxxx node serve.js`)*

---

## 4. Running Guardrails & Validation

Run the automated validation suite before any local commit:

```bash
# Validate schemas, URLs, paths, and content rules
node validate.js

# Test vendor-neutral commit hygiene
node validate.js --check-commit "feat(data): update management research catalogue"
```

The validator checks:
* All 3 domain data files exist with between 20 and 50 peer-reviewed records each.
* Every publication entry features an authentic HTTPS URL (DOI, SSRN, NBER, open-access repositories).
* No personal absolute filesystem paths (`/home/`, `/Users/`, `C:\`, etc.) are committed.
* No synthetic placeholder tokens or mock strings exist in content.
* Commit messages strictly adhere to vendor-neutral conventions (forbidding corporate, consultancy, and business school brand names).

---

## 5. Single-Turn Update Protocol

When contributing or updating entries, refer to the operational runbooks:
* **[GEMINI.md](GEMINI.md)**: Repository operational rules and single-turn update procedures.
* **[UPDATE.md](UPDATE.md)**: Detailed step-by-step update runbook and `/updatesite` protocol.

---

## 6. License

* **Code & Infrastructure:** [MIT License](LICENSE)
* **Curated Academic Summaries & Knowledge Base:** [Creative Commons Attribution 4.0 International (CC-BY-4.0)](LICENSE)
