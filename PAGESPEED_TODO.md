# PageSpeed Optimization TODO

## Phase 1: Critical Performance (LCP/FCP)
- [x] 1. index.html — lang="ru", remove TODO, add preconnect, preload hero image
- [x] 2. Add width/height to ALL images + loading="lazy" + decoding="async"

## Phase 2: Accessibility
- [x] 3. src/index.css — darken muted-foreground 50% → 45%
- [x] 4. SiteFooter.tsx — navy-foreground/50 → /80 (adjusted to /80 for AAA contrast)
- [x] 5. All pages — wrap content in `<main>`
- [x] 6. HeroSection.tsx — h3 → h2 for sections
- [x] 7. News.tsx — article titles h2 → h3

## Phase 3: Performance
- [x] 8. tailwind.config.ts — removed filter: blur() from fade-up animation
- [x] 9. TreatmentSection.tsx — lazy loading + decoding="async" for results images

## Phase 4: Validation
- [x] 10. All optimizations applied across all pages
