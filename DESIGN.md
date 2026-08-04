---
name: Upaznet Config & Command Generator
description: Internal helpdesk tool for generating ZTE OLT and MikroTik config scripts.
colors:
  primary: "#003C71"
  accent: "#00A651"
  accent-hover: "#008C44"
  neutral-bg: "#FBFCFD"
  surface: "#FFFFFF"
  ink: "#1E293B"
  muted: "#64748B"
  border: "#E2E8F0"
  border-strong: "#CBD5E1"
  field-bg: "#F8FAFC"
  rail-bg: "#F1F5F9"
  panel-text: "#DBEAFE"
  panel-border: "#1E3A8A"
  panel-on-navy: "#FFFFFF"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: "1.2"
    letterSpacing: "normal"
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    lineHeight: "1.4"
    letterSpacing: "normal"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "1.5"
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "1.33"
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  mono:
    fontFamily: "Geist Mono, ui-monospace, monospace"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: "1.625"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
  button-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.muted}"
    rounded: "{rounded.md}"
    padding: "8px 16px"
  input-field:
    backgroundColor: "{colors.field-bg}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "10px 10px"
  terminal-panel:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.panel-text}"
    rounded: "{rounded.md}"
---

# Design System: Upaznet Config & Command Generator

## Overview

**Creative North Star: "The Ops Console"**

This is an internal network-operations instrument, not a marketing site. The canvas reads like the traffic-desk at a carrier NOC: a calm, near-white operating field where the technician's job happens, with a dark navy command deck carrying every machine-facing surface — the generated OLT script, the MikroTik secret, and the troubleshooting command hub. Signal green is the only accent, reserved for the moments the desk acts: Generate, Copy, copied-confirmation, the active tab, the C600/C300 mode switch. The aesthetic is disciplined and terminal-like — small uppercase micro-labels, exact monospace readouts, precise rounded panels, nothing decorative.

Form and output stay separated by more than layout: the two script panels share identical navy weight so a technician copying one never fat-fingers the other into the wrong terminal. Depth is expressed through shadowed panels floating off the flat desk, reinforcing "this is where the machine lives." The voice is quiet, exact, and earned — every element either accepts a value, renders a command, or triggers an action. There is no ornament.

**Key Characteristics:**
- Light operating desk (near-white) + dark Terminal Navy command deck.
- Single Signal Green accent for action/active/success moments only.
- Monospace command readouts on navy; proportional type on the light desk.
- Uppercase 12px micro-labels with wide tracking for all form and section labels.
- Shadow carries the command panels and interactive controls; the desk stays flat.
- Precise rounded geometry: 8px inputs, 12px panels/buttons, 16px large surfaces.

## Colors

A two-tone brand palette: Terminal Navy owns command surfaces, Signal Green owns action. The surrounding desk is built from white, slate, and a faint blue-tinted background so the brand colors stay concentrated and purposeful.

### Primary
- **Terminal Navy** (`#003C71`): Command surfaces only — script output panels, the command hub sidebar, the quick-fill modal header, the active config tab, and the page title. Never sits behind an editable input.

### Secondary
- **Signal Green** (`#00A651`): The single action/signal accent — Generate, Copy/Copied, active tabs and the C600/C300 switch, focus rings, success and status icons. Hover lifts to **Pine Green** (`#008C44`).

### Neutral
- **Ops Desk** (`#FBFCFD`): Page background; a cool near-white that gives the navy panels lift.
- **Surface White** (`#FFFFFF`): The form card, modal card, and button faces.
- **Ink** (`#1E293B`, slate-800): Primary text on the light desk.
- **Field Slate** (`#F8FAFC`, slate-50): Input/select fills.
- **Rail Slate** (`#F1F5F9`, slate-100): The tab rail (inactive group surface).
- **Muted** (`#64748B`, slate-500): Secondary text and tab-caption color.
- **Border** (`#E2E8F0`, slate-200): Card and divider lines. **Field Border** (`#CBD5E1`, slate-300): Input/select strokes.
- **Panel Text** (`#DBEAFE`, blue-100): Script and command readouts on navy. **Panel Border** (`#1E3A8A`, blue-900/800): Terminal panel edges and header dividers.

### Named Rules
**The Signal Green Rule.** Signal green is reserved for action, active, and success moments — Generate and Copy actions, the selected config tab, the mode switch, focus rings, and copied feedback. It never floods a surface; on the light desk it appears only where the operator acts or a state goes live.

**The Navy Deck Rule.** Terminal Navy belongs to command surfaces — script output, command hub, modal header. It must never become an input background; every editable field stays on light Slate or White.

## Typography

**Display/Headline Font:** Geist (with Arial, Helvetica, sans-serif fallback)
**Body Font:** Geist (with Arial, Helvetica, sans-serif fallback)
**Label/Mono Font:** Geist Mono (with ui-monospace, monospace fallback)

**Character:** A disciplined technical pairing. Geist Sans carries all UI and headings in clean, confident weights; its companion Geist Mono renders every command so operators read tokens exactly as the terminal will. Uppercase is used as a signal — micro-labels are all-caps and wide-tracked, while operator-entered values stay regular case to keep them visually distinct from read-only meta.

### Hierarchy
- **Display** (700, 24px / `text-2xl`, line-height 1.2): The page title, uppercase Terminal Navy. Appears once, at the top of the desk.
- **Headline** (700, 16px / `text-base`, line-height 1.4): Modal titles, panel section labels.
- **Body** (400, 14px, line-height 1.5): Form content, helper text, placeholders.
- **Label** (600, 12px / `text-xs`, tracking 0.05em, uppercase): Every field label and section title on the desk. The signature voice of the light surface.
- **Mono** (400, 13px, line-height 1.625): Scripts in the output panels and commands in the hub — always on Terminal Navy, rendered in Panel Text blue. Hub command labels step smaller (9–10px, `tracking-widest`).

### Named Rules
**The Uppercase Micro-Label Rule.** Field and section labels are set at 12px, 600 weight, all-caps with wide tracking. All-caps always means "read-only meta"; sentence case is preserved for operator-entered values and placeholders so the machine input stays visually distinct from the label.

**The Mono-Command Rule.** Anything the operator will paste into a terminal — generated scripts and hub commands — is set in monospace on Terminal Navy. If it leaves the tool, it is mono.

## Layout

The tool is a wide desktop operations desk with a `max-width` container of 1400px and an 8-unit (32px) rhythm between major regions. On xl screens the layout is three zones: the main column (config tabs, then a 2-column form + output grid, then the command hub when collapsed) beside a fixed-widthed (`w-80`) command sidebar. The form column and output column sit in a 2-up grid with the form sticky at the top (`top-8`) so it stays reachable while scripts are long.

On smaller screens the three zones stack: config tabs, form, output, then the command hub as a collapsed accordion (hidden until toggled). The 2-up form/output grid collapses to a single column, and the command sidebar folds into the accordion. The desktop's sticky column and fixed sidebar both relax to normal flow. Spacing within a form card uses a tight `space-y-5` (20px) rhythm, and label–input pairs are `space-y-1`.

## Elevation & Depth

The system uses shadowed panel depth to separate the machine from the desk. The light operating field stays flat by default — white and slate surfaces carry no shadow at rest. The Terminal Navy command panels (script output, command hub) float off the desk with `shadow-xl`; the form card lifts with `shadow-lg`; the modal card is the highest with `shadow-2xl`; interactive buttons rest on `shadow-md` and rise slightly on hover (`hover:shadow-lg`). The rule of thumb: **shadow means "this is where the machine lives."** The dark panels get their depth from both shadow and their high-contrast light-to-dark relationship with the desk.

### Named Rules
**The Panel-Float Rule.** The desk is flat at rest. Only command panels and interactive controls carry shadow, so a cast shadow reads as "machine surface," never as decorative layering behind benign content.

## Shapes

Form language is precise and gently round — a full-radius-feeling family that reads technical without being sharp. Fields and inner controls use an 8px (`rounded-lg`) radius; panels and buttons use 12px (`rounded-xl`); large surfaces like the form card and modal card use 16px (`rounded-2xl`). The config-tab rail is a soft 12px pill (`rounded-xl`) holding individually rounded 8px active tabs (`rounded-lg`). Borders are 1px slate strokes (`border-slate-200` cards, `slate-300` fields) that give the light desk presence without weight.

## Components

### Buttons
- **Shape:** 12px radius (`rounded-xl`).
- **Primary (Action):** Signal Green fill, white text, 600-bold, vertical auto-flush padding (`py-3`), centered with a leading icon, `shadow-md`. Hover deepens to Pine Green (`#008C44`) and lifts to `shadow-lg`. This is the Generate and copy-confirmation face.
- **Outline:** White fill, Muted text, 1px slate-300 stroke (`rounded-xl`), used for cancel/dismiss (Batal).
- **Quick-Fill Callout:** A full-width, 2px dashed Signal-Green stroke at 50% on white, green text (Quick Fill dari Detail Koneksi). Signals "import," distinct from block actions.

### Config Tabs
- **Style:** A full-width Rail Slate (`slate-100`) pill rail (`rounded-xl`, `p-1`) with evenly divided buttons.
- **State:** Active tab is Terminal Navy fill, white text, `shadow-md`, `rounded-lg`; inactive tabs are Muted text that warm to Navy on hover and brighten on a white fill. All-caps, `tracking-wider`, 12px.

### Inputs / Fields
- **Style:** Field Slate fill (`slate-50`), 1px Field Border stroke (`slate-300`), 8px radius (`rounded-lg`), Ink text, 2px padding block (`p-2.5`). Monospace face for the SN field to echo its terminal origin.
- **Focus:** 2px Signal Green ring (`focus:ring-2 focus:ring-upaz-green`) and border shift to green.
- **Error (modal only):** Red-600 text on a red-50 fill with a 1px red-200 stroke — confined to the quick-fill validation message.

### Selects
- Same field styling as inputs (Field Slate fill, slate-300 stroke, 8px radius, green focus ring) but with a semibold–bold weight because selects carry service-package and config-choice values in this tool.

### Terminal Panels (Script Output)
- **Corner Style:** 12px (`rounded-xl`), `border` by a Linearized navy (`blue-900/50`), `shadow-xl`.
- **Background:** Terminal Navy with a header divider line (`blue-800`) beneath title and COPY control.
- **Body:** Monospace, 13px, Panel Text blue, `whitespace-pre`, horizontally scrollable. Placeholder state reads "Script [label] akan muncul di sini..." in the same mono voice.

### Command Hub (Sidebar)
- **Background:** Terminal Navy panel (`shadow-xl`), header separated by a `white/10` divider. **Terminal icon** glows Signal Green.
- **Rows:** Each command is a button; a 9px all-caps `tracking-widest` white/60 label (green on hover) over a 10px mono code block on `white/5` (`rounded`, `whitespace-pre-wrap`). Hover raises the block border to `white/20`; on copy the block border turns `upaz-green/50` and a pulsing **COPIED!** confirms. A `C600 / C300/C320` segmented switch in the header uses green for the active mode.

### Quick-Fill Modal
- **Backdrop:** 50% black with `backdrop-blur-sm`, centered.
- **Card:** Surface White, 16px (`rounded-2xl`), `shadow-2xl`, slate-200 border.
- **Header:** Terminal Navy band with white title, muted-white labels, and two underline tabs (2px white underline for active, transparent for inactive).
- **Body:** A monospace textarea on Field Slate (green focus), with validation error states noted under Inputs.
- **Footer:** Field Slate (`slate-50`) bar, right-aligned Outline (Batal) + Primary (Isi Form Otomatis) buttons.

## Do's and Don'ts

### Do:
- **Do** render every script and troubleshooting command in monospace on Terminal Navy — it leaves the operator's hands, so it must read exactly like the terminal.
- **Do** spend Signal Green only on action, active, and success moments (Generate, Copy, copied feedback, selected tab, mode switch, focus).
- **Do** keep the operating desk light: white / Slate-50 surfaces, slate borders, flat at rest.
- **Do** use the uppercase 12px micro-label (tracking-wider) for all field and section labels.
- **Do** keep the two output panels visually identical in weight and shape so dual-copy confusion is impossible.
- **Do** use 8px fields, 12px panels/buttons, 16px large cards for a consistent rounded-technical feel.

### Don't:
- **Don't** give editable inputs a Terminal Navy (or any dark) background; fields stay Slate-50/White.
- **Don't** introduce a third accent hue; Signal Green is the only accent and it stays rare.
- **Don't** set scripts or commands in a proportional font.
- **Don't** uppercase operator-entered values or placeholders — uppercase is reserved for read-only labels.
- **Don't** float flat desk surfaces with shadows; a cast shadow belongs to command panels and interactive controls only.