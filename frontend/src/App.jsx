import { useState } from "react";
import axios from "axios";

// --- Icons (inline SVG components) ---
const SparkleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
  </svg>
);

const LoaderIcon = () => (
  <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
  </svg>
);

const ChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18l6-6-6-6"/>
  </svg>
);

const TrendDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>
  </svg>
);

// --- Badge component ---
const SentimentBadge = ({ sentiment }) => {
  const map = {
    positive: { bg: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30", label: "Positive" },
    negative: { bg: "bg-rose-500/15 text-rose-400 border-rose-500/30", label: "Negative" },
    neutral:  { bg: "bg-amber-500/15 text-amber-400 border-amber-500/30", label: "Neutral / Constructive" },
    constructive: { bg: "bg-amber-500/15 text-amber-400 border-amber-500/30", label: "Neutral / Constructive" },
  };
  const s = (sentiment || "neutral").toLowerCase();
  const style = map[s] || map.neutral;
  return (
    <span className={`inline-block text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded border ${style.bg}`}>
      {style.label}
    </span>
  );
};

// --- Card wrapper ---
const Card = ({ title, icon, children, className = "" }) => (
  <div className={`rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm overflow-hidden ${className}`}>
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/50">
      <h3 className="text-sm font-semibold text-slate-200 tracking-wide">{title}</h3>
      {icon && <span className="text-slate-500">{icon}</span>}
    </div>
    <div className="p-5">{children}</div>
  </div>
);

// --- Empty state ---
const EmptyState = () => (
  <div className="flex flex-col items-center justify-center h-full min-h-[320px] text-center px-6">
    <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center mb-4">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="1.5">
        <path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/>
      </svg>
    </div>
    <p className="text-slate-300 font-medium text-sm mb-1">No analysis running</p>
    <p className="text-slate-500 text-xs leading-relaxed max-w-xs">
      Paste a supervisor transcript on the left and click <span className="text-slate-400 font-medium">'Run Analysis'</span> to generate AI-powered rubric scores, evidence, and KPI mapping.
    </p>
  </div>
);

// --- Main App ---
export default function App() {
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setError("Please paste a supervisor transcript before running analysis.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const response = await axios.post("http://localhost:3000/api/analyze", { transcript });
      setResult(response.data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to connect to the analysis server. Make sure the backend is running at localhost:3000."
      );
    } finally {
      setLoading(false);
    }
  };

  const hasResult = !!result;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100" style={{ fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif" }}>

      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      {/* Header */}
      <header className="border-b border-slate-700/60 bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <SparkleIcon />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 leading-tight">Supervisor Feedback Analyzer</h1>
              <p className="text-[10px] text-slate-500 hidden sm:block">Analyze DeepThought Fellow supervisor transcripts using AI</p>
            </div>
          </div>
          <span className="text-[10px] text-slate-600 font-medium tracking-widest uppercase hidden sm:block">Enterprise AI Suite</span>
        </div>
      </header>

      {/* Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">

          {/* ── Left Panel ── */}
          <div className="w-full lg:w-[360px] xl:w-[400px] flex-shrink-0 flex flex-col gap-4">
            <div className="rounded-xl border border-slate-700/60 bg-slate-800/50 backdrop-blur-sm overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-700/50 flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
                </svg>
                <h3 className="text-sm font-semibold text-slate-200 tracking-wide">Supervisor Transcript</h3>
              </div>
              <div className="p-4">
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder="Paste supervisor transcript here..."
                  rows={14}
                  className="w-full resize-none rounded-lg bg-slate-900/70 border border-slate-700/60 text-slate-300 text-sm placeholder-slate-600 px-4 py-3 outline-none focus:border-indigo-500/70 focus:ring-1 focus:ring-indigo-500/30 transition-all leading-relaxed"
                  style={{ fontFamily: "'DM Mono', monospace", fontSize: "12.5px" }}
                />

                {error && (
                  <div className="mt-3 rounded-lg bg-rose-500/10 border border-rose-500/30 px-3 py-2.5 text-xs text-rose-400 leading-relaxed">
                    {error}
                  </div>
                )}

                <button
                  onClick={handleAnalyze}
                  disabled={loading}
                  className="mt-3 w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-500 text-white text-sm font-semibold py-2.5 px-4 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:shadow-none"
                >
                  {loading ? (
                    <>
                      <LoaderIcon />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <SparkleIcon />
                      Run Analysis
                    </>
                  )}
                </button>

                <p className="mt-3 text-center text-[10px] text-slate-600">
                  Powered by Enterprise AI Analytics Engine
                </p>
              </div>
            </div>
          </div>

          {/* ── Right Panel ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-5">

            {!hasResult && !loading && <EmptyState />}

            {loading && (
              <div className="flex flex-col items-center justify-center min-h-[320px] gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-indigo-500/30 animate-ping" />
                  <div className="w-12 h-12 rounded-full border-2 border-t-indigo-500 border-slate-700/50 animate-spin" />
                </div>
                <p className="text-slate-500 text-sm">Running AI analysis...</p>
              </div>
            )}

            {hasResult && (
              <>
                {/* Card 1: Rubric Score */}
                <Card title="Rubric Score" icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
                }>
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-600/20 border border-indigo-500/30 flex flex-col items-center justify-center shadow-inner">
                      <span className="text-3xl font-bold text-indigo-300 leading-none">{result?.score?.value ?? "—"}</span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1">/ 10</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        {result?.score?.label && (
                          <span className="inline-block text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                            {result.score.label}
                          </span>
                        )}
                        {result?.score?.band && (
                          <span className="inline-block text-[10px] font-semibold tracking-widest uppercase px-2.5 py-1 rounded-full bg-indigo-500/15 text-indigo-400 border border-indigo-500/30">
                            {result.score.band}
                          </span>
                        )}
                      </div>
                      <p className="text-slate-400 text-xs leading-relaxed mb-2">
                        {result?.score?.justification || "No justification provided."}
                      </p>
                      {result?.score?.confidence && (
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest">
                          Confidence: <span className="text-slate-400">{result.score.confidence}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </Card>

                {/* Card 2: Extracted Evidence */}
                <Card title="Extracted Evidence" icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                }>
                  {(() => { const evList = result?.evidence || result?.extracted_evidence || []; return evList.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {evList.map((ev, i) => (
                        <div key={i} className="rounded-lg bg-slate-900/50 border border-slate-700/40 px-4 py-3">
                          <p className="text-slate-300 text-xs italic leading-relaxed mb-2">
                            "{ev.quote || ev.text || ev}"
                          </p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <SentimentBadge sentiment={ev.signal || ev.sentiment || "neutral"} />
                            {ev.dimension && (
                              <span className="text-[10px] text-slate-500 uppercase tracking-widest">
                                {ev.dimension.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
                          {ev.interpretation && (
                            <p className="text-slate-500 text-xs leading-relaxed mt-2">{ev.interpretation}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No evidence extracted.</p>
                  ); })()}
                </Card>

                {/* Card 3: KPI Mapping */}
                <Card title="KPI Mapping" icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>
                }>
                  {(() => { const kpiList = result?.kpiMapping || result?.kpi_mapping || []; return kpiList.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {kpiList.map((kpi, i) => (
                        <div key={i} className="rounded-lg bg-slate-900/50 border border-slate-700/40 px-4 py-3">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1 rounded-full bg-slate-700/60 border border-slate-600/50 text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />
                              {kpi.kpi || kpi.name || kpi.label}
                            </span>
                            {kpi.systemOrPersonal && (
                              <span className={`text-[10px] font-semibold tracking-widest uppercase px-2 py-0.5 rounded border ${
                                kpi.systemOrPersonal === "system"
                                  ? "bg-teal-500/15 text-teal-400 border-teal-500/30"
                                  : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                              }`}>
                                {kpi.systemOrPersonal}
                              </span>
                            )}
                          </div>
                          {kpi.evidence && (
                            <p className="text-slate-500 text-xs leading-relaxed">{kpi.evidence}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No KPIs mapped.</p>
                  ); })()}
                </Card>

                {/* Card 4: Gap Analysis */}
                <Card title="Gap Analysis" icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                }>
                  {result?.gaps?.length > 0 ? (
                    <div className="flex flex-col gap-3">
                      {result.gaps.map((gap, i) => (
                        <div key={i} className="flex gap-3 items-start">
                          <div className="mt-0.5 flex-shrink-0"><TrendDown /></div>
                          <div>
                            <p className="text-slate-200 text-xs font-semibold mb-0.5 capitalize">
                              {(gap.dimension || gap.title || gap.name || "").replace(/_/g, " ")}
                            </p>
                            {gap.detail && (
                              <p className="text-slate-500 text-xs leading-relaxed">{gap.detail}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No gaps identified.</p>
                  )}
                </Card>

                {/* Card 5: Suggested Follow-up Questions */}
                <Card title="Suggested Follow-up Questions" icon={
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                }>
                  {(() => { const qList = result?.followUpQuestions || result?.follow_up_questions || result?.suggested_questions || []; return qList.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {qList.map((q, i) => (
                        <div key={i} className="rounded-lg bg-slate-900/40 border border-slate-700/40 px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-slate-300 text-xs leading-relaxed flex-1">
                              {typeof q === "string" ? q : q.question || q.text || JSON.stringify(q)}
                            </p>
                            <span className="text-slate-600 flex-shrink-0 mt-0.5">
                              <ChevronRight />
                            </span>
                          </div>
                          {(q.targetGap || q.target_gap) && (
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">
                              Gap: <span className="text-slate-400">{(q.targetGap || q.target_gap).replace(/_/g, " ")}</span>
                            </p>
                          )}
                          {(q.lookingFor || q.looking_for) && (
                            <p className="text-slate-500 text-xs leading-relaxed mt-1 italic">{q.lookingFor || q.looking_for}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-500 text-xs">No follow-up questions generated.</p>
                  ); })()}
                </Card>
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-10 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-[10px] text-slate-600">© 2024 DeepThought Fellow Supervisor Intelligence</p>
          <div className="flex gap-4 text-[10px] text-slate-600">
            <a href="#" className="hover:text-slate-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-slate-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
