/* ==========================================================================
   islamku-app.js — Islamku.id
   Vanilla JS, tanpa framework/build tool. Dipecah per bagian dengan komentar
   supaya mudah ditelusuri:
   1) Util & Toast              5) Kompas Kiblat
   2) Router antar halaman      6) Al-Qur'an (API EQuran.id)
   3) State lokasi & storage    7) Tahlil / Manaqib / Ratib / Dzikir
   4) Jadwal Shalat (API Aladhan) 8) Artikel Islami
   ========================================================================== */

/* ------------------------------ 1) UTIL & TOAST ------------------------------ */
const toast = document.querySelector("#toast");
let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function epochDay() {
  return Math.floor(Date.now() / 86400000);
}

function renderWeekDots() {
  const container = document.querySelector("#weekDots");
  if (!container) return;
  const labels = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const today = new Date().getDay();
  container.innerHTML = labels
    .map(
      (label, index) =>
        `<span class="${index === today ? "today" : ""}" title="${label}">${label}</span>`,
    )
    .join("");
}

function saveLocal(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* localStorage tidak tersedia — abaikan, fitur tetap jalan tanpa persist */
  }
}
function loadLocal(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function scopedStorageKey(key) {
  const userId = state?.currentUser?.email || "guest";
  return `${key}:${userId}`;
}

function loadPersistent(key, fallback) {
  const scopedValue = loadLocal(scopedStorageKey(key), undefined);
  if (scopedValue !== undefined) return scopedValue;
  return loadLocal(key, fallback);
}

function savePersistent(key, value) {
  saveLocal(scopedStorageKey(key), value);
  saveLocal(key, value);
}

/* ------------------------------ 2) ROUTER ------------------------------ */
const PAGES = [
  "beranda",
  "jadwal",
  "kiblat",
  "alquran",
  "tahlil",
  "manaqib",
  "ratib",
  "dzikir",
  "artikel",
  "kontak",
  "pengaturan",
];

function navigateTo(pageId, opts = {}) {
  if (!PAGES.includes(pageId)) pageId = "beranda";
  document.querySelectorAll(".page-section").forEach((el) => {
    el.classList.toggle("is-active", el.dataset.page === pageId);
  });
  document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
    link.classList.toggle("active", link.dataset.section === pageId);
  });
  if (!opts.skipScroll)
    window.scrollTo({
      top: 0,
      behavior: "instant" in window ? "instant" : "auto",
    });
  if (!opts.skipHash) history.replaceState(null, "", `#${pageId}`);

  // Lazy-init tiap halaman hanya saat pertama kali dibuka
  if (pageId === "jadwal" && !state.jadwalInited) initJadwalPage();
  if (pageId === "kiblat" && !state.kiblatInited) initKiblatPage();
  if (pageId === "alquran" && !state.quranInited) initQuranPage();
  if (pageId === "tahlil" && !state.tahlilInited) renderTahlil();
  if (pageId === "manaqib" && !state.manaqibInited) renderManaqib();
  if (pageId === "ratib" && !state.ratibInited) renderRatib();
  if (pageId === "dzikir" && !state.dzikirInited) renderDzikir();
  if (pageId === "artikel" && !state.artikelInited) renderArtikelList();
  if (pageId === "kontak" && !state.contactInited) initContactPage();
  if (pageId === "pengaturan") renderSettingsPage();
}

document.querySelectorAll(".nav-link[data-section]").forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo(link.dataset.section);
  });
});
document.querySelectorAll("[data-goto]").forEach((el) => {
  el.addEventListener("click", (e) => {
    e.preventDefault();
    navigateTo(el.dataset.goto);
  });
});
document.querySelectorAll("[data-mobile-section]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    navigateTo(link.dataset.mobileSection);
    document.querySelector("#mobileNavPanel").classList.add("is-hidden");
    document
      .querySelector("#mobileMenuButton")
      .setAttribute("aria-expanded", "false");
  });
});
document.querySelector("#mobileMenuButton").addEventListener("click", () => {
  const panel = document.querySelector("#mobileNavPanel");
  const isHidden = panel.classList.toggle("is-hidden");
  document
    .querySelector("#mobileMenuButton")
    .setAttribute("aria-expanded", String(!isHidden));
});

const state = {
  location: loadLocal("islamku:location", null), // { lat, lon, label }
  currentUser: loadLocal("islamku:session", null)?.user || null,
  currentBookmark: loadLocal("islamku:current-bookmark", null),
  pendingPage: null,
  authRequired: false,
  jadwalInited: false,
  kiblatInited: false,
  quranInited: false,
  tahlilInited: false,
  manaqibInited: false,
  ratibInited: false,
  dzikirInited: false,
  artikelInited: false,
  contactInited: false,
  timings: null, // hasil API Aladhan hari ini
};

/* ------------------------------ 3) AKUN & SESI ------------------------------ */
const API_BASE = "/api";
let authMode = "login";

async function apiRequest(endpoint, options = {}) {
  const session = loadLocal("islamku:session", null);
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok)
    throw new Error(payload.error || "Server tidak dapat dihubungi.");
  return payload;
}

function getCurrentBookmark() {
  return state.currentUser ? state.currentBookmark : null;
}

function initContactPage() {
  state.contactInited = true;
  const form = document.querySelector("#contactForm");
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submit = document.querySelector("#contactSubmit");
    const error = document.querySelector("#contactError");

    if (!state.currentUser) {
      state.pendingPage = "kontak";
      openAuth("login", true);
      showToast("Silakan masuk untuk mengirim saran, pertanyaan, atau kisah.");
      return;
    }

    submit.disabled = true;
    submit.textContent = "Mengirim...";
    error.textContent = "";
    try {
      const result = await apiRequest("/contact", {
        method: "POST",
        body: JSON.stringify({
          type: document.querySelector("#contactType").value,
          name: document.querySelector("#contactName").value.trim(),
          email: document.querySelector("#contactEmail").value.trim(),
          subject: document.querySelector("#contactSubject").value.trim(),
          message: document.querySelector("#contactMessage").value.trim(),
        }),
      });
      form.reset();
      showToast(
        result.delivered
          ? "Pesan terkirim ke email penerima."
          : "Pesan tersimpan di server. Email belum aktif.",
      );
    } catch (requestError) {
      error.textContent = requestError.message;
    } finally {
      submit.disabled = false;
      submit.textContent = "Kirim pesan";
    }
  });
}

function initials(name) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "AK"
  );
}

function updateAccountUI() {
  const user = state.currentUser;
  const avatar = document.querySelector("#profileAvatar");
  const profileName = document.querySelector("#profileName");
  const profileStatus = document.querySelector("#profileStatus");
  const menuName = document.querySelector("#accountMenuName");
  const menuEmail = document.querySelector("#accountMenuEmail");
  const menuButton = document.querySelector("#accountMenuButton");
  const welcomeName = document.querySelector("#welcomeName");
  if (user) {
    avatar.textContent = initials(user.name);
    profileName.textContent = user.name;
    profileStatus.textContent = "Akun aktif";
    menuName.textContent = user.name;
    menuEmail.textContent = user.email;
    menuButton.textContent = "Keluar dari akun";
    welcomeName.textContent = user.name;
  } else {
    avatar.textContent = "AK";
    profileName.textContent = "Akun tamu";
    profileStatus.textContent = "Masuk untuk menyimpan progres";
    menuName.textContent = "Belum masuk";
    menuEmail.textContent = "Bookmark tersimpan di perangkat ini";
    menuButton.textContent = "Masuk / Daftar";
    welcomeName.textContent = "Akun tamu";
  }
  renderLastReadBanner();
  renderSettingsPage();
}
/* ------------------------------ 3b) NOTIFIKASI & PENGINGAT ------------------------------ */
// Konstanta waktu shalat dipakai bersama oleh jadwal shalat dan pengingat.
const PRAYER_ORDER = ["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"];
const PRAYER_LABEL = {
  Fajr: "Subuh",
  Dhuhr: "Dzuhur",
  Asr: "Ashar",
  Maghrib: "Maghrib",
  Isha: "Isya",
};
const PRAYER_ICON = {
  Fajr: "☼",
  Dhuhr: "◒",
  Asr: "◐",
  Maghrib: "◑",
  Isha: "◒",
};

// Izin notifikasi dikelola browser; pengingatnya bagian dari preferensi pengguna.
const NOTIFICATION_PREFS_KEY = "islamku:notification-prefs"; // kunci versi lama
const USER_PREFS_KEY = "islamku:prefs";
const DEFAULT_PRAYERS = Object.fromEntries(
  PRAYER_ORDER.map((key) => [key, true]),
);
const DEFAULT_USER_PREFS = {
  notification: {
    prayer: true,
    prayers: { ...DEFAULT_PRAYERS },
    leadMinutes: 10,
    iqamahMinutes: 0,
    dzikir: true,
    artikel: false,
  },
  display: { readingScale: "normal" },
  ibadah: { asrSchool: "standard" },
};
const PREFERENCE_OPTIONS = {
  leadMinutes: [0, 5, 10, 15],
  iqamahMinutes: [0, 5, 10, 15],
  readingScale: ["normal", "large"],
  asrSchool: ["standard", "hanafi"],
};
const NOTIFICATION_CHECK_INTERVAL = 60000; // jaring pengaman: cek tiap 60 detik
const NOTIFICATION_MAX_TIMEOUT = 20 * 60000; // batas timer presisi (20 menit)
const NOTIFICATION_SNOOZE_MINUTES = 5;
const NOTIFICATION_ARTICLE_HOUR = 8; // pengingat artikel pukul 08.00
const NOTIFICATION_DZIKIR_DELAY = 10; // menit setelah Subuh/Ashar
const NOTIFICATION_ICON = "./icons/icon-192.svg";
const NOTIFICATION_PRAYER_ACTIONS = [
  { action: "snooze", title: "Ingatkan 5 menit lagi" },
  { action: "mark", title: "Tandai sudah shalat" },
];

const NOTIFICATION_COPY = {
  default: {
    cardTitle: "Aktifkan notifikasi",
    cardBody:
      "Izinkan notifikasi agar Anda mendapat pengingat shalat dan dzikir tepat waktu.",
    cardStatus: "Belum diizinkan",
    cardEnable: "Aktifkan",
    cardDismiss: "Nanti",
    label: "Belum diizinkan",
    hint: "Izinkan notifikasi agar pengingat dapat dikirim.",
    action: "Aktifkan notifikasi",
    actionDisabled: false,
  },
  granted: {
    cardTitle: "Notifikasi aktif",
    cardBody: "Pengingat dikirim mengikuti pengaturan notifikasi kamu.",
    cardStatus: "Diizinkan",
    cardEnable: "",
    cardDismiss: "Tutup",
    label: "Notifikasi aktif",
    hint: "Pengingat dikirim mengikuti preferensi di bawah.",
    action: "Notifikasi sudah aktif",
    actionDisabled: true,
  },
  denied: {
    cardTitle: "Notifikasi diblokir",
    cardBody:
      "Buka pengaturan situs di browser → Notifikasi → Izinkan, lalu muat ulang halaman ini.",
    cardStatus: "Diblokir",
    cardEnable: "",
    cardDismiss: "Mengerti",
    label: "Diblokir browser",
    hint: "Buka pengaturan situs → Notifikasi → Izinkan, lalu muat ulang halaman.",
    action: "Izin diblokir browser",
    actionDisabled: true,
  },
  unsupported: {
    cardTitle: "Notifikasi tidak didukung",
    cardBody: "Browser atau perangkat ini belum mendukung notifikasi web.",
    cardStatus: "Tidak didukung",
    cardEnable: "",
    cardDismiss: "Mengerti",
    label: "Tidak didukung",
    hint: "Browser atau perangkat ini belum mendukung notifikasi web.",
    action: "Tidak didukung",
    actionDisabled: true,
  },
};

function notificationCopy(permission) {
  return NOTIFICATION_COPY[permission] || NOTIFICATION_COPY.default;
}

/* Preferensi pengguna tersimpan di perangkat per akun, lalu disinkronkan ke
   server saat pengguna masuk supaya bisa dipakai di perangkat lain. */
function normalizeUserPrefs(saved) {
  const source = saved && typeof saved === "object" ? saved : {};
  const prefs = {
    notification: {
      ...DEFAULT_USER_PREFS.notification,
      ...(source.notification || {}),
    },
    display: { ...DEFAULT_USER_PREFS.display, ...(source.display || {}) },
    ibadah: { ...DEFAULT_USER_PREFS.ibadah, ...(source.ibadah || {}) },
  };

  // Migrasi preferensi notifikasi versi lama (sebelum preferensi terpadu).
  const legacy = loadLocal(NOTIFICATION_PREFS_KEY, null);
  if (legacy && typeof legacy === "object" && !source.notification) {
    prefs.notification = { ...prefs.notification, ...legacy };
  }

  prefs.notification.prayer = prefs.notification.prayer !== false;
  prefs.notification.dzikir = prefs.notification.dzikir !== false;
  prefs.notification.artikel = prefs.notification.artikel === true;

  // prayers: peta per waktu shalat, sehingga pengguna bisa memilih cukup satu waktu.
  const savedPrayers =
    prefs.notification.prayers && typeof prefs.notification.prayers === "object"
      ? prefs.notification.prayers
      : {};
  prefs.notification.prayers = Object.fromEntries(
    Object.keys(DEFAULT_PRAYERS).map((key) => [
      key,
      savedPrayers[key] !== false,
    ]),
  );

  const lead = Number(prefs.notification.leadMinutes);
  prefs.notification.leadMinutes = PREFERENCE_OPTIONS.leadMinutes.includes(lead)
    ? lead
    : DEFAULT_USER_PREFS.notification.leadMinutes;
  const iqamah = Number(prefs.notification.iqamahMinutes);
  prefs.notification.iqamahMinutes = PREFERENCE_OPTIONS.iqamahMinutes.includes(
    iqamah,
  )
    ? iqamah
    : DEFAULT_USER_PREFS.notification.iqamahMinutes;
  prefs.display.readingScale = PREFERENCE_OPTIONS.readingScale.includes(
    prefs.display.readingScale,
  )
    ? prefs.display.readingScale
    : DEFAULT_USER_PREFS.display.readingScale;
  prefs.ibadah.asrSchool = PREFERENCE_OPTIONS.asrSchool.includes(
    prefs.ibadah.asrSchool,
  )
    ? prefs.ibadah.asrSchool
    : DEFAULT_USER_PREFS.ibadah.asrSchool;
  return prefs;
}

function loadUserPrefs() {
  return normalizeUserPrefs(loadPersistent(USER_PREFS_KEY, null));
}

// prayers digabung bertingkat agar mematikan satu waktu tidak mengubah waktu lain.
function mergeNotificationPrefs(current, patch = {}) {
  return {
    ...current,
    ...patch,
    prayers: { ...current.prayers, ...(patch.prayers || {}) },
  };
}

function saveUserPrefs(patch = {}) {
  const current = loadUserPrefs();
  const prefs = normalizeUserPrefs({
    notification: mergeNotificationPrefs(
      current.notification,
      patch.notification || {},
    ),
    display: { ...current.display, ...(patch.display || {}) },
    ibadah: { ...current.ibadah, ...(patch.ibadah || {}) },
  });
  savePersistent(USER_PREFS_KEY, prefs);
  return prefs;
}

function loadNotificationPrefs() {
  return loadUserPrefs().notification;
}

function saveNotificationPrefs(patch) {
  return saveUserPrefs({ notification: patch }).notification;
}

function hasActiveNotificationPref() {
  const prefs = loadNotificationPrefs();
  const anyPrayer = Object.values(prefs.prayers).some(Boolean);
  return Boolean((prefs.prayer && anyPrayer) || prefs.dzikir || prefs.artikel);
}

// Ukuran teks bacaan berlaku untuk semua halaman baca (mode majelis).
function applyUserPreferences() {
  const prefs = loadUserPrefs();
  const large = prefs.display.readingScale === "large";
  document.body.classList.toggle("reading-mode-large", large);
  document.querySelectorAll(".reading-mode-toggle").forEach((button) => {
    button.textContent = large
      ? "Ukuran teks normal"
      : "Perbesar teks (mode majelis)";
    button.setAttribute("aria-pressed", String(large));
  });
}

function getNotificationPermission() {
  if (!("Notification" in window)) return "unsupported";
  const live =
    Notification.permission ||
    loadLocal("islamku:notification-permission", "default");
  return ["granted", "denied", "default"].includes(live) ? live : "default";
}

function renderNotificationPermissionCard(permission) {
  const card = document.querySelector("#notificationPermissionCard");
  if (!card) return;
  const copy = notificationCopy(permission);
  card.querySelector("#notificationPermissionTitle").textContent =
    copy.cardTitle;
  card.querySelector("#notificationPermissionCopy").textContent = copy.cardBody;

  const status = card.querySelector("#notificationPermissionStatus");
  status.textContent = `Status izin: ${copy.cardStatus}`;
  status.dataset.state = permission;

  const enable = card.querySelector("#enableNotifications");
  enable.textContent = copy.cardEnable || "Aktifkan";
  enable.classList.toggle("is-hidden", !copy.cardEnable);
  enable.disabled = !copy.cardEnable;
  card.querySelector("#dismissNotifications").textContent = copy.cardDismiss;

  const shouldShow =
    permission !== "granted" &&
    !loadLocal("islamku:notification-hidden", false);
  card.classList.toggle("is-hidden", !shouldShow);
}

function renderNotificationDialog() {
  const overlay = document.querySelector("#notificationOverlay");
  if (!overlay) return;
  const permission = getNotificationPermission();
  const copy = notificationCopy(permission);

  const status = overlay.querySelector("#notificationStatus");
  status.dataset.state = permission;
  overlay.querySelector("#notificationStatusLabel").textContent = copy.label;
  overlay.querySelector("#notificationStatusHint").textContent = copy.hint;

  // Nilai kontrol disamakan dengan halaman Pengaturan.
  syncNotificationPreferenceInputs();

  const primary = overlay.querySelector("#notificationPrimary");
  if (primary) {
    primary.textContent = copy.action;
    primary.disabled = Boolean(copy.actionDisabled);
  }

  const test = overlay.querySelector("#notificationTest");
  if (test) test.disabled = permission !== "granted";

  const error = overlay.querySelector("#notificationError");
  if (error) error.textContent = "";
}

function updateNotificationUI() {
  const permission = getNotificationPermission();
  const bell = document.querySelector("#notificationButton");
  if (bell) {
    bell.classList.toggle("is-active", permission === "granted");
    bell.setAttribute(
      "aria-label",
      permission === "granted" ? "Notifikasi aktif" : "Notifikasi belum aktif",
    );
  }
  renderNotificationPermissionCard(permission);
  renderNotificationDialog();
  renderNextReminderInfo();

  // Tombol "Ingatkan saya" pada kartu waktu shalat mengikuti status pengingat.
  const reminderButton = document.querySelector("#reminderButton");
  if (reminderButton) {
    const prayerActive =
      permission === "granted" && loadNotificationPrefs().prayer;
    reminderButton.classList.toggle("is-active", prayerActive);
    reminderButton.innerHTML = prayerActive
      ? "<span>✓</span> Pengingat aktif"
      : "<span>♧</span> Ingatkan saya";
  }

  ensureNotificationScheduler();
}

async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    showToast("Browser ini tidak mendukung notifikasi.");
    updateNotificationUI();
    return false;
  }

  let permission = Notification.permission;
  try {
    permission = await Notification.requestPermission();
  } catch (error) {
    showToast("Izin notifikasi tidak dapat diminta dari halaman ini.");
    return false;
  }

  saveLocal("islamku:notification-permission", permission);
  saveLocal("islamku:notification-hidden", permission === "granted");
  updateNotificationUI();

  if (permission === "granted") {
    showToast("Notifikasi shalat sudah aktif.");
    return true;
  }

  showToast(
    permission === "denied"
      ? "Notifikasi diblokir. Aktifkan lewat pengaturan situs di browser."
      : "Notifikasi belum diizinkan.",
  );
  return false;
}

function timeToMinutes(value) {
  const [hours, minutes] = cleanTime(value).split(":").map(Number);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return null;
  return hours * 60 + minutes;
}

function readNotificationLog() {
  return loadLocal(`islamku:notified:${todayKey()}`, {});
}

function markNotificationSent(id) {
  const log = readNotificationLog();
  log[id] = new Date().toISOString();
  saveLocal(`islamku:notified:${todayKey()}`, log);
}

async function sendLocalNotification({
  title,
  body,
  tag,
  url,
  prayer,
  actions,
}) {
  if (getNotificationPermission() !== "granted") return false;
  const options = {
    body,
    tag: tag || "islamku",
    icon: NOTIFICATION_ICON,
    badge: NOTIFICATION_ICON,
    data: {
      url: url || "./#beranda",
      prayer: prayer || null,
      snoozeMinutes: NOTIFICATION_SNOOZE_MINUTES,
    },
  };
  if (Array.isArray(actions) && actions.length) options.actions = actions;
  try {
    const registration =
      "serviceWorker" in navigator
        ? await navigator.serviceWorker.getRegistration()
        : null;
    if (registration) {
      await registration.showNotification(title, options);
      return true;
    }
  } catch (error) {
    /* Service Worker belum siap — lanjut memakai Notification API langsung */
  }
  try {
    new Notification(title, options);
    return true;
  } catch (error) {
    return false;
  }
}

async function sendTestNotification() {
  const error = document.querySelector("#notificationError");
  if (getNotificationPermission() !== "granted") {
    if (error) error.textContent = "Aktifkan izin notifikasi terlebih dahulu.";
    return;
  }
  const sent = await sendLocalNotification({
    title: "Islamku.id",
    body: "Notifikasi uji coba. Coba tombol “Ingatkan 5 menit lagi” atau “Tandai sudah shalat”.",
    tag: "islamku-uji",
    url: "./#beranda",
    actions: NOTIFICATION_PRAYER_ACTIONS,
  });
  if (error) error.textContent = "";
  showToast(
    sent
      ? "Notifikasi uji coba sudah dikirim."
      : "Notifikasi uji coba gagal dikirim.",
  );
}

function isWithinNotificationWindow(nowMinutes, targetMinutes) {
  return nowMinutes >= targetMinutes && nowMinutes <= targetMinutes + 2;
}

function minutesToClock(value) {
  const wrapped = ((Math.round(value) % 1440) + 1440) % 1440;
  return `${pad2(Math.floor(wrapped / 60))}:${pad2(wrapped % 60)}`;
}

/* Rencana pengingat shalat hari ini: adzan (opsional dimajukan) dan iqamah.
   Dipakai penjadwal maupun info "pengingat berikutnya". */
function buildReminderPlan(prefs, timings) {
  if (!timings) return [];
  const plan = [];
  for (const key of PRAYER_ORDER) {
    if (prefs.prayers[key] === false) continue;
    const adzan = timeToMinutes(timings[key]);
    if (adzan === null) continue;
    if (prefs.prayer) {
      plan.push({
        id: `prayer:${key}`,
        key,
        kind: "adzan",
        at: Math.max(0, adzan - prefs.leadMinutes),
      });
    }
    if (prefs.iqamahMinutes > 0) {
      plan.push({
        id: `iqamah:${key}`,
        key,
        kind: "iqamah",
        at: adzan + prefs.iqamahMinutes,
      });
    }
  }
  return plan.sort((first, second) => first.at - second.at);
}

/* Pengingat berikutnya yang belum terkirim. Setelah semua waktu hari ini
   lewat, pengingat berikutnya adalah Subuh besok (perkiraan waktu hari ini). */
function getNextReminder(prefs, timings, clock = new Date()) {
  const plan = buildReminderPlan(prefs, timings);
  if (!plan.length) return null;
  const log = readNotificationLog();
  const nowMinutes = clock.getHours() * 60 + clock.getMinutes();
  const upcoming = plan.find(
    (entry) => !log[entry.id] && entry.at >= nowMinutes - 2,
  );
  if (upcoming) return { ...upcoming, dayOffset: 0 };
  const fajr =
    plan.find((entry) => entry.kind === "adzan" && entry.key === "Fajr") ||
    plan[0];
  return { ...fajr, dayOffset: 1 };
}

let notificationTimer;
let notificationTimeout;
let notificationSchedulerRunning = false;

function formatNextReminderText() {
  const permission = getNotificationPermission();
  const prefs = loadNotificationPrefs();
  if (permission !== "granted")
    return "Aktifkan notifikasi untuk memakai pengingat shalat.";
  if (!prefs.prayer && prefs.iqamahMinutes === 0)
    return "Pengingat waktu shalat sedang dimatikan.";
  const timings = state.timings?.timings || null;
  if (!timings)
    return "Buka Beranda atau Jadwal Shalat agar jadwal hari ini termuat.";
  const next = getNextReminder(prefs, timings);
  if (!next) return "Pilih minimal satu waktu shalat untuk diingatkan.";
  const label = PRAYER_LABEL[next.key];
  const day = next.dayOffset ? "besok" : "hari ini";
  const detail =
    next.kind === "iqamah"
      ? `jamaah ${label} pukul ${minutesToClock(next.at)}`
      : `${label} pukul ${minutesToClock(next.at)}`;
  return `Pengingat berikutnya: ${detail} (${day}).`;
}

function renderNextReminderInfo() {
  const text = formatNextReminderText();
  ["#notificationNextReminder", "#notifNextReminder", "#settingsNextReminder"]
    .map((selector) => document.querySelector(selector))
    .filter(Boolean)
    .forEach((element) => {
      element.textContent = text;
    });
}

/* Timer presisi menuju pengingat berikutnya; interval 60 detik tetap menjadi
   jaring pengaman bila timer dihentikan browser (misalnya tab tidur). */
function scheduleNextReminder() {
  clearTimeout(notificationTimeout);
  notificationTimeout = null;
  if (getNotificationPermission() !== "granted") return;
  if (!hasActiveNotificationPref()) return;
  const prefs = loadNotificationPrefs();
  const next = getNextReminder(prefs, state.timings?.timings || null);
  if (!next) return;
  const clock = new Date();
  const nowMinutes = clock.getHours() * 60 + clock.getMinutes();
  const delayMs =
    (next.at + next.dayOffset * 1440 - nowMinutes) * 60000 -
    clock.getSeconds() * 1000;
  if (!Number.isFinite(delayMs) || delayMs <= 0) return;
  if (delayMs > NOTIFICATION_MAX_TIMEOUT) return;
  notificationTimeout = setTimeout(() => {
    runNotificationScheduler();
  }, delayMs + 1000);
}

const snoozeTimers = new Map();

function scheduleSnoozeReminder(prayer, minutes) {
  const key = prayer || "umum";
  clearTimeout(snoozeTimers.get(key));
  const delay =
    Math.max(1, Number(minutes) || NOTIFICATION_SNOOZE_MINUTES) * 60000;
  const timer = setTimeout(async () => {
    snoozeTimers.delete(key);
    if (getNotificationPermission() !== "granted") return;
    const prefs = loadNotificationPrefs();
    if (prayer && (!prefs.prayer || prefs.prayers[prayer] === false)) return;
    const label = prayer ? PRAYER_LABEL[prayer] : null;
    const time =
      prayer && state.timings ? cleanTime(state.timings.timings[prayer]) : null;
    await sendLocalNotification({
      title: label ? `Pengingat ${label}` : "Pengingat shalat",
      body: label
        ? `Waktu ${label}${time ? ` pukul ${time}` : ""} sudah masuk. Ayo tunaikan shalat.`
        : "Pengingat shalat: ayo tunaikan shalat berjamaah.",
      tag: `snooze:${key}`,
      url: prayer ? "./#beranda" : "./#jadwal",
      prayer: prayer || null,
      actions: prayer ? NOTIFICATION_PRAYER_ACTIONS : undefined,
    });
  }, delay);
  snoozeTimers.set(key, timer);
  return delay;
}

/* Aksi tombol notifikasi yang diteruskan Service Worker lewat postMessage. */
function handleReminderAction(payload = {}) {
  const action = payload.action || "open";
  const prayer = payload.prayer || null;
  const minutes = Number(payload.minutes) || NOTIFICATION_SNOOZE_MINUTES;

  if (action === "snooze") {
    scheduleSnoozeReminder(prayer, minutes);
    showToast(
      prayer
        ? `Pengingat ${PRAYER_LABEL[prayer]} diulang ${minutes} menit lagi.`
        : `Pengingat diulang ${minutes} menit lagi.`,
    );
    return;
  }

  if (action === "mark") {
    if (!prayer) {
      showToast("Tombol notifikasi berfungsi. Tidak ada shalat yang ditandai.");
      return;
    }
    setPrayerDone(prayer, true);
    showToast(`${PRAYER_LABEL[prayer]} ditandai selesai dari notifikasi.`);
    return;
  }

  renderNextReminderInfo();
}

async function runNotificationScheduler() {
  if (notificationSchedulerRunning) return;
  if (getNotificationPermission() !== "granted") return;
  if (!hasActiveNotificationPref()) return;
  notificationSchedulerRunning = true;
  try {
    const prefs = loadNotificationPrefs();
    const timings = state.timings?.timings || null;
    const clock = new Date();
    const nowMinutes = clock.getHours() * 60 + clock.getMinutes();
    const log = readNotificationLog();

    if (prefs.prayer && timings) {
      for (const key of PRAYER_ORDER) {
        // Pengguna bisa memilih waktu shalat tertentu saja.
        if (prefs.prayers[key] === false) continue;
        const minutes = timeToMinutes(timings[key]);
        if (minutes === null) continue;
        const label = PRAYER_LABEL[key];

        const id = `prayer:${key}`;
        const target = Math.max(0, minutes - prefs.leadMinutes);
        if (!log[id] && isWithinNotificationWindow(nowMinutes, target)) {
          const sent = await sendLocalNotification({
            title:
              prefs.leadMinutes > 0
                ? `${label} ${prefs.leadMinutes} menit lagi`
                : `Waktunya ${label}`,
            body:
              prefs.leadMinutes > 0
                ? `Waktu ${label} masuk pukul ${cleanTime(timings[key])}. Siapkan diri untuk shalat.`
                : `Sudah masuk waktu ${label}. Ayo tunaikan shalat tepat waktu.`,
            tag: id,
            url: "./#jadwal",
            prayer: key,
            actions: NOTIFICATION_PRAYER_ACTIONS,
          });
          if (sent) markNotificationSent(id);
        }

        const iqamahId = `iqamah:${key}`;
        const iqamahTarget = minutes + prefs.iqamahMinutes;
        if (
          prefs.iqamahMinutes > 0 &&
          !log[iqamahId] &&
          isWithinNotificationWindow(nowMinutes, iqamahTarget)
        ) {
          const sent = await sendLocalNotification({
            title: `Jamaah ${label}`,
            body: `Sudah ${prefs.iqamahMinutes} menit setelah adzan ${label} (${cleanTime(timings[key])}). Ayo shalat berjamaah.`,
            tag: iqamahId,
            url: "./#jadwal",
            prayer: key,
            actions: NOTIFICATION_PRAYER_ACTIONS,
          });
          if (sent) markNotificationSent(iqamahId);
        }
      }
    }

    if (prefs.dzikir && timings) {
      const dzikirTargets = [
        {
          id: "dzikir:pagi",
          key: "Fajr",
          title: "Dzikir pagi",
          body: "Waktu Subuh sudah masuk. Awali hari dengan dzikir pagi.",
        },
        {
          id: "dzikir:petang",
          key: "Asr",
          title: "Dzikir petang",
          body: "Waktu Ashar sudah masuk. Lanjutkan dengan dzikir petang.",
        },
      ];
      for (const entry of dzikirTargets) {
        if (log[entry.id]) continue;
        const minutes = timeToMinutes(timings[entry.key]);
        if (minutes === null) continue;
        const target = minutes + NOTIFICATION_DZIKIR_DELAY;
        if (!isWithinNotificationWindow(nowMinutes, target)) continue;
        const sent = await sendLocalNotification({
          title: entry.title,
          body: entry.body,
          tag: entry.id,
          url: "./#dzikir",
        });
        if (sent) markNotificationSent(entry.id);
      }
    }

    if (prefs.artikel && !log["artikel:harian"]) {
      const target = NOTIFICATION_ARTICLE_HOUR * 60;
      if (isWithinNotificationWindow(nowMinutes, target)) {
        const articles = typeof ARTIKEL !== "undefined" ? ARTIKEL : [];
        const picked = articles.length
          ? articles[Math.floor(Math.random() * articles.length)]
          : null;
        const sent = await sendLocalNotification({
          title: "Artikel islami pilihan",
          body: picked
            ? `${picked.judul} — ${picked.kategori}`
            : "Ada bacaan baru untuk menemani harimu.",
          tag: "artikel:harian",
          url: "./#artikel",
        });
        if (sent) markNotificationSent("artikel:harian");
      }
    }
  } finally {
    notificationSchedulerRunning = false;
  }
  renderNextReminderInfo();
  scheduleNextReminder();
}

function ensureNotificationScheduler() {
  clearInterval(notificationTimer);
  clearTimeout(notificationTimeout);
  notificationTimer = null;
  notificationTimeout = null;
  if (getNotificationPermission() !== "granted") {
    renderNextReminderInfo();
    return;
  }
  if (!hasActiveNotificationPref()) {
    renderNextReminderInfo();
    return;
  }
  runNotificationScheduler();
  notificationTimer = setInterval(
    runNotificationScheduler,
    NOTIFICATION_CHECK_INTERVAL,
  );
}

function openNotificationSettings() {
  renderNotificationDialog();
  document.querySelector("#notificationOverlay")?.classList.remove("is-hidden");
}

function closeNotificationSettings() {
  document.querySelector("#notificationOverlay")?.classList.add("is-hidden");
}

function initNotificationControls() {
  document
    .querySelector("#notificationButton")
    ?.addEventListener("click", openNotificationSettings);
  document
    .querySelector("#cardNotificationSettings")
    ?.addEventListener("click", openNotificationSettings);
  document
    .querySelector("#enableNotifications")
    ?.addEventListener("click", () => requestNotificationPermission());
  document
    .querySelector("#notificationPrimary")
    ?.addEventListener("click", () => requestNotificationPermission());
  document
    .querySelector("#notificationTest")
    ?.addEventListener("click", sendTestNotification);
  document
    .querySelector("#notificationClose")
    ?.addEventListener("click", closeNotificationSettings);
  document
    .querySelector("#dismissNotifications")
    ?.addEventListener("click", (event) => {
      saveLocal("islamku:notification-hidden", true);
      event.currentTarget
        .closest(".notification-permission-card")
        ?.classList.add("is-hidden");
      showToast("Notifikasi bisa diaktifkan nanti.");
    });

  const overlay = document.querySelector("#notificationOverlay");
  overlay?.addEventListener("click", (event) => {
    if (event.target === overlay) closeNotificationSettings();
  });

  NOTIFICATION_TOGGLE_FIELDS.forEach(({ key, label, selectors }) => {
    selectors.forEach((selector) => {
      document.querySelector(selector)?.addEventListener("change", (event) => {
        const prefs = saveNotificationPrefs({ [key]: event.target.checked });
        updateNotificationUI();
        renderSettingsPage();
        persistUserPreferences();
        showToast(`${label} ${prefs[key] ? "diaktifkan" : "dimatikan"}.`);
      });
    });
  });

  NOTIFICATION_LEAD_FIELDS.forEach((selector) => {
    document.querySelector(selector)?.addEventListener("change", (event) => {
      const prefs = saveNotificationPrefs({
        leadMinutes: Number(event.target.value),
      });
      updateNotificationUI();
      renderSettingsPage();
      persistUserPreferences();
      showToast(
        prefs.leadMinutes > 0
          ? `Pengingat shalat dikirim ${prefs.leadMinutes} menit sebelum waktu shalat.`
          : "Pengingat shalat dikirim tepat waktu.",
      );
    });
  });

  NOTIFICATION_IQAMAH_FIELDS.forEach((selector) => {
    document.querySelector(selector)?.addEventListener("change", (event) => {
      const prefs = saveNotificationPrefs({
        iqamahMinutes: Number(event.target.value),
      });
      updateNotificationUI();
      renderSettingsPage();
      persistUserPreferences();
      showToast(
        prefs.iqamahMinutes > 0
          ? `Pengingat jamaah aktif ${prefs.iqamahMinutes} menit setelah adzan.`
          : "Pengingat jamaah dimatikan.",
      );
    });
  });

  // Pemilihan waktu shalat memakai delegasi event agar cukup satu pendengar.
  PRAYER_PICK_CONTAINERS.forEach((selector) => {
    document.querySelector(selector)?.addEventListener("change", (event) => {
      const input = event.target?.closest?.("input[data-prayer]");
      if (!input) return;
      const key = input.dataset.prayer;
      const prefs = saveNotificationPrefs({
        prayers: { [key]: input.checked },
      });
      updateNotificationUI();
      renderSettingsPage();
      persistUserPreferences();
      showToast(
        `Pengingat ${PRAYER_LABEL[key]} ${prefs.prayers[key] ? "diaktifkan" : "dimatikan"}.`,
      );
    });
  });

  // Aksi tombol notifikasi dikirim Service Worker lewat postMessage.
  navigator.serviceWorker?.addEventListener?.("message", (event) => {
    const payload = event.data || {};
    if (payload.type !== "islamku:reminder-action") return;
    handleReminderAction(payload);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeNotificationSettings();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    runNotificationScheduler();
    scheduleNextReminder();
  });
}

/* ------------------------------ 3c) PREFERENSI PENGGUNA ------------------------------ */
// Kontrol preferensi notifikasi dipakai di dua tempat: dialog notifikasi dan
// halaman Pengaturan, sehingga keduanya disamakan dari satu sumber data.
const NOTIFICATION_TOGGLE_FIELDS = [
  {
    key: "prayer",
    label: "Pengingat waktu shalat",
    selectors: ["#notifPrefPrayer", "#settingsPrefPrayer"],
  },
  {
    key: "dzikir",
    label: "Pengingat dzikir pagi & petang",
    selectors: ["#notifPrefDzikir", "#settingsPrefDzikir"],
  },
  {
    key: "artikel",
    label: "Pengingat artikel islami",
    selectors: ["#notifPrefArtikel", "#settingsPrefArtikel"],
  },
];
const NOTIFICATION_LEAD_FIELDS = ["#notifLeadMinutes", "#settingsLeadMinutes"];
const NOTIFICATION_IQAMAH_FIELDS = ["#notifIqamah", "#settingsIqamah"];
const PRAYER_PICK_CONTAINERS = ["#notifPrayerTimes", "#settingsPrayerTimes"];
const LOCAL_PROGRESS_PREFIXES = [
  "islamku:done:",
  "islamku:counter:",
  "islamku:streak",
  "islamku:notified:",
  "islamku:surat:",
  "islamku:tafsir:",
  "islamku:ayat-harian:",
];

// Checkbox pilihan waktu shalat dibangun dari PRAYER_ORDER agar konsisten.
function buildPrayerPickControls() {
  PRAYER_PICK_CONTAINERS.forEach((selector) => {
    const container = document.querySelector(selector);
    if (!container || container.dataset.built) return;
    container.innerHTML = PRAYER_ORDER.map(
      (key) => `
      <label class="prayer-pick" data-prayer-row="${key}">
        <input type="checkbox" data-prayer="${key}" />
        <span>${PRAYER_ICON[key]} ${PRAYER_LABEL[key]}</span>
      </label>`,
    ).join("");
    container.dataset.built = "1";
  });
}

function syncPrayerPickControls(prefs) {
  PRAYER_PICK_CONTAINERS.forEach((selector) => {
    const container = document.querySelector(selector);
    if (!container) return;
    PRAYER_ORDER.forEach((key) => {
      const input = container.querySelector(`input[data-prayer="${key}"]`);
      const row = container.querySelector(`[data-prayer-row="${key}"]`);
      const active = prefs.prayers[key] !== false;
      if (input) {
        input.checked = active;
        input.disabled = !prefs.prayer;
      }
      if (row) row.classList.toggle("is-active", active);
    });
  });
}

function syncNotificationPreferenceInputs() {
  const prefs = loadNotificationPrefs();
  NOTIFICATION_TOGGLE_FIELDS.forEach(({ key, selectors }) => {
    selectors.forEach((selector) => {
      const input = document.querySelector(selector);
      if (input) input.checked = Boolean(prefs[key]);
    });
  });
  NOTIFICATION_LEAD_FIELDS.forEach((selector) => {
    const select = document.querySelector(selector);
    if (!select) return;
    select.value = String(prefs.leadMinutes);
    select.disabled = !prefs.prayer;
  });
  NOTIFICATION_IQAMAH_FIELDS.forEach((selector) => {
    const select = document.querySelector(selector);
    if (!select) return;
    select.value = String(prefs.iqamahMinutes);
    select.disabled = !prefs.prayer;
  });
  buildPrayerPickControls();
  syncPrayerPickControls(prefs);
}

function setPreferenceSyncStatus(stateName, message) {
  const sync = document.querySelector("#settingsSyncStatus");
  if (!sync) return;
  sync.dataset.state = stateName;
  sync.textContent = message;
}

let preferenceSyncInFlight = false;

async function persistUserPreferences() {
  if (!state.currentUser) {
    setPreferenceSyncStatus("local", "Tersimpan di perangkat ini");
    return false;
  }
  if (preferenceSyncInFlight) return false;
  preferenceSyncInFlight = true;
  setPreferenceSyncStatus("syncing", "Menyimpan ke akun…");
  try {
    const payload = await apiRequest("/preferences", {
      method: "PUT",
      body: JSON.stringify(loadUserPrefs()),
    });
    if (payload.preferences)
      savePersistent(USER_PREFS_KEY, normalizeUserPrefs(payload.preferences));
    setPreferenceSyncStatus("account", "Tersimpan di akunmu");
    return true;
  } catch (error) {
    setPreferenceSyncStatus("error", "Gagal menyimpan ke akun");
    showToast(
      "Preferensi tersimpan di perangkat, tetapi gagal dikirim ke akun.",
    );
    return false;
  } finally {
    preferenceSyncInFlight = false;
  }
}

// Setelah masuk, preferensi akun menjadi acuan; akun yang belum punya
// preferensi menerima pengaturan dari perangkat ini sebagai titik awal.
async function syncPreferencesFromServer() {
  if (!state.currentUser) return;
  try {
    const payload = await apiRequest("/preferences");
    if (payload.preferences) {
      savePersistent(USER_PREFS_KEY, normalizeUserPrefs(payload.preferences));
      setPreferenceSyncStatus("account", "Tersimpan di akunmu");
    } else {
      await persistUserPreferences();
    }
  } catch (error) {
    setPreferenceSyncStatus("local", "Tersimpan di perangkat ini");
  }
  applyUserPreferences();
  updateNotificationUI();
  renderSettingsPage();
}

/* Halaman Pengaturan preferensi: merender status akun, notifikasi, tampilan,
   dan metode waktu shalat dari satu sumber data preferensi. */
function renderSettingsPage() {
  const prefs = loadUserPrefs();
  const permission = getNotificationPermission();
  const copy = notificationCopy(permission);
  const accountName = document.querySelector("#settingsAccountName");
  if (!accountName) return;

  accountName.textContent = state.currentUser
    ? state.currentUser.name
    : "Akun tamu";
  document.querySelector("#settingsAccountEmail").textContent =
    state.currentUser
      ? state.currentUser.email
      : "Masuk untuk menyinkronkan preferensi ke semua perangkat.";
  const accountBadge = document.querySelector("#settingsAccountBadge");
  accountBadge.textContent = state.currentUser ? "Masuk" : "Tamu";
  accountBadge.dataset.state = state.currentUser ? "active" : "guest";
  document.querySelector("#settingsAccountButton").textContent =
    state.currentUser ? "Keluar dari akun" : "Masuk / Daftar";
  setPreferenceSyncStatus(
    state.currentUser ? "account" : "local",
    state.currentUser ? "Tersimpan di akunmu" : "Tersimpan di perangkat ini",
  );

  const badge = document.querySelector("#settingsNotifBadge");
  badge.textContent = copy.label;
  badge.dataset.state = permission;
  document.querySelector("#settingsNotifHint").textContent = copy.hint;
  document
    .querySelector("#settingsEnableNotif")
    .classList.toggle("is-hidden", permission !== "default");
  document.querySelector("#settingsTestNotif").disabled =
    permission !== "granted";

  document.querySelector("#settingsReadingScale").value =
    prefs.display.readingScale;
  document.querySelector("#settingsAsrSchool").value = prefs.ibadah.asrSchool;
  syncNotificationPreferenceInputs();
  renderNextReminderInfo();
}

function clearLocalProgress() {
  let removed = 0;
  try {
    const keys = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (
        key &&
        LOCAL_PROGRESS_PREFIXES.some((prefix) => key.startsWith(prefix))
      )
        keys.push(key);
    }
    keys.forEach((key) => {
      localStorage.removeItem(key);
      removed += 1;
    });
  } catch (error) {
    /* localStorage tidak tersedia — tidak ada yang perlu dihapus */
  }
  return removed;
}

let resetConfirmTimer;

function initUserPreferenceControls() {
  document
    .querySelector("#accountMenuSettings")
    ?.addEventListener("click", () => {
      document.querySelector("#accountMenu").classList.add("is-hidden");
      navigateTo("pengaturan");
    });

  document
    .querySelector("#settingsAccountButton")
    ?.addEventListener("click", handleAccountAction);
  document
    .querySelector("#settingsEnableNotif")
    ?.addEventListener("click", () => requestNotificationPermission());
  document
    .querySelector("#settingsTestNotif")
    ?.addEventListener("click", sendTestNotification);

  document
    .querySelector("#settingsReadingScale")
    ?.addEventListener("change", (event) => {
      const prefs = saveUserPrefs({
        display: { readingScale: event.target.value },
      });
      applyUserPreferences();
      persistUserPreferences();
      showToast(
        prefs.display.readingScale === "large"
          ? "Mode majelis aktif untuk semua bacaan."
          : "Ukuran teks bacaan kembali normal.",
      );
    });

  document
    .querySelector("#settingsAsrSchool")
    ?.addEventListener("change", (event) => {
      const prefs = saveUserPrefs({
        ibadah: { asrSchool: event.target.value },
      });
      persistUserPreferences();
      const label = prefs.ibadah.asrSchool === "hanafi" ? "Hanafi" : "Standar";
      if (state.location) {
        refreshPrayerTimes();
        showToast(`Mazhab Ashar: ${label}. Jadwal shalat dimuat ulang.`);
      } else {
        showToast(
          `Mazhab Ashar: ${label}. Atur lokasi di halaman Jadwal Shalat.`,
        );
      }
    });

  document
    .querySelector("#settingsResetLocal")
    ?.addEventListener("click", (event) => {
      const button = event.currentTarget;
      if (button.dataset.confirm !== "1") {
        button.dataset.confirm = "1";
        button.textContent = "Klik lagi untuk konfirmasi";
        clearTimeout(resetConfirmTimer);
        resetConfirmTimer = setTimeout(() => {
          button.dataset.confirm = "0";
          button.textContent = "Reset progres lokal";
        }, 4000);
        return;
      }
      clearTimeout(resetConfirmTimer);
      button.dataset.confirm = "0";
      button.textContent = "Reset progres lokal";
      const removed = clearLocalProgress();
      const streakEl = document.querySelector("#streakDays");
      if (streakEl) streakEl.textContent = "0 hari";
      if (state.timings) renderBerandaSchedule(state.timings);
      else renderPrayerStatus();
      showToast(`Progres lokal dibersihkan (${removed} data).`);
    });
}

function openAuth(mode = "login", required = false) {
  authMode = mode;
  state.authRequired = required;
  const overlay = document.querySelector("#authOverlay");
  document.querySelector("#authTitle").textContent =
    mode === "login" ? "Masuk ke akunmu" : "Buat akun baru";
  document.querySelector("#authCopy").textContent =
    mode === "login"
      ? "Simpan posisi terakhir membaca Al-Qur'an di perangkat ini."
      : "Buat akun lokal untuk menyimpan progres bacaanmu.";
  document
    .querySelector("#authNameField")
    .classList.toggle("is-hidden", mode === "login");
  document.querySelector("#authPassword").autocomplete =
    mode === "login" ? "current-password" : "new-password";
  document.querySelector("#authSubmit").textContent =
    mode === "login" ? "Masuk" : "Daftar";
  document.querySelector("#authSwitch").textContent =
    mode === "login" ? "Belum punya akun? Daftar" : "Sudah punya akun? Masuk";
  document.querySelector("#authClose").classList.toggle("is-hidden", required);
  document.querySelector("#authError").textContent = "";
  overlay.classList.remove("is-hidden");
  document.querySelector("#authEmail").focus();
}

function closeAuth() {
  if (state.authRequired) {
    showToast("Silakan masuk atau daftar untuk membuka beranda.");
    return;
  }
  document.querySelector("#authOverlay").classList.add("is-hidden");
}

function renderLastReadBanner() {
  const banner = document.querySelector("#quranLastRead");
  if (!banner) return;
  const bookmark = getCurrentBookmark();
  const label = banner.querySelector("span:nth-child(2)");
  const hint = banner.querySelector("#quranLastReadHint");
  if (bookmark) {
    banner.classList.remove("is-hidden");
    label.textContent = `${bookmark.namaLatin} — Ayat ${bookmark.ayat}`;
    hint.textContent = state.currentUser
      ? `Untuk ${state.currentUser.name}`
      : "";
    banner.onclick = () => openSurat(bookmark.nomor, bookmark.ayat);
  } else {
    banner.classList.add("is-hidden");
    banner.onclick = null;
  }
}

async function submitAuth(event) {
  event.preventDefault();
  const errorEl = document.querySelector("#authError");
  const email = document.querySelector("#authEmail").value.trim().toLowerCase();
  const password = document.querySelector("#authPassword").value;
  const name = document.querySelector("#authName").value.trim();
  try {
    const endpoint = authMode === "login" ? "/auth/login" : "/auth/register";
    const payload = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    state.currentUser = payload.user;
    state.currentBookmark = payload.bookmark || null;
    saveLocal("islamku:session", { token: payload.token, user: payload.user });
    saveLocal("islamku:current-bookmark", state.currentBookmark);
    state.authRequired = false;
    document.querySelector("#authClose").classList.remove("is-hidden");
    updateAccountUI();
    syncPreferencesFromServer();
    closeAuth();
    document.querySelector("#authForm").reset();
    if (state.pendingPage) {
      const nextPage = state.pendingPage;
      state.pendingPage = null;
      navigateTo(nextPage);
    }
    showToast(
      authMode === "login" ? "Berhasil masuk." : "Akun berhasil dibuat.",
    );
  } catch (error) {
    errorEl.textContent = error.message;
  }
}

document.querySelector("#profileButton").addEventListener("click", () => {
  const menu = document.querySelector("#accountMenu");
  menu.classList.toggle("is-hidden");
  document
    .querySelector("#profileButton")
    .setAttribute(
      "aria-expanded",
      String(!menu.classList.contains("is-hidden")),
    );
});
function handleAccountAction() {
  document.querySelector("#accountMenu").classList.add("is-hidden");
  if (state.currentUser) {
    apiRequest("/auth/logout", { method: "POST" }).catch(() => {});
    state.currentUser = null;
    state.currentBookmark = null;
    saveLocal("islamku:session", null);
    saveLocal("islamku:current-bookmark", null);
    updateAccountUI();
    applyUserPreferences();
    renderSettingsPage();
    showToast("Kamu sudah keluar dari akun.");
  } else openAuth("login");
}
document
  .querySelector("#accountMenuButton")
  .addEventListener("click", handleAccountAction);
document.querySelector("#authForm").addEventListener("submit", submitAuth);
document.querySelector("#togglePassword").addEventListener("click", () => {
  const passwordInput = document.querySelector("#authPassword");
  const visible = passwordInput.type === "text";
  passwordInput.type = visible ? "password" : "text";
  document.querySelector("#togglePassword").textContent = visible
    ? "Lihat"
    : "Sembunyikan";
  document
    .querySelector("#togglePassword")
    .setAttribute(
      "aria-label",
      visible ? "Lihat kata sandi" : "Sembunyikan kata sandi",
    );
});
document
  .querySelector("#authSwitch")
  .addEventListener("click", () =>
    openAuth(authMode === "login" ? "register" : "login"),
  );
document.querySelector("#authClose").addEventListener("click", closeAuth);
document.querySelector("#authOverlay").addEventListener("click", (event) => {
  if (event.target.id === "authOverlay") closeAuth();
});
document.addEventListener("click", (event) => {
  if (!event.target.closest(".topbar-actions"))
    document.querySelector("#accountMenu").classList.add("is-hidden");
});

async function hydrateSession() {
  if (!state.currentUser) return;
  try {
    const payload = await apiRequest("/auth/me");
    state.currentUser = payload.user;
    state.currentBookmark = payload.bookmark || null;
    saveLocal("islamku:session", {
      ...loadLocal("islamku:session", {}),
      user: payload.user,
    });
    saveLocal("islamku:current-bookmark", state.currentBookmark);
    updateAccountUI();
    await syncPreferencesFromServer();
  } catch (error) {
    state.currentUser = null;
    state.currentBookmark = null;
    saveLocal("islamku:session", null);
    saveLocal("islamku:current-bookmark", null);
    updateAccountUI();
  }
}

updateAccountUI();
hydrateSession();

/* ------------------------------ 3) LOKASI ------------------------------ */
function requestGeolocation() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation tidak didukung perangkat ini"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: 10000 },
    );
  });
}

// Geocoding kota manual — pakai Open-Meteo Geocoding API (gratis, tanpa API key)
async function searchCity(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
    query,
  )}&count=6&language=id&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal mencari kota");
  const json = await res.json();
  return (json.results || []).map((r) => ({
    lat: r.latitude,
    lon: r.longitude,
    label: [r.name, r.admin1, r.country].filter(Boolean).join(", "),
  }));
}

async function setLocation(loc) {
  state.location = loc;
  saveLocal("islamku:location", loc);
  document
    .querySelectorAll("[data-location-name]")
    .forEach((el) => (el.textContent = loc.label.split(",")[0]));
  document
    .querySelectorAll("[data-location-full]")
    .forEach((el) => (el.textContent = loc.label));
  await refreshPrayerTimes();
  if (state.kiblatInited) renderQiblaDegree();
}

async function ensureLocation() {
  if (state.location) return state.location;
  try {
    const coords = await requestGeolocation();
    const loc = { ...coords, label: "Lokasi Anda saat ini" };
    // Reverse-geocode ringan: cukup pakai label generik agar tidak menambah
    // dependensi API baru; pengguna bisa ganti manual lewat pencarian kota.
    await setLocation(loc);
    return loc;
  } catch (e) {
    showToast("GPS HP perlu HTTPS. Buka Jadwal Shalat lalu pilih kota manual.");
    throw e;
  }
}

/* ------------------------------ 4) JADWAL SHALAT (API Aladhan) ------------------------------ */
// Aladhan API — method 20 = Kementerian Agama Republik Indonesia (Kemenag RI)
async function fetchTimings(lat, lon, date = new Date()) {
  const dateStr = `${pad2(date.getDate())}-${pad2(date.getMonth() + 1)}-${date.getFullYear()}`;
  // method=20 → Kemenag RI; school=0 standar (Syafi'i dkk), school=1 Hanafi.
  const school = loadUserPrefs().ibadah.asrSchool === "hanafi" ? 1 : 0;
  const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=20&school=${school}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal memuat jadwal shalat");
  const json = await res.json();
  return json.data; // { timings: {...}, date: {...} }
}

function cleanTime(t) {
  // Aladhan mengembalikan "04:32 (WIB)" — ambil jam:menit saja
  return (t || "").split(" ")[0];
}

async function refreshPrayerTimes() {
  if (!state.location) return;
  try {
    const data = await fetchTimings(state.location.lat, state.location.lon);
    state.timings = data;
    renderBerandaSchedule(data);
    if (state.jadwalInited) renderJadwalPage(data);
  } catch (e) {
    showToast("Gagal memuat jadwal shalat. Periksa koneksi internet.");
  }
}

function getNextPrayer(timings) {
  const now = new Date();
  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  for (const key of PRAYER_ORDER) {
    const [h, m] = cleanTime(timings[key]).split(":").map(Number);
    if (h * 60 + m > nowMinutes)
      return { key, minutesLeft: h * 60 + m - nowMinutes, h, m };
  }
  // Semua waktu hari ini sudah lewat → shalat berikutnya adalah Subuh besok
  const [h, m] = cleanTime(timings.Fajr).split(":").map(Number);
  const minutesLeft = 24 * 60 - nowMinutes + h * 60 + m;
  return { key: "Fajr", minutesLeft, h, m, tomorrow: true };
}

let countdownTimer;
function startCountdown(timings) {
  clearInterval(countdownTimer);
  const countdownEl = document.querySelector("#countdown");
  const heroTitle = document.querySelector("#heroPrayerName");
  const heroTime = document.querySelector("#heroPrayerTime");
  function tick() {
    const next = getNextPrayer(timings);
    heroTitle.textContent = PRAYER_LABEL[next.key];
    heroTime.innerHTML = `${cleanTime(timings[next.key])} <span>WIB</span>`;
    let secs = Math.max(0, next.minutesLeft * 60 - new Date().getSeconds());
    const hh = pad2(Math.floor(secs / 3600));
    const mm = pad2(Math.floor((secs % 3600) / 60));
    const ss = pad2(Math.floor(secs % 60));
    countdownEl.textContent = `${hh}:${mm}:${ss}`;
    markNextInList(next.key);
  }
  tick();
  countdownTimer = setInterval(tick, 1000);
}

function markNextInList(nextKey) {
  document.querySelectorAll("#prayerList .prayer-item").forEach((item) => {
    item.classList.toggle(
      "next",
      item.dataset.prayer === nextKey && !item.classList.contains("done"),
    );
  });
}

function getPrayerDoneMap() {
  return loadLocal(`islamku:done:${todayKey()}`, {});
}

function savePrayerDoneMap(doneMap) {
  saveLocal(`islamku:done:${todayKey()}`, doneMap);
}

/* Menandai satu waktu shalat selesai/batal — dipakai tombol centang di Beranda
   maupun tombol "Tandai sudah shalat" pada notifikasi. */
function setPrayerDone(key, isDone) {
  const doneMap = getPrayerDoneMap();
  doneMap[key] = isDone;
  savePrayerDoneMap(doneMap);

  const item = document.querySelector(
    `#prayerList .prayer-item[data-prayer="${key}"]`,
  );
  if (item) {
    item.classList.toggle("done", isDone);
    const button = item.querySelector(".check-button");
    if (button) button.textContent = isDone ? "✓" : "○";
    const status = item.querySelector(".prayer-name span");
    if (status) status.textContent = isDone ? "Selesai" : "";
  }

  updateStreak(doneMap);
  renderPrayerStatus();
  renderNextReminderInfo();
  return doneMap;
}

function renderPrayerStatus() {
  const card = document.querySelector("#prayerStatusCard");
  if (!card) return;

  const doneMap = getPrayerDoneMap();
  const total = PRAYER_ORDER.length;
  const completed = PRAYER_ORDER.filter((key) => !!doneMap[key]).length;
  const percent = Math.round((completed / total) * 100);
  const remaining = total - completed;

  card
    .querySelector(".status-ring")
    .style.setProperty("--progress", `${percent}%`);
  card.querySelector("#prayerStatusPercent").textContent = `${percent}%`;
  card.querySelector("#prayerStatusText").textContent =
    completed === total
      ? "Semua shalat hari ini sudah selesai."
      : remaining === total
        ? "Belum ada shalat yang ditandai."
        : `${remaining} shalat belum ditandai.`;
  card.querySelector("#prayerStatusMeta").textContent =
    `${completed}/${total} shalat selesai`;
  card.classList.toggle("is-complete", completed === total);
}

function renderBerandaSchedule(data) {
  const timings = data.timings;
  const list = document.querySelector("#prayerList");
  const doneToday = getPrayerDoneMap();
  list.innerHTML = PRAYER_ORDER.map((key) => {
    const isDone = !!doneToday[key];
    return `
      <div class="prayer-item ${isDone ? "done" : ""}" data-prayer="${key}">
        <div class="prayer-symbol">${PRAYER_ICON[key]}</div>
        <div class="prayer-name">
          <strong>${PRAYER_LABEL[key]}</strong><span>${isDone ? "Selesai" : ""}</span>
        </div>
        <time>${cleanTime(timings[key])}</time>
        <button class="check-button" aria-label="Tandai ${PRAYER_LABEL[key]} selesai">${isDone ? "✓" : "○"}</button>
      </div>`;
  }).join("");

  list.querySelectorAll(".check-button").forEach((button) => {
    button.addEventListener("click", () => {
      const item = button.closest(".prayer-item");
      const key = item.dataset.prayer;
      const isDone = !item.classList.contains("done");
      setPrayerDone(key, isDone);
      showToast(
        isDone
          ? `${PRAYER_LABEL[key]} ditandai selesai.`
          : `${PRAYER_LABEL[key]} dikembalikan ke daftar.`,
      );
    });
  });

  // Tanggal Hijriah dari data Aladhan
  const hijri = data.date.hijri;
  const eyebrow = document.querySelector("#hijriDate");
  if (eyebrow)
    eyebrow.textContent = `${hijri.weekday.id || hijri.weekday.en}, ${hijri.day} ${hijri.month.en} ${hijri.year} H`;

  renderPrayerStatus();
  startCountdown(timings);
  // Jadwal terbaru dipakai penjadwal pengingat notifikasi.
  updateNotificationUI();
}

function updateStreak(doneMap) {
  const allDone = PRAYER_ORDER.every((k) => doneMap[k]);
  if (!allDone) return;
  const streak = loadLocal("islamku:streak", { days: 0, lastDate: null });
  if (streak.lastDate === todayKey()) return; // sudah dihitung hari ini
  const yesterday = new Date(Date.now() - 86400000);
  const yKey = `${yesterday.getFullYear()}-${pad2(yesterday.getMonth() + 1)}-${pad2(yesterday.getDate())}`;
  streak.days = streak.lastDate === yKey ? streak.days + 1 : 1;
  streak.lastDate = todayKey();
  saveLocal("islamku:streak", streak);
  const streakEl = document.querySelector("#streakDays");
  if (streakEl) streakEl.textContent = `${streak.days} hari`;
  renderWeekDots();
}

function initJadwalPage() {
  state.jadwalInited = true;
  document
    .querySelector("#jadwalUseGps")
    .addEventListener("click", async () => {
      showToast("Mengambil lokasi Anda…");
      try {
        await ensureLocation();
        showToast("Lokasi diperbarui.");
      } catch (e) {
        /* pesan error sudah ditampilkan di ensureLocation */
      }
    });
  const citySearch = document.querySelector("#jadwalCitySearch");
  const cityResults = document.querySelector("#jadwalCityResults");
  let debounceTimer;
  citySearch.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    const q = citySearch.value.trim();
    if (q.length < 3) {
      cityResults.innerHTML = "";
      return;
    }
    debounceTimer = setTimeout(async () => {
      try {
        const results = await searchCity(q);
        cityResults.innerHTML = results
          .map((r, i) => `<li data-idx="${i}">${r.label}</li>`)
          .join("");
        cityResults.dataset.results = JSON.stringify(results);
      } catch (e) {
        cityResults.innerHTML = `<li class="muted-item">Gagal mencari kota</li>`;
      }
    }, 400);
  });
  cityResults.addEventListener("click", (e) => {
    const li = e.target.closest("li[data-idx]");
    if (!li) return;
    const results = JSON.parse(cityResults.dataset.results || "[]");
    const chosen = results[Number(li.dataset.idx)];
    if (chosen) {
      setLocation(chosen);
      cityResults.innerHTML = "";
      citySearch.value = "";
    }
  });

  if (state.timings) renderJadwalPage(state.timings);
}

function renderJadwalPage(data) {
  const timings = data.timings;
  const container = document.querySelector("#jadwalFullList");
  const ALL_KEYS = [
    "Imsak",
    "Fajr",
    "Sunrise",
    "Dhuhr",
    "Asr",
    "Maghrib",
    "Isha",
  ];
  const LABEL_ALL = {
    Imsak: "Imsak",
    Fajr: "Subuh",
    Sunrise: "Terbit",
    Dhuhr: "Dzuhur",
    Asr: "Ashar",
    Maghrib: "Maghrib",
    Isha: "Isya",
  };
  container.innerHTML = ALL_KEYS.map(
    (key) => `
      <div class="prayer-item">
        <div class="prayer-symbol">${PRAYER_ICON[key] || "•"}</div>
        <div class="prayer-name"><strong>${LABEL_ALL[key]}</strong><span></span></div>
        <time>${cleanTime(timings[key])}</time>
      </div>`,
  ).join("");
  const hijri = data.date.hijri;
  document.querySelector("#jadwalHijri").textContent =
    `${hijri.day} ${hijri.month.en} ${hijri.year} H`;
  document.querySelector("#jadwalMasehi").textContent = data.date.readable;
  const asrLabel =
    loadUserPrefs().ibadah.asrSchool === "hanafi" ? "Hanafi" : "Standar";
  document.querySelector("#jadwalMethod").textContent =
    `${data.meta.method.name} · Ashar ${asrLabel}`;
}

/* ------------------------------ 5) KOMPAS KIBLAT ------------------------------ */
const KAABA = { lat: 21.4225, lon: 39.8262 };

function toRad(deg) {
  return (deg * Math.PI) / 180;
}
function toDeg(rad) {
  return (rad * 180) / Math.PI;
}
function calcQiblaBearing(lat, lon) {
  const phiK = toRad(KAABA.lat);
  const lambdaK = toRad(KAABA.lon);
  const phi = toRad(lat);
  const lambda = toRad(lon);
  const psi = toDeg(
    Math.atan2(
      Math.sin(lambdaK - lambda),
      Math.cos(phi) * Math.tan(phiK) -
        Math.sin(phi) * Math.cos(lambdaK - lambda),
    ),
  );
  return (psi + 360) % 360;
}

function compassLabel(deg) {
  const dirs = [
    "Utara",
    "Timur Laut",
    "Timur",
    "Tenggara",
    "Selatan",
    "Barat Daya",
    "Barat",
    "Barat Laut",
  ];
  return dirs[Math.round(deg / 45) % 8];
}

function initKiblatPage() {
  state.kiblatInited = true;
  document
    .querySelector("#kiblatUseGps")
    .addEventListener("click", async () => {
      showToast("Mengambil lokasi Anda…");
      try {
        await ensureLocation();
        renderQiblaDegree();
      } catch (e) {
        /* pesan error sudah ditampilkan */
      }
    });
  document
    .querySelector("#kiblatEnableSensor")
    .addEventListener("click", enableCompassSensor);
  if (state.location) renderQiblaDegree();
}

function renderQiblaDegree() {
  if (!state.location) return;
  const bearing = calcQiblaBearing(state.location.lat, state.location.lon);
  state.qiblaBearing = bearing;
  document
    .querySelectorAll("[data-qibla-degree]")
    .forEach((el) => (el.textContent = `${Math.round(bearing)}°`));
  document
    .querySelectorAll("[data-qibla-note]")
    .forEach((el) => (el.textContent = `Menghadap ${compassLabel(bearing)}`));
  // Tanpa data sensor, jarum kompas ditampilkan relatif terhadap Utara peta
  // (asumsi perangkat tidak diputar) — akan disesuaikan otomatis begitu
  // sensor orientasi aktif (lihat enableCompassSensor).
  if (!state.compassActive) {
    document
      .querySelectorAll(".needle")
      .forEach((n) => (n.style.transform = `rotate(${bearing}deg)`));
  }
}

async function enableCompassSensor() {
  const btn = document.querySelector("#kiblatEnableSensor");
  const supportsPermissionApi =
    typeof DeviceOrientationEvent !== "undefined" &&
    typeof DeviceOrientationEvent.requestPermission === "function";
  try {
    if (supportsPermissionApi) {
      const res = await DeviceOrientationEvent.requestPermission();
      if (res !== "granted") {
        showToast("Izin sensor kompas ditolak.");
        return;
      }
    }
    window.addEventListener(
      "deviceorientationabsolute",
      handleOrientation,
      true,
    );
    window.addEventListener("deviceorientation", handleOrientation, true);
    state.compassActive = true;
    btn.textContent = "Kompas aktif";
    btn.disabled = true;
    showToast("Kompas aktif — putar perangkat menghadap kiblat.");
  } catch (e) {
    showToast(
      "Kompas perlu HTTPS. Atur kota di Jadwal Shalat, lalu gunakan derajat kiblat sebagai acuan.",
    );
  }
}

function handleOrientation(event) {
  if (state.qiblaBearing === undefined) return;
  // alpha = arah hadap perangkat relatif terhadap Utara (0-360)
  let heading =
    event.webkitCompassHeading /* iOS Safari */ ??
    (event.alpha !== null ? 360 - event.alpha : null);
  if (heading === null || Number.isNaN(heading)) return;
  const relative = (state.qiblaBearing - heading + 360) % 360;
  document
    .querySelectorAll(".needle")
    .forEach((n) => (n.style.transform = `rotate(${relative}deg)`));
}

/* ------------------------------ 6) AL-QUR'AN (API EQuran.id) ------------------------------ */
const QURAN_API = "https://equran.id/api/v2";

async function fetchWithTimeout(url, ms = 10000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (e) {
    clearTimeout(timer);
    throw e;
  }
}

async function getDaftarSurat() {
  const cached = loadLocal("islamku:surat-list", null);
  if (cached) return cached;
  const json = await fetchWithTimeout(`${QURAN_API}/surat`);
  saveLocal("islamku:surat-list", json.data);
  return json.data;
}

async function getDetailSurat(nomor) {
  const cacheKey = `islamku:surat:${nomor}`;
  const cached = loadLocal(cacheKey, null);
  if (cached) return cached;
  const json = await fetchWithTimeout(`${QURAN_API}/surat/${nomor}`);
  saveLocal(cacheKey, json.data);
  return json.data;
}

async function getTafsirSurat(nomor) {
  const cacheKey = `islamku:tafsir:${nomor}`;
  const cached = loadLocal(cacheKey, null);
  if (cached) return cached;
  const json = await fetchWithTimeout(`${QURAN_API}/tafsir/${nomor}`);
  saveLocal(cacheKey, json.data.tafsir || []);
  return json.data.tafsir || [];
}

function initQuranPage() {
  state.quranInited = true;
  document.querySelector("#quranSearch").addEventListener("input", (e) => {
    renderSuratList(e.target.value.trim().toLowerCase());
  });
  document.querySelector("#quranBackToList").addEventListener("click", () => {
    document.querySelector("#quranListView").classList.remove("is-hidden");
    document.querySelector("#quranReaderView").classList.add("is-hidden");
  });
  loadSuratListIntoUI();

  renderLastReadBanner();
}

let suratListCache = [];
async function loadSuratListIntoUI() {
  const container = document.querySelector("#suratList");
  container.innerHTML = `<p class="muted">Memuat daftar surat…</p>`;
  try {
    suratListCache = await getDaftarSurat();
    renderSuratList("");
  } catch (e) {
    container.innerHTML = `<p class="muted">Gagal memuat daftar surat. Periksa koneksi internet lalu <button class="link-button" id="retrySurat">coba lagi</button>.</p>`;
    document
      .querySelector("#retrySurat")
      ?.addEventListener("click", loadSuratListIntoUI);
  }
}

function renderSuratList(query) {
  const container = document.querySelector("#suratList");
  const filtered = suratListCache.filter(
    (s) =>
      !query ||
      s.namaLatin.toLowerCase().includes(query) ||
      s.arti.toLowerCase().includes(query) ||
      String(s.nomor) === query,
  );
  if (!filtered.length) {
    container.innerHTML = `<p class="muted">Surat tidak ditemukan.</p>`;
    return;
  }
  container.innerHTML = filtered
    .map(
      (s) => `
      <button class="surat-row" data-nomor="${s.nomor}">
        <span class="surat-number">${s.nomor}</span>
        <span class="surat-info">
          <strong>${s.namaLatin}</strong>
          <small>${s.arti} • ${s.jumlahAyat} ayat • ${s.tempatTurun === "mekah" ? "Makkiyah" : "Madaniyah"}</small>
        </span>
        <span class="surat-arabic">${s.nama}</span>
      </button>`,
    )
    .join("");
  container.querySelectorAll(".surat-row").forEach((btn) => {
    btn.addEventListener("click", () => openSurat(Number(btn.dataset.nomor)));
  });
}

async function openSurat(nomor, scrollToAyat) {
  document.querySelector("#quranListView").classList.add("is-hidden");
  const readerView = document.querySelector("#quranReaderView");
  readerView.classList.remove("is-hidden");
  readerView.querySelector("#suratAyatList").innerHTML =
    `<p class="muted">Memuat surat…</p>`;
  try {
    const surat = await getDetailSurat(nomor);
    document.querySelector("#suratTitle").textContent =
      `${surat.namaLatin} · ${surat.arti}`;
    document.querySelector("#suratMeta").textContent =
      `${surat.jumlahAyat} ayat • ${surat.tempatTurun === "mekah" ? "Makkiyah" : "Madaniyah"}`;
    const audioFull = surat.audioFull
      ? Object.values(surat.audioFull)[0]
      : null;
    const fullAudioEl = document.querySelector("#suratFullAudio");
    if (audioFull) {
      fullAudioEl.src = audioFull;
      fullAudioEl.classList.remove("is-hidden");
    } else {
      fullAudioEl.classList.add("is-hidden");
    }

    const list = document.querySelector("#suratAyatList");
    list.innerHTML = surat.ayat
      .map((ayat) => {
        const audioUrl = ayat.audio ? Object.values(ayat.audio)[0] : null;
        return `
        <div class="ayat-item" id="ayat-${ayat.nomorAyat}" data-ayat="${ayat.nomorAyat}">
          <div class="ayat-item-head">
            <span class="ayat-number-badge">${ayat.nomorAyat}</span>
            <div class="ayat-item-actions">
              ${audioUrl ? `<button class="mini-button ayat-play" data-audio="${audioUrl}">▶ Audio</button>` : ""}
              <button class="mini-button ayat-tafsir-toggle" data-nomor-ayat="${ayat.nomorAyat}">Tafsir</button>
              <button class="mini-button ayat-bookmark" data-nomor="${nomor}" data-ayat="${ayat.nomorAyat}" data-nama="${surat.namaLatin}">${getCurrentBookmark()?.nomor === nomor && getCurrentBookmark()?.ayat === ayat.nomorAyat ? "✓ Terakhir dibaca" : "Tandai terakhir dibaca"}</button>
            </div>
          </div>
          <p class="arabic ayat-arabic">${ayat.teksArab} <span class="ayat-marker">﴿${ayat.nomorAyat}﴾</span></p>
          <p class="ayat-latin">${ayat.teksLatin || ""}</p>
          <p class="translation ayat-translation">${ayat.teksIndonesia}</p>
          <div class="ayat-tafsir is-hidden" data-tafsir-panel="${ayat.nomorAyat}"></div>
        </div>`;
      })
      .join("");

    list.querySelectorAll(".ayat-play").forEach((btn) => {
      btn.addEventListener("click", () => {
        document
          .querySelectorAll("audio.ayat-audio-player")
          .forEach((a) => a.remove());
        const audio = new Audio(btn.dataset.audio);
        audio.className = "ayat-audio-player";
        audio.play();
      });
    });
    list.querySelectorAll(".ayat-bookmark").forEach((btn) => {
      btn.addEventListener("click", async () => {
        if (!state.currentUser) {
          openAuth("login");
          showToast("Masuk terlebih dahulu untuk menyimpan bookmark.");
          return;
        }
        const bookmark = {
          nomor: Number(btn.dataset.nomor),
          ayat: Number(btn.dataset.ayat),
          namaLatin: btn.dataset.nama,
        };
        try {
          const payload = await apiRequest("/bookmark", {
            method: "PUT",
            body: JSON.stringify(bookmark),
          });
          state.currentBookmark = payload.bookmark;
          saveLocal("islamku:current-bookmark", state.currentBookmark);
          list.querySelectorAll(".ayat-bookmark").forEach((item) => {
            item.textContent =
              item === btn ? "✓ Terakhir dibaca" : "Tandai terakhir dibaca";
          });
          renderLastReadBanner();
          showToast(`Ditandai: ${btn.dataset.nama} ayat ${btn.dataset.ayat}`);
        } catch (error) {
          showToast(error.message);
        }
      });
    });
    list.querySelectorAll(".ayat-tafsir-toggle").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const panel = list.querySelector(
          `[data-tafsir-panel="${btn.dataset.nomorAyat}"]`,
        );
        const willOpen = panel.classList.contains("is-hidden");
        panel.classList.toggle("is-hidden");
        if (willOpen && !panel.dataset.loaded) {
          panel.textContent = "Memuat tafsir…";
          try {
            const tafsirList = await getTafsirSurat(nomor);
            const entry = tafsirList.find(
              (t) => t.ayat === Number(btn.dataset.nomorAyat),
            );
            panel.textContent = entry
              ? entry.teks
              : "Tafsir untuk ayat ini belum tersedia.";
            panel.dataset.loaded = "1";
          } catch (e) {
            panel.textContent = "Gagal memuat tafsir. Coba lagi nanti.";
          }
        }
      });
    });

    if (scrollToAyat) {
      const target = document.querySelector(`#ayat-${scrollToAyat}`);
      if (target) target.scrollIntoView({ block: "center" });
    }
  } catch (e) {
    document.querySelector("#suratAyatList").innerHTML =
      `<p class="muted">Gagal memuat surat. Periksa koneksi internet lalu <button class="link-button" id="retryAyat">coba lagi</button>.</p>`;
    document
      .querySelector("#retryAyat")
      ?.addEventListener("click", () => openSurat(nomor, scrollToAyat));
  }
}

/* Ayat harian di Beranda — diambil dari API EQuran.id berdasarkan pilihan
   editorial di content.js (AYAT_PILIHAN), dipilih deterministik per hari. */
async function loadAyatHarian() {
  const pick = AYAT_PILIHAN[epochDay() % AYAT_PILIHAN.length];
  const cacheKey = `islamku:ayat-harian:${todayKey()}`;
  const cached = loadLocal(cacheKey, null);
  const card = document.querySelector("#ayahCard");
  if (cached) {
    renderAyatHarian(cached);
    return;
  }
  try {
    const surat = await getDetailSurat(pick.surat);
    const ayat = surat.ayat.find((a) => a.nomorAyat === pick.ayat);
    const payload = {
      arab: ayat.teksArab,
      terjemahan: ayat.teksIndonesia,
      referensi: `QS. ${surat.namaLatin}: ${pick.ayat}`,
      nomorSurat: pick.surat,
    };
    saveLocal(cacheKey, payload);
    renderAyatHarian(payload);
  } catch (e) {
    card.querySelector(".arabic").textContent = "—";
    card.querySelector(".translation").textContent =
      "Ayat harian belum bisa dimuat. Periksa koneksi internet.";
  }
}
function renderAyatHarian(payload) {
  const card = document.querySelector("#ayahCard");
  card.querySelector(".arabic").textContent = payload.arab;
  card.querySelector(".translation").textContent = `"${payload.terjemahan}"`;
  card.querySelector("small").textContent = payload.referensi;
  card.querySelector(".round-arrow").onclick = () => navigateTo("alquran");
}

/* ------------------------------ 7) TAHLIL / MANAQIB / RATIB / DZIKIR ------------------------------ */
function renderTahlil() {
  state.tahlilInited = true;
  const container = document.querySelector("#tahlilContent");
  const sections = TAHLIL.sections;
  container.innerHTML = sections
    .map(
      (sec) => `
      <div class="reading-section">
        <h3>${sec.heading}</h3>
        ${sec.items
          .map(
            (it) => `
          <div class="reading-item">
            <p class="arabic reading-arabic">${it.ar}</p>
            <p class="ayat-latin">${it.tr}</p>
            <p class="translation">${it.id}</p>
          </div>`,
          )
          .join("")}
      </div>`,
    )
    .join("");
  document.querySelector("#tahlilNote").textContent = TAHLIL.note;
  setupReadingModeToggle("tahlil");
}

function renderManaqib() {
  state.manaqibInited = true;
  const container = document.querySelector("#manaqibContent");
  container.innerHTML = MANAQIB.sections
    .map(
      (sec) => `
      <div class="reading-section">
        <h3>${sec.heading}</h3>
        <p class="manaqib-body">${sec.body}</p>
      </div>`,
    )
    .join("");
  document.querySelector("#manaqibNote").textContent = MANAQIB.note;
  setupReadingModeToggle("manaqib");
}

function setupReadingModeToggle(pageId) {
  const btn = document.querySelector(`#${pageId} .reading-mode-toggle`);
  if (!btn) return;
  btn.setAttribute(
    "aria-pressed",
    String(loadUserPrefs().display.readingScale === "large"),
  );
  btn.onclick = () => {
    const nextScale =
      loadUserPrefs().display.readingScale === "large" ? "normal" : "large";
    saveUserPrefs({ display: { readingScale: nextScale } });
    applyUserPreferences();
    persistUserPreferences();
    renderSettingsPage();
    showToast(
      nextScale === "large" ? "Mode majelis aktif." : "Ukuran teks normal.",
    );
  };
}

/* Counter dzikir/ratib yang bisa dipakai ulang */
function buildCounterItem(item, groupKey, idx) {
  const storageKey = `islamku:counter:${groupKey}:${todayKey()}:${idx}`;
  const saved = loadPersistent(storageKey, 0);
  const target = item.count || 1;
  return `
    <div class="dzikir-item ${saved >= target ? "is-complete" : ""}" data-counter-key="${storageKey}" data-target="${target}">
      <div class="dzikir-item-text">
        <p class="arabic reading-arabic">${item.ar}</p>
        <p class="ayat-latin">${item.tr}</p>
        <p class="translation">${item.id}</p>
      </div>
      <button class="counter-button" type="button">
        <span class="counter-count">${saved}</span><span class="counter-target">/ ${target}</span>
      </button>
    </div>`;
}

function wireCounters(scope) {
  scope.querySelectorAll(".dzikir-item").forEach((row) => {
    const button = row.querySelector(".counter-button");
    const key = row.dataset.counterKey;
    const target = Number(row.dataset.target);
    button.addEventListener("click", () => {
      let count = loadPersistent(key, 0);
      count = count >= target ? 0 : count + 1;
      savePersistent(key, count);
      button.querySelector(".counter-count").textContent = count;
      row.classList.toggle("is-complete", count >= target);
      if (count >= target && navigator.vibrate) navigator.vibrate(80);
    });
  });
}

function renderRatib() {
  state.ratibInited = true;
  const tabsEl = document.querySelector("#ratibTabs");
  const container = document.querySelector("#ratibContent");
  tabsEl.innerHTML = RATIB_VERSIONS.map(
    (ratib, i) =>
      `<button class="dzikir-tab ${i === 0 ? "active" : ""}" data-ratib="${i}">${ratib.title}</button>`,
  ).join("");
  function renderVersion(index) {
    const ratib = RATIB_VERSIONS[index] || RATIB_VERSIONS[0];
    document.querySelector("#ratibTitle").textContent = ratib.title;
    document.querySelector("#ratibSubtitle").textContent = ratib.subtitle;
    container.innerHTML = ratib.items
      .map((it, i) => buildCounterItem(it, `ratib-${index}`, i))
      .join("");
    document.querySelector("#ratibNote").textContent = ratib.note;
    wireCounters(container);
  }
  tabsEl.querySelectorAll(".dzikir-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      tabsEl
        .querySelectorAll(".dzikir-tab")
        .forEach((item) => item.classList.remove("active"));
      tab.classList.add("active");
      renderVersion(Number(tab.dataset.ratib));
    });
  });
  renderVersion(0);
}

function renderDzikir() {
  state.dzikirInited = true;
  const tabsEl = document.querySelector("#dzikirTabs");
  const contentEl = document.querySelector("#dzikirContent");
  tabsEl.innerHTML = DZIKIR.categories
    .map(
      (cat, i) =>
        `<button class="dzikir-tab ${i === 0 ? "active" : ""}" data-cat="${cat.id}">${cat.title}</button>`,
    )
    .join("");

  function renderCategory(catId) {
    const cat =
      DZIKIR.categories.find((c) => c.id === catId) || DZIKIR.categories[0];
    document.querySelector("#dzikirSubtitle").textContent = cat.subtitle;
    contentEl.innerHTML = cat.items
      .map((it, i) => buildCounterItem(it, `dzikir-${cat.id}`, i))
      .join("");
    wireCounters(contentEl);
  }
  tabsEl.querySelectorAll(".dzikir-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      tabsEl
        .querySelectorAll(".dzikir-tab")
        .forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderCategory(tab.dataset.cat);
    });
  });
  renderCategory(DZIKIR.categories[0].id);
}

/* ------------------------------ 8) ARTIKEL ISLAMI ------------------------------ */
function renderArtikelList(filterKategori) {
  state.artikelInited = true;
  const listEl = document.querySelector("#artikelList");
  const filtered = ARTIKEL.filter(
    (a) =>
      !filterKategori ||
      filterKategori === "Semua" ||
      a.kategori === filterKategori,
  );
  listEl.innerHTML = filtered
    .map(
      (a) => `
      <article class="artikel-card" data-id="${a.id}">
        ${a.gambar ? `<img class="artikel-thumb" src="${a.gambar}" alt="${a.gambarAlt || ""}" loading="lazy" />` : ""}
        <span class="artikel-kategori">${a.kategori}</span>
        <h3>${a.judul}</h3>
        <p>${a.ringkasan}</p>
        <div class="artikel-meta"><span>${a.tanggal}</span><span>•</span><span>${a.waktuBaca} baca</span></div>
      </article>`,
    )
    .join("");
  listEl.querySelectorAll(".artikel-card").forEach((card) => {
    card.addEventListener("click", () => openArtikel(card.dataset.id));
  });

  const kategoriSet = ["Semua", ...new Set(ARTIKEL.map((a) => a.kategori))];
  const filterEl = document.querySelector("#artikelFilters");
  if (!filterEl.dataset.built) {
    filterEl.innerHTML = kategoriSet
      .map(
        (k) =>
          `<button class="chip-filter ${k === "Semua" ? "active" : ""}" data-kat="${k}">${k}</button>`,
      )
      .join("");
    filterEl.dataset.built = "1";
    filterEl.querySelectorAll(".chip-filter").forEach((chip) => {
      chip.addEventListener("click", () => {
        filterEl
          .querySelectorAll(".chip-filter")
          .forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
        renderArtikelList(chip.dataset.kat);
      });
    });
  }
}

function openArtikel(id) {
  const a = ARTIKEL.find((x) => x.id === id);
  if (!a) return;
  document.querySelector("#artikelListView").classList.add("is-hidden");
  const detail = document.querySelector("#artikelDetailView");
  detail.classList.remove("is-hidden");
  detail.querySelector("#artikelDetailKategori").textContent = a.kategori;
  detail.querySelector("#artikelDetailJudul").textContent = a.judul;
  detail.querySelector("#artikelDetailMeta").textContent =
    `${a.tanggal} • ${a.waktuBaca} baca`;
  let fig = detail.querySelector("#artikelDetailFigure");
  if (!fig) {
    fig = document.createElement("figure");
    fig.id = "artikelDetailFigure";
    fig.className = "artikel-figure";
    detail.querySelector("#artikelDetailBody").before(fig);
  }
  fig.hidden = !a.gambar;
  fig.innerHTML = a.gambar
    ? `<img src="${a.gambar}" alt="${a.gambarAlt || ""}" />${a.gambarKredit ? `<figcaption>${a.gambarKredit}</figcaption>` : ""}`
    : "";
  const bodyHtml = a.isi
    .map((p) => (p.startsWith("## ") ? `<h3>${p.slice(3)}</h3>` : `<p>${p}</p>`))
    .join("");
  const sumberHtml =
    a.sumber && a.sumber.length
      ? `<div class="artikel-sumber"><h3>Sumber</h3><ol>${a.sumber
          .map(
            (s) =>
              `<li><a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.nama}</a>${s.tanggal ? ` — ${s.tanggal}` : ""}</li>`,
          )
          .join("")}</ol></div>`
      : "";
  detail.querySelector("#artikelDetailBody").innerHTML = bodyHtml + sumberHtml;
  window.scrollTo({ top: 0 });
}
document.querySelector("#artikelBackToList")?.addEventListener("click", () => {
  document.querySelector("#artikelListView").classList.remove("is-hidden");
  document.querySelector("#artikelDetailView").classList.add("is-hidden");
});

/* ------------------------------ TOPBAR / SEARCH / MISC (dari prototipe awal) ------------------------------ */
document
  .querySelector("#reminderButton")
  ?.addEventListener("click", async (event) => {
    if (getNotificationPermission() !== "granted") {
      const granted = await requestNotificationPermission();
      if (!granted) return;
    }
    // Tombol cepat: aktifkan pengingat sekaligus waktu shalat berikutnya.
    const nextKey = state.timings
      ? getNextPrayer(state.timings.timings).key
      : null;
    saveNotificationPrefs({
      prayer: true,
      ...(nextKey ? { prayers: { [nextKey]: true } } : {}),
    });
    updateNotificationUI();
    persistUserPreferences();
    showToast(
      nextKey
        ? `Pengingat ${PRAYER_LABEL[nextKey]} sudah aktif.`
        : "Pengingat waktu shalat sudah aktif.",
    );
  });

initNotificationControls();
updateNotificationUI();
document
  .querySelector("#dateControl")
  ?.addEventListener("click", () => navigateTo("jadwal"));

const searchPanel = document.querySelector("#searchPanel");
const searchInput = document.querySelector("#searchInput");
function toggleSearch(open) {
  searchPanel.classList.toggle("open", open);
  searchPanel.setAttribute("aria-hidden", String(!open));
  if (open) {
    searchInput.focus();
    searchInput.select();
  }
}
document
  .querySelector("#searchButton")
  ?.addEventListener("click", () => toggleSearch(true));
document
  .querySelector("#closeSearch")
  ?.addEventListener("click", () => toggleSearch(false));
searchPanel?.addEventListener("click", (event) => {
  if (event.target === searchPanel) toggleSearch(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") toggleSearch(false);
});

function normalizeSearchText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function searchTokens(value) {
  return normalizeSearchText(value).split(/\s+/).filter(Boolean);
}

function levenshteinDistance(first, second) {
  const previous = Array.from({ length: second.length + 1 }, (_, i) => i);
  for (let row = 1; row <= first.length; row += 1) {
    const current = [row];
    for (let column = 1; column <= second.length; column += 1) {
      current[column] = Math.min(
        current[column - 1] + 1,
        previous[column] + 1,
        previous[column - 1] + (first[row - 1] === second[column - 1] ? 0 : 1),
      );
    }
    previous.splice(0, previous.length, ...current);
  }
  return previous[second.length];
}

function scoreSearchEntry(entry, query) {
  const queryTokens = searchTokens(query);
  const text = normalizeSearchText(entry.searchText);
  const primaryText = normalizeSearchText(entry.primaryText || entry.label);
  const textTokens = searchTokens(entry.searchText);
  const primaryTokens = searchTokens(entry.primaryText || entry.label);
  if (!queryTokens.length) return 0;

  let score = 0;
  for (const queryToken of queryTokens) {
    if (primaryText.includes(queryToken)) {
      score += 12;
      continue;
    }
    if (text.includes(queryToken)) {
      score += 5;
      continue;
    }
    const closestPrimaryDistance = Math.min(
      ...primaryTokens.map((textToken) =>
        levenshteinDistance(queryToken, textToken),
      ),
    );
    const closestDistance = Math.min(
      ...textTokens.map((textToken) =>
        levenshteinDistance(queryToken, textToken),
      ),
    );
    const tolerance =
      queryToken.length <= 4
        ? 1
        : Math.max(1, Math.floor(queryToken.length / 3));
    if (closestPrimaryDistance <= tolerance)
      score += 8 - closestPrimaryDistance;
    else if (closestDistance <= tolerance) score += 2;
  }
  return score;
}

const SEARCH_INDEX = [
  {
    label: "Jadwal Shalat",
    page: "jadwal",
    primaryText: "jadwal shalat",
    searchText: "jadwal shalat sholat solat waktu adzan azan",
  },
  {
    label: "Kompas Kiblat",
    page: "kiblat",
    primaryText: "kompas kiblat",
    searchText: "kompas kiblat arah kiblat ka bah",
  },
  {
    label: "Al-Qur'an",
    page: "alquran",
    primaryText: "alquran",
    searchText: "alquran al quran qur an surat surah ayat",
  },
  {
    label: "Tahlil",
    page: "tahlil",
    primaryText: "tahlil",
    searchText: "tahlil doa arwah bacaan",
  },
  {
    label: "Manaqib",
    page: "manaqib",
    primaryText: "manaqib",
    searchText: "manaqib syekh abdul qadir jailani kisah",
  },
  {
    label: "Ratib",
    page: "ratib",
    primaryText: "ratib",
    searchText: "ratib haddad dzikir wirid",
  },
  {
    label: "Dzikir & Wirid",
    page: "dzikir",
    primaryText: "dzikir wirid",
    searchText: "dzikir zikir wirid doa amalan",
  },
  {
    label: "Artikel Islami",
    page: "artikel",
    primaryText: "artikel islami",
    searchText: "artikel islami bacaan tulisan",
  },
  {
    label: "Kontak & Kirim Cerita",
    page: "kontak",
    primaryText: "kontak cerita",
    searchText: "kontak kirim cerita saran pertanyaan",
  },
  ...ARTIKEL.map((article) => ({
    label: article.judul,
    category: article.kategori,
    articleId: article.id,
    primaryText: [article.judul, article.kategori, article.ringkasan].join(" "),
    searchText: [
      "artikel",
      article.judul,
      article.kategori,
      article.ringkasan,
      article.isi.join(" "),
    ].join(" "),
  })),
];

function escapeSearchHTML(value) {
  return String(value).replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character],
  );
}

searchInput?.addEventListener("input", (event) => {
  const q = event.target.value.trim();
  const results = document.querySelector("#searchResults");
  if (!q) {
    results.innerHTML = "";
    return;
  }
  const matches = SEARCH_INDEX.map((entry) => ({
    entry,
    score: scoreSearchEntry(entry, q),
  }))
    .filter(({ score }) => score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 8)
    .map(({ entry }) => entry);
  results.innerHTML =
    matches
      .map(
        (match) => `
      <li class="search-result" ${match.articleId ? `data-article="${match.articleId}"` : `data-page="${match.page}"`}>
        <strong>${escapeSearchHTML(match.label)}</strong>
        <small>${escapeSearchHTML(match.category || "Fitur Islamku.id")}</small>
      </li>`,
      )
      .join("") || `<li class="muted-item">Tidak ditemukan</li>`;
  results.querySelectorAll("li[data-page], li[data-article]").forEach((li) => {
    li.addEventListener("click", () => {
      toggleSearch(false);
      if (li.dataset.article) {
        navigateTo("artikel");
        openArtikel(li.dataset.article);
      } else {
        navigateTo(li.dataset.page);
      }
    });
  });
});

/* ------------------------------ INIT ------------------------------ */
function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  navigator.serviceWorker.register("./sw.js").catch(() => {
    // Aplikasi tetap dapat digunakan tanpa Service Worker.
  });
}

(async function init() {
  registerServiceWorker();
  // Halaman aktif dari hash URL, default beranda
  const initialPage = (location.hash || "#beranda").slice(1);
  navigateTo(initialPage, { skipHash: true });
  renderWeekDots();
  window.addEventListener("hashchange", () =>
    navigateTo(location.hash.slice(1)),
  );

  // Streak awal dari localStorage
  const streak = loadLocal("islamku:streak", { days: 0 });
  const streakEl = document.querySelector("#streakDays");
  if (streakEl) streakEl.textContent = `${streak.days} hari`;

  // Lokasi: pakai yang tersimpan, atau coba minta izin GPS otomatis
  if (state.location) {
    document
      .querySelectorAll("[data-location-name]")
      .forEach((el) => (el.textContent = state.location.label.split(",")[0]));
    document
      .querySelectorAll("[data-location-full]")
      .forEach((el) => (el.textContent = state.location.label));
    refreshPrayerTimes();
  } else {
    try {
      await ensureLocation();
    } catch (e) {
      // Tampilkan kartu lokasi dengan status "belum diatur"
      document
        .querySelectorAll("[data-location-name]")
        .forEach((el) => (el.textContent = "Belum diatur"));
      document
        .querySelectorAll("[data-location-full]")
        .forEach(
          (el) => (el.textContent = "Buka Jadwal Shalat untuk memilih lokasi"),
        );
    }
  }

  applyUserPreferences();
  initUserPreferenceControls();
  renderSettingsPage();
  loadAyatHarian();
})();
