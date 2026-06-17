/**
 * Temporary placeholder for Phase 0 verification.
 * Replaced with the real Dashboard in Phase 4a.
 */
export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-canvas p-32">
      <div className="bg-paper rounded-md p-32 max-w-3xl mx-auto">
        <h1
          className="text-carbon mb-16"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: "32px",
            fontWeight: 600,
            letterSpacing: "-0.64px",
            lineHeight: 1.19,
          }}
        >
          Suburban Toppers CRM
        </h1>
        <p className="text-graphite mb-24" style={{ fontSize: "16px", lineHeight: 1.38 }}>
          Phase 0 scaffold verified. The app shell, design tokens, and font
          loading are working. Real pages land in Phase 1+.
        </p>
        <div className="grid grid-cols-4 gap-20">
          <div className="bg-mist rounded-md p-24">
            <p className="text-slate mb-8" style={{ fontSize: "13px", fontWeight: 500 }}>Signal Orange</p>
            <div className="w-full h-12 rounded-md" style={{ background: "#ff682c" }} />
          </div>
          <div className="bg-mist rounded-md p-24">
            <p className="text-slate mb-8" style={{ fontSize: "13px", fontWeight: 500 }}>Carbon</p>
            <div className="w-full h-12 rounded-md" style={{ background: "#202020" }} />
          </div>
          <div className="bg-mist rounded-md p-24">
            <p className="text-slate mb-8" style={{ fontSize: "13px", fontWeight: 500 }}>Mist canvas</p>
            <div className="w-full h-12 rounded-md" style={{ background: "#efefef", border: "1px solid #e8e8e8" }} />
          </div>
          <div className="bg-mist rounded-md p-24">
            <p className="text-slate mb-8" style={{ fontSize: "13px", fontWeight: 500 }}>Paper</p>
            <div className="w-full h-12 rounded-md" style={{ background: "#ffffff", border: "1px solid #e8e8e8" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
