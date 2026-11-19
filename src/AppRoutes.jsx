import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout        from './components/layout/Layout'
import Home          from './pages/Home'
import NotFoundPage  from './pages/NotFoundPage'
import ProtectedRoute from './components/layout/ProtectedRoute'
import ErrorBoundary  from './components/layout/ErrorBoundary'

const IhkaamSaaS            = lazy(() => import('./pages/IhkaamSaaS'))
const AboutPage              = lazy(() => import('./pages/AboutPage'))
const ContactPage            = lazy(() => import('./pages/ContactPage'))
const AdminDashboard         = lazy(() => import('./pages/AdminDashboard'))
const AdminLogin             = lazy(() => import('./pages/AdminLogin'))
const ReviewPage             = lazy(() => import('./pages/ReviewPage'))
const CheckoutPage           = lazy(() => import('./pages/CheckoutPage'))
const TermsPage              = lazy(() => import('./pages/TermsPage'))
const PrivacyPage            = lazy(() => import('./pages/PrivacyPage'))
const FeatureDetailPage      = lazy(() => import('./pages/FeatureDetailPage'))
const HelpCenter             = lazy(() => import('./pages/HelpCenter'))
const HelpCategory           = lazy(() => import('./pages/HelpCategory'))
const HelpArticle            = lazy(() => import('./pages/HelpArticle'))
const BlogList                = lazy(() => import('./pages/BlogList'))
const BlogArticle             = lazy(() => import('./pages/BlogArticle'))
const RequestPage             = lazy(() => import('./pages/RequestPage'))
/* معاينة الهوية — للتطوير فقط. import.meta.env.DEV ثابتٌ وقت البناء، فيُحذف
   الاستيراد والمسار معاً من حزمة الإنتاج ولا تُنشأ لها حزمةٌ أصلاً.
   (تقرير التحليل ISS-38: المسار كان مكشوفاً في الإنتاج). */
const IdentityLab = import.meta.env.DEV
  ? lazy(() => import('./pages/IdentityLab'))
  : null

function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#F8F5EC' }}>
      <div
        className="w-8 h-8 rounded-full animate-spin"
        style={{ border: '3px solid rgba(31, 111, 82, 0.20)', borderTopColor: '#1F6F52' }}
        role="status"
        aria-label="جارٍ التحميل"
      />
    </div>
  )
}

/* الشجرة بلا موجِّه: App.jsx يلفّها بـBrowserRouter في المتصفح، وentry-server.jsx
   يلفّها بـStaticRouter عند التوليد المسبق للصفحات (scripts/prerender.mjs). */
export default function AppRoutes() {
  return (
    <>
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          <Routes>

            {/* ── Public routes — all share the Layout shell ── */}
            <Route element={<Layout />}>
              <Route index           element={<Home />}          />
              <Route path="/ihkaam"                      element={<IhkaamSaaS />}        />
              <Route path="/ihkaam/features/:slug"       element={<FeatureDetailPage />}  />
              <Route path="/ihkaam/addons/:slug"         element={<FeatureDetailPage />}  />
              <Route path="/about"                       element={<AboutPage />}          />
              <Route path="/contact" element={<ContactPage />}  />
              <Route path="/review"  element={<ReviewPage />}  />
              <Route path="/terms"   element={<TermsPage />}   />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/blog"          element={<BlogList />}    />
              <Route path="/blog/:slug"    element={<BlogArticle />} />
              <Route path="/request"           element={<RequestPage />} />
              <Route path="/help"                    element={<HelpCenter />}  />
              <Route path="/help/category/:catId"  element={<HelpCategory />} />
              <Route path="/help/:slug"            element={<HelpArticle />} />
            </Route>

            {/* ── معاينة الهوية — للتطوير فقط، بلا Layout ── */}
            {IdentityLab && <Route path="/identity" element={<IdentityLab />} />}

            {/* ── Checkout — isolated, no Layout wrapper (focused flow) ── */}
            <Route path="/checkout" element={<CheckoutPage />} />

            {/* ── Admin routes — isolated, no Layout wrapper ── */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>

            {/* ── Catch-all ── */}
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Suspense>
      </ErrorBoundary>
    </>
  )
}
