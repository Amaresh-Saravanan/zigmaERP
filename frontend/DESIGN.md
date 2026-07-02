---
name: Zigfly ERP
description: An operations platform for tracking materials, processing, and status across manufacturing workflows.
colors:
  primary-green: "#25a96b"
  primary-green-hover: "#1e8f5a"
  primary-green-active: "#197a4c"
  primary-green-text: "#5fd4a0"
  danger-coral: "#f06548"
  neutral-bg-dark: "#0d1117"
  neutral-surface-dark: "#161b22"
  neutral-surface-raised-dark: "#1c2128"
  neutral-border-dark: "#30363d"
  neutral-text-dark: "#c9d1d9"
  neutral-text-emphasis-dark: "#e6edf3"
  neutral-text-muted-dark: "#8b949e"
  neutral-text-subtle-dark: "#6e7681"
  neutral-bg-light: "#ffffff"
  neutral-text-heading-light: "#405189"
  neutral-text-muted-light: "#878a99"
  neutral-text-label-light: "#343a40"
typography:
  body:
    fontFamily: "Poppins, system-ui, 'Segoe UI', Roboto, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 500
    letterSpacing: "0.01em"
  title:
    fontFamily: "Poppins, system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 600
rounded:
  sm: "4px"
  md: "6px"
  lg: "8px"
spacing:
  xs: "5px"
  sm: "8px"
  md: "16px"
  lg: "20px"
components:
  button-primary:
    backgroundColor: "{colors.primary-green}"
    textColor: "#ffffff"
    rounded: "{rounded.md}"
    padding: "8px 20px"
  button-primary-hover:
    backgroundColor: "{colors.primary-green-hover}"
  button-primary-active:
    backgroundColor: "{colors.primary-green-active}"
  input-default:
    backgroundColor: "{colors.neutral-bg-dark}"
    rounded: "{rounded.md}"
    padding: "8px 12px"
---

# Design System: Zigfly ERP

## 1. Overview

**Creative North Star: "The Focused Control Room"**

Zigfly ERP is an operations platform for teams running manufacturing and processing workflows — units, suppliers, screening, egg process, culling, drying, status tracking. The interface exists to give operators, admins, and managers a fast, trustworthy read on where things stand, without demanding they wade through noise to find it. Design decisions optimize for a person mid-task: entering data, checking a status, approving a step, and moving to the next screen.

The visual language borrows the calm, developer-familiar structure of a GitHub-dark workspace — deep charcoal surfaces, restrained borders, quiet neutral text — and marks it as Zigfly's own with a single green (#25a96b) that appears everywhere something is active, successful, or primary. This is not a decorative dark mode; it's a working environment built for long sessions and quick scanning, where the eye should always find state (active menu item, valid field, primary action) through one consistent color signal rather than hunting across a busy palette.

This system explicitly rejects the generic, checkbox-list admin panel: rows of identical gray cards with no hierarchy, dashboards for the sake of having a dashboard, decorative flourishes that don't carry information. Every visual choice earns its place by helping someone finish a task faster or trust the result more.

**Key Characteristics:**
- One accent color (green) carries all "this is active / correct / primary" meaning across menus, buttons, links, and validation
- Dark-first design (GitHub-dark inspired) with a light mode maintained for auth/login screens
- Compact, information-dense typography (0.8–0.95rem) sized for data-heavy screens, not marketing display type
- Subtle, functional elevation — borders and tonal shifts do more work than shadows

## 2. Colors

The palette is a single-accent system: deep neutral surfaces in dark mode, one green that means "primary, active, correct," and one coral-red reserved strictly for errors.

### Primary
- **Zigfly Green** (`#25a96b`): The one accent. Used for the primary button, active sidebar item, active menu underline, valid-field confirmation, and links. Also remapped onto Bootstrap's `success` role so success states and brand identity are visually the same signal.
- **Zigfly Green — Hover** (`#1e8f5a`): Button and interactive hover state.
- **Zigfly Green — Active** (`#197a4c`): Pressed/active state, deepest step in the ramp.
- **Zigfly Green — Text Emphasis** (`#5fd4a0`): Lighter tint used for links and text-on-dark where full-saturation green would be too heavy.

### Neutral (dark mode — default)
- **Void** (`#0d1117`): Page background. The deepest surface.
- **Panel** (`#161b22`): Card, sidebar, and header background — one step up from Void.
- **Raised Panel** (`#1c2128`): Table rows, dropdowns, and elements that sit above Panel.
- **Border** (`#30363d`): All hairline borders and dividers.
- **Body Text** (`#c9d1d9`): Default reading text.
- **Emphasis Text** (`#e6edf3`): Headings and high-attention text.
- **Muted Text** (`#8b949e`): Secondary labels, inactive nav items.
- **Subtle Text** (`#6e7681`): Least prominent text — section titles, footers.

### Neutral (light mode — auth/login only)
- **Paper** (`#ffffff`): Login card background.
- **Heading Blue** (`#405189`): Legacy heading color carried from the reference login design.
- **Muted Gray** (`#878a99`): Secondary text on light surfaces.
- **Label Charcoal** (`#343a40`): Form label color on light surfaces.

### Named Rules
**The One Signal Rule.** Green means active, correct, or primary — nowhere else. If an element isn't one of those three things, it does not get green. This is what keeps a data-dense interface scannable: the eye learns green = "this is the thing to look at."

**The Error Is Coral, Nothing Else Is Rule.** `#f06548` is reserved exclusively for invalid states and destructive actions. Never use it decoratively.

## 3. Typography

**Body Font:** Poppins (with `system-ui, 'Segoe UI', Roboto, sans-serif` fallback)

**Character:** A single geometric sans across every weight. No display/body pairing — the interface doesn't need a voice shift between a hero and a data table; consistency across dense screens matters more than typographic drama.

### Hierarchy
- **Title** (600 weight, 0.95rem): Card headers, section titles inside `.card-header h5`.
- **Body** (400 weight, 0.85rem, 1.5 line-height): Table cells, paragraph text, general UI copy.
- **Label** (500 weight, 0.8rem, 0.01em letter-spacing): Form field labels — consistently sized across every form in the app.
- **Micro-label** (400–600 weight, 0.65–0.72rem): Badges, pills, and status chips where space is tight.

### Named Rules
**The One Family Rule.** Poppins carries every text role. There is no serif or mono counterpoint — this is a working tool, not an editorial surface, and a second family would only add friction to a dense screen.

## 4. Elevation

Zigfly ERP is flat-by-default with tonal layering doing the work shadows would do elsewhere. Depth comes from stepping through the neutral scale (Void → Panel → Raised Panel), not from cast shadows. Shadows appear sparingly, reserved for dropdowns and menus that need to visually separate from the page beneath them.

### Shadow Vocabulary
- **Menu dropdown shadow** (`box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4)`): Used only on the vertical menu's dropdown submenus — content that floats above the page and needs a clear "this is on top" cue.
- **Focus ring** (`box-shadow: 0 0 0 3px rgba(37, 169, 107, 0.25)`): Green-tinted glow on button/input focus and hover — this is the interface's primary feedback mechanism, doing more work than any drop shadow.
- **Error ring** (`box-shadow: 0 0 0 3px rgba(240, 101, 72, 0.15)`): Same mechanism, coral-tinted, for invalid form fields.

### Named Rules
**The Tonal-Not-Cast Rule.** Depth is expressed by moving up the neutral ramp (Void → Panel → Raised Panel), not by adding shadow. Reserve shadows for genuinely floating content (dropdowns, menus).

## 5. Components

### Buttons
- **Shape:** 6px radius (`border-radius: 6px`) — soft enough to feel considered, sharp enough to stay serious.
- **Primary (`.btn-success`):** Zigfly Green background, white text, `8px 20px` padding, `0.85rem` / 500 weight. This is the save/update/confirm action across every form.
- **Hover / Focus:** Background deepens to `#1e8f5a`; a 3px green focus ring (`rgba(37, 169, 107, 0.25)`) appears — the ring is the interface's core "you're about to act here" signal.
- **Active:** Background deepens further to `#197a4c`.
- **Danger (`.btn-danger`):** Same shape and sizing as primary, red semantic — reserved for cancel/delete actions, never for anything else.

### Cards / Containers
- **Corner Style:** Follows Bootstrap defaults, consistent with the button radius family.
- **Background:** Panel (`#161b22`) in dark mode, white in light-mode contexts (login only).
- **Header:** `16px 20px 12px` padding with a `1px` bottom border in Border color; heading is Title-scale text.
- **Body Padding:** Uniform `20px` across all card bodies — this consistency is deliberate (see forms.css comments referencing "U-18").
- **Shadow Strategy:** None at rest; tonal contrast against the page background carries the separation.

### Inputs / Fields
- **Style:** Bootstrap form-control base, Border-color stroke, Panel-tone background in dark mode.
- **Focus:** 3px green glow ring, matching the button focus treatment — one consistent focus language across every interactive element.
- **Valid:** Border shifts to Zigfly Green, no glow, Bootstrap's default checkmark icon suppressed (kept intentionally understated).
- **Invalid:** Border shifts to coral (`#f06548`), 3px coral glow ring.
- **Read-only:** Background dims (`opacity: 0.6`), cursor becomes `not-allowed` — visually distinct from an editable field at a glance.
- **Labels:** `0.8rem`, 500 weight, `0.01em` letter-spacing, Body-text color — identical across every form in the app (deliberate, per the forms.css "consistent style across all forms" comment).

### Navigation
- **Style:** Vertical sidebar, Panel background, Muted-text default state.
- **Active item:** Zigfly Green text on a translucent green background (`rgba(37, 169, 107, 0.14)`) — the same accent that marks buttons and links, reinforcing "green = where you are / what's active."
- **Hover:** Text lifts to Emphasis color, no background shift — a lighter-weight cue than the active state.
- **Dropdown submenus:** Float above the page with the menu dropdown shadow (see Elevation).

## 6. Do's and Don'ts

### Do:
- **Do** use Zigfly Green (`#25a96b`) as the only accent for primary actions, active states, and success — one signal, used consistently.
- **Do** keep depth tonal: step through Void → Panel → Raised Panel rather than reaching for a drop shadow.
- **Do** size UI text for density (0.8–0.95rem) — this is a working tool for long sessions, not a marketing surface.
- **Do** apply the same 3px focus-ring language (green for valid/active, coral for invalid) across every interactive element so feedback stays predictable.
- **Do** keep card header/body padding consistent across every form and list page (16–20px range) — this uniformity is load-bearing for a system with dozens of near-identical CRUD screens.

### Don't:
- **Don't** ship a bland, generic admin panel — every gray card grid without hierarchy is the exact failure mode this system exists to avoid.
- **Don't** introduce a second accent color. If it isn't primary, active, or success, it doesn't get green — and nothing else gets a competing saturated color.
- **Don't** use coral (`#f06548`) for anything but errors and destructive actions.
- **Don't** add decorative shadows or glassmorphism; this system is flat-by-default and tonal.
- **Don't** pair a second type family with Poppins for "hierarchy" — weight and size carry hierarchy here, not a font swap.
- **Don't** clutter dense data screens with information that doesn't help someone finish their task faster or trust the result more.
