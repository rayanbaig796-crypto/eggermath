// Country-specific configuration for region-based SEO
// Each country maps to a language route + country-specific meta

export const countries = {
  "us": {
    code: "us",
    name: "United States",
    lang: "en",
    locale: "en_US",
    currency: "USD",
    flag: "🇺🇸",
    title: "Play GBA Games Online Free — No Download GBA Emulator",
    description: "Play classic Game Boy Advance games in your browser. Pokemon, Zelda, Mario and more. Free, no download required.",
    keywords: "gba emulator, play gba online, gba games free, gameboy advance emulator, pokemon gba, free gba emulator online, gba emulator no download",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "US",
    hreflang: "en-us"
  },
  "uk": {
    code: "uk",
    name: "United Kingdom",
    lang: "en",
    locale: "en_GB",
    currency: "GBP",
    flag: "🇬🇧",
    title: "Play GBA Games Online Free — No Download GBA Emulator",
    description: "Play classic Game Boy Advance games in your browser. Pokemon, Zelda, Mario and more. Free, no download required.",
    keywords: "gba emulator, play gba online, gba games free, gameboy advance emulator, pokemon gba, free gba emulator online, gba emulator no download",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "GB",
    hreflang: "en-gb"
  },
  "in": {
    code: "in",
    name: "India",
    lang: "en",
    locale: "en_IN",
    currency: "INR",
    flag: "🇮🇳",
    title: "Play GBA Games Online Free — No Download GBA Emulator",
    description: "Play classic Game Boy Advance games in your browser. Pokemon, Zelda, Mario and more. Free, no download required.",
    keywords: "gba emulator, play gba online, gba games free, gameboy advance emulator, pokemon gba, free gba emulator online, gba emulator no download, gba emulator india",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "pokemon-ruby", "zelda-minish-cap", "mario-kart-super-circuit"],
    schemaArea: "IN",
    hreflang: "en-in"
  },
  "br": {
    code: "br",
    name: "Brazil",
    lang: "pt-BR",
    locale: "pt_BR",
    currency: "BRL",
    flag: "🇧🇷",
    title: "Emulador GBA Online Grátis — Jogue Jogos GBA no Navegador",
    description: "Jogue jogos clássicos do Game Boy Advance no navegador. Pokemon, Zelda, Mario e mais. Grátis, sem download.",
    keywords: "emulador gba, jogar gba online, jogos gba gratis, emulador gameboy advance, pokemon gba, emulador gba online, emulador gba sem download",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "BR",
    hreflang: "pt-br"
  },
  "jp": {
    code: "jp",
    name: "Japan",
    lang: "ja",
    locale: "ja_JP",
    currency: "JPY",
    flag: "🇯🇵",
    title: "GBAエミュレータオンライン無料 — ダウンロード不要でGBAゲームをプレイ",
    description: "ブラウザでゲームボイアドバンスのゲームをプレイ。ポケモン、ゼルダ、マリオなど。無料、ダウンロード不要。",
    keywords: "gbaエミュレータ, gba オンライン, gba ゲーム 無料, ゲームボイアドバンス エミュレータ, ポケモン gba, gbaエミュレータ オンライン",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "JP",
    hreflang: "ja-jp"
  },
  "de": {
    code: "de",
    name: "Germany",
    lang: "de",
    locale: "de_DE",
    currency: "EUR",
    flag: "🇩🇪",
    title: "GBA Emulator Kostenlos Online — Spiele GBA Spiele im Browser",
    description: "Spiele klassische Game Boy Advance Spiele im Browser. Pokemon, Zelda, Mario und mehr. Kostenlos, kein Download.",
    keywords: "gba emulator, gba online spielen, gba spiele kostenlos, gameboy advance emulator, pokemon gba, gba emulator online, gba emulator kein download",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "DE",
    hreflang: "de-de"
  },
  "fr": {
    code: "fr",
    name: "France",
    lang: "fr",
    locale: "fr_FR",
    currency: "EUR",
    flag: "🇫🇷",
    title: "Émulateur GBA En Ligne Gratuit — Jouez aux Jeux GBA dans le Navigateur",
    description: "Jouez aux jeux classiques Game Boy Advance dans votre navigateur. Pokemon, Zelda, Mario et plus. Gratuit, sans téléchargement.",
    keywords: "emulateur gba, jouer gba en ligne, jeux gba gratuit, emulateur gameboy advance, pokemon gba, emulateur gba en ligne, emulateur gba sans telechargement",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "FR",
    hreflang: "fr-fr"
  },
  "es": {
    code: "es",
    name: "Spain",
    lang: "es",
    locale: "es_ES",
    currency: "EUR",
    flag: "🇪🇸",
    title: "Emulador GBA Online Gratis — Juega a Juegos GBA en el Navegador",
    description: "Juega a juegos clásicos de Game Boy Advance en tu navegador. Pokemon, Zelda, Mario y más. Gratis, sin descarga.",
    keywords: "emulador gba, jugar gba online, juegos gba gratis, emulador gameboy advance, pokemon gba, emulador gba online, emulador gba sin descarga",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "ES",
    hreflang: "es-es"
  },
  "id": {
    code: "id",
    name: "Indonesia",
    lang: "id",
    locale: "id_ID",
    currency: "IDR",
    flag: "🇮🇩",
    title: "Emulator GBA Online Gratis — Mainkan Game GBA di Browser",
    description: "Mainkan game Game Boy Advance klasik di browser. Pokemon, Zelda, Mario dan lainnya. Gratis, tanpa download.",
    keywords: "emulator gba, main gba online, game gba gratis, emulator gameboy advance, pokemon gba, emulator gba online, emulator gba tanpa download",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "ID",
    hreflang: "id-id"
  },
  "ru": {
    code: "ru",
    name: "Russia",
    lang: "ru",
    locale: "ru_RU",
    currency: "RUB",
    flag: "🇷🇺",
    title: "GBA Эмулятор Онлайн — Играйте в Игры GBA в Браузере",
    description: "Играйте в классические игры Game Boy Advance в браузере. Pokemon, Zelda, Mario и другие. Бесплатно, без скачивания.",
    keywords: "gba эмулятор, gba онлайн, gba игры бесплатно, эмулятор gameboy advance, pokemon gba, gba эмулятор онлайн, gba эмулятор без скачивания",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "RU",
    hreflang: "ru-ru"
  },
  "au": {
    code: "au",
    name: "Australia",
    lang: "en",
    locale: "en_AU",
    currency: "AUD",
    flag: "🇦🇺",
    title: "Play GBA Games Online Free — No Download GBA Emulator",
    description: "Play classic Game Boy Advance games in your browser. Pokemon, Zelda, Mario and more. Free, no download required.",
    keywords: "gba emulator, play gba online, gba games free, gameboy advance emulator, pokemon gba, free gba emulator online, gba emulator no download",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "AU",
    hreflang: "en-au"
  },
  "ng": {
    code: "ng",
    name: "Nigeria",
    lang: "en",
    locale: "en_NG",
    currency: "NGN",
    flag: "🇳🇬",
    title: "Play GBA Games Online Free — No Download GBA Emulator",
    description: "Play classic Game Boy Advance games in your browser. Pokemon, Zelda, Mario and more. Free, no download required.",
    keywords: "gba emulator, play gba online, gba games free, gameboy advance emulator, pokemon gba, free gba emulator online, gba emulator no download",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "NG",
    hreflang: "en-ng"
  },
  "sg": {
    code: "sg",
    name: "Singapore",
    lang: "en",
    locale: "en_SG",
    currency: "SGD",
    flag: "🇸🇬",
    title: "Play GBA Games Online Free — No Download GBA Emulator",
    description: "Play classic Game Boy Advance games in your browser. Pokemon, Zelda, Mario and more. Free, no download required.",
    keywords: "gba emulator, play gba online, gba games free, gameboy advance emulator, pokemon gba, free gba emulator online, gba emulator no download, gba emulator singapore",
    ogImage: "https://www.eggermath.com/og-image.svg",
    popularGames: ["pokemon-emerald", "pokemon-firered", "zelda-minish-cap", "mario-kart-super-circuit", "metroid-fusion"],
    schemaArea: "SG",
    hreflang: "en-sg"
  }
};

// Country code to language code mapping for hreflang
export const countryLangMap = Object.fromEntries(
  Object.entries(countries).map(([code, c]) => [code, c.lang])
);

// Get all country codes
export const allCountryCodes = Object.keys(countries);

// Get country by code
export function getCountry(code) {
  return countries[code] || null;
}
