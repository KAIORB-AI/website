# Content inventory — verified facts

All verifications performed 2026-08-08 against live public sites. Two registers exist:
**VERIFIED** (source recorded) and **CONCEPTUAL** (vision/metaphor, visibly framed as such).
Anything neither verified nor conceptual is absent from the site.

## Founding companies

| Fact | Register | Source |
|---|---|---|
| Brahmexa LLC — US AI lab making AI "accessible, affordable and practical for small businesses and underserved communities, primarily through agentic automation" | VERIFIED | brahmexa.com |
| Brahmexa platforms: Nexus (AI business brain), ORBIT (intelligent web hosting), REACH (digital marketing studio), ANYO Academy (learning platform), SMB Engine, Brahmando (platform/marketplace) | VERIFIED | brahmexa.com |
| Brahmexa CSR: zero-cost AI guidance and learning support for students and citizens | VERIFIED | brahmexa.com |
| **CSR agents LIVE (5)** — FAFSA Helper "Federal student aid (FAFSA)"; USCIS Companion "N-400 naturalization & work authorization"; SNAP Helper "Food stamps & Medicaid worksheet"; Housing Rights Helper "Eviction defense & tenant rights"; Veterans Benefits Navigator "Find VA benefits & local NGOs". Each at `brahmexa.com/csr-agent.php?slug=<fafsa\|uscis\|snap\|housing-helper\|veterans-navigator>`, all HTTP 200, all embeddable | VERIFIED | brahmexa.com/csr.php |
| **CSR agents marked "Soon" (9)** — Scholarship Scout, Learning Agents, Scam Shield Simulator, Care Connect, Micro-Grant Scout, Invoice & KPI Helper, SMB Ops Companion, Startup Agent Pack, Idea Box (with their stated one-liners) | VERIFIED as *planned* — must stay labelled "Soon" | brahmexa.com/csr.php |
| CSR themes: Education & financial aid · Basic needs & legal · Civic integration · Economic empowerment · Community co-creation | VERIFIED | brahmexa.com/csr.php |
| "Guidance only — verify on official sites before filing" disclaimer; zero cost, no paid tiers or upsells | VERIFIED — **must be carried wherever the agents appear** | brahmexa.com/csr.php |
| Brahmexa: free ORBIT hosting starter analysis, no credentials required | VERIFIED | brahmexa.com |
| Inducer Solutions LLC — Agentic AI, autonomous multi-agent systems, MCP-powered context intelligence, AIOps; Burnaby, BC, Canada | VERIFIED | inducersolutions.com |
| JSI Software Solutions — smart interactive boards, computer labs, AI datacenter services for schools/enterprises; India (Moradabad, Rampur, Manesar) + USA partner office (Renton, WA) | VERIFIED | jsisoftwaresolutions.com |
| JSI products: SWAN™ Interactive Digital Boards, Abhyas A.I Exam Portal, Free School ERP Software, Chat X LLM Chatbot | VERIFIED | jsisoftwaresolutions.com |

## The core

| Fact | Register | Source |
|---|---|---|
| "Brahmando is the Brahmexa platform for AI agents, MCP servers and agentic workflows — available to Brahmexa customers and community partners." | VERIFIED | brahmando.com meta description (fetched with browser UA; site 403s plain fetchers) |

## Network brands

| Fact | Register | Source |
|---|---|---|
| PrimoVive — disposable single-use breathalyzers, 2-minute BAC reading, responsible-drinking positioning; USA | VERIFIED | primovive.com |
| Isha Skin Care & Hair Clinic — dermatology; personalized skincare and hair restoration; India | VERIFIED | skincareisha.com |
| Global & Funsize Productions — event broker & live entertainment production, books shows nationwide (talent, staging, sound, lighting, promotion); USA | VERIFIED | funsizegp.com |
| Easy Q2C — Australia; **no descriptor** (easyq2c.com returned Cloudflare 525 on 2026-08-08; offering unverifiable) | UNVERIFIED → absent | — |
| Brand membership in KAI247 and countries | Owner-provided | Master prompt / repo owner |

## Deliberately conceptual (no factual claim made)

- "Always with you." / Friend · Philosopher · Guide · Warrior — brand poetry
- The universe/orbit metaphor, the Open Orbit seat, "capability rings"
- "The network grows by helping others grow" — vision
- "A single KAI247 channel is being brought into orbit" (/contact) — roadmap framing
- "More stars arriving" (/impact) — roadmap framing
- KAI name associations — presented as feeling, never as dictionary translations (§1 of master prompt)

## Owner-provided commitments (added 2026-08-08)

| Fact | Register | Source |
|---|---|---|
| Brands can join free during the founding period; the network provides hosting and infrastructure; paid plans come later | Owner-provided | Repo owner directive, 2026-08-08 |
| Companies can join as providers, contributing offerings (e.g. AI datacenter, AI offerings for SMBs) in any form (URL, Excel, other); the network follows up | Owner-provided | Repo owner directive, 2026-08-08 |
| Interim application intake address: tech@inducersolutions.com | Owner-adjacent (owner's business address; awaiting explicit confirmation) | See docs/DECISIONS.md #10 |

## Explicitly absent (do not add without verification)

Client counts · revenue · employee numbers · office lists beyond the verified ones ·
certifications · awards · testimonials · case studies · "subsidiary" language ·
any KAI247 contact email or phone number.

## Widget catalog (verified 2026-08-08 against the live platform)

Source: `GET https://brahmexa.com/api/widgets/catalog` (`{"ok":true,"widgets":14}`) and the
catalog page at https://brahmexa.com/widgets/. Names, taglines and **statuses are the
platform's own** — the sales list and the running server read the same `catalog.php`, so what
is shown here cannot drift from what the server will serve.

| Widget | Product | Status |
|---|---|---|
| nexus-chat | NEXUS | **verified** |
| space-proposal | SPACE | working |
| restaurant-reserve | Restaurant | working |
| landscaping-quote | Landscaping | working |
| reach-audit, reach-presence | REACH | partial |
| comet-catalog | COMET | partial |
| orbit-events, orbit-ticket | ORBIT | partial |
| lens-metrics | LENS | partial |
| restaurant-menu | Restaurant | partial |
| hvac-assistant, hvac-service-request | HVAC Support | partial |
| abhyas-practice | Education | partial |

**Never describe a `partial` widget as live.** Only `nexus-chat` is verified; no backing
service has a recorded live check from a third-party origin. Re-check the status badges at
https://brahmexa.com/widgets/ before changing any label on this site.

Constraints carried onto the page because they are product promises, not decoration:
COMET is read-only and hands off to the partner's storefront; the ORBIT ticket widget never
collects a card; a restaurant reservation is a request, not a held table; HVAC declines
safety-critical guidance it cannot source; LENS shows only published findings and computes
nothing; Abhyas keeps answer keys server-side.

Embedding anywhere requires a partner key with that domain on its allowlist — an empty domain
list makes a key inert. **KAI247 has no partner key**, so the page previews widgets rather
than running them.
