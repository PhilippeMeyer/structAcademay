const QUIZ_QUESTIONS = [
  {
    id: "q1", topic: "Suitability",
    scenario: "A private banking client needs to fund a property purchase in 8 months. They ask you about a 1-year BRC on the Euro Stoxx 50 paying 9% p.a. What is the most important concern?",
    options: ["The barrier level is too low", "The client has a liquidity mismatch — the product cannot be liquidated at par before maturity", "9% is too high a coupon to be credible", "The Euro Stoxx 50 is not an eligible underlying"],
    correct: 1,
    explanation: "The critical issue is liquidity. A BRC is designed to be held to maturity (12 months), but the client needs the capital in 8 months. Secondary market exit depends on the issuer's bid and typically involves a mark-to-market loss. Liquidity needs must always be assessed before any structured product discussion."
  },
  {
    id: "q2", topic: "Product Mechanics",
    scenario: "A BRC references Nestlé with a 65% barrier. Three months into the product's life, Nestlé drops to 63% of its initial price on a single day before recovering to 90% by maturity. What is the client's payoff at maturity?",
    options: ["100% par + full coupon (barrier not breached at maturity)", "90% of par + coupon (receives shares at 90)", "63% of par + coupon (receives shares at strike-adjusted value)", "65% of par + coupon (barrier level payout)"],
    correct: 2,
    explanation: "This is path dependency in action. The barrier is American (monitored continuously), so the intraday print at 63% constitutes a knock-in event. From that point, the client holds a synthetic long equity position from the strike (100%). At maturity with Nestlé at 90%, they receive 90% of par plus the coupon — even though the product 'recovered' after the breach."
  },
  {
    id: "q3", topic: "Options",
    scenario: "You are explaining a Reverse Convertible to a client. Which statement best describes what the client is economically doing?",
    options: ["Buying a bond and buying a put option", "Buying a bond and selling a put option", "Selling a bond and buying a call option", "Buying a bond and buying a call option"],
    correct: 1,
    explanation: "A Reverse Convertible is economically equivalent to owning a bond (receiving par + coupon) while simultaneously selling a put option on the underlying. The put premium finances the enhanced coupon. If the put ends in-the-money (underlying below strike), the client delivers cash and receives depreciated shares instead of par — exactly what a short put obligates."
  },
  {
    id: "q4", topic: "Volatility & Pricing",
    scenario: "Market implied volatility on the SMI doubles from 15% to 30% overnight due to a political shock. A client asks you to price a new 1-year BRC on the SMI. What happens to the coupon, all else equal?",
    options: ["The coupon falls — higher vol makes the product riskier", "The coupon is unchanged — vol does not affect structured products", "The coupon rises — higher vol makes the embedded put more valuable", "The coupon rises — higher vol reduces the zero-coupon bond cost"],
    correct: 2,
    explanation: "Higher implied volatility makes the down-and-in put (which the client is selling) more valuable. A more valuable option means the client receives a higher premium for selling it — reflected as a higher coupon. This is why BRC coupons spike in volatile markets: the yield is compensation for the increased probability of barrier breach, not a free gift."
  },
  {
    id: "q5", topic: "Credit Risk",
    scenario: "A client holds a 100% Capital Protected Note issued by Bank X. Bank X files for insolvency. What happens to the client's capital protection?",
    options: ["The capital protection is honoured — it is a regulatory requirement", "The capital protection fails — the note is an unsecured claim on the issuer", "The client receives 100% immediately from the deposit guarantee scheme", "The capital protection is honoured only if the underlying has not fallen"],
    correct: 1,
    explanation: "A standard structured note is an unsecured debt obligation of the issuing bank. In insolvency, it ranks pari passu with other senior unsecured creditors — recovery is uncertain and typically well below par. This is what happened to Lehman-issued structured products in 2008. Capital protection is a contractual promise from the issuer, not a segregated asset."
  },
  {
    id: "q6", topic: "Product Mechanics",
    scenario: "An Autocall on the Euro Stoxx 50 has a quarterly observation schedule. The index closes above the autocall trigger on the Q3 observation. What happens?",
    options: ["The product continues — quarterly observations are just monitoring points", "The product is called — the client receives par plus the coupon for periods elapsed", "The product is called — the client receives par only, coupon is forfeited", "The barrier is reset lower for the remaining periods"],
    correct: 1,
    explanation: "When the Autocall trigger is reached on an observation date, the product is automatically redeemed. The client receives par (100%) plus the conditional coupon for the elapsed period (e.g. 3 quarters at 10% p.a. = 7.5%). The reinvestment challenge is that the client must now find a comparable product at prevailing market rates."
  },
  {
    id: "q7", topic: "Worst-of Basket",
    scenario: "A BRC references a worst-of basket of 3 European bank stocks with pairwise correlations of 0.35. Compared to a single-stock BRC on just one of those banks with identical vol, the basket BRC will have:",
    options: ["A lower coupon — basket diversification reduces risk", "The same coupon — correlation does not affect option pricing", "A higher coupon — lower correlation increases the option premium sold", "A lower barrier — the issuer compensates with more protection"],
    correct: 2,
    explanation: "Lower correlation between basket components increases the dispersion of outcomes — meaning the worst-of payoff is more likely to be severely negative. This makes the embedded down-and-in put more valuable (and more expensive). The client receives a higher coupon as compensation for selling this more expensive put. The risk is that even if 2 of 3 stocks perform well, the third can drag the entire payoff down."
  },
  {
    id: "q8", topic: "Options",
    scenario: "A client holds a Covered Call: long 100 shares of Novartis (bought at CHF 90) and short a 3-month call at CHF 100 strike for CHF 5 premium. Novartis rallies to CHF 115 at expiry. What is the client's outcome?",
    options: ["Profit of CHF 25 per share — they participate fully in the rally", "Profit of CHF 15 per share — capped at strike + premium received", "Loss of CHF 10 per share — the short call creates downside", "Profit of CHF 5 per share — only the premium is retained"],
    correct: 1,
    explanation: "The covered call caps upside at the strike. The client sells shares at CHF 100 (the call is exercised against them) and keeps the CHF 5 premium. Total proceeds: CHF 105 vs CHF 90 cost = CHF 15 profit per share. The opportunity cost is CHF 10 (the rally from 100 to 115 that the client missed). This is the fundamental trade-off: income today vs uncapped upside."
  },
  {
    id: "q9", topic: "Suitability",
    scenario: "A growth-oriented client wants equity exposure and asks about a 5-year Capital Protected Note on the Euro Stoxx 50 with 100% protection and 70% participation. What is the primary objection?",
    options: ["100% protection is not possible on a 5-year product", "The CPN is unsuitable — for a growth client, direct equity is more efficient", "70% participation is too low — regulations require at least 90%", "5 years is too long a maturity for a structured product"],
    correct: 1,
    explanation: "For a genuinely growth-oriented client who can tolerate market fluctuations, a CPN is a suboptimal vehicle. They pay an implicit cost for protection they don't need (the option budget consumed by the zero-coupon bond), and receive only 70% of the upside. Direct equity participation or an equity fund would be more capital-efficient. CPNs are designed for capital-preservation clients who want market exposure with a safety net."
  },
  {
    id: "q10", topic: "Product Mechanics",
    scenario: "A Phoenix Autocall has a memory coupon feature and a 60% coupon barrier. If the index closes at 55% on Q1 observation and at 95% on Q2 observation, what does the client receive at Q2?",
    options: ["Only Q2 coupon — Q1 was missed and is forfeited", "Q1 + Q2 coupons — the memory feature pays all accumulated coupons on call", "Zero — the product is knocked in and terminated", "Q2 coupon only — the product is called and the memory coupon is waived"],
    correct: 1,
    explanation: "The memory coupon feature accumulates unpaid coupons from periods where the index was below the coupon barrier. At Q1, the index (55%) is below the coupon barrier (60%), so no coupon is paid but it is 'remembered.' At Q2, the index (95%) is above both the autocall trigger and coupon barrier — the product is called and the client receives both Q1 and Q2 coupons simultaneously. This feature is valuable in volatile, mean-reverting markets."
  },
  {
    id: "q11", topic: "Volatility & Pricing",
    scenario: "Interest rates rise significantly from 2% to 5%. A client wants the same 100% Capital Protected Note structure they bought 3 years ago. What changes in the new environment?",
    options: ["The participation rate rises — higher rates make the zero-coupon bond cheaper, freeing more budget for the option", "The participation rate falls — higher rates make options more expensive", "Nothing changes — the CPN structure is rate-neutral", "The barrier level must be lowered to compensate"],
    correct: 0,
    explanation: "Higher interest rates make zero-coupon bonds cheaper (they discount at a higher rate, so less capital is needed to guarantee par at maturity). This frees a larger residual budget for the call option — enabling a higher participation rate for the same protection level. This is why CPNs are often more attractive in higher-rate environments. The 2020–2021 near-zero rate environment made them nearly impossible to structure with meaningful participation."
  },
  {
    id: "q12", topic: "Suitability",
    scenario: "A client mentions they cannot afford to lose more than 10% of their investment under any scenario. They are interested in a Barrier Reverse Convertible. What is the appropriate response?",
    options: ["Propose a BRC with a 90% barrier — this limits losses to 10%", "Propose a BRC with a low coupon to reduce risk", "Do not propose any BRC — the loss potential is incompatible with the client's tolerance", "Propose a BRC on an index rather than a single stock"],
    correct: 2,
    explanation: "A BRC with an active barrier breach can produce losses of 30–50%+ in stressed markets. Even with a 90% barrier, a significant drawdown can produce losses far exceeding 10%. No barrier level makes a BRC appropriate for a client who cannot tolerate losses above 10%. The correct action is to either (a) propose a CPN with capital protection, or (b) document clearly that the client's stated tolerance is incompatible with yield-enhancement structures."
  },
  {
    id: "q13", topic: "Options",
    scenario: "An RM explains that 'a BRC barrier at 65% means you can't lose money unless the stock falls more than 35%.' What is wrong with this statement?",
    options: ["Nothing is wrong — this is an accurate description of the BRC barrier", "The barrier is typically measured from the initial price, not from today's price", "The statement ignores that losses below the barrier are not limited to 35% — they reflect the full equity loss from the strike", "The barrier should be described as 65% of maturity price, not initial price"],
    correct: 2,
    explanation: "The statement is dangerously misleading. If the barrier is breached, the client receives shares at the strike price (100%). A stock that falls to 50% of its initial value produces a 50% loss to the client — not 35%. The barrier determines whether the loss mechanism activates; it does not cap the loss once activated. This distinction is the most common source of client misunderstanding in BRC mis-selling cases."
  },
  {
    id: "q14", topic: "Lifecycle",
    scenario: "A BRC was issued 18 months ago on a stock that has fallen 30% from inception but has not breached the 65% barrier. The client wants to exit. What should you explain?",
    options: ["The client can exit at par — the barrier has not been breached", "The secondary market price will reflect the current mark-to-market — likely below par due to the underlying's decline and remaining option time value", "The client must hold to maturity — there is no secondary market for BRCs", "The barrier breach at 65% will be evaluated at exit, not at maturity"],
    correct: 1,
    explanation: "Even without a barrier breach, the secondary market price of a BRC reflects the mark-to-market value of its components: the bond portion (near par) and the short put (now closer to in-the-money, hence more expensive to close). The underlying's 30% decline means the put is significantly in-the-money, making the product worth well below par on a mark-to-market basis. The client accepts this loss if they exit early."
  },
  {
    id: "q15", topic: "Worst-of Basket",
    scenario: "A worst-of basket BRC references HSBC, Deutsche Bank, and BNP Paribas. At maturity, HSBC is up 15%, BNP is flat, but Deutsche Bank is down 40% (below the 65% barrier). What is the client's payoff?",
    options: ["Flat (average of the three = -8.3%) + coupon", "Down 40% + coupon — the worst performer determines the payoff", "Down 40% with no coupon — barrier breach forfeits the coupon", "Down 15% + coupon — the loss is capped at the barrier level"],
    correct: 1,
    explanation: "In a worst-of structure, the payoff is linked entirely to the worst-performing underlying. HSBC and BNP's performance is irrelevant. Since Deutsche Bank is down 40% (below the 65% barrier which was breached), the client receives Deutsche Bank shares at the strike price — a 40% loss, partially offset by the coupon received. This is the 'weakest link' mechanic that makes worst-of products far riskier than single-name products."
  },
];


export default QUIZ_QUESTIONS;
