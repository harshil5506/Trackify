"""
Trackify - Behavioral Spending Profiler ML Engine
Analyzes multi-dimensional quiz vectors accounting for nuanced real-world scenarios:
- Self vs. Peer occasion spending habits
- Social contagion and peer pressure susceptibility
- Solo financial discipline vs. group spending friction
- Emotional trigger & impulse resilience
Uses Scikit-Learn distance metrics & centroid behavioral clustering.
"""

import sys
import json
import numpy as np
from sklearn.neighbors import NearestNeighbors

# Pre-calibrated Behavioral Archetype Centroids in 5D feature space:
# [solo_discipline, social_susceptibility, occasion_duality, impulse_risk, peer_boundary_firmness]
# All dimensions normalized on [0, 100]
ARCHETYPE_PROFILES = [
    {
        "key": "social_chameleon",
        "title": "The Social Chameleon 🦎",
        "badge": "Social Chameleon",
        "centroid": [80.0, 75.0, 85.0, 45.0, 30.0],
        "summary": "You are highly disciplined and prudent when managing expenses alone, but peer occasions create significant financial contagion. You tend to match group spending to fit in, leading to a high Self vs. Peer duality gap.",
        "duality_category": "High Peer Divergence",
        "bg": "#fef3c7",
        "color": "#b45309",
        "risks": [
            {
                "title": "The Social Contagion Trap",
                "severity": "High",
                "description": "Matching upscale orders or rounds with friends despite having personal budget caps."
            },
            {
                "title": "Unequal Bill Absorption",
                "severity": "Medium",
                "description": "Reluctance to speak up when group bills are split evenly despite your lower consumption."
            }
        ],
        "rules": [
            {
                "rule": "The Pre-Committed Outing Cap",
                "scenario": "Peer Outings & Dining",
                "rationale": "Transfer only your intended social spending into a UPI wallet before leaving for group dinners."
            },
            {
                "rule": "The Non-Negotiable Bill Split Script",
                "scenario": "Shared Restaurant Tabs",
                "rationale": "Proactively offer to pay for your specific item upfront with quick math rather than waiting for an awkward split."
            }
        ]
    },
    {
        "key": "steadfast_fortress",
        "title": "The Steadfast Fortress 🛡️",
        "badge": "Steadfast Fortress",
        "centroid": [90.0, 15.0, 15.0, 15.0, 90.0],
        "summary": "You possess rock-solid financial discipline that remains virtually unaffected by peer pressure or festive occasions. Your personal budget boundaries are clear and consistently upheld across both solo and group scenarios.",
        "duality_category": "Harmonious Consistency",
        "bg": "#dcfce7",
        "color": "#15803d",
        "risks": [
            {
                "title": "Hyper-Austerity in Social Bonds",
                "severity": "Low",
                "description": "Risk of being overly rigid in celebratory occasions where shared experiences yield lasting memories."
            }
        ],
        "rules": [
            {
                "rule": "The Guilt-Free Social Fun Fund",
                "scenario": "Peer Gatherings",
                "rationale": "Allocate an intentional 10% monthly buffer exclusively for social bonding so you can relax without feeling off-budget."
            }
        ]
    },
    {
        "key": "generous_host",
        "title": "The Generous Host & Giver 🎁",
        "badge": "Generous Host",
        "centroid": [65.0, 80.0, 70.0, 50.0, 20.0],
        "summary": "You derive genuine happiness from treating others and picking up shared tabs, but your empathy often overrides your own financial targets. You find it difficult to say 'no' when friends invite you to costly activities.",
        "duality_category": "High Peer Selflessness",
        "bg": "#e0e7ff",
        "color": "#3730a3",
        "risks": [
            {
                "title": "Phantom Generosity Syndrome",
                "severity": "High",
                "description": "Silently absorbing extra expenses for friends that erode your monthly emergency savings."
            },
            {
                "title": "Social Obligation Spending",
                "severity": "Medium",
                "description": "Saying yes to group outings out of fear of letting friends down."
            }
        ],
        "rules": [
            {
                "rule": "The 24-Hour Social RSVP Pause",
                "scenario": "Expensive Group Invitations",
                "rationale": "Never say yes immediately to expensive trips or outings; take a 24-hour pause to review your monthly ledger."
            },
            {
                "rule": "Boundaries as Self-Care",
                "scenario": "Gifting & Group Treats",
                "rationale": "Set a firm annual cap on group gifts and treats; genuine friendship is never defined by bill payments."
            }
        ]
    },
    {
        "key": "balanced_realist",
        "title": "The Balanced Realist ⚖️",
        "badge": "Balanced Realist",
        "centroid": [75.0, 35.0, 30.0, 35.0, 70.0],
        "summary": "You maintain a healthy equilibrium between personal financial independence and vibrant social connection. You understand when to indulge intentionally with friends and when to enforce personal spending guardrails.",
        "duality_category": "Balanced Occasion Alignment",
        "bg": "#dbeafe",
        "color": "#1d4ed8",
        "risks": [
            {
                "title": "Occasion Budget Creep",
                "severity": "Low",
                "description": "Consecutive holiday or celebration weeks can occasionally stack up unnoticed."
            }
        ],
        "rules": [
            {
                "rule": "Quarterly Social Audit",
                "scenario": "Monthly Review",
                "rationale": "Track how much of your discretionary spend goes to peer outings vs. solitary investments to maintain harmony."
            }
        ]
    },
    {
        "key": "impulse_free_spirit",
        "title": "The Spontaneous Free-Spirit ⚡",
        "badge": "Spontaneous Free-Spirit",
        "centroid": [30.0, 70.0, 75.0, 85.0, 35.0],
        "summary": "You prioritize living in the present moment. Spontaneity drives your decisions both in solitary browsing (late-night flash sales) and in social peer occasions (impromptu trips, weekend splurges). Long-term budgeting feels restrictive.",
        "duality_category": "Omnipresent Spontaneity",
        "bg": "#fee2e2",
        "color": "#b91c1c",
        "risks": [
            {
                "title": "Double-Sided Impulse Vulnerability",
                "severity": "Critical",
                "description": "Overspending both in solitary isolation (retail therapy) and during social excitement."
            },
            {
                "title": "Month-End Cashflow Crunch",
                "severity": "High",
                "description": "Card balance surprises resulting from unmonitored spontaneous outings."
            }
        ],
        "rules": [
            {
                "rule": "The 48-Hour Wishlist Delay",
                "scenario": "Solitary Shopping",
                "rationale": "Force items into a cart or note for 48 hours before purchasing to verify genuine need."
            },
            {
                "rule": "Separate Fun Account Isolation",
                "scenario": "All Discretionary Spend",
                "rationale": "Move fixed bills and savings out immediately on payday so money in your active account is safe to spend."
            }
        ]
    },
    {
        "key": "solitary_splurger",
        "title": "The Solitary Splurger 🎧",
        "badge": "Solitary Splurger",
        "centroid": [40.0, 30.0, 60.0, 70.0, 65.0],
        "summary": "You are actually quite modest and frugal when with friends or colleagues, but you let your guard down in private. Solitary retail therapy, food delivery, or digital gadgets serve as comfort mechanisms when you are alone.",
        "duality_category": "Inverted Duality (Solo Heavy)",
        "bg": "#f3e8ff",
        "color": "#7e22ce",
        "risks": [
            {
                "title": "Hidden Solitary Outflows",
                "severity": "High",
                "description": "Private convenience orders and late-night digital micro-transactions that add up quietly."
            }
        ],
        "rules": [
            {
                "rule": "The Delivery App Barrier",
                "scenario": "Late-Night Solitary Cravings",
                "rationale": "Remove saved payment cards from delivery and e-commerce apps to introduce friction for solo impulsive orders."
            }
        ]
    }
]


def extract_features_and_profile(answers, user_history=None):
    """
    Computes 5D normalized behavioral vectors:
    0: solo_discipline (0-100)
    1: social_susceptibility (0-100)
    2: occasion_duality (0-100)
    3: impulse_risk (0-100)
    4: peer_boundary_firmness (0-100)
    """
    solo_scores = []
    peer_scores = []
    social_suscep_list = []
    duality_list = []
    impulse_list = []
    boundary_list = []

    for ans in answers:
        scores = ans.get("dimensionScores", {})
        stype = ans.get("scenarioType", "general")

        s_disc = float(scores.get("soloDiscipline", 5))
        s_susc = float(scores.get("socialSusceptibility", 5))
        o_dual = float(scores.get("occasionDuality", 5))
        i_risk = float(scores.get("impulseRisk", 5))
        p_bound = float(scores.get("peerBoundaryFirmness", 5))

        if stype in ["self", "solitary"]:
            solo_scores.append(s_disc)
        elif stype in ["peer", "social"]:
            peer_scores.append(s_disc)
            social_suscep_list.append(s_susc)
            boundary_list.append(p_bound)
        elif stype in ["occasion", "boundary"]:
            duality_list.append(o_dual)
            social_suscep_list.append(s_susc)
            boundary_list.append(p_bound)

        # Global metrics
        impulse_list.append(i_risk)
        if "occasionDuality" in scores:
            duality_list.append(o_dual)
        if "socialSusceptibility" in scores:
            social_suscep_list.append(s_susc)
        if "peerBoundaryFirmness" in scores:
            boundary_list.append(p_bound)

    # Defaults if certain subsets are empty
    avg_solo = np.mean(solo_scores) if solo_scores else 5.0
    avg_peer = np.mean(peer_scores) if peer_scores else 5.0
    avg_susc = np.mean(social_suscep_list) if social_suscep_list else 5.0
    avg_dual = np.mean(duality_list) if duality_list else 5.0
    avg_impulse = np.mean(impulse_list) if impulse_list else 5.0
    avg_bound = np.mean(boundary_list) if boundary_list else 5.0

    # Scale to 0-100 scale (input questions are on 1-10 scale)
    v_solo_discipline = float(np.clip((avg_solo - 1) / 9.0 * 100.0, 0, 100))
    v_social_susceptibility = float(np.clip((avg_susc - 1) / 9.0 * 100.0, 0, 100))
    v_occasion_duality = float(np.clip((avg_dual - 1) / 9.0 * 100.0, 0, 100))
    v_impulse_risk = float(np.clip((avg_impulse - 1) / 9.0 * 100.0, 0, 100))
    v_peer_boundary = float(np.clip((avg_bound - 1) / 9.0 * 100.0, 0, 100))

    # Self vs. Peer Occasion Duality calculation
    self_score_norm = float(np.clip((avg_solo - 1) / 9.0 * 100.0, 0, 100))
    peer_score_norm = float(np.clip((avg_peer - 1) / 9.0 * 100.0, 0, 100))
    raw_gap = round(self_score_norm - peer_score_norm, 1)

    # Adjust with real user transaction patterns if provided from database
    real_data_correlation = {
        "verified_with_transactions": False,
        "peer_expense_ratio": None,
        "mood_impulsive_ratio": None,
        "confidence_score": 0.88
    }

    if user_history and isinstance(user_history, dict):
        tx_count = user_history.get("total_expenses_count", 0)
        if tx_count >= 5:
            real_data_correlation["verified_with_transactions"] = True
            peer_ratio = user_history.get("peer_expense_ratio", 0)
            impulsive_ratio = user_history.get("impulsive_tx_ratio", 0)
            real_data_correlation["peer_expense_ratio"] = round(peer_ratio * 100, 1)
            real_data_correlation["mood_impulsive_ratio"] = round(impulsive_ratio * 100, 1)

            # Fine-tune vectors with real historical weights
            if peer_ratio > 0.40:
                v_social_susceptibility = float(np.clip(v_social_susceptibility * 1.15, 0, 100))
                v_occasion_duality = float(np.clip(v_occasion_duality * 1.10, 0, 100))
            if impulsive_ratio > 0.25:
                v_impulse_risk = float(np.clip(v_impulse_risk * 1.20, 0, 100))
            real_data_correlation["confidence_score"] = min(0.96, 0.88 + min(tx_count * 0.003, 0.08))

    # Feature vector for ML Nearest Neighbors
    feature_vector = np.array([
        v_solo_discipline,
        v_social_susceptibility,
        v_occasion_duality,
        v_impulse_risk,
        v_peer_boundary
    ]).reshape(1, -1)

    # Fit Nearest Neighbors across archetype centroids
    centroids = np.array([p["centroid"] for p in ARCHETYPE_PROFILES])
    nbrs = NearestNeighbors(n_neighbors=len(ARCHETYPE_PROFILES), algorithm="ball_tree", metric="euclidean").fit(centroids)
    distances, indices = nbrs.kneighbors(feature_vector)

    best_idx = int(indices[0][0])
    matched_profile = ARCHETYPE_PROFILES[best_idx]
    best_dist = float(distances[0][0])

    # Convert distance to similarity confidence %
    match_confidence = max(55, min(99, int(100 - (best_dist / 1.7))))

    # Interpret Self vs. Peer Duality
    if raw_gap > 20:
        duality_interpretation = (
            f"Pronounced Social Chameleonic Gap (+{raw_gap}%): You practice strong self-discipline in solitary scenarios ({round(self_score_norm)}%), "
            f"but your financial boundaries become vulnerable during peer gatherings and social occasions ({round(peer_score_norm)}%)."
        )
        duality_status = "High Social Sensitivity"
    elif raw_gap < -20:
        duality_interpretation = (
            f"Inverted Solo Duality ({raw_gap}%): You are exceptionally thrifty and boundary-conscious around peers ({round(peer_score_norm)}%), "
            f"but you compensate by splurging on solo comfort purchases in private ({round(self_score_norm)}%)."
        )
        duality_status = "Solo Compensation"
    else:
        duality_interpretation = (
            f"Harmonious Occasion Alignment (Gap: {abs(raw_gap)}%): Your financial values remain steady regardless of whether you are "
            f"spending solo ({round(self_score_norm)}%) or celebrating in peer settings ({round(peer_score_norm)}%)."
        )
        duality_status = "Occasion Harmony"

    # Overall composite financial mindset score (0 - 100)
    overall_score = int(round(
        (v_solo_discipline * 0.35) +
        ((100 - v_social_susceptibility) * 0.25) +
        ((100 - v_occasion_duality) * 0.15) +
        ((100 - v_impulse_risk) * 0.15) +
        (v_peer_boundary * 0.10)
    ))

    result = {
        "archetype": matched_profile["key"],
        "title": matched_profile["title"],
        "badge": matched_profile["badge"],
        "score": overall_score,
        "summary": matched_profile["summary"],
        "bg": matched_profile["bg"],
        "color": matched_profile["color"],
        "matchConfidence": match_confidence,
        "dimensions": {
            "soloDiscipline": round(v_solo_discipline, 1),
            "socialSusceptibility": round(v_social_susceptibility, 1),
            "occasionDuality": round(v_occasion_duality, 1),
            "impulseRisk": round(v_impulse_risk, 1),
            "peerBoundaryFirmness": round(v_peer_boundary, 1)
        },
        "dualityAnalysis": {
            "selfScore": round(self_score_norm, 1),
            "peerScore": round(peer_score_norm, 1),
            "dualityGap": raw_gap,
            "status": duality_status,
            "interpretation": duality_interpretation
        },
        "risks": matched_profile["risks"],
        "rules": matched_profile["rules"],
        "realDataCorrelation": real_data_correlation,
        "completedAt": None
    }

    return result


def main():
    try:
        raw_input = ""
        if len(sys.argv) > 1 and sys.argv[1].strip():
            arg_str = sys.argv[1].strip()
            import base64
            try:
                raw_input = base64.b64decode(arg_str).decode("utf-8")
            except Exception:
                raw_input = arg_str
        else:
            raw_input = sys.stdin.read()

        if not raw_input.strip():
            print(json.dumps({"error": "No input JSON received via stdin or argv"}))
            sys.exit(1)

        payload = json.loads(raw_input)
        answers = payload.get("answers", [])
        user_history = payload.get("user_history", {})

        if not answers:
            print(json.dumps({"error": "No quiz answers supplied in payload"}))
            sys.exit(1)

        result = extract_features_and_profile(answers, user_history)
        print(json.dumps(result))

    except Exception as exc:
        print(json.dumps({"error": f"ML Behavioral Profiler execution failed: {str(exc)}"}))
        sys.exit(1)


if __name__ == "__main__":
    main()
