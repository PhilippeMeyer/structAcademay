import { useState } from "react";
import { useTheme } from "../theme/ThemeContext.js";
import QUIZ_QUESTIONS from "../data/quiz.js";

export default function QuizSection() {
  const theme = useTheme();
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const q = QUIZ_QUESTIONS[currentQ];
  const answered = selected !== null;
  const isCorrect = selected === q.correct;
  const totalCorrect = Object.values(answers).filter(a => a.correct).length;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswers(prev => ({ ...prev, [q.id]: { selected: idx, correct: idx === q.correct } }));
  };

  const handleNext = () => {
    if (currentQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(answers[QUIZ_QUESTIONS[currentQ + 1]?.id]?.selected ?? null);
    } else {
      setShowResults(true);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setCurrentQ(c => c - 1);
      setSelected(answers[QUIZ_QUESTIONS[currentQ - 1]?.id]?.selected ?? null);
    }
  };

  const handleRestart = () => {
    setCurrentQ(0); setSelected(null); setAnswers({}); setShowResults(false);
  };

  const topicColors = { Suitability: theme.warning, "Product Mechanics": theme.gold, Options: "#A78BFA", "Volatility & Pricing": theme.accent, "Credit Risk": theme.danger, "Worst-of Basket": theme.danger, Lifecycle: theme.success };

  if (showResults) {
    const pct = Math.round((totalCorrect / QUIZ_QUESTIONS.length) * 100);
    const byTopic = {};
    QUIZ_QUESTIONS.forEach((q, i) => {
      if (!byTopic[q.topic]) byTopic[q.topic] = { correct: 0, total: 0 };
      byTopic[q.topic].total++;
      if (answers[q.id]?.correct) byTopic[q.topic].correct++;
    });
    return (
      <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto" }}>
        <div className="section-header">
          <div className="section-icon">🏆</div>
          <div>
            <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
            <h2 className="playfair" style={{ fontSize: 24 }}>Quiz Results</h2>
          </div>
        </div>
        <div className="card" style={{ textAlign: "center", marginBottom: 24, borderColor: pct >= 80 ? `${theme.success}50` : pct >= 60 ? `${theme.warning}50` : `${theme.danger}50` }}>
          <div className="mono" style={{ fontSize: 56, fontWeight: 700, color: pct >= 80 ? theme.success : pct >= 60 ? theme.warning : theme.danger }}>{pct}%</div>
          <div style={{ fontSize: 14, color: theme.textMuted, marginTop: 4 }}>{totalCorrect} of {QUIZ_QUESTIONS.length} correct</div>
          <div style={{ fontSize: 13, color: theme.textMuted, marginTop: 8 }}>
            {pct >= 80 ? "Excellent — strong product knowledge across the board." : pct >= 60 ? "Good foundation — review the topics flagged below." : "Several areas need attention — revisit the relevant modules before client discussions."}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 24 }}>
          {Object.entries(byTopic).map(([topic, { correct, total }]) => {
            const score = correct / total;
            const col = score === 1 ? theme.success : score >= 0.5 ? theme.warning : theme.danger;
            return (
              <div key={topic} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderColor: `${col}30` }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: topicColors[topic] || theme.gold }}>{topic}</div>
                  <div style={{ fontSize: 11, color: theme.textMuted }}>{correct}/{total} correct</div>
                </div>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: `${col}18`, border: `2px solid ${col}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span className="mono" style={{ fontSize: 11, color: col, fontWeight: 700 }}>{Math.round(score * 100)}%</span>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={handleRestart} style={{ flex: 1, padding: "12px", borderRadius: 4, border: `1px solid ${theme.gold}`, background: `${theme.teal}15`, color: theme.gold, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>Retake Quiz</button>
          <button onClick={() => { setCurrentQ(0); setSelected(answers[QUIZ_QUESTIONS[0].id]?.selected ?? null); setShowResults(false); }} style={{ flex: 1, padding: "12px", borderRadius: 4, border: `1px solid ${theme.border}`, background: "transparent", color: theme.textMuted, fontSize: 13, cursor: "pointer" }}>Review Answers</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ maxWidth: 760, margin: "0 auto" }}>
      <div className="section-header">
        <div className="section-icon">🧠</div>
        <div>
          <div className="teal-line" style={{ margin: 0, marginBottom: 4 }} />
          <h2 className="playfair" style={{ fontSize: 24 }}>Knowledge Check</h2>
          <p style={{ color: theme.textMuted, fontSize: 13, marginTop: 2 }}>Scenario-based questions — test your understanding before client discussions</p>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <span style={{ fontSize: 11, color: theme.textDim }}>{currentQ + 1} of {QUIZ_QUESTIONS.length}</span>
        <span className="pill" style={{ background: `${topicColors[q.topic] || theme.gold}18`, color: topicColors[q.topic] || theme.gold, fontSize: 10 }}>{q.topic}</span>
        <span style={{ fontSize: 11, color: theme.textDim }}>{totalCorrect} correct so far</span>
      </div>
      <div style={{ height: 3, background: theme.border, borderRadius: 2, marginBottom: 24 }}>
        <div style={{ height: "100%", width: `${((currentQ + (answered ? 1 : 0)) / QUIZ_QUESTIONS.length) * 100}%`, background: theme.gold, borderRadius: 2, transition: "width 0.4s ease" }} />
      </div>

      {/* Question */}
      <div className="card" style={{ marginBottom: 16, borderColor: `${topicColors[q.topic] || theme.gold}30`, background: `${topicColors[q.topic] || theme.gold}06` }}>
        <div style={{ fontSize: 14, color: theme.text, lineHeight: 1.8 }}>{q.scenario}</div>
      </div>

      {/* Options */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {q.options.map((opt, idx) => {
          let borderColor = theme.border, bg = "transparent", textColor = theme.text;
          if (answered) {
            if (idx === q.correct) { borderColor = theme.success; bg = `${theme.success}12`; textColor = theme.success; }
            else if (idx === selected && selected !== q.correct) { borderColor = theme.danger; bg = `${theme.danger}12`; textColor = theme.danger; }
            else { textColor = theme.textDim; }
          } else if (selected === idx) { borderColor = theme.gold; bg = `${theme.gold}10`; }
          return (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={answered}
              style={{ padding: "14px 16px", borderRadius: 4, textAlign: "left", border: `1px solid ${borderColor}`, background: bg, color: textColor, fontSize: 13, lineHeight: 1.6, cursor: answered ? "default" : "pointer", transition: "all 0.2s", display: "flex", gap: 12, alignItems: "flex-start" }}>
              <span className="mono" style={{ fontSize: 11, color: textColor, opacity: 0.7, flexShrink: 0, marginTop: 2 }}>{String.fromCharCode(65 + idx)}.</span>
              <span>{opt}</span>
              {answered && idx === q.correct && <span style={{ marginLeft: "auto", flexShrink: 0 }}>✓</span>}
              {answered && idx === selected && selected !== q.correct && <span style={{ marginLeft: "auto", flexShrink: 0 }}>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Explanation */}
      {answered && (
        <div className="slide-in" style={{ marginBottom: 20, padding: "14px 16px", borderRadius: 4, borderLeft: `3px solid ${isCorrect ? theme.success : theme.danger}`, background: isCorrect ? `${theme.success}08` : `${theme.danger}08` }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: isCorrect ? theme.success : theme.danger, letterSpacing: "0.08em", marginBottom: 6 }}>
            {isCorrect ? "✓ CORRECT" : "✗ INCORRECT"} — Explanation
          </div>
          <div style={{ fontSize: 12, color: theme.textMuted, lineHeight: 1.8 }}>{q.explanation}</div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={handlePrev} disabled={currentQ === 0} style={{ padding: "10px 20px", borderRadius: 4, border: `1px solid ${theme.border}`, background: "transparent", color: currentQ === 0 ? theme.textDim : theme.text, fontSize: 12, cursor: currentQ === 0 ? "not-allowed" : "pointer" }}>← Previous</button>
        <button onClick={handleNext} disabled={!answered} style={{ flex: 1, padding: "10px", borderRadius: 4, border: `1px solid ${answered ? theme.gold : theme.border}`, background: answered ? "rgba(201,168,76,0.1)" : "transparent", color: answered ? theme.gold : theme.textDim, fontSize: 12, fontWeight: 600, cursor: answered ? "pointer" : "not-allowed" }}>
          {currentQ === QUIZ_QUESTIONS.length - 1 ? "See Results →" : "Next Question →"}
        </button>
      </div>
    </div>
  );
}

// ─── VOLATILITY & PRICING INTUITION ───────────────────────────────────────────
