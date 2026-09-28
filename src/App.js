import { useContext } from "react";
import { useLocation, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Toaster } from "react-hot-toast";
import { AuthContext } from "./context/AuthContext";
import "./dashboard.css";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotFound from "./pages/NotFound";
import Auth0ProtectedRoute from "./components/Auth0ProtectedRoute";

const Home = lazy(() => import("./pages/Home/Home"));
const Pricing = lazy(() => import("./pages/Pricing"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Docs = lazy(() => import("./pages/Document"));
const Support = lazy(() => import("./pages/Support"));
const Blog = lazy(() => import("./pages/Blog"));
const Integrations = lazy(() => import("./pages/Integrations"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const Features = lazy(() => import("./components/Features"));

const VideoReviews = lazy(() => import("./pages/Services/VideoReviews"));
const AudioReviews = lazy(() => import("./pages/Services/AudioReviews"));
const TextReviews = lazy(() => import("./pages/Services/TextReviews"));
const QRCodeCollection = lazy(() => import("./pages/Services/QRCodeCollection"));

const CarouselWidget = lazy(() => import("./pages/Widgets/CarouselWidget"));
const GridWidget = lazy(() => import("./pages/Widgets/GridWidget"));
const SpotlightWidget = lazy(() => import("./pages/Widgets/SpotlightWidget"));
const FloatingWidget = lazy(() => import("./pages/Widgets/FloatingWidget"));

const Login = lazy(() => import("./pages/Auth0Login"));
const Signup = lazy(() => import("./pages/Auth0Signup"));
const PublicReviews = lazy(() => import("./pages/PublicReviews"));
const RecordReview = lazy(() => import("./pages/RecordReview"));
const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const Moderation = lazy(() => import("./pages/Dashboard/Moderation"));
const Analytics = lazy(() => import("./pages/Dashboard/Analytics"));
const WidgetSettings = lazy(() => import("./pages/Dashboard/WidgetSettings"));
const Account = lazy(() => import("./pages/Dashboard/Account"));
const Billing = lazy(() => import("./pages/Dashboard/Billing"));
const GoogleReviews = lazy(() => import("./pages/Dashboard/GoogleReviews"));
const AdminSettings = lazy(() => import("./pages/Dashboard/AdminSettings"));
const BusinessDashboard = lazy(() => import("./pages/Dashboard/BusinessDashboard"));
const ComprehensiveOnboarding = lazy(() => import("./components/ComprehensiveOnboarding"));

const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
  </div>
);

function App() {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const isPublicRoute =
    location.pathname.startsWith("/record/") ||
    (!location.pathname.startsWith("/dashboard") &&
      !location.pathname.startsWith("/login") &&
      !location.pathname.startsWith("/create-business"));

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" reverseOrder={false} />
      {isPublicRoute && <Navbar />}
      <main className="flex-1 w-full">
        <Suspense fallback={<LoadingSpinner />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/features" element={<Features />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/docs" element={<Docs />} />
            <Route path="/support" element={<Support />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />

            <Route path="/services/video-reviews" element={<VideoReviews />} />
            <Route path="/services/audio-reviews" element={<AudioReviews />} />
            <Route path="/services/text-reviews" element={<TextReviews />} />
            <Route path="/services/qr-collection" element={<QRCodeCollection />} />

            <Route path="/widgets/carousel" element={<CarouselWidget />} />
            <Route path="/widgets/grid" element={<GridWidget />} />
            <Route path="/widgets/spotlight" element={<SpotlightWidget />} />
            <Route path="/widgets/floating" element={<FloatingWidget />} />

            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/create-business" element={<ComprehensiveOnboarding />} />
            <Route path="/record/:businessName" element={<RecordReview />} />
            <Route path="/:businessName" element={<PublicReviews />} />
            <Route
              path="/dashboard/*"
              element={
                <Auth0ProtectedRoute>
                  <DashboardLayout />
                </Auth0ProtectedRoute>
              }
            >
              <Route index element={<Analytics />} />
              <Route path="moderation" element={<Moderation />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="business/me" element={<BusinessDashboard />} />
              <Route path="widgets" element={<WidgetSettings />} />
              <Route path="account" element={<Account />} />
              <Route path="billing" element={<Billing />} />
              <Route path="google-reviews" element={<GoogleReviews />} />
              <Route path="settings" element={<AdminSettings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      {isPublicRoute && <Footer />}
    </div>
  );
}

export default App;