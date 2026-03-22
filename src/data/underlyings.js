const UNIVERSE = [
  // Swiss Equities
  { id:"NESN.SW",  label:"Nestlé",         region:"CH", sector:"Consumer",    histVol:14, divYield:2.8, currency:"CHF" },
  { id:"NOVN.SW",  label:"Novartis",        region:"CH", sector:"Pharma",      histVol:16, divYield:3.2, currency:"CHF" },
  { id:"ROG.SW",   label:"Roche",           region:"CH", sector:"Pharma",      histVol:17, divYield:3.5, currency:"CHF" },
  { id:"UBSG.SW",  label:"UBS Group",       region:"CH", sector:"Banking",     histVol:30, divYield:2.1, currency:"CHF" },
  { id:"ABBN.SW",  label:"ABB",             region:"CH", sector:"Industrials", histVol:22, divYield:1.9, currency:"CHF" },
  { id:"SREN.SW",  label:"Swiss Re",        region:"CH", sector:"Insurance",   histVol:20, divYield:5.2, currency:"CHF" },
  { id:"GIVN.SW",  label:"Givaudan",        region:"CH", sector:"Specialty",   histVol:19, divYield:2.0, currency:"CHF" },
  { id:"LONN.SW",  label:"Lonza",           region:"CH", sector:"Pharma",      histVol:32, divYield:0.8, currency:"CHF" },
  // European Equities
  { id:"ASML.AS",  label:"ASML",            region:"EU", sector:"Technology",  histVol:33, divYield:0.8, currency:"EUR" },
  { id:"SAP.DE",   label:"SAP",             region:"EU", sector:"Technology",  histVol:25, divYield:1.4, currency:"EUR" },
  { id:"SIE.DE",   label:"Siemens",         region:"EU", sector:"Industrials", histVol:23, divYield:2.6, currency:"EUR" },
  { id:"OR.PA",    label:"L'Oréal",         region:"EU", sector:"Consumer",    histVol:18, divYield:1.9, currency:"EUR" },
  { id:"BNP.PA",   label:"BNP Paribas",     region:"EU", sector:"Banking",     histVol:29, divYield:6.1, currency:"EUR" },
  { id:"MC.PA",    label:"LVMH",            region:"EU", sector:"Luxury",      histVol:22, divYield:1.5, currency:"EUR" },
  // US Equities
  { id:"AAPL",     label:"Apple",           region:"US", sector:"Technology",  histVol:26, divYield:0.5, currency:"USD" },
  { id:"MSFT",     label:"Microsoft",       region:"US", sector:"Technology",  histVol:24, divYield:0.7, currency:"USD" },
  { id:"NVDA",     label:"NVIDIA",          region:"US", sector:"Technology",  histVol:55, divYield:0.0, currency:"USD" },
  { id:"JPM",      label:"JPMorgan",        region:"US", sector:"Banking",     histVol:22, divYield:2.2, currency:"USD" },
  { id:"JNJ",      label:"Johnson & Johnson",region:"US",sector:"Pharma",      histVol:14, divYield:3.0, currency:"USD" },
  // Indices
  { id:"^SSMI",    label:"SMI Index",       region:"CH", sector:"Index",       histVol:15, divYield:2.8, currency:"CHF" },
  { id:"^STOXX50E",label:"Euro Stoxx 50",   region:"EU", sector:"Index",       histVol:19, divYield:3.4, currency:"EUR" },
  { id:"^SPX",     label:"S&P 500",         region:"US", sector:"Index",       histVol:17, divYield:1.4, currency:"USD" },
  { id:"^NDX",     label:"Nasdaq 100",      region:"US", sector:"Index",       histVol:22, divYield:0.7, currency:"USD" },
];


export default UNIVERSE;
