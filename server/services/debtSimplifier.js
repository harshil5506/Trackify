/**
 * Trackify - Debt Simplification Service
 * Implements Greedy Min-Cash Flow Algorithm (similar to Splitwise)
 * 
 * Purpose:
 * Transforms an O(N^2) web of pairwise pending debts into at most (N - 1)
 * optimal direct payments, minimizing financial friction and cash transfers.
 */

/**
 * Calculates net balances and generates both pairwise debts and simplified settlements.
 * @param {Object} group - Populated Mongoose Group document
 * @returns {Object} { netBalances, simplifiedTransactions, pairwiseTransactions, metrics }
 */
function simplifyGroupDebts(group) {
  if (!group || !Array.isArray(group.members) || group.members.length === 0) {
    return {
      netBalances: [],
      simplifiedTransactions: [],
      pairwiseTransactions: [],
      metrics: {
        originalCount: 0,
        simplifiedCount: 0,
        transactionsSaved: 0,
        reductionPercentage: 0,
      },
    };
  }

  // 1. Build a map of members for quick reference
  const memberMap = new Map();
  group.members.forEach((m) => {
    const id = m._id ? m._id.toString() : m.toString();
    memberMap.set(id, {
      id,
      name: m.name || "Member",
      email: m.email || "",
    });
  });

  // 2. Track pairwise debts: debtMap[debtorId][creditorId] = amount
  const pairwiseDebtMap = new Map();

  const getPairwiseAmount = (fromId, toId) => {
    if (!pairwiseDebtMap.has(fromId)) return 0;
    return pairwiseDebtMap.get(fromId).get(toId) || 0;
  };

  const addPairwiseDebt = (fromId, toId, amount) => {
    if (fromId === toId || amount <= 0.001) return;
    if (!pairwiseDebtMap.has(fromId)) {
      pairwiseDebtMap.set(fromId, new Map());
    }
    const current = pairwiseDebtMap.get(fromId).get(toId) || 0;
    pairwiseDebtMap.get(fromId).set(toId, current + amount);
  };

  // 3. Track net balances for all members: netBalance = (Amount others owe me) - (Amount I owe others)
  const netBalanceMap = new Map();
  memberMap.forEach((_, id) => {
    netBalanceMap.set(id, 0);
  });

  // 4. Process all expenses in the group
  if (Array.isArray(group.expenses)) {
    group.expenses.forEach((expense) => {
      const payerId = expense.paidBy?._id
        ? expense.paidBy._id.toString()
        : expense.paidBy?.toString();

      if (!payerId) return;

      // Handle split shares
      if (Array.isArray(expense.splitBetween)) {
        expense.splitBetween.forEach((split) => {
          const debtorId = split.user?._id
            ? split.user._id.toString()
            : split.user?.toString();

          if (!debtorId || debtorId === payerId) return;

          // If the split is already marked settled, it doesn't count towards current pending debts
          if (split.settled) return;

          // The amount owed for this split
          const share = typeof split.share === "number" ? split.share : 0;
          if (share <= 0.001) return;

          // Add to pairwise debt: debtorId owes payerId
          addPairwiseDebt(debtorId, payerId, share);

          // Update net balances
          const currentPayerNet = netBalanceMap.get(payerId) || 0;
          const currentDebtorNet = netBalanceMap.get(debtorId) || 0;

          netBalanceMap.set(payerId, currentPayerNet + share);
          netBalanceMap.set(debtorId, currentDebtorNet - share);
        });
      }
    });
  }

  // 5. Raw pairwise debts (all directed debts before simplification)
  const rawPairwiseTransactions = [];
  pairwiseDebtMap.forEach((creditorMap, debtorId) => {
    creditorMap.forEach((amount, creditorId) => {
      const roundedAmount = parseFloat(amount.toFixed(2));
      if (roundedAmount > 0.01) {
        rawPairwiseTransactions.push({
          from: memberMap.get(debtorId),
          to: memberMap.get(creditorId),
          amount: roundedAmount,
        });
      }
    });
  });

  // 6. Format net balances list
  const formattedNetBalances = [];
  memberMap.forEach((memberInfo, id) => {
    const rawBalance = netBalanceMap.get(id) || 0;
    const rounded = parseFloat(rawBalance.toFixed(2));
    let status = "settled";
    if (rounded > 0.01) status = "gets_back";
    else if (rounded < -0.01) status = "owes";

    formattedNetBalances.push({
      user: memberInfo,
      netBalance: rounded,
      status,
    });
  });

  // Sort: biggest creditors first, then settled, then biggest debtors
  formattedNetBalances.sort((a, b) => b.netBalance - a.netBalance);

  // 7. Greedy Min-Cash Flow Algorithm
  // Partition members into Creditors (netBalance > 0.01) and Debtors (netBalance < -0.01)
  const creditors = [];
  const debtors = [];

  netBalanceMap.forEach((balance, id) => {
    const rounded = parseFloat(balance.toFixed(2));
    if (rounded > 0.01) {
      creditors.push({ id, amount: rounded });
    } else if (rounded < -0.01) {
      debtors.push({ id, amount: -rounded }); // store positive value of debt
    }
  });

  // Sort descending by amount for greedy matching
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const simplifiedTransactions = [];
  let cIdx = 0;
  let dIdx = 0;

  while (cIdx < creditors.length && dIdx < debtors.length) {
    const creditor = creditors[cIdx];
    const debtor = debtors[dIdx];

    // Settle minimum of current creditor and current debtor
    const settleAmount = Math.min(creditor.amount, debtor.amount);
    const roundedSettle = parseFloat(settleAmount.toFixed(2));

    if (roundedSettle > 0.01) {
      simplifiedTransactions.push({
        from: memberMap.get(debtor.id),
        to: memberMap.get(creditor.id),
        amount: roundedSettle,
      });
    }

    creditor.amount = parseFloat((creditor.amount - settleAmount).toFixed(2));
    debtor.amount = parseFloat((debtor.amount - settleAmount).toFixed(2));

    if (creditor.amount <= 0.01) cIdx++;
    if (debtor.amount <= 0.01) dIdx++;
  }

  // 8. Metrics calculation
  const originalCount = rawPairwiseTransactions.length;
  const simplifiedCount = simplifiedTransactions.length;
  const transactionsSaved = Math.max(0, originalCount - simplifiedCount);
  const reductionPercentage =
    originalCount > 0
      ? Math.round((transactionsSaved / originalCount) * 100)
      : 0;

  return {
    netBalances: formattedNetBalances,
    simplifiedTransactions,
    pairwiseTransactions: rawPairwiseTransactions,
    metrics: {
      originalCount,
      simplifiedCount,
      transactionsSaved,
      reductionPercentage,
    },
  };
}

module.exports = {
  simplifyGroupDebts,
};
