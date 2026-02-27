The `README.md` is the "lobby" of your repository. Because you have offloaded all the heavy architectural rules, pricing math, and compliance tripwires into `project-context.md`, your `README.md` should be incredibly lean, punchy, and instructional.

Its primary job is to tell a human developer (or an LLM) exactly **what this repository is**, **where things live**, and **what rules to read before touching the code**.

Here is the perfect, enterprise-grade `README.md` template tailored specifically for the **Gleam Digital Engine**. You can copy and paste this directly into your file.

---

```markdown
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

```

---

## 🛠️ Tech Stack & Integrations

* **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6+).
* **Backend Runtime:** Make.com (Production Routing) / Node.js (Sandbox Prototyping).
* **AI & Actuarial Data:** Google Gemini 2.5 Flash, RentCast API, Google Solar/Elevation APIs.
* **CRM & Dispatch:** ServiceM8.
* **Payments:** Stripe (Elements & Billing), Affirm BNPL.
* **Security:** Google reCAPTCHA v3, Gitleaks, Cloudflare WAF.

---

## 💻 Quick Start: Running the Sandbox Locally

If you are developing backend Node.js scripts (like testing the Gemini Vision AI or RentCast API), follow these steps:

1. Clone the repository:
```bash
git clone [https://github.com/Rambl3Odd/gleam-digital-engine.git](https://github.com/Rambl3Odd/gleam-digital-engine.git)

```


2. Navigate to the sandbox:
```bash
cd gleam-digital-engine/backend_sandbox

```


3. Install dependencies (this builds your local `node_modules` folder):
```bash
npm install

```


4. Configure your environment variables:
* Duplicate the `.env.example` file and rename it to `.env`.
* Add your private API keys to the new `.env` file (this file is ignored by Git).


5. Run your test scripts from the `src/` directory:
```bash
node src/analyzeProperty.js

```



---

## 🌿 GitOps Branching Strategy

We enforce strict environment separation via Git branches:

* **`main`**: Production. Code is only merged here via Pull Requests after passing security scans.
* **`develop`**: Sandbox/Staging. All active development, UI testing, and new feature building occurs here.

Always create a feature branch off of `develop` when starting new work!

```

***

### Why this README is optimized:
1. **The "Stop Sign":** It immediately forces any LLM coding agent (like Cursor or Copilot) to go read your `project-context.md` file, which prevents them from hallucinating React code or putting math in your HTML.
2. **Clear Setup Instructions:** If you get a new computer tomorrow, you can follow the "Quick Start" steps to have your Node.js sandbox running in exactly 60 seconds without having to remember the npm commands.
3. **Clean Visual Hierarchy:** It acts as a perfect table of contents for the entire repository.

**Would you like to move on to Phase 4.1 and configure the actual Make.com webhook URL inside your frontend's `api-client.js` file?**

```
