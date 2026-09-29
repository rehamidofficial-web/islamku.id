const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const test = require("node:test");

const tempDataDir = fs.mkdtempSync(path.join(os.tmpdir(), "islamku-prefs-test-"));
process.env.DATA_DIR = tempDataDir;
process.env.NODE_ENV = "test";

const { server } = require("../server");

let baseUrl;

function request(pathname, body, options = {}) {
  return fetch(`${baseUrl}${pathname}`, {
    method: options.method || "POST",
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  }).then(async (response) => ({
    status: response.status,
    body: await response.json(),
  }));
}

async function registerUser(email) {
  const response = await request("/api/auth/register", {
    name: "Pengguna Preferensi",
    email,
    password: "rahasia123",
  });
  assert.equal(response.status, 201);
  return response.body.token;
}

test.before(async () => {
  await new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      baseUrl = `http://127.0.0.1:${server.address().port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise((resolve, reject) => {
    server.close((error) => (error ? reject(error) : resolve()));
  });
  fs.rmSync(tempDataDir, { recursive: true, force: true });
});

let mainToken;

test("preferensi mewajibkan sesi login", async () => {
  const response = await request("/api/preferences", undefined, {
    method: "GET",
  });
  assert.equal(response.status, 401);
});

test("akun baru belum memiliki preferensi tersimpan", async () => {
  mainToken = await registerUser("preferensi-test@example.com");
  const response = await request("/api/preferences", undefined, {
    method: "GET",
    token: mainToken,
  });
  assert.equal(response.status, 200);
  assert.equal(response.body.preferences, null);
});

test("menyimpan preferensi lengkap lalu membacanya kembali", async () => {
  const save = await request(
    "/api/preferences",
    {
      notification: {
        prayer: true,
        prayers: { Fajr: false, Maghrib: true, Isha: false },
        leadMinutes: 10,
        iqamahMinutes: 5,
        dzikir: false,
        artikel: true,
      },
      display: { readingScale: "large" },
      ibadah: { asrSchool: "hanafi" },
    },
    { method: "PUT", token: mainToken },
  );
  assert.equal(save.status, 200);
  assert.equal(save.body.preferences.notification.leadMinutes, 10);
  assert.equal(save.body.preferences.notification.iqamahMinutes, 5);
  assert.equal(save.body.preferences.notification.dzikir, false);
  assert.equal(save.body.preferences.notification.artikel, true);
  assert.deepEqual(save.body.preferences.notification.prayers, {
    Fajr: false,
    Dhuhr: true,
    Asr: true,
    Maghrib: true,
    Isha: false,
  });
  assert.equal(save.body.preferences.display.readingScale, "large");
  assert.equal(save.body.preferences.ibadah.asrSchool, "hanafi");
  assert.match(save.body.preferences.updatedAt, /^\d{4}-\d{2}-\d{2}T/);

  const read = await request("/api/preferences", undefined, {
    method: "GET",
    token: mainToken,
  });
  assert.deepEqual(read.body.preferences, save.body.preferences);
});

test("mematikan satu waktu shalat tidak mengubah waktu lain", async () => {
  const login = await request("/api/auth/login", {
    email: "preferensi-test@example.com",
    password: "rahasia123",
  });
  const save = await request(
    "/api/preferences",
    { notification: { prayers: { Dhuhr: false } } },
    { method: "PUT", token: login.body.token },
  );
  assert.equal(save.status, 200);
  assert.deepEqual(save.body.preferences.notification.prayers, {
    Fajr: false,
    Dhuhr: false,
    Asr: true,
    Maghrib: true,
    Isha: false,
  });
});

test("sesi aktif menerima preferensi pada /api/auth/me", async () => {
  const me = await request("/api/auth/me", undefined, {
    method: "GET",
    token: mainToken,
  });
  assert.equal(me.status, 200);
  assert.equal(me.body.preferences.display.readingScale, "large");

  const login = await request("/api/auth/login", {
    email: "preferensi-test@example.com",
    password: "rahasia123",
  });
  assert.equal(login.status, 200);
  const afterLogin = await request("/api/preferences", undefined, {
    method: "GET",
    token: login.body.token,
  });
  assert.equal(afterLogin.body.preferences.ibadah.asrSchool, "hanafi");
});

test("pembaruan parsial mempertahankan preferensi lain", async () => {
  const save = await request(
    "/api/preferences",
    { notification: { artikel: false } },
    { method: "PUT", token: mainToken },
  );
  assert.equal(save.status, 200);
  assert.equal(save.body.preferences.notification.artikel, false);
  assert.equal(save.body.preferences.notification.leadMinutes, 10);
  assert.equal(save.body.preferences.notification.iqamahMinutes, 5);
  assert.equal(save.body.preferences.notification.dzikir, false);
  assert.equal(save.body.preferences.notification.prayers.Fajr, false);
  assert.equal(save.body.preferences.display.readingScale, "large");
  assert.equal(save.body.preferences.ibadah.asrSchool, "hanafi");
});

test("preferensi akun lain tidak saling tercampur", async () => {
  const token = await registerUser("preferensi-dua@example.com");
  const kosong = await request("/api/preferences", undefined, {
    method: "GET",
    token,
  });
  assert.equal(kosong.body.preferences, null);

  const save = await request(
    "/api/preferences",
    { display: { readingScale: "normal" } },
    { method: "PUT", token },
  );
  assert.equal(save.body.preferences.display.readingScale, "normal");
  assert.equal(save.body.preferences.notification.prayer, true);
});

test("menolak payload preferensi yang tidak valid", async () => {
  const invalidPayloads = [
    { notification: { prayer: "ya" } },
    { notification: { leadMinutes: 7 } },
    { notification: { iqamahMinutes: 7 } },
    { notification: { prayers: "semua" } },
    { notification: { prayers: [] } },
    { notification: { prayers: { Subuh: true } } },
    { notification: { prayers: { Fajr: "ya" } } },
    { display: { readingScale: "raksasa" } },
    { ibadah: { asrSchool: "maliki" } },
    { notification: { telepon: true } },
    { preferensi: {} },
    { notification: "semua" },
    [],
  ];

  for (const payload of invalidPayloads) {
    const response = await request("/api/preferences", payload, {
      method: "PUT",
      token: mainToken,
    });
    assert.equal(response.status, 400, JSON.stringify(payload));
    assert.equal(typeof response.body.error, "string");
  }
});
