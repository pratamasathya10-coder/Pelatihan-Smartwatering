/* SMART WATERING - SCRIPT.JS */

/* GLOBAL STATE */
let currentLanguage = localStorage.getItem("smartWateringLanguage") || "id";
let currentTheme = localStorage.getItem("smartWateringTheme") || "light";
let currentMode = "auto";
let pumpStatus = false;
let fanStatus = false;
let moisture = 68;
let temperature = 30;
let moistureHistory = [];

let moistureThreshold = Number(
  localStorage.getItem("smartWateringMoistureThreshold") || 40
);

let temperatureThreshold = Number(
  localStorage.getItem("smartWateringTemperatureThreshold") || 36
);

let schedules = JSON.parse(
  localStorage.getItem("smartWateringSchedules") || "[]"
);

let logs = JSON.parse(
  localStorage.getItem("smartWateringLogs") || "[]"
);

/* TRANSLATION */
const translations = {
  id: {
    title: "Smart Watering",
    subtitle: "Monitoring & Kontrol Penyiraman Tanaman",
    simulation: "Simulasi",
    soilSensor: "SENSOR TANAH",
    soilMoisture: "Kelembapan Tanah",
    moisture: "Kelembapan",
    soilGood: "Tanah Cukup Lembap",
    soilDry: "Tanah Kering",
    soilVeryDry: "Tanah Sangat Kering",
    sensorUpdate: "Data sensor diperbarui secara berkala dalam mode simulasi.",
    actuator: "AKTUATOR",
    pumpStatus: "Status Pompa",
    pumpOff: "Pompa Mati",
    pumpOn: "Pompa Menyala",
    notWatering: "Tidak sedang menyiram",
    watering: "Sedang menyiram tanaman",
    turnOn: "Nyalakan",
    turnOff: "Matikan",
    sensorData: "DATA SENSOR",
    moistureChart: "Grafik Kelembapan",
    chartDescription: "Perubahan kelembapan tanah secara real-time.",
    soilMoistureLegend: "● Kelembapan tanah",
    current: "Saat ini",
    systemSettings: "PENGATURAN SISTEM",
    wateringMode: "Mode Penyiraman",
    modeDescription: "Pilih bagaimana pompa dikendalikan.",
    mode: "Mode:",
    automatic: "Otomatis",
    automaticDesc: "Pompa dikendalikan berdasarkan kelembapan tanah.",
    manual: "Manual",
    manualDesc: "Pompa dikendalikan menggunakan tombol.",
    scheduled: "Terjadwal",
    scheduledDesc: "Pompa mengikuti jadwal yang telah dibuat.",
    automaticDescription: "🤖 Sistem mengatur pompa berdasarkan kelembapan tanah.",
    manualDescription: "👆 Pompa dikendalikan langsung menggunakan tombol.",
    scheduledDescription: "⏰ Pompa mengikuti jadwal penyiraman yang telah dibuat.",
    timeAutomation: "AUTOMASI WAKTU",
    pumpScheduling: "Penjadwalan Pompa",
    scheduleDescription: "Atur waktu pompa menyala dan mati.",
    pumpOn: "Pompa ON",
    pumpOff: "Pompa OFF",
    addSchedule: "Tambah Jadwal",
    activityHistory: "RIWAYAT AKTIVITAS",
    pumpLog: "Log Pompa",
    logDescription: "Catatan waktu pompa menyala dan mati.",
    clearLog: "Hapus Log",
    monitoring: "MONITORING",
    systemStatus: "Status Sistem",
    active: "Aktif",
    pump: "Pompa",
    off: "Mati",
    on: "Menyala",
    simulationMode: "Mode Simulasi",
    simulationInfo: "Sistem belum terhubung ke ESP32. Data sensor, pompa, kipas, jadwal, dan log masih dijalankan melalui simulasi browser. Integrasi perangkat fisik dilakukan pada tahap berikutnya.",
    scheduleAdded: "Jadwal berhasil ditambahkan.",
    scheduleDeleted: "Jadwal dihapus.",
    logsCleared: "Semua log pompa telah dihapus.",
    confirmClear: "Hapus semua log pompa?",
    noSchedule: "Belum ada jadwal.",
    noLog: "Belum ada aktivitas pompa.",
    schedule: "Jadwal",
    pumpTurnedOn: "Pompa dinyalakan",
    pumpTurnedOff: "Pompa dimatikan",
    dark: "Dark",
    light: "Light",
    temperature: "Suhu Lingkungan",
    waitingTemperature: "Menunggu data suhu",
    temperatureNormal: "Suhu Normal",
    temperatureHigh: "Suhu Tinggi",
    fan: "Kipas",
    fanOn: "Kipas Menyala",
    fanOff: "Kipas Mati",
    fanActive: "Kipas sedang aktif",
    fanInactive: "Kipas tidak aktif",
    moistureThreshold: "Batas Kelembapan Tanah",
    temperatureThreshold: "Batas Suhu",
    thresholdSettings: "Ambang Batas Sensor",
    thresholdDescription: "Atur nilai batas untuk mengendalikan pompa dan kipas secara otomatis.",
    moistureThresholdHelp: "Pompa menyala jika kelembapan tanah di bawah nilai ini.",
    temperatureThresholdHelp: "Kipas menyala jika suhu melebihi nilai ini.",
    saveSettings: "Simpan Pengaturan",
    settingsSaved: "Pengaturan berhasil disimpan.",
    invalidThreshold: "Masukkan nilai ambang yang valid.",
    dhtStatus: "Sensor DHT11",
    automaticFan: "Kipas dikendalikan otomatis berdasarkan suhu."
  },

  en: {
    title: "Smart Watering",
    subtitle: "Plant Watering Monitoring & Control",
    simulation: "Simulation",
    soilSensor: "SOIL SENSOR",
    soilMoisture: "Soil Moisture",
    moisture: "Moisture",
    soilGood: "Soil Moisture is Good",
    soilDry: "Soil is Dry",
    soilVeryDry: "Soil is Very Dry",
    sensorUpdate: "Sensor data is periodically updated in simulation mode.",
    actuator: "ACTUATOR",
    pumpStatus: "Pump Status",
    pumpOff: "Pump OFF",
    pumpOn: "Pump ON",
    notWatering: "Not watering",
    watering: "Currently watering",
    turnOn: "Turn ON",
    turnOff: "Turn OFF",
    sensorData: "SENSOR DATA",
    moistureChart: "Moisture Chart",
    chartDescription: "Real-time soil moisture changes.",
    soilMoistureLegend: "● Soil moisture",
    current: "Current",
    systemSettings: "SYSTEM SETTINGS",
    wateringMode: "Watering Mode",
    modeDescription: "Choose how the pump is controlled.",
    mode: "Mode:",
    automatic: "Automatic",
    automaticDesc: "Pump is controlled based on soil moisture.",
    manual: "Manual",
    manualDesc: "Pump is controlled using buttons.",
    scheduled: "Scheduled",
    scheduledDesc: "Pump follows the configured schedule.",
    automaticDescription: "🤖 The system controls the pump based on soil moisture.",
    manualDescription: "👆 The pump can be controlled directly using buttons.",
    scheduledDescription: "⏰ The pump follows the configured watering schedule.",
    timeAutomation: "TIME AUTOMATION",
    pumpScheduling: "Pump Scheduling",
    scheduleDescription: "Set the time when the pump turns on and off.",
    pumpOn: "Pump ON",
    pumpOff: "Pump OFF",
    addSchedule: "Add Schedule",
    activityHistory: "ACTIVITY HISTORY",
    pumpLog: "Pump Log",
    logDescription: "Record of pump ON and OFF activity.",
    clearLog: "Clear Log",
    monitoring: "MONITORING",
    systemStatus: "System Status",
    active: "Active",
    pump: "Pump",
    off: "OFF",
    on: "ON",
    simulationMode: "Simulation Mode",
    simulationInfo: "The system is not connected to an ESP32. Sensor, pump, fan, schedule, and log data are running through browser simulation. Physical device integration will be done in the next stage.",
    scheduleAdded: "Schedule successfully added.",
    scheduleDeleted: "Schedule deleted.",
    logsCleared: "All pump logs have been deleted.",
    confirmClear: "Delete all pump logs?",
    noSchedule: "No schedules yet.",
    noLog: "No pump activity yet.",
    schedule: "Schedule",
    pumpTurnedOn: "Pump turned ON",
    pumpTurnedOff: "Pump turned OFF",
    dark: "Dark",
    light: "Light",
    temperature: "Ambient Temperature",
    waitingTemperature: "Waiting for temperature data",
    temperatureNormal: "Normal Temperature",
    temperatureHigh: "High Temperature",
    fan: "Fan",
    fanOn: "Fan ON",
    fanOff: "Fan OFF",
    fanActive: "Fan is active",
    fanInactive: "Fan is inactive",
    moistureThreshold: "Soil Moisture Threshold",
    temperatureThreshold: "Temperature Threshold",
    thresholdSettings: "Sensor Thresholds",
    thresholdDescription: "Set thresholds to automatically control the pump and fan.",
    moistureThresholdHelp: "The pump turns on when soil moisture falls below this value.",
    temperatureThresholdHelp: "The fan turns on when temperature exceeds this value.",
    saveSettings: "Save Settings",
    settingsSaved: "Settings successfully saved.",
    invalidThreshold: "Enter valid threshold values.",
    dhtStatus: "DHT11 Sensor",
    automaticFan: "The fan is automatically controlled based on temperature."
  }
};

function t(key) {
  return translations[currentLanguage]?.[key] || key;
}

/* LANGUAGE */
function setLanguage(language) {
  if (!["id", "en"].includes(language)) return;
  currentLanguage = language;
  localStorage.setItem("smartWateringLanguage", currentLanguage);
  applyTranslations();
}

function applyTranslations() {
  document.querySelectorAll("[data-i18n]").forEach(element => {
    element.textContent = t(element.getAttribute("data-i18n"));
  });

  const langID = document.getElementById("langID");
  const langEN = document.getElementById("langEN");

  if (langID) langID.classList.toggle("active", currentLanguage === "id");
  if (langEN) langEN.classList.toggle("active", currentLanguage === "en");

  updateThemeButton();
  updateMoistureUI();
  updateTemperatureUI();
  updatePumpUI();
  updateFanUI();
  updateModeUI();
  updateChartText();
  updateThresholdInputs();
  renderSchedules();
  renderLogs();
}

/* THEME */
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light";
  localStorage.setItem("smartWateringTheme", currentTheme);
  applyTheme();
}

function applyTheme() {
  document.documentElement.setAttribute(
    "data-theme",
    currentTheme === "dark" ? "dark" : "light"
  );
  updateThemeButton();
}

function updateThemeButton() {
  const button = document.getElementById("themeButton");
  if (!button) return;

  button.textContent = currentTheme === "dark" ? "☀️" : "🌙";
  button.title = currentTheme === "dark" ? t("light") : t("dark");
}

/* THRESHOLD SETTINGS */
function updateThresholdInputs() {
  const moistureInput = document.getElementById("moistureThreshold");
  const temperatureInput = document.getElementById("temperatureThreshold");

  if (moistureInput) moistureInput.value = moistureThreshold;
  if (temperatureInput) temperatureInput.value = temperatureThreshold;
}

function saveThresholds() {
  const moistureInput = document.getElementById("moistureThreshold");
  const temperatureInput = document.getElementById("temperatureThreshold");

  if (!moistureInput || !temperatureInput) return;

  const m = moistureInput.value.trim();
  const temp = temperatureInput.value.trim();

  const newM = Number(m);
  const newT = Number(temp);

  if (
    m === "" ||
    temp === "" ||
    !Number.isFinite(newM) ||
    !Number.isFinite(newT) ||
    newM < 0 ||
    newM > 100 ||
    newT < 0 ||
    newT > 80
  ) {
    alert(t("invalidThreshold"));
    updateThresholdInputs();
    return;
  }

  moistureThreshold = newM;
  temperatureThreshold = newT;

  localStorage.setItem("smartWateringMoistureThreshold", moistureThreshold);
  localStorage.setItem("smartWateringTemperatureThreshold", temperatureThreshold);

  automaticControl();
  automaticFanControl();
  updateMoistureUI();
  updateTemperatureUI();

  const message = document.getElementById("thresholdMessage");
  if (message) message.textContent = t("settingsSaved");
}

/* SENSOR SIMULATION */
function simulateMoisture() {
  moisture += Math.floor(Math.random() * 9) - 4;

  if (pumpStatus) {
    moisture += Math.floor(Math.random() * 4) + 1;
  } else {
    moisture -= Math.floor(Math.random() * 2);
  }

  moisture = Math.max(0, Math.min(100, moisture));

  moistureHistory.push(moisture);

  if (moistureHistory.length > 30) {
    moistureHistory.shift();
  }

  updateMoistureUI();
  updateChart();
  automaticControl();
}

function simulateTemperature() {
  temperature += Math.random() * 2 - 1;
  temperature = Math.max(20, Math.min(45, temperature));
  temperature = Number(temperature.toFixed(1));

  automaticFanControl();
  updateTemperatureUI();
}

/* MOISTURE DISPLAY */
function updateMoistureUI() {
  const value = document.getElementById("moisture");
  if (value) value.textContent = Math.round(moisture);

  const gauge = document.getElementById("moistureGauge");

  if (gauge) {
    gauge.style.background =
      `conic-gradient(${getMoistureColor()} ${moisture}%, var(--primary-light) 0)`;
  }

  const condition = document.getElementById("condition");
  if (!condition) return;

  let text;
  let className;

  if (moisture < 20) {
    text = t("soilVeryDry");
    className = "condition danger";
  } else if (moisture < moistureThreshold) {
    text = t("soilDry");
    className = "condition warning";
  } else {
    text = t("soilGood");
    className = "condition good";
  }

  condition.className = className;
  condition.innerHTML = `<span>●</span><span>${text}</span>`;

  updateChartText();
}

function getMoistureColor() {
  if (moisture < 20) return "var(--danger)";
  if (moisture < moistureThreshold) return "var(--warning)";
  return "var(--primary)";
}

/* TEMPERATURE DISPLAY */
function updateTemperatureUI() {
  const value = document.getElementById("temperature");
  if (value) value.textContent = temperature.toFixed(1);

  const condition = document.getElementById("temperatureCondition");

  if (condition) {
    const high = temperature > temperatureThreshold;

    condition.className = high
      ? "condition warning"
      : "condition good";

    condition.innerHTML = `<span>●</span><span>${
      high ? t("temperatureHigh") : t("temperatureNormal")
    }</span>`;
  }

  const dhtStatus = document.getElementById("systemDhtStatus");

  if (dhtStatus) {
    dhtStatus.className = "online";
    dhtStatus.textContent = "● " + t("active");
  }
}

/* AUTOMATIC ACTUATOR CONTROL */
function automaticControl() {
  if (currentMode !== "auto") return;

  if (moisture < moistureThreshold && !pumpStatus) {
    setPumpState(true, false);
  } else if (moisture >= moistureThreshold && pumpStatus) {
    setPumpState(false, false);
  }
}

function automaticFanControl() {
  setFanState(temperature > temperatureThreshold);
}

/* PUMP */
function pumpControl(action) {
  if (currentMode === "auto") {
    alert(
      currentLanguage === "id"
        ? "Pompa dikendalikan otomatis berdasarkan kelembapan tanah."
        : "The pump is automatically controlled based on soil moisture."
    );
    return;
  }

  if (action === "on") setPumpState(true, true);
  if (action === "off") setPumpState(false, true);
}

function setPumpState(state, createLog = true) {
  const previous = pumpStatus;
  pumpStatus = state;

  updatePumpUI();

  if (createLog && previous !== state) {
    addLog(state ? t("pumpTurnedOn") : t("pumpTurnedOff"));
  }
}

function updatePumpUI() {
  const status = document.getElementById("pumpStatus");
  const systemStatus = document.getElementById("systemPumpStatus");

  if (status) {
    status.className = pumpStatus
      ? "pump-status on"
      : "pump-status off";

    status.innerHTML = pumpStatus
      ? `<div class="pump-status-icon">🟢</div>
         <div><strong>${t("pumpOn")}</strong>
         <span>${t("watering")}</span></div>`
      : `<div class="pump-status-icon">🔴</div>
         <div><strong>${t("pumpOff")}</strong>
         <span>${t("notWatering")}</span></div>`;
  }

  if (systemStatus) {
    systemStatus.className = pumpStatus ? "online" : "offline";
    systemStatus.innerHTML = pumpStatus
      ? `● ${t("on")}`
      : `● ${t("off")}`;
  }
}

/* FAN */
function setFanState(state) {
  fanStatus = state;
  updateFanUI();
}

function updateFanUI() {
  const status = document.getElementById("fanStatus");
  const systemStatus = document.getElementById("systemFanStatus");

  if (status) {
    status.className = fanStatus
      ? "pump-status on"
      : "pump-status off";

    status.innerHTML = fanStatus
      ? `<div class="pump-status-icon">🟢</div>
         <div><strong>${t("fanOn")}</strong>
         <span>${t("fanActive")}</span></div>`
      : `<div class="pump-status-icon">🔴</div>
         <div><strong>${t("fanOff")}</strong>
         <span>${t("fanInactive")}</span></div>`;
  }

  if (systemStatus) {
    systemStatus.className = fanStatus ? "online" : "offline";
    systemStatus.textContent = fanStatus
      ? "● " + t("on")
      : "● " + t("off");
  }
}

/* OPERATING MODE */
function setMode(mode) {
  if (!["auto", "manual", "schedule"].includes(mode)) return;

  currentMode = mode;
  updateModeUI();

  if (currentMode === "auto") {
    automaticControl();
  } else if (currentMode === "schedule") {
    checkSchedules();
  }
}

function updateModeUI() {
  document.querySelectorAll(".mode-button").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.mode === currentMode
    );
  });

  const description = document.getElementById("modeDescription");
  if (description) {
    const descriptions = {
      auto: t("automaticDescription"),
      manual: t("manualDescription"),
      schedule: t("scheduledDescription")
    };

    description.textContent = descriptions[currentMode];
  }

  const onButton = document.getElementById("pumpOnButton");
  const offButton = document.getElementById("pumpOffButton");

  const manual = currentMode === "manual";

  if (onButton) onButton.disabled = !manual;
  if (offButton) offButton.disabled = !manual;
}

/* MOISTURE CHART */
function updateChartText() {
  const current = document.getElementById("chartCurrent");
  if (current) {
    current.textContent = `${Math.round(moisture)}%`;
  }
}

function updateChart() {
  const line = document.getElementById("chartLine");
  const area = document.getElementById("chartArea");

  if (!line || !area) return;

  if (moistureHistory.length < 2) {
    moistureHistory.push(moisture);
  }

  const width = 600;
  const height = 180;
  const points = moistureHistory.map((value, index) => {
    const x =
      (index / Math.max(moistureHistory.length - 1, 1)) * width;
    const y = height - (value / 100) * height;

    return `${x},${y}`;
  });

  line.setAttribute("points", points.join(" "));

  area.setAttribute(
    "points",
    `0,${height} ${points.join(" ")} ${width},${height}`
  );

  updateChartText();
}

/* SCHEDULES */
function addSchedule(event) {
  if (event) event.preventDefault();

  const timeInput = document.getElementById("scheduleTime");
  const actionInput = document.getElementById("scheduleAction");

  if (!timeInput || !actionInput || !timeInput.value) return;

  const schedule = {
    id: Date.now(),
    time: timeInput.value,
    action: actionInput.value,
    executedDate: ""
  };

  schedules.push(schedule);
  saveSchedules();
  renderSchedules();

  timeInput.value = "";
  addLog(t("scheduleAdded"));
}

function deleteSchedule(id) {
  schedules = schedules.filter(schedule => schedule.id !== id);
  saveSchedules();
  renderSchedules();
  addLog(t("scheduleDeleted"));
}

function saveSchedules() {
  localStorage.setItem(
    "smartWateringSchedules",
    JSON.stringify(schedules)
  );
}

function renderSchedules() {
  const container = document.getElementById("scheduleList");
  if (!container) return;

  if (schedules.length === 0) {
    container.innerHTML = `<p>${t("noSchedule")}</p>`;
    return;
  }

  container.innerHTML = schedules.map(schedule => `
    <div class="schedule-item">
      <div>
        <strong>${schedule.time}</strong>
        <span>${schedule.action.toUpperCase()}</span>
      </div>
      <button onclick="deleteSchedule(${schedule.id})" type="button">
        ✕
      </button>
    </div>
  `).join("");
}

function checkSchedules() {
  if (currentMode !== "schedule") return;

  const now = new Date();
  const currentTime = now.toTimeString().slice(0, 5);
  const today = now.toISOString().slice(0, 10);

  schedules.forEach(schedule => {
    if (
      schedule.time === currentTime &&
      schedule.executedDate !== today
    ) {
      if (schedule.action === "on") {
        setPumpState(true, true);
      } else if (schedule.action === "off") {
        setPumpState(false, true);
      }

      schedule.executedDate = today;
      saveSchedules();
    }
  });
}

/* ACTIVITY LOG */
function addLog(message) {
  logs.unshift({
    id: Date.now(),
    message,
    time: new Date().toLocaleString(
      currentLanguage === "id" ? "id-ID" : "en-US"
    )
  });

  if (logs.length > 50) logs.pop();

  localStorage.setItem(
    "smartWateringLogs",
    JSON.stringify(logs)
  );

  renderLogs();
}

function renderLogs() {
  const container = document.getElementById("logList");
  if (!container) return;

  if (logs.length === 0) {
    container.innerHTML = `<p>${t("noLog")}</p>`;
    return;
  }

  container.innerHTML = logs.map(log => `
    <div class="log-item">
      <span>${log.message}</span>
      <small>${log.time}</small>
    </div>
  `).join("");
}

function clearLogs() {
  if (!confirm(t("confirmClear"))) return;

  logs = [];

  localStorage.setItem(
    "smartWateringLogs",
    JSON.stringify(logs)
  );

  renderLogs();
}

/* BUTTON EVENTS */
function initializeEventListeners() {
  const langID = document.getElementById("langID");
  const langEN = document.getElementById("langEN");
  const themeButton = document.getElementById("themeButton");

  const onButton = document.getElementById("pumpOnButton");
  const offButton = document.getElementById("pumpOffButton");

  const scheduleForm = document.getElementById("scheduleForm");
  const clearButton = document.getElementById("clearLogButton");
  const saveThresholdButton = document.getElementById("saveThresholdButton");

  if (langID) {
    langID.addEventListener("click", () => setLanguage("id"));
  }

  if (langEN) {
    langEN.addEventListener("click", () => setLanguage("en"));
  }

  if (themeButton) {
    themeButton.addEventListener("click", toggleTheme);
  }

  if (onButton) {
    onButton.addEventListener("click", () => pumpControl("on"));
  }

  if (offButton) {
    offButton.addEventListener("click", () => pumpControl("off"));
  }

  if (scheduleForm) {
    scheduleForm.addEventListener("submit", addSchedule);
  }

  if (clearButton) {
    clearButton.addEventListener("click", clearLogs);
  }

  if (saveThresholdButton) {
    saveThresholdButton.addEventListener("click", saveThresholds);
  }

  document.querySelectorAll(".mode-button").forEach(button => {
    button.addEventListener("click", () => {
      setMode(button.dataset.mode);
    });
  });
}

/* INITIALIZATION */
function initializeApp() {
  applyTheme();
  applyTranslations();
  initializeEventListeners();

  if (moistureHistory.length === 0) {
    moistureHistory = Array(10).fill(moisture);
  }

  updateMoistureUI();
  updateTemperatureUI();
  updatePumpUI();
  updateFanUI();
  updateChart();
  updateModeUI();
  renderSchedules();
  renderLogs();

  automaticControl();
  automaticFanControl();

  setInterval(simulateMoisture, 5000);
  setInterval(simulateTemperature, 5000);
  setInterval(checkSchedules, 1000);
}

document.addEventListener("DOMContentLoaded", initializeApp);

// Menunggu sampai koneksi Firebase di index.html siap
document.addEventListener("DOMContentLoaded", () => {
    // Pastikan variabel global dari index.html sudah ada
    if (!window.firebaseDB) {
        console.warn("Firebase belum terinisialisasi.");
        return;
    }

    const db = window.firebaseDB;

    // Daftar modul yang ingin dipantau (Modul 01, 02, dan 03)
    const moduli = ["MODUL_01", "MODUL_02", "MODUL_03"];

    moduli.forEach((modulId, index) => {
        const num = index + 1;
        const sensorRef = window.dbRef(db, `modules/${modulId}/sensor`);

        // Mendengarkan perubahan data sensor secara realtime
        window.dbOnValue(sensorRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                // Update ke elemen HTML (sesuaikan ID di HTML Anda jika berbeda)
                updateElement(`m${num}-temp`, data.temp);
                updateElement(`m${num}-hum`, data.hum);
                updateElement(`m${num}-soil`, data.soil_pct);
            }
        });
    });
});

// Fungsi bantu untuk memperbarui text HTML dengan aman
function updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) {
        el.innerText = value ?? '-';
    }
}

// Fungsi global untuk tombol kontrol (Pompa ON/OFF)
window.kontrolPerangkat = function(modulId, statusPompa) {
    if (!window.firebaseDB) return;
    
    // Pastikan window.dbSet tersedia, jika sebelumnya di index.html pakai `set`, 
    // Anda bisa tambahkan window.dbSet = set; di index.html atau gunakan langsung seperti di bawah:
    const commandRef = window.dbRef(window.firebaseDB, `modules/${modulId}/command`);
    
    // Menggunakan fungsi set dari Firebase yang dipanggil lewat window
    import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ set }) => {
        set(commandRef, {
            pump: statusPompa,
            fan: "OFF",
            id: Math.floor(Math.random() * 100)
        }).then(() => {
            console.log(`Perintah Pompa ${statusPompa} berhasil dikirim ke ${modulId}`);
        }).catch((error) => {
            console.error("Gagal mengirim perintah:", error);
        });
    });
};
// Fungsi untuk mengubah mode penyiraman (Auto / Manual)
window.setMode = function(modeValue) {
    if (!window.firebaseDB) return;

    // Tentukan path ke database untuk pengaturan mode (sesuaikan struktur database Anda, misal: settings/mode)
    const modeRef = window.dbRef(window.firebaseDB, 'settings/mode');

    import("https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js").then(({ set }) => {
        set(modeRef, modeValue.toUpperCase()).then(() => {
            console.log(`Mode berhasil diubah ke: ${modeValue}`);
        }).catch((error) => {
            console.error("Gagal mengubah mode:", error);
        });
    });
};

// Opsional: Mendengarkan perubahan mode dari database agar UI web selalu sinkron
document.addEventListener("DOMContentLoaded", () => {
    if (!window.firebaseDB) return;
    
    const modeRef = window.dbRef(window.firebaseDB, 'settings/mode');
    window.dbOnValue(modeRef, (snapshot) => {
        const currentMode = snapshot.val();
        const modeTextEl = document.getElementById('modeText');
        if (currentMode && modeTextEl) {
            modeTextEl.innerText = currentMode;
        }
    });
});