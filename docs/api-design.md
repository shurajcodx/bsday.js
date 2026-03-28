# BSDay API Design Options

Date: 2026-03-28

## Purpose

This document compares possible public API shapes for `bsday.js` so we can choose an API that feels familiar to users coming from:

- JavaScript `Date`
- Day.js
- Moment.js

The main question is:

How should users create **BS dates** without making the API confusing or ambiguous?

---

## Product Inputs

These product decisions should be treated as fixed while evaluating the API:

- top priority is **developer adoption**
- BS standard default string format is **`YYYY/MM/DD`**
- prefixed input forms like **`bs:2082-01-01`** are not acceptable
- object/array-heavy BS creation should not be the main public experience

---

## Goals

We want an API that is:

- easy to learn for normal JavaScript developers
- close to `Date` / Day.js / Moment mental models
- explicit when needed
- safe for ambiguous inputs
- simple to document
- simple to type in TypeScript

We do **not** want an API that feels like internal data plumbing, for example:

```ts
new BSDay({ year: 2082, month: 1, day: 1 })
new BSDay({ bs: [2082, 1, 1] })
```

These shapes are technically workable, but they feel like JSON transport objects rather than a date library API.

---

## Current Situation

Today the library supports several input styles:

- `new BSDay()` for current time
- `new BSDay(Date)` for AD input
- `new BSDay(string)` for generic string input
- `new BSDay({ year, month, day })` for BS input
- `new BSDay({ bs: [year, month, day] })` for BS input
- `BSDay.fromAD(...)`
- `BSDay.fromBS(...)`
- `BSDay.parse(...)`

This is flexible, but not clean.

The main problems are:

- too many ways to do the same thing
- BS object/array input is not user-friendly
- constructor string input can become ambiguous if BS and AD both use `YYYY-MM-DD`
- `fromAD` / `fromBS` are okay, but not very `Date`-like

---

## Important Constraint

BS and AD can both look like this:

```ts
'2082/01/01'
'2024-10-12'
```

If the constructor accepts both calendars using the same string shape, then one of these happens:

1. we guess
2. we add magic heuristics
3. we force explicit calendar intent somewhere

For a public date library, option 3 is the safest.

---

## Design Principles

These principles should guide the final decision:

1. `new BSDay(...)` should feel like `new Date(...)`
2. `bsday(...)` should feel like Day.js / Moment factory usage
3. BS input should be explicit, short, and easy to type
4. conversion methods should stay conversion methods only
5. one task should have one obvious way to do it

This means methods like these should stay simple:

```ts
instance.toBS()
instance.toAD()
```

These should not become parser/factory methods such as:

```ts
new BSDay().toBS(new Date())
```

That would blur the line between:

- creating an instance
- converting the current instance

---

## Option A: AD-Like Constructor, Explicit BS Entry Point

### Shape

```ts
new BSDay()
new BSDay(new Date())
new BSDay('2026-03-28')
new BSDay(1711587300000)

bsday()
bsday(new Date())
bsday('2026-03-28')

BSDay.bs('2082/01/01')
BSDay.bs(2082, 1, 1)

bsday.bs('2082/01/01')
bsday.bs(2082, 1, 1)
```

### Meaning

- constructor/factory default path = AD-like input
- BS input = explicit `.bs(...)`

### Pros

- most familiar for `Date` / Day.js / Moment users
- no ambiguity for BS strings
- no JSON/array syntax required
- easy to explain in docs
- easy to type and autocomplete
- keeps BS intent explicit and readable

### Cons

- adds a custom `bs(...)` entry point
- some users may ask why `new BSDay('2082/01/01')` is not BS

### Good Fit?

Yes. This is the strongest option if the goal is adoption and low confusion.

This option also aligns best with the product inputs:

- constructor remains familiar to JavaScript developers
- BS gets a short explicit entry point
- BS canonical format can be `YYYY/MM/DD`
- no `bs:` prefix is needed

---

## Option B: Keep Constructor Generic, Add BS Prefix Strings

### Shape

```ts
new BSDay()
new BSDay('2026-03-28')
new BSDay('bs:2082/01/01')

bsday('2026-03-28')
bsday('bs:2082/01/01')
```

### Meaning

- plain strings are AD-like
- BS strings require a prefix like `bs:`

### Pros

- constructor stays short
- no object/array syntax
- explicit BS input

### Cons

- prefix strings feel less natural than date-library APIs
- not familiar to Day.js / Moment users
- easy to mistype
- harder to discover from autocomplete

### Good Fit?

No. This conflicts with the product direction and should be rejected.

---

## Option C: Calendar-Aware Factory / Parse Input

### Shape

```ts
bsday('2026-03-28')
bsday('2082/01/01', 'bs')

BSDay.parse('2082/01/01', 'YYYY/MM/DD', 'bs')
BSDay.parse('2026-03-28', 'YYYY-MM-DD', 'ad')
```

### Meaning

- factory accepts a calendar parameter
- BS strings are explicit through an extra argument

### Pros

- explicit
- no JSON/array syntax
- aligns well with current `parse(...)`

### Cons

- constructor cannot naturally do this without becoming awkward
- less `Date`-like
- `bsday(input, 'bs')` is less readable than `bsday.bs(input)`
- extra parameter burden for users

### Good Fit?

Good as an internal/helper API, but not the best main ergonomic API.

---

## Option D: Keep Current Object / Array BS Input

### Shape

```ts
new BSDay({ year: 2082, month: 1, day: 1 })
new BSDay({ bs: [2082, 1, 1] })
BSDay.fromBS({ year: 2082, month: 1, day: 1 })
```

### Pros

- explicit
- safe
- easy for internal code
- easy to validate

### Cons

- not pleasant for human users
- not familiar to date-library users
- ugly in documentation and examples
- feels like data serialization, not API design

### Good Fit?

Good as a compatibility/internal path, weak as the main public API.

---

## Option E: Overload `toBS()` / `toAD()` as Factories

### Shape

```ts
new BSDay().toBS(new Date())
new BSDay().toAD('2082/01/01')
```

### Pros

- looks short at first glance

### Cons

- breaks normal meaning of `toBS()` / `toAD()`
- mixes conversion and parsing responsibilities
- unlike `Date`, Day.js, or Moment
- harder to reason about
- harder to type correctly

### Good Fit?

No. This should be avoided.

---

## Comparison Table

| Option | Easy for users | Familiar to Date/Day.js/Moment | Safe for ambiguity | Good docs story | Recommended |
| --- | --- | --- | --- | --- | --- |
| A. AD constructor + explicit `.bs(...)` | High | High | High | High | Yes |
| B. Prefix strings (`bs:...`) | Medium | Low | High | Medium | No |
| C. Calendar arg (`bsday(input, 'bs')`) | Medium | Medium | High | Medium | Maybe |
| D. Object/array BS input | Low | Low | High | Low | No |
| E. `toBS(input)` style | Low | Low | Low | Low | No |

---

## Recommended Direction

If the goal is:

"make the library easy for `Date` / Day.js / Moment users to adopt"

then the cleanest public API is:

### Main Public Entry

```ts
bsday()
bsday(input)
new BSDay()
new BSDay(input)
```

This path should be treated as **AD-like input**, because that matches existing JavaScript expectations.

### Explicit BS Entry

```ts
bsday.bs('2082/01/01')
bsday.bs(2082, 1, 1)

BSDay.bs('2082/01/01')
BSDay.bs(2082, 1, 1)
```

### Conversion

```ts
instance.toBS()
instance.toAD()
```

### Parsing

```ts
BSDay.parse('2082/01/01 13:15:00', 'YYYY/MM/DD HH:mm:ss', 'bs')
BSDay.parse('2026-03-28 08:00:00', 'YYYY-MM-DD HH:mm:ss', 'ad')
```

### Default Formatting

If BS is the first-class calendar, the default BS formatting should follow the canonical BS display form:

```ts
bs.format() // -> YYYY/MM/DD for BS output
```

AD formatting should remain explicit when needed:

```ts
ad.format('YYYY-MM-DD', 'ad')
```

---

## What To Do With `fromAD()` and `fromBS()`?

### `fromAD()`

This is optional.

Because:

```ts
new BSDay(date)
bsday(date)
```

already covers the same purpose.

Recommendation:

- keep temporarily for compatibility
- de-emphasize in docs
- optionally deprecate later

### `fromBS()`

This is more useful than `fromAD()`, because explicit BS construction is still needed somewhere.

But if we add:

```ts
BSDay.bs(...)
bsday.bs(...)
```

then `fromBS()` becomes optional too.

Recommendation:

- keep for compatibility in the short term
- prefer `BSDay.bs(...)` / `bsday.bs(...)` in docs

---

## Suggested Final Public API

### Recommended Surface

```ts
bsday()
bsday(input)
bsday.bs('2082/01/01')
bsday.bs(2082, 1, 1)

new BSDay()
new BSDay(input)
BSDay.bs('2082/01/01')
BSDay.bs(2082, 1, 1)

BSDay.parse(input, pattern, 'bs' | 'ad')
```

### Compatibility Surface

```ts
BSDay.fromAD(date)
BSDay.fromBS('2082/01/01')
BSDay.fromBS({ year: 2082, month: 1, day: 1 })
new BSDay({ year: 2082, month: 1, day: 1 })
new BSDay({ bs: [2082, 1, 1] })
```

These can remain supported internally for compatibility, but they do not need to be the main advertised API.

---

## Migration Strategy

If we choose the recommended direction:

### Phase 1

- add `BSDay.bs(...)`
- add `bsday.bs(...)`
- update docs to promote them
- keep `fromAD()` / `fromBS()` working
- keep object/array BS input working

### Phase 2

- de-emphasize `fromAD()`
- de-emphasize BS object/array examples
- mark old creation styles as compatibility APIs

### Phase 3

- decide whether to formally deprecate `fromAD()`
- decide whether to formally deprecate BS object/array public examples

---

## Open Questions

Before implementation, these are the decisions to make:

1. Should `new BSDay('2026-03-28')` always mean AD?
2. Should BS canonical string input be standardized on `YYYY/MM/DD` everywhere in public docs and helpers?
3. Should `BSDay.bs(2082, 1, 1)` be supported in addition to `BSDay.bs('2082/01/01')`?
4. Should `fromAD()` remain as a public documented API, or only a compatibility alias?
5. Should object/array BS input remain supported but undocumented?

---

## My Recommendation

If the top priority is developer adoption:

1. Make `bsday(...)` and `new BSDay(...)` the normal AD-like path
2. Add `bsday.bs(...)` and `BSDay.bs(...)` for BS input
3. Keep `toBS()` / `toAD()` as no-argument converters only
4. Make BS canonical string form `YYYY/MM/DD`
5. Keep old BS object/array input as compatibility only
6. Stop promoting `fromAD()` in docs

This gives the library the most familiar developer experience while still respecting BS as a first-class calendar.
