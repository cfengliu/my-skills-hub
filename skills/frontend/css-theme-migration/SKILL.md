---
name: css-theme-migration
description: Convert dark-mode-only CSS or UI code into a maintainable light/dark theme-token system. Use when asked to turn dark mode into light mode, migrate hardcoded colors, add light mode, refactor CSS variables, fix theme contrast, or implement theme support in CSS, Tailwind, React, Next.js, Vue, or component styles.
---

# CSS Theme Migration Skill

## Goal

Migrate a dark-mode-only UI into a semantic theme-token system where light mode is the default and dark mode is preserved.

The goal is not to blindly invert colors. The goal is to preserve visual hierarchy, readability, brand accents, interaction states, and component intent while making the theme easy to maintain.

## When to use this skill

Use this skill when the user asks for any of these tasks:

- Convert dark mode CSS to light mode.
- Add light mode to an app that only has dark styling.
- Refactor hardcoded colors into CSS variables or design tokens.
- Create or fix a light/dark theme system.
- Convert Tailwind `dark:` usage into semantic tokens.
- Improve contrast or readability after a dark-to-light migration.
- Standardize theme colors across CSS, Sass, CSS Modules, styled-components, Tailwind, React, Next.js, Vue, or component libraries.

Do not use this skill for unrelated layout, animation, copywriting, or full visual redesign unless the user explicitly asks for those changes.

## Core principles

1. Do not simply invert colors.
2. Preserve layout, spacing, typography, component structure, animations, and class names unless a change is required for theme support.
3. Treat color as semantic meaning, not decoration.
4. Light mode should be the default theme unless the project already uses another default intentionally.
5. Preserve the existing dark theme as `[data-theme="dark"]`, `.dark`, or the project’s existing dark selector.
6. Prefer CSS custom properties for cross-framework maintainability.
7. Do not remove brand colors; map them to accent tokens.
8. Check contrast for text, borders, disabled states, and interactive states.
9. Make changes small, reviewable, and easy to diff.
10. Never modify business logic while doing theme migration.

## First inspection

Before editing, inspect the project and identify:

- Styling system: plain CSS, SCSS/Sass, CSS Modules, Tailwind, styled-components, Emotion, Stitches, vanilla-extract, shadcn/ui, MUI, Chakra, Ant Design, etc.
- Theme mechanism: `data-theme`, `.dark`, `prefers-color-scheme`, `next-themes`, Tailwind `darkMode`, CSS variables, or none.
- Global style entry points: `globals.css`, `index.css`, `app.css`, `theme.css`, `tailwind.config.*`, design token files.
- Hardcoded colors: hex, rgb/rgba, hsl/hsla, oklch, named colors, Tailwind utility colors.
- Existing brand colors and semantic state colors: primary, success, warning, danger, info.
- Components that rely heavily on dark surfaces: cards, sidebars, modals, navbars, inputs, tables, charts.

If scripts are available, run `scripts/extract-colors.mjs` to build a color inventory before editing.

## Color role classification

Classify each color by role before replacing it.

| Role | Meaning | Example tokens |
|---|---|---|
| Page background | App/body/root background | `--color-bg` |
| Surface | Cards, panels, containers | `--color-surface` |
| Elevated surface | Modals, popovers, dropdowns | `--color-surface-elevated` |
| Subtle surface | Secondary blocks, table headers | `--color-surface-muted` |
| Primary text | Main readable text | `--color-text` |
| Secondary text | Metadata, helper text | `--color-text-muted` |
| Disabled text | Disabled labels or placeholders | `--color-text-disabled` |
| Border | Dividers, input borders, card outlines | `--color-border` |
| Strong border | Focus rings, active outlines | `--color-border-strong` |
| Accent | Brand/action color | `--color-accent` |
| Accent foreground | Text/icon on accent background | `--color-accent-foreground` |
| Hover | Hover background/state | `--color-hover` |
| Active | Selected/current state | `--color-active` |
| Focus | Focus ring | `--color-focus-ring` |
| Overlay | Modal backdrop/scrim | `--color-overlay` |
| Shadow | Box shadow color | `--shadow-color` |
| Success | Positive state | `--color-success` |
| Warning | Warning state | `--color-warning` |
| Danger | Error/destructive state | `--color-danger` |
| Info | Informational state | `--color-info` |

## Default token set

Prefer this baseline unless the project already has a token system.

```css
:root {
  color-scheme: light;

  --color-bg: #ffffff;
  --color-surface: #f8fafc;
  --color-surface-elevated: #ffffff;
  --color-surface-muted: #f1f5f9;

  --color-text: #0f172a;
  --color-text-muted: #64748b;
  --color-text-disabled: #94a3b8;

  --color-border: #e2e8f0;
  --color-border-strong: #cbd5e1;

  --color-accent: #2563eb;
  --color-accent-hover: #1d4ed8;
  --color-accent-foreground: #ffffff;

  --color-hover: #f1f5f9;
  --color-active: #e0f2fe;
  --color-focus-ring: rgba(37, 99, 235, 0.35);

  --color-overlay: rgba(15, 23, 42, 0.45);
  --shadow-color: rgba(15, 23, 42, 0.12);

  --color-success: #16a34a;
  --color-warning: #d97706;
  --color-danger: #dc2626;
  --color-info: #0284c7;
}

[data-theme="dark"],
.dark {
  color-scheme: dark;

  --color-bg: #0f172a;
  --color-surface: #111827;
  --color-surface-elevated: #1e293b;
  --color-surface-muted: #172033;

  --color-text: #f8fafc;
  --color-text-muted: #94a3b8;
  --color-text-disabled: #64748b;

  --color-border: #334155;
  --color-border-strong: #475569;

  --color-accent: #60a5fa;
  --color-accent-hover: #93c5fd;
  --color-accent-foreground: #0f172a;

  --color-hover: #1e293b;
  --color-active: #0c4a6e;
  --color-focus-ring: rgba(96, 165, 250, 0.45);

  --color-overlay: rgba(0, 0, 0, 0.65);
  --shadow-color: rgba(0, 0, 0, 0.35);

  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-danger: #f87171;
  --color-info: #38bdf8;
}
```

Adjust the baseline to match the app’s brand and existing design. Do not force these colors if the existing UI clearly uses a different palette.

## Examples

For a compact before/after CSS migration example, read `examples/dark-to-theme.css`.
Use it as a pattern reference only; do not copy token values blindly.

## Migration workflow

### Step 1 — Create or locate the theme token file

Prefer one central file:

- `src/styles/theme.css`
- `src/styles/tokens.css`
- `src/app/globals.css`
- `styles/globals.css`
- existing project theme file

Add token definitions there.

### Step 2 — Replace hardcoded colors with semantic tokens

Replace by role, not by exact value.

Bad:

```css
.card {
  background: #111827;
  color: #f9fafb;
  border: 1px solid #374151;
}
```

Good:

```css
.card {
  background: var(--color-surface);
  color: var(--color-text);
  border: 1px solid var(--color-border);
}
```

### Step 3 — Preserve dark mode

If the app already uses `.dark`, keep `.dark`.
If it uses `[data-theme="dark"]`, keep `[data-theme="dark"]`.
If it uses both or is inconsistent, support both during migration:

```css
[data-theme="dark"],
.dark {
  color-scheme: dark;
  /* dark tokens */
}
```

### Step 4 — Handle Tailwind projects

If Tailwind is used, prefer CSS variables as the source of truth.

Use utility classes like:

```tsx
<div className="bg-[var(--color-bg)] text-[var(--color-text)] border-[var(--color-border)]" />
```

Or map variables in `tailwind.config.*` if the project already centralizes Tailwind colors:

```js
theme: {
  extend: {
    colors: {
      bg: 'var(--color-bg)',
      surface: 'var(--color-surface)',
      text: 'var(--color-text)',
      muted: 'var(--color-text-muted)',
      border: 'var(--color-border)',
      accent: 'var(--color-accent)',
    },
  },
}
```

Then prefer:

```tsx
<div className="bg-bg text-text border-border" />
```

Do not scatter many new `dark:` classes unless the project already uses that style heavily and the change is intentionally small.

### Step 5 — Handle alpha colors

For translucent colors, create explicit tokens when they are reused or semantically important:

```css
--color-surface-glass: rgba(255, 255, 255, 0.72);
--color-overlay: rgba(15, 23, 42, 0.45);
--color-focus-ring: rgba(37, 99, 235, 0.35);
```

Do not replace every one-off alpha value with a token unless it improves clarity.

### Step 6 — Handle shadows

Use theme-aware shadow colors:

```css
.card {
  box-shadow: 0 12px 30px var(--shadow-color);
}
```

Avoid heavy dark shadows in light mode. Light mode usually needs softer, lower-opacity shadows.

### Step 7 — Handle charts and SVGs

For SVG, icons, and charts:

- Prefer `currentColor` for monochrome icons.
- Use semantic tokens for axes, grid lines, labels, and fills.
- Keep brand/category colors stable unless contrast fails.

Example:

```css
.chart-axis { color: var(--color-text-muted); }
.chart-grid { stroke: var(--color-border); }
```

### Step 8 — Verify contrast and states

Check at minimum:

- Body text on page background.
- Card text on surface.
- Muted text on surface.
- Button text on accent background.
- Input text, placeholder, border, focus ring.
- Disabled states.
- Table row hover and selected state.
- Modal overlay and modal surface.

Target contrast:

- Normal text: at least 4.5:1.
- Large text and icons: at least 3:1.
- Disabled text may be lower but must remain understandable.

### Step 9 — Keep the diff reviewable

Prefer this sequence:

1. Add tokens.
2. Replace global layout colors.
3. Replace shared components.
4. Replace page-specific colors.
5. Replace remaining hardcoded colors.
6. Run tests/lint/build.
7. Report what changed and what still needs design review.

Avoid one huge unrelated refactor.

## Framework-specific notes

### React / Next.js

- If using `next-themes`, align selectors with its configured attribute: usually `class` or `data-theme`.
- Do not introduce hydration-prone theme logic unless required.
- Keep initial render stable. Do not cause a flash of wrong theme.
- If adding a toggle, isolate it in a small component.

### Vue / Nuxt

- Prefer global CSS variables and bind theme via root class or `data-theme`.
- Avoid component-by-component duplicated color values.

### CSS Modules

- Keep variables global in a global stylesheet.
- Use variables inside module files normally.

### styled-components / Emotion

- If the project already has a JS theme provider, map CSS variables to it or migrate gradually.
- Avoid duplicating the same token values in both JS and CSS unless necessary.

### shadcn/ui

- Prefer preserving the shadcn token structure if present:
  `--background`, `--foreground`, `--card`, `--card-foreground`, `--border`, `--primary`, etc.
- Do not replace shadcn tokens with a second competing system unless requested.

## Naming rules

Use semantic names, not color names.

Good:

```css
--color-surface
--color-text-muted
--color-border-strong
--color-accent
```

Bad:

```css
--dark-gray
--white-ish
--blue-500-copy
--old-bg-2
```

Use component-specific tokens only when the component has a distinct semantic role:

```css
--sidebar-bg
--sidebar-text
--navbar-bg
--input-bg
```

## Common mappings

Use this table as a starting point. Validate by selector and component context.

| Dark-only pattern | Likely semantic token |
|---|---|
| `body { background: #000/#0f172a/#111827 }` | `--color-bg` |
| Card/panel dark background | `--color-surface` |
| Modal/dropdown background | `--color-surface-elevated` |
| White or near-white text | `--color-text` |
| Gray text | `--color-text-muted` |
| Low-opacity gray text | `--color-text-disabled` |
| Dark gray outline | `--color-border` |
| Bright blue/purple/green action color | `--color-accent` or state token |
| Red error color | `--color-danger` |
| Green success color | `--color-success` |
| Yellow/orange warning color | `--color-warning` |
| `rgba(255,255,255,0.05)` hover | `--color-hover` |
| `rgba(0,0,0,0.5)` overlay | `--color-overlay` |

## Safety rules

- Do not change HTML semantics or accessibility attributes unless needed for theme support.
- Do not change API calls, routing, auth, state management, or business rules.
- Do not delete existing dark mode support.
- Do not introduce a design system dependency without user approval.
- Do not claim contrast is verified unless you actually check it or manually calculate it.
- Do not make the UI pure white everywhere; preserve surfaces and hierarchy.

## Output expectations

When completing a migration, report briefly:

1. Where tokens were added.
2. Which selectors/components were migrated.
3. Which hardcoded colors remain and why.
4. Any contrast or design concerns.
5. How to switch themes, if a switch exists.
6. Commands run, such as lint/build/test.

Keep the final response concise and focused on the diff.

## Useful commands

Run only when relevant and safe for the project.

```bash
node .agents/skills/css-theme-migration/scripts/extract-colors.mjs .
node .agents/skills/css-theme-migration/scripts/check-hardcoded-colors.mjs .
npm run lint
npm run build
npm test
```

Adjust paths if the skill is installed globally instead of inside the repo.
