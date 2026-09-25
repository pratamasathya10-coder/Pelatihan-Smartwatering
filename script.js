let moisture = 68;
let currentMode = "auto";
let pumpStatus = false;


// ================================
// UPDATE KELEMBAPAN
// ================================

function updateMoisture() {

    document.getElementById("moisture").innerText = moisture;

    document.getElementById("progressBar").style.width =
        moisture + "%";


    const condition =
        document.getElementById("condition");


    if (moisture < 20) {

        condition.innerHTML =
            "🔴 Tanah Sangat Kering";

        condition.className =
            "condition danger";

    }

    else if (moisture < 40) {

        condition.innerHTML =
            "🟡 Tanah Kering";

        condition.className =
            "condition warning";

    }

    else {

        condition.innerHTML =
            "🟢 Tanah Cukup Lembap";

        condition.className =
            "condition good";
    }
}


// ================================
// GANTI MODE
// ================================

function setMode(mode) {

    currentMode = mode;

    const autoButton =
        document.getElementById("autoButton");

    const manualButton =
        document.getElementById("manualButton");


    if (mode === "auto") {

        autoButton.classList.add("active");

        manualButton.classList.remove("active");

        document.getElementById("modeText")
            .innerText = "OTOMATIS";

    }

    else {

        manualButton.classList.add("active");

        autoButton.classList.remove("active");

        document.getElementById("modeText")
            .innerText = "MANUAL";
    }
}


// ================================
// KONTROL POMPA
// ================================

function pumpControl(status) {

    // Pompa manual hanya boleh
    // dikontrol pada mode MANUAL

    if (currentMode !== "manual") {

        alert(
            "Pompa manual hanya dapat dikontrol pada mode MANUAL."
        );

        return;
    }


    if (status === "on") {

        pumpStatus = true;

    }

    else {

        pumpStatus = false;

    }


    updatePump();
}


// ================================
// UPDATE STATUS POMPA
// ================================

function updatePump() {

    const pump =
        document.getElementById("pumpStatus");

    const systemPump =
        document.getElementById("systemPumpStatus");


    if (pumpStatus) {

        pump.innerHTML =
            "🟢 POMPA MENYALA";

        pump.className =
            "pump-status on";

        systemPump.innerHTML =
            "🟢 Menyala";

    }

    else {

        pump.innerHTML =
            "🔴 POMPA MATI";

        pump.className =
            "pump-status off";

        systemPump.innerHTML =
            "🔴 Mati";
    }
}


// ================================
// SIMULASI SENSOR
// ================================

function simulateSensor() {

    // Membuat nilai sensor
    // antara 10 - 90%

    moisture =
        Math.floor(Math.random() * 81) + 10;

    updateMoisture();


    // Jika mode OTOMATIS,
    // pompa mengikuti kelembapan

    if (currentMode === "auto") {

        if (moisture < 40) {

            pumpStatus = true;

        }

        else {

            pumpStatus = false;

        }

        updatePump();
    }
}


// ================================
// JALANKAN PROGRAM
// ================================

updateMoisture();

updatePump();


// Simulasi sensor setiap 3 detik

setInterval(simulateSensor, 3000);