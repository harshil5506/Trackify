/**
 * Trackify - Spending Prediction Service
 * Bridges Express.js with the Scikit-Learn Python ML Model
 * Includes a robust Node.js statistical fallback engine for 100% uptime.
 */

const { spawn, execFile } = require("child_process");
const path = require("path");
const fs = require("fs");

function getPythonCommand() {
  const customWinPath = "C:\\Users\\Harshil Thakkar\\AppData\\Local\\Programs\\Python\\Python312\\python.exe";
  if (fs.existsSync(customWinPath)) {
    return customWinPath;
  }
  return "python";
}

/**
 * Predicts spending using the Python Scikit-Learn script.
 */
function predictWithPython(expenses, budgets, monthlyThreshold) {
  return new Promise((resolve, reject) => {
    const pythonScriptPath = path.join(__dirname, "../ml/predict_spending.py");
    const pyCmd = getPythonCommand();
    const payload = JSON.stringify({ expenses, budgets, monthlyThreshold });
    const b64Payload = Buffer.from(payload).toString("base64");

    execFile(
      pyCmd,
      ["-u", pythonScriptPath, b64Payload],
      { timeout: 9000, maxBuffer: 1024 * 1024 * 10 },
      (err, stdout, stderr) => {
        if (err) {
          return reject(
            new Error(
              err.killed
                ? "Python prediction process timed out after 9000ms"
                : `Python prediction process error: ${stderr || err.message}`
            )
          );
        }

        try {
          const result = JSON.parse(stdout.trim());
          if (result.error) {
            return reject(new Error(result.error));
          }
          resolve(result);
        } catch (parseErr) {
          reject(new Error(`Failed to parse Python ML output: ${stdout}`));
        }
      }
    );
  });
}

/**
 * Computes End-of-Month Expenditure Trend & Real-Time Daily Spend Velocity Forecast in Node.js
 */
function computeEomVelocityFallback(
  expenses,
  budgets,
  monthlyThreshold,
  currentYear,
  currentMonth,
  currentDay,
  daysInMonth
) {
  const dailySpend = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dailySpend[d] = 0;
  }

  expenses.forEach((e) => {
    if (e.type !== "expense") return;
    const amt = parseFloat(e.amount || 0);
    if (amt <= 0) return;
    const dt = new Date(e.date || Date.now());
    if (dt.getFullYear() === currentYear && dt.getMonth() + 1 === currentMonth) {
      const d = Math.min(daysInMonth, Math.max(1, dt.getDate()));
      dailySpend[d] = (dailySpend[d] || 0) + amt;
    }
  });

  const elapsedDays = Math.min(daysInMonth, Math.max(1, currentDay));
  const daysRemaining = Math.max(0, daysInMonth - elapsedDays);

  const cumulativeSpend = {};
  let runningTotal = 0;
  for (let d = 1; d <= elapsedDays; d++) {
    runningTotal += dailySpend[d];
    cumulativeSpend[d] = runningTotal;
  }

  const spentSoFar = cumulativeSpend[elapsedDays];

  let totalBudgetLimit =
    Number(monthlyThreshold) > 0 ? Number(monthlyThreshold) : 0;
  if (totalBudgetLimit <= 0 && budgets?.length > 0) {
    totalBudgetLimit = budgets.reduce(
      (acc, b) => acc + Number(b.limit || 0),
      0
    );
  }
  if (totalBudgetLimit <= 0) {
    totalBudgetLimit =
      spentSoFar > 0 ? Math.max(10000, Math.round(spentSoFar * 1.35)) : 30000;
  }

  // 1. Velocities
  const vCurrent = spentSoFar / Math.max(1, elapsedDays);

  // 7-day SMA
  const smaWindow = Math.min(7, elapsedDays);
  let smaSum = 0;
  for (let d = elapsedDays - smaWindow + 1; d <= elapsedDays; d++) {
    smaSum += dailySpend[d] || 0;
  }
  const vSma7 = smaSum / Math.max(1, smaWindow);

  // EMA (alpha = 0.25)
  const alpha = 0.25;
  let ema = dailySpend[1] || 0;
  for (let d = 2; d <= elapsedDays; d++) {
    ema = alpha * (dailySpend[d] || 0) + (1 - alpha) * ema;
  }
  const vEma = ema;

  const remainingBudget = Math.max(0, totalBudgetLimit - spentSoFar);
  const vSafe = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;

  const burnRatio =
    vSafe > 0 ? vEma / vSafe : spentSoFar > totalBudgetLimit ? 2.5 : 1.0;
  let pacingStatus = "PACING_SAFE";
  let pacingLabel = "Pacing Safe (Under Budget Run-rate)";
  let pacingColor = "#16a34a";
  if (burnRatio > 1.15) {
    pacingStatus = "PACING_ACCELERATED";
    pacingLabel = "Accelerated Burn (High Overrun Risk)";
    pacingColor = "#dc2626";
  } else if (burnRatio > 0.9) {
    pacingStatus = "PACING_MODERATE";
    pacingLabel = "Pacing Moderate (Nearing Threshold Pace)";
    pacingColor = "#d97706";
  }

  // 2. Linear Regression on Cumulative Spend
  let m = vCurrent;
  let c = 0;
  let r2 = 0.9;
  let stdErr = 100;
  let yReg = spentSoFar + vCurrent * daysRemaining;

  if (elapsedDays >= 2) {
    const X = [];
    const Y = [];
    for (let d = 1; d <= elapsedDays; d++) {
      X.push(d);
      Y.push(cumulativeSpend[d]);
    }
    const n = X.length;
    const sumX = X.reduce((a, b) => a + b, 0);
    const sumY = Y.reduce((a, b) => a + b, 0);
    const sumXY = X.reduce((acc, xi, idx) => acc + xi * Y[idx], 0);
    const sumX2 = X.reduce((acc, xi) => acc + xi * xi, 0);
    const denom = n * sumX2 - sumX * sumX;
    m = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : vCurrent;
    c = (sumY - m * sumX) / n;

    const yPred = X.map((xi) => m * xi + c);
    const meanY = sumY / n;
    const ssTot = Y.reduce((acc, yi) => acc + Math.pow(yi - meanY, 2), 0);
    const ssRes = Y.reduce(
      (acc, yi, idx) => acc + Math.pow(yi - yPred[idx], 2),
      0
    );
    r2 = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0.85;
    stdErr = Math.sqrt(ssRes / Math.max(1, elapsedDays - 1));
    yReg = Math.max(spentSoFar, m * daysInMonth + c);
  }

  // Moving Average Projection
  const yMa = spentSoFar + vEma * daysRemaining;

  // Blended
  const blendWeight = elapsedDays < 4 ? 0.25 : 0.5;
  const yEom = Math.max(
    spentSoFar,
    parseFloat((blendWeight * yReg + (1 - blendWeight) * yMa).toFixed(2))
  );

  const ciMargin = Math.max(
    150,
    parseFloat(
      (
        1.96 *
        stdErr *
        Math.sqrt(daysRemaining / Math.max(1, daysInMonth))
      ).toFixed(2)
    ),
    parseFloat((yEom * 0.04).toFixed(2))
  );
  const ciUpper = parseFloat((yEom + ciMargin).toFixed(2));
  const ciLower = parseFloat(Math.max(spentSoFar, yEom - ciMargin).toFixed(2));

  // Trajectory
  const trajectory = [];
  const dailyTargetPace = totalBudgetLimit / daysInMonth;

  for (let d = 1; d <= daysInMonth; d++) {
    const targetPaceCum = parseFloat((dailyTargetPace * d).toFixed(2));
    if (d < elapsedDays) {
      trajectory.push({
        day: d,
        label: `Day ${d}`,
        actualCumulative: parseFloat(cumulativeSpend[d].toFixed(2)),
        dailySpend: parseFloat(dailySpend[d].toFixed(2)),
        projectedCumulative: null,
        confidenceUpper: null,
        confidenceLower: null,
        targetPace: targetPaceCum,
      });
    } else if (d === elapsedDays) {
      trajectory.push({
        day: d,
        label: `Day ${d} (Today)`,
        actualCumulative: parseFloat(spentSoFar.toFixed(2)),
        dailySpend: parseFloat(dailySpend[d].toFixed(2)),
        projectedCumulative: parseFloat(spentSoFar.toFixed(2)),
        confidenceUpper: parseFloat(spentSoFar.toFixed(2)),
        confidenceLower: parseFloat(spentSoFar.toFixed(2)),
        targetPace: targetPaceCum,
      });
    } else {
      const p = (d - elapsedDays) / Math.max(1, daysRemaining);
      const projVal = spentSoFar + p * (yEom - spentSoFar);
      const stepCi = ciMargin * Math.sqrt(p);
      trajectory.push({
        day: d,
        label: `Day ${d}`,
        actualCumulative: null,
        dailySpend: null,
        projectedCumulative: parseFloat(projVal.toFixed(2)),
        confidenceUpper: parseFloat((projVal + stepCi).toFixed(2)),
        confidenceLower: parseFloat(
          Math.max(spentSoFar, projVal - stepCi).toFixed(2)
        ),
        targetPace: targetPaceCum,
      });
    }
  }

  const overrunAmt = Math.max(0, yEom - totalBudgetLimit);
  let advice = "";
  if (overrunAmt > 0) {
    if (daysRemaining > 0) {
      advice = `Projected to exceed budget by ₹${overrunAmt.toFixed(0)}. Reduce daily burn from ₹${vEma.toFixed(0)}/day to ₹${vSafe.toFixed(0)}/day for the remaining ${daysRemaining} days to finish on budget.`;
    } else {
      advice = `Month completed with ₹${overrunAmt.toFixed(0)} above budget target.`;
    }
  } else {
    const bufferAmt = totalBudgetLimit - yEom;
    advice = `On track! Projected surplus of ₹${bufferAmt.toFixed(0)}. Current daily velocity of ₹${vEma.toFixed(0)}/day is well below the safe pace of ₹${vSafe.toFixed(0)}/day.`;
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return {
    monthName: `${monthNames[currentMonth - 1]} ${currentYear}`,
    totalDaysInMonth: daysInMonth,
    elapsedDays,
    daysRemaining,
    spentSoFar: parseFloat(spentSoFar.toFixed(2)),
    totalBudgetLimit: parseFloat(totalBudgetLimit.toFixed(2)),
    currentDailyVelocity: parseFloat(vCurrent.toFixed(2)),
    sma7DailyVelocity: parseFloat(vSma7.toFixed(2)),
    emaDailyVelocity: parseFloat(vEma.toFixed(2)),
    safeTargetVelocity: parseFloat(vSafe.toFixed(2)),
    velocityBurnRatio: parseFloat(burnRatio.toFixed(2)),
    pacingStatus,
    pacingLabel,
    pacingColor,
    projectedEomTotal: yEom,
    confidenceRange: {
      upper: ciUpper,
      lower: ciLower,
      margin: ciMargin,
    },
    projectedOverrunAmount: parseFloat(overrunAmt.toFixed(2)),
    projectedSurplusAmount: parseFloat(
      Math.max(0, totalBudgetLimit - yEom).toFixed(2)
    ),
    projectedUtilizationPct:
      totalBudgetLimit > 0
        ? parseFloat(((yEom / totalBudgetLimit) * 100).toFixed(1))
        : 100.0,
    actionableAdvice: advice,
    modelStats: {
      regressionSlope: parseFloat(m.toFixed(2)),
      regressionR2: parseFloat(r2.toFixed(3)),
      emaAlpha: alpha,
      smaWindow,
    },
    dailyTrajectory: trajectory,
  };
}

/**
 * Pure JavaScript Statistical ML Fallback Engine
 * Uses Ordinary Least Squares (OLS) Linear Regression & Category Trend Decomposition.
 */
function predictWithNodeFallback(expenses, budgets, monthlyThreshold) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // 1-indexed
  const currentDay = Math.max(1, now.getDate());
  const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();

  const validExpenses = expenses.filter(
    (e) => e.type === "expense" && Number(e.amount) > 0
  );

  const monthlyTotals = {};
  const monthlyCategoryTotals = {};

  validExpenses.forEach((e) => {
    const d = new Date(e.date || Date.now());
    const mKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const amt = parseFloat(e.amount);
    const cat = e.category || "General";

    monthlyTotals[mKey] = (monthlyTotals[mKey] || 0) + amt;

    if (!monthlyCategoryTotals[mKey]) monthlyCategoryTotals[mKey] = {};
    monthlyCategoryTotals[mKey][cat] =
      (monthlyCategoryTotals[mKey][cat] || 0) + amt;
  });

  const sortedMonths = Object.keys(monthlyTotals).sort();

  let X = [];
  let y = [];
  let labels = [];

  if (sortedMonths.length < 2) {
    const totalRecent = validExpenses.reduce((s, e) => s + parseFloat(e.amount), 0);
    const baseline = totalRecent > 0 ? totalRecent : 5000;
    X = [1, 2, 3];
    y = [baseline * 0.9, baseline * 0.95, baseline];
    labels = ["Month -2", "Month -1", "Current Month"];
  } else {
    labels = sortedMonths;
    X = sortedMonths.map((_, i) => i + 1);
    y = sortedMonths.map((m) => monthlyTotals[m]);
  }

  // OLS Linear Regression: y = m*X + c
  const n = X.length;
  const sumX = X.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = X.reduce((acc, xi, idx) => acc + xi * y[idx], 0);
  const sumX2 = X.reduce((acc, xi) => acc + xi * xi, 0);

  const denom = n * sumX2 - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;

  // Predict Next Month (t = n + 1)
  const nextMonthX = n + 1;
  let predictedVal = Math.max(100, slope * nextMonthX + intercept);

  // In-sample predictions & R2
  const yPred = X.map((xi) => slope * xi + intercept);
  const meanY = sumY / n;
  const ssTot = y.reduce((acc, yi) => acc + Math.pow(yi - meanY, 2), 0);
  const ssRes = y.reduce((acc, yi, idx) => acc + Math.pow(yi - yPred[idx], 2), 0);
  const r2 = ssTot !== 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0.88;
  const mae = y.reduce((acc, yi, idx) => acc + Math.abs(yi - yPred[idx]), 0) / n;

  const margin = Math.round(Math.max(200, Math.sqrt(ssRes / Math.max(1, n)) * 1.5));

  // Category Forecasts
  const catWeights = {};
  const recentMonthKey = sortedMonths[sortedMonths.length - 1];
  if (recentMonthKey && monthlyCategoryTotals[recentMonthKey]) {
    const recentCats = monthlyCategoryTotals[recentMonthKey];
    const recTotal = Object.values(recentCats).reduce((a, b) => a + b, 0);
    if (recTotal > 0) {
      Object.keys(recentCats).forEach((c) => {
        catWeights[c] = recentCats[c] / recTotal;
      });
    }
  }

  if (Object.keys(catWeights).length === 0) {
    const allCats = [
      ...new Set(validExpenses.map((e) => e.category || "General")),
    ];
    const defaultCats = allCats.length > 0 ? allCats : ["Food", "Transport", "Bills"];
    defaultCats.forEach((c) => {
      catWeights[c] = 1 / defaultCats.length;
    });
  }

  const categoryForecasts = Object.keys(catWeights).map((cat) => {
    const weight = catWeights[cat];
    const catPredicted = parseFloat((predictedVal * weight).toFixed(2));
    const recentSpent =
      (monthlyCategoryTotals[recentMonthKey] &&
        monthlyCategoryTotals[recentMonthKey][cat]) ||
      parseFloat((catPredicted * 0.95).toFixed(2));
    const changePct =
      recentSpent > 0
        ? parseFloat((((catPredicted - recentSpent) / recentSpent) * 100).toFixed(1))
        : 0;

    return {
      category: cat,
      currentSpent: parseFloat(recentSpent.toFixed(2)),
      predictedNextMonth: catPredicted,
      changePct,
      allocationPct: parseFloat((weight * 100).toFixed(1)),
    };
  });

  categoryForecasts.sort((a, b) => b.predictedNextMonth - a.predictedNextMonth);

  // Budget Overrun Risks
  const budgetOverrunRisks = [];
  const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const currentMonthCatSpent = monthlyCategoryTotals[currentMonthKey] || {};

  budgets.forEach((b) => {
    const limit = parseFloat(b.limit || 0);
    const cat = b.category;
    if (limit <= 0 || !cat) return;

    const spentSoFar = parseFloat(
      b.spent !== undefined ? b.spent : currentMonthCatSpent[cat] || 0
    );
    const dailyRate = spentSoFar / Math.max(1, currentDay);
    const projectedSpend = parseFloat((dailyRate * daysInMonth).toFixed(2));
    const utilizationRate = parseFloat(((projectedSpend / limit) * 100).toFixed(1));

    if (projectedSpend > limit) {
      const breachDay =
        dailyRate > 0
          ? Math.min(daysInMonth, Math.max(1, Math.floor(limit / dailyRate)))
          : currentDay;

      budgetOverrunRisks.push({
        category: cat,
        limit,
        spentSoFar,
        projectedSpend,
        utilizationRate,
        riskLevel: utilizationRate > 120 ? "HIGH" : "MEDIUM",
        projectedBreachDay: breachDay,
        alertMessage: `At your current burn-rate of ₹${dailyRate.toFixed(1)}/day, your ${cat} budget (₹${limit}) will be exceeded by Day ${breachDay} (Projected: ₹${projectedSpend}, ${utilizationRate}% usage).`,
      });
    }
  });

  // Chart Data
  const chartData = labels.map((lbl, idx) => ({
    period: lbl,
    actual: parseFloat(y[idx].toFixed(2)),
    predicted: parseFloat(yPred[idx].toFixed(2)),
    type: "historical",
  }));

  const nextMonthNum = (currentMonth % 12) + 1;
  const nextYearNum = currentMonth < 12 ? currentYear : currentYear + 1;
  const nextLabel = `${nextYearNum}-${String(nextMonthNum).padStart(2, "0")} (Forecast)`;

  chartData.push({
    period: nextLabel,
    actual: null,
    predicted: parseFloat(predictedVal.toFixed(2)),
    type: "forecast",
  });

  const eomVelocity = computeEomVelocityFallback(
    expenses,
    budgets,
    monthlyThreshold,
    currentYear,
    currentMonth,
    currentDay,
    daysInMonth
  );

  return {
    predictedNextMonthTotal: parseFloat(predictedVal.toFixed(2)),
    predictedRange: {
      min: Math.max(50, parseFloat((predictedVal - margin).toFixed(2))),
      max: parseFloat((predictedVal + margin).toFixed(2)),
      margin,
    },
    trendDirection: slope > 50 ? "increasing" : slope < -50 ? "decreasing" : "stable",
    trendLabel:
      slope > 50
        ? "Upward (+ spending trend)"
        : slope < -50
          ? "Downward (Savings trend)"
          : "Stable",
    modelMetrics: {
      algorithm: "Time-Series Linear Regression (Statistical Fallback)",
      r2Score: parseFloat(r2.toFixed(3)),
      mae: parseFloat(mae.toFixed(2)),
      slope: parseFloat(slope.toFixed(2)),
      samplesCount: n,
    },
    categoryForecasts,
    budgetOverrunRisks,
    chartData,
    eomVelocityForecast: eomVelocity,
  };
}

/**
 * Main prediction executor: Tries Python Scikit-Learn first,
 * seamlessly falls back to Node.js OLS regression if Python isn't available.
 */
async function predictSpending(expenses, budgets, monthlyThreshold = null) {
  try {
    const pythonResult = await predictWithPython(expenses, budgets, monthlyThreshold);
    return pythonResult;
  } catch (err) {
    console.warn("⚠️ Python ML invocation failed, using Node.js statistical ML engine:", err.message);
    return predictWithNodeFallback(expenses, budgets, monthlyThreshold);
  }
}

module.exports = {
  predictSpending,
};
