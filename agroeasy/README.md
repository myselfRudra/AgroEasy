# AgroEasy — Java full-stack

A mandi price, weather, AI crop-disease detection, and grow/pesticide guide app
for Indian farmers and traders, in English, Hindi, and Bengali.

## Stack

- **Backend**: Java 17, Spring Boot 3 (Web, Security, Data JPA), H2 (file-based,
  swap to MySQL any time), JWT auth, `RestClient` proxies to data.gov.in,
  OpenWeatherMap, and the Google Gemini API (Gemini 3.6 Flash).
- **Frontend**: React 18 + Vite, Tailwind CSS, lucide-react icons.

The frontend never talks to data.gov.in / OpenWeatherMap / Gemini directly —
every external call is proxied through the Spring Boot API, so your API keys
stay on the server and are never exposed in the browser.

## Project layout

```
agroeasy/
├── backend/    Spring Boot REST API (Maven)
└── frontend/   React + Vite app
```

## 1. Backend setup

Requires Java 17+ and Maven (or use the included `mvnw` if you add one).

```bash
cd backend
```

Open `src/main/resources/application.properties` and set:

- `app.gemini.api-key` — get one from https://aistudio.google.com/apikey
  (required for disease detection and the grow/pesticide guide; Gemini has a
  free tier, so this can be $0 for development)
- `app.jwt.secret` — replace with a long random string before deploying
- `app.datagovin.api-key` / `app.openweather.api-key` — already filled in with
  the keys you provided; regenerate your own before going to production, since
  these are now sitting in a plain-text file

By default it uses a local H2 file database (`./data/agroeasy`, created
automatically) — nothing to install. To use MySQL instead, follow the
commented-out block in `application.properties` and add your credentials.

Run it:

```bash
mvn spring-boot:run
```

The API starts on **http://localhost:8080**. H2 console (if you want to peek
at the data): http://localhost:8080/h2-console — JDBC URL `jdbc:h2:file:./data/agroeasy`.

### Endpoints

| Method | Path                  | Auth | Purpose |
|--------|-----------------------|------|---------|
| POST   | `/api/auth/register`  | no   | Create account, returns JWT |
| POST   | `/api/auth/login`     | no   | Log in, returns JWT |
| GET    | `/api/prices?state=&commodity=` | no | Mandi prices |
| GET    | `/api/prices/ticker`  | no   | Small feed for the top ticker |
| GET    | `/api/weather?city=`  | no   | Current weather |
| GET    | `/api/pesticides`     | no   | Pesticide price reference table |
| POST   | `/api/disease/scan`   | optional | AI crop photo diagnosis (send Bearer token to save scan history) |
| POST   | `/api/guide/ask`      | no   | AI grow/pesticide Q&A |

## 2. Frontend setup

Requires Node 18+.

```bash
cd frontend
npm install
npm run dev
```

Opens on **http://localhost:5173** and proxies `/api/*` to the backend at
`localhost:8080` (see `vite.config.js`). Log in or create an account, and
you're in.

## 3. Building for production

```bash
# backend
cd backend && mvn clean package
java -jar target/agroeasy-backend-1.0.0.jar

# frontend
cd frontend && npm run build
# serve the dist/ folder from any static host (Nginx, Vercel, etc.)
# and point app.cors.allowed-origin in application.properties at its real URL
```

## Notes / things to tighten before going live

- Rotate the `data.gov.in` and OpenWeatherMap keys that were shared in chat —
  treat any key pasted into a conversation as compromised.
- Add rate limiting in front of `/api/disease/scan` and `/api/guide/ask` —
  each call counts against your Gemini quota/billing.
- Swap H2 for MySQL/Postgres for anything beyond local development.
- The AI calls use Gemini 3.6 Flash via plain HTTP (no Google SDK needed).
  Model IDs move fast — if `app.gemini.model` starts returning 404s, check
  https://ai.google.dev/gemini-api/docs/models for the current Flash model
  name and update that one property. If you'd rather use Claude or another
  provider, only `AiService.java` needs to change — endpoint, request shape,
  response parsing — everything else (controllers, frontend) stays the same.
