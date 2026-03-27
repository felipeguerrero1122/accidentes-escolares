import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";
import { setTimeout as delay } from "node:timers/promises";
import { spawn } from "node:child_process";

const chromePath = "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const baseUrl = "http://localhost:3001";
const outputDir = path.resolve("guide-images");
const userDataDir = path.join(os.tmpdir(), `accidentes-escolares-guide-chrome-${Date.now()}`);
const adminEmail = "admin@colegio.local";
const adminPassword = "ChangeMe123!";

async function ensureDir(dir) {
  await fs.mkdir(dir, { recursive: true });
}

async function waitForJson(url, retries = 40, options = {}) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const response = await fetch(url, options);
      if (response.ok) return response.json();
    } catch {}
    await delay(500);
  }
  throw new Error(`No fue posible conectar con ${url}`);
}

class CDPClient {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.nextId = 1;
    this.pending = new Map();
    this.events = new Map();

    this.ready = new Promise((resolve, reject) => {
      this.ws.addEventListener("open", resolve, { once: true });
      this.ws.addEventListener("error", reject, { once: true });
    });

    this.ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data.toString());
      if (message.id && this.pending.has(message.id)) {
        const { resolve, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(message.error.message));
        else resolve(message.result);
        return;
      }

      if (message.method) {
        const listeners = this.events.get(message.method) ?? [];
        for (const listener of listeners) listener(message.params);
      }
    });
  }

  async send(method, params = {}) {
    await this.ready;
    const id = this.nextId++;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(payload);
    });
  }

  on(method, callback) {
    const list = this.events.get(method) ?? [];
    list.push(callback);
    this.events.set(method, list);
  }

  once(method) {
    return new Promise((resolve) => {
      const callback = (params) => {
        const list = this.events.get(method) ?? [];
        this.events.set(
          method,
          list.filter((item) => item !== callback)
        );
        resolve(params);
      };
      this.on(method, callback);
    });
  }

  async close() {
    this.ws.close();
  }
}

async function launchChrome() {
  const proc = spawn(
    chromePath,
    [
      "--headless=new",
      "--disable-gpu",
      "--remote-debugging-port=9222",
      `--user-data-dir=${userDataDir}`,
      "--window-size=1440,1200",
      "about:blank"
    ],
    { stdio: "ignore", detached: true }
  );

  proc.unref();
  return proc;
}

async function killChrome() {
  try {
    await fetch("http://127.0.0.1:9222/json/close");
  } catch {}
}

async function navigate(client, url) {
  const load = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url });
  await load;
  await delay(1200);
}

async function evaluate(client, expression) {
  const result = await client.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true
  });
  return result.result?.value;
}

async function screenshot(client, fileName, { fullPage = true } = {}) {
  if (fullPage) {
    const metrics = await client.send("Page.getLayoutMetrics");
    const width = Math.ceil(metrics.contentSize.width || 1440);
    const height = Math.ceil(metrics.contentSize.height || 1200);
    await client.send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 1,
      mobile: false
    });
  } else {
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 1440,
      height: 1200,
      deviceScaleFactor: 1,
      mobile: false
    });
  }

  await delay(500);
  const shot = await client.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
    captureBeyondViewport: fullPage
  });
  await fs.writeFile(path.join(outputDir, fileName), Buffer.from(shot.data, "base64"));
}

async function login(client) {
  await navigate(client, `${baseUrl}/login`);
  await screenshot(client, "01-login.png", { fullPage: false });
  await evaluate(
    client,
    `
      (() => {
        const setValue = (selector, value) => {
          const input = document.querySelector(selector);
          const proto = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
          proto.call(input, value);
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        };
        setValue('input[name="email"]', ${JSON.stringify(adminEmail)});
        setValue('input[name="password"]', ${JSON.stringify(adminPassword)});
        document.querySelector('form').requestSubmit();
        return true;
      })()
    `
  );
  await delay(2200);
}

async function firstHref(client, selector) {
  return evaluate(
    client,
    `
      (() => {
        const node = document.querySelector(${JSON.stringify(selector)});
        return node ? node.href : null;
      })()
    `
  );
}

async function captureGuideScreens() {
  await ensureDir(outputDir);
  await launchChrome();
  const newTarget = await waitForJson("http://127.0.0.1:9222/json/new?about:blank", 40, { method: "PUT" });
  const client = new CDPClient(newTarget.webSocketDebuggerUrl);

  await client.send("Page.enable");
  await client.send("Runtime.enable");

  await login(client);

  await navigate(client, `${baseUrl}/dashboard`);
  await screenshot(client, "02-dashboard.png");

  await navigate(client, `${baseUrl}/students`);
  await screenshot(client, "03-students-list.png");
  const studentHref = await firstHref(client, 'a[href^="/students/"]');
  if (studentHref) {
    await navigate(client, studentHref);
    await screenshot(client, "04-student-detail.png");
  }

  await navigate(client, `${baseUrl}/accidents`);
  await screenshot(client, "05-accidents-history.png");
  const accidentHref = await firstHref(client, 'a[href^="/accidents/"]:not([href="/accidents/new"])');
  if (accidentHref) {
    await navigate(client, accidentHref);
    await screenshot(client, "07-accident-detail.png");
  }

  await navigate(client, `${baseUrl}/accidents/new`);
  await screenshot(client, "06-accident-new.png");

  await navigate(client, `${baseUrl}/settings/catalogs`);
  await screenshot(client, "08-settings-catalogs.png");
  await evaluate(client, "window.scrollTo(0, document.body.scrollHeight)");
  await delay(900);
  await screenshot(client, "09-settings-users.png", { fullPage: false });

  await client.close();
  await killChrome();
}

captureGuideScreens().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
