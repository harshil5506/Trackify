const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const Investment = require("../models/Investment");

// Helper to compute portfolio metrics
function computePortfolioMetrics(investments) {
  let totalInvested = 0;
  let totalCurrentValue = 0;
  const classMap = {};

  investments.forEach((inv) => {
    const invAmt = Number(inv.investedAmount) || 0;
    const curVal = Number(inv.currentValue) || 0;
    totalInvested += invAmt;
    totalCurrentValue += curVal;

    const cls = inv.assetClass || "Other";
    if (!classMap[cls]) {
      classMap[cls] = { assetClass: cls, invested: 0, currentValue: 0, count: 0 };
    }
    classMap[cls].invested += invAmt;
    classMap[cls].currentValue += curVal;
    classMap[cls].count += 1;
  });

  const totalReturns = totalCurrentValue - totalInvested;
  const returnPercentage =
    totalInvested > 0 ? (totalReturns / totalInvested) * 100 : 0;

  const assetAllocation = Object.values(classMap).map((c) => ({
    ...c,
    percentage:
      totalCurrentValue > 0
        ? Math.round((c.currentValue / totalCurrentValue) * 1000) / 10
        : 0,
    returns: c.currentValue - c.invested,
    returnPercentage:
      c.invested > 0 ? Math.round(((c.currentValue - c.invested) / c.invested) * 1000) / 10 : 0,
  })).sort((a, b) => b.currentValue - a.currentValue);

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalCurrentValue: Math.round(totalCurrentValue * 100) / 100,
    totalReturns: Math.round(totalReturns * 100) / 100,
    returnPercentage: Math.round(returnPercentage * 10) / 10,
    isProfit: totalReturns >= 0,
    assetCount: investments.length,
    assetAllocation,
  };
}

/**
 * GET /api/investments
 * List all investments for user + calculated portfolio metrics
 */
router.get("/", authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id })
      .sort({ currentValue: -1, createdAt: -1 })
      .lean();

    const summary = computePortfolioMetrics(investments);

    res.json({
      investments,
      summary,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch investments", error: err.message });
  }
});

/**
 * GET /api/investments/summary
 * Lightweight portfolio metrics for dashboard widgets
 */
router.get("/summary", authMiddleware, async (req, res) => {
  try {
    const investments = await Investment.find({ user: req.user.id }).lean();
    const summary = computePortfolioMetrics(investments);
    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch summary", error: err.message });
  }
});

/**
 * POST /api/investments
 * Add a new investment asset
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const {
      name,
      assetClass,
      investedAmount,
      currentValue,
      quantity,
      buyDate,
      institution,
      notes,
    } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Asset name is required" });
    }
    if (investedAmount === undefined || isNaN(Number(investedAmount))) {
      return res.status(400).json({ message: "Valid invested amount is required" });
    }

    const newAsset = new Investment({
      user: req.user.id,
      name: name.trim(),
      assetClass: assetClass || "Stocks",
      investedAmount: Number(investedAmount),
      currentValue: currentValue !== undefined ? Number(currentValue) : Number(investedAmount),
      quantity: quantity ? Number(quantity) : 1,
      buyDate: buyDate ? new Date(buyDate) : new Date(),
      institution: institution ? institution.trim() : "",
      notes: notes ? notes.trim() : "",
    });

    await newAsset.save();
    res.status(201).json({ message: "Investment asset added successfully", asset: newAsset });
  } catch (err) {
    res.status(500).json({ message: "Failed to add investment", error: err.message });
  }
});

/**
 * PUT /api/investments/:id
 * Update an existing investment asset
 */
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const asset = await Investment.findOne({ _id: req.params.id, user: req.user.id });
    if (!asset) {
      return res.status(404).json({ message: "Investment asset not found" });
    }

    const {
      name,
      assetClass,
      investedAmount,
      currentValue,
      quantity,
      buyDate,
      institution,
      notes,
    } = req.body;

    if (name) asset.name = name.trim();
    if (assetClass) asset.assetClass = assetClass;
    if (investedAmount !== undefined) asset.investedAmount = Number(investedAmount);
    if (currentValue !== undefined) asset.currentValue = Number(currentValue);
    if (quantity !== undefined) asset.quantity = Number(quantity);
    if (buyDate) asset.buyDate = new Date(buyDate);
    if (institution !== undefined) asset.institution = institution.trim();
    if (notes !== undefined) asset.notes = notes.trim();

    await asset.save();
    res.json({ message: "Investment asset updated successfully", asset });
  } catch (err) {
    res.status(500).json({ message: "Failed to update investment", error: err.message });
  }
});

/**
 * DELETE /api/investments/:id
 * Delete an investment asset
 */
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const asset = await Investment.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id,
    });

    if (!asset) {
      return res.status(404).json({ message: "Investment asset not found" });
    }

    res.json({ message: "Investment asset deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete investment", error: err.message });
  }
});

module.exports = router;
