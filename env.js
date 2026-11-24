// ===== Které prostředí (databáze) appka používá =====
// - otevřená ze souboru (dvojklik na index.html) → STAGING (testovací databáze)
// - živá stránka na GitHub Pages → PRODUKCE (skutečné uživatelky)
// - ?env=staging na konci adresy → STAGING i na živé stránce (testování na telefonu)
// - ?env=production → PRODUKCE i ze souboru (když se chceš podívat na skutečná data)
// Při stagingu appka ukáže štítek „🧪 TEST" a ukládá všechno v prohlížeči zvlášť,
// takže se testování nikdy nesmíchá se skutečným deníkem, streakem a profilem.
//
// Oba klíče jsou veřejné (publishable) – smí být vidět. Tajné klíče sem NIKDY nepatří.
// Soubor se načítá jako první (v <head>) a musí ležet ve stejné složce jako index.html.

const SUPABASE_ENVS = {
  production: {
    url: "https://rrcclzjcbupgshdsskgm.supabase.co",
    key: "sb_publishable_H2RVY0ok7YHztB0DcaAeIw_jQpn5DwT"
  },
  staging: {
    url: "https://qhcdckwtcjxwcxzqkkgq.supabase.co",
    key: "sb_publishable_Jn0VAV-oX_P00gOsd4fsTA_R2MJiX7q"
  }
};

function chooseAppEnv() {
  let requested = null;
  try { requested = new URLSearchParams(location.search).get("env"); } catch (e) {}
  if (requested === "staging" || requested === "production") return requested;
  return location.protocol === "file:" ? "staging" : "production";
}

const APP_ENV = chooseAppEnv();
const SUPABASE_URL = SUPABASE_ENVS[APP_ENV].url;
const SUPABASE_KEY = SUPABASE_ENVS[APP_ENV].key;

// Název klíče v paměti prohlížeče (localStorage): na stagingu s předponou "staging:",
// aby testovací data nikdy nepřepsala skutečný postup
function storageKey(name) {
  return APP_ENV === "staging" ? "staging:" + name : name;
}
