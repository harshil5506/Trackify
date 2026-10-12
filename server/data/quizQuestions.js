/**
 * Trackify - Behavioral Spending Quiz Dataset
 * Features real-world nuanced scenarios addressing:
 * - Self vs. Peer occasion spending habits
 * - Social contagion & bill splitting dynamics
 * - Solo discipline vs. group spending friction
 * - Impulse triggers in solitude vs. celebrations with peers
 */

const quizQuestions = [
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
        dimensionScores: {
          soloDiscipline: 9.5,
          socialSusceptibility: 1.5,
          occasionDuality: 1.5,
          impulseRisk: 1.5,
          peerBoundaryFirmness: 9.5
        }
      },
      {
        id: "1b",
        text: "Join them, order an affordable beverage or side item, and comfortably keep your expense under ₹200.",
        dimensionScores: {
          soloDiscipline: 8.0,
          socialSusceptibility: 3.5,
          occasionDuality: 3.0,
          impulseRisk: 2.5,
          peerBoundaryFirmness: 8.0
        }
      },
      {
        id: "1c",
        text: "Join in and order whatever everyone else is having to avoid feeling awkward or out of place.",
        dimensionScores: {
          soloDiscipline: 4.0,
          socialSusceptibility: 8.5,
          occasionDuality: 8.0,
          impulseRisk: 6.5,
          peerBoundaryFirmness: 2.5
        }
      },
      {
        id: "1d",
        text: "Excitedly abandon the packed lunch, splurge on the signature gourmet dish, and treat someone's dessert on top.",
        dimensionScores: {
          soloDiscipline: 2.0,
          socialSusceptibility: 9.0,
          occasionDuality: 9.5,
          impulseRisk: 9.0,
          peerBoundaryFirmness: 1.5
        }
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
        dimensionScores: {
          soloDiscipline: 9.0,
          socialSusceptibility: 1.5,
          occasionDuality: 1.5,
          impulseRisk: 1.0,
          peerBoundaryFirmness: 9.5
        }
      },
      {
        id: "2b",
        text: "Propose that someone calculates items via Trackify/Splitwise later so everyone pays their fair share.",
        dimensionScores: {
          soloDiscipline: 8.0,
          socialSusceptibility: 3.0,
          occasionDuality: 2.5,
          impulseRisk: 2.0,
          peerBoundaryFirmness: 8.5
        }
      },
      {
        id: "2c",
        text: "Quietly pay the equal ₹1,200 share despite feeling internal resentment, just to avoid group tension.",
        dimensionScores: {
          soloDiscipline: 4.5,
          socialSusceptibility: 8.5,
          occasionDuality: 7.5,
          impulseRisk: 4.0,
          peerBoundaryFirmness: 2.0
        }
      },
      {
        id: "2d",
        text: "Insist on picking up an even bigger portion of the bill or covering the entire tip to look generous.",
        dimensionScores: {
          soloDiscipline: 3.0,
          socialSusceptibility: 8.0,
          occasionDuality: 8.5,
          impulseRisk: 7.0,
          peerBoundaryFirmness: 1.5
        }
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
        dimensionScores: {
          soloDiscipline: 9.5,
          socialSusceptibility: 1.0,
          occasionDuality: 1.0,
          impulseRisk: 1.0,
          peerBoundaryFirmness: 9.0
        }
      },
      {
        id: "3b",
        text: "Add it to your wishlist and mandate a 48-hour cooling-off rule before deciding.",
        dimensionScores: {
          soloDiscipline: 8.5,
          socialSusceptibility: 1.5,
          occasionDuality: 2.0,
          impulseRisk: 2.5,
          peerBoundaryFirmness: 8.5
        }
      },
      {
        id: "3c",
        text: "Check your bank balance; if you have cash to spare this month, you go ahead and place the order.",
        dimensionScores: {
          soloDiscipline: 5.0,
          socialSusceptibility: 2.0,
          occasionDuality: 5.0,
          impulseRisk: 6.5,
          peerBoundaryFirmness: 6.0
        }
      },
      {
        id: "3d",
        text: "Buy it immediately with express checkout—discounts don't wait and life is meant to be enjoyed now!",
        dimensionScores: {
          soloDiscipline: 1.5,
          socialSusceptibility: 2.0,
          occasionDuality: 7.0,
          impulseRisk: 9.5,
          peerBoundaryFirmness: 3.0
        }
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
        dimensionScores: {
          soloDiscipline: 9.5,
          socialSusceptibility: 1.5,
          occasionDuality: 1.5,
          impulseRisk: 1.5,
          peerBoundaryFirmness: 9.5
        }
      },
      {
        id: "4b",
        text: "Propose an alternative budget-friendly weekend option or adjust other non-essential categories to fit it safely.",
        dimensionScores: {
          soloDiscipline: 7.5,
          socialSusceptibility: 4.0,
          occasionDuality: 4.0,
          impulseRisk: 3.5,
          peerBoundaryFirmness: 7.5
        }
      },
      {
        id: "4c",
        text: "Experience intense FOMO, reluctantly agree, and plan to stressfully eat instant noodles for the next two weeks.",
        dimensionScores: {
          soloDiscipline: 4.0,
          socialSusceptibility: 8.5,
          occasionDuality: 8.5,
          impulseRisk: 7.0,
          peerBoundaryFirmness: 2.5
        }
      },
      {
        id: "4d",
        text: "Immediately book it on credit card without a second thought. 'You only live once!'",
        dimensionScores: {
          soloDiscipline: 2.0,
          socialSusceptibility: 9.0,
          occasionDuality: 9.0,
          impulseRisk: 9.5,
          peerBoundaryFirmness: 1.5
        }
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
        dimensionScores: {
          soloDiscipline: 9.5,
          socialSusceptibility: 1.5,
          occasionDuality: 1.5,
          impulseRisk: 1.5,
          peerBoundaryFirmness: 9.0
        }
      },
      {
        id: "5b",
        text: "Split 50% into savings, 30% for a personal goal, and 20% to celebrate over dinner with loved ones.",
        dimensionScores: {
          soloDiscipline: 8.0,
          socialSusceptibility: 3.5,
          occasionDuality: 3.5,
          impulseRisk: 2.5,
          peerBoundaryFirmness: 8.0
        }
      },
      {
        id: "5c",
        text: "Immediately announce a lavish party or round of drinks for your entire friend circle, consuming most of the bonus.",
        dimensionScores: {
          soloDiscipline: 3.5,
          socialSusceptibility: 8.5,
          occasionDuality: 8.5,
          impulseRisk: 7.5,
          peerBoundaryFirmness: 2.0
        }
      },
      {
        id: "5d",
        text: "Spend the entire amount within 48 hours on impulse shopping, gadget upgrades, and celebrations.",
        dimensionScores: {
          soloDiscipline: 1.5,
          socialSusceptibility: 6.0,
          occasionDuality: 9.0,
          impulseRisk: 9.5,
          peerBoundaryFirmness: 3.0
        }
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
        dimensionScores: {
          soloDiscipline: 9.5,
          socialSusceptibility: 1.0,
          occasionDuality: 1.5,
          impulseRisk: 1.5,
          peerBoundaryFirmness: 9.0
        }
      },
      {
        id: "6b",
        text: "Treat yourself to a capped, comforting food delivery within your weekly dining buffer.",
        dimensionScores: {
          soloDiscipline: 8.0,
          socialSusceptibility: 2.0,
          occasionDuality: 3.0,
          impulseRisk: 3.5,
          peerBoundaryFirmness: 8.0
        }
      },
      {
        id: "6c",
        text: "Engage in heavy retail therapy, browsing apps and ordering clothes or gadgets to lift your mood.",
        dimensionScores: {
          soloDiscipline: 3.0,
          socialSusceptibility: 2.0,
          occasionDuality: 6.5,
          impulseRisk: 8.5,
          peerBoundaryFirmness: 5.0
        }
      },
      {
        id: "6d",
        text: "Text a group chat to go out drinking or clubbing to blow off steam, ending up with a massive tab.",
        dimensionScores: {
          soloDiscipline: 2.5,
          socialSusceptibility: 8.5,
          occasionDuality: 8.5,
          impulseRisk: 8.5,
          peerBoundaryFirmness: 2.0
        }
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
        dimensionScores: {
          soloDiscipline: 9.0,
          socialSusceptibility: 2.0,
          occasionDuality: 2.0,
          impulseRisk: 1.5,
          peerBoundaryFirmness: 9.5
        }
      },
      {
        id: "7b",
        text: "Suggest a more meaningful group gift that fits everyone's financial comfort range without exclusion.",
        dimensionScores: {
          soloDiscipline: 8.0,
          socialSusceptibility: 3.5,
          occasionDuality: 3.0,
          impulseRisk: 2.0,
          peerBoundaryFirmness: 8.5
        }
      },
      {
        id: "7c",
        text: "Silently pay the ₹3,000 because you're terrified someone might think you are cheap or a bad friend.",
        dimensionScores: {
          soloDiscipline: 4.0,
          socialSusceptibility: 8.5,
          occasionDuality: 7.5,
          impulseRisk: 4.5,
          peerBoundaryFirmness: 2.0
        }
      },
      {
        id: "7d",
        text: "Pay the ₹3,000 and offer to buy the wrapping, flowers, and champagne too so everyone notices your generosity.",
        dimensionScores: {
          soloDiscipline: 2.5,
          socialSusceptibility: 8.0,
          occasionDuality: 8.5,
          impulseRisk: 7.0,
          peerBoundaryFirmness: 1.5
        }
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
        dimensionScores: {
          soloDiscipline: 9.5,
          socialSusceptibility: 1.5,
          occasionDuality: 1.5,
          impulseRisk: 1.0,
          peerBoundaryFirmness: 9.5
        }
      },
      {
        id: "8b",
        text: "Meet at a cozy casual tea stall or budget café, enjoying each other's company for under ₹200.",
        dimensionScores: {
          soloDiscipline: 8.5,
          socialSusceptibility: 3.0,
          occasionDuality: 2.5,
          impulseRisk: 2.0,
          peerBoundaryFirmness: 8.5
        }
      },
      {
        id: "8c",
        text: "Take them to a nice bistro, spend your remaining ₹2,000 in one afternoon, and borrow money or swipe credit for the rest of the week.",
        dimensionScores: {
          soloDiscipline: 3.5,
          socialSusceptibility: 8.5,
          occasionDuality: 8.5,
          impulseRisk: 7.5,
          peerBoundaryFirmness: 2.5
        }
      },
      {
        id: "8d",
        text: "Insist on picking up their entire tab to be a good host, putting yourself into immediate overdraft.",
        dimensionScores: {
          soloDiscipline: 2.0,
          socialSusceptibility: 9.0,
          occasionDuality: 9.5,
          impulseRisk: 8.5,
          peerBoundaryFirmness: 1.0
        }
      }
    ]
  }
];

module.exports = quizQuestions;
