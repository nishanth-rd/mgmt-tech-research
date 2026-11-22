# Strategic Technology Management & Adaptation: On-Demand Update Guide

This runbook documents how to update the **Strategic Technology Management & Adaptation** static knowledge portal.

The update procedure is **on-demand and time-agnostic**. It is designed to be executed as-needed at any point in time—whether tomorrow, after a few weeks, months, or years into the future.

---

## 1. Quick Update via Trigger Command: `/updatesite`

When operating inside `mgmt-tech-research`, mentioning `/updatesite` in chat triggers the automated repository-scoped skill (`.agents/skills/updatesite/SKILL.md`).

This repository-scoped trigger executes the complete update sequence:
1. Queries remote atomic time servers.
2. Audits all existing research entries without unnecessary paraphrasing.
3. Sources any newly recognized top-tier research advancements.
4. Enforces vendor-neutral git commit hygiene.
5. Runs pre-commit guardrails.

---

## 2. Step-by-Step Manual Update Procedure

### Step 1: Remote Time Synchronization
Do not rely on local workstation clocks. Always fetch verified atomic time from authoritative remote servers:
```bash
node scripts/get_remote_time.js
```

The script queries NTP servers via UDP port 123 in priority order:
1. `time.cloudflare.com`
2. `time.google.com`
3. `time.aws.com`
4. `pool.ntp.org`
*(with automated fallback to verified HTTPS date endpoints if NTP is filtered)*.

Update the `data-publish-utc` attribute and label in `index.html`:
```html
<div class="version-badge" data-publish-utc="YYYY-MM-DDTHH:MM:SSZ">
  Published: YYYY-MM-DDTHH:MM:SSZ
</div>
```

---

### Step 2: Content Audit & Integrity Check
Verify that all existing records across the 3 domains remain valid:
* `data/adoption.json` - Technology & AI Adoption in Organizations and Workplaces
* `data/frameworks.json` - Socio-Technical & Diffusion Evaluation Frameworks
* `data/systems-innovation.json` - Bridging Engineering Systems Design, Management & Innovation

Ensure all records adhere to the 5-point structured summary schema:
* *Core Theoretical Model*
* *Methodology & Sample*
* *Empirical Findings*
* *Socio-Technical Mechanisms*
* *Executive & Practical Implications*

---

### Step 3: Gap Analysis & Sourcing New Research (Strictly No Paraphrasing)
* **Strict Rule:** Avoid arbitrary paraphrasing or rewriting of already valid content.
* **When to Update:** Only update an entry if:
  1. A newly recognized breakthrough paper from top scholars has gained widespread acceptance across the community.
  2. A previous entry had outdated preprint or link requiring factual correction to official DOI.
  3. A new calendar year has commenced and new breakthrough milestones need to be indexed.
* All URLs must point to authentic, verified HTTPS sources (DOIs, SSRN, NBER, open access portals).

---

### Step 4: Neutral Git Commit Hygiene
**Strict Policy:** Never highlight or mention corporate entities, consultancies, or universities in git commit messages.

* ❌ **Forbidden:** `feat: add McKinsey AI adoption survey and Harvard socio-technical case studies`
* ❌ **Forbidden:** `fix: update Google Gemini and Microsoft Copilot workplace papers`
* ✅ **Approved:** `feat(data): update workplace AI adoption catalogue and socio-technical frameworks`
* ✅ **Approved:** `fix(sourcing): upgrade formal verification and dynamic capability publications`

Validate your proposed commit message before staging:
```bash
node validate.js --check-commit "feat(data): update workplace AI adoption catalogue and socio-technical frameworks"
```

---

### Step 5: Pre-Commit Validation & Guardrails
Run the automated guardrail suite:
```bash
node validate.js
```
The validator enforces:
* All viewer files exist and are non-empty.
* `index.html` has a valid ISO 8601 UTC timestamp.
* No prohibited placeholder markers or synthetic dummy URLs.
* No personal system absolute paths (requires repository references or relative paths).
* All IDs are unique across the catalogue.
* All URLs use HTTPS.
* Tab record bounds are strictly maintained (min 20, max 50 per tab).
* Commit message neutrality rules.

---

### Step 6: Commit Locally
Once validation passes with zero errors:
```bash
git add .
git commit -m "feat(data): update workplace AI adoption catalogue and socio-technical frameworks"
```
