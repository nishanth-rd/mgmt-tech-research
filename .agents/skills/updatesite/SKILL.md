---
name: updatesite
description: >-
  Triggers the on-demand management research site update workflow whenever "/updatesite" is mentioned in chat.
  Reads atomic date and time from remote NTP servers (time.cloudflare.com, time.google.com, time.aws.com, pool.ntp.org),
  validates existing content without unnecessary paraphrasing, incorporates newly recognized top-tier academic papers,
  validates commit messages against company/consultancy/university brand rules, executes guardrails, and commits locally.
  Strictly scoped to the mgmt-tech-research repository; never enabled globally.
---

# Site Update Skill (/updatesite)

Use this procedure whenever the user mentions `/updatesite` in chat while operating in `mgmt-tech-research`. This workflow is time-agnostic and functions on-demand whenever triggered—whether tomorrow, in several weeks, months, or years into the future.

## Execution Protocol

1. **Query Remote Date & Time:**
   ```bash
   node scripts/get_remote_time.js
   ```
   Extract the verified atomic UTC date/time and update `data-publish-utc` in `index.html` as well as `topicRelevance.verifiedUtc` and `verifiedDate` across `data/*.json`.

2. **Integrity Audit (Step 1):**
   Verify the records across `data/adoption.json`, `data/frameworks.json`, `data/systems-innovation.json`, `data/agentic-organizing.json`, `data/ai-governance.json`, and `data/research-tools.json`.

3. **Gap & Sourcing Analysis (Steps 2 & 3):**
   If top scholars recently published a widely recognized breakthrough paper in one of the 3 domains, update or append to the relevant year record. Strictly avoid arbitrary paraphrasing of already valid content.

4. **Verify Commit Hygiene (Zero Corporate/Consulting/Academic Brand Names):**
   ```bash
   node validate.js --check-commit "feat(data): update management research catalogue and synchronize publish timestamp"
   ```

5. **Run Pre-Commit Guardrails:**
   ```bash
   node validate.js
   ```

6. **Commit Locally (Strictly Neutral Commit Message):**
   ```bash
   git add . && git commit -m "feat(data): update management research catalogue and synchronize publish timestamp"
   ```
