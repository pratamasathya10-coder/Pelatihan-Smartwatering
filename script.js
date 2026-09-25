// ========================================
// SMART WATERING
// SIMULASI SENSOR KELEMBAPAN
// ========================================


// ========================================
// DATA SISTEM
// ========================================

let moisture = 68;

let currentMode = "auto";

let pumpStatus = false;


// ========================================
// UPDATE KELEMBAPAN
// ========================================

function updateMoisture() {

    const moistureText =
        document.getElementById("moisture");

    const gauge =
        document.getElementById("moistureGauge");

    const condition =
        document.getElementById("condition");


    // Tampilkan nilai kelembapan

    moistureText.innerText = moisture;


    // ====================================
    // UPDATE GAUGE
    // ====================================

    gauge.style.background =
        `conic-gradient(
            #4a9de2 ${moisture}%,
            #e4edf5 ${moisture}%
        )`;


    // ====================================
    // KONDISI TANAH
    // ====================================

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
}



// ========================================
// MODE OTOMATIS / MANUAL
// ========================================

function setMode(mode) {

    currentMode = mode;


    const autoButton =
        document.getElementById("autoButton");

    const manualButton =
        document.getElementById("manualButton");

    const modeText =
        document.getElementById("modeText");

    const description =
        document.getElementById("modeDescription");


    // ====================================
    // MODE OTOMATIS
    // ====================================

    if (mode === "auto") {

        autoButton.classList.add("active");

        manualButton.classList.remove("active");

        modeText.innerText =
            "OTOMATIS";


        description.innerHTML =
            "🤖 Sistem akan mengatur pompa berdasarkan kondisi kelembapan tanah.";


        automaticPumpControl();

    }


    // ====================================
    // MODE MANUAL
    // ====================================

    else {

        manualButton.classList.add("active");

        autoButton.classList.remove("active");

        modeText.innerText =
            "MANUAL";


        description.innerHTML =
            "👆 Gunakan tombol pompa untuk mengontrol penyiraman secara manual.";
    }
}



// ========================================
// KONTROL POMPA MANUAL
// ========================================

function pumpControl(status) {

    // Pompa manual hanya bisa
    // dikontrol ketika mode MANUAL

    if (currentMode !== "manual") {

        alert(
            "Pilih mode MANUAL terlebih dahulu untuk mengontrol pompa."
        );

        return;
    }


    if (status === "on") {

        pumpStatus = true;

    }

    else if (status === "off") {

        pumpStatus = false;
    }


    updatePump();
}



// ========================================
// KONTROL POMPA OTOMATIS
// ========================================

function automaticPumpControl() {

    // Jangan jalankan kontrol otomatis
    // kalau sedang mode manual

    if (currentMode !== "auto") {

        return;
    }


    // Sesuai logika ESP32:
    //
    // < 40%  = pompa ON
    // >= 40% = pompa OFF

    if (moisture < 40) {

        pumpStatus = true;

    }

    else {

        pumpStatus = false;
    }


    updatePump();
}



// ========================================
// UPDATE STATUS POMPA
// ========================================

function updatePump() {

    const pumpStatusElement =
        document.getElementById("pumpStatus");

    const systemPump =
        document.getElementById("systemPumpStatus");


    // ====================================
    // POMPA ON
    // ====================================

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


    // ====================================
    // POMPA OFF
    // ====================================

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
}



// ========================================
// SIMULASI SENSOR
// ========================================

function simulateSensor() {

    /*
       Membuat nilai kelembapan baru
       antara 10% sampai 90%.

       Contoh:
       24%
       37%
       65%
       82%
       dst.
    */

    moisture =
        Math.floor(
            Math.random() * 81
        ) + 10;


    console.log(
        "Kelembapan:",
        moisture + "%"
    );


    // Update tampilan

    updateMoisture();


    // Kalau AUTO,
    // pompa mengikuti kelembapan

    if (currentMode === "auto") {

        automaticPumpControl();
    }
}



// ========================================
// PROGRAM DIMULAI
// ========================================

console.log(
    "Smart Watering JavaScript aktif"
);


// Tampilkan nilai awal

updateMoisture();

updatePump();


// ========================================
// SIMULASI SETIAP 3 DETIK
// ========================================

setInterval(
    simulateSensor,
    3000
);