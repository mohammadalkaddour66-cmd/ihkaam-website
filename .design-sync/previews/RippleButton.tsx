// RippleButton ships the interaction (magnetic pull + click ripple); the LOOK
// comes from the same `btn-cta` / `btn-outline` classes the site puts on plain
// elements everywhere else. Both are shown together on purpose: the class is
// the idiom to copy, the component is what makes it feel alive.
import { RippleButton } from 'my-website';

const row: React.CSSProperties = {
  display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap',
  padding: 28, background: '#010D0D', direction: 'rtl',
};

export const PrimaryCta = () => (
  <div style={row}>
    <RippleButton className="btn-cta inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5">
      ابدأ تجربتك المجانية
    </RippleButton>
  </div>
);

export const Outline = () => (
  <div style={row}>
    <RippleButton className="btn-outline inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5">
      شاهد العرض التوضيحي
    </RippleButton>
  </div>
);

export const SideBySide = () => (
  <div style={row}>
    <RippleButton className="btn-cta inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5">
      اطلب عرضاً
    </RippleButton>
    <RippleButton className="btn-outline inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5">
      تواصل معنا
    </RippleButton>
  </div>
);

// `as` swaps the rendered tag — a nav CTA is an anchor, not a button.
export const AsLink = () => (
  <div style={row}>
    <RippleButton
      as="a"
      href="#"
      className="btn-cta inline-flex items-center gap-2.5 rounded-xl px-7 py-3.5 no-underline"
    >
      الرابط في البايو
    </RippleButton>
  </div>
);
