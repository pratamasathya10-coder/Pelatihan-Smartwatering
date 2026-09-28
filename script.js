/* =========================================================
   SMART WATERING
   SCRIPT.JS
   ========================================================= */


/* =========================================================
   GLOBAL STATE
   ========================================================= */

let currentLanguage =
    localStorage.getItem("smartWateringLanguage") || "id";

let currentTheme =
    localStorage.getItem("smartWateringTheme") || "light";

let currentMode = "auto";

let pumpStatus = false;

let moisture = 68;

let moistureHistory = [];

let schedules =
    JSON.parse(
        localStorage.getItem("smartWateringSchedules") || "[]"
    );

let logs =
    JSON.parse(
        localStorage.getItem("smartWateringLogs") || "[]"
    );


/* =========================================================
   TRANSLATION
   ========================================================= */

const translations = {

    id: {

        title:
            "Smart Watering",

        subtitle:
            "Monitoring & Kontrol Penyiraman Tanaman",

        simulation:
            "Simulasi",

        soilSensor:
            "SENSOR TANAH",

        soilMoisture:
            "Kelembapan Tanah",

        moisture:
            "Kelembapan",

        soilGood:
            "Tanah Cukup Lembap",

        soilDry:
            "Tanah Kering",

        soilVeryDry:
            "Tanah Sangat Kering",

        sensorUpdate:
            "Data sensor diperbarui secara berkala dalam mode simulasi.",

        actuator:
            "AKTUATOR",

        pumpStatus:
            "Status Pompa",

        pumpOff:
            "Pompa Mati",

        pumpOn:
            "Pompa Menyala",

        notWatering:
            "Tidak sedang menyiram",

        watering:
            "Sedang menyiram tanaman",

        turnOn:
            "Nyalakan",

        turnOff:
            "Matikan",

        sensorData:
            "DATA SENSOR",

        moistureChart:
            "Grafik Kelembapan",

        chartDescription:
            "Perubahan kelembapan tanah secara real-time.",

        soilMoistureLegend:
            "● Kelembapan tanah",

        current:
            "Saat ini",

        systemSettings:
            "PENGATURAN SISTEM",

        wateringMode:
            "Mode Penyiraman",

        modeDescription:
            "Pilih bagaimana pompa dikendalikan.",

        mode:
            "Mode:",

        automatic:
            "Otomatis",

        automaticDesc:
            "Pompa dikendalikan berdasarkan kelembapan tanah.",

        manual:
            "Manual",

        manualDesc:
            "Pompa dikendalikan menggunakan tombol.",

        scheduled:
            "Terjadwal",

        scheduledDesc:
            "Pompa mengikuti jadwal yang telah dibuat.",

        automaticDescription:
            "🤖 Sistem akan mengatur pompa berdasarkan kondisi kelembapan tanah.",

        manualDescription:
            "👆 Pompa dapat dikendalikan secara langsung menggunakan tombol.",

        scheduledDescription:
            "⏰ Pompa akan mengikuti jadwal penyiraman yang telah dibuat.",

        timeAutomation:
            "AUTOMASI WAKTU",

        pumpScheduling:
            "Penjadwalan Pompa",

        scheduleDescription:
            "Atur waktu pompa menyala dan mati.",

        pumpOn:
            "Pompa ON",

        pumpOff:
            "Pompa OFF",

        addSchedule:
            "Tambah Jadwal",

        activityHistory:
            "RIWAYAT AKTIVITAS",

        pumpLog:
            "Log Pompa",

        logDescription:
            "Catatan waktu pompa menyala dan mati.",

        clearLog:
            "Hapus Log",

        monitoring:
            "MONITORING",

        systemStatus:
            "Status Sistem",

        active:
            "Aktif",

        pump:
            "Pompa",

        off:
            "Mati",

        on:
            "Menyala",

        simulationMode:
            "Mode Simulasi",

        simulationInfo:
            "Sistem saat ini belum terhubung ke ESP32. Data sensor, pompa, jadwal dan log masih dijalankan melalui simulasi browser.",

        scheduleAdded:
            "Jadwal berhasil ditambahkan.",

        scheduleDeleted:
            "Jadwal dihapus.",

        logsCleared:
            "Semua log pompa telah dihapus.",

        confirmClear:
            "Hapus semua log pompa?",

        noSchedule:
            "Belum ada jadwal.",

        noLog:
            "Belum ada aktivitas pompa.",

        schedule:
            "Jadwal",

        pumpTurnedOn:
            "Pompa dinyalakan",

        pumpTurnedOff:
            "Pompa dimatikan",

        dark:
            "Dark",

        light:
            "Light"

    },


    en: {

        title:
            "Smart Watering",

        subtitle:
            "Plant Watering Monitoring & Control",

        simulation:
            "Simulation",

        soilSensor:
            "SOIL SENSOR",

        soilMoisture:
            "Soil Moisture",

        moisture:
            "Moisture",

        soilGood:
            "Soil Moisture is Good",

        soilDry:
            "Soil is Dry",

        soilVeryDry:
            "Soil is Very Dry",

        sensorUpdate:
            "Sensor data is periodically updated in simulation mode.",

        actuator:
            "ACTUATOR",

        pumpStatus:
            "Pump Status",

        pumpOff:
            "Pump OFF",

        pumpOn:
            "Pump ON",

        notWatering:
            "Not watering",

        watering:
            "Currently watering",

        turnOn:
            "Turn ON",

        turnOff:
            "Turn OFF",

        sensorData:
            "SENSOR DATA",

        moistureChart:
            "Moisture Chart",

        chartDescription:
            "Real-time soil moisture changes.",

        soilMoistureLegend:
            "● Soil moisture",

        current:
            "Current",

        systemSettings:
            "SYSTEM SETTINGS",

        wateringMode:
            "Watering Mode",

        modeDescription:
            "Choose how the pump is controlled.",

        mode:
            "Mode:",

        automatic:
            "Automatic",

        automaticDesc:
            "Pump is controlled based on soil moisture.",

        manual:
            "Manual",

        manualDesc:
            "Pump is controlled using buttons.",

        scheduled:
            "Scheduled",

        scheduledDesc:
            "Pump follows the configured schedule.",

        automaticDescription:
            "🤖 The system controls the pump based on soil moisture.",

        manualDescription:
            "👆 The pump can be controlled directly using the buttons.",

        scheduledDescription:
            "⏰ The pump follows the configured watering schedule.",

        timeAutomation:
            "TIME AUTOMATION",

        pumpScheduling:
            "Pump Scheduling",

        scheduleDescription:
            "Set the time when the pump turns on and off.",

        pumpOn:
            "Pump ON",

        pumpOff:
            "Pump OFF",

        addSchedule:
            "Add Schedule",

        activityHistory:
            "ACTIVITY HISTORY",

        pumpLog:
            "Pump Log",

        logDescription:
            "Record of pump ON and OFF activity.",

        clearLog:
            "Clear Log",

        monitoring:
            "MONITORING",

        systemStatus:
            "System Status",

        active:
            "Active",

        pump:
            "Pump",

        off:
            "OFF",

        on:
            "ON",

        simulationMode:
            "Simulation Mode",

        simulationInfo:
            "The system is currently not connected to an ESP32. Sensor, pump, schedule and log data are running through browser simulation.",

        scheduleAdded:
            "Schedule successfully added.",

        scheduleDeleted:
            "Schedule deleted.",

        logsCleared:
            "All pump logs have been deleted.",

        confirmClear:
            "Delete all pump logs?",

        noSchedule:
            "No schedules yet.",

        noLog:
            "No pump activity yet.",

        schedule:
            "Schedule",

        pumpTurnedOn:
            "Pump turned ON",

        pumpTurnedOff:
            "Pump turned OFF",

        dark:
            "Dark",

        light:
            "Light"

    }

};


/* =========================================================
   TRANSLATION HELPER
   ========================================================= */

function t(key) {

    return (
        translations[currentLanguage][key] ||
        key
    );

}


/* =========================================================
   LANGUAGE
   ========================================================= */

function setLanguage(language) {

    if (
        language !== "id" &&
        language !== "en"
    ) {
        return;
    }

    currentLanguage = language;

    localStorage.setItem(
        "smartWateringLanguage",
        currentLanguage
    );

    applyTranslations();

}


/* =========================================================
   APPLY TRANSLATIONS
   ========================================================= */

function applyTranslations() {

    document
        .querySelectorAll("[data-i18n]")
        .forEach(element => {

            const key =
                element.getAttribute("data-i18n");

            element.textContent =
                t(key);

        });


    const langID =
        document.getElementById("langID");

    const langEN =
        document.getElementById("langEN");


    if (langID) {

        langID.classList.toggle(
            "active",
            currentLanguage === "id"
        );

    }


    if (langEN) {

        langEN.classList.toggle(
            "active",
            currentLanguage === "en"
        );

    }


    updateThemeButton();

    updateMoistureUI();

    updatePumpUI();

    updateModeUI();

    updateChartText();

    renderSchedules();

    renderLogs();

}


/* =========================================================
   DARK / LIGHT MODE
   ========================================================= */

function toggleTheme() {

    currentTheme =
        currentTheme === "light"
            ? "dark"
            : "light";


    localStorage.setItem(
        "smartWateringTheme",
        currentTheme
    );


    applyTheme();

}


function applyTheme() {

    document.documentElement
        .setAttribute(
            "data-theme",
            currentTheme === "dark"
                ? "dark"
                : "light"
        );


    updateThemeButton();

}


function updateThemeButton() {

    const button =
        document.getElementById("themeButton");


    if (!button) {
        return;
    }


    if (currentTheme === "dark") {

        button.textContent = "☀️";

        button.title =
            t("light");

    } else {

        button.textContent = "🌙";

        button.title =
            t("dark");

    }

}


/* =========================================================
   MOISTURE SIMULATION
   ========================================================= */

function simulateMoisture() {

    let change =
        Math.floor(
            Math.random() * 9
        ) - 4;


    moisture += change;


    /*
       Jika pompa menyala,
       kelembapan cenderung naik.
    */

    if (pumpStatus) {

        moisture +=
            Math.floor(
                Math.random() * 4
            ) + 1;

    } else {

        /*
           Jika pompa mati,
           kelembapan perlahan turun.
        */

        moisture -=
            Math.floor(
                Math.random() * 2
            );

    }


    moisture =
        Math.max(
            0,
            Math.min(
                100,
                moisture
            )
        );


    /*
       Simpan histori grafik
    */

    moistureHistory.push(moisture);


    if (
        moistureHistory.length > 30
    ) {

        moistureHistory.shift();

    }


    updateMoistureUI();

    updateChart();

    automaticControl();

}


/* =========================================================
   MOISTURE UI
   ========================================================= */

function updateMoistureUI() {

    const moistureElement =
        document.getElementById("moisture");


    if (moistureElement) {

        moistureElement.textContent =
            Math.round(moisture);

    }


    const gauge =
        document.getElementById(
            "moistureGauge"
        );


    if (gauge) {

        gauge.style.background =
            `conic-gradient(
                ${getMoistureColor()} ${moisture}%,
                var(--primary-light) 0
            )`;

    }


    const condition =
        document.getElementById(
            "condition"
        );


    if (!condition) {
        return;
    }


    let text;
    let className;


    if (moisture < 20) {

        text = t("soilVeryDry");

        className =
            "condition danger";

    } else if (moisture < 40) {

        text = t("soilDry");

        className =
            "condition warning";

    } else {

        text = t("soilGood");

        className =
            "condition good";

    }


    condition.className =
        className;


    condition.innerHTML =
        `<span>●</span>
         <span>${text}</span>`;


    updateChartText();

}


/* =========================================================
   MOISTURE COLOR
   ========================================================= */

function getMoistureColor() {

    if (moisture < 20) {

        return "var(--danger)";

    }


    if (moisture < 40) {

        return "var(--warning)";

    }


    return "var(--primary)";

}


/* =========================================================
   AUTOMATIC CONTROL
   ========================================================= */

function automaticControl() {

    if (currentMode !== "auto") {
        return;
    }


    /*
       Jika kelembapan di bawah 40%,
       pompa otomatis menyala.

       Jika sudah >= 40%,
       pompa mati.
    */

    if (
        moisture < 40 &&
        !pumpStatus
    ) {

        setPumpState(
            true,
            false
        );

    }


    if (
        moisture >= 40 &&
        pumpStatus
    ) {

        setPumpState(
            false,
            false
        );

    }

}


/* =========================================================
   PUMP CONTROL
   ========================================================= */

function pumpControl(action) {

    /*
       Mode otomatis:
       tombol manual tidak digunakan.
    */

    if (currentMode === "auto") {

        alert(
            currentLanguage === "id"
                ? "Pompa dikendalikan otomatis berdasarkan kelembapan tanah."
                : "The pump is automatically controlled based on soil moisture."
        );

        return;

    }


    if (action === "on") {

        setPumpState(
            true,
            true
        );

    }


    if (action === "off") {

        setPumpState(
            false,
            true
        );

    }

}


/* =========================================================
   SET PUMP STATE
   ========================================================= */

function setPumpState(
    state,
    createLog = true
) {

    const previousState =
        pumpStatus;


    pumpStatus =
        state;


    updatePumpUI();


    if (
        createLog &&
        previousState !== state
    ) {

        addLog(
            state
                ? t("pumpTurnedOn")
                : t("pumpTurnedOff")
        );

    }

}


/* =========================================================
   PUMP UI
   ========================================================= */

function updatePumpUI() {

    const status =
        document.getElementById(
            "pumpStatus"
        );


    const systemStatus =
        document.getElementById(
            "systemPumpStatus"
        );


    if (status) {

        if (pumpStatus) {

            status.className =
                "pump-status on";


            status.innerHTML = `

                <div class="pump-status-icon">
                    🟢
                </div>

                <div>

                    <strong>
                        ${t("pumpOn")}
                    </strong>

                    <span>
                        ${t("watering")}
                    </span>

                </div>

            `;

        } else {

            status.className =
                "pump-status off";


            status.innerHTML = `

                <div class="pump-status-icon">
                    🔴
                </div>

                <div>

                    <strong>
                        ${t("pumpOff")}
                    </strong>

                    <span>
                        ${t("notWatering")}
                    </span>

                </div>

            `;

        }

    }


    if (systemStatus) {

        systemStatus.className =
            pumpStatus
                ? "online"
                : "offline";


        systemStatus.innerHTML =
            pumpStatus
                ? `● ${t("on")}`
                : `● ${t("off")}`;

    }

}


/* =========================================================
   MODE
   ========================================================= */

function setMode(mode) {

    if (
        mode !== "auto" &&
        mode !== "manual" &&
        mode !== "schedule"
    ) {

        return;

    }


    currentMode =
        mode;


    /*
       Jika mode berubah ke AUTO,
       langsung jalankan kontrol otomatis.
    */

    if (currentMode === "auto") {

        automaticControl();

    }


    updateModeUI();

}


/* =========================================================
   MODE UI
   ========================================================= */

function updateModeUI() {

    const autoButton =
        document.getElementById(
            "autoButton"
        );

    const manualButton =
        document.getElementById(
            "manualButton"
        );

    const scheduleButton =
        document.getElementById(
            "scheduleButton"
        );


    if (autoButton) {

        autoButton.classList.toggle(
            "active",
            currentMode === "auto"
        );

    }


    if (manualButton) {

        manualButton.classList.toggle(
            "active",
            currentMode === "manual"
        );

    }


    if (scheduleButton) {

        scheduleButton.classList.toggle(
            "active",
            currentMode === "schedule"
        );

    }


    const modeText =
        document.getElementById(
            "modeText"
        );


    if (modeText) {

        if (currentMode === "auto") {

            modeText.textContent =
                currentLanguage === "id"
                    ? "OTOMATIS"
                    : "AUTOMATIC";

        }

        if (currentMode === "manual") {

            modeText.textContent =
                currentLanguage === "id"
                    ? "MANUAL"
                    : "MANUAL";

        }

        if (currentMode === "schedule") {

            modeText.textContent =
                currentLanguage === "id"
                    ? "TERJADWAL"
                    : "SCHEDULED";

        }

    }


    const description =
        document.getElementById(
            "modeDescription"
        );


    if (!description) {
        return;
    }


    if (currentMode === "auto") {

        description.textContent =
            t("automaticDescription");

    }


    if (currentMode === "manual") {

        description.textContent =
            t("manualDescription");

    }


    if (currentMode === "schedule") {

        description.textContent =
            t("scheduledDescription");

    }

}


/* =========================================================
   CHART
   ========================================================= */

function updateChart() {

    const line =
        document.getElementById(
            "chartLine"
        );


    const area =
        document.getElementById(
            "chartArea"
        );


    if (
        !line ||
        !area ||
        moistureHistory.length === 0
    ) {

        return;

    }


    const chartLeft = 50;
    const chartRight = 780;

    const chartTop = 20;
    const chartBottom = 260;


    const width =
        chartRight - chartLeft;


    const height =
        chartBottom - chartTop;


    const points =
        moistureHistory.map(
            (value, index) => {

                let x;


                if (
                    moistureHistory.length === 1
                ) {

                    x = chartLeft;

                } else {

                    x =
                        chartLeft +
                        (
                            index /
                            (
                                moistureHistory.length - 1
                            )
                        ) *
                        width;

                }


                const y =
                    chartBottom -
                    (
                        value / 100
                    ) *
                    height;


                return `${x},${y}`;

            }
        );


    line.setAttribute(
        "points",
        points.join(" ")
    );


    const firstPoint =
        points[0];


    const lastPoint =
        points[points.length - 1];


    if (
        firstPoint &&
        lastPoint
    ) {

        const areaPoints =
            `${firstPoint}
             ${points.slice(1).join(" ")}
             ${chartRight},${chartBottom}
             ${chartLeft},${chartBottom}`;


        area.setAttribute(
            "points",
            areaPoints
        );

    }

}


/* =========================================================
   CHART TEXT
   ========================================================= */

function updateChartText() {

    const current =
        document.getElementById(
            "chartCurrent"
        );


    if (current) {

        current.textContent =
            `${t("current")}: ${Math.round(moisture)}%`;

    }

}


/* =========================================================
   SCHEDULE
   ========================================================= */

function addSchedule() {

    const start =
        document.getElementById(
            "startTime"
        ).value;


    const end =
        document.getElementById(
            "endTime"
        ).value;


    if (!start || !end) {

        alert(
            currentLanguage === "id"
                ? "Silakan isi waktu ON dan OFF."
                : "Please enter the ON and OFF time."
        );

        return;

    }


    const schedule = {

        id:
            Date.now(),

        start:
            start,

        end:
            end

    };


    schedules.push(
        schedule
    );


    saveSchedules();

    renderSchedules();


    alert(
        t("scheduleAdded")
    );

}


/* =========================================================
   SAVE SCHEDULE
   ========================================================= */

function saveSchedules() {

    localStorage.setItem(
        "smartWateringSchedules",
        JSON.stringify(schedules)
    );

}


/* =========================================================
   DELETE SCHEDULE
   ========================================================= */

function deleteSchedule(id) {

    schedules =
        schedules.filter(
            schedule =>
                schedule.id !== id
        );


    saveSchedules();

    renderSchedules();

}


/* =========================================================
   RENDER SCHEDULES
   ========================================================= */

function renderSchedules() {

    const list =
        document.getElementById(
            "scheduleList"
        );


    if (!list) {
        return;
    }


    if (schedules.length === 0) {

        list.innerHTML = `

            <div class="empty-log">
                ${t("noSchedule")}
            </div>

        `;

        return;

    }


    list.innerHTML =
        schedules
            .map(
                schedule => `

                <div class="schedule-item">

                    <div>

                        <div class="schedule-time">

                            ${schedule.start}
                            →
                            ${schedule.end}

                        </div>

                        <div class="schedule-label">

                            ${t("schedule")}

                        </div>

                    </div>


                    <button
                        class="delete-schedule"
                        onclick="deleteSchedule(${schedule.id})"
                        title="${t("scheduleDeleted")}"
                    >

                        ×

                    </button>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   LOG
   ========================================================= */

function addLog(action) {

    const now =
        new Date();


    const time =
        now.toLocaleTimeString(
            currentLanguage === "id"
                ? "id-ID"
                : "en-US",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    logs.unshift({

        id:
            Date.now(),

        action:
            action,

        time:
            time

    });


    /*
       Simpan maksimal 30 log
    */

    logs =
        logs.slice(
            0,
            30
        );


    localStorage.setItem(
        "smartWateringLogs",
        JSON.stringify(logs)
    );


    renderLogs();

}


/* =========================================================
   RENDER LOGS
   ========================================================= */

function renderLogs() {

    const container =
        document.getElementById(
            "pumpLog"
        );


    if (!container) {
        return;
    }


    if (logs.length === 0) {

        container.innerHTML = `

            <div class="empty-log">
                ${t("noLog")}
            </div>

        `;

        return;

    }


    container.innerHTML =
        logs
            .map(
                log => {

                    const isOn =
                        log.action
                            .toLowerCase()
                            .includes(
                                "on"
                            );


                    return `

                    <div class="log-item">

                        <div class="log-left">

                            <div class="log-icon">

                                ${
                                    isOn
                                        ? "💧"
                                        : "⛔"
                                }

                            </div>

                            <div>

                                <div class="log-title">

                                    ${log.action}

                                </div>

                                <div class="log-time">

                                    ${log.time}

                                </div>

                            </div>

                        </div>


                        <div class="log-status">

                            ${
                                isOn
                                    ? t("on")
                                    : t("off")
                            }

                        </div>

                    </div>

                    `;

                }
            )
            .join("");

}


/* =========================================================
   CLEAR LOG
   ========================================================= */

function clearLogs() {

    if (
        !confirm(
            t("confirmClear")
        )
    ) {

        return;

    }


    logs = [];


    localStorage.setItem(
        "smartWateringLogs",
        JSON.stringify(logs)
    );


    renderLogs();


    alert(
        t("logsCleared")
    );

}


/* =========================================================
   INITIALIZATION
   ========================================================= */

function initialize() {

    /*
       Terapkan tema terlebih dahulu
    */

    applyTheme();


    /*
       Isi histori awal grafik
    */

    for (
        let i = 0;
        i < 15;
        i++
    ) {

        moistureHistory.push(
            moisture +
            Math.floor(
                Math.random() * 9
            ) -
            4
        );

    }


    /*
       Pastikan nilai histori
       tetap 0 - 100
    */

    moistureHistory =
        moistureHistory.map(
            value =>
                Math.max(
                    0,
                    Math.min(
                        100,
                        value
                    )
                )
        );


    /*
       Tampilkan UI
    */

    applyTranslations();

    updateMoistureUI();

    updatePumpUI();

    updateModeUI();

    updateChart();

    renderSchedules();

    renderLogs();

}


/* =========================================================
   SIMULASI SENSOR
   ========================================================= */

setInterval(
    simulateMoisture,
    3000
);


/* =========================================================
   START APPLICATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    initialize
);