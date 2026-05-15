import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/UserDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import AdminCatalog from "./pages/AdminCatalog";
import BookDetails from "./pages/BookDetails";
import CollectionView from "./pages/CollectionView";
import Profile from "./pages/ProfilePage";
import { BookStoreProvider } from "./context/BookStoreContext";
import "./App.css";

function PrivateRoute({ children, adminOnly = false, allowAdmin = false }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && role !== "admin") return <Navigate to="/dashboard" replace />;
  if (!adminOnly && !allowAdmin && role === "admin") return <Navigate to="/admin" replace />;

  return children;
}

export default function App() {
  return (
    <BookStoreProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/book/:id"
            element={
              <PrivateRoute>
                <BookDetails />
              </PrivateRoute>
            }
          />

          <Route
            path="/collection/:id"
            element={
              <PrivateRoute>
                <CollectionView />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <PrivateRoute adminOnly>
                <AdminDashboard />
              </PrivateRoute>
            }
          />

          <Route
            path="/admin/books"
            element={
              <PrivateRoute adminOnly>
                <AdminCatalog />
              </PrivateRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <PrivateRoute allowAdmin>
                <Profile />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </BookStoreProvider>
  );
}