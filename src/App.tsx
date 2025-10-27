import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { LoginPage } from "./pages/auth/LoginPage";
import { OTPVerificationPage } from "./pages/auth/OTPVerificationPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordSentPage } from "./pages/auth/ResetPasswordSentPage";
import { PasswordUpdatedPage } from "./pages/auth/PasswordUpdatedPage";
import { EmailVerifiedPage } from "./pages/auth/EmailVerifiedPage";
import { FacilitiesPage } from "./pages/facilities/FacilitiesPage";
import { CreateFacilityPage } from "./pages/facilities/CreateFacilityPage";
import { EditFacilityPage } from "./pages/facilities/EditFacilityPage";
import { StaffPage } from "./pages/staff/StaffPage";
import { CreateStaffPage } from "./pages/staff/CreateStaffPage";
import { EditStaffPage } from "./pages/staff/EditStaffPage";
import { FormEntriesPage } from "./pages/form-entries/FormEntriesPage";
import { FormEntryDetailPage } from "./pages/form-entries/FormEntryDetailPage";
import { RolesPage } from "./pages/roles/RolesPage";
import { QuoteFormPage } from "./pages/quote/QuoteFormPage";
import { ThankYouPage } from "./pages/quote/ThankYouPage";
import { ProfilePage } from "./pages/ProfilePage";
import { PromotionsPage } from "./pages/promotions/PromotionsPage";
import { PromotionDetailPage } from "./pages/promotions/PromotionDetailPage";
import SetPasswordPage from "./pages/auth/SetPasswordPage";
import SetPasswordSuccessPage from "./pages/auth/SetPasswordSuccessPage";
import { EmailCustomisationPage } from "./pages/email-customisation/EmailCustomisationPage";
import { LoggingPage } from "./pages/logging/LoggingPage";

import ProtectedRoute from "@/components/ProtectedRoute";
import { AuthProvider } from "@/context/AuthContext";
import { ConfirmationProvider } from "@/components/ui/useConfirmation";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <ConfirmationProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/login" element={<LoginPage />} />
              <Route path="/auth/otp-verification" element={<OTPVerificationPage />} />
              <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset-password-sent" element={<ResetPasswordSentPage />} />
              <Route path="/auth/password-updated" element={<PasswordUpdatedPage />} />
              <Route path="/auth/email-verified" element={<EmailVerifiedPage />} />
              <Route path="/auth/set-password" element={<SetPasswordPage />} />
			  <Route path="/auth/set-password-success" element={<SetPasswordSuccessPage />} />

              {/* Protected Routes */}
              <Route
                path="/facilities"
                element={
                  <ProtectedRoute>
                    <FacilitiesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/create"
                element={
                  <ProtectedRoute>
                    <CreateFacilityPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/facilities/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditFacilityPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/staff"
                element={
                  <ProtectedRoute>
                    <StaffPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/create"
                element={
                  <ProtectedRoute>
                    <CreateStaffPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/staff/:id/edit"
                element={
                  <ProtectedRoute>
                    <EditStaffPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/quote-requests"
                element={
                  <ProtectedRoute>
                    <FormEntriesPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/form-entries/:id"
                element={
                  <ProtectedRoute>
                    <FormEntryDetailPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/roles"
                element={
                  <ProtectedRoute>
                    <RolesPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/promotions"
                element={
                  <ProtectedRoute>
                    <PromotionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/promotions/:id"
                element={
                  <ProtectedRoute>
                    <PromotionDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* Public Quote pages */}
              <Route path="/quote/:countryCode/:lng?" element={<QuoteFormPage />} />
              <Route path="/quote/thank-you/:id?/:lng?" element={<ThankYouPage />} />

              {/* Extra Routes (Protected if needed) */}
              <Route
                path="/email-customisation"
                element={
                  <ProtectedRoute>
                    <EmailCustomisationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/logging"
                element={
                  <ProtectedRoute>
                    <LoggingPage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </ConfirmationProvider>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
