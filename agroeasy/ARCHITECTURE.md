# AgroEasy — Architecture & API Reference

This document maps every external API/dataset, every key, and every file in
the project, and shows how a request travels from a tap in the UI to an
external service and back.

---

## 1. External APIs and datasets

| # | Service | What it provides | Base URL | Auth | Config key (`application.properties`) | Called from |
|---|---|---|---|---|---|---|
| 1 | **data.gov.in — Agmarknet** | Daily mandi (market) crop prices: commodity, market, min/max/modal price, arrival date | `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070` | API key in query string | `app.datagovin.api-key`, `app.datagovin.price-resource` | `PriceService.java` |
| 2 | **OpenWeatherMap — Current Weather** | Temperature, humidity, wind, rain/thunderstorm condition for a city | `https://api.openweathermap.org/data/2.5/weather` | API key in query string | `app.openweather.api-key` | `WeatherService.java` |
| 3 | **Google Gemini API** | AI vision (crop disease diagnosis from photo) and AI text (grow/pesticide Q&A) | `https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent` | API key in query string | `app.gemini.api-key`, `app.gemini.model` | `AiService.java` |
| 4 | **Pesticide price reference** | *Not an API* — static hand-entered table (no free public API exists for Indian retail agrochemical prices) | n/a | n/a | n/a — hardcoded in code | `PesticideService.java` |

None of these four are called from the browser. The React frontend only ever
talks to your own Spring Boot server (`/api/...`); the server is the only
thing that holds the three real API keys and makes the outbound calls.

---

## 2. Where the keys live

**Single file, one place, never duplicated:**
```
backend/src/main/resources/application.properties
```
```properties
app.datagovin.api-key=...
app.datagovin.price-resource=9ef84268-d588-465a-a308-a864a43d0070
app.openweather.api-key=...
app.gemini.api-key=...
app.gemini.model=gemini-3.6-flash
app.jwt.secret=...
```
Spring injects these into services with `@Value("${app.xxx.key}")`. They are
read once at startup and kept server-side in memory — the frontend never
receives them in any response.

The **only** other secret is `app.jwt.secret`, used to sign login tokens
(explained in section 5).

---

## 3. Full file structure

```
agroeasy/
├── README.md                          Setup/run instructions
├── ARCHITECTURE.md                    This file
│
├── backend/                           Spring Boot 3 REST API (Java 17)
│   ├── pom.xml                        Maven deps: Web, Security, Data JPA, H2, MySQL driver, JJWT
│   └── src/main/
│       ├── resources/
│       │   └── application.properties  ALL config + ALL API keys (section 2)
│       └── java/com/agroeasy/
│           ├── AgroEasyApplication.java   Spring Boot entrypoint (main method)
│           │
│           ├── config/
│           │   └── SecurityConfig.java    Auth rules, CORS, password hashing bean
│           │
│           ├── security/
│           │   ├── JwtUtil.java           Creates/validates JWT tokens
│           │   └── JwtAuthFilter.java     Reads "Authorization: Bearer ..." on every request
│           │
│           ├── model/                     JPA entities (= database tables)
│           │   ├── User.java              id, name, email, passwordHash, role, preferredLanguage
│           │   └── ScanHistory.java       id, user (FK), diagnosisSummary, createdAt
│           │
│           ├── repository/                Spring Data JPA — auto-generated SQL
│           │   ├── UserRepository.java
│           │   └── ScanHistoryRepository.java
│           │
│           ├── dto/                       Request/response shapes (no logic)
│           │   ├── RegisterRequest.java   name, email, password, role
│           │   ├── LoginRequest.java      email, password
│           │   ├── AuthResponse.java      token, name, email, role
│           │   ├── DiseaseScanRequest.java  imageBase64, mediaType, language
│           │   ├── GuideRequest.java      question, language
│           │   ├── AiTextResponse.java    answer
│           │   └── ErrorResponse.java     message
│           │
│           ├── service/                   Business logic + external API calls
│           │   ├── UserService.java       register()/login() — hashes password, issues JWT
│           │   ├── PriceService.java      → calls data.gov.in (API #1)
│           │   ├── WeatherService.java    → calls OpenWeatherMap (API #2)
│           │   ├── AiService.java         → calls Google Gemini (API #3)
│           │   └── PesticideService.java  returns the static reference table (#4)
│           │
│           ├── controller/                REST endpoints — the only things the frontend calls
│           │   ├── AuthController.java     POST /api/auth/register, /api/auth/login
│           │   ├── PriceController.java    GET  /api/prices, /api/prices/ticker
│           │   ├── WeatherController.java  GET  /api/weather
│           │   ├── DiseaseController.java  POST /api/disease/scan
│           │   ├── GuideController.java    POST /api/guide/ask
│           │   └── PesticideController.java GET /api/pesticides
│           │
│           └── exception/
│               └── GlobalExceptionHandler.java  Turns errors into clean JSON messages
│
└── frontend/                          React 18 + Vite + Tailwind
    ├── package.json                   Deps: react, lucide-react, vite, tailwind
    ├── vite.config.js                 Dev server + proxies /api/* → localhost:8080
    ├── tailwind.config.js             Color palette (forest/leaf/turmeric/soil/sky) + fonts
    ├── index.html                     Loads Google Fonts (Fraunces, Work Sans, Noto Sans Devanagari/Bengali)
    └── src/
        ├── main.jsx                   React entry point, mounts <App/>
        ├── App.jsx                    Everything: shell, nav, and all 5 tabs (Home/Prices/Weather/Scan/Guide) + AuthScreen + Ticker
        ├── i18n.js                    English/Hindi/Bengali translation strings, STATES, CROPS, QUICK_TOPICS lists
        ├── api/
        │   └── client.js              Every fetch() call the frontend makes — the ONLY file that knows the backend's URL shape
        └── styles/
            └── index.css              Tailwind imports + ticker scroll animation
```

---

## 4. Request flow, feature by feature

Every feature follows the same pattern:
**React component → `api/client.js` function → Spring `Controller` → `Service` → external API/database → back up the same chain.**

### Prices tab
```
App.jsx (PricesTab)
  → api.prices(state, commodity)         [src/api/client.js]
    → GET /api/prices?state=..&commodity=..
      → PriceController.getPrices()       [controller/PriceController.java]
        → PriceService.getPrices()        [service/PriceService.java]
          → GET api.data.gov.in/resource/9ef84268-...  (API key attached server-side)
```
The top-of-screen scrolling ticker uses the same service via a separate,
unfiltered endpoint: `App.jsx (Ticker) → api.ticker() → GET /api/prices/ticker`.

### Weather tab
```
App.jsx (WeatherTab)
  → api.weather(city)
    → GET /api/weather?city=..
      → WeatherController.getWeather()
        → WeatherService.getWeather()
          → GET api.openweathermap.org/data/2.5/weather (API key attached server-side)
```
The rain/wind/heat/humidity advisory text under the weather card is **not**
from an API — it's simple `if` logic in `WeatherTab` inside `App.jsx`, reading
the thresholds off the OpenWeatherMap response.

### Disease scan tab
```
App.jsx (ScanTab) — user uploads photo, converted to base64 in the browser
  → api.scanDisease({ imageBase64, mediaType, language })
    → POST /api/disease/scan   (Authorization: Bearer <JWT> if logged in)
      → DiseaseController.scan()
        → AiService.diagnoseCropImage()    [service/AiService.java]
          → POST generativelanguage.googleapis.com/.../generateContent (Gemini, API key attached server-side)
        → (if authenticated) saves a ScanHistory row via ScanHistoryRepository
```

### Grow & pesticide guide tab
```
App.jsx (GuideTab)
  → api.askGuide({ question, language })
    → POST /api/guide/ask
      → GuideController.ask()
        → AiService.answerGuideQuestion()
          → POST generativelanguage.googleapis.com/.../generateContent (Gemini)

  → api.pesticides()   (loads the static reference table on tab open)
    → GET /api/pesticides
      → PesticideController.getReference()
        → PesticideService.getReference()   (hardcoded list, no external call)
```

### Login / signup
```
App.jsx (AuthScreen)
  → api.register(...) or api.login(...)
    → POST /api/auth/register or /api/auth/login
      → AuthController
        → UserService (BCrypt-hashes/checks password, calls JwtUtil to issue a token)
          → UserRepository → H2 (or MySQL) "users" table
  ← AuthResponse { token, name, email, role }
  Frontend stores token in sessionStorage("agroeasy_token")
  Every later authenticated call attaches: Authorization: Bearer <token>
  JwtAuthFilter reads it on the way in and identifies the user for that request
```

---

## 5. Database

- **Engine (default)**: H2, file-based, zero setup — file lives at `backend/data/agroeasy.mv.db`, created automatically on first run.
- **Tables** (created automatically from the `model/` classes, no manual SQL needed):
  - `users` — id, name, email (unique), password_hash, role, preferred_language
  - `scan_history` — id, user_id (FK → users), diagnosis_summary, created_at
- **Swap to MySQL**: edit the datasource block in `application.properties` (already included, commented out) — no Java code changes needed.

---

## 6. Summary — "if I want to change X, which file?"

| I want to... | Edit this file |
|---|---|
| Change/rotate an API key | `backend/src/main/resources/application.properties` |
| Add a new crop/state to the dropdowns | `frontend/src/i18n.js` (`STATES`, `CROPS`) |
| Change AI prompt wording or model | `backend/.../service/AiService.java` |
| Add a new REST endpoint | new method in the relevant `controller/` class, backed by a `service/` method |
| Change colors/fonts | `frontend/tailwind.config.js` |
| Add a translation string | `frontend/src/i18n.js` (`T.en`, `T.hi`, `T.bn`) |
| Change pesticide reference prices | `backend/.../service/PesticideService.java` |
| Switch database from H2 to MySQL | `backend/src/main/resources/application.properties` |
