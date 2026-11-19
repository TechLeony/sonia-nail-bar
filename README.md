# Sonia Nail Bar

React + TypeScript frontend-only salon prototype. The public homepage, demo service catalogue, gallery and interactive browser-local customer and manager booking flows support Turkish (default), English and Russian. No backend, production database, authentication, payments or messaging is implemented. The catalogue includes supplied salon menu terminology alongside six legacy demo booking options. All numerical prices, durations, schedules and specialist identities remain illustrative and unapproved.

## Run and verify

Use Node.js 24 LTS and npm.

```sh
npm ci
npm run dev
npm run lint
npm test
npm run build
npm run preview
```

Vite prints the local development URL (normally http://localhost:5173). The production build runs strict TypeScript checks and writes `dist/`. Tests use Node's built-in runner, native TypeScript stripping for storage tests, and the existing Vite SSR pipeline for TSX/route tests; no new dependency or test framework is needed. To see individual test cases, run `node tests/booking.test.mjs` (or another test file) directly.

## Stack and routes

React 19, TypeScript 7, Vite 8, Tailwind CSS 4, React Router 7 and Lucide React. Tailwind uses `@tailwindcss/vite`, `@import "tailwindcss"`, and CSS-first `@theme` tokens. No Tailwind v3/PostCSS setup is used.

| Route | Behavior |
| --- | --- |
| `/` | Reference-inspired homepage, service/gallery previews, booking overview and contact area |
| `/services` | Categorized illustrative services, prices/durations and service-selection links |
| `/gallery` | Responsive gallery with `?category=ID` filtering and native-dialog photo previews |
| `/booking` | Four-step customer demo booking flow; accepts `?service=ID` |
| `/admin` | Today’s appointment total, global status totals/pending queue, day/week calendar and management actions |
| `/admin/analytics` | Historical reporting periods, creation/scheduled/event counts and estimated completed-service value |
| `/admin/closures` | Full-salon closure CRUD and affected-customer follow-up |
| `/admin/settings` | Persisted confirmation-mode selection |
| Unmatched URL | Translated 404 |

`AppRoutes` keeps the actual route tree testable under a memory router. Production hosting would require SPA history fallback to `index.html`. No deployment has been configured or performed.

## Configuration and source structure

- `src/data/demoServiceValues.ts`: isolated fictional TRY/minute configuration for all 38 services; existing six values remain unchanged. Pricing does not grant eligibility.
- `src/data/services.ts`: typed categories and catalogue entries. Prices are integer kuruş, durations are elapsed minutes, `null` means unconfirmed. The six original demo records retain their IDs/prices/durations for saved-reservation and historical-report compatibility. Another 32 supplied menu entries have fictional numeric demo prices/durations but no assigned specialists. All 38 records obtain numerical values from `src/data/demoServiceValues.ts`. `active` controls visibility; booking also requires valid price/duration and an eligible configured specialist. Five catalogue groups organize the existing category IDs and the new permanent-makeup, skin-care and laser categories.
- `src/data/salon.ts`: brand/location, unconfirmed contact details, illustrative salon working hours and default confirmation mode (`manual`). Persisted manager settings override this default for new customer bookings.
- `src/data/booking.ts`: demo specialists, eligible service IDs and weekly schedules, appointment interval (15 minutes), timezone (`Europe/Istanbul`), seven-day window, closure ranges (empty by default) and illustrative flag. There are no invented real staff names. Specialist labels are translated generic demo identifiers.
- `src/data/gallery.ts`: typed category/nullable image paths, titles, alt text and optional descriptions in three languages. Five supplied real portfolio photographs are configured with Nails, Lashes and Brows filters and `illustrative: false`. No generated supporting image is included in the portfolio.
- `src/data/media.ts`: explicit imports from `src/assets/sonia/`, typed real/supporting provenance, translated image descriptions and category imagery. No broad file glob or sidecar imports.
- `src/data/homepage.ts`: configured local homepage media paths and verified contact URL slots. The supplied Instagram and Maps links are active; WhatsApp remains unset and clearly noninteractive. Existing gallery-preview links lead to `/gallery`.
- `src/data/sampleData.ts`: separate unused model fixtures, never automatically seeded into storage.
- `src/types/domain.ts`: services, specialists, appointments, closures, working hours, gallery records and booking settings/slots.
- `src/lib/availability.ts`: pure slot generation, non-mutating day-availability explanations, customer validation and submission-time appointment preparation.
- `src/lib/closures.ts`: single/range drafts, safe description whitespace normalization, exact date matching and Istanbul date previews. The persisted closure model remains unchanged.
- `src/lib/bookingTime.ts`: IANA timezone conversion and localized display. Only deterministic date/time conversion is cached, not availability.
- `src/lib/appointmentStore.ts`: validated appointment persistence and serialized customer submission wrapper.
- `src/lib/management.ts`: pure appointment lifecycle, operational metrics, global pending queue, filtering, closure-impact and phone-link logic.
- `src/lib/analytics.ts`: inclusive Istanbul reporting periods and separate creation, scheduled, lifecycle-event and estimated-value calculations.
- `src/lib/managerStore.ts`: serialized manager mutations with stale-record protection.
- `src/lib/salonSettingsStore.ts`: validated closure ranges and confirmation preferences through the existing storage adapter.
- `src/lib/prototypeSync.ts`: shared cross-tab lock and same-tab update event.
- `src/lib/storage.ts`: shared versioned localStorage abstraction.
- `src/hooks/`: language context, ticking booking clock and appointment-store updates.
- `src/components/`: shared brand, navigation helpers, media placeholders, service facts, gallery modal and booking success presentation.
- `src/pages/`, `src/layouts/`: page rendering and separate public/manager shells.
- `src/i18n/`: typed dictionaries for shared UI, homepage, catalogue/gallery and booking. Domain content uses `LocalizedText` fields. The language preference persists through the same storage abstraction.
- `src/index.css`: design tokens and responsive shared styles; fonts are local system stacks.

## Customer demo flow

1. Choose an active service or arrive from `/services` with `?service=ID`. Unknown/inactive links show a translated fallback and service picker.
2. Choose an active specialist eligible for that service.
3. Choose a local date and available start time. The window is **today plus the next six calendar days in Istanbul**, not UTC dates or a rolling 168-hour period. Past/current starts are excluded. A valid start on the last day may end after midnight if schedules and closures permit.
4. Enter a fictional customer name and phone, review the summary and confirmation policy, then save. Names require 2–80 characters; phones require 8–15 digits and permit a leading plus, spacing, parentheses, periods and hyphens. Client validation is for the prototype, not production phone verification.

The service ID remains in the URL; specialist/date/time/customer inputs remain in component state until submission and reset on service changes. Language changes preserve in-progress choices. Invalidated slots cannot be submitted. Submission rereads storage, checks the current clock and recomputes availability before writing. A ref guards repeated submissions while saving.

Appointments use `crypto.randomUUID()` IDs and explicit UTC ISO timestamps (`Z`) for start, end and creation. Automatic mode creates `confirmed` appointments; manual mode creates `pending` appointments. Both statuses reserve time. `cancelled` (and non-active `completed`) records do not block slots. Managers can cancel through an explicit confirmation dialog. Completed records remain non-blocking, and the manager workflow prevents completing future appointments.

Success displays the service, specialist, local date/start/end time, status and demo reference. Pending wording explicitly says the request is not confirmed but its slot is held in this browser. Customer contact details are cleared from form state after saving and are not echoed on the success screen. Refreshing returns to the flow while stored reservations remain.

## Availability semantics and salon assumptions

Salon and specialist weekly ranges are intersected for the full service interval. Multiple ranges support lunch breaks. `[]` means closed; `null` or a missing specialist schedule supplies no availability. Hours are `HH:mm` (00:00–23:59); a closing time earlier than the opening time means the following day. Equal opening/closing times are treated as invalid, not 24-hour opening. Adjacent ranges merge. Candidate starts are anchored to each salon opening at the configured interval, then checked against specialist hours.

Previous-day ranges provide overnight carryover. Services use actual elapsed minutes. The engine obtains timezone offsets through `Intl.DateTimeFormat` with IANA zone rules rather than assuming UTC+3. Nonexistent DST wall times produce no candidate; repeated times produce distinct instants, labelled with their UTC offset. Ambiguous opening/closing boundaries encompass the earliest opening/latest closing; nonexistent boundary times discard that range conservatively. Tests cover historical Istanbul spring gaps and autumn folds. These DST/schedule policies should be confirmed before production.

Closures are inclusive local date ranges. Any occupied part of a booking on a closed day rejects the slot; end times are exclusive, so ending exactly at midnight does not occupy the following day. Overlap checks use actual half-open intervals (`start < otherEnd && otherStart < end`), permitting exact adjacency. Invalid closure data or malformed active reservations fail closed.

The illustrative default salon schedule is Monday–Friday 10:00–19:00, Saturday 10:00–18:00, Sunday closed. Specialist A follows those hours; Specialist B has a shorter example schedule and excludes lash services. **These are demo assumptions, not verified Sonia opening hours or personnel.** Verify all hours, breaks, service eligibility, service durations/prices, closure dates, booking interval, seven-day policy and manual/automatic confirmation policy with the salon.

## Prototype persistence and limits

The shared adapter uses keys under `sonia-nail-bar:prototype:` and `{ version: 1, data }` envelopes. `language`, `appointments`, and `salon-settings` are separate validated entries under that namespace. Salon settings contain the selected confirmation mode and full-salon closure list. Normal preference reads retain fallback behavior. Booking uses `readResult()` to distinguish a missing store (empty reservations) from corrupt, unsupported-version or unavailable storage; it never overwrites bad booking data with an empty array. Failed writes never show success. Version migrations are not automatic.

This is disposable, unencrypted browser storage, **not secure authentication or a production database**. Use fictional customer details in this prototype. Reservations exist only for this browser/origin, not other browsers or devices. They can be inspected, edited or deleted using browser tools and are lost when site data is cleared. Clear the `sonia-nail-bar:prototype:appointments` entry in browser tools to reset demo reservations without affecting language preference. No customer data is sent over the network.

Storage and focus events update open views when another tab changes reservations or salon settings. A shared same-tab event updates mounted customer/manager views after mutations. Customer bookings, manager changes, closures and settings all use the same lock. Where available, Web Locks serialize cooperating same-origin submissions; without Web Locks the adapter still rereads immediately before its synchronous write, but localStorage cannot guarantee atomic cross-tab transactions. There is no cross-device conflict protection. Browser permissions, quotas and site-data eviction can affect persistence. A production system needs server-authoritative transactions, availability, authorization, validation and secure data storage.

## Visual reference and outstanding media

`design-references/homepage-reference.png` remains design guidance only, never embedded or cropped into page assets. The established playful pink/ivory/burgundy layout is preserved. New pages reuse those tokens, typography, large tap targets, focus styles and public navigation. Supplied real Sonia portfolio images replace the public photo placeholders. Generated supporting imagery is labelled as editorial/decorative or a salon concept; it never represents actual portfolio evidence. No stock images or remote images were added. Configured photos get lazy thumbnails and accessible native-dialog previews with Escape/backdrop dismissal and focus return.

Local asset usage:

- `IMG_7736.jpeg`: manicure service preview/category image, homepage portfolio preview and Nails gallery.
- `IMG_7741.jpeg`: nail-art service preview/category image, homepage portfolio preview and Nails gallery.
- `IMG_7737.jpeg`: lashes service preview/category image and Lashes gallery.
- `IMG_7738.jpeg`: homepage portfolio preview and Brows gallery. Adding this gallery category does not add a bookable brow service.
- `IMG_7742.jpeg`: Lashes gallery, with the complete supplied collage retained in the lightbox.
- `manicure-img.png`: generated editorial homepage hero, explicitly labelled; high-priority eager loading.
- `pedicure-img.png` (actual filename, rather than `peducire-img.png`): generated illustrative pedicure on the homepage service card and Services category; never included in the authentic gallery. Existing frames/links are preserved, with the crop centered at 65% vertically to show the toes.
- `soniaLogo-img.png`: proposed ribbon-heart SONIA logo, not a verified official logo. The contact image uses a separate foreground image with `object-fit: contain`, centered at 86% width / 82% height over the unchanged floral/satin background.
- `interior-img.png`: the actual file contains floral/satin artwork, retained as the decorative contact background, with the separate proposed logo centered above it and no decorative-image caption.
- `background-img.png`: the actual file contains a generated pink salon interior, used only as a subtle, labelled booking-overview background. These two filenames differ from the supplied content descriptions; the code preserves their original names and identifies roles by actual contents.

Non-hero images load lazily. Images remain local originals, with Vite-generated asset URLs. `:Zone.Identifier` sidecars are ignored entirely and are never imported or displayed. Service-card links retain `/services` with category anchors; service booking links and all appointment/storage logic are preserved.

Still needed: official logo/artwork, actual salon interior/team photographs, real pedicure photographs, a verified WhatsApp number, and client-approved services/prices/durations and specialist names/schedules/eligibility. The portfolio is real; catalogue data and booking remain illustrative. Browser checks of image cropping, responsive layouts and lightbox keyboard/focus behavior remain outstanding.

## Verification

- `tests/analytics.test.mjs`: global dashboard counts/queue, lifecycle metadata, legacy compatibility, price preservation, Istanbul reporting boundaries, reporting bases, shared-store subscriptions, translated analytics route/sidebar and storage errors.
- `tests/closures.test.mjs`: exact single/inclusive range boundaries, November 20–22 attribution, weekly/staff/fully-booked states, one-message customer rendering, one-field manager forms, localized previews, legacy closure compatibility, closure CRUD/submission revalidation and affected-customer management access.
- `tests/storage.test.mjs`: versioned storage, persistence and denied/malformed data.
- `tests/homepage.test.mjs`: translated homepage structure, navigation, configured-image loading and contact states.
- `tests/catalogue.test.mjs`: actual route rendering, service selection, invalid links, gallery filtering/empty states and preview markup.
- `tests/manager.test.mjs`: manager lifecycle, conflicts, self-exclusion, closure CRUD and affected contacts, stale edits, persisted customer-policy changes, same-lock concurrency, storage failures, metrics, filters and translated admin routes.
- `tests/booking.test.mjs`: overlaps, pending/confirmed reservations, cancelled release, adjacency, closures, hours/breaks, overnight ranges, seven local dates, past/invalid inputs, configurable intervals, historical DST transitions, confirmation modes, persistence failures, submission revalidation, cooperating lock submissions, and translated success states.

Lint, unit/render tests and production build are run for this implementation. Server-render tests do not simulate browser clicks, focus or CSS layout. No browser runtime/automation tool is available here; complete click-through, keyboard/lightbox and 375px/tablet/desktop checks remain for browser review. No commits or deployment were performed.

Technical references: [Intl formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts), [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API).

## Manager workflows

The admin is explicitly labelled **PROTOTYPE / DEMO**, public and unauthenticated. Use fictional customer details. Navigation has four sections: overview, analytics, salon closures and booking settings. All labels, statuses, errors, confirmations and empty states support TR/EN/RU.

### Appointments

The overview keeps four operational cards: **Today’s appointments** counts non-cancelled appointments starting today in Istanbul (pending, confirmed and completed); **Pending**, **Confirmed** and **Completed** count their current statuses across all stored dates/history. The current clock determines today, never the selected calendar date. All four cards ignore calendar/list filters. Customer and manager mutations update mounted views through the same-tab event; cross-tab storage changes and focus refresh the shared store subscription.

The prominent global pending section also ignores calendar filters. Upcoming pending requests appear nearest first with customer contacts, service, specialist, explicit date/time, direct approval (with confirmation) and View/Edit actions. Past pending requests remain separately visible for rescheduling or cancellation; past slots cannot be approved. Customer identity stays read-only.

The day/week calendar (Monday-start weeks) and chronological list share date, status and specialist filters. Overnight bookings appear on each occupied day; midnight ends are exclusive. Desktop uses a readable table; phones use compact cards.

Open a record to view its customer name/phone, service, specialist, explicit local date/start/end and status. Phone copying reports success/failure and supports manual selection if clipboard access fails. WhatsApp links are generated only for valid explicit international numbers (`+` or `00`); local country codes are never guessed. Clicking the link is a manual action; no message is composed or sent automatically.

- **Create:** select service, eligible specialist, date/time, fictional customer details and either pending or confirmed status. Manager-created bookings default to confirmed but can be saved pending, independently of the customer confirmation policy. Review and confirm before saving.
- **Approve:** a pending booking becomes confirmed after its current slot is revalidated against current closures, schedules and other active appointments. Approval preserves the originally booked duration even if catalogue duration changes.
- **Edit/reschedule:** change service, eligible specialist, date or time. Customer name and phone are read-only, with phone copying and WhatsApp links preserved. Shared update logic always uses the stored customer identity, even if edit input supplies different values. The same customer engine validates the entire new interval while excluding the edited record. Stable ID, creation timestamp, confirmation policy at creation and existing pending/confirmed status are preserved. After saving, the overview displays the resulting appointment date and resets filters so the record is visible.
- **Cancel:** an explicit confirmation releases the slot. No customer message is sent.
- **Complete:** only confirmed appointments at or after their end timestamp can complete. This keeps future reservations from being prematurely released. Cancelled/completed records are terminal in this prototype. Pending appointments in the past can be cancelled or rescheduled; approving a past slot is not allowed.

New/rescheduled appointments retain the customer's **today-plus-six-days** limit, interval grid and working-hour rules. There is no manager override for conflicts, past starts or closures. Consequential actions require a review or confirmation dialog. Stale record snapshots are rejected rather than overwriting another tab's edits.

### Analytics and historical accuracy

`/admin/analytics` is the separate reporting page; no historical reporting or estimated revenue cards are added to `/admin`. Periods are this week, last week, this month, last month and custom dates. Weeks run Monday–Sunday; both endpoint dates are included in Europe/Istanbul. Invalid/missing custom dates or reversed ranges show translated errors and hide calculated results until corrected. Local reads are synchronous; unavailable/corrupt appointment storage shows an error instead of misleading zero totals.

- **Created appointments:** original `createdAt` falls in the period, regardless of service date/current status.
- **Scheduled appointments:** service `startsAt` falls in the period, including cancellations, with a current pending/confirmed/completed/cancelled breakdown. This does not reconstruct statuses as they were at a historical date.
- **Recorded completions/cancellations:** count known `completedAt`/`cancelledAt` events in the period. Legacy terminal records without event dates are excluded, not assigned guessed dates. Separately labelled unknown-date counts span all stored history and cannot be attributed to any period.
- **Estimated service value (Tahmini ciro):** completed appointments only, using `completedAt` where available, otherwise the scheduled start date with an explicit caveat. Saved appointment prices take precedence. Legacy records without a saved price use the current catalogue price with a caveat; those estimates may change when catalogue prices change. A saved unknown (`null`) price is not replaced with a guessed price. Unknown/missing prices are excluded and counted; zero is valid. Counts show date fallbacks, current-price fallbacks and excluded prices. This is not collected revenue; there are no payment, discount, tax or refund assumptions.

The appointment envelope remains **version 1**, with compatible optional `updatedAt`, `completedAt`, `cancelledAt` and `servicePriceSnapshot: { priceMinor, currency }` fields. No destructive migration, reset, read-time backfill or new store is used. Existing `createdAt` is required as before and always preserved. New customer/manager appointments capture creation/update time and the configured service price in integer kuruş. Successful manager mutations set `updatedAt`; completion/cancellation record their actual transition time. Approval and same-service rescheduling preserve the saved price; switching to a different service captures that service’s current price. Same-service edits of legacy records leave missing snapshots missing rather than claiming a historical price was recorded. Existing identity protection, stale-snapshot checks, shared lock and availability revalidation remain in place.

Browser acceptance review remains required for period/custom-date interactions, keyboard/mobile layouts, pending approval/edit dialogs, live multi-tab updates and clipboard/WhatsApp behavior. Automated tests exercise logic, SSR markup and the shared event subscription, not mounted browser interactions.

### Salon closures and manual follow-up

Choose **Single Day** (one date, stored with identical start/end dates) or **Date Range** (both endpoints included). Missing, impossible and reversed dates are rejected. A live localized preview and the save review state exactly which dates will be closed. All calendar labels are interpreted in Europe/Istanbul without converting the input dates through UTC timestamps.

There is exactly one optional **Closure description** input, entered once in Turkish. Leading/trailing and repeated whitespace are normalized; the wording is not translated or rewritten. The hint explains that a non-empty Turkish description is shown unchanged across TR/EN/RU. Empty/whitespace-only descriptions use only the customer’s localized default: TR “Bu tarihte salon kapalıdır.”, EN “The salon is closed on this date.”, RU “В этот день салон закрыт.” A custom description replaces the default entirely, with no introductory sentence. If explicit closures overlap, one deterministic message is shown, preferring a non-empty Turkish description, then sorting by start date and ID.

The existing version-1 `salon-settings` envelope and `SalonClosure.reason: { tr, en, ru }` model are retained. No migration, reset or read-time rewriting occurs. Editing updates the Turkish description and retains any old EN/RU values for compatibility and possible future approved translation support; they are not presented as translated customer messages. Old records with only EN/RU text retain it in storage and use the localized default when Turkish is empty. No appointment data is changed by closure edits.

Customer date/time selection distinguishes explicit closures, weekly salon closed days, unconfirmed salon hours, specialist weekly days off, specialist hours that cannot fit the service, fully reserved days and other no-start-time states. An explicit closure covering the selected date takes message precedence. The new explanation layer reuses the existing slot engine; it does not change its 15-minute grid, full-duration, overnight, adjacency, reservation, closure-spillover or submission revalidation rules. Previous-day overnight carryover is respected when explaining weekly days off.

For the reported **20–21 November 2026** range, only November 20 and 21 are explicitly closed. November 22 is Sunday and is unavailable under the illustrative weekly salon schedule, not because the range extends an extra day. November 23 is available if the other rules allow. Tests also open Sunday in an isolated configuration to prove that the explicit 20–21 closure alone does not block November 22.

A review shows affected active bookings and their contact details before save. Creating or editing a closure never changes appointments. Persistent closure records and current appointments reconstruct a deduplicated follow-up list on the overview and closure screen; flags remain until bookings are resolved or the closure is changed/removed. No separate competing notification store is used. The affected list includes customer name/phone, service, specialist and explicit date/time, with Details access to the existing manager actions at `/admin?appointment=ID`. Existing lifecycle, conflict and read-only customer identity rules apply. Removing a closure requires confirmation and makes slots available only if other availability rules permit.

### Confirmation settings

Select Manual or Automatic and explicitly confirm the change. The shared `salon-settings` versioned entry persists the selection across reloads. Customer screens refresh via storage/focus/update events, and the customer submit path rereads the latest persisted policy **inside the same lock** before creating a record. Existing appointment statuses and their recorded confirmation mode are not rewritten. Corrupt/unavailable settings block mutations rather than silently using a different policy.

### Limits

This remains a same-origin browser prototype, not secure manager access or server-authoritative scheduling. Direct browser-storage edits can bypass UI restrictions. Without Web Locks, concurrent tabs have the existing localStorage atomicity limitation. There is no cross-profile/device synchronization, automated follow-up, acknowledgement tracker, authentication or real messaging. Clipboard access may depend on browser permissions. Native dialogs, focus return, responsive views and interactive customer/admin tab synchronization still need browser/device review in addition to the automated logic/render tests. Salon schedules, prices and staff still require verification; additional official interior/team and pedicure media are still needed.

Closure browser review still needed: switch Single Day/Date Range; test invalid ranges and previews; create/edit/remove closures while customer booking is open in another tab; verify one localized/default or original Turkish message in all three languages, including at the review step; follow affected appointments into manager actions; check keyboard/dialog focus and phone/tablet/desktop layouts. Browser profile localStorage is not accessible from the repository audit; legacy compatibility is tested against version-1 fixtures.

## Supplied menu and responsive review

The existing `/services` page now groups treatments under **Nail Bar**, **Kirpik & Kaş**, **Kalıcı Makyaj**, **Cilt Bakım** and **Lazer Epilasyon**. `src/data/services.ts` contains the supplied Turkish terminology with EN/RU equivalents, including the two complete nail combinations, brown-lash supplement, Hydrafacial session counts and IPL/Diode methods. Named combinations remain single entries. The specified laser areas are described in the category note; no area prices or unspecified packages were created. `Kirpik Lifting` retains the existing `demo-lash-lift` record rather than duplicating it.

All 38 services now show numeric TRY prices and durations in minutes, isolated in the typed fictional configuration `src/data/demoServiceValues.ts`. No screenshot prices were copied. The six original demo values are unchanged for saved-booking/history compatibility. All 32 newer entries have newly authored realistic illustrative figures, without any claim of clinical benefit or official salon approval. Only the original six services retain assigned demo specialists and booking actions. One concise translated disclosure explains the fictional values; individual cards use plain price/duration labels without repeated warnings. Multi-session durations represent total illustrative treatment time across visits, not one continuous booking. Laser method values do not define a region/package. Setting a menu name does not assign staff or create booking availability. Customer/admin selectors and direct booking URLs reject incomplete/unassigned services; the submission engine also rejects missing/invalid prices without changing overlap logic. Centralized price changes require no component rewrite. Existing appointment IDs, storage envelopes, timestamps and price snapshots are untouched.

Real nail, lash and brow work accompanies relevant categories. Generated pedicure imagery remains labelled. Permanent makeup, skin care and laser use the new generated `kaliciMakyaj-img.png`, `ciltBakim-img.png` and `lazerEpilyasyon-img.png` files (actual extensions checked). They are labelled supporting images with translated alt text and never added to the authentic gallery. The authentic gallery is unchanged.

Official public contact configuration:

- Instagram: `https://www.instagram.com/sonianailbar/`
- Maps: `https://maps.app.goo.gl/8shwzBbxc6r11YgHA`
- WhatsApp: unset. No phone, email, detailed address or new opening hours were invented.

Detailed safe external CTAs remain in the homepage and Services contact sections. The shared footer uses 44px icon-only Instagram/Maps links with translated accessible labels and visible focus styles. WhatsApp is a disabled icon button with an unavailable label, with no fabricated destination. Public navigation/footer have no Admin/Management link. `/admin` and all manager routes remain directly accessible and unauthenticated; removing the link does not secure the demo. Production requires real authorization before deployment.

Responsive code review covered homepage/header/hero/cards/contact/footer, catalogue, gallery/lightbox, booking progress/date/time/errors/success, manager navigation/dashboard/pending queue/calendar/list, create/edit/closure dialogs, analytics periods and settings. Root risks and fixes:

- Intrinsic fieldset/input/select widths and long TR/EN/RU labels: shrinkable containers, native control max-widths, wrapped text and explicit zero-minimum grid tracks.
- Header/nav crowding around 1024px: desktop navigation starts at 1280px; compact brand/controls at small widths. Essential links and booking buttons remain.
- Service-card captions overlapping images/provenance: remove negative overlap and keep captions within their image area.
- Rotated gallery previews and offset ornaments: gentler rotation and inset ornament positions.
- Contact/cross-column content overflow: zero-minimum grid columns and stacked contact CTAs in the narrower desktop contact column; compact wrapping footer links.
- Mobile admin sidebar height and narrow content area: compact brand/back row, 2-column mobile / 4-column tablet navigation, 13rem sidebar only from 1280px.
- Appointment tables: mobile cards remain, with a focusable, labelled, locally scrollable table region on desktop. No page-wide overflow hiding is used.
- Long calendar entries and filters: shrinkable controls, wrapped labels and 1/2/3-column calendar layouts.
- Dialog/lightbox cut-off: viewport-bounded width/height, internal scrolling, overscroll containment and shrinkable titles. Existing native-dialog focus behavior is retained.

**Viewport verification:** 320, 375, 390, 430, 768, 1024 and 1440px were code-reviewed only. No browser automation tool or installed browser was available, so none was genuinely browser-tested. `tests/responsive.test.mjs` checks structural accessibility/retention of essential controls and scoped overflow, not computed layout. Human browser review at all seven widths remains required, particularly date controls, translated dialogs, image crops, keyboard focus and touch navigation.

## Single-category catalogue and route scrolling

`/services` renders exactly one of the five top-level catalogue groups, defaulting to Nail Bar. The category controls are native buttons in a labelled group, with `aria-pressed`, a shared `aria-controls` target and burgundy active styling. Selecting a button updates `?category=GROUP_ID` with history replacement, clears stale hashes and renders only that group. The heading is scrolled into view only when outside the viewport; filtering never forces a page-level reset. Unknown category values fall back to Nail Bar. Legacy `/services#category-lashes`/`#category-pedicure` links resolve to the appropriate top-level group and retain intentional anchor targeting. Existing booking URLs and service IDs are unchanged.

`RouteScrollRestoration` inside the router tracks pathname/hash changes through the tested `navigationScroll` policy. A new pathname starts at top; an intentional existing hash target takes precedence. Query-only booking preselection, category filters, admin modal actions, language/form state changes and repeated identical route positions do not reset scrolling. No history entries or appointment state are rewritten. Back/forward pathname changes follow the same top/anchor policy. Scroll behavior itself still requires browser acceptance testing.

At widths below 768px, the homepage booking overview centers its headline, subtitle, icons/numbers and step text. All four steps stack vertically with balanced spacing and a lighter decorative background; the existing desktop four-column arrangement is retained. Footer icons wrap naturally and filter labels retain touch-sized targets and long-label wrapping.

Tests cover single-group rendering/pressed semantics in TR/EN/RU, legacy anchor resolution, numerical configuration and separate eligibility, generated-image exclusion from the real gallery, icon-only footer/disabled WhatsApp, absent public Admin links, route-scroll decisions and mobile step structure. There is no available browser automation tool or installed browser in this environment. All 320/375/390/430/768/1024/1440px checks are code reviews only; actual click/scroll, history, focus and crop behavior remains to be checked manually.
