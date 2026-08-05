const BASE = "/api";

function authHeaders() {
  const token = sessionStorage.getItem("agroeasy_token");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || "Request failed.");
  }
  return data;
}

export const api = {
  register: (payload) =>
    fetch(`${BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  login: (payload) =>
    fetch(`${BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then(handle),

  ticker: () => fetch(`${BASE}/prices/ticker`).then((r) => r.json()),

  prices: (state, commodity) =>
    fetch(`${BASE}/prices?state=${encodeURIComponent(state)}&commodity=${encodeURIComponent(commodity)}&limit=40`).then(
      (r) => r.json()
    ),

  weather: (city) => fetch(`${BASE}/weather?city=${encodeURIComponent(city)}`).then((r) => r.json()),

  pesticides: () => fetch(`${BASE}/pesticides`).then((r) => r.json()),

  scanDisease: (payload) =>
    fetch(`${BASE}/disease/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),

  askGuide: (payload) =>
    fetch(`${BASE}/guide/ask`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...authHeaders() },
      body: JSON.stringify(payload),
    }).then(handle),
};
