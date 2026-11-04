// ===== Seznam všech side questů =====
//
// Jak přidat nový quest:
//   1. Zkopíruj poslední řádek v dané úrovni a vlož ho pod něj.
//   2. Dej mu další volné číslo (např. po "easy-010" přijde "easy-011").
//   3. Přepiš text. Nezapomeň na čárku za předchozím řádkem.
//
// Pravidla pro ID (aby zůstala navždy stejná):
//   - Formát: úroveň + trojmístné číslo, např. "easy-001", "medium-042".
//   - Nový quest vždy dostane další nepoužité číslo.
//   - ID nikdy neměň ani znovu nepoužívej, ani když quest smažeš.
//   - Opravit text (třeba překlep) je v pořádku, ID zůstává.
//
// Tento soubor musí ležet ve stejné složce jako index.html.

const QUESTS = {
  easy: [
    { id: "easy-001", text: "Jdi domů jinou cestou než obvykle." },
    { id: "easy-002", text: "Dej si kávu nebo čaj v kavárně, kde jsi nikdy nebyla." },
    { id: "easy-003", text: "Dej si večer everything shower se skincare." },
    { id: "easy-004", text: "Ozvi se kamarádce, se kterou jsi dlouho nemluvila." },
    { id: "easy-005", text: "Pusť si cestou z práce písničku, kterou jsi milovala v 15 letech." },
    { id: "easy-006", text: "Vynechej kancelářský kávovar a projdi se do kavárny pro oblíbený nápoj." },
    { id: "easy-007", text: "Napiš na papírek tři věci, za které jsi dnes vděčná." },
    { id: "easy-008", text: "Kup si květiny na trhu jen pro sebe." },
    { id: "easy-009", text: "Vyfoť dnes něco hezkého, čeho by si nikdo jiný nevšiml." },
    { id: "easy-010", text: "Kup si nějakou potravinu nebo sladkost, kterou jsi ještě nikdy nezkusila." },
    { id: "easy-011", text: "Dej si oběd venku na lavičce, ne u počítače." },
    { id: "easy-012", text: "Pusť si album, které jsi naposledy poslouchala na střední. A zatancuj si." },
    { id: "easy-013", text: "Lehni si na 10 minut na zem a jen poslouchej hudbu." },
    { id: "easy-014", text: "Vyfoť cestou do práce 5 žlutých věcí." },
    { id: "easy-015", text: "Jdi se podívat na západ slunce." },
    { id: "easy-016", text: "Nauč se říct „děkuju“ v pěti jazycích." },
    { id: "easy-017", text: "Vyhoď nebo daruj 5 věcí, které nepotřebuješ." },
    { id: "easy-018", text: "Smaž z mobilu 20 fotek, které ti jen zabírají místo." },
    { id: "easy-019", text: "Odhlas se z 5 newsletterů, které stejně nikdy nečteš." },
    { id: "easy-020", text: "Pusť si film, který jsi naposledy viděla na střední. (personal favourite: LOL)" }
  ],
  medium: [
    { id: "medium-001", text: "Uvař si večeři podle receptu, který jsi nikdy nezkoušela." },
    { id: "medium-002", text: "Vystup o zastávku dřív a zbytek cesty dojdi pěšky." },
    { id: "medium-003", text: "Zajdi sama do muzea nebo galerie." },
    { id: "medium-004", text: "Nalakuj si nehty na nohách. I v zimě." },
    { id: "medium-005", text: "Pochval kolegyni za konkrétní věc, kterou udělala dobře." },
    { id: "medium-006", text: "Jdi spát před 22:00, bez telefonu v posteli." },
    { id: "medium-007", text: "Zajdi do knihovny a půjč si knihu jen podle obalu." },
    { id: "medium-008", text: "Zkus lekci jógy, tance nebo jiného pohybu, který jsi nikdy nedělala." },
    { id: "medium-009", text: "Napiš dopis sobě za rok a schovej ho." },
    { id: "medium-010", text: "Ukliď jeden šuplík, který tě dlouho štve." },
    { id: "medium-011", text: "Jdi sama do kina." },
    { id: "medium-012", text: "Vylez na rozhlednu ve svém okolí." },
    { id: "medium-013", text: "Projdi si město, kde žiješ, jako turistka, s průvodcem nebo podle průvodce z knihovny." },
    { id: "medium-014", text: "Nauč se za jedno odpoledne něco nového z YouTube, třeba žonglovat nebo háčkovat." },
    { id: "medium-015", text: "Nauč se 10 frází v jazyce země, kam chceš jednou jet." },
    { id: "medium-016", text: "Udělej jednu lekci v Duolingu. Nebo se tam začni rovnou učit nový jazyk." },
    { id: "medium-017", text: "Běž odpoledne do botanické zahrady nebo skleníku." },
    { id: "medium-018", text: "Běž odpoledne do zoo." },
    { id: "medium-019", text: "Vyfoť svoje město tak, aby vypadalo jako cizina." },
    { id: "medium-020", text: "Jdi na bleší trh a kup si jednu věc do stovky." }
  ],
  hard: [
    { id: "hard-001", text: "Řekni dnes „ne“ jedné věci, na kterou bys normálně kývla." },
    { id: "hard-002", text: "Stráv celý víkendový den úplně offline." },
    { id: "hard-003", text: "Vyraz sama na jednodenní výlet do města, kde jsi nebyla." },
    { id: "hard-004", text: "Přihlas se na kurz nebo workshop, který tě láká, ale bojíš se." },
    { id: "hard-005", text: "Odejdi z práce přesně na čas a nic si nevyčítej." },
    { id: "hard-006", text: "Zavolej (ne napiš!) někomu, s kým jsi dlouho nemluvila." },
    { id: "hard-007", text: "Vstaň brzy a podívej se na východ slunce." },
    { id: "hard-008", text: "Zajdi sama na večeři do restaurace, bez telefonu." },
    { id: "hard-009", text: "Napiš si seznam 5 snů a k jednomu udělej první malý krok." },
    { id: "hard-010", text: "Celý den o sobě nemluv negativně, ani v duchu." },
    { id: "hard-011", text: "Najdi si dobrovolnický projekt, kterého se zúčastníš." },
    { id: "hard-012", text: "Uspořádej swap oblečení s kamarádkami." },
    { id: "hard-013", text: "Vyraz na celodenní túru dlouhou aspoň 20 km." },
    { id: "hard-014", text: "Přespi venku ve stanu nebo pod širákem." },
    { id: "hard-015", text: "Vibecoduj si vlastní mini appku, která vyřeší něco, co už tě dlouho štve." },
    { id: "hard-016", text: "Vyber si trending reel, který se ti líbí, a natoč jej sama. Stačí jej dát do close friends." },
    { id: "hard-017", text: "Jdi darovat krev, pokud můžeš." },
    { id: "hard-018", text: "Jeď na jeden den do sousední země." },
    { id: "hard-019", text: "Jdi na akci nebo meetup, kde nikoho neznáš, a dej se do řeči aspoň se třemi lidmi." },
    { id: "hard-020", text: "Přečti celou knihu za jeden víkend." }
  ]
};
