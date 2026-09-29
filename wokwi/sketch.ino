// ==========================================
// SMART WATERING - ESP32-S3
// ==========================================

// ---------- PIN ----------
const int pinSensorTanah = 3;
const int pinPompa       = 16;

const int pinTombolMode  = 18;
const int pinPompaON     = 19;
const int pinPompaOFF    = 20;

const int pinBuzzer      = 21;


// ---------- PENGATURAN ----------
const int batasKelembapan = 40;
const int batasSangatKering = 20;


// ---------- MODE ----------
bool modeManual = false;


// ---------- STATUS POMPA ----------
bool pompaON = false;


// ==========================================
// FUNGSI BUZZER
// ==========================================

void beep() {

  tone(pinBuzzer, 2000);
  delay(150);
  noTone(pinBuzzer);

}


// ==========================================
// SETUP
// ==========================================

void setup() {

  Serial.begin(115200);

  // Pompa / LED
  pinMode(pinPompa, OUTPUT);
  digitalWrite(pinPompa, LOW);

  // Tombol
  pinMode(pinTombolMode, INPUT_PULLUP);
  pinMode(pinPompaON, INPUT_PULLUP);
  pinMode(pinPompaOFF, INPUT_PULLUP);

  // Buzzer
  pinMode(pinBuzzer, OUTPUT);
  noTone(pinBuzzer);


  Serial.println("==============================");
  Serial.println("      SMART WATERING ESP32");
  Serial.println("==============================");
  Serial.println("Mode awal: OTOMATIS");

}


// ==========================================
// LOOP
// ==========================================

void loop() {

  // ----------------------------------------
  // 1. BACA SENSOR
  // ----------------------------------------

  int nilaiSensor = analogRead(pinSensorTanah);

  int kelembapan = map(
    nilaiSensor,
    4095,
    0,
    0,
    100
  );

  kelembapan = constrain(
    kelembapan,
    0,
    100
  );


  // ----------------------------------------
  // 2. TOMBOL MODE
  // ----------------------------------------

  if (digitalRead(pinTombolMode) == LOW) {

    modeManual = !modeManual;

    beep();

    Serial.println();
    Serial.println(">>> MODE BERUBAH <<<");

    if (modeManual) {

      Serial.println("Mode: MANUAL");

    } 
    else {

      Serial.println("Mode: OTOMATIS");

    }

    // Tunggu tombol dilepas
    while (digitalRead(pinTombolMode) == LOW) {
      delay(10);
    }

    delay(200);
  }


  // ----------------------------------------
  // 3. MODE OTOMATIS
  // ----------------------------------------

  if (modeManual == false) {

    if (kelembapan < batasKelembapan) {

      pompaON = true;

    } 
    else {

      pompaON = false;

    }

  }


  // ----------------------------------------
  // 4. MODE MANUAL
  // ----------------------------------------

  else {

    // Tombol POMPA ON
    if (digitalRead(pinPompaON) == LOW) {

      pompaON = true;

      beep();

      Serial.println(">>> POMPA MANUAL: ON");

      while (digitalRead(pinPompaON) == LOW) {
        delay(10);
      }

      delay(200);
    }


    // Tombol POMPA OFF
    if (digitalRead(pinPompaOFF) == LOW) {

      pompaON = false;

      beep();

      Serial.println(">>> POMPA MANUAL: OFF");

      while (digitalRead(pinPompaOFF) == LOW) {
        delay(10);
      }

      delay(200);
    }

  }


  // ----------------------------------------
  // 5. PERINGATAN TANAH SANGAT KERING
  // ----------------------------------------

  if (kelembapan < batasSangatKering) {

    // Buzzer berbunyi pendek
    // sebagai peringatan
    tone(pinBuzzer, 1500);
    delay(100);
    noTone(pinBuzzer);

  }


  // ----------------------------------------
  // 6. KONTROL POMPA
  // ----------------------------------------

  if (pompaON) {

    digitalWrite(pinPompa, HIGH);

  } 
  else {

    digitalWrite(pinPompa, LOW);

  }


  // ----------------------------------------
  // 7. MONITOR SERIAL
  // ----------------------------------------

  Serial.print("Sensor: ");
  Serial.print(nilaiSensor);

  Serial.print(" | Kelembapan: ");
  Serial.print(kelembapan);
  Serial.print("%");

  Serial.print(" | Mode: ");

  if (modeManual) {
    Serial.print("MANUAL");
  } 
  else {
    Serial.print("OTOMATIS");
  }

  Serial.print(" | Pompa: ");

  if (pompaON) {
    Serial.print("ON");
  } 
  else {
    Serial.print("OFF");
  }


  // Status kondisi tanah
  if (kelembapan < 20) {

    Serial.println(" | PERINGATAN: SANGAT KERING");

  }
  else if (kelembapan < 40) {

    Serial.println(" | Tanah kering");

  }
  else {

    Serial.println(" | Tanah cukup lembap");

  }


  delay(500);

}