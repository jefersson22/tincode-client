import { Routes, Route } from "react-router-dom";
import { Home, Blog, Post, Courses, Contact } from "../pages/web";
import { Terms, Privacy, CookiesPolicy } from "../pages/web/Legal";
import { ClientLayout } from "../layouts";

export function WebRouter() {
  return (
    <Routes>
      <Route path="/" element={<ClientLayout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:id" element={<Post />} />
        <Route path="courses" element={<Courses />} />
        <Route path="contact" element={<Contact />} />
        
        {/* Páginas legales, enlazadas desde el footer */}
        <Route path="terminos" element={<Terms />} />
        <Route path="privacidad" element={<Privacy />} />
        <Route path="cookies" element={<CookiesPolicy />} />
      </Route>
    </Routes>
  );
}