# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary users are Tier-1 Helpdesk / NOC technicians at UPAZNET: staff who provision and activate new fiber customers and run routine troubleshooting on the live ZTE OLT network. Their job in-situation is fast, error-free generation of device CLI scripts from customer parameters, directly at their traffic-desk workstations. Network Engineers use the tool secondarily, mainly for precision script generation that must match security and the company's VLAN/Bridge topology standards.

## Product Purpose

Upaznet Config & Command Generator is an internal web tool that automates the manual typing of config activation scripts for ZTE OLT devices (C600, C300, C320) and MikroTik PPPoE secrets. It exists to minimize human error in repetitive copy-paste terminal work and to give the helpdesk one-click access to real-time network troubleshooting commands. Success means faster, more consistent activations with fewer fat-finger mistakes.

## Positioning

Unlike keeping a personal scratch-pad of OLT commands, the tool generates vendor-correct, topology-aware scripts from a single structured form, then serves context-aware troubleshooting commands that reuse the values already typed (Interface, ONU ID, SN) so technicians never hand-rewrite error-prone arguments.

## Operating Context

- Internal-only tool; no authentication implemented yet (login/RBAC is a planned future phase). Used by staff, on desktop browsers, on the traffic-desk network.
- Technicians copy generated scripts and paste them directly into an OLT/MikroTik terminal; the dual-output design keeps the ZTE OLT script and the MikroTik script in separate boxes to prevent cross-copy mistakes.
- The Command Hub supplies troubleshooting commands (attenuation check, port status/offline filter, reboot, config delete, SN-based interface tracking) with an OLT-mode switch between C600 (`gpon_onu-`) and C300/C320 (`gpon-onu_`) syntax.
- ACS/TR-069 monitoring credentials are injected at runtime from environment variables, never stored in source.

## Capabilities and Constraints

- **Config types (complete and current):** UNR C600 (with variants), UHO, UBL, UGR, UCD, and UNB (Standard PPPoE and Bridge modes, with VLAN mapping templates for V100, V1600, V1501, V130, DDR).
- **Smart input form:** auto-masking of the OLT interface (space / `.` / `,` converted to `/`, alphabetic input blocked), customer ID auto-synced to the PPPoE username, structured dropdowns for config type and service package.
- **Quick Fill:** a modal that pastes "Detail Koneksi Gpon" or "Detail ONU" text from a managing tool and parses it into the form (customer ID/name, SN, ONU index, OLT interface) so technicians don't retype customer data.
- **Dual-output generator:** separate ZTE OLT script and MikroTik `/ppp secret add` script (with auto comment `ID-NAMA`), one-click copy with visual "COPIED!" feedback.
- **Tech stack constraint (existing implementation):** Next.js/React, Tailwind CSS, Lucide icons; must be a runnable, deployable web app.
- **Security constraint:** ACS username and password must come from env vars (`.env.local` locally / platform env vars in production); must never be hardcoded.
- Web app, desktop-optimized.

## Brand Commitments

- Product name: **Upaznet Config & Command Generator** (Upaznet GPON Config Generator).
- Corporate identity colors, used as fixed brand tokens:
  - `upaz-blue` (`#003C71`) — primary / terminal background.
  - `upaz-green` (`#00A651`) — accent / actions (Generate, copied feedback, success).
- Positioning tone is technical, professional, and internal (built for the UPAZNET helpdesk/NOC team).

## Evidence on Hand

- `PRD.md` — product requirements document (executive summary, personas, features, UI/UX, security, roadmap).
- `README.md` — run project, tech stack, folder structure, feature list.
- `DESIGN.md` — visual system source of truth (North Star "The Ops Console", brand colors, tokens, type ramp, components); paired with `tailwind.config.mjs` color/font tokens.
- Live implementation under `src/` (form, generator, command hub) confirming the config types, brand tokens, env-var ACS injection (`src/lib/generator.js`), and 3-column layout.
- `.env.example` — documents the expected ACS environment variables. No public testimonials, case studies, or customer evidence exist; do not fabricate them.

## Product Principles

- Correctness over speed: a truthful, topology-valid script beats a faster wrong one.
- Reduce cognitive load for desk operators: reuse typed values, mask input, keep outputs separated.
- Preserve the incumbent implementation and brand until the user explicitly changes them.
- Keep internal-operator reality (desktop, internal-only, no auth) the basis for fit.