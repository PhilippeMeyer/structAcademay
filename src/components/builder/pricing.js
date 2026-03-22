export function bsCall(S, K, T, r, sigma) {
  if (T <= 0) return Math.max(S - K, 0);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma ** 2) * T) / (sigma * Math.sqrt(T));
  const d2 = d1 - sigma * Math.sqrt(T);
  const N = (x) => 0.5 * (1 + erf(x / Math.SQRT2));
  return S * N(d1) - K * Math.exp(-r * T) * N(d2);
}

export function bsPut(S, K, T, r, sigma) {
  return bsCall(S, K, T, r, sigma) - S + K * Math.exp(-r * T);
}

export function erf(x) {
  const t = 1 / (1 + 0.3275911 * Math.abs(x));
  const y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);
  return x >= 0 ? y : -y;
}

// Down-and-In put approximation (simplified reflection principle)

export function diPut(S, K, B, T, r, sigma) {
  if (S <= B) return bsPut(S, K, T, r, sigma);
  const vanillaPut = bsPut(S, K, T, r, sigma);
  const lambda = (r + 0.5 * sigma ** 2) / sigma ** 2;
  const mirrorPut = bsPut(B * B / S, K, T, r, sigma) * Math.pow(B / S, 2 * lambda - 1);
  return Math.min(vanillaPut, mirrorPut + vanillaPut * 0.6);
}

// ─── PAYOFF CALCULATIONS ──────────────────────────────────────────────────────

export function calcPayoff(type, params, underlying) {
  const { protection = 90, participation = 100, coupon = 8, barrier = 65, autocallTrigger = 100, maturity = 2 } = params;
  const xs = Array.from({ length: 201 }, (_, i) => i);
  return xs.map(u => {
    const pct = u / 100;
    switch (type) {
      case "cpn": return Math.max(protection / 100, pct >= 1 ? 1 + Math.max(0, pct - 1) * (participation / 100) : protection / 100) * 100;
      case "rc": return pct >= 1 ? 100 + coupon : pct * 100 + coupon;
      case "brc": return (pct >= 1 || pct > barrier / 100) ? 100 + coupon : pct * 100 + coupon;
      case "autocall": return (pct >= autocallTrigger / 100 || pct > barrier / 100) ? 100 + coupon * maturity : pct * 100;
      default: return 100;
    }
  });
}

// ─── PRICING ENGINE ───────────────────────────────────────────────────────────

export function priceStructure(type, params, mktData) {
  const { vol, rate = 0.03, div = 0.02, maturity = 2 } = mktData;
  const { protection = 90, barrier = 65 } = params;
  const S = 100, K = 100, T = maturity, r = rate, sigma = vol / 100, q = div / 100;
  const adjS = S * Math.exp(-q * T);

  switch (type) {
    case "cpn": {
      const zcb = protection * Math.exp(-r * T);
      const budget = 100 - zcb;
      const callValue = bsCall(adjS, K, T, r, sigma);
      const participation = Math.min(200, Math.max(5, (budget / callValue) * 100));
      return { participation: Math.round(participation), zcb: Math.round(zcb), optBudget: Math.round(budget * 10) / 10, callValue: Math.round(callValue * 100) / 100 };
    }
    case "rc": {
      const putVal = bsPut(adjS, K, T, r, sigma);
      const bondYield = r;
      const coupon = Math.round((putVal / T + bondYield * 100) * 10) / 10;
      return { coupon: Math.min(25, Math.max(1, coupon)), putValue: Math.round(putVal * 100) / 100 };
    }
    case "brc": {
      const diPutVal = diPut(adjS, K, barrier / 100 * S, T, r, sigma);
      const bondYield = r;
      const coupon = Math.round((diPutVal / T + bondYield * 100) * 10) / 10;
      return { coupon: Math.min(25, Math.max(1, coupon)), diPutValue: Math.round(diPutVal * 100) / 100 };
    }
    case "autocall": {
      const diPutVal = diPut(adjS, K, barrier / 100 * S, T, r, sigma);
      const autocallAdj = 1.15;
      const coupon = Math.round((diPutVal * autocallAdj / T + r * 100) * 10) / 10;
      return { coupon: Math.min(25, Math.max(1, coupon)), diPutValue: Math.round(diPutVal * 100) / 100 };
    }
    default: return {};
  }
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────
