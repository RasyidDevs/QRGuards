# QRGuards Backend API

API backend untuk deteksi phishing URL dari QR Code menggunakan **Hybrid BiLSTM-Attention + BERT**.

---

## Quick Start

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Letakkan Model Checkpoint

Letakkan file `best_bilstm_attention_model.pt` di:

```
backend/src/weights/best_bilstm_attention_model.pt
```

Atau gunakan flag `--checkpoint` saat menjalankan pipeline CLI.

### 3. Jalankan Server

```bash
cd backend
uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
```

Server akan berjalan di `http://localhost:8000`.

---

## API Documentation

### Interactive Docs

Setelah server berjalan, buka:

- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### `POST /predict`

Prediksi apakah URL phishing atau legitimate.

#### Request

```
POST http://localhost:8000/predict
Content-Type: application/json
```

**Body:**

```json
{
  "url": "https://google.com"
}
```

| Field | Type     | Required | Description                           |
|-------|----------|----------|---------------------------------------|
| `url` | `string` | ✅ Ya    | URL yang akan diprediksi (dari QR Code) |

#### Response

**200 OK:**

```json
{
  "prediction": "Legitimate",
  "confidence": 0.031245
}
```

| Field        | Type     | Description                                                                 |
|--------------|----------|-----------------------------------------------------------------------------|
| `prediction` | `string` | Hasil prediksi: `"Legitimate"` atau `"Phishing"`                           |
| `confidence` | `float`  | Confidence score (0.0 – 1.0). Semakin tinggi = semakin yakin URL phishing. |

#### Contoh Response

**URL Legitimate:**
```json
{
  "prediction": "Legitimate",
  "confidence": 0.031245
}
```

**URL Phishing:**
```json
{
  "prediction": "Phishing",
  "confidence": 0.984712
}
```

#### Error Responses

**400 Bad Request** — URL tidak valid:
```json
{
  "detail": "URL tidak valid atau tidak bisa diproses. Pastikan URL memiliki format yang benar."
}
```

**503 Service Unavailable** — Model belum siap:
```json
{
  "detail": "Model belum siap. Silakan tunggu server selesai loading."
}
```

---

### `GET /health`

Health check untuk memastikan server dan model sudah siap.

#### Response

```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

---

## Contoh Penggunaan dari Frontend

### JavaScript (Fetch API)

```javascript
async function predictURL(url) {
  const response = await fetch("http://localhost:8000/predict", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  const data = await response.json();
  // data.prediction → "Legitimate" atau "Phishing"
  // data.confidence → 0.0 - 1.0
  return data;
}

// Contoh penggunaan
const result = await predictURL("https://google.com");
console.log(result.prediction);  // "Legitimate"
console.log(result.confidence);  // 0.031245
```

### React Native (Expo)

```typescript
const API_URL = "http://<YOUR_SERVER_IP>:8000";

interface PredictResponse {
  prediction: "Legitimate" | "Phishing";
  confidence: number;
}

async function predictURL(url: string): Promise<PredictResponse> {
  const response = await fetch(`${API_URL}/predict`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail);
  }

  return response.json();
}

// Contoh penggunaan setelah scan QR
const scannedURL = "https://example.com/login";
const result = await predictURL(scannedURL);

if (result.prediction === "Phishing") {
  alert(`⚠️ URL ini terdeteksi phishing! (confidence: ${(result.confidence * 100).toFixed(1)}%)`);
} else {
  alert(`✅ URL ini aman. (confidence: ${((1 - result.confidence) * 100).toFixed(1)}%)`);
}
```

### cURL

```bash
# Prediksi URL
curl -X POST http://localhost:8000/predict \
  -H "Content-Type: application/json" \
  -d '{"url": "https://google.com"}'

# Health check
curl http://localhost:8000/health
```

---

## Struktur Project

```
backend/
├── requirements.txt
└── src/
    ├── api.py                  ← FastAPI server (entry point)
    ├── run_pipeline.py         ← CLI inference
    ├── data/
    │   ├── preprocessor.py     ← URL preprocessing
    │   └── feature_extractor.py← 20 manual URL features
    ├── models/
    │   ├── model.py            ← BiLSTM-Attention architecture
    │   ├── embedding.py        ← BERT embedding generation
    │   └── predictor.py        ← Inference engine
    ├── utils/
    │   ├── config.py           ← Konfigurasi terpusat
    │   └── logger.py           ← Logging setup
    └── weights/
        └── best_bilstm_attention_model.pt  ← Model checkpoint
```

---

## Catatan untuk Frontend

1. **CORS** sudah diaktifkan untuk semua origin (`*`), jadi frontend bisa langsung hit API tanpa masalah CORS.
2. **Confidence** menunjukkan probabilitas URL adalah **phishing**:
   - `confidence` mendekati **1.0** = sangat yakin **phishing**
   - `confidence` mendekati **0.0** = sangat yakin **legitimate**
3. **Threshold** default adalah **0.5** — jika confidence ≥ 0.5, prediction = `"Phishing"`.
4. Server perlu waktu ~10-30 detik saat pertama kali start untuk loading model. Gunakan `GET /health` untuk cek kesiapan.
