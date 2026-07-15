# Accessibility

Aficionado AI is built to **WCAG 2.1 AA** standards. This document lists every
accessibility feature and how it is implemented.

---

## Semantic HTML & Landmarks

- **Landmarks**: `<header>`, `<main>`, and `<nav>` elements provide screen reader
  navigation landmarks on every page.
- **Single `<h1>`**: Each route has exactly one `<h1>` heading; sub-sections use
  `<h2>`–`<h4>` in order without skipping levels.
- **Skip link**: A visually hidden "Skip to main content" link is the first
  focusable element on every page. It becomes visible on keyboard focus and
  jumps to `#main-content`.

---

## Keyboard Navigation

- **Tab order**: All interactive elements are reachable via keyboard in a logical
  order.
- **Visible focus rings**: `:focus-visible` styles provide clear outlines on
  all interactive elements (buttons, inputs, links). Focus rings use a high-
  contrast outline that is visible against both light and dark backgrounds.
- **Enter/Space**: Buttons respond to both Enter and Space keypresses.
- **Escape**: Modal dialogs and overlays close on Escape keypress.

---

## Screen Reader Support

- **`aria-live` regions**: Assistant responses and ops briefings are announced
  to screen readers via `aria-live="polite"` containers. New messages are
  announced without interrupting the user's current reading position.
- **`aria-label`**: All icon-only buttons and interactive elements have
  descriptive `aria-label` attributes.
- **`role` attributes**: Loading spinners use `role="status"` with
  `aria-label="Loading"`. Alert messages use `role="alert"`.
- **Form labels**: Every input has an associated `<label>` element with a
  `for`/`id` association, or an `aria-label`.

---

## Multilingual Accessibility

- **`lang` attribute**: Each assistant response carries a `lang` attribute
  matching the detected language code (e.g., `lang="es"` for Spanish). This
  tells screen readers to use the correct pronunciation engine.
- **`dir="auto"`**: Response text uses `dir="auto"` to support bidirectional
  text layout for potential RTL languages.
- **Language detection**: The language is auto-detected from the user's input
  and displayed via a `LanguageBadge` component.

---

## Color & Contrast

- **4.5:1 contrast ratio**: All text meets WCAG AA minimum contrast requirements
  against its background.
- **Not color-only**: Status indicators (crowd density levels, error/success
  states) always include text labels alongside color. The density levels use
  both color and descriptive labels: "Low Flow" (green), "Moderate Flow"
  (amber), "Heavy Surge" (orange), "Critical Bottleneck" (red).
- **Dark mode**: The default dark theme has been designed with contrast in mind.

---

## Motion & Animation

- **`prefers-reduced-motion`**: All animations and transitions respect the
  user's operating system preference. When reduced motion is enabled:
  - CSS transitions are shortened to 0.01ms
  - Keyframe animations are disabled
  - Typing indicators use a static display instead of bouncing dots

---

## Responsive Design

- **Mobile-first**: The fan chat is designed for mobile viewports (typical
  stadium use case — fans on phones).
- **Fluid typography**: Font sizes scale appropriately across viewport sizes.
- **Touch targets**: Interactive elements have minimum 44×44px touch targets
  per WCAG 2.1 AA (Success Criterion 2.5.5).

---

## Accessibility Tooling

| Tool                     | Purpose                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------- |
| `eslint-plugin-jsx-a11y` | Lint-time checks for common accessibility violations (enforced in CI with zero warnings) |
| Semantic HTML            | `<button>`, `<label>`, `<nav>`, `<main>`, `<header>` used correctly throughout           |
| Manual testing           | Keyboard navigation tested across all routes                                             |

---

## WCAG 2.1 AA Checklist

| Criterion                    | Status | Implementation                                |
| ---------------------------- | ------ | --------------------------------------------- |
| 1.1.1 Non-text Content       | ✅     | All images/icons have alt text or aria-label  |
| 1.3.1 Info and Relationships | ✅     | Semantic HTML, landmarks, headings hierarchy  |
| 1.3.2 Meaningful Sequence    | ✅     | DOM order matches visual order                |
| 1.4.1 Use of Color           | ✅     | Status never color-only (text labels + color) |
| 1.4.3 Contrast (Minimum)     | ✅     | 4.5:1 ratio on all text                       |
| 2.1.1 Keyboard               | ✅     | All functionality keyboard-operable           |
| 2.4.1 Bypass Blocks          | ✅     | Skip-to-content link                          |
| 2.4.2 Page Titled            | ✅     | Descriptive `<title>` on every page           |
| 2.4.3 Focus Order            | ✅     | Logical tab order                             |
| 2.4.7 Focus Visible          | ✅     | `:focus-visible` outlines                     |
| 3.1.1 Language of Page       | ✅     | `lang="en"` on `<html>`                       |
| 3.1.2 Language of Parts      | ✅     | `lang` attribute on multilingual responses    |
| 4.1.2 Name, Role, Value      | ✅     | ARIA labels on all interactive elements       |
