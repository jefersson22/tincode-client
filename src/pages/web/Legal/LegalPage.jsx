import "./LegalPage.scss";

/**
 * props:
 * - title: string
 * - updatedAt: string (ej: "3 de agosto, 2026")
 * - sections: [{ heading: string, body: string | string[] }]
 */
export function LegalPage({ title, updatedAt, sections }) {
  return (
    <div className="tc-legal">
      <div className="tc-legal_inner">
        <span className="tc-legal_eyebrow">// legal</span>
        <h1>{title}</h1>
        <p className="tc-legal_updated">Última actualización: {updatedAt}</p>
        
        <div className="tc-legal_content">
          {sections.map((section, i) => (
            <section key={i} className="tc-legal_section">
              <h2>{section.heading}</h2>
              {Array.isArray(section.body) ? (
                section.body.map((p, j) => <p key={j}>{p}</p>)
              ) : (
                <p>{section.body}</p>
              )}
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}