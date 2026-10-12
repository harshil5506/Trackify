import { useState, useEffect } from "react";
import API from "../api/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

// Default comprehensive real-world scenarios fallback in case network call is delayed
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    category: "Peer Dining & Social Outings",
    scenarioType: "peer",
    badgeLabel: "👥 Peer Occasion",
    scenario: "You packed a simple lunch to save money, but close coworkers/friends spontaneously invite you to an upscale, trending café (₹800+ per meal). What do you do?",
    options: [
      {
        id: "1a",
        text: "Politely pass, enjoy your packed lunch, and offer to join them just for a quick 15-minute coffee chat afterwards.",
        dimensionScores: { soloDiscipline: 9.5, socialSusceptibility: 1.5, occasionDuality: 1.5, impulseRisk: 1.5, peerBoundaryFirmness: 9.5 }
      },
      {
        id: "1b",
        text: "Join them, order an affordable beverage or side item, and comfortably keep your expense under ₹200.",
        dimensionScores: { soloDiscipline: 8.0, socialSusceptibility: 3.5, occasionDuality: 3.0, impulseRisk: 2.5, peerBoundaryFirmness: 8.0 }
      },
      {
        id: "1c",
        text: "Join in and order whatever everyone else is having to avoid feeling awkward or out of place.",
        dimensionScores: { soloDiscipline: 4.0, socialSusceptibility: 8.5, occasionDuality: 8.0, impulseRisk: 6.5, peerBoundaryFirmness: 2.5 }
      },
      {
        id: "1d",
        text: "Excitedly abandon the packed lunch, splurge on the signature gourmet dish, and treat someone's dessert on top.",
        dimensionScores: { soloDiscipline: 2.0, socialSusceptibility: 9.0, occasionDuality: 9.5, impulseRisk: 9.0, peerBoundaryFirmness: 1.5 }
      }
    ]
  },
  {
    id: 2,
    category: "The Unequal Split Bill",
    scenarioType: "peer",
    badgeLabel: "👥 Peer Dynamics",
    scenario: "You attended a group dinner where you had a ₹250 simple dish, while others ordered cocktails, steaks, and desserts worth ₹6,000. The waiter asks: 'Equal split across everyone?'",
    options: [
      {
        id: "2a",
        text: "Calmly speak up right away: 'I'll put in ₹350 to cover my dish plus tax/tip, and you guys can split the rest!'",
        dimensionScores: { soloDiscipline: 9.0, socialSusceptibility: 1.5, occasionDuality: 1.5, impulseRisk: 1.0, peerBoundaryFirmness: 9.5 }
      },
      {
        id: "2b",
        text: "Propose that someone calculates items via Trackify/Splitwise later so everyone pays their fair share.",
        dimensionScores: { soloDiscipline: 8.0, socialSusceptibility: 3.0, occasionDuality: 2.5, impulseRisk: 2.0, peerBoundaryFirmness: 8.5 }
      },
      {
        id: "2c",
        text: "Quietly pay the equal ₹1,200 share despite feeling internal resentment, just to avoid group tension.",
        dimensionScores: { soloDiscipline: 4.5, socialSusceptibility: 8.5, occasionDuality: 7.5, impulseRisk: 4.0, peerBoundaryFirmness: 2.0 }
      },
      {
        id: "2d",
        text: "Insist on picking up an even bigger portion of the bill or covering the entire tip to look generous.",
        dimensionScores: { soloDiscipline: 3.0, socialSusceptibility: 8.0, occasionDuality: 8.5, impulseRisk: 7.0, peerBoundaryFirmness: 1.5 }
      }
    ]
  },
  {
    id: 3,
    category: "Solitary Late-Night Browsing",
    scenarioType: "self",
    badgeLabel: "👤 Solitary Habit",
    scenario: "It is 11:30 PM. You are alone in bed scrolling your phone and stumble upon a limited-time flash sale for a gadget or apparel you didn't know you wanted 10 minutes ago.",
    options: [
      {
        id: "3a",
        text: "Close the browser immediately. If it's not on your pre-existing wishlist, you don't need it.",
        dimensionScores: { soloDiscipline: 9.5, socialSusceptibility: 1.0, occasionDuality: 1.0, impulseRisk: 1.0, peerBoundaryFirmness: 9.0 }
      },
      {
        id: "3b",
        text: "Add it to your wishlist and mandate a 48-hour cooling-off rule before deciding.",
        dimensionScores: { soloDiscipline: 8.5, socialSusceptibility: 1.5, occasionDuality: 2.0, impulseRisk: 2.5, peerBoundaryFirmness: 8.5 }
      },
      {
        id: "3c",
        text: "Check your bank balance; if you have cash to spare this month, you go ahead and place the order.",
        dimensionScores: { soloDiscipline: 5.0, socialSusceptibility: 2.0, occasionDuality: 5.0, impulseRisk: 6.5, peerBoundaryFirmness: 6.0 }
      },
      {
        id: "3d",
        text: "Buy it immediately with express checkout—discounts don't wait and life is meant to be enjoyed now!",
        dimensionScores: { soloDiscipline: 1.5, socialSusceptibility: 2.0, occasionDuality: 7.0, impulseRisk: 9.5, peerBoundaryFirmness: 3.0 }
      }
    ]
  },
  {
    id: 4,
    category: "Spontaneous Peer Vacation / Getaway",
    scenarioType: "peer",
    badgeLabel: "👥 Peer Occasion",
    scenario: "Friends propose a spontaneous weekend luxury resort getaway that will cost ₹12,000—well beyond your unallocated discretionary spending for the month.",
    options: [
      {
        id: "4a",
        text: "Be honest without shame: 'That sounds amazing, but it's outside my budget this month. Have fun, count me in for the next one!'",
        dimensionScores: { soloDiscipline: 9.5, socialSusceptibility: 1.5, occasionDuality: 1.5, impulseRisk: 1.5, peerBoundaryFirmness: 9.5 }
      },
      {
        id: "4b",
        text: "Propose an alternative budget-friendly weekend option or adjust other non-essential categories to fit it safely.",
        dimensionScores: { soloDiscipline: 7.5, socialSusceptibility: 4.0, occasionDuality: 4.0, impulseRisk: 3.5, peerBoundaryFirmness: 7.5 }
      },
      {
        id: "4c",
        text: "Experience intense FOMO, reluctantly agree, and plan to stressfully eat instant noodles for the next two weeks.",
        dimensionScores: { soloDiscipline: 4.0, socialSusceptibility: 8.5, occasionDuality: 8.5, impulseRisk: 7.0, peerBoundaryFirmness: 2.5 }
      },
      {
        id: "4d",
        text: "Immediately book it on credit card without a second thought. 'You only live once!'",
        dimensionScores: { soloDiscipline: 2.0, socialSusceptibility: 9.0, occasionDuality: 9.0, impulseRisk: 9.5, peerBoundaryFirmness: 1.5 }
      }
    ]
  },
  {
    id: 5,
    category: "Celebratory Occasion & Windfall",
    scenarioType: "occasion",
    badgeLabel: "🎉 Occasion Duality",
    scenario: "You receive an unexpected ₹15,000 festive bonus or project incentive. How do you divide this between yourself and peer occasions?",
    options: [
      {
        id: "5a",
        text: "Direct 80%+ into emergency savings or mutual funds, and spend the remaining ₹2,000 on a small planned treat.",
        dimensionScores: { soloDiscipline: 9.5, socialSusceptibility: 1.5, occasionDuality: 1.5, impulseRisk: 1.5, peerBoundaryFirmness: 9.0 }
      },
      {
        id: "5b",
        text: "Split 50% into savings, 30% for a personal goal, and 20% to celebrate over dinner with loved ones.",
        dimensionScores: { soloDiscipline: 8.0, socialSusceptibility: 3.5, occasionDuality: 3.5, impulseRisk: 2.5, peerBoundaryFirmness: 8.0 }
      },
      {
        id: "5c",
        text: "Immediately announce a lavish party or round of drinks for your entire friend circle, consuming most of the bonus.",
        dimensionScores: { soloDiscipline: 3.5, socialSusceptibility: 8.5, occasionDuality: 8.5, impulseRisk: 7.5, peerBoundaryFirmness: 2.0 }
      },
      {
        id: "5d",
        text: "Spend the entire amount within 48 hours on impulse shopping, gadget upgrades, and celebrations.",
        dimensionScores: { soloDiscipline: 1.5, socialSusceptibility: 6.0, occasionDuality: 9.0, impulseRisk: 9.5, peerBoundaryFirmness: 3.0 }
      }
    ]
  },
  {
    id: 6,
    category: "Emotional Trigger & Retail Therapy",
    scenarioType: "self",
    badgeLabel: "👤 Solitary Habit",
    scenario: "You have endured a grueling, deeply frustrating week at work or college. When you get home on Friday evening:",
    options: [
      {
        id: "6a",
        text: "Decompress through non-monetary habits: a long walk, music, workout, or calling family. Money is not an emotional band-aid.",
        dimensionScores: { soloDiscipline: 9.5, socialSusceptibility: 1.0, occasionDuality: 1.5, impulseRisk: 1.5, peerBoundaryFirmness: 9.0 }
      },
      {
        id: "6b",
        text: "Treat yourself to a capped, comforting food delivery within your weekly dining buffer.",
        dimensionScores: { soloDiscipline: 8.0, socialSusceptibility: 2.0, occasionDuality: 3.0, impulseRisk: 3.5, peerBoundaryFirmness: 8.0 }
      },
      {
        id: "6c",
        text: "Engage in heavy retail therapy, browsing apps and ordering clothes or gadgets to lift your mood.",
        dimensionScores: { soloDiscipline: 3.0, socialSusceptibility: 2.0, occasionDuality: 6.5, impulseRisk: 8.5, peerBoundaryFirmness: 5.0 }
      },
      {
        id: "6d",
        text: "Text a group chat to go out drinking or clubbing to blow off steam, ending up with a massive tab.",
        dimensionScores: { soloDiscipline: 2.5, socialSusceptibility: 8.5, occasionDuality: 8.5, impulseRisk: 8.5, peerBoundaryFirmness: 2.0 }
      }
    ]
  },
  {
    id: 7,
    category: "Peer Gifting & Group Milestones",
    scenarioType: "boundary",
    badgeLabel: "👥 Peer Dynamics",
    scenario: "A friend in your peer group is getting married or promoted. Someone suggests everyone chip in ₹3,000 each for a luxury designer gift, which strains your finances.",
    options: [
      {
        id: "7a",
        text: "Privately message the organizer: 'I have a strict ₹1,000 gift cap right now. If that doesn't fit the pool, I'll get them a personal thoughtful card/gift myself!'",
        dimensionScores: { soloDiscipline: 9.0, socialSusceptibility: 2.0, occasionDuality: 2.0, impulseRisk: 1.5, peerBoundaryFirmness: 9.5 }
      },
      {
        id: "7b",
        text: "Suggest a more meaningful group gift that fits everyone's financial comfort range without exclusion.",
        dimensionScores: { soloDiscipline: 8.0, socialSusceptibility: 3.5, occasionDuality: 3.0, impulseRisk: 2.0, peerBoundaryFirmness: 8.5 }
      },
      {
        id: "7c",
        text: "Silently pay the ₹3,000 because you're terrified someone might think you are cheap or a bad friend.",
        dimensionScores: { soloDiscipline: 4.0, socialSusceptibility: 8.5, occasionDuality: 7.5, impulseRisk: 4.5, peerBoundaryFirmness: 2.0 }
      },
      {
        id: "7d",
        text: "Pay the ₹3,000 and offer to buy the wrapping, flowers, and champagne too so everyone notices your generosity.",
        dimensionScores: { soloDiscipline: 2.5, socialSusceptibility: 8.0, occasionDuality: 8.5, impulseRisk: 7.0, peerBoundaryFirmness: 1.5 }
      }
    ]
  },
  {
    id: 8,
    category: "Month-End Solitary vs. Social Budget Defense",
    scenarioType: "boundary",
    badgeLabel: "⚖️ Duality Defense",
    scenario: "It is the 26th of the month. You have only ₹2,000 left in your budget to survive until payday. When alone you eat simple lentils and rice, but an old friend visits from out of town and wants to catch up.",
    options: [
      {
        id: "8a",
        text: "Host them at your home with home-cooked chai and snacks, or suggest a scenic park stroll to focus on deep conversation without spending money.",
        dimensionScores: { soloDiscipline: 9.5, socialSusceptibility: 1.5, occasionDuality: 1.5, impulseRisk: 1.0, peerBoundaryFirmness: 9.5 }
      },
      {
        id: "8b",
        text: "Meet at a cozy casual tea stall or budget café, enjoying each other's company for under ₹200.",
        dimensionScores: { soloDiscipline: 8.5, socialSusceptibility: 3.0, occasionDuality: 2.5, impulseRisk: 2.0, peerBoundaryFirmness: 8.5 }
      },
      {
        id: "8c",
        text: "Take them to a nice bistro, spend your remaining ₹2,000 in one afternoon, and borrow money or swipe credit for the rest of the week.",
        dimensionScores: { soloDiscipline: 3.5, socialSusceptibility: 8.5, occasionDuality: 8.5, impulseRisk: 7.5, peerBoundaryFirmness: 2.5 }
      },
      {
        id: "8d",
        text: "Insist on picking up their entire tab to be a good host, putting yourself into immediate overdraft.",
        dimensionScores: { soloDiscipline: 2.0, socialSusceptibility: 9.0, occasionDuality: 9.5, impulseRisk: 8.5, peerBoundaryFirmness: 1.0 }
      }
    ]
  }
];

const Quiz = () => {
  const [questions, setQuestions] = useState(DEFAULT_QUESTIONS);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [profileResult, setProfileResult] = useState(null);
  const [loadingExisting, setLoadingExisting] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Load questions and existing quiz result
  useEffect(() => {
    const initData = async () => {
      try {
        const qRes = await API.get("/api/quiz/questions");
        if (qRes.data && qRes.data.questions && qRes.data.questions.length > 0) {
          setQuestions(qRes.data.questions);
        }
      } catch (err) {
        console.warn("Using default questions fallback", err);
      }

      try {
        const resRes = await API.get("/api/quiz/result");
        if (resRes.data && resRes.data.archetype) {
          setProfileResult(resRes.data);
        } else {
          // Check legacy user route
          const userRes = await API.get("/api/user/quiz-result");
          if (userRes.data && userRes.data.archetype) {
            setProfileResult(userRes.data);
          }
        }
      } catch (err) {
        console.log("No previous profile found");
      } finally {
        setLoadingExisting(false);
      }
    };

    initData();
  }, []);

  const handleSelectOption = (option) => {
    setAnswers((prev) => ({
      ...prev,
      [currentStep]: {
        ...option,
        scenarioType: questions[currentStep].scenarioType,
        category: questions[currentStep].category,
      },
    }));
  };

  const handleNext = () => {
    if (!answers[currentStep]) {
      toast.error("Please select a scenario response before proceeding");
      return;
    }
    if (currentStep < questions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      submitAssessment();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const submitAssessment = async () => {
    try {
      setIsAnalyzing(true);
      const answerPayload = Object.values(answers);

      const { data } = await API.post("/api/quiz/analyze", {
        answers: answerPayload,
      });

      if (data && data.profile) {
        setProfileResult(data.profile);
        toast.success("Behavioral spending profile successfully generated! 🎉");
      }
    } catch (err) {
      toast.error("Could not complete ML behavioral profiling. Retrying with rule engine...");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const restartQuiz = () => {
    setProfileResult(null);
    setAnswers({});
    setCurrentStep(0);
  };

  if (loadingExisting) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: "16px", color: "#64748b", fontWeight: "600" }}>
          Loading Behavioral Spending Diagnostic...
        </p>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // VIEW 1: RESULTS DASHBOARD (BEHAVIORAL PROFILE DOSSIER)
  // ────────────────────────────────────────────────────────────────
  if (profileResult) {
    const {
      title,
      badge,
      score,
      summary,
      matchConfidence,
      dimensions = {},
      dualityAnalysis = {},
      risks = [],
      rules = [],
      realDataCorrelation = {},
      engine,
      completedAt,
    } = profileResult;

    const selfScore = dualityAnalysis.selfScore || dimensions.soloDiscipline || 50;
    const peerScore = dualityAnalysis.peerScore || (100 - (dimensions.socialSusceptibility || 50));
    const dualityGap = dualityAnalysis.dualityGap !== undefined ? dualityAnalysis.dualityGap : Math.round(selfScore - peerScore);

    return (
      <div style={styles.pageContainer}>
        <div style={styles.card}>
          {/* Header Banner */}
          <div style={styles.header}>
            <span style={styles.headerPill}>🧠 ML Behavioral Diagnostic</span>
            <h1 style={styles.mainTitle}>{title || "Behavioral Spending Profile"}</h1>
            <p style={styles.subtitle}>
              Evaluated across Self vs. Peer occasion spending habits, social contagion, and impulse friction.
            </p>
            {engine && (
              <div style={styles.engineTag}>
                ⚡ Engine: {engine} • Confidence: {matchConfidence || 92}%
              </div>
            )}
          </div>

          {/* Archetype Overview Card */}
          <div style={styles.archetypeCard}>
            <div style={styles.archetypeTop}>
              <div>
                <span style={styles.badgePill}>Archetype Badge: {badge || "Balanced Spender"}</span>
                <h2 style={styles.archetypeTitle}>{title}</h2>
              </div>
              <div style={styles.scoreCircle}>
                <span style={styles.scoreValue}>{score || 75}</span>
                <span style={styles.scoreLabel}>/ 100 Score</span>
              </div>
            </div>
            <p style={styles.archetypeSummary}>{summary}</p>
          </div>

          {/* 🌟 KEY REQUIREMENT: SELF VS. PEER OCCASION DUALITY METER */}
          <div style={styles.dualitySection}>
            <div style={styles.sectionHeaderBox}>
              <h3 style={styles.sectionHeading}>
                ⚖️ Self vs. Peer Occasion Duality Analysis
              </h3>
              <span style={styles.dualityStatusBadge}>
                {dualityAnalysis.status || "Occasion Analysis"}
              </span>
            </div>

            <p style={styles.dualityExplanation}>
              {dualityAnalysis.interpretation ||
                `Comparing how strictly you maintain financial discipline when spending on yourself in solitude vs. celebrating or dining out in peer group settings.`}
            </p>

            <div style={styles.dualityComparisonGrid}>
              {/* Solitary Habit */}
              <div style={styles.dualityBox}>
                <div style={styles.dualityBoxHeader}>
                  <span style={{ fontSize: "1.2rem" }}>👤</span>
                  <div>
                    <div style={styles.dualityBoxTitle}>Solitary Spending Habit</div>
                    <div style={styles.dualityBoxSub}>Self-control when alone</div>
                  </div>
                </div>
                <div style={styles.dualityMeterBar}>
                  <div
                    style={{
                      ...styles.dualityMeterFill,
                      width: `${Math.min(100, Math.max(0, selfScore))}%`,
                      backgroundColor: "#16a34a",
                    }}
                  />
                </div>
                <div style={styles.dualityBoxScore}>
                  {Math.round(selfScore)}% Solo Discipline
                </div>
              </div>

              {/* Peer Occasion Habit */}
              <div style={styles.dualityBox}>
                <div style={styles.dualityBoxHeader}>
                  <span style={{ fontSize: "1.2rem" }}>👥</span>
                  <div>
                    <div style={styles.dualityBoxTitle}>Peer Occasion Spending</div>
                    <div style={styles.dualityBoxSub}>Control in social settings</div>
                  </div>
                </div>
                <div style={styles.dualityMeterBar}>
                  <div
                    style={{
                      ...styles.dualityMeterFill,
                      width: `${Math.min(100, Math.max(0, peerScore))}%`,
                      backgroundColor: "#2563eb",
                    }}
                  />
                </div>
                <div style={styles.dualityBoxScore}>
                  {Math.round(peerScore)}% Social Boundary Retained
                </div>
              </div>
            </div>

            {/* Duality Gap Metric */}
            <div style={styles.gapCallout}>
              <div style={styles.gapValueBox}>
                <span style={styles.gapLabel}>Occasion Duality Gap:</span>
                <span
                  style={{
                    ...styles.gapNumber,
                    color: Math.abs(dualityGap) > 20 ? "#b45309" : "#16a34a",
                  }}
                >
                  {dualityGap > 0 ? `+${dualityGap}%` : `${dualityGap}%`}
                </span>
              </div>
              <div style={styles.gapDescription}>
                {dualityGap > 20
                  ? "⚠️ High Social Sensitivity Gap: You are thrifty when alone, but social pressure causes spending to multiply significantly."
                  : dualityGap < -20
                  ? "ℹ️ Inverted Solo Gap: You defend boundaries with friends, but comfort spending spikes in solitude."
                  : "✅ Harmonious Alignment: Your financial choices stay consistent across both solo and social situations."}
              </div>
            </div>
          </div>

          {/* 5-Dimensional Behavioral Trait Breakdown */}
          <div style={styles.dimensionsSection}>
            <h3 style={styles.sectionHeading}>
              📊 5-Dimensional Behavioral Profile
            </h3>

            <div style={styles.dimensionList}>
              {[
                {
                  label: "Solo Financial Discipline",
                  val: dimensions.soloDiscipline || 70,
                  desc: "Ability to stick to budgets, avoid solitary splurges, and save consistently.",
                  color: "#16a34a",
                },
                {
                  label: "Peer Susceptibility & Contagion",
                  val: dimensions.socialSusceptibility || 45,
                  desc: "Vulnerability to matching peers' expensive tastes, rounds, or luxury orders.",
                  color: "#ea580c",
                },
                {
                  label: "Occasion Duality Index",
                  val: dimensions.occasionDuality || 50,
                  desc: "Magnitude of behavioral shift during celebratory events vs daily routine.",
                  color: "#8b5cf6",
                },
                {
                  label: "Impulse & Spontaneity Trigger",
                  val: dimensions.impulseRisk || 40,
                  desc: "Tendency to buy spontaneously during late-night flash sales or emotional lows.",
                  color: "#ef4444",
                },
                {
                  label: "Peer Boundary Firmness",
                  val: dimensions.peerBoundaryFirmness || 65,
                  desc: "Comfort saying 'no' to expensive outings and speaking up on unequal bill splits.",
                  color: "#0284c7",
                },
              ].map((dim, i) => (
                <div key={i} style={styles.dimensionRow}>
                  <div style={styles.dimensionHeader}>
                    <div>
                      <span style={styles.dimLabel}>{dim.label}</span>
                      <p style={styles.dimDesc}>{dim.desc}</p>
                    </div>
                    <span style={{ ...styles.dimVal, color: dim.color }}>
                      {Math.round(dim.val)}%
                    </span>
                  </div>
                  <div style={styles.dimBarTrack}>
                    <div
                      style={{
                        ...styles.dimBarFill,
                        width: `${Math.min(100, Math.max(0, dim.val))}%`,
                        backgroundColor: dim.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Real-World Transaction Grounding Alert (if verified) */}
          {realDataCorrelation && realDataCorrelation.verified_with_transactions && (
            <div style={styles.verifiedBox}>
              <div style={styles.verifiedHeader}>
                <span>✨</span>
                <strong>Grounded in Your Real Trackify Transactions</strong>
              </div>
              <p style={styles.verifiedText}>
                The behavioral model cross-referenced your profile with logged transactions:{" "}
                <strong>{realDataCorrelation.peer_expense_ratio}%</strong> of your discretionary spending was in peer-oriented categories (dining, outings, entertainment), and{" "}
                <strong>{realDataCorrelation.mood_impulsive_ratio}%</strong> carried an impulsive emotional tag.
              </p>
            </div>
          )}

          {/* Behavioral Risks & Pitfalls */}
          {risks && risks.length > 0 && (
            <div style={styles.risksSection}>
              <h3 style={styles.sectionHeading}>
                ⚠️ Identified Behavioral Blindspots & Risks
              </h3>
              <div style={styles.riskGrid}>
                {risks.map((risk, idx) => (
                  <div key={idx} style={styles.riskCard}>
                    <div style={styles.riskHeader}>
                      <span style={styles.riskTitle}>{risk.title}</span>
                      <span
                        style={{
                          ...styles.severityPill,
                          backgroundColor:
                            risk.severity === "Critical"
                              ? "#fee2e2"
                              : risk.severity === "High"
                              ? "#ffedd5"
                              : "#f1f5f9",
                          color:
                            risk.severity === "Critical"
                              ? "#b91c1c"
                              : risk.severity === "High"
                              ? "#c2410c"
                              : "#475569",
                        }}
                      >
                        {risk.severity} Severity
                      </span>
                    </div>
                    <p style={styles.riskDesc}>{risk.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actionable Behavioral Rules & Friction Scripts */}
          {rules && rules.length > 0 && (
            <div style={styles.rulesSection}>
              <h3 style={styles.sectionHeading}>
                💡 Custom Psychological Action Rules & Guardrails
              </h3>
              <div style={styles.ruleList}>
                {rules.map((rule, idx) => (
                  <div key={idx} style={styles.ruleCard}>
                    <div style={styles.ruleScenarioTag}>🎯 {rule.scenario}</div>
                    <h4 style={styles.ruleTitle}>{rule.rule}</h4>
                    <p style={styles.ruleRationale}>{rule.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions & Retake */}
          <div style={styles.actionRow}>
            <button onClick={restartQuiz} style={styles.restartBtn}>
              🔄 Retake Assessment
            </button>
            <Link to="/profile" style={styles.profileBtn}>
              👤 View in Profile
            </Link>
            <Link to="/dashboard" style={styles.dashboardBtn}>
              📊 Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────
  // VIEW 2: INTERACTIVE SCENARIO QUESTIONNAIRE
  // ────────────────────────────────────────────────────────────────
  const currentQ = questions[currentStep] || questions[0];
  const progressPercent = Math.round(((currentStep + 1) / questions.length) * 100);
  const selectedOption = answers[currentStep];

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        {/* Diagnostic Header */}
        <div style={styles.header}>
          <span style={styles.headerPill}>Dynamic Behavioral Model</span>
          <h1 style={styles.mainTitle}>Spending Personality Diagnostic</h1>
          <p style={styles.subtitle}>
            Explore realistic, nuanced scenarios measuring Self vs. Peer occasion habits, social pressure, and impulse triggers.
          </p>
        </div>

        {/* Progress Bar */}
        <div style={styles.progressContainer}>
          <div style={styles.progressInfo}>
            <span style={styles.stepCounter}>
              Scenario {currentStep + 1} of {questions.length}
            </span>
            <span style={styles.progressPct}>{progressPercent}% Complete</span>
          </div>
          <div style={styles.progressBarBg}>
            <div
              style={{ ...styles.progressBarFill, width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question & Scenario Box */}
        <div style={styles.scenarioCard}>
          <div style={styles.scenarioMetaRow}>
            <span style={styles.categoryBadge}>{currentQ.category}</span>
            <span style={styles.scenarioTypeBadge}>
              {currentQ.badgeLabel || "Contextual Scenario"}
            </span>
          </div>

          <h2 style={styles.scenarioText}>{currentQ.scenario}</h2>

          {/* Options */}
          <div style={styles.optionsList}>
            {currentQ.options.map((opt) => {
              const isSelected = selectedOption && selectedOption.id === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => handleSelectOption(opt)}
                  style={{
                    ...styles.optionCard,
                    ...(isSelected ? styles.optionCardSelected : {}),
                  }}
                >
                  <div
                    style={{
                      ...styles.radioIndicator,
                      ...(isSelected ? styles.radioIndicatorSelected : {}),
                    }}
                  >
                    {isSelected && <div style={styles.radioDot} />}
                  </div>
                  <span style={styles.optionText}>{opt.text}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div style={styles.controlRow}>
          <button
            onClick={handlePrev}
            disabled={currentStep === 0 || isAnalyzing}
            style={{
              ...styles.prevBtn,
              opacity: currentStep === 0 ? 0.4 : 1,
              cursor: currentStep === 0 ? "not-allowed" : "pointer",
            }}
          >
            ← Previous
          </button>

          <button
            onClick={handleNext}
            disabled={isAnalyzing}
            style={styles.nextBtn}
          >
            {isAnalyzing
              ? "Running ML Profiling..."
              : currentStep === questions.length - 1
              ? "Submit & Analyze Profile 🧠"
              : "Next Scenario →"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────
// PREMIUM CSS-IN-JS DESIGN SYSTEM
// ────────────────────────────────────────────────────────────────
const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    padding: "40px 16px",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "20px",
    boxShadow: "0 10px 30px -5px rgba(0, 0, 0, 0.07), 0 4px 12px -2px rgba(0, 0, 0, 0.04)",
    width: "100%",
    maxWidth: "880px",
    padding: "36px",
    border: "1px solid #e2e8f0",
  },
  header: {
    textAlign: "center",
    marginBottom: "28px",
  },
  headerPill: {
    background: "#eff6ff",
    color: "#2563eb",
    fontSize: "12px",
    fontWeight: "700",
    padding: "5px 14px",
    borderRadius: "20px",
    display: "inline-block",
    marginBottom: "10px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  mainTitle: {
    fontSize: "1.9rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px 0",
    fontFamily: "'Sora', sans-serif",
  },
  subtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
    maxWidth: "600px",
    margin: "0 auto",
    lineHeight: "1.5",
  },
  engineTag: {
    marginTop: "10px",
    fontSize: "11px",
    color: "#64748b",
    background: "#f1f5f9",
    padding: "4px 10px",
    borderRadius: "12px",
    display: "inline-block",
    fontWeight: "600",
  },
  progressContainer: {
    marginBottom: "24px",
  },
  progressInfo: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "8px",
  },
  stepCounter: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
  },
  progressPct: {
    fontSize: "13px",
    fontWeight: "600",
    color: "#2563eb",
  },
  progressBarBg: {
    width: "100%",
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563eb",
    borderRadius: "999px",
    transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  scenarioCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "26px",
    marginBottom: "28px",
  },
  scenarioMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "14px",
    flexWrap: "wrap",
  },
  categoryBadge: {
    background: "#dbeafe",
    color: "#1e40af",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 12px",
    borderRadius: "8px",
  },
  scenarioTypeBadge: {
    background: "#f1f5f9",
    color: "#475569",
    fontSize: "12px",
    fontWeight: "600",
    padding: "4px 10px",
    borderRadius: "8px",
  },
  scenarioText: {
    fontSize: "1.2rem",
    fontWeight: "700",
    color: "#1e293b",
    lineHeight: "1.45",
    marginBottom: "22px",
    fontFamily: "'Sora', sans-serif",
  },
  optionsList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  optionCard: {
    display: "flex",
    alignItems: "flex-start",
    gap: "14px",
    padding: "16px 18px",
    backgroundColor: "#ffffff",
    border: "1.5px solid #cbd5e1",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  optionCardSelected: {
    borderColor: "#2563eb",
    backgroundColor: "#eff6ff",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.12)",
  },
  radioIndicator: {
    width: "20px",
    height: "20px",
    borderRadius: "50%",
    border: "2px solid #94a3b8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginTop: "2px",
    flexShrink: 0,
    transition: "border-color 0.2s",
  },
  radioIndicatorSelected: {
    borderColor: "#2563eb",
  },
  radioDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
  },
  optionText: {
    fontSize: "0.95rem",
    color: "#334155",
    lineHeight: "1.5",
    fontWeight: "500",
  },
  controlRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: "16px",
  },
  prevBtn: {
    backgroundColor: "#f1f5f9",
    color: "#475569",
    border: "1px solid #cbd5e1",
    padding: "12px 24px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    transition: "all 0.2s",
  },
  nextBtn: {
    backgroundColor: "#1a2ea8",
    color: "#ffffff",
    border: "none",
    padding: "12px 28px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(26, 46, 168, 0.25)",
    transition: "all 0.2s",
  },

  // ── Results Styles ──
  archetypeCard: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "24px",
  },
  archetypeTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
    flexWrap: "wrap",
    gap: "12px",
  },
  badgePill: {
    background: "#e0e7ff",
    color: "#3730a3",
    fontSize: "12px",
    fontWeight: "700",
    padding: "4px 12px",
    borderRadius: "20px",
    display: "inline-block",
    marginBottom: "6px",
  },
  archetypeTitle: {
    fontSize: "1.45rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    fontFamily: "'Sora', sans-serif",
  },
  scoreCircle: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "#ffffff",
    border: "2px solid #2563eb",
    borderRadius: "14px",
    padding: "8px 16px",
    minWidth: "90px",
  },
  scoreValue: {
    fontSize: "1.5rem",
    fontWeight: "800",
    color: "#2563eb",
    lineHeight: "1",
  },
  scoreLabel: {
    fontSize: "10px",
    fontWeight: "700",
    color: "#64748b",
    marginTop: "2px",
  },
  archetypeSummary: {
    fontSize: "0.95rem",
    color: "#334155",
    lineHeight: "1.6",
    margin: 0,
  },

  // ── Duality Section Styles ──
  dualitySection: {
    backgroundColor: "#ffffff",
    border: "1.5px solid #bfdbfe",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "28px",
    boxShadow: "0 4px 12px rgba(37, 99, 235, 0.05)",
  },
  sectionHeaderBox: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px",
    flexWrap: "wrap",
    gap: "10px",
  },
  sectionHeading: {
    fontSize: "1.1rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 16px 0",
    fontFamily: "'Sora', sans-serif",
  },
  dualityStatusBadge: {
    background: "#dbeafe",
    color: "#1e40af",
    fontSize: "11px",
    fontWeight: "700",
    padding: "4px 12px",
    borderRadius: "20px",
  },
  dualityExplanation: {
    fontSize: "0.92rem",
    color: "#475569",
    lineHeight: "1.55",
    marginBottom: "20px",
  },
  dualityComparisonGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "16px",
    marginBottom: "20px",
  },
  dualityBox: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "18px",
  },
  dualityBoxHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "12px",
  },
  dualityBoxTitle: {
    fontSize: "0.95rem",
    fontWeight: "700",
    color: "#1e293b",
  },
  dualityBoxSub: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  dualityMeterBar: {
    height: "10px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
    marginBottom: "8px",
  },
  dualityMeterFill: {
    height: "100%",
    borderRadius: "999px",
  },
  dualityBoxScore: {
    fontSize: "0.88rem",
    fontWeight: "700",
    color: "#0f172a",
    textAlign: "right",
  },
  gapCallout: {
    background: "#fffbeb",
    border: "1px solid #fde68a",
    borderRadius: "12px",
    padding: "16px",
  },
  gapValueBox: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "4px",
  },
  gapLabel: {
    fontSize: "0.88rem",
    fontWeight: "700",
    color: "#92400e",
  },
  gapNumber: {
    fontSize: "1.1rem",
    fontWeight: "800",
  },
  gapDescription: {
    fontSize: "0.88rem",
    color: "#78350f",
    lineHeight: "1.5",
  },

  // ── 5D Dimensions Styles ──
  dimensionsSection: {
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    marginBottom: "28px",
  },
  dimensionList: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  dimensionRow: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  dimensionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  dimLabel: {
    fontSize: "0.92rem",
    fontWeight: "700",
    color: "#1e293b",
  },
  dimDesc: {
    fontSize: "0.8rem",
    color: "#64748b",
    margin: "2px 0 0 0",
  },
  dimVal: {
    fontSize: "0.95rem",
    fontWeight: "800",
  },
  dimBarTrack: {
    height: "8px",
    backgroundColor: "#e2e8f0",
    borderRadius: "999px",
    overflow: "hidden",
  },
  dimBarFill: {
    height: "100%",
    borderRadius: "999px",
  },

  // ── Verified Box ──
  verifiedBox: {
    background: "#ecfdf5",
    border: "1px solid #a7f3d0",
    borderRadius: "12px",
    padding: "16px 20px",
    marginBottom: "28px",
  },
  verifiedHeader: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#065f46",
    fontSize: "0.92rem",
    marginBottom: "4px",
  },
  verifiedText: {
    fontSize: "0.88rem",
    color: "#047857",
    lineHeight: "1.5",
    margin: 0,
  },

  // ── Risks & Rules Styles ──
  risksSection: {
    marginBottom: "28px",
  },
  riskGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "14px",
  },
  riskCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
  },
  riskHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "8px",
  },
  riskTitle: {
    fontSize: "0.92rem",
    fontWeight: "700",
    color: "#0f172a",
  },
  severityPill: {
    fontSize: "11px",
    fontWeight: "700",
    padding: "2px 8px",
    borderRadius: "10px",
  },
  riskDesc: {
    fontSize: "0.85rem",
    color: "#475569",
    lineHeight: "1.5",
    margin: 0,
  },

  rulesSection: {
    marginBottom: "28px",
  },
  ruleList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  ruleCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    padding: "16px",
  },
  ruleScenarioTag: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#2563eb",
    marginBottom: "4px",
  },
  ruleTitle: {
    fontSize: "0.95rem",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px 0",
  },
  ruleRationale: {
    fontSize: "0.88rem",
    color: "#475569",
    lineHeight: "1.5",
    margin: 0,
  },

  actionRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginTop: "20px",
  },
  restartBtn: {
    flex: 1,
    background: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    minWidth: "160px",
  },
  profileBtn: {
    flex: 1,
    background: "#ffffff",
    color: "#1e293b",
    border: "1px solid #cbd5e1",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "600",
    textAlign: "center",
    textDecoration: "none",
    minWidth: "160px",
  },
  dashboardBtn: {
    flex: 1,
    background: "#1a2ea8",
    color: "#ffffff",
    padding: "12px 20px",
    borderRadius: "10px",
    fontSize: "14px",
    fontWeight: "700",
    textAlign: "center",
    textDecoration: "none",
    boxShadow: "0 4px 12px rgba(26, 46, 168, 0.25)",
    minWidth: "160px",
  },

  loadingContainer: {
    minHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  spinner: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "4px solid #e2e8f0",
    borderTopColor: "#2563eb",
    animation: "spin 1s linear infinite",
  },
};

export default Quiz;
