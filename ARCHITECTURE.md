# WhatchCharity.co.nz Architecture

## High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           WHATCHARITY.CO.NZ ARCHITECTURE                    │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────┐
                              │   USER BROWSER   │
                              └────────┬─────────┘
                                       │
                    ┌──────────────────┴──────────────────┐
                    │                                     │
         ┌──────────▼────────────┐         ┌─────────────▼────────┐
         │  DEVELOPMENT SERVER  │         │ PRODUCTION SERVER    │
         │   (localhost:8000)   │         │  (whatcharity.co.nz) │
         └──────────┬───────────┘         └──────────┬──────────┘
                    │                               │
         ┌──────────▼────────────┐     ┌────────────▼──────────────┐
         │   Python 3 Server    │     │   Apache/Nginx Server    │
         │   (server.py)        │     │   + PHP Support          │
         └──────────┬───────────┘     └────────────┬──────────────┘
                    │                               │
         ┌──────────┴──────────────────────────────┴────────────┐
         │                                                      │
         │         Serves Static Files & Routes API            │
         │                                                      │
    ┌────▼─────────────┐                         ┌───────▼─────────────┐
    │ Static Assets    │                         │  PHP API Handlers   │
    ├──────────────────┤                         ├──────────────────────┤
    │ index.html       │                         │ api/search.php       │
    │ app.js           │                         │ api/organisation.php │
    │ styles.css       │                         │ api/financial.php    │
    │ favicon.svg      │                         │ api/officers.php     │
    │ .htaccess        │                         │ api/historical.php   │
    └──────────────────┘                         │ api/documents.php    │
                                                 │ api/group.php        │
         ┌──────────────────────────────────────┤ api/groupinfo.php    │
         │                                       │ api/groupfinancial.php
         │      CORS PROXY / ROUTER             └──────────┬──────────┘
         │   (server.py / .htaccess)                       │
         │                                                 │
    ┌────▼──────────────────────────────────────────────┐ │
    │   REQUEST ROUTING                                │ │
    ├────────────────────────────────────────────────────┤ │
    │ /api/search          ──────────────┐              │ │
    │ /api/organisation    ──────┐       │              │ │
    │ /api/financial       ──────┼───┐   │              │ │
    │ /api/officers        ──────┼───┼─┐ │              │ │
    │ /api/historical      ──────┼───┼─┼─┤              │ │
    │ /api/documents       ──────┼───┼─┼─┤              │ │
    │ /api/group           ──────┼───┼─┼─┤              │ │
    │ /api/groupinfo       ──────┼───┼─┼─┤              │ │
    │ /api/groupfinancial  ──────┘   │ │ │              │ │
    └────────────────────────────────┼─┼─┼──────────────┘ │
                                     │ │ │ ALL ROUTES PROXY TO:
    ┌────────────────────────────────┼─┼─┼──────────────────────┐
    │                                │ │ │                      │
    └────────────────────────────────▼─▼─▼──────────────────────┘
                                     │
              ┌──────────────────────┴──────────────────────┐
              │                                             │
    ┌─────────▼───────────┐                   ┌────────────▼─────────┐
    │  OData API          │                   │  Charities Register  │
    │ (charities.govt.nz) │                   │     API              │
    ├─────────────────────┤                   ├──────────────────────┤
    │ Organisations       │                   │ GetDocuments         │
    │ AnnualReturn        │                   │ Endpoint             │
    │ Officers            │                   │                      │
    │ Groups              │                   │ Returns PDF/Documents
    │ Relationships       │                   │                      │
    └─────────────────────┘                   └──────────────────────┘
              │                                        │
    ┌─────────▴────────────────────────────────────────┴────────────┐
    │                                                                 │
    │   NZ CHARITIES REGISTER DATABASE                               │
    │   (Central government data source)                             │
    │                                                                 │
    └─────────────────────────────────────────────────────────────────┘
```

## Frontend Data Flow

```
    USER TYPES SEARCH QUERY
           │
           ▼
    ┌──────────────────────┐
    │ app.js               │  ← searchCharities()
    │ (2,125 lines)        │
    ├──────────────────────┤
    │ • Query validation   │
    │ • Query normalization│ (St/Saint, &/and, possessives)
    │ • Fuzzy matching     │ (Fuse.js - client-side)
    │ • API calling        │
    │ • DOM updates        │
    └──────────┬───────────┘
               │
       ┌───────┴──────────┐
       │                  │
    LIVE SEARCH         SEARCH REQUEST
    (Client-side with   (Hits API)
     Fuse.js library)   │
       │                │
       ▼                ▼
    ┌──────────────┐    GET /api/search?q=term
    │ Local Data   │    │
    │ Fuzzy Match  │    │ Routed to:
    │ Display      │    │ • Python server.py (dev)
    │ Suggestions  │    │ • PHP search.php (prod)
    └──────────────┘    │
                        ▼
                    ┌───────────────────────┐
                    │ OData Filter Query    │
                    │ (substringof + regex) │
                    └───────────┬───────────┘
                                │
                        ┌───────▼──────────┐
                        │  API Response    │
                        │  (JSON)          │
                        └───────┬──────────┘
                                │
                    ┌───────────▼─────────────┐
                    │ displaySearchResults()  │
                    │ Render dropdown list    │
                    └─────────────────────────┘
```

## Detailed Request Routing

### Development (localhost:8000 via Python server.py)

```
Browser Request                    Python Proxy                  External API
───────────────────────────────────────────────────────────────────────────────
GET /api/search?q=term      ──►   Parse query params      ──►  OData API
                                  Build OData filter           substringof
                                  proxy_request()              tolower(Name)
                                  Return JSON    ◄──────────────
```

### Production (whatcharity.co.nz via Apache + PHP)

```
Browser Request                    PHP Handler                External API
───────────────────────────────────────────────────────────────────────────────
GET /api/search.php?q=term  ──►   Parse GET params       ──►  OData API
                                  Detect charity number        substringof
                                  cURL request                 (Different filter
                                  Return JSON    ◄──────────────  for CC vs Name)
```

## API Endpoints Reference

| Endpoint | Purpose | OData Query |
|----------|---------|-------------|
| `/api/search` | Search charities by name or charity number | `Organisations` - Filter: Name or CharityNumber - Top: 10 |
| `/api/organisation` | Get full charity details (name, address, etc.) | `Organisations(id)` - Returns all fields |
| `/api/financial` | Get latest annual financial data | `AnnualReturn` - Filter: OrganisationId - OrderBy: YearEnded DESC - Top: 1 |
| `/api/officers` | Get board officers names and roles | `vOfficerOrganisations` - Filter: OrganisationId - Top: 20 |
| `/api/historical` | Get all historical annual returns | `AnnualReturn` - Filter: OrganisationId - OrderBy: YearEnded DESC |
| `/api/documents` | Get charity documents (PDFs, financials) | `register.charities.govt.nz/Document/GetDocuments` |
| `/api/group` | Get all orgs in a group | `Organisations` - Filter: GroupId |
| `/api/groupinfo` | Get group information | `Groups(id)` |
| `/api/groupfinancial` | Get group financial data | `Groups(id)/AnnualReturn` |

## Technology Stack

### Frontend
- **HTML5** - Semantic markup
- **Vanilla JavaScript ES6+** - No transpilation needed
- **CSS3** - Custom properties (CSS variables)
- **Fuse.js v7** - Client-side fuzzy search library

### Backend - Development
- **Python 3** - `SimpleHTTPRequestHandler`
- **CORS Proxy** - Handles same-origin policy issues

### Backend - Production
- **Apache/Nginx** - Web server
- **PHP** - API handlers with cURL
- `.htaccess` - URL rewriting rules

### Data Sources
- **OData API** (charities.govt.nz) - Main data source
- **Charities Register API** - Document retrieval

### Build & Deployment
- **No build tool** - Direct file serving
- **No minification/bundling** - Cache busting via query params (`?v=8`)
- **No transpilation** - Modern browser ES6+ support

## Data Flow: User Selects Charity

```
User Clicks Charity
     │
     ▼
selectCharity(organisationId, charityName)
     │
     ├─► showLoadingOverlay()
     │
     └─► Promise.all([
         loadFinancialData(id)       ──► /api/financial?id=123
         loadHistoricalReturns(id)   ──► /api/historical?id=123
         loadOfficers(id)            ──► /api/officers?id=123
         loadDocuments(id)           ──► /api/documents?id=123
         loadOrganisation(id)        ──► /api/organisation?id=123
         ])
         │
         ▼
    All data received
         │
         ├─► displayCharityInfo()
         ├─► displayFinancialData()
         ├─► displayHistoricalReturns()
         ├─► displayOfficers()
         ├─► displayDocuments()
         │
         ▼
    hideLoadingOverlay()
    Update URL: window.history.pushState()
    Display confetti animation 🎉
```

## Key Architectural Points

1. **Dual Environment**
   - Development uses Python proxy (server.py)
   - Production uses PHP handlers

2. **CORS Bridge**
   - Both Python and PHP add CORS headers
   - Handles browser same-origin policy restrictions

3. **Stateless API**
   - Each endpoint is independent
   - No session storage needed
   - All data from government sources

4. **Client-Side Rendering**
   - All UI built dynamically from API responses
   - No server-side HTML generation

5. **Parallel Loading**
   - Multiple API calls happen simultaneously via `Promise.all()`
   - Faster page load times

6. **Single Source of Truth**
   - All data from NZ government OData API
   - No database needed

7. **No Database**
   - Pure proxy/query wrapper around government data
   - Reduces infrastructure complexity

## File Structure

```
whatcharity.co.nz/
├── index.html              # Single-page application (747 lines)
├── app.js                  # Main application logic (2,125 lines)
├── styles.css              # All styling (1,983 lines)
├── server.py               # Python development server with CORS proxy
├── package.json            # Node.js dependencies
├── package-lock.json       # Locked dependency versions
├── favicon.svg             # Site icon
├── .htaccess               # Apache configuration
├── api/                    # PHP API endpoints (production)
│   ├── search.php
│   ├── organisation.php
│   ├── financial.php
│   ├── officers.php
│   ├── historical.php
│   ├── group.php
│   ├── groupinfo.php
│   ├── groupfinancial.php
│   └── documents.php
└── audit/                  # Testing & audit reports
    ├── README.md
    ├── BUG_INVESTIGATION_REPORT.md
    ├── PRODUCTION_AUDIT_REPORT.md
    └── Various audit and test scripts
```

## Frontend Organization

### HTML Structure
- Navigation bar with logo
- Hero section with title and subtitle
- Search section with input field and results dropdown
- Charity details section (hidden until selection)
- Various content sections: contact, financial, insights, assets, year-over-year, group details
- Footer with attribution

### JavaScript Organization (59 functions, 322 const declarations)

**Core Data Management Functions:**
- `searchCharities(query)` - Handles search with query normalization
- `selectCharity(organisationId, charityName)` - Loads full charity details
- `normalizeSearchQuery(query)` - Handles "St"/"Saint", possessives, "&"/"and" variations

**Data Loading Functions:**
- `loadFinancialData(organisationId)`
- `loadHistoricalReturns(organisationId)`
- `loadOfficers(organisationId)`
- `loadDocuments(organisationId)`
- `loadGroupMembers(groupId, organisationId, showGroupBanner)`

**Display Functions:**
- `displayCharityInfo(charity)` - Basic charity information
- `displayFinancialData(data)` - Financial metrics and breakdowns
- `displayYearOverYear(current, previous)` - YoY comparisons
- `displayInsights(data)` - Key metrics calculations
- `displaySearchResults(charities)` - Search dropdown results
- `displayOfficers(officers)`
- `displayDocuments(documents)`
- `displayGroupMembers(members)`

**Utility Functions:**
- Format functions: `formatCurrency()`, `formatDate()`, `formatNumber()`, etc.
- Helper functions: `getApiEndpoint()`, `getActivityName()`, `escapeHtml()`, etc.
- Loading/Error display: `showLoadingOverlay()`, `hideLoadingOverlay()`, `showError()`, etc.
- Animation functions: `setupScrollAnimations()`, `displayConfetti()`, etc.

### CSS Organization

Organized into logical sections:
- Navigation, Hero, Search styling
- Charity details layout
- Financial cards and breakdowns
- Insights and assets
- Year-over-year comparison styling
- Animations (breathing effect, confetti, Pac-Man loader)
- Responsive design with CSS Grid and Flexbox
- Color scheme with CSS custom properties

## API Architecture Summary

### Development (Local)
- Python `server.py` acts as a CORS proxy
- Routes requests to remote OData API: `https://www.odata.charities.govt.nz/`

### Production
- PHP endpoints in `/api/` directory
- Each endpoint maps to a specific data fetch (organisation, financial, search, etc.)

### Frontend Detection
- Auto-detects environment: localhost uses Python, production uses PHP
- Adds `.php` extension only for production endpoints

## Key Architecture Features

- **Single-page with URL state management** - Uses `window.history.pushState()` for shareable links
- **Parallel data loading** - Uses `Promise.all()` for simultaneous API calls
- **Fuzzy search with typo tolerance** - Fuse.js library with 0.4 threshold
- **Query normalization** - Handles common abbreviations (St/Saint, &/and, possessives)
- **Dynamic DOM manipulation** - All content rendering via JavaScript
- **Loading states** - Pac-Man loaders for visual feedback
- **Error handling** - Try-catch blocks with user-friendly error messages
- **Responsive design** - CSS Grid and Flexbox for all screen sizes
- **No build process or transpilation** - Pure ES6+ JavaScript (no transpilation needed for modern browsers)

## Deployment Notes

- Static files served with version cache-busting (`?v=8` on styles.css, `?v=20` on app.js)
- No minification/bundling in production
- Pure file serving with CORS-enabled proxy
- Lightweight and performant single-page application
