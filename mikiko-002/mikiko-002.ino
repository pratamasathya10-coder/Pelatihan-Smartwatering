
#include <WiFi.h>
#include <WebSocketsServer.h>
#include <DHT.h>

// WIFI
const char* WIFI_NAME = "SMART-WATERING-01";
const char* WIFI_PASSWORD = "smart123";

// PIN
#define PIN_SOIL 0
#define PIN_DHT 3
#define DHTTYPE DHT22

#define RELAY_POMPA 4
#define RELAY_KIPAS 5

// Ubah ke HIGH jika relay kamu aktif HIGH
#define RELAY_ON LOW
#define RELAY_OFF HIGH

// KALIBRASI TANAH
#define SOIL_DRY 3977
#define SOIL_WET 1342

DHT dht(PIN_DHT, DHTTYPE);
WebSocketsServer webSocket(81);

// PENGATURAN
String mode = "manual";
int batasKelembapan = 40;
float batasSuhu = 36.0;

bool statusPompa = false;
bool statusKipas = false;

int kelembapanTanah = 0;
float suhu = 0;
float kelembapanUdara = 0;

unsigned long timerSensor = 0;
unsigned long timerKirim = 0;

// =================================

String ambilString(String data, String key) {
  String target = "\"" + key + "\"";
  int p = data.indexOf(target);
  if (p < 0) return "";

  p = data.indexOf(':', p);
  int a = data.indexOf('"', p + 1);
  if (a < 0) return "";

  int b = data.indexOf('"', a + 1);
  if (b < 0) return "";

  return data.substring(a + 1, b);
}

float ambilAngka(String data, String key, float lama) {
  String target = "\"" + key + "\"";
  int p = data.indexOf(target);
  if (p < 0) return lama;

  p = data.indexOf(':', p);
  if (p < 0) return lama;

  p++;
  while (p < data.length() && data[p] == ' ') p++;

  int akhir = p;
  while (akhir < data.length() &&
         (isDigit(data[akhir]) ||
          data[akhir] == '.' ||
          data[akhir] == '-')) {
    akhir++;
  }

  if (akhir == p) return lama;
  return data.substring(p, akhir).toFloat();
}

// =================================

void matikanRelay() {
  statusPompa = false;
  statusKipas = false;

  digitalWrite(RELAY_POMPA, RELAY_OFF);
  digitalWrite(RELAY_KIPAS, RELAY_OFF);
}

void kontrolRelay() {
  if (mode == "auto") {
    statusPompa = kelembapanTanah < batasKelembapan;
    statusKipas = suhu > batasSuhu;
  }

  digitalWrite(RELAY_POMPA, statusPompa ? RELAY_ON : RELAY_OFF);
  digitalWrite(RELAY_KIPAS, statusKipas ? RELAY_ON : RELAY_OFF);
}

// =================================

void bacaSensor() {
  int raw = analogRead(PIN_SOIL);

  kelembapanTanah = map(raw, SOIL_DRY, SOIL_WET, 0, 100);
  kelembapanTanah = constrain(kelembapanTanah, 0, 100);

  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (isnan(t) || isnan(h)) {
    Serial.println("Gagal membaca DHT22!");
    return;
  }

  suhu = t;
  kelembapanUdara = h;

  if (mode == "auto") kontrolRelay();

  Serial.println("----------------------");
  Serial.printf("Tanah: %d%%\n", kelembapanTanah);
  Serial.printf("Suhu: %.1f C\n", suhu);
  Serial.printf("Udara: %.1f%%\n", kelembapanUdara);
  Serial.printf("Pompa: %s\n", statusPompa ? "ON" : "OFF");
  Serial.printf("Kipas: %s\n", statusKipas ? "ON" : "OFF");
}

// =================================

void kirimData() {
  String json = "{";
  json += "\"module\":\"MODUL_01\",";
  json += "\"moisture\":" + String(kelembapanTanah) + ",";
  json += "\"temperature\":" + String(suhu, 1) + ",";
  json += "\"humidity\":" + String(kelembapanUdara, 1) + ",";
  json += "\"pump\":\"" + String(statusPompa ? "ON" : "OFF") + "\",";
  json += "\"fan\":\"" + String(statusKipas ? "ON" : "OFF") + "\",";
  json += "\"mode\":\"" + mode + "\",";
  json += "\"moisture_threshold\":" + String(batasKelembapan) + ",";
  json += "\"temp_threshold\":" + String(batasSuhu, 1);
  json += "}";

  webSocket.broadcastTXT(json);
}

// =================================

void prosesPerintah(String pesan) {
  String m = ambilString(pesan, "mode");

  if (m == "auto" || m == "manual") {
    mode = m;
  }

  batasKelembapan = constrain(
    (int)ambilAngka(pesan, "moisture_threshold", batasKelembapan),
    0, 100
  );

  batasSuhu = constrain(
    ambilAngka(pesan, "temp_threshold", batasSuhu),
    0, 80
  );

  if (mode == "manual") {
    String p = ambilString(pesan, "pump");
    String k = ambilString(pesan, "fan");

    if (p == "ON") statusPompa = true;
    if (p == "OFF") statusPompa = false;

    if (k == "ON") statusKipas = true;
    if (k == "OFF") statusKipas = false;
  }

  kontrolRelay();
  kirimData();
}

// =================================

void webSocketEvent(
  uint8_t nomor,
  WStype_t tipe,
  uint8_t* payload,
  size_t panjang
) {
  if (tipe == WStype_CONNECTED) {
    Serial.println("Dashboard terhubung");
    kirimData();
  }

  if (tipe == WStype_DISCONNECTED) {
    Serial.println("Dashboard terputus");
  }

  if (tipe == WStype_TEXT) {
    String pesan = "";
    for (size_t i = 0; i < panjang; i++) {
      pesan += (char)payload[i];
    }
    prosesPerintah(pesan);
  }
}

// =================================

void setup() {
  Serial.begin(115200);
  delay(500);

  // Matikan relay sedini mungkin
  pinMode(RELAY_POMPA, OUTPUT);
  pinMode(RELAY_KIPAS, OUTPUT);
  matikanRelay();

  dht.begin();
  analogReadResolution(12);

  Serial.println("\nSMART WATERING MODUL 01");

 WiFi.mode(WIFI_AP);
WiFi.setSleep(false);
WiFi.setTxPower(WIFI_POWER_19_5dBm);

bool wifiBerhasil = WiFi.softAP(
  WIFI_NAME,
  WIFI_PASSWORD,
  6,
  0,
  4
);

if (wifiBerhasil) {
  Serial.println("WiFi Access Point berhasil dibuat");
  Serial.print("IP Address: ");
  Serial.println(WiFi.softAPIP());
} else {
  Serial.println("WiFi Access Point gagal dibuat");
}
  Serial.print("Wi-Fi: ");
  Serial.println(WIFI_NAME);
  Serial.print("IP: ");
  Serial.println(WiFi.softAPIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);

  Serial.println("WebSocket aktif pada port 81");
  Serial.println("Mode awal: MANUAL");
}

// =================================

void loop() {
  webSocket.loop();

  unsigned long sekarang = millis();

  if (sekarang - timerSensor >= 2000) {
    timerSensor = sekarang;
    bacaSensor();
  }

  if (sekarang - timerKirim >= 1000) {
    timerKirim = sekarang;
    kirimData();
  }
}
