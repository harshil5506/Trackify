import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const questions = [
  {
    id: 1,
    question: "When you receive your monthly income, what is your immediate priority?",
    options: [
      { text: "Transfer 30%+ straight into savings or investments.", points: 4, type: "saver" },
      { text: "Pay all bills, assign budget categories, then save what is left.", points: 3, type: "balanced" },
      { text: "Treat yourself to a nice meal or item you've had your eye on.", points: 2, type: "spender" },
      { text: "Spend freely without checking balance until cards get declined.", points: 1, type: "impulse" },
    ],
  },
  {
    id: 2,
    question: "How do you feel when you make an unplanned / impulse purchase?",
    options: [
      { text: "Regretful — I immediately review my budget to compensate.", points: 4, type: "saver" },
      { text: "Fine, as long as it fits within my general monthly buffer.", points: 3, type: "balanced" },
      { text: "Excited! Life is meant to be enjoyed now.", points: 2, type: "spender" },
      { text: "I don't think much about it; I buy what catches my eye.", points: 1, type: "impulse" },
    ],
  },
  {
    id: 3,
    question: "How do you track your daily transactions?",
    options: [
      { text: "Meticulously log every rupee in Trackify or a detailed spreadsheet.", points: 4, type: "saver" },
      { text: "Check Trackify weekly to ensure I'm within budget targets.", points: 3, type: "balanced" },
      { text: "Check my bank app occasionally when I feel like I'm spending too much.", points: 2, type: "spender" },
      { text: "Rarely track expenses; I go with the flow.", points: 1, type: "impulse" },
    ],
  },
  {
    id: 4,
    question: "What is your approach to major sales or shopping events?",
    options: [
      { text: "Ignore them unless I already had a planned item on my buy list.", points: 4, type: "saver" },
      { text: "Set a strict spending limit and compare prices before buying.", points: 3, type: "balanced" },
      { text: "Browse deals and grab items that seem heavily discounted.", points: 2, type: "spender" },
      { text: "Buy multiple items right away so I don't miss out on deals.", points: 1, type: "impulse" },
    ],
  },
  {
    id: 5,
    question: "What is your primary long-term financial goal?",
    options: [
      { text: "Financial independence, early retirement, and heavy passive income.", points: 4, type: "saver" },
      { text: "Maintaining a comfortable lifestyle with a healthy emergency fund.", points: 3, type: "balanced" },
      { text: "Upgrading my lifestyle, travel, and experiencing luxury.", points: 2, type: "spender" },
      { text: "Living in the present moment without worrying too much about future money.", points: 1, type: "impulse" },
    ],
  },
];

const archetypes = {
  saver: {
    title: "The Master Saver & Strategist 🛡️",
    badge: "Master Saver",
    description:
      "You possess exceptional financial discipline. You prioritize savings, investments, and long-term security above all else.",
    tips: [
      "Remember to reward yourself occasionally for achieving financial milestones.",
      "Consider allocating a small 'fun money' budget category to enjoy stress-free spending.",
    ],
    bg: "#dcfce7",
    color: "#15803d",
  },
  balanced: {
    title: "The Mindful & Balanced Budgeter 📈",
    badge: "Balanced Spender",
    description:
      "You strike a great harmony between enjoying current life and preparing for future financial goals.",
    tips: [
      "Keep optimizing your recurring subscriptions to unlock extra investment capital.",
      "Set up automated investments to put your growth on autopilot.",
    ],
    bg: "#dbeafe",
    color: "#1d4ed8",
  },
  spender: {
    title: "The Experience Enthusiast 🛍️",
    badge: "Experience Seeker",
    description:
      "You value experiences, quality products, and enjoying life now. Spending brings you joy, though savings take a backseat.",
    tips: [
      "Try the 24-hour rule before making non-essential purchases over ₹2,000.",
      "Automate your savings on payday before spending money on lifestyle choices.",
    ],
    bg: "#fef3c7",
    color: "#b45309",
  },
  impulse: {
    title: "The Free-Spirited Impulse Adventurer ⚡",
    badge: "Impulse Adventurer",
    description:
      "You live in the present and prefer spontaneity over strict budgets. Financial rules feel constraining.",
    tips: [
      "Start small: track expenses for 7 straight days in Trackify to build visibility.",
      "Create an emergency savings fund with at least 1 month of living expenses.",
    ],
    bg: "#fee2e2",
    color: "#b91c1c",
  },
};

const Quiz = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loadingExisting, setLoadingExisting] = useState(true);

  useEffect(() => {
    fetchExistingResult();
  }, []);

  const fetchExistingResult = async () => {
    try {
      const { data } = await API.get("/api/user/quiz-result");
      if (data && data.archetype) {
        setResult({
          archetypeKey: data.archetype,
          ...archetypes[data.archetype],
          score: data.score,
          completedAt: data.completedAt,
        });
      }
    } catch (err) {
      console.log("No previous quiz result found");
    } finally {
      setLoadingExisting(false);
    }
  };

  const handleSelectOption = (option) => {
    const updatedAnswers = { ...answers, [currentStep]: option };
    setAnswers(updatedAnswers);

    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      calculateResult(updatedAnswers);
    }
  };

  const calculateResult = async (finalAnswers) => {
    let totalPoints = 0;
    const typeCounts = { saver: 0, balanced: 0, spender: 0, impulse: 0 };

    Object.values(finalAnswers).forEach((opt) => {
      totalPoints += opt.points;
      typeCounts[opt.type] = (typeCounts[opt.type] || 0) + 1;
    });

    let winningType = "balanced";
    let maxCount = -1;
    Object.entries(typeCounts).forEach(([type, count]) => {
      if (count > maxCount) {
        maxCount = count;
        winningType = type;
      }
    });

    const resData = {
      archetypeKey: winningType,
      ...archetypes[winningType],
      score: totalPoints,
    };

    setResult(resData);
    saveResultToBackend(winningType, resData.title, resData.badge, totalPoints);
  };

  const saveResultToBackend = async (archetype, title, badge, score) => {
    try {
      setSaving(true);
      await API.post("/api/user/quiz-result", {
        archetype,
        title,
        badge,
        score,
      });
      toast.success("Personality badge saved to your profile!");
    } catch (err) {
      toast.error("Could not save quiz result to profile");
    } finally {
      setSaving(false);
    }
  };

  const restartQuiz = () => {
    setAnswers({});
    setCurrentStep(0);
    setResult(null);
  };

  if (loadingExisting) {
    return <div style={styles.loadingContainer}>Loading quiz...</div>;
  }

  return (
    <div style={styles.pageBody}>
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={styles.header}>
            <span style={styles.tag}>SPENDING PERSONALITY ASSESSOR</span>
            <h1 style={styles.heading}>Discover Your Financial DNA 🧠</h1>
            <p style={styles.subheading}>
              Answer 5 quick questions to unveil your spending archetype, strengths, and customized money tips.
            </p>
          </div>

          {!result ? (
            <div>
              <div style={styles.progressBarBg}>
                <div
                  style={{
                    ...styles.progressBarFill,
                    width: `${((currentStep + 1) / questions.length) * 100}%`,
                  }}
                />
              </div>

              <div style={styles.questionMeta}>
                Question {currentStep + 1} of {questions.length}
              </div>

              <h2 style={styles.questionText}>
                {questions[currentStep].question}
              </h2>

              <div style={styles.optionsGrid}>
                {questions[currentStep].options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(opt)}
                    style={styles.optionBtn}
                  >
                    <span style={styles.optionNumber}>{String.fromCharCode(65 + idx)}</span>
                    <span style={styles.optionText}>{opt.text}</span>
                  </button>
                ))}
              </div>

              {currentStep > 0 && (
                <button
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  style={styles.backBtn}
                >
                  ← Previous Question
                </button>
              )}
            </div>
          ) : (
            <div style={styles.resultContainer}>
              <div
                style={{
                  ...styles.badgeBox,
                  backgroundColor: result.bg,
                  color: result.color,
                }}
              >
                <span style={styles.badgeEmoji}>🏆</span>
                <div>
                  <h2 style={styles.archetypeTitle}>{result.title}</h2>
                  <span style={styles.badgeTag}>Badge: {result.badge}</span>
                </div>
              </div>

              <p style={styles.descriptionText}>{result.description}</p>

              <div style={styles.tipsSection}>
                <h3 style={styles.tipsHeading}>💡 Personalized Financial Action Plan</h3>
                <ul style={styles.tipsList}>
                  {result.tips.map((tip, idx) => (
                    <li key={idx} style={styles.tipItem}>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>

              <div style={styles.actionRow}>
                <button onClick={restartQuiz} style={styles.restartBtn}>
                  🔄 Retake Assessment
                </button>
                <Link to="/activity" style={styles.dashboardBtn}>
                  View Activity & Heatmap →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  pageBody: {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    minHeight: "100vh",
    padding: "40px 20px",
    fontFamily: "'Inter', sans-serif",
  },
  loadingContainer: {
    textAlign: "center",
    padding: "60px",
    color: "#64748b",
  },
  container: {
    maxWidth: "680px",
    margin: "0 auto",
  },
  card: {
    background: "#ffffff",
    borderRadius: "20px",
    padding: "36px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  tag: {
    background: "#e0e7ff",
    color: "#4338ca",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.5px",
    padding: "4px 12px",
    borderRadius: "20px",
    display: "inline-block",
    marginBottom: "10px",
  },
  heading: {
    fontSize: "1.75rem",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 8px 0",
    fontFamily: "'Sora', sans-serif",
  },
  subheading: {
    fontSize: "0.9rem",
    color: "#64748b",
    margin: 0,
    lineHeight: "1.5",
  },
  progressBarBg: {
    height: "6px",
    background: "#f1f5f9",
    borderRadius: "3px",
    overflow: "hidden",
    marginBottom: "16px",
  },
  progressBarFill: {
    height: "100%",
    background: "#1a2ea8",
    transition: "width 0.3s ease",
  },
  questionMeta: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#475569",
    marginBottom: "8px",
    textTransform: "uppercase",
  },
  questionText: {
    fontSize: "1.15rem",
    fontWeight: "700",
    color: "#1e293b",
    marginBottom: "20px",
    lineHeight: "1.4",
  },
  optionsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  optionBtn: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    background: "#f8fafc",
    border: "1.5px solid #e2e8f0",
    borderRadius: "12px",
    padding: "14px 18px",
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  optionNumber: {
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    background: "#1a2ea8",
    color: "#ffffff",
    fontSize: "12px",
    fontWeight: "700",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionText: {
    fontSize: "0.92rem",
    color: "#334155",
    fontWeight: "500",
    lineHeight: "1.4",
  },
  backBtn: {
    marginTop: "20px",
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
  },
  resultContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "20px",
  },
  badgeBox: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "20px",
    borderRadius: "16px",
  },
  badgeEmoji: {
    fontSize: "36px",
  },
  archetypeTitle: {
    fontSize: "1.3rem",
    fontWeight: "800",
    margin: "0 0 4px 0",
    fontFamily: "'Sora', sans-serif",
  },
  badgeTag: {
    fontSize: "12px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "4px",
    background: "rgba(255,255,255,0.7)",
  },
  descriptionText: {
    fontSize: "0.95rem",
    color: "#334155",
    lineHeight: "1.6",
    margin: 0,
  },
  tipsSection: {
    background: "#f8fafc",
    borderRadius: "14px",
    padding: "20px",
    border: "1px solid #e2e8f0",
  },
  tipsHeading: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 12px 0",
  },
  tipsList: {
    margin: 0,
    paddingLeft: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  tipItem: {
    fontSize: "0.88rem",
    color: "#475569",
    lineHeight: "1.5",
  },
  actionRow: {
    display: "flex",
    gap: "12px",
    marginTop: "10px",
    flexWrap: "wrap",
  },
  restartBtn: {
    flex: 1,
    background: "#f1f5f9",
    color: "#334155",
    border: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  dashboardBtn: {
    flex: 1,
    background: "#1a2ea8",
    color: "#ffffff",
    textAlign: "center",
    textDecoration: "none",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    boxShadow: "0 4px 12px rgba(26,46,168,0.25)",
  },
};

export default Quiz;
