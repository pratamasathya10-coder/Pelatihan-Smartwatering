
#include <DHTesp.h>

// SMART WATERING - ESP32-S3

// PIN SENSOR
const int pinSensorTanah = 3;
const int pinDHT = 4;

// PIN AKTUATOR
const int pinPompa = 16;
const int pinKipas = 17;

// PIN TOMBOL LAMA
const int pinTombolMode = 18;
const int pinPompaON = 19;
const int pinPompaOFF = 20;
const int pinBuzzer = 21;

// BATAS OTOMATIS
int batasKelembapan = 40;
int batasSuhu = 36;
const int batasSangatKering = 20;

// STATUS SISTEM
bool modeManual = false;
bool pompaON = false;
bool kipasON = false;
bool kondisiSangatKeringSebelumnya = false;

DHTesp dhtSensor;

// Bunyi buzzer
void beep(int frekuensi = 2000, int durasi = 150) {
  tone(pinBuzzer, frekuensi);
  delay(durasi);
  noTone(pinBuzzer);
}

// Kontrol relay pompa
void kontrolPompa(bool status) {
  pompaON = status;
  digitalWrite(pinPompa, pompaON ? HIGH : LOW);
}

// Kontrol relay kipas
void kontrolKipas(bool status) {
  kipasON = status;
  digitalWrite(pinKipas, kipasON ? HIGH : LOW);
}

void setup() {
  Serial.begin(115200);

  pinMode(pinPompa, OUTPUT);
  pinMode(pinKipas, OUTPUT);

  pinMode(pinTombolMode, INPUT_PULLUP);
  pinMode(pinPompaON, INPUT_PULLUP);
  pinMode(pinPompaOFF, INPUT_PULLUP);

  pinMode(pinBuzzer, OUTPUT);

  kontrolPompa(false);
  kontrolKipas(false);

  dhtSensor.setup(pinDHT, DHTesp::DHT22);

  analogReadResolution(12);

  Serial.println();
  Serial.println("================================");
  Serial.println("       SMART WATERING");
  Serial.println("================================");
  Serial.println("Mode awal: OTOMATIS");
  Serial.println("Batas kelembapan: 40%");
  Serial.println("Batas suhu: 36 C");
}

void loop() {
  // BACA SENSOR TANAH
  int nilaiSensor = analogRead(pinSensorTanah);

  int kelembapan = map(nilaiSensor, 4095, 0, 0, 100);
  kelembapan = constrain(kelembapan, 0, 100);

  // BACA SENSOR SUHU
  TempAndHumidity dataDHT = dhtSensor.getTempAndHumidity();

  float suhu = dataDHT.temperature;

  // CEK PEMBACAAN DHT
  bool sensorDHTValid = !isnan(suhu);

  // TOMBOL GANTI MODE
  if (digitalRead(pinTombolMode) == LOW) {
    delay(50);

    if (digitalRead(pinTombolMode) == LOW) {
      modeManual = !modeManual;

      beep();

      Serial.print("Mode: ");
      Serial.println(modeManual ? "MANUAL" : "OTOMATIS");

      while (digitalRead(pinTombolMode) == LOW) {
        delay(10);
      }
    }
  }

  // KONTROL POMPA
  if (!modeManual) {
    // MODE OTOMATIS
    if (kelembapan < batasKelembapan) {
      kontrolPompa(true);
    } else {
      kontrolPompa(false);
    }
  } else {
    // MODE MANUAL: TOMBOL POMPA ON
    if (digitalRead(pinPompaON) == LOW) {
      kontrolPompa(true);
      beep();

      while (digitalRead(pinPompaON) == LOW) {
        delay(10);
      }
    }

    // MODE MANUAL: TOMBOL POMPA OFF
    if (digitalRead(pinPompaOFF) == LOW) {
      kontrolPompa(false);
      beep();

      while (digitalRead(pinPompaOFF) == LOW) {
        delay(10);
      }
    }
  }

  // KONTROL KIPAS OTOMATIS
  if (sensorDHTValid) {
    if (suhu > batasSuhu) {
      kontrolKipas(true);
    } else {
      kontrolKipas(false);
    }
  } else {
    // Jika sensor gagal dibaca, kipas dimatikan
    kontrolKipas(false);
  }

  // PERINGATAN TANAH SANGAT KERING
  bool kondisiSangatKering = kelembapan < batasSangatKering;

  if (kondisiSangatKering && !kondisiSangatKeringSebelumnya) {
    beep(1500, 100);
  }

  kondisiSangatKeringSebelumnya = kondisiSangatKering;

  // TAMPILKAN DATA DI SERIAL MONITOR
  Serial.println("--------------------------------");

  Serial.print("Sensor tanah: ");
  Serial.println(nilaiSensor);

  Serial.print("Kelembapan tanah: ");
  Serial.print(kelembapan);
  Serial.println("%");

  if (sensorDHTValid) {
    Serial.print("Suhu: ");
    Serial.print(suhu);
    Serial.println(" C");
  } else {
    Serial.println("Suhu: Gagal membaca sensor DHT");
  }

  Serial.print("Mode: ");
  Serial.println(modeManual ? "MANUAL" : "OTOMATIS");

  Serial.print("Pompa: ");
  Serial.println(pompaON ? "ON" : "OFF");

  Serial.print("Kipas: ");
  Serial.println(kipasON ? "ON" : "OFF");

  delay(1000);
}
