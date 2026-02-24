# Gleam 3.0 - Digital Architecture & AI Handoff Context

## 1. Project Overview & Strategic Pivot
We are building "Gleam 3.0," a comprehensive digital architecture that transforms Gleam from a commodity cleaning service into a **Home Asset Management firm**. 
* **The Core Philosophy:** Based on the "1% Rule" (homeowners should spend 1% of home value on maintenance), positioning our services as equity insurance.
* **The Digital Twin:** Every property gets a JSON-based "Digital Twin" profile that drives all pricing, marketing, and operational routing.

## 2. System Topology & Spoke Objectives
The architecture utilizes a Hub-and-Spoke model. Data is captured via peripheral spokes, routed through the Central Hub, and executed via Backend/Operational spokes.

### 🔴 INTAKE SPOKES (Frontend & Conversational)
**Spokes 1A, 1B, 1C: Domain-Specific Estimators (Window & Glass Care, Exterior Surface Washing, Homecare & Maintenance)**
* **Objective:** Low-friction, domain-specific lead capture.
* **Functional:** Lite UIs configured to prioritize the specific service group the user navigated to within the squarespace webpage getgleaming.com. Utilizes proxy questions (not exact counts) to generate estimates.
* **Technical:** Sends data via `sessionStorage` or base64 URL to the Central Booking Hub. No scheduling or API quoting occurs here; purely structural Vanilla JS.

**Spoke 2: Quo (Sona) Voice & SMS Agent**
* **Objective:** Conversational intake, deal closing, and SMS routing.
* **Functional:** Answers questions, aggregates ZIP/Address data, estimates pricing, and executes "deal-closing logic." It weighs the customer's upsell tolerance (tone + 1% home value budget) to pitch congruent services before scheduling.
* **Technical:** Connects to Make.com via OpenAPI. Prompts must include latency-buffering filler (e.g., *"Let me run that address through our quoting engine..."*) to hide the 4-second API audit delay.

**Spoke 3: Tawk.to (Apollo) Webchat Agent**
* **Objective:** Real-time web assistance and objection handling.
* **Functional:** Mirrors Sona's logic via text. Collects property data, runs estimates, schedules $60 onsite assessments for complex properties, and cross-sells services.
* **Technical:** Connects via the same OpenAPI/MCP gateway. Strictly restricted from calculating its own math.

### 🟣 THE CORE HUB (Conversion)
**Hub 1: The Central Booking Hub**
* **Objective:** Maximize ticket size, lock in the booking, and optimize logistics, schedule job.
* **Functional:** Receives Estimator/Agent data, displays the final estimate, and presents congruent add-ons to maximize value. Allows customers to select from dynamically populated, route-optimized scheduling blocks.
* **Technical:** Triggers the final Make.com webhook to create the ServiceM8 `Company`, `CompanyContact` (linked via UUID), and `Job`. Triggers automated confirmation emails and 24-hour pre-arrival texts.

### 🔵 OPERATIONAL & BACKEND SPOKES
**Spoke 4: Operational Dispatch (ServiceM8)**
* **Objective:** Flawless job execution, technician safety, and up-to-date logistics.
* **Functional:** Generates automated job cards containing: required tool checklists, workflow execution steps, safety/SAT risks, weather warnings, and gated community access codes. 
* **Technical:** Make.com synthesizes API data to write detailed `job_description` notes. It cross-correlates data (e.g., *RentCast Year Built + Google Solar UV exposure on East elevation = prompt tech to upsell Solar Screens*).

**Spoke 5: Admin Control Panel**
* **Objective:** Empower management to adjust unit economics dynamically.
* **Functional:** A password-protected GUI on getgleaming.com allowing admin updates to Base Prices, VTMs, and ZIP-code density variables without editing raw code.
* **Technical:** Updates a centralized JSON configuration file or Make.com Data Store queried by the estimators on load.

**Spoke 6: Financial & Subscription (Stripe / Affirm / Gleam-On)**
* **Objective:** Secure recurring revenue and optimize average ticket size.
* **Functional:** Manages the "Maintenance Wallet" (credit banking), processes payments, and injects Affirm financing.
* **Technical:** Strict suppression logic: Affirm is hidden for jobs <$250, custom quotes, or recurring Gleam-On subscription fees.

**Spoke 7: Retention & Marketing Automation**
* **Objective:** Mitigate churn and capitalize on property lifecycles.
* **Functional & Technical:**
  * *Abandoned Cart:* Make.com sequence (Day 1 SMS, Day 3 Email) if a user drops off at the Booking Hub.
  * *MLS Monitoring:* RentCast API trigger that fires a "Listing-Ready Deep Clean" offer if a member's home goes up for sale.
  * *Breakage Logic:* Triggers a "Surprise & Delight" freebie if a member hasn't redeemed a credit in 6 months.

**Spoke 8: Reputation & QC (Post-Job)**
* **Objective:** Mitigate negative experiences and dominate local SEO.
* **Functional & Technical:** Stripe payment links auto-redirect to a custom Google Review page. Make.com monitors the OpenWeather API—if rain hits within 5 days of a completed job, it flags the office to fulfill the "5x5 Spot Free Guarantee."

---

## 3. Repository Structure & Environment
* `/estimator_widget/`: Modular Vanilla JS frontend (`index.html`, `js/state-manager.js`, `js/api-client.js`, `js/ui-components.js`). 
* `/booking_hub_widget/`: Frontend for final booking, upsells, and scheduling UI.
* `/backend_services/`: Node.js prototyping scripts (e.g., `analyzeProperty.js`).
* `.env` and `.gitignore`: Root directory secrets (ignored from commits).

## 3. API & Secrets Management
* **Active APIs in the Stack:**
  * *Google Cloud:* reCAPTCHA v3, Maps Street View, Maps Static (Satellite), Solar API, Elevation API.
  * *AI:* Google Gemini (Vision/Flash) for the Quad-View Audit.
  * *Property Data:* RentCast (Property DNA, Value, AGSF/BGSF).
  * *Operations & Finance:* ServiceM8, Stripe, Affirm.
  * *Marketing Analytics:* Facebook Conversions API (CAPI), GA4 Measurement Protocol.
* **Frontend Webhooks:** The ONLY external connection the frontend makes is via `fetch()` to a Make.com Webhook URL. 
* **Public Keys:** ONLY the Google reCAPTCHA v3 **Site Key**, GTM Container ID, and CMP (Consent) scripts are allowed in frontend code.
* **Private Secrets:** ALL private API keys (RentCast, Google Maps/Solar/Elevation, Gemini, Stripe, ServiceM8, Meta CAPI, Google Ads Developer Token) live securely inside Make.com modules or the local `.env` file. **Never hardcode these into the frontend.**


## 5. Pricing Engine & SKU Logic (DO NOT DEVIATE)
* **Base SKUs Only:** Simplified Base SKUs (e.g., `RES-WIN-EXT`) with Zero-Quantity Upsells injected for on-site toggling.
* **Proxy-Based Character Estimation:** Estimators use a "Glass Character Profile" + SqFt to derive panes. Screens/tracks are derived via operable ratios (e.g., 50% vs 13%). Customers NEVER count exact panes.
* **Logarithmic Guardrails:** For homes > 4,500 sq. ft., a logarithmic decay is applied to prevent "infinite window" hallucinations.
* **The "Remainder Dump" Rule:** Any AI-unverified mathematical panes must default to the cheapest "Standard Pane" category, never "Picture/Large."
* **Bayesian & Asymmetric Tolerance:** The backend uses Bayesian updating to reconcile math vs. vision. RANGE quotes utilize an asymmetric LINEX loss function (undercounting penalizes heavier than overcounting).
* **VTM Logic Rules:** **Safety/Setup (SF) modifiers** (e.g., height) are *multiplicative*. **Execution Time (ET) modifiers** (e.g., soiling) are *additive*.
* **The Exact Cost-Plus Pricing Formula:** 1. `Adjusted_Mins = (Base_Mins * Product(SF_Multipliers)) + Sum(ET_Adders)`
  2. `Labor_Cost = (Adjusted_Mins / 60) * $36.00`
  3. `Total_Unit_Cost = (Labor_Cost + Consumables + Materials + Risk_Adders) * 1.15`
  4. `Line_Item_Price = Total_Unit_Cost / (1 - 0.30)`
* **Hard Financial Guardrails:** Strict **$125.00 Minimum Job Value floor** and a **hard cap of 20% maximum** for combined discounts.
* **CEF Isolation:** Crew Efficiency Factor impacts schedule blocks, NEVER the customer-facing price.

## 6. ServiceM8 API Strict Constraints
1. **Creation Hierarchy:** Execute TWO distinct calls: 1) Create `Company` to get `company_uuid`. 2) Create `CompanyContact` **and pass the `company_uuid` to link them.**
2. **Badge Array Appending:** To add a badge, GET the current array, append the new UUID, and push the full array back to prevent deletion.
3. **Custom Field Budget:** Hard limit of 10 Custom Fields (use for routing/segments only).
4. **The Reporting Taxonomy:** Categories define the *physical service* (e.g., "Window Care"). Market segments (e.g., "Commercial") go in Custom Fields; operational statuses (e.g., "Bundle") go in Badges.

## 7. Hard-Coded Compliance & Safety Gates
Triggers the `ONSITE` escape hatch (price suppressed, $60 site visit required) if:
* **EPA NPDES:** Proximity to storm drains during softwashing.
* **OSHA 1926/1910:** Roof pitches unsafe or structures 4+ stories.
* **NFPA 211 / IRC:** Dryer vent runs > 35 equivalent feet.
* **Electrical Safety:** Unverified GFCI outlets for Holiday Lighting.

## 8. DevSecOps, Marketing Analytics & Scalability Standards & Strict Frontend Code Guardrails
To protect the system, ensure legal compliance, and guarantee mathematically accurate Return on Ad Spend (ROAS) for franchise scaling, the architecture must strictly enforce:
* **Webhook Security (CORS & Headers):** The Make.com webhook must strictly enforce CORS policies, accepting requests ONLY from `getgleaming.com`. A custom validation header must be required to drop unauthorized direct-POST attacks instantly.
* **State Transfer Security:** The frontend must use `sessionStorage` for cross-widget state handoff. NEVER pass personally identifiable information (PII) or property data via Base64 URL parameters.
* **Latency Fallbacks:** Make.com routing must include timeout error handlers. If Gemini Vision takes >8 seconds, Make.com must immediately bypass vision and return the Actuarial Math baseline to prevent frontend UI timeout failures.
* **UTM Persistence:** The Squarespace global header must run a Vanilla JS script to instantly capture URL UTMs and store them in `sessionStorage` or 1st-party cookies, ensuring attribution is not lost if the user navigates across multiple pages before quoting.
* **Dual-Tracking & Deduplication:** Behavioral events (Start Form, View Services) are tracked client-side via Google Tag Manager (GTM). High-value authoritative events (Job Booked, Invoice Paid) are pushed server-side via Make.com using Facebook Conversions API (CAPI) and GA4 Measurement Protocol. Both streams MUST share a unique `event_id` to allow Meta/Google to deduplicate the signals.
* **Google Ads Enhanced Conversions:** For maximum offline attribution, Make.com must hash (SHA-256) the customer's email/phone and push it to the Google Ads API when a job is booked or paid.
* **Local SEO "Dark Traffic" Prevention:** All links originating from the Google Business Profile (GBP) must be hardcoded with strict UTMs (e.g., `utm_campaign=gbp_listing`) to separate local SEO from Direct traffic.
* **Voice Attribution (DNI):** Sona's phone operations must be fronted by a Dynamic Number Insertion (DNI) script via GTM on the website to capture the digital attribution of inbound callers before forwarding to the Sona agent.
* **Privacy Compliance (CPA/Consent Mode):** GTM must be integrated with a Consent Management Platform (CMP). Google Consent Mode v2 must be active to allow AI-modeled conversions if a user denies tracking cookies.
* **Franchise Readiness (Multi-Tenant Routing):** Backend code should not hardcode ServiceM8/Stripe tokens at the root level. Logic must be structured so that ZIP codes can eventually query a mapping database to retrieve territory-specific API credentials and Ad-Account routing parameters.
* **Poka-Yoke Constraints:** Hard-clamp manual inputs in JS (e.g., SqFt clamped between 400 and 15,000). Use visual reference photos instead of subjective text.
* **No Density Proxies in UI:** The frontend MUST NEVER estimate exact window counts via density math. That is strictly reserved for the Make.com AI backend.
* **Server-Side Conversions (CAPI):** To bypass ad-blockers, Make.com acts as the analytics engine, pushing offline conversion events (Booked Job, Job Paid) and final revenue values directly to Facebook CAPI and GA4 via server-side HTTP requests.
* **Franchise Readiness (Multi-Tenant Routing):** Backend code should not hardcode ServiceM8/Stripe tokens at the root level. Logic must be structured so that ZIP codes can eventually query a mapping database to retrieve territory-specific API credentials.

---

## 9. Required LLM Output Protocol: The Change Log
**INSTRUCTIONS FOR AI:** To maintain project continuity, whenever you write or modify code, you MUST conclude your response with a formatted "Change Log Entry" and append it to the history log below. 

Your entry must follow this format:
**📋 CHANGE LOG ENTRY:**
* **Date/Time:** [Current Date]
* **Files Modified:** [List specific paths]
* **What Was Changed:** [1-2 sentences explaining technical change]
* **Why It Was Changed:** [1 sentence explaining architectural goal]
* **Current State/Next Steps:** [1 sentence on what needs to happen next]

---

## 10. Gleam Digital Architecture: Squarespace Site Map

[ROOT: HOME PAGE]
|-- Hero: "Gleam-Gold" Primary CTA (Get Online Estimate)
|-- Trust Bar: LocalBusiness Schema / Compliance Badges (IWCA/PWNA)
|-- Asset Preservation Narrative: "From Cleaning to Structural Preservation"
|
|---- [TIER 1 QUOTING ENGINE: SUB-60 SECOND FLOW]
|     |-- Step 1: Zip Code / Data Binning (SqFt Brackets)
|     |-- Step 2: Instant Ballpark Range (Asynchronous Pricing Logic)
|     |-- Step 3: Tier 2 Detailed/Bind Quote (Contact Capture Lock-in)
|
|---- [RESIDENTIAL SERVICES]
|     |-- Window & Glass Care
|     |   |-- Exterior/Interior Detailing
|     |   |-- Track Detailing & Screen Repair
|     |   |-- Nano-Ceramic Tinting (UV Protection Focus)
|     |-- Exterior Surface Washing
|     |   |-- Softwashing (Roof & Siding Preservation)
|     |   |-- Pressure Washing (Restoration for Decks/Driveways)
|     |-- Home Care & Maintenance
|     |   |-- Gutter Cleaning (Water Diversion)
|     |   |-- Solar Panel Efficiency Restore (ROI-Focused)
|     |   |-- Dryer Vent Fire Prevention (Safety-Critical)
|
|---- [COMMERCIAL SERVICES]
|     |-- Storefront Maintenance Programs
|     |-- Multi-Site Management
|     |-- Reliability & First Impression Branding
|
|---- [GLEAM-ON MEMBERSHIP](To be added at later phase)
|     |-- The "Credit Wallet" Hub
|     |-- Maintenance Ecosystem (Lawn, Snow, Local Partners)
|     |-- Predictable MRR Enrollment
|
|---- [PARTNER PORTALS](To be added at later phase)
|     |-- Realtor Portal (Listing Linda)
|     |   |-- Listing Prep Verification
|     |   |-- Before/After Documentation
|     |-- Commercial Property Manager Hub
|
|---- [REGIONAL LANDING PAGES (SEO CLUSTERS)]
|     |-- Castle Rock, CO
|     |-- Highlands Ranch, CO
|     |-- Tri-Cities, WA
|
|---- [THE GLEAM GUARANTEE]
|     |-- 100% Satisfaction Policy
|     |-- 5x5 Spot-Free Guarantee
|     |-- Price Lock Transparency
|
|---- [ABOUT & SOCIAL MISSION]
      |-- Inclusive Hiring Model
      |-- Community Equity & Career Paths

STRATEGY IMPLEMENTATION

* *STRATEGIC POSITIONING:
   * Pivot from "discretionary luxury" (cleaning) to "essential maintenance" 
     (preservation). Frame UV exposure, wildfire ash, and mineralization as 
     structural threats to home equity.

* *CONVERSION OPTIMIZATION (CRO):
   * Use one color EXCLUSIVELY for conversion buttons.
   * Implement a "Sticky Footer" with a 44x44 pixel "Thumb Zone" CTA for mobile.
   * Utilize "Progressive Disclosure" to prevent cognitive overload.

* *QUOTING LOGIC:
   * Employ "Data Binning" for square footage to minimize user friction.
   * Gate the "Binding Quote" behind contact capture (Psychology of Sunk Cost).

* *RETENTION & LTV:
   * Transition customers to the "Gleam-On" ecosystem using a credit-wallet 
     concept to increase Lifetime Value and brand stickiness.

* *TECHNICAL FORTIFICATION:
   * Implement FAQPage and LocalBusiness Schema to optimize for AEO 
     (AI Answer Engines like Gemini/Perplexity) and the "Zero-Click" era.
   * Hyper-local landing pages to dominate specific regional search volumes.

---

## 11. Change Log History

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/index.html` (formerly `gleam-estimator-v3.39.html`)
* **What Was Changed:** Gutted the 300+ line monolithic JavaScript block containing the math and API logic from the main HTML file. Replaced it with clean `<script>` tags importing the new `state-manager.js`, `api-client.js`, and `ui-components.js` files. Injected the Google reCAPTCHA v3 CDN link into the `<head>`.
* **Why It Was Changed:** To complete Phase 4.5.1 of the architecture plan, enforcing a strict separation of concerns (HTML for structure, JS modules for logic/state/API) and optimizing the codebase to prevent AI token bloat and logic regressions.
* **Current State/Next Steps:** Phase 4.5.1 is complete. The frontend is now modular. The next step is to configure the Make.com webhook URL inside `api-client.js` and test the data payload handoff between the new frontend and the Make.com backend to satisfy Phase 4.1.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/index.html`, `/estimator_widget/js/state-manager.js`, `/estimator_widget/js/api-client.js`, `/estimator_widget/js/ui-components.js`, `/estimator_widget/project-context.md`
* **What Was Changed:** Deconstructed the monolithic `gleam-estimator-v3.39.html` file into a 4-part modular architecture. Extracted state/math to `state-manager.js`, fetch/reCAPTCHA logic to `api-client.js`, and DOM manipulation to `ui-components.js`. Gutted the HTML file to act as a pure structural shell and created an LLM onboarding document.
* **Why It Was Changed:** To fulfill Phase 4.5.1 of the architecture plan, enforcing a strict separation of concerns to prevent UI breakages during future development and optimize the codebase to prevent AI token bloat and memory regressions.
* **Current State/Next Steps:** Phase 4.5.1 is complete and the frontend is fully modularized. The next step is to move to Phase 4.1: Configure the actual Make.com webhook URL inside `api-client.js` and run a live test of the data payload handoff to the backend.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Completely rewrote the AI onboarding context document to encompass the full "Gleam 3.0" Digital Architecture. Added architectural directives for the Dumb Frontend/Genius Backend split, ServiceM8 API constraints (badge appending, 10-field limit), compliance gates (OSHA, EPA, NFPA), Quo/Tawk.to integrations, and the Gleam-On subscription engine.
* **Why It Was Changed:** To prevent future AI instances from writing backend or integration code that violates ServiceM8 database constraints, federal safety compliance, or the core business strategy of protecting proprietary pricing math on the server side.
* **Current State/Next Steps:** The full system context is now documented. The immediate next step is to configure the Make.com webhook URL inside the frontend `api-client.js` and run a live test to verify the payload handoff to the backend matches the required JSON Data Contract.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Updated the context document to include the exact Cost-Plus Pricing sequence (using a 15% indirect overhead allocation and 30% margin division), defined hard financial guardrails ($125 job floor, 20% max discount cap), clarified the additive vs. multiplicative nature of VTMs, and explicitly mandated passing the `company_uuid` when creating a `CompanyContact` via the ServiceM8 API.
* **Why It Was Changed:** To prevent future LLM instances from hallucinating flawed pricing structures, leaking margin by stacking discounts inappropriately, or creating orphaned contact records in the ServiceM8 database.
* **Current State/Next Steps:** Context is fully secured with hard mathematical boundaries and API linkage rules. The next step is to configure the Make.com webhook URL inside `api-client.js` and run a live test of the payload handoff.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Appended advanced statistical and operational guardrails to the context document, including Bayesian Reconciliation and LINEX asymmetric loss functions for quoting, CEF isolation rules, GFCI Electrical Safety constraints for Holiday Lighting, and Six Sigma Poka-Yoke frontend constraints (clamping inputs and banning density proxies).
* **Why It Was Changed:** To ensure the digital architecture prevents margin loss from symmetrical variance, protects conversion rates by eliminating flawed density proxies, and enforces strict electrical compliance and data integrity at the UI level.
* **Current State/Next Steps:** The system context is now exhaustively documented with advanced engineering constraints. The immediate next step is to configure the Make.com webhook URL inside `api-client.js` and implement the newly mandated Poka-Yoke input clamps in the frontend JavaScript.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Added two critical architectural rules to the system context: The Proxy-Based Character Estimation model (explaining how pane counts and screen ratios are derived without user input) and the ServiceM8 Reporting Taxonomy (enforcing the strict separation of Categories for physical services vs. Badges/Custom Fields for market segments and bundles).
* **Why It Was Changed:** To ensure future AI instances do not attempt to add manual pane-counting inputs to the frontend UI, and to prevent backend routing logic from overwriting critical ServiceM8 revenue categories with status labels like "Bundle" or "Rework".
* **Current State/Next Steps:** The core operational and pricing philosophy is fully documented. The next step is to continue validating the RentCast + Gemini Vision prototype script (`analyzeProperty.js`) against historical ground-truth data to refine the AI's window-counting accuracy.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Extracted and formalized the mathematical and API guardrails from the "Master Handoff" script into the core context. Added the Logarithmic Decay rule for homes > 4,500 sq ft, the "Dirt Lot" Metadata Freshness check, the Quad-View Vision architecture, the "Remainder Dump" AI anchoring rule, and the specific Unit-Based Screen formula.
* **Why It Was Changed:** The previous AI's code draft contained highly valuable, specific guardrails that protect the backend from API hallucinations (e.g., quoting a dirt lot, or inventing 40 picture windows). Embedding these in the context document ensures they are strictly enforced when building the Make.com webhooks without relying on a bloated standalone script.
* **Current State/Next Steps:** The backend mathematical tripwires are now locked. The project is fully prepped to execute Phase 4.1: Securing the data handoff between the new modular frontend and the Make.com backend webhook.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Added Section 2 (Repository Structure & Environment) and Section 3 (API & Secrets Management) to explicitly define the GitHub folder structures (`estimator_widget/`, `booking_hub_widget/`, `backend_services/`), enumerate the active APIs in the stack, and enforce strict security rules regarding `.env` / `.gitignore` vs. public frontend files.
* **Why It Was Changed:** To provide the LLM with spatial awareness of the codebase and strictly prevent it from importing server-side modules (like `dotenv`) into Vanilla JS frontend widgets or accidentally hardcoding secret API keys into public-facing web pages.
* **Current State/Next Steps:** The context document is now fully fortified with both business logic and repository security constraints. The next step is to configure the Make.com webhook URL inside `api-client.js` and test the data payload handoff between the frontend and the Make.com backend.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Added Section 9 (Conversational AI & Agentic Interfaces) to integrate the architectural design for Quo (Sona) voice/SMS and Tawk.to (Apollo) webchat agents. Detailed the necessity of an OpenAPI/MCP Server gateway, latency-buffering UX for voice calls, and base prompt constraints for handling safety gates (ONSITE routing).
* **Why It Was Changed:** To expand customer intake across voice, SMS, and chat while strictly maintaining the "Dumb Frontend / Genius Backend" philosophy. The OpenAPI gateway ensures conversational agents execute function calls to Make.com for pricing, preventing AI hallucinations and enforcing the $125 minimum floor, Poka-Yoke constraints, and ONSITE safety routing.
* **Current State/Next Steps:** The multi-channel agent architecture is mapped and the `project-context.md` is complete. The next technical step is to write the `swagger.json` OpenAPI schema that defines the data contract between Sona/Apollo and the Make.com `/estimate` webhook.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Restructured the entire context document around a "Hub and Spoke" topological model. Formally defined the Objective, Functional Requirements, and Technical Requirements for all Intake Spokes (Estimators, Sona, Apollo), the Central Booking Hub, and the Backend Operational Spokes (ServiceM8 Dispatch, Admin Panel, Financial/Subscriptions, Retention Marketing, Reputation/QC).
* **Why It Was Changed:** To provide future AI instances with a holistic, macro-level understanding of how data flows through the entire business lifecycle—from initial lead capture to post-job retention—ensuring that code changes in one spoke do not inadvertently break downstream logic (like route optimization, automated upselling, or credit breakage triggers).
* **Current State/Next Steps:** The master architectural blueprint is fully established. The recommended next step is to return to the `api-client.js` file and wire up the Make.com webhook to execute Phase 4.1.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Added Section 8A (DevSecOps, Analytics & Scalability Standards) and updated Section 3. Introduced strict rules prohibiting Base64 PII transfer, mandating webhook CORS/Header security, enforcing Make.com latency/timeout fallbacks, adding UTM payload tracking, and requiring server-side tracking (CAPI/GA4) for marketing attribution.
* **Why It Was Changed:** To bridge the gap between a startup MVP and an enterprise-grade franchisable architecture. These additions protect against data privacy leaks, DDoS API budget exhaustion, and ad-blocker tracking failures, ensuring marketing ROAS can be accurately calculated as the company scales.
* **Current State/Next Steps:** The architecture is fully audited against enterprise standards. The next step remains executing Phase 4.1: configuring the secure Make.com webhook URL within `api-client.js` and successfully passing a payload that includes reCAPTCHA, property data, and UTM parameters.

**📋 CHANGE LOG ENTRY:**
* **Date/Time:** February 24, 2026
* **Files Modified:** `/estimator_widget/project-context.md`
* **What Was Changed:** Expanded the Analytics and DevSecOps section to encompass a "World-Class" marketing data architecture. Added requirements for UTM persistence via `sessionStorage`, Dual-Tracking Deduplication using shared `event_id`s, Google Ads Enhanced Conversions (SHA-256 hashing via Make.com), Google Business Profile UTM hardcoding, Dynamic Number Insertion (DNI) for Sona voice attribution, and Google Consent Mode v2 compliance.
* **Why It Was Changed:** To bridge the gap between operational job routing and marketing ROI. These additions ensure that as Gleam scales ad spend across Meta, Google Ads, and LSA, the architecture can flawlessly attribute revenue back to the exact campaign, bypassing cookie-blockers without violating the Colorado Privacy Act.
* **Current State/Next Steps:** The system context is now fully fortified with both operational and advanced marketing analytics constraints. The recommended next step is to implement the UTM Persistence script and the Make.com API Client fetch logic on the frontend.