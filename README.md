# Sonia Nail Bar

React + TypeScript frontend-only salon prototype. The public homepage, demo service catalogue, gallery and interactive browser-local customer and manager booking flows support Turkish (default), English and Russian. No backend, production database, authentication, payments or messaging is implemented. All services, prices, schedules and specialist identities remain illustrative.

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
| `/admin` | Daily metrics, day/week calendar, filtered appointment list and management actions |
| `/admin/closures` | Full-salon closure CRUD and affected-customer follow-up |
| `/admin/settings` | Persisted confirmation-mode selection |
| Unmatched URL | Translated 404 |

`AppRoutes` keeps the actual route tree testable under a memory router. Production hosting would require SPA history fallback to `index.html`. No deployment has been configured or performed.

## Configuration and source structure

- `src/data/services.ts`: typed categories and catalogue entries. Prices are integer kuruş, durations are elapsed minutes, `null` means unconfirmed. All six current records are fictional demo offerings, marked both globally and per service. `active` controls prototype visibility and selection only.
- `src/data/salon.ts`: brand/location, unconfirmed contact details, illustrative salon working hours and default confirmation mode (`manual`). Persisted manager settings override this default for new customer bookings.
- `src/data/booking.ts`: demo specialists, eligible service IDs and weekly schedules, appointment interval (15 minutes), timezone (`Europe/Istanbul`), seven-day window, closure ranges (empty by default) and illustrative flag. There are no invented real staff names. Specialist labels are translated generic demo identifiers.
- `src/data/gallery.ts`: typed category/nullable image paths, titles, alt text and optional descriptions in three languages. All six image slots currently have no photo. Set `illustrative: false` only after approving the actual image and copy.
- `src/data/homepage.ts`: existing homepage media paths and verified contact URL slots. Missing URLs remain inactive, labelled text. Existing gallery-preview links lead to `/gallery`.
- `src/data/sampleData.ts`: separate unused model fixtures, never automatically seeded into storage.
- `src/types/domain.ts`: services, specialists, appointments, closures, working hours, gallery records and booking settings/slots.
- `src/lib/availability.ts`: pure slot generation, customer validation and submission-time appointment preparation.
- `src/lib/bookingTime.ts`: IANA timezone conversion and localized display. Only deterministic date/time conversion is cached, not availability.
- `src/lib/appointmentStore.ts`: validated appointment persistence and serialized customer submission wrapper.
- `src/lib/management.ts`: pure appointment lifecycle, metrics, filtering, closure-impact and phone-link logic.
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

`design-references/homepage-reference.png` remains design guidance only, never embedded or cropped into page assets. The established playful pink/ivory/burgundy layout is preserved. New pages reuse those tokens, typography, large tap targets, focus styles and public navigation. Photo placeholders are always labelled; no stock imagery or fictional salon photos are used. Configured photos get lazy thumbnails and accessible native-dialog previews with Escape/backdrop dismissal and focus return.

Still needed: official logo/artwork; approved hero, four service, three homepage-gallery and interior photos; approved gallery photographs with accurate TR/EN/RU titles, alt text and optional descriptions; verified WhatsApp, Instagram and Maps URLs; client-approved services/prices/durations and specialist names, schedules and eligibility.

## Verification

- `tests/storage.test.mjs`: versioned storage, persistence and denied/malformed data.
- `tests/homepage.test.mjs`: translated homepage structure, navigation, configured-image loading and contact states.
- `tests/catalogue.test.mjs`: actual route rendering, service selection, invalid links, gallery filtering/empty states and preview markup.
- `tests/manager.test.mjs`: manager lifecycle, conflicts, self-exclusion, closure CRUD and affected contacts, stale edits, persisted customer-policy changes, same-lock concurrency, storage failures, metrics, filters and translated admin routes.
- `tests/booking.test.mjs`: overlaps, pending/confirmed reservations, cancelled release, adjacency, closures, hours/breaks, overnight ranges, seven local dates, past/invalid inputs, configurable intervals, historical DST transitions, confirmation modes, persistence failures, submission revalidation, cooperating lock submissions, and translated success states.

Lint, unit/render tests and production build are run for this implementation. Server-render tests do not simulate browser clicks, focus or CSS layout. No browser runtime/automation tool is available here; complete click-through, keyboard/lightbox and 375px/tablet/desktop checks remain for browser review. No commits or deployment were performed.

Technical references: [Intl formatToParts](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat/formatToParts), [Web Locks](https://developer.mozilla.org/en-US/docs/Web/API/Web_Locks_API).

## Manager workflows

The admin is explicitly labelled **PROTOTYPE / DEMO**, public and unauthenticated. Use fictional customer details. Navigation has three sections: overview, salon closures and booking settings. All labels, statuses, errors, confirmations and empty states support TR/EN/RU.

### Appointments

The overview metrics count appointments **starting today in Istanbul**; the total excludes cancellations, with separate pending, confirmed and completed counts. Metrics remain about today when calendar filters change. The day/week calendar (Monday-start weeks) and chronological list share date, status and specialist filters. Overnight bookings appear on each occupied day; midnight ends are exclusive. Desktop uses a readable table; phones use compact cards.

Open a record to view its customer name/phone, service, specialist, explicit local date/start/end and status. Phone copying reports success/failure and supports manual selection if clipboard access fails. WhatsApp links are generated only for valid explicit international numbers (`+` or `00`); local country codes are never guessed. Clicking the link is a manual action; no message is composed or sent automatically.

- **Create:** select service, eligible specialist, date/time, fictional customer details and either pending or confirmed status. Manager-created bookings default to confirmed but can be saved pending, independently of the customer confirmation policy. Review and confirm before saving.
- **Approve:** a pending booking becomes confirmed after its current slot is revalidated against current closures, schedules and other active appointments. Approval preserves the originally booked duration even if catalogue duration changes.
- **Edit/reschedule:** change service, eligible specialist, date or time. Customer name and phone are read-only, with phone copying and WhatsApp links preserved. Shared update logic always uses the stored customer identity, even if edit input supplies different values. The same customer engine validates the entire new interval while excluding the edited record. Stable ID, creation timestamp, confirmation policy at creation and existing pending/confirmed status are preserved. After saving, the overview displays the resulting appointment date and resets filters so the record is visible.
- **Cancel:** an explicit confirmation releases the slot. No customer message is sent.
- **Complete:** only confirmed appointments at or after their end timestamp can complete. This keeps future reservations from being prematurely released. Cancelled/completed records are terminal in this prototype. Pending appointments in the past can be cancelled or rescheduled; approving a past slot is not allowed.

New/rescheduled appointments retain the customer's **today-plus-six-days** limit, interval grid and working-hour rules. There is no manager override for conflicts, past starts or closures. Consequential actions require a review or confirmation dialog. Stale record snapshots are rejected rather than overwriting another tab's edits.

### Salon closures and manual follow-up

Add/edit inclusive start/end date ranges with optional TR/EN/RU descriptions. A review shows affected active bookings and their contact details before save. Creating or editing a closure never changes appointments. Persistent closure records and current appointments reconstruct a deduplicated follow-up list on the overview and closure screen; flags remain until bookings are resolved or the closure is changed/removed. No separate competing notification store is used. Removing a closure requires confirmation and makes slots available only if other availability rules permit.

### Confirmation settings

Select Manual or Automatic and explicitly confirm the change. The shared `salon-settings` versioned entry persists the selection across reloads. Customer screens refresh via storage/focus/update events, and the customer submit path rereads the latest persisted policy **inside the same lock** before creating a record. Existing appointment statuses and their recorded confirmation mode are not rewritten. Corrupt/unavailable settings block mutations rather than silently using a different policy.

### Limits

This remains a same-origin browser prototype, not secure manager access or server-authoritative scheduling. Direct browser-storage edits can bypass UI restrictions. Without Web Locks, concurrent tabs have the existing localStorage atomicity limitation. There is no cross-profile/device synchronization, automated follow-up, acknowledgement tracker, authentication or real messaging. Clipboard access may depend on browser permissions. Native dialogs, focus return, responsive views and interactive customer/admin tab synchronization still need browser/device review in addition to the automated logic/render tests. All salon-specific schedules, prices, staff and media still require verification.
