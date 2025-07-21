import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
import { BASE_URL } from "./api/api";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Pages
import Login from "./pages/Login";
import Home from "./pages/Home";
import Ticket from "./pages/Ticket";
import User from "./pages/User";
import Timesheet from "./pages/Timesheet";
import Employee from "./pages/Employee";
import Setting from "./pages/Setting";
import Reports from "./pages/Reports";
import Help from "./pages/Help";
import OrganizationDetails from "./pages/setting/OrganizationDetails";
import Parameters from "./pages/setting/Parameters";
import ProjectListForm from "./pages/masters/ProjectListForm";
import CategoryForm from "./pages/masters/CategoryForm";
import DepartmentForm from "./pages/masters/DepartmentForm";
import StatusForm from "./pages/masters/StatusForm";
import PriorityForm from "./pages/masters/PriorityForm";
import MyTickets from "./pages/employee/MyTickets";
import MyTimesheet from "./pages/employee/MyTimesheet";
import E_home from "./pages/employee/E_home";

// Client Pages
import ClientHome from "./pages/client/ClientHome";
import Client_Ticket from "./pages/client/ClientTicket";

const ProtectedRoute = ({ isAuthenticated, role, allowedRoles, children }) => {
  return isAuthenticated && allowedRoles.includes(role) ? (
    children
  ) : (
    <Navigate to="/login" />
  );
};

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("role");

      if (!token || !role) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error("Invalid token");

        await res.json();
        setIsAuthenticated(true);
        setRole(role);
      } catch (err) {
        console.error("Token verification failed:", err);
        localStorage.clear();
        setIsAuthenticated(false);
        setRole("");
      }

      setLoading(false);
    };

    checkToken();
  }, []);

  if (loading) return <div>Loading...</div>;

  const hideHeaderFooter = location.pathname === "/login";
  const layoutOffsetHeight = 60 + 2.5 * 37.8 + 0.5 * 37.8; // Header + tab space

  return (
    <Box
      sx={{
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f9f9f9",
      }}
    >
      {!hideHeaderFooter && (
        <>
          <Box
            sx={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1200,
              bgcolor: "#fff",
              boxShadow: 1,
            }}
          >
            <Header
              role={role}
              setIsAuthenticated={setIsAuthenticated}
              setRole={setRole}
            />
          </Box>

          <Box
            sx={{
              position: "fixed",
              top: "60px",
              left: 0,
              right: 0,
              height: "2.5cm",
              bgcolor: "white",
              zIndex: 1100,
            }}
          />
        </>
      )}

      <Box
        sx={{
          flex: "1 1 auto",
          mt: hideHeaderFooter ? 0 : `${layoutOffsetHeight}px`,
          height: hideHeaderFooter
            ? "100vh"
            : `calc(100vh - ${layoutOffsetHeight}px)`,
          overflow: "hidden",
          px: 2,
          pb: 6,
        }}
      >
        <Routes>
          <Route
            path="/login"
            element={
              <Login
                onLogin={(r) => {
                  localStorage.setItem("role", r);
                  setIsAuthenticated(true);
                  setRole(r);
                }}
              />
            }
          />

          {/* Admin Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ticket"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <Ticket />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <User />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timesheet"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <Timesheet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <Employee />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <Setting />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting/organization-details"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <OrganizationDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/setting/parameters"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <Parameters />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/project-list"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <ProjectListForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/category"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <CategoryForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/department"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <DepartmentForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/status"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <StatusForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/masters/priority"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <PriorityForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/help"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["admin"]}
              >
                <Help />
              </ProtectedRoute>
            }
          />

          {/* Employee Routes */}
          <Route
            path="/employee/e_home"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["employee"]}
              >
                <E_home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/my-tickets"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["employee"]}
              >
                <MyTickets />
              </ProtectedRoute>
            }
          />
          <Route
            path="/employee/my-timesheet"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["employee"]}
              >
                <MyTimesheet />
              </ProtectedRoute>
            }
          />

          {/* Client Routes */}
          <Route
            path="/client/e_home"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["client"]}
              >
                <ClientHome />
              </ProtectedRoute>
            }
          />
          <Route
            path="/client/my-tickets"
            element={
              <ProtectedRoute
                isAuthenticated={isAuthenticated}
                role={role}
                allowedRoles={["client"]}
              >
                <Client_Ticket />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Box>

      {!hideHeaderFooter && <Footer />}
    </Box>
  );
}

export default App;
