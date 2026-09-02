# Accessibility checklist

Applied improvements:

- **Skip to content** link on public site and admin (`components/a11y/SkipToContent.tsx`)
- **`#main-content`** landmark on web layout, admin shell, search page, login
- **Login form** — `htmlFor`/`id` pairs, `role="alert"`, `aria-live`, `aria-busy` on submit
- **Focus styles** — `focus-visible:ring` on login inputs

Recommended manual checks before launch:

- Keyboard-navigate admin sidebar and article editor
- Screen reader test on article publish flow
- Color contrast on status badges (WCAG AA)
- Nepali/Devanagari text in headings and forms
