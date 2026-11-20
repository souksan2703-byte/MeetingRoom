
import { Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

import Login from "./pages/auth/Login";
import Dashboard from "./pages/Dashboard";
import Bookings from "./pages/Bookings";
import MainLayout from "./components/layout/MainLayout";

// ກວດສອບການ Login ແລະສະແດງ Layout ຮ່ວມກັນ
function ProtectedLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* ໜ້າ Login */}
      <Route
        path="/login"
        element={
          isAuthenticated
            ? <Navigate to="/" replace />
            : <Login />
        }
      />

      {/* ໜ້າທີ່ຕ້ອງ Login */}
      <Route element={<ProtectedLayout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
      </Route>

      {/* ເສັ້ນທາງທີ່ບໍ່ມີ */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
