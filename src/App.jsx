import { useState, useEffect, useRef, useMemo } from "react";
import { Plus, Minus, Trash2, ChefHat, Copy, Check, X, LogOut, Sparkles, Loader2, ShoppingCart, Lightbulb, RefreshCw, PartyPopper, Circle, Snowflake, Pencil, ChevronDown, ChevronUp, Flame, TrendingDown } from "lucide-react";
import { dbLoad, dbInsert, dbSave, dbSubscribe } from "./supabase";

const NAME_EMOJI = { "양파":"🧅","마늘":"🧄","대파":"🌿","파":"🌿","당근":"🥕","감자":"🥔","고구마":"🍠","토마토":"🍅","방울토마토":"🍅","오이":"🥒","가지":"🍆","호박":"🎃","애호박":"🎃","브로콜리":"🥦","상추":"🥬","배추":"🥬","양배추":"🥬","시금치":"🥬","버섯":"🍄","느타리버섯":"🍄","팽이버섯":"🍄","옥수수":"🌽","고추":"🌶️","청양고추":"🌶️","아보카도":"🥑","레몬":"🍋","생강":"🫚","무":"🥬","아스파라거스":"🥬","파프리카":"🫑","피망":"🫑","깻잎":"🌿","부추":"🌿","콩나물":"🌱","숙주":"🌱","사과":"🍎","바나나":"🍌","딸기":"🍓","포도":"🍇","오렌지":"🍊","귤":"🍊","수박":"🍉","복숭아":"🍑","체리":"🍒","키위":"🥝","파인애플":"🍍","블루베리":"🫐","망고":"🥭","우유":"🥛","치즈":"🧀","버터":"🧈","계란":"🥚","달걀":"🥚","요거트":"🥛","생크림":"🥛","닭":"🍗","닭고기":"🍗","소고기":"🥩","돼지고기":"🥓","삼겹살":"🥓","베이컨":"🥓","소시지":"🌭","햄":"🍖","고등어":"🐟","연어":"🍣","새우":"🦐","오징어":"🦑","멸치":"🐟","쌀":"🍚","밥":"🍚","빵":"🍞","식빵":"🍞","라면":"🍜","파스타":"🍝","스파게티":"🍝","국수":"🍜","떡":"🍡","만두":"🥟","두부":"🍢","김치":"🥬","김":"🍙","꿀":"🍯","후추":"🧂","간장":"🥢","된장":"🥣","고추장":"🌶️","소금":"🧂","설탕":"🧂","식용유":"🫗","올리브유":"🫗","참기름":"🫗","케첩":"🍅","마요네즈":"🥚","물":"💧","주스":"🧃","커피":"☕","맥주":"🍺","와인":"🍷","콜라":"🥤" };
const CAT_EMOJI = { "채소":"🥬","과일":"🍎","육류":"🥩","해산물":"🐟","유제품":"🧀","면/곡물":"🍚","양념":"🧂","음료":"🥤","기타":"🥡" };
function pickEmoji(name, cat) { const n = (name || "").replace(/\s/g, ""); for (const key of Object.keys(NAME_EMOJI)) if (n.includes(key)) return NAME_EMOJI[key]; return cat ? (CAT_EMOJI[cat] || "🥡") : "🥡"; }

const D = (name, cat, loc, shelf = null) => ({ name, cat, loc, shelf });
const DICT = [
  D("양파","채소","pantry",21), D("마늘","채소","pantry",30), D("대파","채소","fridge",7), D("당근","채소","fridge",14),
  D("감자","채소","pantry",21), D("고구마","채소","pantry",21), D("토마토","채소","pantry",7), D("방울토마토","채소","fridge",7),
  D("오이","채소","fridge",5), D("가지","채소","fridge",5), D("애호박","채소","fridge",7), D("호박","채소","pantry",14),
  D("브로콜리","채소","fridge",5), D("상추","채소","fridge",5), D("배추","채소","fridge",10), D("양배추","채소","fridge",14),
  D("시금치","채소","fridge",4), D("버섯","채소","fridge",5), D("느타리버섯","채소","fridge",5), D("팽이버섯","채소","fridge",7),
  D("옥수수","채소","fridge",3), D("고추","채소","fridge",7), D("청양고추","채소","fridge",7), D("파프리카","채소","fridge",10),
  D("피망","채소","fridge",10), D("무","채소","fridge",14), D("아스파라거스","채소","fridge",4), D("생강","채소","fridge",21),
  D("깻잎","채소","fridge",5), D("부추","채소","fridge",4), D("콩나물","채소","fridge",3), D("숙주","채소","fridge",2),
  D("사과","과일","fridge",21), D("바나나","과일","pantry",5), D("딸기","과일","fridge",3), D("포도","과일","fridge",5),
  D("오렌지","과일","fridge",14), D("귤","과일","fridge",10), D("수박","과일","fridge",5), D("복숭아","과일","fridge",4),
  D("체리","과일","fridge",5), D("키위","과일","fridge",14), D("파인애플","과일","fridge",5), D("블루베리","과일","fridge",7),
  D("망고","과일","pantry",5), D("레몬","과일","fridge",21), D("아보카도","과일","pantry",4),
  D("우유","유제품","fridge"), D("치즈","유제품","fridge"), D("버터","유제품","fridge"), D("계란","유제품","fridge"),
  D("달걀","유제품","fridge"), D("요거트","유제품","fridge"), D("생크림","유제품","fridge"),
  D("닭고기","육류","fridge"), D("소고기","육류","fridge"), D("돼지고기","육류","fridge"), D("삼겹살","육류","fridge"),
  D("베이컨","육류","fridge"), D("소시지","육류","fridge"), D("햄","육류","fridge"),
  D("고등어","해산물","fridge"), D("연어","해산물","fridge"), D("새우","해산물","freezer"), D("오징어","해산물","fridge"), D("멸치","해산물","pantry"),
  D("쌀","면/곡물","pantry"), D("밥","면/곡물","fridge",2), D("빵","면/곡물","pantry",4), D("식빵","면/곡물","pantry",4),
  D("라면","면/곡물","pantry"), D("파스타","면/곡물","pantry"), D("스파게티","면/곡물","pantry"), D("국수","면/곡물","pantry"),
  D("떡","면/곡물","fridge",3), D("만두","면/곡물","freezer"), D("두부","기타","fridge"), D("김치","채소","fridge"),
  D("간장","양념","pantry"), D("된장","양념","fridge"), D("고추장","양념","fridge"), D("소금","양념","pantry"),
  D("설탕","양념","pantry"), D("식용유","양념","pantry"), D("올리브유","양념","pantry"), D("참기름","양념","pantry"),
  D("케첩","양념","fridge"), D("마요네즈","양념","fridge"), D("후추","양념","pantry"), D("꿀","양념","pantry"),
  D("물","음료","pantry"), D("주스","음료","fridge"), D("커피","음료","pantry"), D("맥주","음료","fridge"), D("와인","음료","fridge"), D("콜라","음료","pantry"),
];

const CHO = ["ㄱ","ㄲ","ㄴ","ㄷ","ㄸ","ㄹ","ㅁ","ㅂ","ㅃ","ㅅ","ㅆ","ㅇ","ㅈ","ㅉ","ㅊ","ㅋ","ㅌ","ㅍ","ㅎ"];
function chosung(s) { let r = ""; for (const ch of s) { const c = ch.charCodeAt(0); if (c >= 0xAC00 && c <= 0xD7A3) r += CHO[Math.floor((c - 0xAC00) / 588)]; else r += ch; } return r; }
function suggest(q) {
  const query = q.trim(); if (!query) return [];
  const qc = chosung(query);
  const m = DICT.filter((d) => d.name.includes(query) || chosung(d.name).includes(qc));
  m.sort((a, b) => { const ap = a.name.startsWith(query) || chosung(a.name).startsWith(qc) ? 0 : 1; const bp = b.name.startsWith(query) || chosung(b.name).startsWith(qc) ? 0 : 1; return ap - bp || a.name.length - b.name.length; });
  return m.slice(0, 6);
}

const ytLink = (q) => "https://www.youtube.com/results?search_query=" + encodeURIComponent(q + " 레시피");
const igLink = (q) => "https://www.instagram.com/explore/tags/" + encodeURIComponent(q.replace(/\s/g, "")) + "/";
const recipeLink = (q) => "https://www.10000recipe.com/recipe/list.html?q=" + encodeURIComponent(q);

const STORE_EMOJI = { "Woolworths":"🟢","Coles":"🔴","ALDI":"🔵","Costco":"🟠","IGA":"🟡","한인마트":"🇰🇷" };
const storeEmoji = (s) => STORE_EMOJI[s] || "🏪";
const money = (n) => "$" + (Math.round(n * 100) / 100).toFixed(2);
const STORES = ["Woolworths", "Coles", "ALDI", "Costco", "IGA", "한인마트"];

const LOCATIONS = {
  fridge:  { label:"냉장", emoji:"❄️", chip:"bg-sky-100 text-sky-600",      active:"bg-sky-400 text-white" },
  freezer: { label:"냉동", emoji:"🧊", chip:"bg-indigo-100 text-indigo-600", active:"bg-indigo-400 text-white" },
  pantry:  { label:"실온", emoji:"📦", chip:"bg-amber-100 text-amber-600",   active:"bg-amber-400 text-white" },
};
const LOC_KEYS = ["fridge", "pantry", "freezer"];
const CATEGORIES = ["채소","과일","육류","해산물","유제품","면/곡물","양념","음료","기타"];
const LEVELS = [10, 25, 50, 75, 100];
const LEVEL_META = {
  100:{ label:"가득", dot:"🟢", bar:"bg-emerald-400", text:"text-emerald-600" },
  75: { label:"넉넉", dot:"🟢", bar:"bg-emerald-400", text:"text-emerald-600" },
  50: { label:"절반", dot:"🟡", bar:"bg-amber-400",   text:"text-amber-600" },
  25: { label:"조금", dot:"🟠", bar:"bg-orange-400",  text:"text-orange-600" },
  10: { label:"거의 없음", dot:"🔴", bar:"bg-rose-400", text:"text-rose-600" },
};
const WD = ["일","월","화","수","목","금","토"];
const TABS = [
  { k:"fridge", e:"🧊", l:"냉장고", on:"bg-sky-400 text-white shadow-sky-200",       off:"bg-sky-50 text-sky-500" },
  { k:"shop",   e:"🛒", l:"장보기", on:"bg-emerald-400 text-white shadow-emerald-200", off:"bg-emerald-50 text-emerald-500" },
  { k:"price",  e:"💰", l:"가격",   on:"bg-amber-400 text-white shadow-amber-200",     off:"bg-amber-50 text-amber-600" },
];
function isoAfter(days) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+days); return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"); }
function daysLeft(d) { if (!d) return null; const t = new Date(); t.setHours(0,0,0,0); return Math.round((new Date(d+"T00:00:00")-t)/86400000); }
function expiryBadge(d) {
  const n = daysLeft(d); if (n === null) return null;
  if (n < 0) return { txt: -n+"일 지남", cls:"bg-rose-100 text-rose-600" };
  if (n === 0) return { txt:"오늘까지", cls:"bg-rose-100 text-rose-600" };
  if (n <= 3) return { txt:"D-"+n+" 임박", cls:"bg-orange-100 text-orange-600" };
  return { txt:"D-"+n, cls:"bg-emerald-100 text-emerald-600" };
}
function genCode() { const a = ["MARU","WOOGI","NABI","TORI","BOM","DAL","HAE","BYUL","GOMI","KKOM"]; return a[Math.floor(Math.random()*a.length)]+"-"+Math.floor(1000+Math.random()*9000); }

export default function App() {
  const [screen, setScreen] = useState("boot");
  const [tab, setTab] = useState("fridge");
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [items, setItems] = useState([]);
  const [shopping, setShopping] = useState([]);
  const [cookCounts, setCookCounts] = useState({});
  const [prices, setPrices] = useState([]);
  const lastSeen = useRef(0);
  const writeTimer = useRef(null);

  const [onboardMode, setOnboardMode] = useState("home");
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState("");
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [filter, setFilter] = useState("all");
  const [glance, setGlance] = useState(true);
  const [shopInput, setShopInput] = useState("");
  const [showPrice, setShowPrice] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const [cuisine, setCuisine] = useState("다양하게");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");
  const [recipes, setRecipes] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem("my-fridge");
        if (!raw) { setScreen("onboard"); return; }
        const me = JSON.parse(raw);
        setName(me.name); setCode(me.code);
        const d = await dbLoad(me.code);
        if (d) { setItems(d.items||[]); setShopping(d.shopping||[]); setCookCounts(d.cookCounts||{}); setPrices(d.prices||[]); lastSeen.current = d.lastUpdated||0; }
        setScreen("main");
      } catch { setScreen("onboard"); }
    })();
  }, []);

  useEffect(() => {
    if (screen !== "main" || !code) return;
    const unsub = dbSubscribe(code, (d) => {
      if (d && d.lastUpdated && d.lastUpdated > lastSeen.current) {
        setItems(d.items||[]); setShopping(d.shopping||[]); setCookCounts(d.cookCounts||{}); setPrices(d.prices||[]); lastSeen.current = d.lastUpdated;
      }
    });
    return unsub;
  }, [screen, code]);

  const saveData = (newItems = items, newShop = shopping, newCounts = cookCounts, newPrices = prices) => {
    const ts = Date.now(); lastSeen.current = ts;
    setItems(newItems); setShopping(newShop); setCookCounts(newCounts); setPrices(newPrices); setSyncing(true);
    if (writeTimer.current) clearTimeout(writeTimer.current);
    writeTimer.current = setTimeout(async () => {
      await dbSave(code, { items:newItems, shopping:newShop, cookCounts:newCounts, prices:newPrices, lastUpdated: ts });
      setSyncing(false);
    }, 450);
  };

  const createFridge = async () => {
    const c = genCode();
    const initial = { items:[], shopping:[], cookCounts:{}, prices:[], lastUpdated: Date.now() };
    await dbInsert(c, initial);
    localStorage.setItem("my-fridge", JSON.stringify({ code:c, name: name.trim()||"나" }));
    setCode(c); setItems([]); setShopping([]); setCookCounts({}); setPrices([]); lastSeen.current = initial.lastUpdated; setScreen("main");
  };
  const joinFridge = async () => {
    const c = joinCode.trim().toUpperCase(); if (!c) return;
    const d = await dbLoad(c);
    if (!d) { setJoinError("그런 냉장고를 찾을 수 없어요 🥲 코드를 다시 확인해주세요."); return; }
    localStorage.setItem("my-fridge", JSON.stringify({ code:c, name: name.trim()||"나" }));
    setCode(c); setItems(d.items||[]); setShopping(d.shopping||[]); setCookCounts(d.cookCounts||{}); setPrices(d.prices||[]); lastSeen.current = d.lastUpdated||0; setScreen("main");
  };
  const leave = () => { localStorage.removeItem("my-fridge"); setItems([]); setShopping([]); setCookCounts({}); setPrices([]); setCode(""); setRecipes(null); setOnboardMode("home"); setTab("fridge"); setConfirmLeave(false); setScreen("onboard"); };

  const handleSave = (data) => {
    if (editing) saveData(items.map((x) => (x.id === editing.id ? { ...x, ...data } : x)), shopping);
    else saveData([{ ...data, id: Date.now()+""+Math.random(), addedBy: name }, ...items], shopping);
    setShowAdd(false); setEditing(null);
  };
  const removeItem = (id) => saveData(items.filter((x) => x.id !== id), shopping);
  const changeQty = (id, delta) => saveData(items.map((x) => (x.id === id ? { ...x, qty: Math.max(1, Math.round(x.qty+delta)) } : x)), shopping);
  const stepLevel = (id, dir) => saveData(items.map((x) => { if (x.id !== id) return x; const i = LEVELS.indexOf(x.level); return { ...x, level: LEVELS[Math.min(LEVELS.length-1, Math.max(0, i+dir))] }; }), shopping);
  const markCooked = (dish) => saveData(items, shopping, { ...cookCounts, [dish]: (cookCounts[dish]||0)+1 });
  const addToShop = (text) => saveData(items, [{ id: Date.now()+""+Math.random(), text, done:false, addedBy:name }, ...shopping]);
  const addPrice = (rec) => saveData(items, shopping, cookCounts, [...prices, { id: Date.now()+""+Math.random(), addedBy:name, ...rec }]);
  const delPrice = (id) => saveData(items, shopping, cookCounts, prices.filter((p) => p.id !== id));

  const addShop = () => { const t = shopInput.trim(); if (!t) return; addToShop(t); setShopInput(""); };
  const toggleShop = (id) => saveData(items, shopping.map((x) => (x.id === id ? { ...x, done: !x.done } : x)));
  const delShop = (id) => saveData(items, shopping.filter((x) => x.id !== id));
  const clearDone = () => saveData(items, shopping.filter((x) => !x.done));
  const shopToFridge = (s) => {
    const e = DICT.find((d) => d.name === s.text.trim());
    const cat = e?.cat || "기타", loc = e?.loc || "fridge";
    const exp = e && (e.cat === "채소" || e.cat === "과일") && e.shelf ? isoAfter(e.shelf) : isoAfter(0);
    const ni = { id: Date.now()+""+Math.random(), name: s.text.trim(), mode:"count", qty:1, unit:"", level:100, location:loc, category:cat, expiry:exp, expiryAuto:false, addedBy:name };
    saveData([ni, ...items], shopping.filter((x) => x.id !== s.id));
  };

  const copyCode = () => { navigator.clipboard?.writeText(code).catch(() => {}); setCopied(true); setTimeout(() => setCopied(false), 1500); };

  const recommend = async () => {
    setAiLoading(true); setAiError(""); setRecipes(null);
    const inv = items.map((it) => { const dl = daysLeft(it.expiry); const amt = it.mode === "bulk" ? LEVEL_META[it.level].label : it.qty+(it.unit||"개"); return "- "+it.name+" "+amt+" ("+LOCATIONS[it.location].label+(dl!=null?(", 유통기한 "+dl+"일 남음"):"")+")"; }).join("\n");
    const topCooked = Object.entries(cookCounts).sort((a, b) => b[1]-a[1]).slice(0, 8).map(([n, c]) => n+"("+c+"번)").join(", ");
    try {
      const res = await fetch("/api/recommend", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify({ inventory: inv, cuisine, topCooked }) });
      if (!res.ok) throw new Error("bad");
      setRecipes(await res.json());
    } catch (e) { console.error(e); setAiError("추천을 불러오지 못했어요 🥲 잠시 후 다시 시도해주세요."); }
    setAiLoading(false);
  };

  if (screen === "boot") return <div className="min-h-screen flex items-center justify-center bg-rose-50"><Loader2 className="animate-spin text-rose-300" size={32} /></div>;

  if (screen === "onboard")
    return (
      <div className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-sky-50 flex items-center justify-center p-5">
        <div className="w-full max-w-sm bg-white rounded-[2rem] shadow-xl shadow-rose-100 p-7 text-center">
          <div className="text-6xl mb-2">🧊</div>
          <h1 className="text-2xl font-extrabold text-gray-800">우리집 냉장고</h1>
          <p className="text-sm text-gray-400 mt-1 mb-6">둘이 같이 보는 실시간 재고장 ✨</p>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="내 별명 (예: 우기)" className="w-full text-center bg-rose-50 rounded-2xl py-3 px-4 mb-4 outline-none focus:ring-2 focus:ring-rose-200 text-gray-700" />
          {onboardMode === "home" ? (
            <div className="space-y-3">
              <button onClick={createFridge} className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-200 transition active:scale-95">🆕 새 냉장고 만들기</button>
              <button onClick={() => { setOnboardMode("join"); setJoinError(""); }} className="w-full bg-sky-100 hover:bg-sky-200 text-sky-600 font-bold py-3.5 rounded-2xl transition active:scale-95">🔗 코드로 함께하기</button>
            </div>
          ) : (
            <div className="space-y-3">
              <input value={joinCode} onChange={(e) => { setJoinCode(e.target.value.toUpperCase()); setJoinError(""); }} placeholder="냉장고 코드 (예: WOOGI-4821)" className="w-full text-center tracking-widest font-mono bg-sky-50 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-sky-200 text-gray-700" />
              {joinError && <p className="text-xs text-rose-400">{joinError}</p>}
              <button onClick={joinFridge} className="w-full bg-sky-400 hover:bg-sky-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-sky-200 transition active:scale-95">들어가기</button>
              <button onClick={() => setOnboardMode("home")} className="text-xs text-gray-400 hover:text-gray-600">← 돌아가기</button>
            </div>
          )}
        </div>
      </div>
    );

  const shown = items.filter((it) => filter === "all" || it.location === filter).sort((a, b) => { const lo = LOC_KEYS.indexOf(a.location)-LOC_KEYS.indexOf(b.location); if (lo !== 0) return lo; const da = daysLeft(a.expiry), db = daysLeft(b.expiry); if (da === null) return 1; if (db === null) return -1; return da-db; });
  const sortedShop = [...shopping].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));
  const sortedNow = recipes?.canMakeNow ? [...recipes.canMakeNow].sort((a, b) => (cookCounts[b.name]||0)-(cookCounts[a.name]||0)) : [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50 via-amber-50 to-sky-50 pb-28">
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-rose-100 px-4 py-3">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧊</span>
            <div className="leading-tight">
              <h1 className="font-extrabold text-gray-800">우리집 냉장고</h1>
              <button onClick={copyCode} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-rose-400"><span className="font-mono tracking-wider">{code}</span>{copied ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}</button>
            </div>
          </div>
          <div className="flex items-center gap-2">{syncing && <RefreshCw size={14} className="text-sky-400 animate-spin" />}<button onClick={() => setConfirmLeave(true)} className="text-gray-300 hover:text-rose-400 p-1"><LogOut size={18} /></button></div>
        </div>
        <div className="max-w-md mx-auto grid grid-cols-3 gap-1.5 mt-3">
          {TABS.map((t) => (
            <button key={t.k} onClick={() => setTab(t.k)} className={"relative py-2 rounded-xl text-[12px] font-bold transition flex items-center justify-center gap-1 " + (tab === t.k ? (t.on + " shadow-md") : t.off)}>
              <span>{t.e}</span><span>{t.l}</span>
              {t.k === "shop" && shopping.filter((s) => !s.done).length > 0 && <span className="absolute -top-1 right-0 bg-rose-400 text-white text-[9px] font-extrabold rounded-full px-1 border border-white">{shopping.filter((s) => !s.done).length}</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-md mx-auto px-4">
        {tab === "fridge" && (
          <>
            <GlancePanel items={items} glance={glance} setGlance={setGlance} onPick={setEditing} />
            <div className="flex gap-2 mt-4 mb-3 overflow-x-auto">
              <FilterChip active={filter === "all"} onClick={() => setFilter("all")} label={"전체 "+items.length} />
              {LOC_KEYS.map((k) => <FilterChip key={k} active={filter === k} onClick={() => setFilter(k)} label={LOCATIONS[k].emoji+" "+LOCATIONS[k].label} />)}
            </div>
            {shown.length === 0 ? (
              <div className="text-center py-16"><div className="text-5xl mb-3">🍽️</div><p className="text-gray-400 text-sm">아직 재료가 없어요.<br />아래 버튼으로 채워볼까요?</p></div>
            ) : (
              <div className="space-y-2">
                {shown.map((it) => {
                  const b = expiryBadge(it.expiry);
                  return (
                    <div key={it.id} className="bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3">
                      <button onClick={() => setEditing(it)} className="flex items-center gap-3 flex-1 min-w-0 text-left">
                        <div className="text-2xl w-9 text-center">{pickEmoji(it.name, it.category)}</div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap"><span className="font-bold text-gray-800 truncate">{it.name}</span>{b && <span className={"text-[10px] font-semibold px-1.5 py-0.5 rounded-full "+b.cls}>{b.txt}</span>}</div>
                          <div className="flex items-center gap-1.5 mt-0.5"><span className={"text-[10px] px-1.5 py-0.5 rounded-full "+LOCATIONS[it.location].chip}>{LOCATIONS[it.location].emoji} {LOCATIONS[it.location].label}</span>{it.addedBy && <span className="text-[10px] text-gray-300">· {it.addedBy}</span>}<Pencil size={9} className="text-gray-200" /></div>
                        </div>
                      </button>
                      {it.mode === "bulk" ? (
                        <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1">
                          <button onClick={() => stepLevel(it.id, -1)} className="w-6 h-6 rounded-full bg-white shadow-sm text-gray-500 flex items-center justify-center active:scale-90"><Minus size={13} /></button>
                          <div className="w-14 text-center"><div className={"text-[10px] font-bold "+LEVEL_META[it.level].text}>{LEVEL_META[it.level].dot} {LEVEL_META[it.level].label}</div><div className="h-1.5 bg-gray-200 rounded-full mt-0.5 overflow-hidden"><div className={LEVEL_META[it.level].bar+" h-full rounded-full"} style={{ width: it.level+"%" }} /></div></div>
                          <button onClick={() => stepLevel(it.id, 1)} className="w-6 h-6 rounded-full bg-white shadow-sm text-gray-500 flex items-center justify-center active:scale-90"><Plus size={13} /></button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 bg-gray-50 rounded-full p-1">
                          <button onClick={() => changeQty(it.id, -1)} className="w-6 h-6 rounded-full bg-white shadow-sm text-gray-500 flex items-center justify-center active:scale-90"><Minus size={13} /></button>
                          <span className="text-xs font-bold text-gray-700 min-w-[2.5rem] text-center px-1">{it.qty}{it.unit || "개"}</span>
                          <button onClick={() => changeQty(it.id, 1)} className="w-6 h-6 rounded-full bg-white shadow-sm text-gray-500 flex items-center justify-center active:scale-90"><Plus size={13} /></button>
                        </div>
                      )}
                      <button onClick={() => removeItem(it.id)} className="text-gray-200 hover:text-rose-400 p-1"><Trash2 size={16} /></button>
                    </div>
                  );
                })}
              </div>
            )}
            <div className="mt-6 bg-white rounded-[1.75rem] shadow-sm p-5">
              <div className="flex items-center gap-2 mb-3"><ChefHat className="text-rose-400" size={20} /><h2 className="font-extrabold text-gray-800">오늘 뭐 먹지?</h2></div>
              <div className="flex gap-1.5 mb-3">{["한식","양식","다양하게"].map((c) => <button key={c} onClick={() => setCuisine(c)} className={"text-xs font-semibold px-3 py-1.5 rounded-full transition "+(cuisine === c ? "bg-rose-400 text-white" : "bg-rose-50 text-rose-400")}>{c}</button>)}</div>
              <button onClick={recommend} disabled={aiLoading} className="w-full bg-gradient-to-r from-rose-400 to-orange-400 text-white font-bold py-3 rounded-2xl shadow-lg shadow-rose-200 transition active:scale-95 flex items-center justify-center gap-2 disabled:opacity-60">{aiLoading ? <><Loader2 size={18} className="animate-spin" /> 냉장고 뒤지는 중...</> : <><Sparkles size={18} /> 요리 추천받기</>}</button>
              {aiError && <p className="text-xs text-rose-400 mt-3 text-center">{aiError}</p>}
              {recipes && (
                <div className="mt-5 space-y-5">
                  {sortedNow.length > 0 && (
                    <Section icon={<PartyPopper size={15} className="text-emerald-500" />} title="지금 바로 만들 수 있어요!">
                      {sortedNow.map((r, i) => (
                        <div key={i} className="bg-emerald-50 rounded-2xl p-3.5">
                          <div className="flex items-center gap-2 font-bold text-gray-800 flex-wrap"><span className="text-xl">{r.emoji}</span>{r.name}{cookCounts[r.name] > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-500 flex items-center gap-0.5"><Flame size={10} /> {cookCounts[r.name]}번</span>}</div>
                          <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
                          <div className="flex flex-wrap gap-1 mt-2">{r.uses?.map((u, j) => <span key={j} className={"text-[10px] px-2 py-0.5 rounded-full "+(r.usesExpiring?.includes(u) ? "bg-orange-100 text-orange-600 font-semibold" : "bg-white text-gray-500")}>{r.usesExpiring?.includes(u) ? "⏰ " : ""}{u}</span>)}</div>
                          <div className="flex items-end justify-between gap-2 mt-2.5">
                            <RecipeLinks name={r.name} />
                            <button onClick={() => markCooked(r.name)} className="shrink-0 text-[10px] font-bold px-2.5 py-1.5 rounded-full bg-emerald-400 text-white hover:bg-emerald-500 flex items-center gap-1 active:scale-95"><Check size={11} /> 해먹음</button>
                          </div>
                        </div>
                      ))}
                    </Section>
                  )}
                  {recipes.almostThere?.length > 0 && (
                    <Section icon={<ShoppingCart size={15} className="text-sky-500" />} title="조금만 더 사면!">
                      {recipes.almostThere.map((r, i) => (
                        <div key={i} className="bg-sky-50 rounded-2xl p-3.5">
                          <div className="flex items-center gap-2 font-bold text-gray-800"><span className="text-xl">{r.emoji}</span>{r.name}</div>
                          <p className="text-xs text-gray-500 mt-1">{r.desc}</p>
                          <div className="flex flex-wrap gap-1 mt-2 items-center"><span className="text-[10px] text-sky-500 font-semibold">사야 할 것:</span>{r.missing?.map((m, j) => <button key={j} onClick={() => addToShop(m)} className="text-[10px] px-2 py-0.5 rounded-full bg-white text-sky-600 font-semibold hover:bg-sky-100">🛒 {m} +</button>)}</div>
                          <RecipeLinks name={r.name} />
                        </div>
                      ))}
                    </Section>
                  )}
                  {recipes.newIdeas?.length > 0 && (
                    <Section icon={<Lightbulb size={15} className="text-amber-500" />} title="새로운 도전 어때요?">
                      {recipes.newIdeas.map((r, i) => (
                        <div key={i} className="bg-amber-50 rounded-2xl p-3.5">
                          <div className="flex items-center gap-2 font-bold text-gray-800"><span className="text-xl">{r.emoji}</span>{r.ingredient} 사보기</div>
                          <p className="text-xs text-gray-500 mt-1">→ <b className="text-amber-600">{r.recipe}</b> · {r.desc}</p>
                          {r.combinesWith?.length > 0 && <p className="text-[10px] text-gray-400 mt-1.5">가진 재료랑 조합: {r.combinesWith.join(", ")}</p>}
                          <div className="flex items-center gap-1.5 mt-2"><button onClick={() => addToShop(r.ingredient)} className="text-[10px] font-bold px-2 py-1 rounded-full bg-white text-amber-600 hover:bg-amber-100">🛒 {r.ingredient} 담기</button><RecipeLinks name={r.recipe} /></div>
                        </div>
                      ))}
                    </Section>
                  )}
                </div>
              )}
            </div>
          </>
        )}

        {tab === "shop" && (
          <div className="mt-4">
            <div className="flex gap-2 mb-4">
              <input value={shopInput} onChange={(e) => setShopInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addShop()} placeholder="살 거 적기 (예: 계란 한 판)" className="flex-1 bg-white rounded-2xl py-3 px-4 shadow-sm outline-none focus:ring-2 focus:ring-emerald-200 text-gray-700" />
              <button onClick={addShop} className="bg-emerald-400 hover:bg-emerald-500 text-white font-bold px-4 rounded-2xl shadow-lg shadow-emerald-200 active:scale-95"><Plus size={20} /></button>
            </div>
            {sortedShop.length === 0 ? (
              <div className="text-center py-16"><div className="text-5xl mb-3">📝</div><p className="text-gray-400 text-sm">장보기 리스트가 비었어요.<br />필요한 걸 적어볼까요?</p></div>
            ) : (
              <div className="space-y-2">
                {sortedShop.map((s) => (
                  <div key={s.id} className={"bg-white rounded-2xl p-3 shadow-sm flex items-center gap-3 transition "+(s.done ? "opacity-50" : "")}>
                    <button onClick={() => toggleShop(s.id)} className="shrink-0">{s.done ? <div className="w-6 h-6 rounded-full bg-emerald-400 flex items-center justify-center"><Check size={15} className="text-white" /></div> : <Circle size={24} className="text-gray-300" />}</button>
                    <span className={"flex-1 font-semibold text-gray-700 "+(s.done ? "line-through text-gray-400" : "")}>{s.text}</span>
                    {!s.done && <button onClick={() => shopToFridge(s)} className="text-[11px] font-bold text-sky-500 bg-sky-50 hover:bg-sky-100 rounded-full px-2.5 py-1 flex items-center gap-1"><Snowflake size={11} /> 냉장고로</button>}
                    <button onClick={() => delShop(s.id)} className="text-gray-200 hover:text-rose-400 p-1"><Trash2 size={16} /></button>
                  </div>
                ))}
                {shopping.some((s) => s.done) && <button onClick={clearDone} className="w-full text-xs text-gray-400 hover:text-rose-400 py-2">✓ 완료한 항목 비우기</button>}
              </div>
            )}
          </div>
        )}

        {tab === "price" && <PriceTab prices={prices} onDel={delPrice} onAddClick={() => setShowPrice(true)} />}
      </div>

      {tab === "fridge" && <button onClick={() => setShowAdd(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-rose-400 hover:bg-rose-500 text-white font-bold pl-5 pr-6 py-3.5 rounded-full shadow-xl shadow-rose-300 flex items-center gap-2 transition active:scale-95 z-30"><Plus size={20} /> 재료 추가</button>}
      {tab === "price" && <button onClick={() => setShowPrice(true)} className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-amber-400 hover:bg-amber-500 text-white font-bold pl-5 pr-6 py-3.5 rounded-full shadow-xl shadow-amber-300 flex items-center gap-2 transition active:scale-95 z-30"><Plus size={20} /> 가격 기록</button>}
      {(showAdd || editing) && <ItemModal initial={editing} onClose={() => { setShowAdd(false); setEditing(null); }} onSave={handleSave} />}
      {showPrice && <PriceModal onClose={() => setShowPrice(false)} onSave={(rec) => { addPrice(rec); setShowPrice(false); }} />}
      {confirmLeave && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setConfirmLeave(false)}>
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-xs bg-white rounded-[2rem] p-6 shadow-2xl text-center">
            <div className="text-4xl mb-2">🚪</div>
            <h3 className="font-extrabold text-gray-800 mb-1">이 냉장고에서 나갈까요?</h3>
            <p className="text-xs text-gray-500">다시 들어오려면 아래 코드가 필요해요.</p>
            <div className="bg-rose-50 rounded-xl py-2.5 my-3"><span className="font-mono font-bold tracking-widest text-rose-500">{code}</span></div>
            <p className="text-[11px] text-gray-400 mb-4">📌 코드를 메모해두면 안전해요!</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmLeave(false)} className="flex-1 bg-gray-100 text-gray-600 font-bold py-3 rounded-2xl active:scale-95">취소</button>
              <button onClick={leave} className="flex-1 bg-rose-400 hover:bg-rose-500 text-white font-bold py-3 rounded-2xl active:scale-95">나가기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function RecipeLinks({ name }) {
  const L = "text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 transition";
  return (
    <div className="flex flex-wrap gap-1.5">
      <a href={ytLink(name)} target="_blank" rel="noreferrer" className={L+" bg-red-50 text-red-500 hover:bg-red-100"}>▶️ 유튜브</a>
      <a href={igLink(name)} target="_blank" rel="noreferrer" className={L+" bg-pink-50 text-pink-500 hover:bg-pink-100"}>📷 인스타</a>
      <a href={recipeLink(name)} target="_blank" rel="noreferrer" className={L+" bg-gray-100 text-gray-600 hover:bg-gray-200"}>🌐 레시피</a>
    </div>
  );
}
function FilterChip({ active, onClick, label }) { return <button onClick={onClick} className={"text-xs font-bold px-3.5 py-2 rounded-full transition whitespace-nowrap "+(active ? "bg-gray-800 text-white shadow-md" : "bg-white text-gray-400 shadow-sm")}>{label}</button>; }
function Section({ icon, title, children }) { return <div><div className="flex items-center gap-1.5 mb-2 font-bold text-sm text-gray-700">{icon}{title}</div><div className="space-y-2">{children}</div></div>; }

function PriceTab({ prices, onDel, onAddClick }) {
  const groups = useMemo(() => {
    const map = {};
    prices.forEach((p) => { (map[p.name] ||= []).push(p); });
    return Object.entries(map).map(([nm, recs]) => {
      const byStore = {};
      recs.forEach((r) => { const cur = byStore[r.store]; if (!cur || r.date > cur.date) byStore[r.store] = r; });
      const storeRows = Object.values(byStore).map((r) => ({ ...r, per: r.price / r.qty })).sort((a, b) => a.per - b.per);
      const sortedRecs = [...recs].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id));
      return { name: nm, recs, storeRows, cheapest: storeRows[0], sortedRecs };
    }).sort((a, b) => b.recs.length - a.recs.length);
  }, [prices]);

  return (
    <div className="mt-4">
      <div className="bg-amber-50 border border-amber-100 rounded-2xl p-3 mb-4">
        <p className="text-xs text-amber-700 leading-relaxed">💡 장 볼 때마다 <b>마트 · 개수 · 가격</b>을 기록하면, 개당 가격을 계산해서 <b>어디가 제일 싼지</b> 알려드려요.</p>
      </div>
      {groups.length === 0 ? (
        <div className="text-center py-16"><div className="text-5xl mb-3">🧾</div><p className="text-gray-400 text-sm">아직 가격 기록이 없어요.<br />아래 "가격 기록" 버튼으로 시작해요!</p></div>
      ) : (
        <div className="space-y-3">{groups.map((g) => <PriceCard key={g.name} g={g} onDel={onDel} />)}</div>
      )}
    </div>
  );
}
function PriceCard({ g, onDel }) {
  const [open, setOpen] = useState(false);
  const multi = g.storeRows.length > 1;
  const cheap = g.cheapest;
  const units = g.sortedRecs.map((r) => r.price / r.qty);
  const maxU = Math.max(...units), minU = Math.min(...units);
  return (
    <div className="bg-white rounded-[1.5rem] shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2"><span className="text-3xl">{pickEmoji(g.name, null)}</span><div><div className="font-extrabold text-gray-800">{g.name}</div><div className="text-[11px] text-gray-400">기록 {g.recs.length}개 · 마트 {g.storeRows.length}곳</div></div></div>
        <button onClick={() => setOpen(!open)} className="text-gray-300 hover:text-gray-500">{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
      </div>
      {multi ? (
        <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-2xl p-3 flex items-center gap-2 mb-3">
          <TrendingDown size={20} className="shrink-0" />
          <span className="text-sm font-bold">{storeEmoji(cheap.store)} {cheap.store}가 제일 저렴! {cheap.unit || "개"}당 {money(cheap.per)}</span>
        </div>
      ) : (
        <p className="text-[11px] text-gray-400 mb-3 bg-gray-50 rounded-xl p-2 text-center">다른 마트에서도 사보면 어디가 더 싼지 비교해드려요 🛒</p>
      )}
      <div className="space-y-1.5">
        {g.storeRows.map((r) => {
          const best = multi && r.store === cheap.store;
          return (
            <div key={r.store} className={"flex items-center justify-between rounded-2xl p-3 "+(best ? "bg-emerald-50 ring-2 ring-emerald-200" : "bg-gray-50")}>
              <div><div className={"font-bold text-sm "+(best ? "text-emerald-700" : "text-gray-700")}>{storeEmoji(r.store)} {r.store}</div><div className="text-[11px] text-gray-400">{r.qty}{r.unit || "개"} · {money(r.price)} · {r.date.slice(5).replace("-", "/")}</div></div>
              <div className="text-right"><div className={"font-extrabold "+(best ? "text-emerald-600" : "text-gray-500")}>{money(r.per)}</div><div className="text-[10px] text-gray-400">{r.unit || "개"}당</div></div>
            </div>
          );
        })}
      </div>
      {g.sortedRecs.length > 1 && (
        <div className="mt-4">
          <div className="text-[11px] font-bold text-gray-400 mb-2">개당 가격 추이</div>
          <div className="flex items-end gap-2 h-24 overflow-x-auto pb-1">
            {g.sortedRecs.map((r) => {
              const u = r.price / r.qty;
              return (
                <div key={r.id} className="flex flex-col items-center justify-end h-full min-w-[42px]">
                  <div className="text-[9px] font-bold text-gray-500 mb-1">{money(u)}</div>
                  <div className={"w-7 rounded-t-lg "+(u === minU ? "bg-emerald-400" : u === maxU ? "bg-rose-300" : "bg-amber-300")} style={{ height: maxU > 0 ? (Math.max(8, (u/maxU)*100)+"%") : "10%" }} />
                  <div className="text-[9px] text-gray-400 mt-1">{r.date.slice(5).replace("-", "/")}</div>
                  <div className="text-[10px]">{storeEmoji(r.store)}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      {open && (
        <div className="mt-4 border-t border-gray-100 pt-3 space-y-1.5">
          <div className="text-[11px] font-bold text-gray-400 mb-1">전체 기록</div>
          {[...g.recs].sort((a, b) => b.date.localeCompare(a.date)).map((r) => (
            <div key={r.id} className="flex items-center justify-between text-xs bg-gray-50 rounded-xl px-3 py-2">
              <span className="text-gray-600">{storeEmoji(r.store)} {r.store} · {r.qty}{r.unit || "개"} · {money(r.price)}</span>
              <span className="flex items-center gap-2 text-gray-400">{r.date.slice(5).replace("-", "/")}<button onClick={() => onDel(r.id)} className="text-gray-300 hover:text-rose-400"><Trash2 size={13} /></button></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
function PriceModal({ onClose, onSave }) {
  const [name, setName] = useState("");
  const [showSug, setShowSug] = useState(false);
  const [store, setStore] = useState("");
  const [qty, setQty] = useState("");
  const [unit, setUnit] = useState("개");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState(isoAfter(0));
  const sugs = useMemo(() => suggest(name), [name]);
  const valid = name.trim() && store.trim() && parseFloat(qty) > 0 && parseFloat(price) > 0;
  const perUnit = valid ? parseFloat(price) / parseFloat(qty) : null;
  const submit = () => { if (!valid) return; onSave({ name: name.trim(), store: store.trim(), qty: parseFloat(qty), unit: unit.trim() || "개", price: parseFloat(price), date }); };
  return (
    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold text-gray-800">💰 가격 기록</h2><button onClick={onClose} className="text-gray-300 hover:text-gray-500"><X size={22} /></button></div>
        <p className="text-xs font-semibold text-gray-400 mb-1.5">재료</p>
        <div className="relative mb-3">
          <input autoFocus value={name} onChange={(e) => { setName(e.target.value); setShowSug(true); }} onFocus={() => setShowSug(true)} placeholder="재료 이름 (ㄱㄹ → 계란)" className="w-full bg-amber-50 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-amber-200 text-gray-700" />
          {showSug && sugs.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {sugs.map((s) => (<button key={s.name} onClick={() => { setName(s.name); setShowSug(false); }} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-amber-50 text-left"><span className="text-xl">{pickEmoji(s.name, s.cat)}</span><span className="font-semibold text-gray-700 flex-1">{s.name}</span></button>))}
            </div>
          )}
        </div>
        <p className="text-xs font-semibold text-gray-400 mb-1.5">어디서 샀어요?</p>
        <input value={store} onChange={(e) => setStore(e.target.value)} placeholder="마트 이름" className="w-full bg-gray-50 rounded-2xl py-2.5 px-4 outline-none focus:ring-2 focus:ring-amber-200 text-gray-700 mb-2" />
        <div className="flex flex-wrap gap-1.5 mb-3">{STORES.map((s) => <button key={s} onClick={() => setStore(s)} className={"text-xs font-semibold px-3 py-1.5 rounded-full transition "+(store === s ? "bg-amber-400 text-white" : "bg-amber-50 text-amber-500")}>{storeEmoji(s)} {s}</button>)}</div>
        <p className="text-xs font-semibold text-gray-400 mb-1.5">개수 / 가격</p>
        <div className="flex gap-2 mb-3">
          <input type="number" inputMode="decimal" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="개수" className="w-20 bg-gray-50 rounded-2xl py-2.5 px-3 text-center outline-none focus:ring-2 focus:ring-amber-200 text-gray-700" />
          <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="단위" className="w-20 bg-gray-50 rounded-2xl py-2.5 px-3 text-center outline-none focus:ring-2 focus:ring-amber-200 text-gray-700 text-sm" />
          <div className="flex-1 flex items-center bg-gray-50 rounded-2xl px-3"><span className="text-gray-400 font-bold">$</span><input type="number" inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="총 가격" className="flex-1 bg-transparent py-2.5 px-1 outline-none text-gray-700" /></div>
        </div>
        {perUnit !== null && <div className="bg-emerald-50 rounded-2xl p-3 mb-3 text-center text-sm font-bold text-emerald-600">{unit || "개"}당 {money(perUnit)} 꼴이에요 👍</div>}
        <p className="text-xs font-semibold text-gray-400 mb-1.5">산 날짜</p>
        <div className="flex gap-2 mb-5">
          <button onClick={() => setDate(isoAfter(0))} className={"flex-1 py-2 rounded-2xl text-sm font-bold transition "+(date === isoAfter(0) ? "bg-amber-400 text-white" : "bg-gray-50 text-gray-400")}>오늘</button>
          <button onClick={() => setDate(isoAfter(-1))} className={"flex-1 py-2 rounded-2xl text-sm font-bold transition "+(date === isoAfter(-1) ? "bg-amber-400 text-white" : "bg-gray-50 text-gray-400")}>어제</button>
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="flex-1 bg-gray-50 rounded-2xl py-2 px-3 outline-none text-gray-600 text-sm" />
        </div>
        <button onClick={submit} disabled={!valid} className="w-full bg-amber-400 hover:bg-amber-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-amber-200 transition active:scale-95 disabled:opacity-40">기록하기 ✨</button>
      </div>
    </div>
  );
}

function GlancePanel({ items, glance, setGlance, onPick }) {
  return (
    <div className="bg-gradient-to-b from-sky-50 to-white rounded-[1.75rem] shadow-sm border border-sky-100 p-4 mt-4">
      <button onClick={() => setGlance(!glance)} className="w-full flex items-center justify-between">
        <span className="font-extrabold text-gray-800 flex items-center gap-1.5">🧊 한눈에 보기 <span className="text-[11px] font-semibold text-gray-400">({items.length})</span></span>
        {glance ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
      </button>
      {glance && (
        <div className="mt-3 space-y-3">
          {items.length === 0 ? (
            <p className="text-center text-gray-300 text-sm py-6">텅 비었어요 🌬️</p>
          ) : LOC_KEYS.map((loc) => {
            const list = items.filter((it) => it.location === loc);
            return (
              <div key={loc}>
                <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 mb-1.5">{LOCATIONS[loc].emoji} {LOCATIONS[loc].label} <span className="text-gray-300">· {list.length}</span></div>
                <div className="flex flex-wrap gap-2 bg-white/70 rounded-2xl p-2.5 min-h-[64px] border-b-4 border-sky-100">
                  {list.length === 0 ? <span className="text-[11px] text-gray-300 self-center px-1">비어있어요</span> : list.map((it) => <GlanceTile key={it.id} it={it} onPick={onPick} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
function GlanceTile({ it, onPick }) {
  const n = daysLeft(it.expiry);
  const ring = n !== null && n < 0 ? "ring-2 ring-rose-300" : n !== null && n <= 3 ? "ring-2 ring-orange-300" : "";
  return (
    <button onClick={() => onPick(it)} className="relative w-14 shrink-0">
      <div className={"w-14 h-14 rounded-2xl bg-white shadow-sm flex items-center justify-center text-3xl "+ring}>{pickEmoji(it.name, it.category)}</div>
      {it.mode === "bulk" ? (
        <span className={"absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full border-2 border-white shadow "+LEVEL_META[it.level].bar} />
      ) : it.qty > 1 ? (
        <span className="absolute -top-1 -right-1 bg-rose-400 text-white text-[10px] font-extrabold rounded-full min-w-[18px] h-[18px] px-1 flex items-center justify-center border-2 border-white shadow">{it.qty}</span>
      ) : null}
      <div className="text-[9px] text-center truncate mt-0.5 text-gray-500 leading-tight">{it.name}</div>
    </button>
  );
}

function ItemModal({ initial, onClose, onSave }) {
  const isEdit = !!initial;
  const [name, setName] = useState(initial?.name || "");
  const [mode, setMode] = useState(initial?.mode || "count");
  const [qty, setQty] = useState(initial?.qty ?? 1);
  const [unit, setUnit] = useState(initial?.unit || "");
  const [level, setLevel] = useState(initial?.level ?? 100);
  const [location, setLocation] = useState(initial?.location || "fridge");
  const [category, setCategory] = useState(initial?.category || "채소");
  const [expiry, setExpiry] = useState(initial?.expiry || isoAfter(0));
  const [expiryAuto, setExpiryAuto] = useState(initial?.expiryAuto || false);
  const [showSug, setShowSug] = useState(false);
  const sugs = useMemo(() => suggest(name), [name]);
  const dateOpts = useMemo(() => { const arr = []; for (let i = 0; i < 46; i++) { const d = new Date(); d.setHours(0,0,0,0); d.setDate(d.getDate()+i); arr.push({ iso: d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0"), i, m: d.getMonth()+1, day: d.getDate(), w: WD[d.getDay()] }); } return arr; }, []);
  const applyDict = (entry) => {
    setCategory(entry.cat); setLocation(entry.loc);
    if ((entry.cat === "채소" || entry.cat === "과일") && entry.shelf) { setExpiry(isoAfter(entry.shelf)); setExpiryAuto(true); }
    else { setExpiry(isoAfter(0)); setExpiryAuto(false); }
  };
  const onNameChange = (v) => { setName(v); setShowSug(true); const ex = DICT.find((d) => d.name === v.trim()); if (ex) applyDict(ex); };
  const pickSug = (entry) => { setName(entry.name); applyDict(entry); setShowSug(false); };
  const submit = () => { if (!name.trim()) return; onSave({ name: name.trim(), mode, qty: Math.max(1, parseInt(qty, 10) || 1), unit: unit.trim(), level, location, category, expiry, expiryAuto }); };
  return (
    <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md bg-white rounded-t-[2rem] sm:rounded-[2rem] p-6 shadow-2xl max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-extrabold text-gray-800">{isEdit ? "✏️ 재료 수정" : "🛒 재료 추가"}</h2><button onClick={onClose} className="text-gray-300 hover:text-gray-500"><X size={22} /></button></div>
        <div className="text-center text-5xl mb-2">{pickEmoji(name, category)}</div>
        <div className="relative mb-3">
          <input autoFocus={!isEdit} value={name} onChange={(e) => onNameChange(e.target.value)} onFocus={() => setShowSug(true)} placeholder="재료 이름 (ㅌ → 토마토)" className="w-full bg-rose-50 rounded-2xl py-3 px-4 outline-none focus:ring-2 focus:ring-rose-200 text-gray-700" />
          {showSug && sugs.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
              {sugs.map((s) => (<button key={s.name} onClick={() => pickSug(s)} className="w-full flex items-center gap-2 px-4 py-2.5 hover:bg-rose-50 text-left"><span className="text-xl">{pickEmoji(s.name, s.cat)}</span><span className="font-semibold text-gray-700 flex-1">{s.name}</span><span className="text-[10px] text-gray-400">{CAT_EMOJI[s.cat]} {s.cat} · {LOCATIONS[s.loc].label}</span></button>))}
            </div>
          )}
        </div>
        <div className="flex gap-2 mb-3">
          <button onClick={() => setMode("count")} className={"flex-1 py-2 rounded-2xl text-sm font-bold transition "+(mode === "count" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-400")}>🔢 수량</button>
          <button onClick={() => setMode("bulk")} className={"flex-1 py-2 rounded-2xl text-sm font-bold transition "+(mode === "bulk" ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-400")}>📊 잔량 (벌크)</button>
        </div>
        {mode === "count" ? (
          <div className="flex gap-2 mb-3">
            <div className="flex items-center gap-1 bg-gray-50 rounded-2xl p-1.5 flex-1">
              <button onClick={() => setQty((q) => Math.max(1, (parseInt(q, 10) || 1) - 1))} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-500 shrink-0"><Minus size={15} /></button>
              <input type="number" inputMode="numeric" min="1" step="1" value={qty} onChange={(e) => setQty(e.target.value)} onBlur={() => setQty((q) => Math.max(1, parseInt(q, 10) || 1))} className="flex-1 w-full text-center font-bold text-gray-700 bg-transparent outline-none text-lg" />
              <button onClick={() => setQty((q) => (parseInt(q, 10) || 0) + 1)} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-500 shrink-0"><Plus size={15} /></button>
            </div>
            <input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="단위 (개/모/단)" className="w-28 bg-gray-50 rounded-2xl py-2 px-4 outline-none focus:ring-2 focus:ring-rose-200 text-gray-700 text-sm" />
          </div>
        ) : (
          <div className="flex gap-1.5 mb-3">{[...LEVELS].reverse().map((l) => (<button key={l} onClick={() => setLevel(l)} className={"flex-1 py-2 rounded-xl text-xs font-bold transition "+(level === l ? "bg-gray-800 text-white" : "bg-gray-50 text-gray-400")}>{LEVEL_META[l].dot}<br />{LEVEL_META[l].label}</button>))}</div>
        )}
        <p className="text-xs font-semibold text-gray-400 mb-1.5">보관 위치</p>
        <div className="flex gap-2 mb-3">{LOC_KEYS.map((k) => <button key={k} onClick={() => setLocation(k)} className={"flex-1 py-2.5 rounded-2xl text-sm font-bold transition shadow-sm "+(location === k ? LOCATIONS[k].active : "bg-gray-50 text-gray-400")}>{LOCATIONS[k].emoji} {LOCATIONS[k].label}</button>)}</div>
        <p className="text-xs font-semibold text-gray-400 mb-1.5">분류</p>
        <div className="flex flex-wrap gap-1.5 mb-3">{CATEGORIES.map((c) => <button key={c} onClick={() => setCategory(c)} className={"text-xs font-semibold px-3 py-1.5 rounded-full transition "+(category === c ? "bg-rose-400 text-white" : "bg-rose-50 text-rose-400")}>{CAT_EMOJI[c]} {c}</button>)}</div>
        <div className="flex items-center justify-between mb-1.5">
          <p className="text-xs font-semibold text-gray-400">유통기한 {expiryAuto && <span className="text-emerald-500">· 권장 소비일 자동 ✨</span>}</p>
          <input type="date" value={expiry} onChange={(e) => { setExpiry(e.target.value); setExpiryAuto(false); }} className="text-xs bg-gray-50 rounded-lg py-1 px-2 outline-none text-gray-500" />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-1 -mx-1 px-1">
          {dateOpts.map((d) => (
            <button key={d.iso} onClick={() => { setExpiry(d.iso); setExpiryAuto(false); }} className={"shrink-0 w-14 py-2 rounded-2xl text-center transition "+(expiry === d.iso ? "bg-rose-400 text-white shadow-md shadow-rose-200" : "bg-gray-50 text-gray-500")}>
              <div className="text-[10px] opacity-80">{d.i === 0 ? "오늘" : d.i === 1 ? "내일" : (d.w+"요일")}</div>
              <div className="text-sm font-bold leading-tight">{d.m}/{d.day}</div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-gray-400 mb-4">👆 옆으로 스크롤해서 날짜 선택 · 채소·과일은 권장 소비일이 자동으로 잡혀요</p>
        <button onClick={submit} disabled={!name.trim()} className="w-full bg-rose-400 hover:bg-rose-500 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-rose-200 transition active:scale-95 disabled:opacity-40">{isEdit ? "수정 완료 ✨" : "냉장고에 넣기 ✨"}</button>
      </div>
    </div>
  );
}