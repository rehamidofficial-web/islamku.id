/* Uji runtime pengingat shalat: menjalankan app.js pada DOM tiruan dengan
   waktu yang dibekukan, untuk memvalidasi pilihan waktu, iqamah, aksi
   notifikasi, dan info pengingat berikutnya. */
const fs = require("fs");
const vm = require("vm");

const root = process.cwd();
const appSource = fs.readFileSync(`${root}/app.js`, "utf8");
const contentSource = fs.readFileSync(`${root}/content.js`, "utf8");

const FIXED_NOW = new Date("2026-09-26T10:00:30");
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
  fetch: async (url) => {
    if (String(url).includes("api.aladhan.com")) {
      return {
        ok: true,
        status: 200,
        json: async () => ({
          data: {
            timings: {
              Fajr: "04:30",
              Sunrise: "05:40",
              Dhuhr: "11:45",
              Asr: "15:10",
              Maghrib: "17:50",
              Isha: "19:05",
            },
            date: {
              readable: "26 Sep 2026",
              hijri: {
                day: "5",
                year: "1448",
                month: { en: "Rabīʿ al-awwal" },
                weekday: { id: "Sabtu", en: "Saturday" },
              },
            },
            meta: { method: { name: "Kemenag RI" } },
          },
        }),
      };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  },
  setTimeout(fn, delay) {
    const id = ++timeoutId;
    const entry = { id, fn, delay };
    timeouts.push(entry);
    // Delay pendek (mis. jeda uji) dijalankan sungguhan agar alur async selesai.
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
  __permission: (value) => {
    permission = value;
  },
};

const epiloguePart1 = `
;(async function smoke() {
  const out = [];
  const record = (label, value) => out.push(label + " -> " + value);
  const resetSent = () => { __sent.length = 0; };
  const resetLog = () => localStorage.removeItem("islamku:notified:" + todayKey());
  const tags = () => __sent.map((entry) => entry.options?.tag).join(",");
  await new Promise((resolve) => setTimeout(resolve, 60));

  const defaults = loadNotificationPrefs();
  record("prefs-default", JSON.stringify(defaults.prayers) + " iqamah=" + defaults.iqamahMinutes);

  // Belum ada izin notifikasi → info pengingat meminta izin lebih dulu.
  record("info-tanpa-izin", formatNextReminderText());

  await requestNotificationPermission();
  record("izin", getNotificationPermission());

  // Waktu dibekukan 10:00:30; Fajr tepat sekarang, sisanya menyusul.
  state.timings = {
    timings: { Fajr: "10:00", Sunrise: "10:02", Dhuhr: "10:05", Asr: "10:10", Maghrib: "10:15", Isha: "10:20" },
  };

  saveNotificationPrefs({
    prayer: true,
    prayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    iqamahMinutes: 0,
    leadMinutes: 0,
  });
  await runNotificationScheduler();
  record("adzan-pertama", tags());
  const first = __sent[0] ? __sent[0].options : {};
  record("aksi-notifikasi", Array.isArray(first.actions) ? first.actions.map((a) => a.action).join("/") : "tidak ada");
  record("data-prayer", String(first.data && first.data.prayer));
  record("info-berikutnya", formatNextReminderText());

  // Mematikan Subuh tetap mengirim Dzuhur saja (pilihan per waktu).
  resetSent(); resetLog();
  saveNotificationPrefs({ prayers: { Fajr: false } });
  state.timings.timings.Dhuhr = "10:00";
  await runNotificationScheduler();
  record("lewati-subuh", tags());

  // Pengingat dimajukan 10 menit: Dzuhur 10:10 → target 10:00.
  resetSent(); resetLog();
  saveNotificationPrefs({ leadMinutes: 10, prayers: { Fajr: true } });
  state.timings.timings.Dhuhr = "10:10";
  await runNotificationScheduler();
  record("judul-lead", __sent.map((entry) => entry.title).join("|"));

  // Pengingat jamaah 5 menit setelah adzan: Dzuhur 09:55 → target 10:00.
  resetSent(); resetLog();
  saveNotificationPrefs({ leadMinutes: 0, iqamahMinutes: 5 });
  state.timings.timings.Dhuhr = "09:55";
  await runNotificationScheduler();
  record("iqamah", tags() + " | " + ((__sent[0] && __sent[0].title) || "-"));
  record("log-harian", Object.keys(readNotificationLog()).join(","));

  console.log("BAGIAN-1");
`;

const epiloguePart2 = `
  // Kembalikan jadwal ke waktu realistis, lalu uji info & penjadwalan.
  state.timings.timings = { Fajr: "04:30", Sunrise: "05:40", Dhuhr: "11:45", Asr: "15:10", Maghrib: "17:50", Isha: "19:05" };
  resetLog(); resetSent();
  saveNotificationPrefs({ prayer: true, iqamahMinutes: 0, leadMinutes: 5 });
  const plan = buildReminderPlan(loadNotificationPrefs(), state.timings.timings);
  record("rencana-pertama", plan[0].id + "@" + minutesToClock(plan[0].at));

  // Semua pengingat hari ini sudah terkirim → berikutnya Subuh besok.
  const logAll = {};
  plan.forEach((entry) => { logAll[entry.id] = "terkirim"; });
  saveLocal("islamku:notified:" + todayKey(), logAll);
  record("info-besok", formatNextReminderText());

  // Tidak ada waktu shalat & tidak ada dzikir/artikel dipilih → benar-benar tidak ada pengingat aktif.
  saveLocal("islamku:notified:" + todayKey(), {});
  saveNotificationPrefs({
    prayers: { Fajr: false, Dhuhr: false, Asr: false, Maghrib: false, Isha: false },
    dzikir: false,
    artikel: false,
  });
  record("info-kosong", formatNextReminderText());
  record("scheduler-nonaktif", hasActiveNotificationPref());

  // Timer presisi: pengingat berikutnya 4,5 menit lagi (Dzuhur 10:05, lead 0 → target tepat 10:05).
  saveNotificationPrefs({
    prayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    leadMinutes: 0,
  });
  state.timings.timings.Dhuhr = "10:05";
  __timeouts.length = 0;
  scheduleNextReminder();
  const precise = __timeouts.filter((entry) => entry.delay > 1000);
  record("timer-presisi-ms", precise.length ? precise[0].delay : "tidak ada");

  // Pengingat jauh (> 20 menit) diserahkan ke interval 60 detik.
  state.timings.timings.Dhuhr = "12:00";
  resetLog();
  __timeouts.length = 0;
  scheduleNextReminder();
  record("timer-jauh", __timeouts.filter((entry) => entry.delay > 1000).length);

  // Aksi notifikasi: tandai sudah shalat.
  handleReminderAction({ action: "mark", prayer: "Maghrib" });
  record("tandai-shalat", JSON.stringify(getPrayerDoneMap()));
  record("toast-tandai", document.querySelector("#toast").textContent);

  // Aksi notifikasi: ingatkan 5 menit lagi.
  handleReminderAction({ action: "snooze", prayer: "Fajr", minutes: 5 });
  const snoozeEntry = __timeouts.find((entry) => entry.delay === 300000);
  record("timer-snooze-ms", snoozeEntry ? snoozeEntry.delay : "tidak ada");
  resetSent();
  if (snoozeEntry) {
    __timeouts.splice(__timeouts.indexOf(snoozeEntry), 1);
    await snoozeEntry.fn();
  }
  record("snooze-terkirim", tags());
  record("toast-snooze", document.querySelector("#toast").textContent);

  // Tombol hero "Ingatkan saya" mengikuti status pengingat.
  updateNotificationUI();
  record("tombol-hero", document.querySelector("#reminderButton").innerHTML + " | aktif=" + document.querySelector("#reminderButton").classList.contains("is-active"));

  console.log("BAGIAN-2");
  console.log(out.join("\\n"));
  process.exit(0);
})().catch((error) => {
  console.log("GAGAL " + ((error && error.stack) || error));
  process.exit(1);
});
`;

const context = vm.createContext(sandbox);
vm.runInContext(
  `${contentSource}\n${appSource}\n${epiloguePart1}${epiloguePart2}`,
  context,
  { filename: "app.reminder-smoke.js" },
);
