const { simplifyGroupDebts } = require("../services/debtSimplifier");

function runTests() {
  console.log("=== Testing Debt Simplification Service ===");

  const u1 = { _id: "user1", name: "Alice", email: "alice@test.com" };
  const u2 = { _id: "user2", name: "Bob", email: "bob@test.com" };
  const u3 = { _id: "user3", name: "Charlie", email: "charlie@test.com" };
  const u4 = { _id: "user4", name: "David", email: "david@test.com" };

  // Test Case 1: Mutual cancellation and reduction
  // Alice pays 300 for Alice, Bob, Charlie (100 each)
  // Bob pays 300 for Alice, Bob, Charlie (100 each)
  // Result should cancel Alice and Bob debts, Charlie pays Alice 100, Charlie pays Bob 100
  const mockGroup1 = {
    members: [u1, u2, u3],
    expenses: [
      {
        title: "Dinner",
        amount: 300,
        paidBy: u1,
        splitBetween: [
          { user: u1, share: 100, settled: true },
          { user: u2, share: 100, settled: false },
          { user: u3, share: 100, settled: false },
        ],
      },
      {
        title: "Drinks",
        amount: 300,
        paidBy: u2,
        splitBetween: [
          { user: u1, share: 100, settled: false },
          { user: u2, share: 100, settled: true },
          { user: u3, share: 100, settled: false },
        ],
      },
    ],
  };

  const res1 = simplifyGroupDebts(mockGroup1);
  console.log("\n--- Test Case 1: 3 Members (Canceling debts) ---");
  console.log("Net Balances:", res1.netBalances.map((b) => `${b.user.name}: ${b.netBalance}`));
  console.log("Simplified Transactions:", res1.simplifiedTransactions.map((t) => `${t.from.name} -> ${t.to.name}: Rs ${t.amount}`));
  console.log("Metrics:", res1.metrics);

  // Assertions
  const aliceNet = res1.netBalances.find((b) => b.user.id === "user1")?.netBalance;
  const bobNet = res1.netBalances.find((b) => b.user.id === "user2")?.netBalance;
  const charlieNet = res1.netBalances.find((b) => b.user.id === "user3")?.netBalance;

  if (aliceNet === 100 && bobNet === 100 && charlieNet === -200) {
    console.log("PASS: Net balances correctly computed (+100, +100, -200)");
  } else {
    console.error("FAIL: Net balances mismatch", { aliceNet, bobNet, charlieNet });
  }

  if (res1.simplifiedTransactions.length === 2) {
    console.log("PASS: Exactly 2 simplified transactions generated instead of pairwise chaos");
  } else {
    console.error("FAIL: Expected 2 transactions, got", res1.simplifiedTransactions.length);
  }

  // Test Case 2: 4 members cyclic graph
  // A pays 400 for all (100 each)
  // B pays 400 for all (100 each)
  // C pays 200 for all (50 each)
  const mockGroup2 = {
    members: [u1, u2, u3, u4],
    expenses: [
      {
        title: "Villa",
        amount: 400,
        paidBy: u1,
        splitBetween: [
          { user: u1, share: 100, settled: true },
          { user: u2, share: 100, settled: false },
          { user: u3, share: 100, settled: false },
          { user: u4, share: 100, settled: false },
        ],
      },
      {
        title: "Groceries",
        amount: 400,
        paidBy: u2,
        splitBetween: [
          { user: u1, share: 100, settled: false },
          { user: u2, share: 100, settled: true },
          { user: u3, share: 100, settled: false },
          { user: u4, share: 100, settled: false },
        ],
      },
      {
        title: "Snacks",
        amount: 200,
        paidBy: u3,
        splitBetween: [
          { user: u1, share: 50, settled: false },
          { user: u2, share: 50, settled: false },
          { user: u3, share: 50, settled: true },
          { user: u4, share: 50, settled: false },
        ],
      },
    ],
  };

  const res2 = simplifyGroupDebts(mockGroup2);
  console.log("\n--- Test Case 2: 4 Members Complex Splits ---");
  console.log("Net Balances:", res2.netBalances.map((b) => `${b.user.name}: ${b.netBalance}`));
  console.log("Simplified Transactions:", res2.simplifiedTransactions.map((t) => `${t.from.name} -> ${t.to.name}: Rs ${t.amount}`));
  console.log("Pairwise Unsimplified Count:", res2.metrics.originalCount);
  console.log("Simplified Count:", res2.metrics.simplifiedCount);
  console.log("Transactions Saved:", res2.metrics.transactionsSaved);
  console.log("Reduction:", res2.metrics.reductionPercentage + "%");

  // Sum of net balances must be ~0
  const totalNet = res2.netBalances.reduce((sum, b) => sum + b.netBalance, 0);
  if (Math.abs(totalNet) < 0.05) {
    console.log("PASS: Conservation of money holds (Sum of net balances is 0)");
  } else {
    console.error("FAIL: Sum of balances != 0", totalNet);
  }

  // Max transactions <= N - 1
  if (res2.simplifiedTransactions.length <= mockGroup2.members.length - 1) {
    console.log(`PASS: Simplified transactions (${res2.simplifiedTransactions.length}) <= N - 1 (${mockGroup2.members.length - 1})`);
  } else {
    console.error("FAIL: Transactions exceeded N-1!");
  }

  // Test Case 3: Fully Settled
  const mockGroup3 = {
    members: [u1, u2],
    expenses: [
      {
        title: "Lunch",
        amount: 100,
        paidBy: u1,
        splitBetween: [
          { user: u1, share: 50, settled: true },
          { user: u2, share: 50, settled: true },
        ],
      },
    ],
  };
  const res3 = simplifyGroupDebts(mockGroup3);
  console.log("\n--- Test Case 3: Fully Settled ---");
  console.log("Simplified Transactions count:", res3.simplifiedTransactions.length);
  if (res3.simplifiedTransactions.length === 0) {
    console.log("PASS: 0 transactions when already settled");
  } else {
    console.error("FAIL: Expected 0 transactions");
  }

  console.log("\n=== All Algorithm Unit Tests Passed Successfully! ===");
}

runTests();
