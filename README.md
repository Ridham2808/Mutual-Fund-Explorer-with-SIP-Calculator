Mutual Fund Explorer with SIP & Lumpsum Calculators (Next.js + MUI)
===================================================================

Overview
--------
A modern, responsive Mutual Fund Explorer built with Next.js and MUI. It wraps MFAPI.in with custom API routes, displays rich fund data, draws interactive charts, and includes calculators for SIP and Lumpsum investments.

Screenshots
-----------

<p align="center">
  <img src="./photos/Home%20Page.png" alt="Home Page" width="900" />
  <br/>
  <em>Home</em>
</p>

<p align="center">
  <img src="./photos/Fund%20Search%20page.png" alt="Fund Search" width="900" />
  <br/>
  <em>Fund Search</em>
</p>

<p align="center">
  <img src="./photos/Scheme%20Detail%20Page.png" alt="Scheme Detail" width="900" />
  <br/>
  <em>Scheme Detail</em>
</p>

<p align="center">
  <img src="./photos/Compare%20Schemes%20page.png" alt="Compare Schemes" width="900" />
  <br/>
  <em>Compare Schemes</em>
</p>

Features
--------
- Fund discovery: search, grouped by fund house
- Scheme details: metadata, 1Y NAV line chart, returns snapshot
- SIP calculator: monthly investments with growth and annualized returns
- Lumpsum calculator: buy/sell date returns with annualization
- Compare page: normalize up to 5 schemes to compare 1Y growth
- Light/Dark theme toggle with persistence
- Animated, responsive UI with improved colors and motion

Data Source
----------
- All schemes: `https://api.mfapi.in/mf`
- Scheme NAV history: `https://api.mfapi.in/mf/{SCHEME_CODE}`

Getting Started
---------------
1) Install dependencies
```bash
npm install
```

2) Run the dev server
```bash
npm run dev
```

3) Open the app
- Browser: `http://localhost:3000`

Key Pages
---------
- `/` – Home with hero, feature cards, quick CTAs
- `/funds` – Browse/search all schemes
- `/scheme/[code]` – Scheme details, NAV chart, SIP & Lumpsum calculators
- `/compare` – Multi-scheme normalized growth comparison

API Endpoints (Wrapped)
-----------------------
- GET `/api/mf` – list all schemes (cached 24h)
- GET `/api/scheme/:code` – metadata + NAV history (cached 12h)
- GET `/api/scheme/:code/returns` – returns for a period or custom range
  - Query: `period=1m|3m|6m|1y` OR `from=YYYY-MM-DD&to=YYYY-MM-DD`
  - Response: `{ startDate, endDate, startNAV, endNAV, simpleReturn, annualizedReturn }`
- POST `/api/scheme/:code/sip` – monthly SIP calculator
  - Body:
  ```json
  {
    "amount": 5000,
    "frequency": "monthly",
    "from": "2020-01-01",
    "to": "2023-12-31"
  }
  ```
  - Response: `{ totalInvested, currentValue, totalUnits, absoluteReturn, annualizedReturn, timeline }`
- GET `/api/scheme/:code/lumpsum` – lumpsum buy/sell return
  - Query: `amount=NUMBER&on=YYYY-MM-DD&to=YYYY-MM-DD`
  - Response: `{ buyDate, sellDate, buyNav, sellNav, units, invested, value, absolute, annualized }`

SIP Calculation Rules
---------------------
- On each SIP date, use NAV of that day or nearest earlier
- Units = `amount / nav`
- Total Value = `totalUnits * endNav`
- Absolute Return % = `((totalValue - totalInvested) / totalInvested) * 100`
- Annualized Return % = `((totalValue / totalInvested)^(1/years)) - 1`
- Edge cases: ignore invalid NAV (<= 0); if insufficient data → `needs_review`

UI / UX
-------
- MUI Theme with light/dark palettes, animated gradient hero, elevated cards
- Charts via MUI X Charts (LineChart)
- Mobile-first responsive layout, motion on hover and transitions

How To Use
----------
- Navigate to `/funds` and search for a scheme. Click a card to open details.
- On the scheme page:
  - View NAV history and returns
  - Use the SIP tab to simulate monthly investments
  - Use the Lumpsum tab to simulate buy/sell returns
- Compare growth for multiple schemes on `/compare`
- Toggle theme from the top-right sun/moon icon

Notes
-----
- In-memory caching is used for performance (12–24h TTL). Restart clears cache.
- Consider Redis if persistent caching is required.

License
-------
MIT
