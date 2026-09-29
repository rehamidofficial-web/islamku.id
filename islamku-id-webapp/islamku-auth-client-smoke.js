/* Uji alur register/login di sisi klien: menjalankan app.js pada DOM tiruan,
   terhubung ke server.js asli (port acak, data sementara). Yang dicek: mode
   form, pesan error, penyimpanan sesi, tampilan akun, dan logout. */
const fs = require("fs");
const os = require("os");
const path = require("path");
const vm = require("vm");

const root = process.cwd();
const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "islamku-authclient-"));
process.env.DATA_DIR = dataDir;
process.env.NODE_ENV = "test";

const { server } = require(`${root}/server.js`);
const appSource = fs.readFileSync(`${root}/app.js`, "utf8");
const contentSource = fs.readFileSync(`${root}/content.js`, "utf8");
const realFetch = globalThis.fetch;
const nodeSetTimeout = setTimeout;

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
      autocomplete: "",
      dataset: {},
      style: { setProperty() {} },
      classList: classList(),
      addEventListener(type, fn) {
        if (!handlers.has(type)) handlers.set(type, []);
        handlers.get(type).push(fn);
      },
      fire(type, event = {}) {
        (handlers.get(type) || []).forEach((fn) =>
          fn({
            currentTarget: this,
            target: this,
            preventDefault() {},
            ...event,
          }),
        );
      },
      reset() {},
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

async function main() {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;

  const sandbox = {
    window: { scrollTo() {}, addEventListener() {} },
    document,
    localStorage,
    navigator: {},
    location: { hash: "#beranda" },
    history: { replaceState() {} },
    fetch: (url, options) =>
      String(url).startsWith("/api/")
        ? realFetch(base + url, options)
        : Promise.resolve({ ok: false, status: 404, json: async () => ({}) }),
    setTimeout(fn, delay) {
      return nodeSetTimeout(fn, Math.min(delay, 200));
    },
    clearTimeout,
    setInterval: () => 0,
    clearInterval() {},
    console,
    process,
    __done: async (text, failed) => {
      console.log(text);
      await new Promise((resolve) => server.close(resolve));
      fs.rmSync(dataDir, { recursive: true, force: true });
      process.exit(failed ? 1 : 0);
    },
  };

  const epilogue = `
;(async function smoke() {
  const out = [];
  let failed = 0;
  const q = (sel) => document.querySelector(sel);
  const check = (label, actual, expected) => {
    const ok = JSON.stringify(actual) === JSON.stringify(expected);
    if (!ok) failed++;
    out.push((ok ? "OK    " : "GAGAL ") + label + " -> " + JSON.stringify(actual) + (ok ? "" : "  (harusnya " + JSON.stringify(expected) + ")"));
  };
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const isiForm = (name, email, password) => {
    q("#authName").value = name;
    q("#authEmail").value = email;
    q("#authPassword").value = password;
  };
  const kirim = async () => { q("#authForm").fire("submit"); await wait(150); };
  const sesi = () => JSON.parse(localStorage.getItem("islamku:session") || "null");

  await wait(60);
  check("awal: belum ada sesi", sesi(), null);
  check("awal: currentUser kosong", state.currentUser, null);

  // --- Mode form ---
  openAuth("register");
  check("mode-daftar-judul", q("#authTitle").textContent, "Buat akun baru");
  check("mode-daftar-tombol", q("#authSubmit").textContent, "Daftar");
  check("mode-daftar-field-nama-tampil", q("#authNameField").classList.contains("is-hidden"), false);
  check("mode-daftar-autocomplete", q("#authPassword").autocomplete, "new-password");

  openAuth("login");
  check("mode-masuk-judul", q("#authTitle").textContent, "Masuk ke akunmu");
  check("mode-masuk-tombol", q("#authSubmit").textContent, "Masuk");
  check("mode-masuk-field-nama-sembunyi", q("#authNameField").classList.contains("is-hidden"), true);

  openAuth("login", true);
  check("wajib-login-tombol-tutup-sembunyi", q("#authClose").classList.contains("is-hidden"), true);
  closeAuth();
  check("wajib-login-toast-saat-ditutup", q("#toast").textContent, "Silakan masuk atau daftar untuk membuka beranda.");

  // --- Register gagal: kata sandi pendek ---
  openAuth("register");
  isiForm("Budi Santoso", "budi@example.com", "123");
  await kirim();
  check("register-gagal-pesan", q("#authError").textContent, "Kata sandi minimal 6 karakter.");
  check("register-gagal-tanpa-sesi", sesi(), null);
  check("register-gagal-currentUser", state.currentUser, null);

  // --- Register berhasil ---
  isiForm("Budi Santoso", "Budi@Example.com", "rahasia123");
  await kirim();
  check("register-ok-currentUser", state.currentUser && state.currentUser.email, "budi@example.com");
  check("register-ok-sesi-tersimpan", !!(sesi() && sesi().token), true);
  check("register-ok-toast", q("#toast").textContent, "Akun berhasil dibuat.");
  check("register-ok-nama-profil", q("#profileName").textContent, "Budi Santoso");
  check("register-ok-tombol-menu", q("#accountMenuButton").textContent, "Keluar dari akun");
  check("register-ok-overlay-tertutup", q("#authOverlay").classList.contains("is-hidden"), true);
  const tokenLama = sesi().token;

  // --- Logout ---
  handleAccountAction();
  await wait(150);
  check("logout-currentUser", state.currentUser, null);
  check("logout-sesi-terhapus", sesi(), null);
  check("logout-toast", q("#toast").textContent, "Kamu sudah keluar dari akun.");
  check("logout-nama-profil", q("#profileName").textContent, "Akun tamu");
  const cekToken = await fetch("/api/auth/me", { headers: { Authorization: "Bearer " + tokenLama } });
  check("logout-token-mati-di-server", cekToken.status, 401);

  // --- Register email sama ditolak ---
  openAuth("register");
  isiForm("Budi Dua", "budi@example.com", "rahasia123");
  await kirim();
  check("register-duplikat-pesan", q("#authError").textContent, "Email sudah terdaftar.");
  check("register-duplikat-tanpa-sesi", sesi(), null);

  // --- Login gagal ---
  openAuth("login");
  isiForm("", "budi@example.com", "salah-total");
  await kirim();
  check("login-gagal-pesan", q("#authError").textContent, "Email atau kata sandi tidak cocok.");
  check("login-gagal-tanpa-sesi", sesi(), null);

  // --- Login berhasil ---
  isiForm("", " BUDI@example.com ", "rahasia123");
  await kirim();
  check("login-ok-currentUser", state.currentUser && state.currentUser.name, "Budi Santoso");
  check("login-ok-sesi", !!(sesi() && sesi().token), true);
  check("login-ok-toast", q("#toast").textContent, "Berhasil masuk.");
  check("login-ok-token-baru", sesi().token !== tokenLama, true);
  check("login-ok-badge", q("#settingsAccountBadge").textContent, "Masuk");

  // --- Sesi yang dipulihkan dipakai apiRequest (endpoint butuh login) ---
  const me = await apiRequest("/auth/me");
  check("sesi-dipakai-apiRequest", me.user.email, "budi@example.com");

  out.push(failed ? "\\n" + failed + " pemeriksaan GAGAL" : "\\nSemua pemeriksaan lulus");
  await __done(out.join("\\n"), failed);
})().catch(async (error) => {
  await __done("GAGAL (error tak terduga) " + ((error && error.stack) || error), 1);
});
`;

  vm.runInContext(
    `${contentSource}\n${appSource}\n${epilogue}`,
    vm.createContext(sandbox),
    { filename: "app.auth-smoke.js" },
  );
}

main();
