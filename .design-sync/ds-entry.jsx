// Design-system entry for design-sync.
//
// This repo is an application, not a published component library: package.json
// has no `main`/`module`/`exports`, so the converter has nothing to resolve and
// its synth-from-src fallback would sweep in every section — including the ones
// that call Supabase or need a router, which render empty in a preview card.
//
// So the barrel is explicit. What is listed here IS the design system: the
// components that render standalone and carry the visual language. Adding a
// component here also means adding it to `componentSrcMap` in config.json.

export { default as RippleButton } from '../src/components/RippleButton.jsx';
export { default as QualityScore } from '../src/components/QualityScore.jsx';
export { default as FloatingBg } from '../src/components/FloatingBg.jsx';
export { default as GlowCursor } from '../src/components/GlowCursor.jsx';

export { default as StatsSection } from '../src/components/StatsSection.jsx';
export { default as SocialProof } from '../src/components/SocialProof.jsx';
export { default as PainSection } from '../src/components/PainSection.jsx';
export { default as ServicesSection } from '../src/components/ServicesSection.jsx';
export { default as ProductsSection } from '../src/components/ProductsSection.jsx';
export { default as SolutionPreviewSection } from '../src/components/SolutionPreviewSection.jsx';

export { default as IhkaamFAQ } from '../src/components/IhkaamFAQ.jsx';
export { default as IhkaamByNumbers } from '../src/components/IhkaamByNumbers.jsx';
export { default as IhkaamTrustStats } from '../src/components/IhkaamTrustStats.jsx';
export { default as IhkaamAudiences } from '../src/components/IhkaamAudiences.jsx';
export { default as IhkaamDetailedFeatures } from '../src/components/IhkaamDetailedFeatures.jsx';
export { default as IhkaamSystemFeatures } from '../src/components/IhkaamSystemFeatures.jsx';
