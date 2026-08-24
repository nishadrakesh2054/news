# Professional Nepali News Portal Implementation Plan

This is a safe, non-destructive implementation roadmap for the current project. No existing app logic has been replaced or removed.

## Core principle

The current portal already works and has a working foundation. The goal is to add premium newsroom features in phases without breaking the live functionality.

## Phase 1 — Homepage editorial upgrade

### Features to add
- Top Stories block
- Latest News block
- Most Read block
- Editor’s Pick block
- Stronger lead story hierarchy
- Photo and video highlight cards

### Safe implementation method
- Add new homepage sections underneath the current layout
- Keep the existing lead story block as the default fallback
- Use new cards only when content is available
- Add admin toggles for each section

### Acceptance criteria
- homepage remains fully usable even if new sections are empty
- existing article links still work
- layout stays mobile-friendly

## Phase 2 — Category and discovery improvements

### Features to add
- category landing pages
- subcategory filters
- topic tags
- archive pages
- breadcrumb navigation
- related article widgets

### Safe implementation method
- Extend current category routes without replacing them
- Add optional metadata slots
- Keep current category pages as default if no new filters exist

### Acceptance criteria
- existing category pages continue to render
- new pages do not break current URL structure
- each category page loads gracefully with or without extra filters

## Phase 3 — Trust and newsroom identity

### Features to add
- author profile section
- editorial team page
- newsroom/about page
- journalist byline improvements
- editorial standards / publication policy page

### Safe implementation method
- Add new pages without modifying article detail rendering rules
- Attach optional author metadata to existing articles
- Keep old article template as fallback

### Acceptance criteria
- article pages still display correctly with or without author profiles
- newsroom pages work independently of the main homepage

## Phase 4 — Reader engagement

### Features to add
- comments and moderation tools
- reaction buttons
- newsletter signup form
- daily brief email capture
- saved article feature

### Safe implementation method
- Put these behind feature flags
- Add them as optional sections on article pages and homepage
- Keep current article experience unchanged unless feature is enabled

### Acceptance criteria
- comment features are optional
- pages remain functional when comments are disabled
- newsletter block never blocks article reading

## Phase 5 — Live news experience upgrade

### Features to add
- premium live ticker styling
- alert banner with urgent visual treatment
- timeline view for live updates
- special coverage pages
- real-time updates countdown / state labels

### Safe implementation method
- Extend current live engine rather than replacing it
- Preserve current live story pages and add optional timeline view
- Use admin toggles for premium live layouts

### Acceptance criteria
- current live story pages still work
- old live update data remains compatible
- new layout is optional

## Phase 6 — Multimedia growth

### Features to add
- video section
- photo gallery landing pages
- media cards
- watch/read split layout

### Safe implementation method
- Add new media sections without removing text article blocks
- Re-use existing image fields and article metadata
- Add video fields as optional, not required

### Acceptance criteria
- no article requires video content
- existing article pages are unaffected

## Phase 7 — Monetization and ad placement

### Features to add
- in-content ad slots
- sticky sidebar ad blocks
- native ad cards
- sponsor module
- display ad analytics dashboard

### Safe implementation method
- Keep current ad system in place
- Add new slot definitions without deleting existing ones
- Make new slots optional and admin-controlled

### Acceptance criteria
- current ads continue to show
- additional ad placements do not distort layout

## Phase 8 — SEO and discoverability

### Features to add
- article schema markup
- author schema
- breadcrumb schema
- social cards
- improved meta titles
- related article engine

### Safe implementation method
- Add metadata layers without changing current page structure
- Keep current pages as-is and enrich metadata over time

### Acceptance criteria
- pages still render normally
- SEO enhancements do not break existing routes

## Recommended rollout order

1. Homepage editorial upgrade
2. Category discovery improvements
3. Trust and newsroom pages
4. Newsletter and engagement
5. Live coverage enhancements
6. Multimedia sections
7. Monetization improvements
8. SEO and analytics improvements

## Risk control rules

- never delete working sections
- never rewrite the article data model in one step
- never force all content into new page types
- always keep old pages as fallback
- measure each phase before moving to the next
- enable new features behind admin flags

## Final recommendation

The correct approach is not to “implement everything at once.” The correct approach is to add premium newsroom capabilities gradually while preserving current functionality. That is the safe route to becoming a professional Nepali news brand without functional destruction.
