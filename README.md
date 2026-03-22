# Structured Products Training Platform

A modular React application for RM enablement on structured products — options primer, product builder, payoff explorer, portfolio context, suitability reflexes, lifecycle, stress tests, credit risk, volatility & pricing intuition, worst-of basket mechanics, knowledge check quiz, glossary, comparison table, and a live Real Product Builder with Yahoo Finance data.

## Quick Start

```bash
cd sp-trainer
npm install
npm run dev
```

The app opens at **http://localhost:3000**.

## Build for Production

```bash
npm run build       # outputs to dist/
npm run preview     # preview the production build locally
```

## Project Structure

```
sp-trainer/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx                        # React entry point
    ├── App.jsx                         # Root shell: nav, theme toggle, routing
    │
    ├── theme/
    │   ├── themes.js                   # darkTheme, lightTheme token objects
    │   ├── ThemeContext.js             # ThemeContext + useTheme hook
    │   └── globalStyles.js            # makeGlobalStyles(theme) → CSS string
    │
    ├── data/
    │   ├── glossary.js                 # GLOSSARY_TERMS — 60+ annotated terms
    │   ├── quiz.js                     # QUIZ_QUESTIONS — 15 scenario questions
    │   ├── underlyings.js              # UNIVERSE — 23 underlyings (CH/EU/US)
    │   └── logo.js                     # LOGO_B64 — base64 app logo
    │
    ├── hooks/
    │   └── useProgress.js              # Module completion tracking (localStorage)
    │
    ├── components/
    │   ├── Tooltip.jsx                 # Tooltip + GT (GlossaryTerm) components
    │   │
    │   ├── charts/                     # Reusable SVG chart components
    │   │   ├── PayoffChart.jsx         # Structured product payoff at maturity
    │   │   ├── DecompositionView.jsx   # Bond + options bar decomposition
    │   │   ├── ScenarioFan.jsx         # Monte Carlo fan chart
    │   │   ├── PortfolioChart.jsx      # Return distribution histogram
    │   │   └── OptionPayoffChart.jsx   # Option strategy P&L chart
    │   │
    │   └── builder/                    # Real Product Builder sub-components
    │       ├── builderTheme.js         # Builder-specific T theme + CSS
    │       ├── pricing.js              # Black-Scholes + DI put pricing engine
    │       ├── fetchQuote.js           # Yahoo Finance API via allorigins proxy
    │       ├── Spinner.jsx
    │       ├── StatBox.jsx
    │       ├── Pill.jsx
    │       ├── SliderRow.jsx
    │       ├── BuilderPayoffChart.jsx
    │       ├── UnderlyingPicker.jsx    # Search + live price fetch UI
    │       ├── QuotePanel.jsx          # Live price display card
    │       ├── BasketPanel.jsx         # Correlation matrix sliders
    │       ├── ScenarioFanChart.jsx
    │       └── TermSheet.jsx           # Indicative term sheet output
    │
    └── sections/                       # One file per training module
        ├── HomeSection.jsx             # Learning Hub + module tiles
        ├── OptionsSection.jsx          # Options Primer (5 categories, 11+ strategies)
        ├── BuilderSection.jsx          # Product Builder (CPN/RC/BRC/Autocall)
        ├── PayoffSection.jsx           # Payoff Explorer + scenario fan
        ├── PortfolioSection.jsx        # Portfolio Context
        ├── SuitabilitySection.jsx      # Suitability Reflexes
        ├── LifecycleSection.jsx        # Product Lifecycle timeline
        ├── StressSection.jsx           # Historical Stress Tests
        ├── CreditSection.jsx           # Issuer Credit Risk
        ├── VolatilitySection.jsx       # Vol & Pricing Intuition
        ├── WorstOfSection.jsx          # Worst-of Basket Mechanics
        ├── QuizSection.jsx             # Knowledge Check (15 questions)
        ├── GlossarySection.jsx         # Searchable Glossary
        ├── ComparisonSection.jsx       # Product Comparison Table
        └── RealBuilderSection.jsx      # Real Product Builder (live data)
```

## Adding a New Module

1. Create `src/sections/MyNewSection.jsx`:

```jsx
import { useTheme } from "../theme/ThemeContext.js";

export default function MyNewSection({ onNavigate }) {
  const theme = useTheme();
  return (
    <div className="fade-in" style={{ maxWidth: 960, margin: "0 auto" }}>
      {/* your content */}
    </div>
  );
}
```

2. Add it to `src/App.jsx`:

```js
// Import
import MyNewSection from "./sections/MyNewSection.jsx";

// Add to SECTION_MAP
const SECTION_MAP = { ..., mynew: MyNewSection };

// Add to TABS
const TABS = [ ..., { id: "mynew", label: "My Module", icon: "🆕" } ];

// Add to MODULE_IDS (for progress tracking)
const MODULE_IDS = [ ..., "mynew" ];
```

3. Optionally add a tile to `HomeSection.jsx`.

## Adding Glossary Terms

Edit `src/data/glossary.js` — add entries to the `GLOSSARY_TERMS` object:

```js
"My Term": { tag: "Mechanics", def: "Plain-language definition here." },
```

Use `<GT>My Term</GT>` anywhere in the JSX to get an automatic hover tooltip.

## Live Data (Real Product Builder)

The Real Product Builder fetches live prices from Yahoo Finance via the `allorigins.win` CORS proxy. This works in any browser. If the proxy is unavailable, the tool falls back gracefully to illustrative historical volatility data.

To swap the proxy, edit `src/components/builder/fetchQuote.js`.

## Tech Stack

- **React 18** + **Vite 5**
- No UI library (all custom CSS-in-JS)
- No state management library (useState/useContext only)
- No routing library (tab-based navigation in App.jsx)
- Fonts loaded from Google Fonts CDN (Playfair Display, JetBrains Mono, IBM Plex Sans)
