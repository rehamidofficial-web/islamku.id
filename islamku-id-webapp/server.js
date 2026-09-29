const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { Pool } = require("pg");

function loadEnvFile() {
  const envFile = path.join(__dirname, ".env");
  if (!fs.existsSync(envFile)) return;
  for (const line of fs.readFileSync(envFile, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const separator = trimmed.indexOf("=");
    if (separator < 1) continue;
    const key = trimmed.slice(0, separator).trim();
    const value = trimmed
      .slice(separator + 1)
      .trim()
      .replace(/^(["'])(.*)\1$/, "$2");
    if (!process.env[key]) process.env[key] = value;
  }
}

loadEnvFile();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_DIR = process.env.DATA_DIR || path.join(ROOT, "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");
const CONTACT_RECEIVER_EMAIL =
  process.env.CONTACT_RECEIVER_EMAIL || "rehamidofficial@gmail.com";
const sessions = new Map();
const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
};

function ensureStore() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_FILE)) {
    fs.writeFileSync(
      STORE_FILE,
      JSON.stringify(
        { users: [], bookmarks: {}, contacts: [], preferences: {} },
        null,
        2,
      ),
    );
  }
}

function normalizeStore(store) {
  if (!Array.isArray(store.users)) store.users = [];
  if (!store.bookmarks || typeof store.bookmarks !== "object")
    store.bookmarks = {};
  if (!Array.isArray(store.contacts)) store.contacts = [];
  if (!store.preferences || typeof store.preferences !== "object")
    store.preferences = {};
  return store;
}

const IS_TEST = process.env.NODE_ENV === "test";

// Produksi: data di Neon. Jika koneksi gagal, error DILEMPAR (respons 500)
// agar data lama tidak tertimpa data kosong. Mode test memakai file DATA_DIR.
async function readStore() {
  if (IS_TEST) {
    ensureStore();
    return normalizeStore(JSON.parse(fs.readFileSync(STORE_FILE, "utf8")));
  }
  const result = await pool.query(`SELECT data FROM app_store WHERE id = 1`);
  if (result.rows.length === 0) {
    return { users: [], bookmarks: {}, contacts: [], preferences: {} };
  }
  return normalizeStore(result.rows[0].data);
}

async function writeStore(store) {
  if (IS_TEST) {
    ensureStore();
    fs.writeFileSync(STORE_FILE, JSON.stringify(store, null, 2));
    return;
  }
  await pool.query(
    `INSERT INTO app_store (id, data) VALUES (1, $1)
     ON CONFLICT (id) DO UPDATE SET data = $1, updated_at = NOW()`,
    [store],
  );
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

function sendError(res, status, message) {
  sendJson(res, status, { error: message });
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) reject(new Error("Payload terlalu besar"));
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        const invalid = new Error("JSON tidak valid");
        invalid.statusCode = 400;
        reject(invalid);
      }
    });
    req.on("error", reject);
  });
}

function normalizeEmail(email) {
  return String(email || "")
    .trim()
    .toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return { salt, hash };
}

function verifyPassword(password, user) {
  const candidate = crypto.scryptSync(password, user.passwordSalt, 64);
  const stored = Buffer.from(user.passwordHash, "hex");
  return (
    candidate.length === stored.length &&
    crypto.timingSafeEqual(candidate, stored)
  );
}

function publicUser(user) {
  return { id: user.id, name: user.name, email: user.email };
}

/* Preferensi pengguna: nilai default sama dengan app.js supaya pembaruan
   parsial dari klien tetap menghasilkan objek yang lengkap. */
const DEFAULT_PREFERENCES = {
  notification: {
    prayer: true,
    prayers: { Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true },
    leadMinutes: 0,
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
const PRAYER_KEYS = Object.keys(DEFAULT_PREFERENCES.notification.prayers);

function sanitizePreferences(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    return { error: "Format preferensi tidak valid." };

  const sections = Object.keys(DEFAULT_PREFERENCES);
  const unknownSections = Object.keys(input).filter(
    (key) => key !== "updatedAt" && !sections.includes(key),
  );
  if (unknownSections.length)
    return {
      error: `Preferensi tidak dikenal: ${unknownSections.join(", ")}.`,
    };

  const value = {};
  for (const section of sections) {
    const incoming = input[section];
    if (incoming === undefined) continue;
    if (!incoming || typeof incoming !== "object" || Array.isArray(incoming))
      return { error: `Bagian preferensi ${section} tidak valid.` };
    const unknownKeys = Object.keys(incoming).filter(
      (key) => !(key in DEFAULT_PREFERENCES[section]),
    );
    if (unknownKeys.length)
      return {
        error: `Preferensi ${section}.${unknownKeys.join(", ")} tidak dikenal.`,
      };
    value[section] = incoming;
  }

  const notification = value.notification || {};
  for (const key of ["prayer", "dzikir", "artikel"]) {
    if (
      notification[key] !== undefined &&
      typeof notification[key] !== "boolean"
    )
      return { error: `Preferensi notifikasi ${key} harus boolean.` };
  }
  if (notification.prayers !== undefined) {
    const prayers = notification.prayers;
    if (!prayers || typeof prayers !== "object" || Array.isArray(prayers))
      return { error: "Preferensi notifikasi prayers tidak valid." };
    const unknownPrayers = Object.keys(prayers).filter(
      (key) => !PRAYER_KEYS.includes(key),
    );
    if (unknownPrayers.length)
      return {
        error: `Waktu shalat tidak dikenal: ${unknownPrayers.join(", ")}.`,
      };
    const invalidPrayer = Object.entries(prayers).find(
      ([, value]) => typeof value !== "boolean",
    );
    if (invalidPrayer)
      return {
        error: `Preferensi notifikasi prayers.${invalidPrayer[0]} harus boolean.`,
      };
  }
  if (
    notification.leadMinutes !== undefined &&
    !PREFERENCE_OPTIONS.leadMinutes.includes(Number(notification.leadMinutes))
  )
    return { error: "Menit pengingat shalat tidak valid." };
  if (
    notification.iqamahMinutes !== undefined &&
    !PREFERENCE_OPTIONS.iqamahMinutes.includes(
      Number(notification.iqamahMinutes),
    )
  )
    return { error: "Menit pengingat jamaah tidak valid." };
  if (
    value.display?.readingScale !== undefined &&
    !PREFERENCE_OPTIONS.readingScale.includes(value.display.readingScale)
  )
    return { error: "Ukuran teks bacaan tidak valid." };
  if (
    value.ibadah?.asrSchool !== undefined &&
    !PREFERENCE_OPTIONS.asrSchool.includes(value.ibadah.asrSchool)
  )
    return { error: "Mazhab Ashar tidak valid." };

  return { value };
}

function mergePreferences(current, patch) {
  const merged = {};
  for (const section of Object.keys(DEFAULT_PREFERENCES)) {
    merged[section] = Object.assign({}, DEFAULT_PREFERENCES[section]);
    if (current) Object.assign(merged[section], current[section]);
    if (patch) Object.assign(merged[section], patch[section]);
  }
  // Gabungkan daftar waktu shalat per-item agar mengubah satu waktu tidak menghapus yang lain.
  merged.notification.prayers = Object.assign(
    {},
    DEFAULT_PREFERENCES.notification.prayers,
    current && current.notification && current.notification.prayers,
    patch && patch.notification && patch.notification.prayers,
  );
  merged.updatedAt = new Date().toISOString();
  return merged;
}

function getUserFromRequest(req, store) {
  const token = (req.headers.authorization || "").slice(7);
  const userId = sessions.get(token);
  return userId ? store.users.find((user) => user.id === userId) : null;
}

function requireUser(req, res, store) {
  const user = getUserFromRequest(req, store);
  if (!user) sendError(res, 401, "Sesi tidak valid atau sudah berakhir.");
  return user;
}

async function handleApi(req, res, url) {
  const store = await readStore();
  if (req.method === "POST" && url.pathname === "/api/contact") {
    const user = requireUser(req, res, store);
    if (!user) return;

    const body = await parseBody(req);
    const type = String(body.type || "").trim();
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const subject = String(body.subject || "").trim();
    const message = String(body.message || "").trim();
    const allowedTypes = ["saran", "pertanyaan", "kisah"];
    if (!allowedTypes.includes(type))
      return sendError(res, 400, "Jenis pesan tidak valid.");
    if (name.length < 2) return sendError(res, 400, "Nama minimal 2 karakter.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return sendError(res, 400, "Email tidak valid.");
    if (!subject || subject.length > 150)
      return sendError(res, 400, "Judul pesan wajib diisi.");
    if (!message || message.length > 5000)
      return sendError(
        res,
        400,
        "Pesan wajib diisi dan maksimal 5000 karakter.",
      );
    const contact = {
      id: crypto.randomUUID(),
      userId: user.id,
      type,
      name,
      email,
      subject,
      message,
      createdAt: new Date().toISOString(),
    };
    if (!Array.isArray(store.contacts)) store.contacts = [];
    store.contacts.push(contact);
    await writeStore(store);
    const delivered = await deliverContactEmail(contact);
    return sendJson(res, 201, { ok: true, delivered });
  }
  if (req.method === "POST" && url.pathname === "/api/auth/register") {
    const body = await parseBody(req);
    const name = String(body.name || "").trim();
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (name.length < 2) return sendError(res, 400, "Nama minimal 2 karakter.");
    if (!/^\S+@\S+\.\S+$/.test(email))
      return sendError(res, 400, "Email tidak valid.");
    if (password.length < 6)
      return sendError(res, 400, "Kata sandi minimal 6 karakter.");
    if (store.users.some((user) => user.email === email))
      return sendError(res, 409, "Email sudah terdaftar.");
    const passwordData = hashPassword(password);
    const user = {
      id: crypto.randomUUID(),
      name,
      email,
      passwordSalt: passwordData.salt,
      passwordHash: passwordData.hash,
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    await writeStore(store);
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, user.id);
    return sendJson(res, 201, {
      user: publicUser(user),
      token,
      bookmark: store.bookmarks[user.id] || null,
    });
  }

  if (req.method === "POST" && url.pathname === "/api/auth/login") {
    const body = await parseBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    const user = store.users.find((candidate) => candidate.email === email);
    if (!user || !verifyPassword(password, user))
      return sendError(res, 401, "Email atau kata sandi tidak cocok.");
    const token = crypto.randomBytes(32).toString("hex");
    sessions.set(token, user.id);
    return sendJson(res, 200, {
      user: publicUser(user),
      token,
      bookmark: store.bookmarks[user.id] || null,
    });
  }

  const user = requireUser(req, res, store);
  if (!user) return;
  if (req.method === "GET" && url.pathname === "/api/auth/me") {
    return sendJson(res, 200, {
      user: publicUser(user),
      bookmark: store.bookmarks[user.id] || null,
      preferences: store.preferences[user.id] || null,
    });
  }
  if (req.method === "POST" && url.pathname === "/api/auth/logout") {
    const token = (req.headers.authorization || "").slice(7);
    sessions.delete(token);
    return sendJson(res, 200, { ok: true });
  }
  if (req.method === "GET" && url.pathname === "/api/bookmark") {
    return sendJson(res, 200, { bookmark: store.bookmarks[user.id] || null });
  }
  if (req.method === "PUT" && url.pathname === "/api/bookmark") {
    const body = await parseBody(req);
    const nomor = Number(body.nomor);
    const ayat = Number(body.ayat);
    const namaLatin = String(body.namaLatin || "").trim();
    if (
      !Number.isInteger(nomor) ||
      nomor < 1 ||
      nomor > 114 ||
      !Number.isInteger(ayat) ||
      ayat < 1 ||
      !namaLatin
    ) {
      return sendError(res, 400, "Data bookmark tidak valid.");
    }
    const bookmark = {
      nomor,
      ayat,
      namaLatin,
      updatedAt: new Date().toISOString(),
    };
    store.bookmarks[user.id] = bookmark;
    await writeStore(store);
    return sendJson(res, 200, { bookmark });
  }
  if (url.pathname === "/api/preferences") {
    if (req.method === "GET") {
      return sendJson(res, 200, {
        preferences: store.preferences[user.id] || null,
      });
    }
    if (req.method === "PUT") {
      const body = await parseBody(req);
      const checked = sanitizePreferences(body);
      if (checked.error) return sendError(res, 400, checked.error);
      const preferences = mergePreferences(
        store.preferences[user.id],
        checked.value,
      );
      store.preferences[user.id] = preferences;
      await writeStore(store);
      return sendJson(res, 200, { preferences });
    }
    return sendError(res, 405, "Metode tidak diizinkan.");
  }
  return sendError(res, 404, "Endpoint tidak ditemukan.");
}

async function deliverContactEmail(contact) {
  if (process.env.NODE_ENV === "test") return false;
  if (
    !process.env.SMTP_HOST ||
    !process.env.SMTP_USER ||
    !process.env.SMTP_PASS
  )
    return false;
  try {
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: CONTACT_RECEIVER_EMAIL,
      replyTo: contact.email,
      subject: `[Islamku.id] ${contact.type}: ${contact.subject}`,
      text: `Nama: ${contact.name}\nEmail: ${contact.email}\nJenis: ${contact.type}\n\n${contact.message}`,
    });
    return true;
  } catch (error) {
    console.error("Gagal mengirim email kontak:", error.message);
    return false;
  }
}

function serveStatic(req, res, url) {
  let requested = decodeURIComponent(url.pathname);
  if (requested === "/" || requested === "") requested = "/index.html";
  const filePath = path.resolve(ROOT, `.${requested}`);
  if (
    !filePath.startsWith(`${ROOT}${path.sep}`) ||
    !fs.existsSync(filePath) ||
    fs.statSync(filePath).isDirectory()
  ) {
    return sendError(res, 404, "File tidak ditemukan.");
  }
  res.writeHead(200, {
    "Content-Type":
      MIME_TYPES[path.extname(filePath).toLowerCase()] ||
      "application/octet-stream",
  });
  fs.createReadStream(filePath).pipe(res);
}

if (IS_TEST) ensureStore();
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  try {
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url);
    } else if (req.method === "GET") {
      serveStatic(req, res, url);
    } else {
      sendError(res, 405, "Metode tidak diizinkan.");
    }
  } catch (error) {
    console.error(error);
    if (!res.headersSent) {
      if (error.statusCode) sendError(res, error.statusCode, error.message);
      else sendError(res, 500, "Terjadi kesalahan pada server.");
    }
  }
});

if (require.main === module) {
  server.listen(PORT, "0.0.0.0", () => {
    console.log(`Islamku.id berjalan di http://localhost:${PORT}`);
  });
}

module.exports = { server };
