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

export { default as QualityScore } from '../src/components/unused/QualityScore.jsx';
export { default as FloatingBg } from '../src/components/layout/FloatingBg.jsx';

export { default as PainSection } from '../src/components/sections/PainSection.jsx';
export { default as SolutionPreviewSection } from '../src/components/sections/SolutionPreviewSection.jsx';

export { default as IhkaamFAQ } from '../src/components/ihkaam/IhkaamFAQ.jsx';
export { default as IhkaamByNumbers } from '../src/components/ihkaam/IhkaamByNumbers.jsx';
export { default as IhkaamTrustStats } from '../src/components/ihkaam/IhkaamTrustStats.jsx';
export { default as IhkaamAudiences } from '../src/components/ihkaam/IhkaamAudiences.jsx';
export { default as IhkaamDetailedFeatures } from '../src/components/unused/IhkaamDetailedFeatures.jsx';
export { default as IhkaamSystemFeatures } from '../src/components/ihkaam/IhkaamSystemFeatures.jsx';
