const assert = require("node:assert/strict");
const { once } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawn } = require("node:child_process");
const net = require("node:net");
const test = require("node:test");

const root = path.join(__dirname, "..");
const tempDataDir = fs.mkdtempSync(
  path.join(os.tmpdir(), "islamku-restart-test-"),
);

async function getAvailablePort() {
  const probe = net.createServer();
  await new Promise((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const port = probe.address().port;
  await new Promise((resolve, reject) =>
    probe.close((error) => (error ? reject(error) : resolve())),
  );
  return port;
}

async function startServer() {
  const port = await getAvailablePort();
  const child = spawn(process.execPath, [path.join(root, "server.js")], {
    cwd: root,
    env: {
      ...process.env,
      DATA_DIR: tempDataDir,
      NODE_ENV: "test",
      PORT: String(port),
    },
    stdio: ["ignore", "pipe", "pipe"],
  });

  let output = "";
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      child.kill();
      reject(new Error(`Server tidak siap: ${output}`));
    }, 5000);
    const onOutput = (chunk) => {
      output += chunk.toString();
      if (output.includes(`http://localhost:${port}`)) {
        clearTimeout(timeout);
        resolve({ child, baseUrl: `http://127.0.0.1:${port}` });
      }
    };
    child.stdout.on("data", onOutput);
    child.stderr.on("data", (chunk) => {
      output += chunk.toString();
    });
    child.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    child.once("exit", (code) => {
      if (!output.includes(`http://localhost:${port}`)) {
        clearTimeout(timeout);
        reject(new Error(`Server berhenti dengan kode ${code}: ${output}`));
      }
    });
  });
}

async function stopServer(child) {
  if (child.exitCode !== null) return;
  child.kill();
  await once(child, "exit");
}

async function request(baseUrl, pathname, body, options = {}) {
  const response = await fetch(`${baseUrl}${pathname}`, {
    method: options.method || "POST",
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return { status: response.status, body: await response.json() };
}

test.after(() => {
  fs.rmSync(tempDataDir, { recursive: true, force: true });
});

test("data tetap tersedia setelah server restart", async () => {
  let firstServer;
  let secondServer;
  try {
    firstServer = await startServer();
    const registerResponse = await request(
      firstServer.baseUrl,
      "/api/auth/register",
      {
        name: "Restart Test",
        email: "restart-test@example.com",
        password: "rahasia123",
      },
    );
    assert.equal(registerResponse.status, 201);

    const saveResponse = await request(
      firstServer.baseUrl,
      "/api/bookmark",
      { nomor: 36, ayat: 1, namaLatin: "Yasin" },
      {
        method: "PUT",
      },
    );
    assert.equal(saveResponse.status, 401);

    const loginResponse = await request(
      firstServer.baseUrl,
      "/api/auth/login",
      {
        email: "restart-test@example.com",
        password: "rahasia123",
      },
    );
    assert.equal(loginResponse.status, 200);

    const authenticatedSave = await fetch(
      `${firstServer.baseUrl}/api/bookmark`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${loginResponse.body.token}`,
        },
        body: JSON.stringify({ nomor: 36, ayat: 1, namaLatin: "Yasin" }),
      },
    );
    assert.equal(authenticatedSave.status, 200);

    await stopServer(firstServer.child);
    firstServer = undefined;

    secondServer = await startServer();
    const secondLogin = await request(secondServer.baseUrl, "/api/auth/login", {
      email: "restart-test@example.com",
      password: "rahasia123",
    });
    assert.equal(secondLogin.status, 200);

    const bookmarkResponse = await fetch(
      `${secondServer.baseUrl}/api/bookmark`,
      { headers: { Authorization: `Bearer ${secondLogin.body.token}` } },
    );
    const bookmarkBody = await bookmarkResponse.json();
    assert.equal(bookmarkResponse.status, 200);
    assert.equal(bookmarkBody.bookmark.nomor, 36);
    assert.equal(bookmarkBody.bookmark.ayat, 1);
    assert.equal(bookmarkBody.bookmark.namaLatin, "Yasin");
  } finally {
    if (firstServer) await stopServer(firstServer.child);
    if (secondServer) await stopServer(secondServer.child);
  }
});
