import { FooterInfo } from "./FooterInfo";
import { FooterMenu } from "./FooterMenu";
import { FooterNewsletter } from "./FooterNewsletter";
import "./Footer.scss";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="tc-footer">
      <div className="tc-footer_inner">
        <FooterInfo />
        <FooterMenu />
        <FooterNewsletter />
      </div>
      <div className="tc-footer_bottom">
        <span>© {year} TinCode. Todos los derechos reservados.</span>
        <span className="tc-footer_bottom-mono">{"<hecho con código y café/>"}</span>
      </div>
    </footer>
  );
}