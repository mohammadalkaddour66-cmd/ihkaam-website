import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useAffiliateRef } from './hooks/useAffiliateRef'
import Layout        from './components/Layout'
import Home          from './pages/Home'
import IhkaamSaaS   from './pages/IhkaamSaaS'
import AboutPage     from './pages/AboutPage'
import ContactPage   from './pages/ContactPage'
import AdminDashboard from './pages/AdminDashboard'
import AdminLogin    from './pages/AdminLogin'
import ProtectedRoute from './components/ProtectedRoute'
import ReviewPage         from './pages/ReviewPage'
import CheckoutPage       from './pages/CheckoutPage'
import TermsPage         from './pages/TermsPage'
import PrivacyPage       from './pages/PrivacyPage'
import FeatureDetailPage from './pages/FeatureDetailPage'
import HelpCenter        from './pages/HelpCenter'
import HelpCategory      from './pages/HelpCategory'
import HelpArticle       from './pages/HelpArticle'
import BlogList          from './pages/BlogList'
import BlogArticle       from './pages/BlogArticle'
import AffiliatePage          from './pages/AffiliatePage'
import RequestPage            from './pages/RequestPage'
import AffiliateTrackerPage   from './pages/AffiliateTrackerPage'
import NotFoundPage           from './pages/NotFoundPage'

/* Captures ?ref= on any page load and stores in sessionStorage */
function AffiliateCapture() {
  useAffiliateRef()
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AffiliateCapture />
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
          <Route path="/affiliate"         element={<AffiliatePage />} />
          <Route path="/request"           element={<RequestPage />} />
          <Route path="/partner"           element={<AffiliateTrackerPage />} />
          <Route path="/help"                    element={<HelpCenter />}  />
          <Route path="/help/category/:catId"  element={<HelpCategory />} />
          <Route path="/help/:slug"            element={<HelpArticle />} />
        </Route>

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
    </BrowserRouter>
  )
}
