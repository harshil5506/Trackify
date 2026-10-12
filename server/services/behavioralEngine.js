/**
 * Trackify - Behavioral Spending Profiler Service
 * Integrates Scikit-Learn Python ML Profiling with Node.js Fallback Engine.
 * Incorporates User Transaction History from MongoDB for Real-World Grounding.
 */

const { spawn } = require("child_process");
const path = require("path");
const fs = require("fs");
const Expense = require("../models/Expense");

// Canonical archetype profiles for fallback engine
const FALLBACK_ARCHETYPES = [
  {
    key: "social_chameleon",
    title: "The Social Chameleon 🦎",
    badge: "Social Chameleon",
    centroid: [80.0, 75.0, 85.0, 45.0, 30.0],
    summary:
      "You are highly disciplined when managing expenses alone, but peer occasions create significant financial contagion. You tend to match group spending to fit in, leading to a noticeable Self vs. Peer duality gap.",
    bg: "#fef3c7",
    color: "#b45309",
    risks: [
      {
        title: "The Social Contagion Trap",
        severity: "High",
        description: "Matching upscale orders or rounds with friends despite having personal budget caps.",
      },
      {
        title: "Unequal Bill Absorption",
        severity: "Medium",
        description: "Reluctance to speak up when group bills are split evenly despite your lower consumption.",
      },
    ],
    rules: [
      {
        rule: "The Pre-Committed Outing Cap",
        scenario: "Peer Outings & Dining",
        rationale: "Transfer only your intended social spending into a separate wallet before leaving for group dinners.",
      },
      {
        rule: "The Non-Negotiable Bill Split Script",
        scenario: "Shared Restaurant Tabs",
        rationale: "Proactively offer to pay for your specific item upfront with quick math rather than waiting for an awkward split.",
      },
    ],
  },
  {
    key: "steadfast_fortress",
    title: "The Steadfast Fortress 🛡️",
    badge: "Steadfast Fortress",
    centroid: [90.0, 15.0, 15.0, 15.0, 90.0],
    summary:
      "You possess rock-solid financial discipline that remains virtually unaffected by peer pressure or festive occasions. Your personal budget boundaries are consistently upheld across both solo and group scenarios.",
    bg: "#dcfce7",
    color: "#15803d",
    risks: [
      {
        title: "Hyper-Austerity in Social Bonds",
        severity: "Low",
        description: "Risk of being overly rigid in celebratory occasions where shared experiences yield lasting memories.",
      },
    ],
    rules: [
      {
        rule: "The Guilt-Free Social Fun Fund",
        scenario: "Peer Gatherings",
        rationale: "Allocate an intentional 10% monthly buffer exclusively for social bonding so you can relax without feeling off-budget.",
      },
    ],
  },
  {
    key: "generous_host",
    title: "The Generous Host & Giver 🎁",
    badge: "Generous Host",
    centroid: [65.0, 80.0, 70.0, 50.0, 20.0],
    summary:
      "You derive genuine happiness from treating others and picking up shared tabs, but your empathy often overrides your own financial targets. You find it difficult to say 'no' to expensive group invites.",
    bg: "#e0e7ff",
    color: "#3730a3",
    risks: [
      {
        title: "Phantom Generosity Syndrome",
        severity: "High",
        description: "Silently absorbing extra expenses for friends that erode your monthly emergency savings.",
      },
    ],
    rules: [
      {
        rule: "The 24-Hour Social RSVP Pause",
        scenario: "Expensive Group Invitations",
        rationale: "Never say yes immediately to expensive trips or outings; take a 24-hour pause to review your monthly ledger.",
      },
    ],
  },
  {
    key: "balanced_realist",
    title: "The Balanced Realist ⚖️",
    badge: "Balanced Realist",
    centroid: [75.0, 35.0, 30.0, 35.0, 70.0],
    summary:
      "You maintain a healthy equilibrium between personal financial independence and vibrant social connection. You understand when to indulge intentionally with friends and when to enforce personal spending guardrails.",
    bg: "#dbeafe",
    color: "#1d4ed8",
    risks: [
      {
        title: "Occasion Budget Creep",
        severity: "Low",
        description: "Consecutive holiday or celebration weeks can occasionally stack up unnoticed.",
      },
    ],
    rules: [
      {
        rule: "Quarterly Social Audit",
        scenario: "Monthly Review",
        rationale: "Track how much of your discretionary spend goes to peer outings vs. solitary investments to maintain harmony.",
      },
    ],
  },
  {
    key: "impulse_free_spirit",
    title: "The Spontaneous Free-Spirit ⚡",
    badge: "Spontaneous Free-Spirit",
    centroid: [30.0, 70.0, 75.0, 85.0, 35.0],
    summary:
      "You prioritize living in the present moment. Spontaneity drives your decisions both in solitary browsing (late-night flash sales) and in social peer occasions. Long-term budgeting feels restrictive.",
    bg: "#fee2e2",
    color: "#b91c1c",
    risks: [
      {
        title: "Double-Sided Impulse Vulnerability",
        severity: "Critical",
        description: "Overspending both in solitary isolation and during social excitement.",
      },
    ],
    rules: [
      {
        rule: "The 48-Hour Wishlist Delay",
        scenario: "Solitary Shopping",
        rationale: "Force items into a cart or note for 48 hours before purchasing to verify genuine need.",
      },
    ],
  },
  {
    key: "solitary_splurger",
    title: "The Solitary Splurger 🎧",
    badge: "Solitary Splurger",
    centroid: [40.0, 30.0, 60.0, 70.0, 65.0],
    summary:
      "You are modest and frugal when with friends or colleagues, but you let your guard down in private. Solitary retail therapy, delivery, or digital gadgets serve as comfort mechanisms when you are alone.",
    bg: "#f3e8ff",
    color: "#7e22ce",
    risks: [
      {
        title: "Hidden Solitary Outflows",
        severity: "High",
        description: "Private convenience orders and late-night digital micro-transactions that add up quietly.",
      },
    ],
    rules: [
      {
        rule: "The Delivery App Barrier",
        scenario: "Late-Night Solitary Cravings",
        rationale: "Remove saved payment cards from delivery and e-commerce apps to introduce friction for solo impulsive orders.",
      },
    ],
  },
];

/**
 * Resolves the system's Python executable path
 */
function getPythonCommand() {
  const customWinPath = "C:\\Users\\Harshil Thakkar\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";
  if (fs.existsSync(customWinPath)) {
    return customWinPath;
  }
  return "python";
}

/**
 * Gathers user historical expense summary from MongoDB to ground ML scoring
 */
async function fetchUserTransactionContext(userId) {
  try {
    if (!userId) return null;
    const expenses = await Expense.find({ user: userId }).limit(100).lean();
    if (!expenses || expenses.length === 0) return null;

    let peerCategorySpent = 0;
    let totalSpent = 0;
    let impulsiveCount = 0;

    const peerCategories = ["Food", "Entertainment", "Dining", "Outing", "Shopping"];

    expenses.forEach((e) => {
      const amount = Number(e.amount) || 0;
      if (amount <= 0) return;
      totalSpent += amount;

      const cat = (e.category || "").trim();
      if (peerCategories.some((pc) => cat.toLowerCase().includes(pc.toLowerCase()))) {
        peerCategorySpent += amount;
      }

      const mood = (e.mood || "").toLowerCase();
      if (mood === "impulsive" || mood === "stressed" || mood === "bored") {
        impulsiveCount++;
      }
    });

    const peerRatio = totalSpent > 0 ? peerCategorySpent / totalSpent : 0.25;
    const impulsiveRatio = expenses.length > 0 ? impulsiveCount / expenses.length : 0.15;

    return {
      total_expenses_count: expenses.length,
      peer_expense_ratio: peerRatio,
      impulsive_tx_ratio: impulsiveRatio,
    };
  } catch (err) {
    console.warn("Could not query user transaction context:", err.message);
    return null;
  }
}

/**
 * Spawns Scikit-Learn Python Process to evaluate behavioral vectors
 */
function runPythonBehavioralML(answers, userHistory) {
  return new Promise((resolve, reject) => {
    const pythonScript = path.join(__dirname, "../ml/behavioral_quiz_profiler.py");
    const pyCmd = getPythonCommand();
    const payload = JSON.stringify({ answers, user_history: userHistory || {} });
    const b64Payload = Buffer.from(payload).toString("base64");

    const { execFile } = require("child_process");
    execFile(
      pyCmd,
      ["-u", pythonScript, b64Payload],
      { timeout: 9000, maxBuffer: 1024 * 1024 * 10 },
      (err, stdout, stderr) => {
        if (err) {
          return reject(
            new Error(
              err.killed
                ? "Python ML process timed out after 9000ms"
                : `Python ML process error: ${stderr || err.message}`
            )
          );
        }

        try {
          const parsed = JSON.parse(stdout.trim());
          if (parsed.error) return reject(new Error(parsed.error));
          resolve(parsed);
        } catch (parseErr) {
          reject(new Error(`Failed to parse Python ML output: ${stdout}`));
        }
      }
    );
  });
}

/**
 * Pure JavaScript Statistical & Dynamic Rule Fallback Engine
 * Ensures 100% continuous uptime and zero interruption.
 */
function runJsRuleEngineFallback(answers, userHistory) {
  const soloScores = [];
  const peerScores = [];
  const suscepList = [];
  const dualList = [];
  const impulseList = [];
  const boundaryList = [];

  answers.forEach((ans) => {
    const s = ans.dimensionScores || {};
    const type = ans.scenarioType || "general";

    const sDisc = Number(s.soloDiscipline || 5);
    const sSusc = Number(s.socialSusceptibility || 5);
    const oDual = Number(s.occasionDuality || 5);
    const iRisk = Number(s.impulseRisk || 5);
    const pBound = Number(s.peerBoundaryFirmness || 5);

    if (type === "self" || type === "solitary") {
      soloScores.push(sDisc);
    } else if (type === "peer" || type === "social") {
      peerScores.push(sDisc);
      suscepList.push(sSusc);
      boundaryList.push(pBound);
    } else if (type === "occasion" || type === "boundary") {
      dualList.push(oDual);
      suscepList.push(sSusc);
      boundaryList.push(pBound);
    }

    impulseList.push(iRisk);
    if (s.occasionDuality) dualList.push(oDual);
    if (s.socialSusceptibility) suscepList.push(sSusc);
    if (s.peerBoundaryFirmness) boundaryList.push(pBound);
  });

  const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 5);
  const to100 = (val) => Math.max(0, Math.min(100, ((val - 1) / 9) * 100));

  let vSolo = to100(avg(soloScores));
  let vSusc = to100(avg(suscepList));
  let vDual = to100(avg(dualList));
  let vImpulse = to100(avg(impulseList));
  let vBound = to100(avg(boundaryList));

  const selfNorm = to100(avg(soloScores));
  const peerNorm = to100(avg(peerScores));
  const rawGap = Math.round((selfNorm - peerNorm) * 10) / 10;

  const realCorr = {
    verified_with_transactions: false,
    peer_expense_ratio: null,
    mood_impulsive_ratio: null,
    confidence_score: 0.88,
  };

  if (userHistory && userHistory.total_expenses_count >= 5) {
    realCorr.verified_with_transactions = true;
    realCorr.peer_expense_ratio = Math.round((userHistory.peer_expense_ratio || 0) * 1000) / 10;
    realCorr.mood_impulsive_ratio = Math.round((userHistory.impulsive_tx_ratio || 0) * 1000) / 10;
    if (userHistory.peer_expense_ratio > 0.4) {
      vSusc = Math.min(100, vSusc * 1.15);
      vDual = Math.min(100, vDual * 1.1);
    }
    if (userHistory.impulsive_tx_ratio > 0.25) {
      vImpulse = Math.min(100, vImpulse * 1.2);
    }
    realCorr.confidence_score = 0.92;
  }

  // Calculate Euclidean distance to each centroid
  const userVec = [vSolo, vSusc, vDual, vImpulse, vBound];
  let minDistance = Infinity;
  let bestArchetype = FALLBACK_ARCHETYPES[0];

  FALLBACK_ARCHETYPES.forEach((arch) => {
    let sumSq = 0;
    for (let i = 0; i < 5; i++) {
      sumSq += Math.pow(userVec[i] - arch.centroid[i], 2);
    }
    const dist = Math.sqrt(sumSq);
    if (dist < minDistance) {
      minDistance = dist;
      bestArchetype = arch;
    }
  });

  const matchConfidence = Math.max(55, Math.min(99, Math.round(100 - minDistance / 1.7)));

  let dualityStatus = "Occasion Harmony";
  let dualityInterpretation = `Harmonious Occasion Alignment (Gap: ${Math.abs(rawGap)}%): Your financial values remain steady across both solitary and peer occasion settings.`;

  if (rawGap > 20) {
    dualityStatus = "High Social Sensitivity";
    dualityInterpretation = `Pronounced Social Chameleonic Gap (+${rawGap}%): You practice strong self-discipline in solitary scenarios (${Math.round(selfNorm)}%), but your boundaries soften during peer occasions and group gatherings (${Math.round(peerNorm)}%).`;
  } else if (rawGap < -20) {
    dualityStatus = "Solo Compensation";
    dualityInterpretation = `Inverted Solo Duality (${rawGap}%): You are exceptionally thrifty around friends (${Math.round(peerNorm)}%), but compensate by splurging on solo comfort purchases in private (${Math.round(selfNorm)}%).`;
  }

  const overallScore = Math.round(
    vSolo * 0.35 + (100 - vSusc) * 0.25 + (100 - vDual) * 0.15 + (100 - vImpulse) * 0.15 + vBound * 0.1
  );

  return {
    archetype: bestArchetype.key,
    title: bestArchetype.title,
    badge: bestArchetype.badge,
    score: overallScore,
    summary: bestArchetype.summary,
    bg: bestArchetype.bg,
    color: bestArchetype.color,
    matchConfidence,
    dimensions: {
      soloDiscipline: Math.round(vSolo * 10) / 10,
      socialSusceptibility: Math.round(vSusc * 10) / 10,
      occasionDuality: Math.round(vDual * 10) / 10,
      impulseRisk: Math.round(vImpulse * 10) / 10,
      peerBoundaryFirmness: Math.round(vBound * 10) / 10,
    },
    dualityAnalysis: {
      selfScore: Math.round(selfNorm * 10) / 10,
      peerScore: Math.round(peerNorm * 10) / 10,
      dualityGap: rawGap,
      status: dualityStatus,
      interpretation: dualityInterpretation,
    },
    risks: bestArchetype.risks,
    rules: bestArchetype.rules,
    realDataCorrelation: realCorr,
    completedAt: new Date(),
  };
}

/**
 * Main Service API: Profiling Pipeline
 */
async function analyzeBehavioralSpendingProfile(userId, answers) {
  const userHistory = await fetchUserTransactionContext(userId);

  try {
    const mlResult = await runPythonBehavioralML(answers, userHistory);
    mlResult.completedAt = new Date();
    mlResult.engine = "Python Scikit-Learn Ensemble";
    return mlResult;
  } catch (pyErr) {
    console.warn("Python ML profiler unavailable, using Node.js Dynamic Rule Engine:", pyErr.message);
    const fallbackResult = runJsRuleEngineFallback(answers, userHistory);
    fallbackResult.engine = "Node.js Dynamic Rule Engine (Fallback)";
    return fallbackResult;
  }
}

module.exports = {
  analyzeBehavioralSpendingProfile,
  fetchUserTransactionContext,
};
