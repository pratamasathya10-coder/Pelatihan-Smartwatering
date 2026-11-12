// firebase-app.js
// Menyambungkan dashboard ke Firebase: login, 1 modul per kelompok, admin bisa pilih modul.
import { initializeApp as fbInit } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import { getDatabase, ref, get, update, onValue }
  from "https://www.gstatic.com/firebasejs/10.14.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyBVE5Kx0cAR4IT4SMoMgpBZo8M1DkdmR8A",
  authDomain: "smart-watering-siswa.firebaseapp.com",
  databaseURL: "https://smart-watering-siswa-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "smart-watering-siswa",
  storageBucket: "smart-watering-siswa.firebasestorage.app",
  messagingSenderId: "982140312300",
  appId: "1:982140312300:web:decc4848a8cff1279f63c9",
  measurementId: "G-HXDN5T2TWZ"
};

const auth = getAuth(fbInit(firebaseConfig));
const db = getDatabase();
const MODULES = ["MODUL_01", "MODUL_02", "MODUL_03"];
const OFFLINE_AFTER_MS = 30000;
const BUILD = "build 2";

let moduleId = null;
let unsubscribe = null;
let lastSeen = 0;
let lastTs = null;
let lastData = {};

/* 1. Matikan simulasi dan keputusan otomatis di browser (sekarang tugas ESP32) */
window.simulateMoisture = () => {};
window.simulateTemperature = () => {};
window.automaticControl = () => {};
window.automaticFanControl = () => {};
window.checkSchedules = () => {};

/* 2. Kontrol: hanya menulis ke database, tampilan berubah setelah status dari ESP32 masuk */
window.pumpControl = (action) => {
  if (!moduleId) {
    alert("Modul belum dipilih atau belum login. Coba refresh lalu login lagi.");
    return;
  }
  if (currentMode !== "manual") {
    alert("Ubah ke Manual Mode dulu untuk mengontrol pompa.");
    return;
  }
  const value = action === "on" ? "ON" : "OFF";
  update(ref(db, `modules/${moduleId}/command`), { pump: value, id: Date.now() })
    .then(() => addLog(`Perintah pompa ${value} dikirim, menunggu ESP32`))
    .catch((e) => alert("Perintah ditolak: " + e.code));
};

window.setMode = (mode) => {
  console.log("[setMode]", mode, "modul:", moduleId);
  if (!moduleId) {
    alert("Modul belum dipilih atau belum login. Coba refresh lalu login lagi.");
    return;
  }
  if (!["auto", "manual", "schedule"].includes(mode)) return;
  if (mode === "schedule") {
    alert("Mode Jadwal belum dijalankan oleh ESP32 (menyusul di tahap berikutnya).");
    return;
  }
  update(ref(db, `modules/${moduleId}/settings`), { mode: mode === "schedule" ? "scheduled" : mode })
    .then(() => console.log("[setMode] tersimpan di database:", mode))
    .catch((e) => {
      console.error("[setMode] ditolak:", e.code, e.message);
      alert("Mode ditolak database: " + e.code);
    });
};

window.saveThresholds = () => {
  if (!moduleId) return;
  const m = Number(document.getElementById("moistureThreshold").value);
  const tmp = Number(document.getElementById("temperatureThreshold").value);
  if (!(m >= 0 && m <= 100 && tmp >= 0 && tmp <= 80)) {
    alert(t("invalidThreshold"));
    updateThresholdInputs();
    return;
  }
  update(ref(db, `modules/${moduleId}/settings`), { moisture_threshold: m, temp_threshold: tmp })
    .then(() => {
      const msg = document.getElementById("thresholdMessage");
      if (msg) msg.textContent = t("settingsSaved");
    })
    .catch((e) => alert("Ditolak: " + e.code));
};

/* 3. Data dari database masuk ke tampilan yang sudah ada */
function applyData(d) {
  lastData = d;
  const s = d.sensor || {}, st = d.status || {}, cfg = d.settings || {};

  if (Number.isFinite(s.soil_pct)) {
    moisture = s.soil_pct;
    if (s.ts !== lastTs) {
      lastTs = s.ts;
      moistureHistory.push(moisture);
      if (moistureHistory.length > 30) moistureHistory.shift();
    }
  }
  if (Number.isFinite(s.temp)) temperature = s.temp;

  if (pumpStatus !== !!st.pump) addLog(st.pump ? t("pumpTurnedOn") : t("pumpTurnedOff"));
  pumpStatus = !!st.pump;
  fanStatus = !!st.fan;

  if (cfg.moisture_threshold != null) moistureThreshold = cfg.moisture_threshold;
  if (cfg.temp_threshold != null) temperatureThreshold = cfg.temp_threshold;
  currentMode = cfg.mode === "scheduled" ? "schedule" : cfg.mode || "auto";
  lastSeen = st.last_seen || 0;

  updateMoistureUI(); updateTemperatureUI(); updatePumpUI(); updateFanUI();
  updateModeUI(); updateChart(); renderState();
  const typing = document.activeElement && /Threshold/.test(document.activeElement.id);
  if (!typing) updateThresholdInputs();
}

function subscribe(mid) {
  if (unsubscribe) unsubscribe();
  moduleId = mid;
  moistureHistory = [];
  lastTs = null;
  lastData = {};
  lastSeen = 0;
  renderState();
  unsubscribe = onValue(
    ref(db, `modules/${mid}`),
    (snap) => applyData(snap.val() || {}),
    (err) => setState("Gagal membaca data: " + err.code)
  );
}

/* 4. Bar atas dan login (dibuat lewat JavaScript, index.html hampir tidak berubah) */
function setState(text) {
  const el = document.getElementById("fbState");
  if (el) el.textContent = text;
}
function setBadge(id, ok, onText, offText) {
  const el = document.getElementById(id);
  if (!el) return;
  el.className = ok ? "online" : "offline";
  el.textContent = "● " + (ok ? onText : offText);
}
function renderState() {
  if (!moduleId) return;
  const online = !!lastSeen && Date.now() - lastSeen < OFFLINE_AFTER_MS;
  setState(online ? `● ${moduleId} online` : `● ${moduleId} OFFLINE (data terakhir bisa sudah lama)`);

  const id = currentLanguage === "id";
  const label = online ? "Online" : "Offline";
  const notConnected = id ? "Belum Terhubung" : "Not Connected";
  const active = id ? "Aktif" : "Active";
  const s = lastData.sensor || {};

  const head = document.getElementById("espHeaderStatus");
  if (head) head.textContent = label;
  const dot = document.querySelector(".connection-dot");
  if (dot) dot.style.background = online ? "" : "#dc2626";

  setBadge("systemEspStatus", online, label, label);
  setBadge("systemWifiStatus", online, label, label);
  setBadge("systemSoilStatus", online && Number.isFinite(s.soil_pct), active, notConnected);
  setBadge("systemDhtStatus", online && Number.isFinite(s.temp), active, notConnected);
}
setInterval(renderState, 5000);

function buildBar(profile) {
  document.getElementById("fbBar")?.remove();
  const bar = document.createElement("div");
  bar.id = "fbBar";
  bar.style.cssText = "position:sticky;top:0;z-index:9999;display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:8px 16px;background:#14532d;color:#fff;font:14px sans-serif";
  bar.innerHTML = `<strong>${profile.role === "admin" ? "Admin" : "Kelompok " + profile.module}</strong>
    <span id="fbPick"></span><span id="fbState"></span><small style="opacity:.7">${BUILD}</small>
    <button id="fbOut" style="margin-left:auto">Keluar</button>`;
  document.body.prepend(bar);
  document.getElementById("fbOut").onclick = () => signOut(auth);
  if (profile.role === "admin") {
    const sel = document.createElement("select");
    sel.innerHTML = MODULES.map((m) => `<option>${m}</option>`).join("");
    sel.onchange = () => subscribe(sel.value);
    document.getElementById("fbPick").appendChild(sel);
  }
}

function loginBox() {
  let box = document.getElementById("fbLogin");
  if (box) return box;
  box = document.createElement("div");
  box.id = "fbLogin";
  box.style.cssText = "position:fixed;inset:0;z-index:10000;background:rgba(0,0,0,.65);display:flex;align-items:center;justify-content:center";
  box.innerHTML = `<form id="fbForm" style="background:#fff;color:#111;padding:24px;border-radius:12px;display:grid;gap:10px;min-width:280px;font:14px sans-serif">
    <h3 style="margin:0">Login Smart Watering</h3>
    <input id="fbEmail" type="email" placeholder="Email" required>
    <input id="fbPass" type="password" placeholder="Password" required>
    <button type="submit">Masuk</button><small id="fbErr" style="color:#b91c1c"></small></form>`;
  document.body.appendChild(box);
  document.getElementById("fbForm").onsubmit = async (e) => {
    e.preventDefault();
    document.getElementById("fbErr").textContent = "";
    try {
      await signInWithEmailAndPassword(auth, fbEmail.value.trim(), fbPass.value);
    } catch (err) {
      fbErr.textContent = "Email atau password salah.";
    }
  };
  return box;
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    if (unsubscribe) unsubscribe();
    unsubscribe = null; moduleId = null;
    document.getElementById("fbBar")?.remove();
    loginBox().style.display = "flex";
    return;
  }
  const snap = await get(ref(db, `users/${user.uid}`));
  const profile = snap.val();
  const ok = profile && (profile.role === "admin" || (profile.role === "group" && MODULES.includes(profile.module)));
  if (!ok) {
    loginBox().style.display = "flex";
    document.getElementById("fbErr").textContent = "Akun ini tidak punya akses dashboard.";
    await signOut(auth);
    return;
  }
  loginBox().style.display = "none";
  buildBar(profile);
  subscribe(profile.role === "admin" ? MODULES[0] : profile.module);
});
