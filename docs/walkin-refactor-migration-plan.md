# Walkin / StepBoarding Refactor — Migration Plan

**Scope:** Next.js App Router alignment for `/walkin` and `StepBoarding.tsx`.  
**Principle:** Production safety over architecture purity. No runtime or route changes unless necessary.

---

## 1. Audit Summary

### 1.1 Route structure

| Route | Files | Notes |
|-------|--------|------|
| `/walkin` | `page.tsx` | Single entry; thin (composes only `WalkInWizard`) |
| `/walkin/boarding` | `page.tsx` | Standalone success page; no shared walkin components |
| `/walkin/Swimming` | `page.tsx` | Standalone success page; no shared walkin components |

- **page.tsx thin?** Yes. `src/app/walkin/page.tsx` only renders `<main><WalkInWizard /></main>`.
- **layout.tsx** None under `/walkin`; uses root layout only. No change needed.

### 1.2 Component usage

- **WalkInWizard** is imported only by `src/app/walkin/page.tsx`.
- **StepBoarding, StepSwimming, StepService, StepConfirm, StepSuccess** are used only inside `WalkInWizard` (under `@/components/ui/walkin/`).
- **BoardingFormState** is exported from `StepBoarding.tsx` and used by `WalkInWizard.tsx` only.

So all walkin-step UI is **route-specific to `/walkin`** and lives in one feature folder: `src/components/ui/walkin/`.

### 1.3 StepBoarding.tsx (660 lines)

- **Client boundary:** Has `"use client"` at top; keep as-is.
- **Dependencies:** `@/lib/walkin/walkin/types.mock` (BoardingDraft, PetPicked). Rest is local types and helpers.
- **Local pieces:**
  - Types: `BoardingPackagePricingResponse`, `BoardingAvailableResponse` (API response shapes).
  - Helpers: `planToPackage(plan)`, `todayISO()`, `calcNights(start, end)` (pure).
  - Subcomponents: `Field`, `PlanSlider`, `PlanSlideBtn` (only used inside StepBoarding).
- **Business logic:** Two `useEffect` hooks (availability and pricing fetch). No need to move unless we introduce a data layer later.

### 1.4 Verdict

- **Route structure:** Acceptable. No mandatory refactor.
- **Page thickness:** Acceptable. No change needed.
- **Colocation:** Route-specific components are in `components/ui/walkin/` (feature folder). Colocating under `app/walkin/_components/` would match “near the route” but is a large, invasive change.

---

## 2. Proposed Changes (with risk)

### 2.1 No mandatory refactor

**Conclusion:** Current structure is acceptable. No changes are required for App Router alignment or safety. Optional items below are for maintainability only.

---

### 2.2 Optional: Extract pure helpers from StepBoarding

**Label: SAFE**

- **What:** Move `planToPackage`, `todayISO`, `calcNights` to e.g. `src/lib/walkin/boarding/boarding.utils.ts` and import them in `StepBoarding.tsx`.
- **Why:** Shrinks StepBoarding slightly; helpers become unit-testable without touching UI.
- **Risk:** Low. Pure functions; no client/server boundary change; no behavior change.
- **Imports to update:** Only `StepBoarding.tsx` (add one import from lib).

---

### 2.3 Optional: Move API response types to lib

**Label: LOW RISK**

- **What:** Move `BoardingPackagePricingResponse` and `BoardingAvailableResponse` to e.g. `src/lib/walkin/boarding/boarding.types.ts` (or next to API route types) and import in `StepBoarding.tsx`.
- **Why:** Single source of truth for API shapes; reuse by API route or tests if needed.
- **Risk:** Low. Types only; no runtime or boundary change.
- **Imports to update:** `StepBoarding.tsx` only.

---

### 2.4 Optional: Colocate walkin components under the route

**Label: MEDIUM RISK**

- **What:** Create `src/app/walkin/_components/` and move all of `src/components/ui/walkin/*` there. Update `app/walkin/page.tsx` to import from `./_components/WalkInWizard`. Update all internal imports (e.g. `./StepBoarding` → `./StepBoarding`, `@/lib/...` unchanged).
- **Why:** Matches “colocate route-specific components near the route.”
- **Risk:** Medium. Many files and imports; easy to miss a path or break a re-export. Requires full regression (wizard flow, boarding, swimming, confirm, success).
- **Recommendation:** Skip unless you explicitly want colocation; current feature-folder structure is acceptable.

---

### 2.5 Do not do (per your rules)

- **Do not** rename route folders (e.g. `Swimming` → `swimming`) in this refactor.
- **Do not** change server/client boundaries; keep `"use client"` where it is.
- **Do not** split StepBoarding into many tiny components (overengineering).
- **Do not** move `Field` / `PlanSlider` / `PlanSlideBtn` to shared UI; they are not reused elsewhere.
- **Do not** move business logic into a separate “service” file unless you introduce a broader data layer.

---

## 3. Verification (after any applied changes)

1. **TypeScript:** `pnpm tsc --noEmit` (or `npm run tsc --noEmit`).
2. **Next.js build:** `pnpm build` (or `next build`).
3. **Manual:** Run through `/walkin` → service → boarding (date, plan, availability, pricing, note, next) and confirm step flow and submit behavior unchanged.

---

## 4. Recommendation

- **Apply:** None. Structure is acceptable; prioritizing production safety.
- **If you want a minimal, safe improvement:** Apply only **2.2** (extract pure helpers to `lib/walkin/boarding/boarding.utils.ts`). Optionally **2.3** (move API types to lib). Skip **2.4** unless you decide to invest in full colocation.
