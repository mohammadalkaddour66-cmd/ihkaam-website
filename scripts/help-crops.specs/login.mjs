/* مواصفة اقتطاعات شرح «تسجيل الدخول»: شاشة الدخول قبل الدخول. */
export default {
  slug: 'login',
  title: 'بوابة الدخول',
  public: true,
  url: 'https://demo.ihkaam.app',
  steps: {
    2: { targets: ['field:اسم المستخدم'], pad: [24, 24] },
    3: { targets: ['field:كلمة المرور'], pad: [24, 24] },
    4: { targets: ['el:تسجيل الدخول للنظام'], pad: [24, 24] },
  },
}
