# Zigfly ERP — Design System

## Brand Identity

| Property | Value |
|----------|-------|
| **Company** | Zigfly (Zigma Global Environ Solutions) |
| **Tagline** | Soldiers for circularity |
| **Industry** | Insect larvae farming / Organic waste management |
| **Design Language** | Dark Glassmorphism |

---

## Color Palette

### Primary Colors

| Token | Name | Hex | RGB | Usage |
|-------|------|-----|-----|-------|
| `--color-primary` | Zigfly Green | `#22c55e` | 34, 197, 94 | Primary actions, active states, accents |
| `--color-primary-dark` | Forest Green | `#16a34a` | 22, 163, 70 | Hover states, darker accents |
| `--color-primary-light` | Light Green | `#4ade80` | 74, 222, 128 | Highlights, badges |

### Background Colors

| Token | Name | Hex/Value | Usage |
|-------|------|-----------|-------|
| `--bg-gradient-start` | Deep Teal | `#0a1f1a` | Main background top |
| `--bg-gradient-end` | Dark Green | `#0d2b23` | Main background bottom |
| `--bg-main` | Background | `linear-gradient(135deg, #0a1f1a 0%, #0d2b23 100%)` | Full page background |
| `--bg-sidebar` | Sidebar | `rgba(10, 31, 26, 0.95)` | Left navigation panel |
| `--bg-card` | Glass Card | `rgba(255, 255, 255, 0.05)` | All card components |
| `--bg-card-hover` | Card Hover | `rgba(255, 255, 255, 0.08)` | Card hover state |
| `--bg-card-active` | Card Active | `rgba(34, 197, 94, 0.1)` | Active/selected cards |

### Text Colors

| Token | Name | Value | Usage |
|-------|------|-------|-------|
| `--text-primary` | Primary Text | `#ffffff` | Headings, numbers, important content |
| `--text-secondary` | Secondary Text | `rgba(255, 255, 255, 0.7)` | Body text, descriptions |
| `--text-muted` | Muted Text | `rgba(255, 255, 255, 0.5)` | Labels, captions |
| `--text-disabled` | Disabled Text | `rgba(255, 255, 255, 0.3)` | Inactive elements |

### Status Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--color-success` | Success Green | `#22c55e` | Positive values, success states |
| `--color-danger` | Danger Red | `#ef4444` | Negative values, errors, alerts |
| `--color-warning` | Warning Yellow | `#eab308` | Warnings, caution states |
| `--color-info` | Info Teal | `#14b8a6` | Information, neutral highlights |

### Chart Colors

| Token | Name | Hex | Usage |
|-------|------|-----|-------|
| `--chart-blue` | Chart Blue | `#3b82f6` | Inward data segments |
| `--chart-green` | Chart Green | `#22c55e` | Organic waste, positive metrics |
| `--chart-yellow` | Chart Yellow | `#eab308` | Inward rejects, warnings |
| `--chart-red` | Chart Red | `#ef4444` | Egg purchasing, alerts |
| `--chart-purple` | Chart Purple | `#a855f7` | Egg hatching segments |
| `--chart-orange` | Chart Orange | `#f97316` | Manure, rejects |
| `--chart-teal` | Chart Teal | `#14b8a6` | Larvae harvested |
| `--chart-gray` | Chart Gray | `#6b7280` | Neutral, unutilized |

---

## Typography

### Font Family

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `--text-display` | 36px | 700 | 1.2 | Hero numbers, large stats |
| `--text-h1` | 28px | 700 | 1.3 | Page titles |
| `--text-h2` | 22px | 600 | 1.35 | Section headings |
| `--text-h3` | 18px | 600 | 1.4 | Card titles |
| `--text-h4` | 16px | 600 | 1.4 | Subsection headings |
| `--text-body` | 14px | 400 | 1.5 | Body text |
| `--text-small` | 12px | 400 | 1.5 | Captions, labels |
| `--text-xs` | 11px | 500 | 1.4 | Micro text, badges |

### Font Weights

| Token | Value | Usage |
|-------|-------|-------|
| `--weight-regular` | 400 | Body text |
| `--weight-medium` | 500 | Labels, emphasis |
| `--weight-semibold` | 600 | Headings |
| `--weight-bold` | 700 | Stats, important numbers |

---

## Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Micro spacing |
| `--space-2` | 8px | Tight spacing |
| `--space-3` | 12px | Small spacing |
| `--space-4` | 16px | Default spacing |
| `--space-5` | 20px | Medium spacing |
| `--space-6` | 24px | Large spacing |
| `--space-8` | 32px | Section spacing |
| `--space-10` | 40px | Page margins |
| `--space-12` | 48px | Large gaps |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 4px | Small elements (badges, tags) |
| `--radius-md` | 8px | Buttons, inputs |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large cards, panels |
| `--radius-2xl` | 20px | Feature cards |
| `--radius-full` | 9999px | Pills, avatars, circles |

---

## Shadows & Effects

### Box Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 2px 4px rgba(0, 0, 0, 0.2)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(0, 0, 0, 0.3)` | Cards |
| `--shadow-lg` | `0 8px 24px rgba(0, 0, 0, 0.4)` | Modals, dropdowns |
| `--shadow-xl` | `0 12px 48px rgba(0, 0, 0, 0.5)` | Floating elements |

### Glassmorphism

| Token | Value |
|-------|-------|
| `--glass-bg` | `rgba(255, 255, 255, 0.05)` |
| `--glass-border` | `1px solid rgba(255, 255, 255, 0.1)` |
| `--glass-blur` | `blur(12px)` |
| `--glass-shadow` | `0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)` |

### Glow Effects

| Token | Value | Usage |
|-------|-------|-------|
| `--glow-green` | `0 0 20px rgba(34, 197, 94, 0.3)` | Active sidebar item |
| `--glow-green-sm` | `0 0 10px rgba(34, 197, 94, 0.2)` | Hover states |
| `--glow-red` | `0 0 10px rgba(239, 68, 68, 0.3)` | Error states |

---

## Component Styles

### Cards

```css
.card {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-xl);
  box-shadow: var(--glass-shadow);
  padding: var(--space-5);
}
```

### Buttons

| Variant | Background | Text | Border | Hover |
|---------|------------|------|--------|-------|
| Primary | `#22c55e` | `#ffffff` | none | `#16a34a` |
| Secondary | `rgba(255,255,255,0.1)` | `#ffffff` | `rgba(255,255,255,0.2)` | `rgba(255,255,255,0.15)` |
| Danger | `#ef4444` | `#ffffff` | none | `#dc2626` |
| Ghost | transparent | `#ffffff` | none | `rgba(255,255,255,0.1)` |

### Sidebar Navigation

```css
.sidebar {
  width: 220px;
  background: var(--bg-sidebar);
  backdrop-filter: var(--glass-blur);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
}

.nav-item {
  color: var(--text-secondary);
  padding: var(--space-3) var(--space-4);
  border-left: 3px solid transparent;
  transition: all 0.2s ease;
}

.nav-item.active {
  color: var(--color-primary);
  background: rgba(34, 197, 94, 0.1);
  border-left-color: var(--color-primary);
}

.nav-item:hover {
  color: var(--text-primary);
  background: rgba(255, 255, 255, 0.05);
}
```

### Stats Cards

```css
.stat-card {
  display: flex;
  align-items: flex-start;
  gap: var(--space-4);
  padding: var(--space-5);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-value {
  font-size: var(--text-h1);
  font-weight: var(--weight-bold);
  color: var(--text-primary);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-small);
  font-weight: var(--weight-medium);
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-change {
  font-size: var(--text-small);
  font-weight: var(--weight-medium);
}

.stat-change.positive { color: var(--color-success); }
.stat-change.negative { color: var(--color-danger); }
```

### Charts

```css
.chart-container {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  border: var(--glass-border);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
}

.chart-bar {
  background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
  border-radius: var(--radius-sm);
}

.chart-axis {
  color: var(--text-muted);
  font-size: var(--text-small);
}
```

---

## Icon System

### Size Scale

| Token | Size | Usage |
|-------|------|-------|
| `--icon-xs` | 16px | Inline icons |
| `--icon-sm` | 20px | Sidebar icons |
| `--icon-md` | 24px | Card icons |
| `--icon-lg` | 32px | Feature icons |
| `--icon-xl` | 48px | Stat icons |

### Icon Container Colors

| Color | Background | Icon |
|-------|------------|------|
| Green | `rgba(34, 197, 94, 0.2)` | `#22c55e` |
| Red | `rgba(239, 68, 68, 0.2)` | `#ef4444` |
| Yellow | `rgba(234, 179, 8, 0.2)` | `#eab308` |
| Teal | `rgba(20, 184, 166, 0.2)` | `#14b8a6` |
| Blue | `rgba(59, 130, 246, 0.2)` | `#3b82f6` |
| Orange | `rgba(249, 115, 22, 0.2)` | `#f97316` |
| Purple | `rgba(168, 85, 247, 0.2)` | `#a855f7` |
| Gray | `rgba(107, 114, 128, 0.2)` | `#6b7280` |

---

## Layout Grid

### Breakpoints

| Token | Value | Target |
|-------|-------|--------|
| `--breakpoint-sm` | 640px | Mobile |
| `--breakpoint-md` | 768px | Tablet |
| `--breakpoint-lg` | 1024px | Laptop |
| `--breakpoint-xl` | 1280px | Desktop |
| `--breakpoint-2xl` | 1536px | Large Desktop |

### Grid

```css
.container {
  max-width: 1440px;
  margin: 0 auto;
  padding: 0 var(--space-6);
}

.grid {
  display: grid;
  gap: var(--space-5);
}

.grid-cols-2 { grid-template-columns: repeat(2, 1fr); }
.grid-cols-3 { grid-template-columns: repeat(3, 1fr); }
.grid-cols-4 { grid-template-columns: repeat(4, 1fr); }
.grid-cols-6 { grid-template-columns: repeat(6, 1fr); }
```

---

## Animations

### Transitions

```css
:root {
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
}
```

### Keyframes

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes slideIn {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}
```

---

## Z-Index Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--z-base` | 0 | Default layer |
| `--z-dropdown` | 100 | Dropdowns, popovers |
| `--z-sticky` | 200 | Sticky headers |
| `--z-modal` | 300 | Modals, dialogs |
| `--z-toast` | 400 | Notifications |
| `--z-tooltip` | 500 | Tooltips |

---

## Accessibility

### Focus States

```css
:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
```

### Contrast Ratios

| Combination | Ratio | WCAG Level |
|-------------|-------|------------|
| White on Dark Green | 12.5:1 | AAA |
| Primary Green on Dark | 7.2:1 | AAA |
| Secondary Text on Dark | 5.8:1 | AA |
| Muted Text on Dark | 3.9:1 | AA Large |

---

## Usage in Stitch

When generating screens for this project, reference this design system:

```
Use the Zigfly dark glassmorphism theme with:
- Background: #0a1f1a to #0d2b23 gradient
- Cards: rgba(255,255,255,0.05) with backdrop blur
- Primary accent: #22c55e
- Typography: Inter font family
- Border radius: 16px for cards
- Glass effect with subtle green glow
```

---

## Stitch Image Generation — Variable Sizing Rules

### Core Principle

Generate images with **DYNAMIC dimensions** based on content complexity, not fixed sizes. Each image must be sized to fit its content naturally.

### Content-Driven Sizing Rules

| Rule | Description |
|------|-------------|
| **Width** | Determined by the widest element (text, icon, or graphic) |
| **Height** | Determined by total content height + padding |
| **Aspect Ratio** | Select based on content orientation, never force predefined ratios |

### Aspect Ratio Guidelines

| Content Type | Recommended Ratio | When to Use |
|--------------|-------------------|-------------|
| Dashboard | 16:9 or wider | Full-page dashboards with multiple columns |
| Mobile App | 9:16 | Tall, narrow mobile interfaces |
| Card/Component | Auto (content-fit) | UI components, widgets |
| Icon | 1:1 | Square icons, avatars |
| Banner | 21:9 or 32:9 | Hero sections, headers |
| Poster | 2:3 or 3:4 | Tall content, reports |
| Landscape Photo | 3:2 or 4:3 | Wide imagery, backgrounds |

### Dimension Constraints

| Constraint | Value | Notes |
|------------|-------|-------|
| Minimum Width | 320px | Mobile compatibility |
| Minimum Height | 200px | Readability |
| Maximum Width | 2560px | 4K compatible |
| Maximum Height | 1440px | Use scrollable overflow if exceeded |
| Internal Padding | 16-32px | Based on content size |
| External Margin | 8-16px | Between elements |

### Content-Type Sizing Strategy

```
IF content is DASHBOARD:
  → Use wide format (16:9 or wider)
  → Minimum 1280px width
  → Height auto based on sections

ELSE IF content is MOBILE_APP:
  → Use tall format (9:16)
  → Maximum 430px width
  → Height auto based on screens

ELSE IF content is CARD or COMPONENT:
  → Use content-fit sizing
  → Width: min-content to max-content
  → Height: auto based on content

ELSE IF content is ICON:
  → Use square format (1:1)
  → Generate at 16px, 24px, 32px, 48px sizes

ELSE IF content is BANNER:
  → Use ultra-wide format (21:9)
  → Minimum 1920px width
  → Height: 200-400px

ELSE:
  → Let content dictate dimensions
  → Maintain visual balance
  → Ensure readability at generated size
```

### Responsive Scaling

| Scale | Usage |
|-------|-------|
| 1x | Standard displays |
| 2x | Retina/HiDPI displays |
| 3x | Ultra-high density displays |

### Sizing Rules for Stitch Generation

```text
DO:
  ✓ Let content dictate final dimensions
  ✓ Maintain visual balance regardless of size
  ✓ Ensure readability at generated size
  ✓ Use responsive scaling (1x, 2x, 3x)
  ✓ Provide dimensions metadata (width x height)

DON'T:
  ✗ Use fixed canvas sizes (e.g., always 1920x1080)
  ✗ Stretch content to fill predetermined dimensions
  ✗ Crop content to fit arbitrary boundaries
  ✗ Force square format on non-square content
  ✗ Ignore content overflow
```

### Output Format

When generating images, provide:

| Field | Description |
|-------|-------------|
| Primary Image | At computed natural dimensions |
| Responsive Variants | 1x, 2x, 3x if applicable |
| Dimensions | Width x Height in pixels |
| Aspect Ratio | Computed ratio (e.g., 16:9) |
| Usage Context | Recommended placement |

### Stitch Prompt Template

Use this prompt structure for variable-size generation:

```text
Generate [CONTENT_TYPE] with DYNAMIC dimensions.

CONTENT: [Describe the content]
STYLE: Zigfly dark glassmorphism theme

SIZING RULES:
- Width: Auto based on widest element
- Height: Auto based on total content
- Aspect ratio: [Specify or "content-driven"]
- Min width: 320px
- Max width: 2560px

THEME:
- Background: #0a1f1a to #0d2b23 gradient
- Cards: rgba(255,255,255,0.05) with backdrop blur
- Primary accent: #22c55e
- Typography: Inter font family

OUTPUT:
- Primary image at natural dimensions
- Dimensions metadata
- Usage recommendation
```
