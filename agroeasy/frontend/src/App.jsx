import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sprout, TrendingUp, CloudSun, Camera, BookOpen, LogOut, Globe, MapPin,
  Loader2, Upload, AlertTriangle, Droplets, Wind, ThermometerSun,
  ChevronRight, Bug, Check, RefreshCw,
} from "lucide-react";
import { T, STATES, CROPS, QUICK_TOPICS } from "./i18n.js";
import { api } from "./api/client.js";

const inputCls =
  "w-full rounded-md border border-[#D9CFB4] bg-white px-3 py-2 text-[14px] text-[#2A2A22] outline-none focus:border-[#4C7A4C] focus:ring-1 focus:ring-[#4C7A4C] transition";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="block text-[11px] uppercase tracking-[0.12em] text-[#7A5230] font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}

/* ---------------- Ticker (signature element) ---------------- */
function Ticker() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.ticker().then((d) => setItems(d.records || [])).catch(() => {});
  }, []);
  if (items.length === 0) return null;
  const loop = [...items, ...items];
  return (
    <div className="overflow-hidden border-b border-[#16291f]" style={{ background: "#1F3D2E" }}>
      <div className="flex whitespace-nowrap py-1.5 animate-ticker">
        {loop.map((it, i) => (
          <span key={i} className="mx-4 text-[12px] tracking-wide text-[#EFE7CF] flex items-center gap-1.5 shrink-0">
            <span className="font-semibold text-[#E0A32C]">{it.commodity}</span>
            <span className="opacity-70">{it.market}</span>
            <span className="font-semibold">₹{it.modal_price}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Auth ---------------- */
function AuthScreen({ t, onAuthed }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "farmer" });
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = mode === "signup" ? await api.register(form) : await api.login(form);
      sessionStorage.setItem("agroeasy_token", res.token);
      onAuthed(res);
    } catch (ex) {
      setErr(ex.message || "Something went wrong.");
    }
    setBusy(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10" style={{ background: "#F7F3E8" }}>
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-1">
          <div className="w-10 h-10 rounded-full bg-[#1F3D2E] flex items-center justify-center">
            <Sprout size={19} className="text-[#E0A32C]" />
          </div>
          <h1 className="font-display text-[26px] font-semibold text-[#1F3D2E] tracking-tight">{t.appName}</h1>
        </div>
        <p className="text-center text-[13px] text-[#7A5230] mb-6">{t.tagline}</p>

        <div className="bg-white border border-[#E7DFC6] rounded-xl p-5 shadow-sm">
          <div className="flex mb-4 rounded-md overflow-hidden border border-[#E7DFC6]">
            <button onClick={() => setMode("login")} className={`flex-1 py-2 text-[13px] font-semibold ${mode === "login" ? "bg-[#1F3D2E] text-white" : "bg-white text-[#7A5230]"}`}>{t.login}</button>
            <button onClick={() => setMode("signup")} className={`flex-1 py-2 text-[13px] font-semibold ${mode === "signup" ? "bg-[#1F3D2E] text-white" : "bg-white text-[#7A5230]"}`}>{t.signup}</button>
          </div>

          <form onSubmit={submit} className="space-y-3">
            {mode === "signup" && (
              <Field label={t.name}>
                <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ram Kumar" />
              </Field>
            )}
            <Field label={t.email}>
              <input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
            </Field>
            <Field label={t.password}>
              <input type="password" className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
            </Field>
            {mode === "signup" && (
              <Field label={t.role}>
                <div className="flex gap-2">
                  {["farmer", "trader"].map((r) => (
                    <button type="button" key={r} onClick={() => setForm({ ...form, role: r })}
                      className={`flex-1 py-2 rounded-md text-[13px] font-semibold border ${form.role === r ? "bg-[#E0A32C] border-[#E0A32C] text-[#1F3D2E]" : "border-[#D9CFB4] text-[#7A5230]"}`}>
                      {r === "farmer" ? t.farmer : t.trader}
                    </button>
                  ))}
                </div>
              </Field>
            )}
            {err && <p className="text-[12px] text-[#C0483B] flex items-center gap-1"><AlertTriangle size={13} />{err}</p>}
            <button disabled={busy} className="w-full py-2.5 rounded-md bg-[#4C7A4C] text-white text-[14px] font-semibold flex items-center justify-center gap-2 hover:bg-[#3f6a3f] transition disabled:opacity-60">
              {busy ? <Loader2 size={16} className="animate-spin" /> : mode === "login" ? t.login : t.signup}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Home ---------------- */
function HomeTab({ t, user, go }) {
  const cards = [
    { key: "prices", icon: <TrendingUp size={20} />, label: t.prices, color: "#4C7A4C" },
    { key: "weather", icon: <CloudSun size={20} />, label: t.weather, color: "#3E7CA6" },
    { key: "scan", icon: <Camera size={20} />, label: t.scan, color: "#C0483B" },
    { key: "guide", icon: <BookOpen size={20} />, label: t.guide, color: "#B4791C" },
  ];
  return (
    <div className="space-y-5">
      <div className="rounded-xl p-5 text-white" style={{ background: "linear-gradient(135deg,#1F3D2E,#2E5641)" }}>
        <p className="text-[13px] opacity-80">{t.welcome},</p>
        <p className="font-display text-[20px] font-semibold">{user.name}</p>
        <p className="text-[12.5px] opacity-80 mt-2 leading-relaxed">{t.heroLine}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <button key={c.key} onClick={() => go(c.key)} className="bg-white border border-[#E7DFC6] rounded-xl p-4 text-left hover:shadow-sm transition">
            <div className="w-9 h-9 rounded-full flex items-center justify-center mb-2.5" style={{ background: c.color + "1a", color: c.color }}>
              {c.icon}
            </div>
            <p className="text-[14px] font-semibold text-[#1F3D2E] flex items-center gap-1">{c.label}<ChevronRight size={13} /></p>
          </button>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Prices ---------------- */
function PricesTab({ t }) {
  const [state, setState] = useState("Maharashtra");
  const [crop, setCrop] = useState("Onion");
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPrices = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const data = await api.prices(state, crop);
      setRows(data.records || []);
    } catch {
      setError(t.errorFetch);
    }
    setLoading(false);
  }, [state, crop, t]);

  useEffect(() => { fetchPrices(); }, []); // eslint-disable-line

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label={t.stateLabel}>
          <select className={inputCls} value={state} onChange={(e) => setState(e.target.value)}>
            {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={t.cropLabel}>
          <select className={inputCls} value={crop} onChange={(e) => setCrop(e.target.value)}>
            {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
      </div>
      <button onClick={fetchPrices} className="flex items-center gap-1.5 text-[13px] font-semibold text-[#4C7A4C]">
        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> {t.refresh}
      </button>

      {loading && <div className="py-10 flex justify-center text-[#7A5230]"><Loader2 className="animate-spin" size={22} /></div>}
      {!loading && error && <p className="text-[13px] text-[#C0483B]">{error}</p>}
      {!loading && !error && rows.length === 0 && <p className="text-[13px] text-[#7A5230]">{t.noData}</p>}

      <div className="space-y-2">
        {rows.map((r, i) => (
          <div key={i} className="bg-white border border-[#E7DFC6] rounded-lg px-4 py-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[14px] font-semibold text-[#1F3D2E]">{r.commodity} <span className="text-[12px] font-normal text-[#7A5230]">· {r.variety}</span></p>
                <p className="text-[12px] text-[#7A5230] flex items-center gap-1 mt-0.5"><MapPin size={11} />{r.market}, {r.district}</p>
              </div>
              <div className="text-right">
                <p className="text-[16px] font-bold text-[#1F3D2E]">₹{r.modal_price}</p>
                <p className="text-[11px] text-[#B49A6A]">{t.perQuintal}</p>
              </div>
            </div>
            <div className="flex gap-4 mt-2 pt-2 border-t border-dashed border-[#E7DFC6] text-[11px] text-[#7A5230]">
              <span>{t.minPrice}: ₹{r.min_price}</span>
              <span>{t.maxPrice}: ₹{r.max_price}</span>
              <span className="ml-auto">{r.arrival_date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Weather ---------------- */
function WeatherTab({ t }) {
  const [city, setCity] = useState("Nagpur");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWeather = useCallback(async () => {
    if (!city.trim()) return;
    setLoading(true); setError("");
    try {
      const json = await api.weather(city);
      if (json.cod && json.cod !== 200) { setError(t.errorFetch); setData(null); }
      else setData(json);
    } catch {
      setError(t.errorFetch);
    }
    setLoading(false);
  }, [city, t]);

  useEffect(() => { fetchWeather(); }, []); // eslint-disable-line

  const advisories = [];
  if (data) {
    const temp = data.main?.temp;
    const wind = data.wind?.speed;
    const rain = data.weather?.[0]?.main === "Rain" || data.weather?.[0]?.main === "Thunderstorm";
    const humidity = data.main?.humidity;
    if (rain) advisories.push({ icon: <Droplets size={14} />, text: "Rain expected — delay pesticide spraying and fertilizer application." });
    if (typeof wind === "number" && wind > 8) advisories.push({ icon: <Wind size={14} />, text: "High wind — avoid spraying, secure staked plants and covers." });
    if (typeof temp === "number" && temp > 38) advisories.push({ icon: <ThermometerSun size={14} />, text: "Heat stress risk — irrigate early morning or evening, mulch soil." });
    if (typeof humidity === "number" && humidity > 80) advisories.push({ icon: <AlertTriangle size={14} />, text: "High humidity — watch for fungal disease, ensure crop spacing for airflow." });
    if (advisories.length === 0) advisories.push({ icon: <Check size={14} />, text: "Conditions look normal for routine field work today." });
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input className={inputCls} value={city} onChange={(e) => setCity(e.target.value)} placeholder={t.yourCity}
          onKeyDown={(e) => e.key === "Enter" && fetchWeather()} />
        <button onClick={fetchWeather} className="px-4 rounded-md bg-[#3E7CA6] text-white text-[13px] font-semibold shrink-0">{t.getWeather}</button>
      </div>

      {loading && <div className="py-10 flex justify-center text-[#3E7CA6]"><Loader2 className="animate-spin" size={22} /></div>}
      {!loading && error && <p className="text-[13px] text-[#C0483B]">{error}</p>}

      {!loading && data && data.main && (
        <>
          <div className="rounded-xl p-5 text-white" style={{ background: "linear-gradient(135deg,#3E7CA6,#2A5C7E)" }}>
            <p className="text-[13px] opacity-90 flex items-center gap-1"><MapPin size={13} />{data.name}, India</p>
            <div className="flex items-end gap-2 mt-1">
              <span className="font-display text-[42px] font-semibold leading-none">{Math.round(data.main.temp)}°</span>
              <span className="text-[13px] opacity-90 mb-1">{t.feelsLike} {Math.round(data.main.feels_like)}°</span>
            </div>
            <p className="text-[13px] capitalize opacity-90">{data.weather?.[0]?.description}</p>
            <div className="flex gap-4 mt-3 text-[12px] opacity-90">
              <span className="flex items-center gap-1"><Droplets size={13} />{t.humidity} {data.main.humidity}%</span>
              <span className="flex items-center gap-1"><Wind size={13} />{t.windSpeed} {data.wind?.speed} m/s</span>
            </div>
          </div>

          <div className="bg-white border border-[#E7DFC6] rounded-lg p-4">
            <p className="text-[12px] uppercase tracking-[0.12em] font-semibold text-[#7A5230] mb-2">{t.advisory}</p>
            <div className="space-y-2">
              {advisories.map((a, i) => (
                <div key={i} className="flex items-start gap-2 text-[13px] text-[#2A2A22]">
                  <span className="text-[#3E7CA6] mt-0.5">{a.icon}</span>
                  <span>{a.text}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Disease scan ---------------- */
function ScanTab({ t, lang }) {
  const [preview, setPreview] = useState(null);
  const [base64, setBase64] = useState(null);
  const [mediaType, setMediaType] = useState("image/jpeg");
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const fileRef = useRef(null);

  const onFile = (file) => {
    if (!file) return;
    setMediaType(file.type || "image/jpeg");
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setPreview(dataUrl);
      setBase64(dataUrl.split(",")[1]);
      setResult("");
    };
    reader.readAsDataURL(file);
  };

  const analyze = async () => {
    if (!base64) return;
    setBusy(true); setResult("");
    try {
      const res = await api.scanDisease({ imageBase64: base64, mediaType, language: lang });
      setResult(res.answer);
      setHistory((h) => [...h, preview]);
    } catch (ex) {
      setResult(ex.message || t.errorFetch);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-4">
      <div
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-[#C9BC93] rounded-xl bg-white p-6 text-center cursor-pointer hover:border-[#4C7A4C] transition"
      >
        {preview ? (
          <img src={preview} alt="crop" className="mx-auto max-h-56 rounded-lg object-cover" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#7A5230]">
            <Upload size={26} />
            <p className="text-[13px]">{t.uploadImage}</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
      </div>

      {preview && (
        <button onClick={analyze} disabled={busy} className="w-full py-2.5 rounded-md bg-[#4C7A4C] text-white text-[14px] font-semibold flex items-center justify-center gap-2 disabled:opacity-60">
          {busy ? <><Loader2 size={16} className="animate-spin" />{t.analyzing}</> : <><Bug size={16} />{t.analyze}</>}
        </button>
      )}

      {result && (
        <div className="bg-white border border-[#E7DFC6] rounded-lg p-4 whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#2A2A22]">
          {result}
        </div>
      )}

      <div>
        <p className="text-[12px] uppercase tracking-[0.12em] font-semibold text-[#7A5230] mb-2">{t.recentScans}</p>
        {history.length === 0 ? (
          <p className="text-[13px] text-[#B49A6A]">{t.noScans}</p>
        ) : (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {history.slice().reverse().map((src, i) => (
              <img key={i} src={src} alt="" className="w-16 h-16 object-cover rounded-md border border-[#E7DFC6] shrink-0" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------- Grow & pesticide guide ---------------- */
function GuideTab({ t, lang }) {
  const [q, setQ] = useState("");
  const [answer, setAnswer] = useState("");
  const [busy, setBusy] = useState(false);
  const [pesticides, setPesticides] = useState([]);

  useEffect(() => { api.pesticides().then(setPesticides).catch(() => {}); }, []);

  const ask = async (question) => {
    const query = question || q;
    if (!query.trim()) return;
    setBusy(true); setAnswer("");
    try {
      const res = await api.askGuide({ question: query, language: lang });
      setAnswer(res.answer);
    } catch (ex) {
      setAnswer(ex.message || t.errorFetch);
    }
    setBusy(false);
  };

  return (
    <div className="space-y-5">
      <Field label={t.askGuide}>
        <div className="flex gap-2">
          <input className={inputCls} value={q} onChange={(e) => setQ(e.target.value)} placeholder={t.guidePlaceholder}
            onKeyDown={(e) => e.key === "Enter" && ask()} />
          <button onClick={() => ask()} disabled={busy} className="px-4 rounded-md bg-[#7A5230] text-white text-[13px] font-semibold shrink-0 flex items-center gap-1.5 disabled:opacity-60">
            {busy ? <Loader2 size={14} className="animate-spin" /> : <BookOpen size={14} />}{t.ask}
          </button>
        </div>
      </Field>

      <div>
        <p className="text-[12px] uppercase tracking-[0.12em] font-semibold text-[#7A5230] mb-2">{t.quickTopics}</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_TOPICS.map((topic) => (
            <button key={topic} onClick={() => { setQ(topic); ask(topic); }}
              className="text-[12px] px-3 py-1.5 rounded-full border border-[#D9CFB4] text-[#7A5230] bg-white hover:border-[#4C7A4C] transition">
              {topic}
            </button>
          ))}
        </div>
      </div>

      {busy && <div className="py-6 flex justify-center text-[#7A5230]"><Loader2 className="animate-spin" size={20} /></div>}
      {answer && (
        <div className="bg-white border border-[#E7DFC6] rounded-lg p-4 whitespace-pre-wrap text-[13.5px] leading-relaxed text-[#2A2A22]">
          {answer}
        </div>
      )}

      <div>
        <p className="text-[12px] uppercase tracking-[0.12em] font-semibold text-[#7A5230] mb-2">{t.pesticidePrices}</p>
        <div className="bg-white border border-[#E7DFC6] rounded-lg divide-y divide-[#EFE7CF]">
          {pesticides.map((p) => (
            <div key={p.name} className="px-4 py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[13.5px] font-semibold text-[#1F3D2E] truncate">{p.name}</p>
                <p className="text-[12px] text-[#7A5230] truncate">{p.use}</p>
              </div>
              <p className="text-[13px] font-semibold text-[#B4791C] shrink-0">{p.price}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-[#B49A6A] mt-1.5">Indicative retail range — actual prices vary by dealer and state.</p>
      </div>
    </div>
  );
}

/* ---------------- App shell ---------------- */
export default function App() {
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("home");
  const t = T[lang];

  useEffect(() => {
    const saved = localStorage.getItem("agroeasy_lang");
    if (saved) setLang(saved);
  }, []);

  const changeLang = (l) => {
    setLang(l);
    localStorage.setItem("agroeasy_lang", l);
  };

  const logout = () => {
    sessionStorage.removeItem("agroeasy_token");
    setUser(null);
    setTab("home");
  };

  if (!user) {
    return <AuthScreen t={t} onAuthed={setUser} />;
  }

  const NAV = [
    { key: "home", icon: <Sprout size={18} />, label: t.home },
    { key: "prices", icon: <TrendingUp size={18} />, label: t.prices },
    { key: "weather", icon: <CloudSun size={18} />, label: t.weather },
    { key: "scan", icon: <Camera size={18} />, label: t.scan },
    { key: "guide", icon: <BookOpen size={18} />, label: t.guide },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#F7F3E8" }}>
      <div className="bg-white border-b border-[#E7DFC6] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-[#1F3D2E] flex items-center justify-center">
            <Sprout size={14} className="text-[#E0A32C]" />
          </div>
          <span className="font-display text-[16px] font-semibold text-[#1F3D2E]">{t.appName}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <select value={lang} onChange={(e) => changeLang(e.target.value)}
              className="text-[12px] border border-[#D9CFB4] rounded-md pl-6 pr-2 py-1 bg-white appearance-none">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="bn">বাংলা</option>
            </select>
            <Globe size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#7A5230] pointer-events-none" />
          </div>
          <button onClick={logout} className="text-[#7A5230]" aria-label={t.logout}><LogOut size={17} /></button>
        </div>
      </div>

      <Ticker />

      <div className="flex-1 max-w-md w-full mx-auto px-4 py-5 pb-24">
        {tab === "home" && <HomeTab t={t} user={user} go={setTab} />}
        {tab === "prices" && <PricesTab t={t} />}
        {tab === "weather" && <WeatherTab t={t} />}
        {tab === "scan" && <ScanTab t={t} lang={lang} />}
        {tab === "guide" && <GuideTab t={t} lang={lang} />}
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[#E7DFC6]">
        <div className="max-w-md mx-auto grid grid-cols-5">
          {NAV.map((n) => (
            <button key={n.key} onClick={() => setTab(n.key)}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10.5px] font-medium ${tab === n.key ? "text-[#4C7A4C]" : "text-[#B49A6A]"}`}>
              {n.icon}
              {n.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
