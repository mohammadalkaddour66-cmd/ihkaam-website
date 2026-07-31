// FloatingBg is `fixed inset-0` ambience — drifting orbs at 0.06–0.12 opacity
// plus eight particles. Rendered alone it is a near-empty wash, which is the
// point: it only reads once real content sits on top of it. So the preview
// composes it the way Layout does — behind a heading on the canvas colour.
import { FloatingBg } from 'my-website';

export const BehindContent = () => (
  <div style={{
    position: 'relative', minHeight: 420, background: '#010D0D',
    overflow: 'hidden', direction: 'rtl',
  }}>
    <FloatingBg />
    <div style={{ position: 'relative', zIndex: 1, padding: '72px 48px' }}>
      <div style={{
        fontSize: 17, fontWeight: 700, color: '#6ABDB2', marginBottom: 20,
      }}>
        الذاكرة المؤسسية
      </div>
      <div style={{
        fontSize: 44, fontWeight: 900, color: '#EAE4DF',
        lineHeight: 1.38, letterSpacing: '-0.5px', maxWidth: 700,
      }}>
        معهدك يستحقّ ذاكرة<br />لا تُنسى.
      </div>
      <div style={{
        fontSize: 20, color: '#7A9E96', lineHeight: 1.75,
        marginTop: 20, maxWidth: 560,
      }}>
        التسميع والحضور والحلقات والتقارير — في مكان واحد يبقى بعد أن يتغيّر الأشخاص.
      </div>
    </div>
  </div>
);

// On the sand surface the same orbs read as warmth rather than depth.
export const OnSandSurface = () => (
  <div style={{
    position: 'relative', minHeight: 300, background: '#E5D3B3',
    overflow: 'hidden', direction: 'rtl',
  }}>
    <FloatingBg />
    <div style={{ position: 'relative', zIndex: 1, padding: '56px 48px' }}>
      <div style={{
        fontSize: 36, fontWeight: 800, color: '#010D0D',
        lineHeight: 1.45, letterSpacing: '-0.3px',
      }}>
        المعهد ليس مبنى،<br />ولا حلقات، ولا عدد طلاب.
      </div>
    </div>
  </div>
);
