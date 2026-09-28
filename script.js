// ========================================
// SMART WATERING
// FRONTEND SIMULATION
// ========================================


// ========================================
// DATA SISTEM
// ========================================

let moisture = 68;

let currentMode = "auto";

let pumpStatus = false;

let previousPumpStatus = false;


// ========================================
// DATA GRAFIK
// ========================================

let moistureHistory = [];


// Buat data awal
for (let i = 0; i < 20; i++) {

    moistureHistory.push(
        55 + Math.floor(Math.random() * 25)
    );
}


// ========================================
// DATA JADWAL
// ========================================

let schedules =
    JSON.parse(
        localStorage.getItem("smartWateringSchedules")
    ) || [

        {
            start: "07:00",
            end: "07:10",
            active: true
        },

        {
            start: "17:00",
            end: "17:10",
            active: true
        }

    ];


// ========================================
// DATA LOG
// ========================================

let pumpLogs =
    JSON.parse(
        localStorage.getItem("smartWateringLogs")
    ) || [];


// ========================================
// SIMPAN DATA
// ========================================

function saveSchedules() {

    localStorage.setItem(
        "smartWateringSchedules",
        JSON.stringify(schedules)
    );
}


function saveLogs() {

    localStorage.setItem(
        "smartWateringLogs",
        JSON.stringify(pumpLogs)
    );
}


// ========================================
// KELEMBAPAN
// ========================================

function updateMoisture() {

    const moistureText =
        document.getElementById("moisture");

    const gauge =
        document.getElementById("moistureGauge");

    const condition =
        document.getElementById("condition");

    moistureText.innerText =
        moisture;


    gauge.style.background =
        `conic-gradient(
            #4a9de2 ${moisture}%,
            #e4edf5 ${moisture}%
        )`;


    // Kondisi tanah

    if (moisture < 20) {

        condition.innerHTML =
            "<span>●</span> Tanah Sangat Kering";

        condition.className =
            "condition danger";

    }

    else if (moisture < 40) {

        condition.innerHTML =
            "<span>●</span> Tanah Kering";

        condition.className =
            "condition warning";

    }

    else if (moisture < 80) {

        condition.innerHTML =
            "<span>●</span> Tanah Cukup Lembap";

        condition.className =
            "condition good";

    }

    else {

        condition.innerHTML =
            "<span>●</span> Tanah Sangat Lembap";

        condition.className =
            "condition good";
    }


    document.getElementById("chartCurrent")
        .innerText =
        "Saat ini: " + moisture + "%";
}


// ========================================
// GRAFIK
// ========================================

function updateChart() {

    const chartLine =
        document.getElementById("chartLine");

    const chartArea =
        document.getElementById("chartArea");


    const chartWidth = 730;

    const chartHeight = 240;

    const startX = 50;

    const startY = 20;


    let points = "";


    moistureHistory.forEach(
        (value, index) => {

            const x =
                startX +
                (
                    index /
                    (moistureHistory.length - 1)
                ) *
                chartWidth;


            const y =
                startY +
                chartHeight -
                (
                    value / 100
                ) *
                chartHeight;


            points +=
                `${x},${y} `;
        }
    );


    chartLine.setAttribute(
        "points",
        points
    );


    // Area grafik

    const firstPoint =
        points.trim().split(" ")[0];

    const lastPoint =
        points.trim().split(" ").slice(-1)[0];


    const areaPoints =
        `${firstPoint} ${points}
         780,260 50,260`;


    chartArea.setAttribute(
        "points",
        areaPoints
    );
}


// ========================================
// MODE
// ========================================

function setMode(mode) {

    currentMode = mode;


    const autoButton =
        document.getElementById("autoButton");

    const manualButton =
        document.getElementById("manualButton");

    const scheduleButton =
        document.getElementById("scheduleButton");

    const modeText =
        document.getElementById("modeText");

    const description =
        document.getElementById("modeDescription");


    autoButton.classList.remove("active");

    manualButton.classList.remove("active");

    scheduleButton.classList.remove("active");


    if (mode === "auto") {

        autoButton.classList.add("active");

        modeText.innerText =
            "OTOMATIS";

        description.innerHTML =
            "🤖 Sistem mengatur pompa berdasarkan kondisi kelembapan tanah.";

        automaticPumpControl();
    }


    else if (mode === "manual") {

        manualButton.classList.add("active");

        modeText.innerText =
            "MANUAL";

        description.innerHTML =
            "👆 Gunakan tombol pompa untuk mengontrol penyiraman secara manual.";
    }


    else {

        scheduleButton.classList.add("active");

        modeText.innerText =
            "TERJADWAL";

        description.innerHTML =
            "⏰ Pompa akan menyala dan mati mengikuti jadwal yang telah dibuat.";

        schedulePumpControl();
    }


    updatePumpButtons();
}


// ========================================
// MODE OTOMATIS
// ========================================

function automaticPumpControl() {

    if (currentMode !== "auto") {

        return;
    }


    if (moisture < 40) {

        setPump(true, "AUTO");

    }

    else {

        setPump(false, "AUTO");
    }
}


// ========================================
// MODE TERJADWAL
// ========================================

function schedulePumpControl() {

    if (currentMode !== "schedule") {

        return;
    }


    const now =
        new Date();


    const currentMinutes =
        now.getHours() * 60 +
        now.getMinutes();


    let shouldPump = false;


    schedules.forEach(
        schedule => {

            if (!schedule.active) {

                return;
            }


            const start =
                timeToMinutes(
                    schedule.start
                );


            const end =
                timeToMinutes(
                    schedule.end
                );


            if (
                currentMinutes >= start &&
                currentMinutes < end
            ) {

                shouldPump = true;
            }

        }
    );


    setPump(
        shouldPump,
        "JADWAL"
    );
}


// ========================================
// KONVERSI JAM
// ========================================

function timeToMinutes(time) {

    const parts =
        time.split(":");


    return (
        parseInt(parts[0]) * 60 +
        parseInt(parts[1])
    );
}


// ========================================
// MANUAL
// ========================================

function pumpControl(status) {

    if (currentMode !== "manual") {

        alert(
            "Pilih mode MANUAL terlebih dahulu."
        );

        return;
    }


    if (status === "on") {

        setPump(
            true,
            "MANUAL"
        );
    }


    else {

        setPump(
            false,
            "MANUAL"
        );
    }
}


// ========================================
// KONTROL POMPA
// ========================================

function setPump(status, source) {

    const changed =
        pumpStatus !== status;


    pumpStatus =
        status;


    updatePump();


    // Catat hanya jika status berubah

    if (changed) {

        addPumpLog(
            status,
            source
        );
    }
}


// ========================================
// TAMPILAN POMPA
// ========================================

function updatePump() {

    const pumpStatusElement =
        document.getElementById("pumpStatus");


    const systemPump =
        document.getElementById(
            "systemPumpStatus"
        );


    if (pumpStatus) {

        pumpStatusElement.className =
            "pump-status on";


        pumpStatusElement.innerHTML = `

            <div class="pump-status-icon">
                🟢
            </div>

            <div>

                <strong>
                    Pompa Menyala
                </strong>

                <span>
                    Sedang melakukan penyiraman
                </span>

            </div>

        `;


        systemPump.innerText =
            "● Menyala";

        systemPump.className =
            "online";
    }


    else {

        pumpStatusElement.className =
            "pump-status off";


        pumpStatusElement.innerHTML = `

            <div class="pump-status-icon">
                🔴
            </div>

            <div>

                <strong>
                    Pompa Mati
                </strong>

                <span>
                    Tidak sedang menyiram
                </span>

            </div>

        `;


        systemPump.innerText =
            "● Mati";

        systemPump.className =
            "offline";
    }


    updatePumpButtons();
}


// ========================================
// TOMBOL POMPA
// ========================================

function updatePumpButtons() {

    const onButton =
        document.getElementById(
            "pumpOnButton"
        );

    const offButton =
        document.getElementById(
            "pumpOffButton"
        );


    if (currentMode === "manual") {

        onButton.disabled = false;

        offButton.disabled = false;

        onButton.style.opacity = "1";

        offButton.style.opacity = "1";
    }

    else {

        onButton.disabled = true;

        offButton.disabled = true;

        onButton.style.opacity = ".5";

        offButton.style.opacity = ".5";
    }
}


// ========================================
// LOG POMPA
// ========================================

function addPumpLog(
    status,
    source
) {

    const now =
        new Date();


    const log = {

        date:
            now.toLocaleDateString(
                "id-ID"
            ),

        time:
            now.toLocaleTimeString(
                "id-ID"
            ),

        status:
            status
                ? "ON"
                : "OFF",

        source:
            source
    };


    pumpLogs.unshift(log);


    // Batasi 50 log

    if (pumpLogs.length > 50) {

        pumpLogs =
            pumpLogs.slice(0,50);
    }


    saveLogs();

    renderLogs();
}


// ========================================
// TAMPILKAN LOG
// ========================================

function renderLogs() {

    const container =
        document.getElementById(
            "pumpLog"
        );


    if (pumpLogs.length === 0) {

        container.innerHTML = `

            <div class="empty-log">

                Belum ada aktivitas pompa.

            </div>

        `;

        return;
    }


    container.innerHTML =
        pumpLogs.map(
            log => `

            <div class="log-item">

                <div class="log-left">

                    <div
                        class="log-icon
                        ${log.status === "ON"
                            ? "on"
                            : "off"}"
                    >

                        ${log.status === "ON"
                            ? "🟢"
                            : "🔴"}

                    </div>


                    <div class="log-main">

                        <strong>
                            Pompa ${log.status}
                        </strong>

                        <span>
                            ${log.date}
                            •
                            Mode ${log.source}
                        </span>

                    </div>

                </div>


                <div class="log-time">

                    ${log.time}

                </div>

            </div>

        `
        ).join("");
}


// ========================================
// HAPUS LOG
// ========================================

function clearLogs() {

    if (
        !confirm(
            "Hapus seluruh riwayat pompa?"
        )
    ) {

        return;
    }


    pumpLogs = [];

    saveLogs();

    renderLogs();
}


// ========================================
// TAMBAH JADWAL
// ========================================

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
            "Silakan isi waktu ON dan OFF."
        );

        return;
    }


    if (
        timeToMinutes(end) <=
        timeToMinutes(start)
    ) {

        alert(
            "Waktu OFF harus lebih besar dari waktu ON."
        );

        return;
    }


    schedules.push({

        start:
            start,

        end:
            end,

        active:
            true

    });


    saveSchedules();

    renderSchedules();


    alert(
        "Jadwal berhasil ditambahkan."
    );
}


// ========================================
// TAMPILKAN JADWAL
// ========================================

function renderSchedules() {

    const container =
        document.getElementById(
            "scheduleList"
        );


    if (schedules.length === 0) {

        container.innerHTML = `

            <div class="empty-schedule">

                Belum ada jadwal pompa.

            </div>

        `;

        return;
    }


    container.innerHTML =
        schedules.map(
            (schedule,index) => `

            <div class="schedule-item">

                <div>

                    <div class="schedule-time">

                        ${schedule.start}

                        <span>→</span>

                        ${schedule.end}

                    </div>

                    <div class="schedule-status">

                        ● Jadwal Aktif

                    </div>

                </div>


                <button
                    class="delete-schedule"
                    onclick="deleteSchedule(${index})"
                >

                    Hapus

                </button>

            </div>

        `
        ).join("");
}


// ========================================
// HAPUS JADWAL
// ========================================

function deleteSchedule(index) {

    schedules.splice(
        index,
        1
    );


    saveSchedules();

    renderSchedules();
}


// ========================================
// SIMULASI SENSOR
// ========================================

function simulateSensor() {

    /*
       Simulasi perubahan kelembapan.

       Jika pompa ON:
       kelembapan cenderung naik.

       Jika pompa OFF:
       kelembapan cenderung turun.
    */


    if (pumpStatus) {

        moisture +=
            Math.floor(
                Math.random() * 5
            ) + 1;

    }

    else {

        moisture -=
            Math.floor(
                Math.random() * 4
            );
    }


    // Batasi 10 - 95%

    moisture =
        Math.max(
            10,
            Math.min(
                95,
                moisture
            )
        );


    moistureHistory.push(
        moisture
    );


    // Maksimal 30 titik

    if (
        moistureHistory.length > 30
    ) {

        moistureHistory.shift();
    }


    updateMoisture();

    updateChart();


    // Kontrol sesuai mode

    if (currentMode === "auto") {

        automaticPumpControl();
    }

    else if (
        currentMode === "schedule"
    ) {

        schedulePumpControl();
    }
}


// ========================================
// JAM REAL-TIME
// ========================================

function updateScheduleStatus() {

    if (
        currentMode === "schedule"
    ) {

        schedulePumpControl();
    }
}


// ========================================
// START SYSTEM
// ========================================

updateMoisture();

updateChart();

updatePump();

renderSchedules();

renderLogs();

updatePumpButtons();


// Sensor berubah setiap 3 detik

setInterval(
    simulateSensor,
    3000
);


// Cek jadwal setiap 1 detik

setInterval(
    updateScheduleStatus,
    1000
);


console.log(
    "Smart Watering Simulation aktif"
);