# TableTap PWA UI/UX Agent Handoff

This document is a single-source handoff for the next agent working on the TableTap PWA frontend.

It combines:
- the UI/UX review findings
- why each issue matters
- what should be changed
- what "done" should look like
- implementation notes to reduce re-discovery and avoid regressions

Use this as the working brief before editing the frontend.

## Goal

Improve the product so it is:
- truthful in navigation and labels
- trustworthy in visible status and feedback
- accessible enough for real operator use
- consistent with a production PWA instead of a prototype
- less brittle across screen sizes and state transitions

## Scope

Frontend workspace:
- `C:/Users/ismoi/OneDrive/Desktop/tableTab/TableTap-PWA`

Primary areas involved:
- app shell/navigation
- menu browsing and ordering
- notifications/settings trust issues
- floor page production polish
- accessibility primitives
- layout responsiveness

## Recommended Execution Order

Implement in this order unless product decisions require a change:

1. Fix navigation truthfulness
2. Fix menu pricing and cart summary truthfulness
3. Remove fake/unimplemented affordances
4. Fix accessibility issues in shared primitives and shell controls
5. Replace hard reload/reload-style flows with SPA transitions
6. Remove debug leakage from operator UI
7. Improve layout flexibility for real device sizes
8. Clean up related lint/code issues introduced or encountered during the fixes

## Working Principles

While implementing:
- Do not leave interactive UI that does nothing.
- Do not show fake status indicators.
- Do not use labels that imply data the UI is not actually showing.
- Prefer hiding unfinished features over presenting mock behavior as real behavior.
- Prefer semantic controls (`button`, `a`, form labels) over clickable `div`s.
- Prefer router/state transitions over `window.location.reload()` and `window.location.href`.
- Preserve the existing visual language where possible, but prioritize clarity and trust over decoration.

## Findings

### 1. Bottom nav "Menu" sends users to admin management instead of the menu flow

Priority:
- P0

Files:
- `src/components/templates/AppShell.tsx`
- `src/App.tsx`
- `src/app/admin/index.tsx`

Problem:
- The bottom navigation item is labeled `Menu`.
- It routes to `/admin/manage` with `activeTab: 'items'`.
- The actual operator/customer menu browsing flow is `/menu`.
- Non-admin users can be pushed into an admin-only destination that does not match the label.

Why this matters:
- This breaks the core information architecture.
- The label promises one destination and delivers another.
- Users lose confidence quickly when a primary nav item is misleading.

What to change:
- Change the bottom nav `Menu` destination to `/menu` if it is meant to open the ordering menu.
- If admin menu management also needs quick access, create a separate clearly named admin entry point.
- Ensure non-admin users never land on an admin page from a primary nav item that sounds general-purpose.

Acceptance criteria:
- Tapping `Menu` opens the menu browsing/order-taking flow.
- Admin management is only exposed through a label that clearly communicates management/admin intent.
- Non-admin users are not routed into a permission denial from this nav item.

Implementation notes:
- Check whether product wants both "Menu" and "Manage" in navigation, or only one.
- If space is limited in the bottom nav, admin management may belong in Settings or a role-gated secondary screen.

### 2. Menu ordering screen hides prices and mislabels item count as total

Priority:
- P0

Files:
- `src/app/menu/MenuPage.tsx`
- `src/components/molecules/MenuItemCard.tsx`
- likely `src/stores/cartStore.ts`
- likely `src/utils/format.ts`

Problem:
- Menu cards do not display item prices.
- The sticky cart CTA displays `cart.totalItems()` next to the label `Total`.
- That implies a currency subtotal, but the value is just item count.

Why this matters:
- Price is core decision-making information in any ordering experience.
- A fake or mislabeled total damages trust and can cause operator mistakes.

What to change:
- Render formatted item price on each menu card.
- Add a real computed cart subtotal.
- Replace the fake `Total` display with a currency subtotal.
- Keep quantity visible if useful, but label it accurately as item count.

Acceptance criteria:
- Every menu item visibly shows price.
- The cart CTA shows a real subtotal value in currency.
- If item count is shown, it is labeled as quantity/items, not total price.
- A user can understand cost before opening modifiers or cart details.

Implementation notes:
- `MenuItemCard.tsx` already imports `formatCurrency`, which suggests this was intended.
- If modifiers affect price, the CTA should still show the current subtotal for what is actually in the cart.

### 3. Notification badge is always shown even when there is no real unread state

Priority:
- P1

Files:
- `src/components/templates/AppShell.tsx`

Problem:
- The unread indicator dot is rendered unconditionally.

Why this matters:
- Fake badges teach users to ignore alerts.
- Constant "attention needed" signals create noise and reduce trust.

What to change:
- Render the badge only if real unread notification state exists.
- If notifications are not implemented, remove the badge entirely.

Acceptance criteria:
- The badge is not shown unless there is actual unread data.
- No fake attention indicator appears in the shell.

Implementation notes:
- If notifications are still in progress, the simplest correct behavior is to remove the badge.

### 4. Notifications page is placeholder content presented as live product UI

Priority:
- P1

Files:
- `src/app/notifications/NotificationsPage.tsx`

Problem:
- The page seeds hard-coded notifications in local component state.
- `Clear All` operates only on placeholder UI state.
- The screen visually reads as a real feature.

Why this matters:
- Users assume the page is live because it looks finished.
- This creates a deceptive product experience.

What to change:
- Choose one:
- wire to real backend-driven notification data
- mark the page clearly as unavailable/coming soon
- remove it from active navigation until implemented

Acceptance criteria:
- The page no longer presents fake notifications as real product data.
- Any destructive or stateful action reflects real app state or is removed.
- If unimplemented, the UI clearly communicates that status.

Implementation notes:
- If this feature is not in current scope, hiding it is better than shipping believable mock behavior.

### 5. Settings contains multiple tappable rows with empty handlers

Priority:
- P1

Files:
- `src/app/settings/SettingsPage.tsx`

Problem:
- Several `SettingItem` entries are clickable but do nothing.

Why this matters:
- Dead-end interaction is worse than an omitted feature.
- It makes the whole settings area feel ornamental or broken.

What to change:
- For each no-op row, choose one:
- implement the flow
- disable it visually with an "Unavailable" state
- remove it until supported

Acceptance criteria:
- No visible interactive settings row is a no-op.
- Unimplemented settings are either hidden or clearly disabled.

Implementation notes:
- Check all rows under Management, Preferences, and Support.
- Be careful not to leave `onClick={() => {}}` patterns behind.

### 6. Settings rows use clickable divs instead of semantic buttons/links

Priority:
- P1

Files:
- `src/components/atoms/SettingItem.tsx`

Problem:
- The shared settings row wrapper is a clickable `div`.

Why this matters:
- Poor keyboard access
- weak focus semantics
- assistive tech gets less usable behavior
- this bad pattern propagates to every settings row

What to change:
- Use a semantic `button` for action rows.
- Use a semantic `a` or router link pattern for navigation rows if appropriate.
- Preserve the current styling and spacing.

Acceptance criteria:
- Interactive settings rows are keyboard reachable.
- Focus states are visible and sensible.
- Screen readers treat rows as interactive controls.

Implementation notes:
- If the component must support both static and interactive modes, branch the wrapper element by props.
- Avoid nesting interactive children inside interactive wrappers.

### 7. App shell search field is unlabeled and icon-only controls rely on weak affordances

Priority:
- P1

Files:
- `src/components/templates/AppShell.tsx`
- possibly other page headers with icon-only buttons

Problem:
- The inline search input relies on placeholder text instead of an explicit label.
- Icon-only buttons rely mainly on visuals or `title`.

Why this matters:
- Placeholders are not a substitute for accessible labeling.
- Icon-only controls are ambiguous for some users and weak for screen readers.

What to change:
- Add proper accessible labeling to the search input.
- Add `aria-label` to icon-only buttons where no visible text exists.
- Review shell-level buttons like search, orders, notifications, and close.

Acceptance criteria:
- The search input has an accessible name.
- Icon-only buttons have explicit accessible labels.
- Keyboard/screen-reader behavior is improved without changing the design language too much.

Implementation notes:
- Keep visible UI compact if needed, but add non-visual labels correctly.

### 8. Floor page leaks debug and low-level failure details into the production UI

Priority:
- P1

Files:
- `src/app/floor/FloorPage.tsx`

Problem:
- Raw API logs are displayed in a fixed overlay over the floor screen.
- Error UI exposes low-level failure strings and technical wording.

Why this matters:
- It clutters a task-heavy operator screen.
- It increases user anxiety during transient failures.
- It makes the app look unstable and unfinished.

What to change:
- Remove the debug overlay from production UI.
- Replace technical error rendering with operator-friendly copy.
- Keep retry options, but avoid exposing raw stack-like detail.

Acceptance criteria:
- No debug toast/log overlay is visible in the production floor view.
- Failure states explain the problem in plain operator language.
- Recovery actions do not require a hard page reload.

Implementation notes:
- If debug logs are still useful in development, gate them behind an explicit dev-only flag.

### 9. Menu item card is visually polished but omits essential decision data

Priority:
- P2

Files:
- `src/components/molecules/MenuItemCard.tsx`

Problem:
- The card emphasizes motion and add action but not core decision data.
- Modifier names appear, but price does not.

Why this matters:
- Beautiful but low-information cards slow down ordering and increase uncertainty.

What to change:
- Rebalance the information hierarchy:
- name
- price
- optional supporting metadata
- add action

Acceptance criteria:
- Price is visible without entering a detail modal.
- Supporting text does not crowd out the core information.

Implementation notes:
- This is closely related to Finding 2 and should likely be fixed in the same pass.

### 10. Orders page uses an effect-driven index reset pattern flagged by lint

Priority:
- P2

Files:
- `src/app/orders/OrdersPage.tsx`

Problem:
- `setCurrentIndex(0)` runs inside an effect when active tab or order count changes.
- ESLint already flags it as a `set-state-in-effect` issue.

Why this matters:
- Operators can lose their place unexpectedly during live updates or tab changes.
- It creates jarring UI behavior in an already dynamic screen.

What to change:
- Derive or clamp the index more defensively.
- Avoid reset-via-effect if the state transition can be handled at the source of change.

Acceptance criteria:
- The current card index behaves predictably during tab changes and live order updates.
- The lint warning is resolved without creating hidden reset behavior.

Implementation notes:
- Preserve operator orientation.
- If the displayed list shrinks, clamp into range instead of always resetting to zero.

### 11. Full page reload/navigation is used where SPA state transitions should be used

Priority:
- P1

Files:
- `src/components/templates/AppShell.tsx`
- `src/app/floor/FloorPage.tsx`

Problem:
- The app uses `window.location.href` and `window.location.reload()` in normal flows.

Why this matters:
- Hard reloads break continuity.
- They feel brittle in a PWA.
- They reset app state more aggressively than needed.

What to change:
- Replace full reloads with router navigation and targeted state reset/refetch logic.
- Keep the same user outcome without forcing a browser-level page transition.

Acceptance criteria:
- Order placement returns the user correctly without `window.location.href`.
- Retry/reset actions do not depend on a full page reload unless there is a truly unavoidable reason.

Implementation notes:
- Use router navigation where this is just route transition.
- Use local reset or refetch logic where this is really data refresh.

### 12. Layout depends heavily on rigid viewport-height budgets and a narrow fixed shell

Priority:
- P2

Files:
- `src/components/templates/AppShell.tsx`
- `src/components/templates/FloorTemplate.tsx`
- `src/components/templates/StandardPageTemplate.tsx`

Problem:
- Major regions are sized with hard viewport slices like `10vh`, `12vh`, `70vh`, `100dvh`.
- The shell also uses `max-w-[480px]`.

Why this matters:
- This can break down on tablets, landscape orientations, kiosk hardware, and soft keyboard changes.
- Table/service apps often need more layout flexibility than phone-only consumer apps.

What to change:
- Rework toward flexible layouts with sensible min/max boundaries.
- Preserve the existing feel, but avoid treating one phone viewport as the universal target.

Acceptance criteria:
- Main screens remain usable on wider devices and in landscape.
- The layout does not visibly collapse when browser chrome or virtual keyboard changes viewport size.

Implementation notes:
- This likely needs design judgment, not just utility-class replacement.
- Do not overcorrect into a desktop dashboard unless the product actually wants that.

## Cross-Cutting Cleanup

These are not the main UX findings, but they affect implementation quality:

- `npm run lint` currently reports multiple real issues.
- There are unused imports and placeholder code in several files.
- There are hook dependency warnings and some `any` usage.

Suggested rule while implementing:
- If you touch a file for one of the high-priority fixes, clean up obvious local lint issues in that file when reasonable.
- Do not expand scope into unrelated full-repo refactors unless necessary.

## Suggested Implementation Batches

### Batch 1: Truthfulness and trust

Include:
- Finding 1
- Finding 2
- Finding 3
- Finding 4
- Finding 5

Goal:
- Remove the most misleading and trust-damaging behavior first.

Expected outcome:
- Navigation goes where users expect.
- Price and totals are truthful.
- Fake alerts and fake active settings are gone.

### Batch 2: Accessibility and production behavior

Include:
- Finding 6
- Finding 7
- Finding 8
- Finding 11

Goal:
- Make the app more production-safe without radically redesigning it.

Expected outcome:
- Shared controls are semantic.
- Screen-reader and keyboard behavior improves.
- The UI stops leaking development/debug behavior into operator workflows.

### Batch 3: Layout and deeper polish

Include:
- Finding 9
- Finding 10
- Finding 12

Goal:
- Improve the robustness and usability of the system after the core issues are fixed.

Expected outcome:
- More resilient layouts
- less jarring order navigation
- higher-information cards

## File Checklist

High-likelihood files to inspect while implementing:

- `src/components/templates/AppShell.tsx`
- `src/App.tsx`
- `src/app/menu/MenuPage.tsx`
- `src/components/molecules/MenuItemCard.tsx`
- `src/app/notifications/NotificationsPage.tsx`
- `src/app/settings/SettingsPage.tsx`
- `src/components/atoms/SettingItem.tsx`
- `src/app/floor/FloorPage.tsx`
- `src/app/orders/OrdersPage.tsx`
- `src/components/templates/FloorTemplate.tsx`
- `src/components/templates/StandardPageTemplate.tsx`
- `src/stores/cartStore.ts`
- `src/utils/format.ts`

## Definition of Success

This handoff is complete when the next agent can:
- understand the problems without re-running the full review
- know which issues matter most
- know what to edit first
- know when a fix is truly complete

The product-level success bar is:
- no misleading nav labels
- no fake totals, badges, or active controls
- no dead-end taps
- better accessibility in shared controls
- less brittle transitions and layouts

## Final Notes for the Next Agent

- Do not treat this as a purely visual cleanup.
- The main issue is product trust: labels, status, actions, and data need to be honest.
- Prioritize truthfulness and usability over animation or polish.
- If a feature is unfinished, it is better to hide or disable it than to simulate it.
