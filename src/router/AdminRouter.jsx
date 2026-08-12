import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AdminLayout } from "../layouts";
import { Auth, Users, Blog, Courses, Menu, Newsletter } from "../pages/admin";
import { useAuth } from "../hooks/useAuth";
import { RequireRole } from "./RequireRole";

export function AdminRouter() {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      {/* Ruta suelta para Auth */}
      <Route path="/" element={<Auth />} />

      {/* Rutas protegidas con AdminLayout */}
      <Route
        path="/"
        element={isAuthenticated ? <AdminLayout /> : <Navigate to="/admin" replace />}
      >
        <Route
          path="users"
          element={
            <RequireRole role="admin">
              <Users />
            </RequireRole>
          }
        />
        <Route
          path="blog"
          element={
            <RequireRole role="editor">
              <Blog />
            </RequireRole>
          }
        />
        <Route
          path="courses"
          element={
            <RequireRole role="editor">
              <Courses />
            </RequireRole>
          }
        />
        <Route
          path="menu"
          element={
            <RequireRole role="editor">
              <Menu />
            </RequireRole>
          }
        />
        <Route path="newsletter" element={<Newsletter />} />
      </Route>
    </Routes>
  );
}