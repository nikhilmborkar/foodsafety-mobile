# foodsafety-mobile

## What this is

Expo React Native app for **fufu** — a household food safety scanner.

Uses Expo Router navigation.

---

## Deploy

```
git add [files]
git commit -m "..."
git push
```

OTA update:

```
eas update --branch production
```

Native build:

```
eas build --platform android --profile preview
```

---

## Backend

https://foodsafety-os-production.up.railway.app

Configured in:

```
constants/api.ts
```

---

## Tech stack

- Expo SDK 55
- Expo Router ~55.0.4
- react-native-svg 15.15.3
- AsyncStorage 2.2.0
- ML Kit OCR (`@react-native-ml-kit/text-recognition`)

---

## Navigation

Root Tabs (`app/_layout.tsx`):

- Scan (`app/index.tsx`)
- Household (`app/profiles.tsx`)
- Settings (`app/settings.tsx`)

Camera stack (`app/(camera)/_layout.tsx`, `presentation: 'card'`):

- `scan-label`
- `result`
- `result-tier1`
- `result-tier2`

---

## Scan flow

```
index → barcode scan → result-tier1
index → INCONCLUSIVE → result

scan-label → OCR scan → result-tier1

result-tier1 → result-tier2 (full detail)
result-tier1 → result (INCONCLUSIVE fallback)
```

---

## Key components

| Component | Purpose |
|---|---|
| `VerdictCard` | Tier 1 quick verdict card |
| `DetailVerdictCard` | Tier 2 full reasoning card (WhyPanel logic inlined, always visible) |
| `MemberCard` | Legacy full result card (used in `/result`) |
| `SafeScreen` | Safe area wrapper — always use instead of raw `View` |
| `OnboardingSheet` | First-launch profile creation modal |
| `WhyPanel` | Collapsible rule explanation panel (used in `MemberCard`) |

---

## AsyncStorage

Key: `'household_profiles'`

Contains: `Profile[]`

**This key must never change.** All reads and writes across the app use this exact string. Changing it will silently lose all user profiles.

---

## Design system

Colors and fonts are locked. Agents must not introduce new color tokens.

Color tokens are in `constants/colours.ts`.
Typography tokens are in `constants/typography.ts`.

Fonts in use:
- `Fraunces_600SemiBold` — screen titles, product names
- `Inter_500Medium` — labels, section headers
- `Inter_400Regular` — body text, values

---

## Types

```
types/index.ts      — Profile, EvaluationOutput, EvaluateResponse, EvaluateRequest
types/verdict.ts    — Verdict, MemberResult (Tier 1/2 display layer)
```

`MemberResult` is mapped from `EvaluateResponse` via `lib/mapToMemberResults.ts`.

---

## Backend contract

The app consumes `EvaluateResponse` from foodsafety-os.

Fields used by mobile:

| Field | Used by |
|---|---|
| `Outcome` | Verdict badge, border color |
| `Output_State` | Explanation text |
| `Matched_Rule_IDs` | WhyPanel / DetailVerdictCard rule explanations |
| `Matched_Signals` | WhyPanel / DetailVerdictCard signal explanations |
| `Allergen_Source_Details` | Gluten source detail in WhyPanel |
| `Confidence_Score` | Confidence badge, low-data banner |
| `Profile_ID` | Maps evaluation back to profile name |

Do not change backend response field names without updating mobile types and all display components.

---

## Rules

- `INCONCLUSIVE` state always routes to `/result`
- Tier 1 (`/result-tier1`) is the default result screen for all successful scans
- Tier 2 (`/result-tier2`) is reached from Tier 1 for detailed rule reasoning
- Tier 3 (ingredient-level trace) is planned but not yet implemented

---

## Do Not Change Without Review

These are safety and architecture invariants. Do not modify without explicit design approval.

### Backend contract
- `EvaluateResponse` shape — mobile parses this directly
- AsyncStorage key `'household_profiles'` — changing this silently breaks all profile data
- Profile object schema stored in AsyncStorage must remain backward compatible with existing installs
- INCONCLUSIVE responses must always return HTTP 200 — never 4xx or 5xx

### Navigation
- All camera screens must live in `app/(camera)/` Stack
- `result.tsx` handles INCONCLUSIVE only
- `result-tier1.tsx` is the default post-scan screen
- Never use `fullScreenModal` for camera Stack presentation

### API routes
- Mobile depends on these backend paths — do not rename without updating the mobile app:
  - `/evaluate`
  - `/ocr-evaluate`
  - `/health`

### Design system
- Color tokens are locked — no new colors without design approval
- Fraunces for headings/product names
- Inter for all other text
- `SafeScreen` not `SafeAreaView`
