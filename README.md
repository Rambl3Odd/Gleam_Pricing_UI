# Gleam Digital Engine (v3.0) 🚀

Welcome to the central repository for the **Gleam Digital Engine**. This project houses the frontend acquisition widgets and backend Node.js sandbox environments that power Gleam's automated quoting, dispatching, and subscription ecosystem.

This system strictly adheres to a **5-Tier DevSecOps Architecture** utilizing a "Dumb Frontend / Genius Backend" philosophy.

---

## 🛑 ATTENTION ALL DEVELOPERS AND AI AGENTS 🛑

**Do not write a single line of code until you have read the master architectural blueprint.**

Before suggesting structural changes, writing frontend logic, or building API integrations, you MUST ingest and validate your logic against the rules defined in:
👉 `docs/project-context.md`

**Core Mandates:**
1. **Zero Pricing Math in the UI:** The frontend (`/frontend_widgets`) is strictly for state management, API data-passing, and DOM manipulation. All pricing logic, AI vision auditing, and risk assessment occurs in the Make.com backend.
2. **Strict Vanilla JS:** The frontend relies on modular, dependency-free Vanilla JavaScript (`state-manager.js`, `api-client.js`, `ui-components.js`). No React, Vue, or heavy build steps.
3. **DevSecOps Perimeter:** Never commit `.env` files or hardcode API keys. This repository is protected by Gitleaks automated secret scanning.

---

## 📂 Repository Directory Structure

```text
gleam-digital-engine/
├── .github/                   # Automated CI/CD workflows and Gitleaks security scanners
├── docs/                      # Architectural SSOT (Single Source of Truth) and Make.com backups
├── frontend_widgets/          # The Zero-Trust User Interfaces (Layer 1 & Layer 4)
│   ├── estimator_widget/      # Lead capture and proxy-data collection
│   └── booking_hub_widget/    # Stripe checkout and ServiceM8 scheduling hub
└── backend_sandbox/           # The Node.js environment for API prototyping and AI vision scripts
