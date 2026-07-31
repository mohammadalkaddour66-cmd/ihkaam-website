# Building with Ihkaam

Arabic-first, RTL-native, dark. Every component here ships its own Arabic copy and lays out right-to-left. Treat that as the default, not a variant.

## Setup — no provider, but three things are mandatory

There is no theme provider or root wrapper to import. Components are self-contained. What they *do* assume:

```jsx
<div dir="rtl" style={{ fontFamily: "'Cairo', sans-serif", background: '#010D0D' }}>
  <ProductsSection />
</div>
```

1. **`dir="rtl"`** — omit it and every layout mirrors wrong.
2. **Cairo** — the one custom token is `--font-arabic: 'Cairo', sans-serif`. The `@font-face` rules ship with this system (arabic, latin, latin-ext subsets, weights 300–900).
3. **A dark canvas underneath** — components are transparent-backed and assume `#010D0D`. On white they read as broken.

## The styling idiom — Tailwind v4 with literal hex, not color tokens

**This system has no color tokens.** There is no `--color-surface`, no `bg-surface-1`. The palette lives as Tailwind arbitrary values with literal hex inside the components. Write your own layout glue the same way — invented token names will not resolve and will silently render unstyled.

```jsx
<div className="bg-[#011A1A] text-[#EAE4DF] border border-[rgba(2,115,104,0.16)]">
```

The palette, verbatim:

| Role | Value |
|---|---|
| Canvas | `#010D0D` |
| Surface (card face) | `#011A1A` |
| Surface (elevated) | `#012424` |
| Sand (light surface) | `#E5D3B3` |
| Text primary | `#EAE4DF` |
| Text secondary | `#7A9E96` |
| Text tertiary | `#5A8A78` |
| Turquoise accent | `#6ABDB2` (hover `#7ECDC3`) |
| Rose accent | `#D9ACA3` |
| Clay accent | `#A6756A` |
| Border default | `rgba(2,115,104,0.16)` |
| Border hover | `rgba(106,189,178,0.28)` |

## The class vocabulary — 13 real classes

These are defined in the shipped stylesheet. Use them; do not reimplement their look with utilities.

| Class | What it is |
|---|---|
| `bento` | The core card atom — `#011A1A`, 1px teal border, 20px radius. Hover lifts 3px and the border glows. Solid surface, **not** glassmorphism — never add `backdrop-blur`. |
| `card-glass` | Alias of `bento`, kept for older sections. Prefer `bento` in new work. |
| `btn-cta` | Primary action — turquoise fill, dark text, lifts 2px on hover. |
| `btn-outline` | Secondary action — 1.5px teal border, teal text. |
| `text-rose-grad` | Sand→rose→clay gradient clipped to text. For one or two words inside a heading, never a whole line. |
| `pattern-dots` | 32px teal dot-grid texture. |
| `divider` | 1px gradient rule (fades `to left` — RTL). |
| `orb-a` `orb-b` `orb-c` | Slow ambient drift, 14–20s. Opacity stays 0.05–0.18. |
| `particle` | Floating dot; reads `--dur` and `--delay`. |
| `snake-rect` | Travelling glow arc on an SVG rect; reads `--snake-dur`. |
| `animate-ripple` | 0.65s click ripple. `RippleButton` applies it for you. |

Motion elsewhere is `400ms ease-out`, cards lift `-3px`, buttons `-2px`. Keep it slow — nothing snaps.

## Buttons: the class is the idiom, the component is optional

Most of the site puts `btn-cta` directly on a plain `<button>`. `RippleButton` adds a magnetic pull and click ripple and takes the same class:

```jsx
<RippleButton className="btn-cta inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5">
  ابدأ تجربتك المجانية
</RippleButton>
```

It accepts `children`, `className`, `style`, `onClick`, and `as` (swap the tag — use `as="a"` for links). Everything else forwards to the tag.

## Where the truth lives

Read `styles.css` and its `@import` closure before styling anything — it carries the compiled utilities, the custom classes above, and the `@font-face` rules. Per-component API notes are in each component's `.prompt.md`.

## Two components need composing, not calling

- **`FloatingBg`** is `fixed inset-0` ambience. It renders as near-nothing alone — put it behind content on a dark surface, with your content at `position: relative; z-index: 1`.
- **`GlowCursor`** follows the pointer and is invisible until the mouse moves. Drop it in once at page level; it has no static appearance.

`IhkaamByNumbers` and `IhkaamTrustStats` fetch their own figures at runtime and take no props — they render zeros when no data source is reachable. That is expected, not a bug to design around.

## One idiomatic composition

```jsx
<section dir="rtl" className="bg-[#010D0D] px-6 py-24">
  <div className="mx-auto max-w-5xl">
    <div className="mb-5 text-[17px] font-bold text-[#6ABDB2]">الذاكرة المؤسسية</div>
    <h2 className="text-[44px] font-black leading-[1.38] tracking-[-0.5px] text-[#EAE4DF]">
      معهدك يستحقّ <span className="text-rose-grad">ذاكرة لا تُنسى</span>.
    </h2>
    <div className="divider my-8" />
    <div className="grid gap-5 md:grid-cols-3">
      <div className="bento p-7">
        <div className="text-[25px] font-extrabold text-[#EAE4DF]">التسميع</div>
        <p className="mt-2 text-[19px] leading-[1.7] text-[#7A9E96]">
          سجلّ كامل لكل طالب، جاهز للتصدير.
        </p>
      </div>
    </div>
  </div>
</section>
```
