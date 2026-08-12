import { Outlet } from "react-router-dom";
import { TopBar } from "../../Components/TopBar";
import { Footer } from "../../Components/Footer";
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