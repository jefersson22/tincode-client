import { Outlet } from "react-router-dom";
import { TopBar } from "../../components/TopBar";
import { Footer } from "../../components/Footer";
import "./ClientLayout.scss";

export function ClientLayout() {
  return (
    <div className="tc-client-layout">
      <TopBar />
      <main className="tc-client-layout_main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}