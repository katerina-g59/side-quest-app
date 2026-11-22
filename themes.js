// ===== Barevné motivy (Víno, Levandule, Šalvěj, Noc) =====
// Samostatný soubor: používá ho appka (index.html, hned v <head>, aby barvy neproblikly)
// i testovací stránka (tests.html, kontrola čitelnosti). Musí ležet ve stejné složce.
//
// Každý motiv má stejné "role" barev (názvy proměnných zůstaly z původních barev):
//   wine  = hlavní barva (tlačítka, nadpisy)   cream = pozadí
//   brown = text                                pink  = jemné plochy (karta, štítky)
//   field = pole formulářů
//   *Rgb  = stejné barvy jako "R, G, B" pro průhledné stíny a podklady
// Obrázek pro sdílení (Instagram story) má VŽDY vínové barvy značky, motiv ho nemění.

const THEMES = {
  vino: {
    name: "Víno",
    wine: "#772C3A", cream: "#F4E5A7", brown: "#35211F", pink: "#E8C5C3", field: "#FFFAF0",
    shadowRgb: "53, 33, 31", wineRgb: "119, 44, 58", pinkRgb: "232, 197, 195", backdrop: "rgba(53, 33, 31, 0.55)"
  },
  levandule: {
    name: "Levandule",
    wine: "#5B4A8B", cream: "#F3EEF8", brown: "#2A2238", pink: "#DCD3EE", field: "#FCFAFE",
    shadowRgb: "42, 34, 56", wineRgb: "91, 74, 139", pinkRgb: "220, 211, 238", backdrop: "rgba(42, 34, 56, 0.55)"
  },
  salvej: {
    name: "Šalvěj",
    wine: "#44604C", cream: "#EEF2E6", brown: "#23302A", pink: "#CFDCCB", field: "#FBFCF8",
    shadowRgb: "35, 48, 42", wineRgb: "68, 96, 76", pinkRgb: "207, 220, 203", backdrop: "rgba(35, 48, 42, 0.55)"
  },
  noc: {
    // Tmavý motiv: role se prohodí – tmavé pozadí, světlý text, žlutá hlavní barva.
    name: "Noc",
    wine: "#F2C94C", cream: "#1F1A24", brown: "#F1E7DA", pink: "#352B3A", field: "#2A2430",
    shadowRgb: "0, 0, 0", wineRgb: "242, 201, 76", pinkRgb: "53, 43, 58", backdrop: "rgba(0, 0, 0, 0.65)"
  }
};

const THEME_KEY = "sideQuestTheme";
const DEFAULT_THEME = "vino";

// Uložený motiv (neznámý nebo žádný → Víno)
function loadThemeCode() {
  try {
    const code = localStorage.getItem(THEME_KEY);
    return THEMES[code] ? code : DEFAULT_THEME;
  } catch (e) {
    return DEFAULT_THEME;
  }
}

function saveThemeCode(code) {
  try {
    localStorage.setItem(THEME_KEY, code);
  } catch (e) {}
}

// Přepne barvy celé appky (proměnné v :root) a barvu lišty prohlížeče na telefonu
function applyTheme(code) {
  const theme = THEMES[code] || THEMES[DEFAULT_THEME];
  const style = document.documentElement.style;
  style.setProperty("--wine", theme.wine);
  style.setProperty("--cream", theme.cream);
  style.setProperty("--brown", theme.brown);
  style.setProperty("--pink", theme.pink);
  style.setProperty("--field", theme.field);
  style.setProperty("--shadow-rgb", theme.shadowRgb);
  style.setProperty("--wine-rgb", theme.wineRgb);
  style.setProperty("--pink-rgb", theme.pinkRgb);
  style.setProperty("--backdrop", theme.backdrop);
  document.documentElement.dataset.theme = THEMES[code] ? code : DEFAULT_THEME;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", theme.cream);
}

// ----- Čitelnost (kontrast podle WCAG, používá tests.html) -----
// Poměr kontrastu dvou barev "#RRGGBB": 1 (stejné) až 21 (černá na bílé).
// Běžný text potřebuje aspoň 4,5.
function relativeLuminance(hex) {
  const channel = i => {
    const v = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
}

function contrastRatio(a, b) {
  const la = relativeLuminance(a), lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

// Dvojice barev, které appka opravdu používá jako "text na pozadí"
const THEME_PAIRS = [
  ["brown", "cream", "text na pozadí"],
  ["wine", "cream", "hlavní barva (nadpisy, obrysová tlačítka) na pozadí"],
  ["cream", "wine", "text na hlavním tlačítku"],
  ["cream", "brown", "text na tlačítku „Dej mi side quest“"],
  ["brown", "pink", "text na kartě"],
  ["wine", "pink", "hlavní barva na kartě (úroveň, štítky)"],
  ["brown", "field", "text v políčku formuláře"]
];
