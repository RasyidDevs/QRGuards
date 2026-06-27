## Base URL

API QRGuards sudah berjalan di Hugging Face Spaces pada URL berikut:

```text
https://grinderai-qrguards.hf.space
```

Gunakan URL tersebut sebagai **base URL** untuk semua request dari frontend, mobile app, atau testing API.

---

## API Endpoint

Endpoint yang tersedia pada QRGuards API:

| Method | Endpoint | Full URL | Fungsi |
|---|---|---|---|
| `GET` | `/health` | `https://grinderai-qrguards.hf.space/health` | Mengecek apakah API dan model sudah siap digunakan |
| `POST` | `/predict` | `https://grinderai-qrguards.hf.space/predict` | Mengirim URL dan mendapatkan hasil prediksi phishing atau legitimate |
| `GET` | `/docs` | `https://grinderai-qrguards.hf.space/docs` | Membuka dokumentasi interaktif Swagger UI |
| `GET` | `/redoc` | `https://grinderai-qrguards.hf.space/redoc` | Membuka dokumentasi API dalam format ReDoc |
| `GET` | `/openapi.json` | `https://grinderai-qrguards.hf.space/openapi.json` | Melihat schema OpenAPI dalam format JSON |

Catatan:

```text
Endpoint "/" tidak digunakan.
Jika membuka https://grinderai-qrguards.hf.space/ secara langsung, response yang muncul adalah {"detail":"Not Found"}.
Gunakan endpoint /docs, /health, atau /predict.
```

---

## API Documentation

Dokumentasi API dapat dibuka melalui Swagger UI:

```text
https://grinderai-qrguards.hf.space/docs
```

Dokumentasi alternatif menggunakan ReDoc:

```text
https://grinderai-qrguards.hf.space/redoc
```

Schema OpenAPI tersedia di:

```text
https://grinderai-qrguards.hf.space/openapi.json
```

---

## GET `/health`

Endpoint `/health` digunakan untuk mengecek apakah server dan model sudah berjalan dengan benar.

### Request

```http
GET https://grinderai-qrguards.hf.space/health
```

### Response Berhasil

```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

### Penjelasan Response

| Field | Type | Description |
|---|---|---|
| `status` | string | Status API. Jika bernilai `healthy`, API berjalan normal |
| `model_loaded` | boolean | Menunjukkan apakah model berhasil dimuat |
| `device` | string | Device yang digunakan untuk inference, pada deployment ini menggunakan `cpu` |

Endpoint ini sebaiknya dipanggil sebelum frontend menggunakan `/predict`, terutama saat Space baru aktif atau baru bangun dari sleep mode.

---

## POST `/predict`

Endpoint `/predict` digunakan untuk mengirim URL hasil scan QR Code dan mendapatkan hasil prediksi apakah URL tersebut **Phishing** atau **Legitimate**.

### Request

```http
POST https://grinderai-qrguards.hf.space/predict
Content-Type: application/json
```

### Body

```json
{
  "url": "https://google.com"
}
```

### Request Field

| Field | Type | Required | Description |
|---|---|---|---|
| `url` | string | Yes | URL yang akan dianalisis oleh model QRGuards |

---

## Response `/predict`

Jika request berhasil, API akan mengembalikan hasil prediksi dalam format JSON.

### 200 OK

```json
{
  "prediction": "Legitimate",
  "confidence": 0.031245
}
```

### Response Field

| Field | Type | Description |
|---|---|---|
| `prediction` | string | Hasil prediksi model. Nilainya adalah `Legitimate` atau `Phishing` |
| `confidence` | float | Probabilitas URL termasuk phishing. Nilai semakin mendekati `1.0` berarti semakin tinggi kemungkinan phishing |

---

## Example `/predict`

### Contoh Request URL Legitimate

```json
{
  "url": "https://google.com"
}
```

### Contoh Response URL Legitimate

```json
{
  "prediction": "Legitimate",
  "confidence": 0.031245
}
```

### Contoh Request URL Phishing

```json
{
  "url": "https://example.com/login"
}
```

### Contoh Response URL Phishing

```json
{
  "prediction": "Phishing",
  "confidence": 0.984712
}
```

---

## Error Response

### 400 Bad Request

Terjadi jika URL tidak valid atau tidak dapat diproses.

```json
{
  "detail": "URL tidak valid atau tidak bisa diproses. Pastikan URL memiliki format yang benar."
}
```

### 422 Validation Error

Terjadi jika body request tidak sesuai schema, misalnya field `url` kosong atau tidak dikirim.

```json
{
  "detail": [
    {
      "loc": ["body", "url"],
      "msg": "Field required",
      "type": "missing"
    }
  ]
}
```

### 503 Service Unavailable

Terjadi jika model belum siap atau gagal dimuat.

```json
{
  "detail": "Model belum siap. Silakan tunggu server selesai loading."
}
```

---

## cURL Example

### Health Check

```bash
curl https://grinderai-qrguards.hf.space/health
```

### Predict URL

```bash
curl -X POST https://grinderai-qrguards.hf.space/predict \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'
```

---

## JavaScript Fetch Example

```javascript
async function predictURL(url) {
  const response = await fetch("https://grinderai-qrguards.hf.space/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return await response.json();
}

const result = await predictURL("https://google.com");

console.log(result.prediction);
console.log(result.confidence);
```

---

## React Native / Expo Example

```typescript
const API_URL = "https://grinderai-qrguards.hf.space";

interface PredictResponse {
  prediction: "Legitimate" | "Phishing";
  confidence: number;
}

async function predictURL(url: string): Promise<PredictResponse> {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ url })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return response.json();
}

const scannedURL = "https://example.com/login";
const result = await predictURL(scannedURL);

if (result.prediction === "Phishing") {
  alert(`URL ini terdeteksi phishing. Confidence: ${(result.confidence * 100).toFixed(1)}%`);
} else {
  alert(`URL ini diprediksi legitimate. Confidence aman: ${((1 - result.confidence) * 100).toFixed(1)}%`);
}
```

---

## Confidence Interpretation

Nilai `confidence` menunjukkan probabilitas URL adalah **phishing**.

| Confidence | Interpretasi |
|---|---|
| Mendekati `0.0` | Model yakin URL legitimate |
| Mendekati `1.0` | Model yakin URL phishing |
| `>= 0.5` | URL diprediksi phishing |
| `< 0.5` | URL diprediksi legitimate |

Threshold default:

```text
0.5
```

---

## Notes for Frontend

Gunakan base URL berikut pada frontend:

```text
https://grinderai-qrguards.hf.space
```

Endpoint utama untuk prediksi:

```text
https://grinderai-qrguards.hf.space/predict
```

Endpoint untuk mengecek status API:

```text
https://grinderai-qrguards.hf.space/health
```

Contoh konfigurasi frontend:

```typescript
const API_URL = "https://grinderai-qrguards.hf.space";
```

Hal yang perlu diperhatikan:

1. Gunakan `/predict` untuk mengirim URL hasil scan QR Code.
2. Gunakan `/health` untuk mengecek apakah model sudah siap.
3. Field `confidence` adalah probabilitas phishing.
4. Jika `confidence >= 0.5`, URL diklasifikasikan sebagai `Phishing`.
5. Jika `confidence < 0.5`, URL diklasifikasikan sebagai `Legitimate`.
6. Request pertama bisa lebih lambat karena Hugging Face Space dapat sleep ketika tidak digunakan.