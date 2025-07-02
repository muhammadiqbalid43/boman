import { lazy, Suspense } from "react";
import { Route, Routes } from "react-router";
import { LoadingSpinner } from "../components/loading.tsx";
import ProtectedRoute from "../features/auth/components/protected-route.tsx";

const HomePage = lazy(() => import("../pages/home-page.tsx"));

const SignInPage = lazy(() => import("../pages/sign-in-page.tsx"));
const SignUpPage = lazy(() => import("../pages/sign-up-page.tsx"));

const DashboardPage = lazy(() => import("../pages/dashboard-page.tsx"));

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardPage />} />
        </Route>
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
