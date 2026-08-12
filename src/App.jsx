import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { WebRouter } from "./router/WebRouter";
import { AdminRouter } from "./router/AdminRouter";
import { useAuth } from "./hooks/useAuth";

function AppContent() {
  const { checkingSession } = useAuth();

  if (checkingSession) {
    return (
      <div style={{ padding: 40, textAlign: "center", fontSize: "18px", fontWeight: "600" }}>
        Cargando sesión...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/*" element={<WebRouter />} />
        <Route path="/admin/*" element={<AdminRouter />} />
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}