import { useState, useEffect, useRef } from "react";
import { useTheme } from "../../theme/ThemeContext.js";

// ─── QUESTIONNAIRE DEFINITION ─────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: "objective",
    label: "What is the client's primary objective?",
    type: "choice",
    options: [
      { value: "capital_protection",  label: "Protect capital — accept lower yield",     icon: "🛡️" },
      { value: "yield_enhancement",   label: "Enhance yield — accept some downside risk", icon: "📈" },
      { value: "market_participation",label: "Participate in market upside",              icon: "🚀" },
      { value: "regular_income",      label: "Generate regular income",                   icon: "💰" },
    ],
  },
  {
    id: "risk_tolerance",
    label: "How much capital loss can the client tolerate?",
    type: "choice",
    options: [
      { value: "none",     label: "None — capital must be returned in full", icon: "🔒" },
      { value: "low",      label: "Up to 10–15%",                            icon: "⚡" },
      { value: "moderate", label: "Up to 25–35%",                            icon: "⚖️" },
      { value: "high",     label: "Full equity-like downside is acceptable",  icon: "🎯" },
    ],
  },
  {
    id: "underlying",
    label: "What underlying does the client prefer?",
    type: "choice",
    options: [
      { value: "smi",       label: "SMI Index (Swiss)",          icon: "🇨🇭" },
      { value: "stoxx",     label: "Euro Stoxx 50 (European)",   icon: "🇪🇺" },
      { value: "sp500",     label: "S&P 500 (US)",               icon: "🇺🇸" },
      { value: "single_ch", label: "Single Swiss stock",         icon: "📊" },
      { value: "basket",    label: "Worst-of basket (2–4 names)",icon: "🧺" },
    ],
  },
  {
    id: "yield_target",
    label: "What annual yield is the client looking for?",
    type: "choice",
    options: [
      { value: "low",    label: "2–4% — conservative",      icon: "🌱" },
      { value: "medium", label: "5–8% — moderate",          icon: "🌿" },
      { value: "high",   label: "9–14% — aggressive",       icon: "🌳" },
      { value: "any",    label: "No specific target",        icon: "❓" },
    ],
  },
  {
    id: "horizon",
    label: "What is the investment horizon?",
    type: "choice",
    options: [
      { value: "short",  label: "< 12 months",  icon: "⏱️" },
      { value: "medium", label: "1–2 years",     icon: "📅" },
      { value: "long",   label: "3–5 years",     icon: "🗓️" },
    ],
  },
  {
    id: "liquidity",
    label: "Does the client need liquidity before maturity?",
    type: "choice",
    options: [
      { value: "yes",    label: "Yes — may need to exit early",     icon: "🚪" },
      { value: "no",     label: "No — can hold to maturity",        icon: "✅" },
      { value: "maybe",  label: "Possibly — uncertain",             icon: "🤔" },
    ],
  },
];

// ─── PARAMETER DERIVATION (questionnaire path) ────────────────────────────────
function deriveParamsFromAnswers(answers) {
  const { objective, risk_tolerance, underlying, yield_target, horizon } = answers;

  // Product type
  let productType = "brc";
  if (objective === "capital_protection" || risk_tolerance === "none") productType = "cpn";
  else if (objective === "yield_enhancement" && risk_tolerance === "high") productType = "rc";
  else if (objective === "regular_income") productType = "autocall";
  else if (risk_tolerance === "moderate" || risk_tolerance === "low") productType = "brc";

  // Maturity
  const maturityMap = { short: 1, medium: 2, long: 3 };
  const maturity = maturityMap[horizon] ?? 2;

  // Barrier (brc/autocall)
  const barrierMap = { none: 80, low: 70, moderate: 60, high: 50 };
  const barrier = barrierMap[risk_tolerance] ?? 65;

  // Protection (cpn)
  const protectionMap = { none: 100, low: 95, moderate: 90, high: 80 };
  const protection = protectionMap[risk_tolerance] ?? 90;

  // Underlying
  const underlyingMap = {
    smi:       "^SSMI",
    stoxx:     "^STOXX50E",
    sp500:     "^SPX",
    single_ch: "NESN.SW",
    basket:    "^STOXX50E",
  };
  const underlyingId = underlyingMap[underlying] ?? "^STOXX50E";
  const basketMode = underlying === "basket";

  // Coupon target
  const couponMap = { low: 3.5, medium: 7, high: 12, any: 7 };
  const couponTarget = couponMap[yield_target] ?? 7;

  return { productType, maturity, barrier, protection, underlyingId, basketMode, couponTarget };
}

// ─── LLM INTERPRETATION ───────────────────────────────────────────────────────
async function interpretWithLLM(text) {
  const systemPrompt = `You are a structured products expert assistant. 
The RM will describe a client situation in natural language. 
Extract the relevant parameters and return ONLY a valid JSON object — no explanation, no markdown.

JSON schema:
{
  "productType": "cpn" | "rc" | "brc" | "autocall",
  "underlyingId": one of ["^SSMI","^STOXX50E","^SPX","^NDX","NESN.SW","NOVN.SW","ROG.SW","UBSG.SW","ABBN.SW","AAPL","MSFT","NVDA","JPM"],
  "basketMode": boolean,
  "maturity": number (1-5),
  "barrier": number (40-85, for brc/autocall),
  "protection": number (70-100, for cpn),
  "couponTarget": number (1-20),
  "rationale": string (1-2 sentences explaining the product choice in plain language for the RM)
}

Rules:
- Capital protection / no loss tolerance → cpn
- Regular income / autocall preference → autocall  
- High yield / equity-comfortable → rc or brc
- Barrier BRC if client wants some conditional protection
- If single stock mentioned, use closest ticker; if index, use ^STOXX50E as default
- maturity: <12m → 1, 1-2y → 2, 3y → 3, 4-5y → 4-5
- barrier: conservative client → 70-75, moderate → 60-65, aggressive → 50-55`;

  // Calls the local Vite proxy at /api/interpret which forwards to Anthropic
  // server-side — API key is never exposed in the browser.
  const response = await fetch("/api/interpret", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 500,
      system: systemPrompt,
      messages: [{ role: "user", content: text }],
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    const detail = data?.error?.message ?? data?.error ?? `HTTP ${response.status}`;
    throw new Error(detail);
  }

  const raw = data.content?.[0]?.text ?? "{}";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

// ─── PROGRESS DOTS ────────────────────────────────────────────────────────────
function ProgressDots({ total, current }) {
  const T = useTheme();
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      {Array.from({ length: total }, (_, i) => (
        <div key={i} style={{
          width: i === current ? 20 : 6, height: 6,
          borderRadius: 3,
          background: i < current ? T.teal : i === current ? T.teal : T.border,
          opacity: i > current ? 0.4 : 1,
          transition: "all 0.3s ease",
        }} />
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function IntentCapture({ onComplete }) {
  const T = useTheme();
  const [inputMode, setInputMode] = useState(null); // null | "questionnaire" | "freetext"
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [freeText, setFreeText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [llmResult, setLlmResult] = useState(null);

  const currentQ = QUESTIONS[step];

  // ── Questionnaire handlers ──
  const handleChoice = (questionId, value) => {
    const newAnswers = { ...answers, [questionId]: value };
    setAnswers(newAnswers);
    if (step < QUESTIONS.length - 1) {
      setTimeout(() => setStep(s => s + 1), 220);
    } else {
      const params = deriveParamsFromAnswers(newAnswers);
      onComplete({ source: "questionnaire", params, answers: newAnswers });
    }
  };

  const handleBack = () => {
    if (step > 0) setStep(s => s - 1);
    else setInputMode(null);
  };

  // ── Free text handler ──
  const handleFreetextSubmit = async () => {
    if (!freeText.trim()) return;
    setLoading(true);
    setError(null);
    setLlmResult(null);
    try {
      const result = await interpretWithLLM(freeText);
      setLlmResult(result);
    } catch (e) {
      const msg = e.message ?? "";
      if (msg.includes("ANTHROPIC_API_KEY")) {
        setError("API key not configured. Add ANTHROPIC_API_KEY=sk-ant-... to a .env file at the project root, then restart the dev server.");
      } else if (msg.includes("fetch") || msg.includes("NetworkError") || msg.includes("Failed to fetch")) {
        setError("Network error — make sure the Vite dev server is running (npm run dev) and ANTHROPIC_API_KEY is set in .env.");
      } else {
        setError(`Interpretation failed: ${msg || "unknown error"}. Please try again or use the questionnaire.`);
      }
    } finally {
      setLoading(false);
    }
  };

  const resultRef = useRef(null);

  const handleConfirmLLM = () => {
    if (!llmResult) return;
    onComplete({ source: "freetext", params: llmResult, rawText: freeText });
  };

  // Scroll result into view when it appears
  useEffect(() => {
    if (llmResult && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [llmResult]);

  // ── Mode selection screen ──────────────────────────────────────────────────
  if (!inputMode) {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 640, width: "100%", animation: "fadeUp .4s ease" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>🏗️</div>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: T.text, letterSpacing: "-.01em", marginBottom: 10 }}>
              Real Product Builder
            </h1>
            <p style={{ fontSize: 15, color: T.textMuted, lineHeight: 1.7, maxWidth: 440, margin: "0 auto" }}>
              Start by describing what your client wants to achieve. The builder will propose the right product structure.
            </p>
          </div>

          {/* Mode cards */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 32 }}>
            {[
              {
                mode: "questionnaire",
                icon: "📋",
                title: "Guided Questionnaire",
                desc: "Answer 6 quick questions about the client — objective, risk, underlying, yield, horizon.",
                time: "~2 min",
                color: T.teal,
              },
              {
                mode: "freetext",
                icon: "💬",
                title: "Describe in Natural Language",
                desc: "Type or paste a client brief. The AI interprets it and derives the product parameters.",
                time: "~30 sec",
                color: T.gold,
              },
            ].map(card => (
              <button key={card.mode} onClick={() => setInputMode(card.mode)}
                style={{ textAlign: "left", padding: 0, background: "none", border: "none", cursor: "pointer" }}>
                <div className="card" style={{ height: "100%", transition: "all 0.2s", border: `1px solid ${T.border}` }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = card.color; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = `0 8px 24px ${card.color}20`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,.2)"; }}>
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{card.icon}</div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: T.text, marginBottom: 8 }}>{card.title}</div>
                  <div style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.7, marginBottom: 14 }}>{card.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 11, color: card.color, fontWeight: 600, padding: "3px 10px", borderRadius: 10, background: `${card.color}18` }}>{card.time}</span>
                    <span style={{ fontSize: 13, color: card.color }}>→</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Skip link */}
          <div style={{ textAlign: "center" }}>
            <button onClick={() => onComplete({ source: "skip", params: null })}
              style={{ fontSize: 12, color: T.textMuted, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", textUnderlineOffset: 3 }}>
              Skip — go straight to the builder
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Questionnaire screen ───────────────────────────────────────────────────
  if (inputMode === "questionnaire") {
    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 580, width: "100%", animation: "fadeUp .3s ease" }}>
          {/* Top bar */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
            <button onClick={handleBack}
              style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer" }}>
              ← Back
            </button>
            <ProgressDots total={QUESTIONS.length} current={step} />
            <span style={{ fontSize: 11, color: T.textDim }}>{step + 1} / {QUESTIONS.length}</span>
          </div>

          {/* Question */}
          <div key={step} style={{ animation: "fadeUp .25s ease" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: T.teal, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>
              Question {step + 1}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-.01em", lineHeight: 1.3, marginBottom: 28 }}>
              {currentQ.label}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {currentQ.options.map(opt => {
                const isSelected = answers[currentQ.id] === opt.value;
                return (
                  <button key={opt.value} onClick={() => handleChoice(currentQ.id, opt.value)}
                    style={{
                      display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
                      borderRadius: 10, textAlign: "left",
                      border: `1.5px solid ${isSelected ? T.teal : T.border}`,
                      background: isSelected ? `${T.teal}12` : T.surface,
                      cursor: "pointer", transition: "all .18s",
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = T.teal; e.currentTarget.style.background = `${T.teal}08`; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.background = T.surface; } }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{opt.icon}</span>
                    <span style={{ fontSize: 14, fontWeight: isSelected ? 600 : 400, color: isSelected ? T.teal : T.text }}>
                      {opt.label}
                    </span>
                    {isSelected && <span style={{ marginLeft: "auto", color: T.teal, fontSize: 16 }}>✓</span>}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Already answered summary */}
          {Object.keys(answers).length > 0 && (
            <div style={{ marginTop: 28, padding: "12px 16px", background: T.surface2, borderRadius: 8, border: `1px solid ${T.border}` }}>
              <div style={{ fontSize: 10, color: T.textDim, fontWeight: 600, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>So far</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {QUESTIONS.slice(0, step).map(q => {
                  const answer = answers[q.id];
                  const opt = q.options.find(o => o.value === answer);
                  return opt ? (
                    <span key={q.id} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 10, background: `${T.teal}15`, color: T.teal, fontWeight: 500 }}>
                      {opt.icon} {opt.label}
                    </span>
                  ) : null;
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Free text screen ───────────────────────────────────────────────────────
  if (inputMode === "freetext") {
    const productLabels = { cpn: "Capital Protected Note", rc: "Reverse Convertible", brc: "Barrier Reverse Convertible", autocall: "Autocall / Phoenix" };

    return (
      <div style={{ minHeight: "100vh", background: T.bg, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
        <div style={{ maxWidth: 640, width: "100%", animation: "fadeUp .3s ease" }}>
          {/* Back */}
          <div style={{ marginBottom: 32 }}>
            <button onClick={() => { setInputMode(null); setLlmResult(null); setError(null); }}
              style={{ fontSize: 12, color: T.textMuted, display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 6, border: `1px solid ${T.border}`, background: T.surface, cursor: "pointer" }}>
              ← Back
            </button>
          </div>

          <div style={{ fontSize: 11, fontWeight: 600, color: T.teal, letterSpacing: ".1em", textTransform: "uppercase", marginBottom: 12 }}>
            💬 Client Brief
          </div>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: T.text, letterSpacing: "-.01em", marginBottom: 8 }}>
            Describe your client's situation
          </h2>
          <p style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.7, marginBottom: 24 }}>
            Include their objective, risk tolerance, any preference for underlying, yield expectation, and investment horizon. The AI will interpret this and propose a product structure.
          </p>

          {/* Example prompts */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16 }}>
            <span style={{ fontSize: 11, color: T.textDim, alignSelf: "center" }}>Examples:</span>
            {[
              "Conservative client, 2yr horizon, wants 5% yield with capital protection",
              "Equity-comfortable HNW, 12-month BRC on Euro Stoxx, 9% target coupon",
              "Client wants regular income on Nestlé, can tolerate moderate loss, 18 months",
            ].map((ex, i) => (
              <button key={i} onClick={() => setFreeText(ex)}
                style={{ fontSize: 11, color: T.teal, padding: "4px 10px", borderRadius: 10, border: `1px solid ${T.teal}40`, background: `${T.teal}08`, cursor: "pointer", transition: "all .15s" }}
                onMouseEnter={e => { e.currentTarget.style.background = `${T.teal}18`; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${T.teal}08`; }}>
                {ex}
              </button>
            ))}
          </div>

          {/* Text area */}
          <textarea
            value={freeText}
            onChange={e => { setFreeText(e.target.value); setLlmResult(null); setError(null); }}
            placeholder="e.g. My client is a conservative investor with CHF 500k to deploy. She wants capital protection but also some upside. Horizon is 3 years, no liquidity needs. She is comfortable with Swiss underlyings."
            rows={5}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 10,
              border: `1.5px solid ${T.border}`, background: T.surface,
              color: T.text, fontSize: 14, lineHeight: 1.7, resize: "vertical",
              fontFamily: "'Sora', sans-serif", outline: "none",
              transition: "border-color .2s",
            }}
            onFocus={e => { e.target.style.borderColor = T.teal; }}
            onBlur={e => { e.target.style.borderColor = T.border; }}
          />

          {/* Submit */}
          {!llmResult && (
            <button onClick={handleFreetextSubmit} disabled={loading || !freeText.trim()}
              style={{
                marginTop: 16, width: "100%", padding: "14px",
                borderRadius: 10, border: "none",
                background: freeText.trim() ? `linear-gradient(135deg, #0E9688, ${T.teal})` : T.border,
                color: freeText.trim() ? "#fff" : T.textDim,
                fontSize: 14, fontWeight: 700, letterSpacing: ".03em",
                cursor: freeText.trim() ? "pointer" : "not-allowed",
                transition: "all .2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
              {loading ? (
                <>
                  <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid rgba(255,255,255,.3)`, borderTopColor: "#fff", animation: "spin .7s linear infinite" }} />
                  Interpreting…
                </>
              ) : "Interpret with AI →"}
            </button>
          )}

          {/* Error */}
          {error && (
            <div style={{ marginTop: 16, padding: "12px 16px", borderRadius: 8, background: `${T.danger}12`, border: `1px solid ${T.danger}40`, color: T.danger, fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* LLM result card */}
          {llmResult && (
            <div ref={resultRef} style={{ marginTop: 20, animation: "fadeUp .3s ease" }}>
              <div className="card" style={{ border: `1.5px solid ${T.teal}50`, background: `${T.teal}06` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 20 }}>✨</span>
                  <div style={{ fontSize: 14, fontWeight: 700, color: T.teal, flex: 1 }}>Proposed Structure</div>
                </div>

                {/* Rationale */}
                {llmResult.rationale && (
                  <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.8, marginBottom: 16, padding: "10px 14px", background: T.surface2, borderRadius: 8, borderLeft: `3px solid ${T.teal}` }}>
                    {llmResult.rationale}
                  </div>
                )}

                {/* Parameters grid */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
                  {[
                    { label: "Product", value: productLabels[llmResult.productType] ?? llmResult.productType, color: T.teal },
                    { label: "Maturity", value: `${llmResult.maturity}Y`, color: T.text },
                    llmResult.productType === "cpn"
                      ? { label: "Protection", value: `${llmResult.protection ?? 90}%`, color: T.success }
                      : { label: "Barrier", value: `${llmResult.barrier ?? 65}%`, color: T.danger },
                    { label: "Coupon Target", value: `~${llmResult.couponTarget ?? "—"}% p.a.`, color: T.gold },
                    { label: "Underlying", value: llmResult.underlyingId, color: T.textMuted },
                    { label: "Mode", value: llmResult.basketMode ? "Worst-of Basket" : "Single Name", color: T.textMuted },
                  ].filter(Boolean).map((s, i) => (
                    <div key={i} style={{ padding: "10px 12px", background: T.surface, borderRadius: 8, border: `1px solid ${T.border}` }}>
                      <div style={{ fontSize: 10, color: T.textDim, textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 3 }}>{s.label}</div>
                      <div className="mono" style={{ fontSize: 13, fontWeight: 600, color: s.color }}>{s.value}</div>
                    </div>
                  ))}
                </div>

                {/* Primary CTA — large, full width, hard to miss */}
                <button
                  onClick={handleConfirmLLM}
                  style={{
                    width: "100%", padding: "16px", borderRadius: 10, border: "none",
                    background: `linear-gradient(135deg, #0E9688, ${T.teal})`,
                    color: "#fff", fontSize: 15, fontWeight: 800,
                    cursor: "pointer", letterSpacing: ".02em",
                    boxShadow: `0 4px 20px ${T.teal}40`,
                    transition: "transform .15s, box-shadow .15s",
                    marginBottom: 10,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = `0 6px 24px ${T.teal}60`; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = `0 4px 20px ${T.teal}40`; }}
                >
                  <span style={{ fontSize: 18 }}>🏗️</span>
                  Open in Product Builder →
                </button>

                {/* Secondary — revise */}
                <button onClick={() => { setLlmResult(null); setError(null); }}
                  style={{ width: "100%", padding: "10px", borderRadius: 8, border: `1px solid ${T.border}`, background: "transparent", color: T.textMuted, fontSize: 13, cursor: "pointer" }}>
                  ↩ Revise description
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return null;
}
