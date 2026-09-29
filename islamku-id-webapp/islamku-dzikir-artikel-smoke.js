/* Uji runtime pengingat dzikir & artikel: menjalankan app.js pada DOM tiruan
   dengan waktu dibekukan, untuk memvalidasi jadwal dzikir pagi/petang dan
   artikel harian, termasuk toggle preferensi dan interaksinya dengan
   pengingat shalat. */
const fs = require("fs");
const vm = require("vm");

const root = process.cwd();
const appSource = fs.readFileSync(`${root}/app.js`, "utf8");
const contentSource = fs.readFileSync(`${root}/content.js`, "utf8");

let FIXED_NOW = new Date("2026-09-26T04:30:30");
class FakeDate extends Date {
  constructor(...args) {
    if (args.length === 0) super(FIXED_NOW.getTime());
    else super(...args);
  }
  static now() {
    return FIXED_NOW.getTime();
  }
}

const sent = [];
const timeouts = [];
let permission = "default";
let timeoutId = 0;

function classList() {
  const set = new Set();
  return {
    add: (...items) => items.forEach((item) => set.add(item)),
    remove: (...items) => items.forEach((item) => set.delete(item)),
    toggle(item, force) {
      const on = force === undefined ? !set.has(item) : Boolean(force);
      if (on) set.add(item);
      else set.delete(item);
      return on;
    },
    contains: (item) => set.has(item),
  };
}

const elements = new Map();
function element(selector) {
  if (!elements.has(selector)) {
    const handlers = new Map();
    elements.set(selector, {
      selector,
      textContent: "",
      innerHTML: "",
      value: "",
      checked: false,
      disabled: false,
      dataset: {},
      style: { setProperty() {} },
      classList: classList(),
      addEventListener(type, fn) {
        if (!handlers.has(type)) handlers.set(type, []);
        handlers.get(type).push(fn);
      },
      fire(type, event = {}) {
        (handlers.get(type) || []).forEach((fn) =>
          fn({ currentTarget: this, target: this, ...event }),
        );
      },
      setAttribute() {},
      getAttribute: () => null,
      closest: () => null,
      focus() {},
      querySelector(selector2) {
        return element(
          selector2.startsWith("#") ? selector2 : `${selector} ${selector2}`,
        );
      },
      querySelectorAll: (selector2) => [element(selector2)],
    });
  }
  return elements.get(selector);
}

class FakeNotification {
  static get permission() {
    return permission;
  }
  static async requestPermission() {
    permission = "granted";
    return "granted";
  }
  constructor(title, options) {
    sent.push({ title, options });
  }
}

const store = new Map();
const localStorage = {
  getItem: (key) => (store.has(key) ? store.get(key) : null),
  setItem: (key, value) => store.set(key, String(value)),
  removeItem: (key) => store.delete(key),
  get length() {
    return store.size;
  },
  key: (index) => [...store.keys()][index] ?? null,
};

const document = {
  querySelector: (selector) => element(selector),
  querySelectorAll: (selector) => [element(selector)],
  addEventListener() {},
  visibilityState: "visible",
  body: element("body"),
  createElement: () => element("created-element"),
};

const nodeSetTimeout = setTimeout;

const sandbox = {
  window: { Notification: FakeNotification, scrollTo() {}, addEventListener() {} },
  document,
  localStorage,
  navigator: {
    serviceWorker: {
      addEventListener() {},
      getRegistration: async () => ({
        showNotification: async (title, options) => {
          sent.push({ title, options });
        },
      }),
      register: async () => ({}),
    },
  },
  Notification: FakeNotification,
  Date: FakeDate,
  location: { hash: "#beranda" },
  history: { replaceState() {} },
  fetch: async () => ({ ok: false, status: 404, json: async () => ({}) }),
  setTimeout(fn, delay) {
    const id = ++timeoutId;
    const entry = { id, fn, delay };
    timeouts.push(entry);
    if (delay <= 200) {
      nodeSetTimeout(() => {
        const index = timeouts.indexOf(entry);
        if (index >= 0) timeouts.splice(index, 1);
        fn();
      }, delay);
    }
    return id;
  },
  clearTimeout(id) {
    const index = timeouts.findIndex((entry) => entry.id === id);
    if (index >= 0) timeouts.splice(index, 1);
  },
  setInterval: () => 0,
  clearInterval() {},
  console,
  process,
  __sent: sent,
  __timeouts: timeouts,
  __setNow: (iso) => {
    FIXED_NOW = new Date(iso);
  },
};

const epilogue = `
;(async function smoke() {
  const out = [];
  const record = (label, value) => out.push(label + " -> " + value);
  const resetSent = () => { __sent.length = 0; };
  const resetLog = () => localStorage.removeItem("islamku:notified:" + todayKey());
  const tags = () => __sent.map((entry) => entry.options?.tag).join(",");
  await new Promise((resolve) => setTimeout(resolve, 60));

  await requestNotificationPermission();

  state.timings = {
    timings: { Fajr: "04:30", Sunrise: "05:40", Dhuhr: "11:45", Asr: "15:10", Maghrib: "17:50", Isha: "19:05" },
  };

  // --- Dzikir pagi: 30 menit setelah Subuh (04:30 → target 05:00) ---
  __setNow("2026-09-26T05:00:30");
  resetSent(); resetLog();
  saveNotificationPrefs({ prayer: false, prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false }, dzikir: true, artikel: false });
  await runNotificationScheduler();
  record("dzikir-pagi", tags());
  const dzikirPagi = __sent[0] || {};
  record("dzikir-pagi-judul", dzikirPagi.title || "-");
  record("dzikir-pagi-link", (dzikirPagi.options && dzikirPagi.options.data && dzikirPagi.options.data.url) || "-");

  // --- Dzikir petang: 30 menit setelah Ashar (15:10 → target 15:40) ---
  __setNow("2026-09-26T15:40:30");
  resetSent(); resetLog();
  await runNotificationScheduler();
  record("dzikir-petang", tags());
  record("dzikir-petang-judul", (__sent[0] || {}).title || "-");

  // --- Mematikan dzikir: tidak ada notifikasi dzikir yang terkirim ---
  __setNow("2026-09-26T05:00:30");
  resetSent(); resetLog();
  saveNotificationPrefs({ dzikir: false });
  await runNotificationScheduler();
  record("dzikir-mati", tags() || "(tidak ada)");

  // --- Artikel harian: pukul 08:00, hanya sekali per hari ---
  __setNow("2026-09-26T08:00:30");
  resetSent(); resetLog();
  saveNotificationPrefs({ artikel: true, dzikir: false });
  await runNotificationScheduler();
  record("artikel-pertama", tags());
  const artikelNotif = __sent[0] || {};
  record("artikel-judul", artikelNotif.title || "-");
  record("artikel-link", (artikelNotif.options && artikelNotif.options.data && artikelNotif.options.data.url) || "-");

  // --- Artikel tidak dikirim dua kali di hari yang sama (log sudah tercatat) ---
  resetSent();
  await runNotificationScheduler();
  record("artikel-tidak-dobel", tags() || "(tidak ada, sudah terkirim)");

  // --- Mematikan artikel & dzikir tapi shalat aktif → scheduler tetap aktif karena shalat ---
  saveNotificationPrefs({ artikel: false, dzikir: false, prayer: true, prayers: { Fajr: true, Dhuhr: false, Asr: false, Maghrib: false, Isha: false } });
  record("scheduler-aktif-karena-shalat", hasActiveNotificationPref());

  // --- Semua dimatikan (shalat, dzikir, artikel) → scheduler benar-benar nonaktif ---
  saveNotificationPrefs({ prayer: false, prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false } });
  record("scheduler-benar-benar-mati", hasActiveNotificationPref());

  // --- Toggle checkbox dzikir & artikel di UI memicu saveNotificationPrefs yang benar ---
  initNotificationControls();
  const dzikirCheckbox = document.querySelector("#settingsPrefDzikir");
  dzikirCheckbox.checked = true;
  dzikirCheckbox.fire("change", { target: dzikirCheckbox });
  record("toggle-dzikir-ui", JSON.stringify(loadNotificationPrefs().dzikir));

  const artikelCheckbox = document.querySelector("#notifPrefArtikel");
  artikelCheckbox.checked = true;
  artikelCheckbox.fire("change", { target: artikelCheckbox });
  record("toggle-artikel-ui", JSON.stringify(loadNotificationPrefs().artikel));

  console.log(out.join("\\n"));
  process.exit(0);
})().catch((error) => {
  console.log("GAGAL " + ((error && error.stack) || error));
  process.exit(1);
});
`;

const context = vm.createContext(sandbox);
vm.runInContext(`${contentSource}\n${appSource}\n${epilogue}`, context, {
  filename: "app.dzikir-artikel-smoke.js",
});
