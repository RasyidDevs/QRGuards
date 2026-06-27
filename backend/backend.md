---
title: QRGuards API
emoji: 🛡️
colorFrom: red
colorTo: gray
sdk: docker
app_port: 7860
---

# QRGuards Backend API

QRGuards adalah backend API untuk mendeteksi apakah URL hasil pemindaian QR Code termasuk **Phishing** atau **Legitimate**.

API ini menggunakan pendekatan **Hybrid Deep Learning** berbasis:

- **BERT Embedding**
- **BiLSTM-Attention**
- **Manual URL Feature Engineering**
- **FastAPI**

API ini sudah berhasil dideploy di **Hugging Face Spaces** menggunakan **Docker** dan **CPU Basic**.

---

## Base URL

Endpoint utama API QRGuards:

```text
https://grinderai-qrguards.hf.space
```

---

## API Endpoint

| Method | Endpoint | Full URL | Description |
|---|---|---|---|
| `GET` | `/health` | `https://grinderai-qrguards.hf.space/health` | Mengecek status server dan model |
| `POST` | `/predict` | `https://grinderai-qrguards.hf.space/predict` | Prediksi URL phishing atau legitimate |
| `GET` | `/docs` | `https://grinderai-qrguards.hf.space/docs` | Swagger UI documentation |
| `GET` | `/redoc` | `https://grinderai-qrguards.hf.space/redoc` | ReDoc documentation |
| `GET` | `/openapi.json` | `https://grinderai-qrguards.hf.space/openapi.json` | OpenAPI schema |

Catatan:

```text
Endpoint "/" belum digunakan, sehingga jika dibuka akan menampilkan {"detail":"Not Found"}.
Gunakan /docs, /health, atau /predict.
```

---

## Project Overview

QR Code banyak digunakan untuk pembayaran digital, formulir online, absensi, promosi, dan akses layanan web.

Namun, QR Code dapat menyembunyikan URL berbahaya sehingga pengguna tidak bisa melihat tujuan sebenarnya sebelum membuka link.

QRGuards membantu pengguna melakukan deteksi awal terhadap URL hasil scan QR Code sebelum tautan tersebut dibuka.

Output utama API:

- `Legitimate` → URL diprediksi aman
- `Phishing` → URL diprediksi berbahaya
- `confidence` → probabilitas URL termasuk phishing

---

## Tech Stack

- Python
- FastAPI
- PyTorch
- Sentence Transformers
- BERT Embedding
- BiLSTM-Attention
- Scikit-learn
- Docker
- Hugging Face Spaces

---

## Deployment Configuration

API ini berjalan di Hugging Face Spaces dengan konfigurasi:

| Konfigurasi | Value |
|---|---|
| Platform | Hugging Face Spaces |
| SDK | Docker |
| Template | Blank |
| Hardware | CPU Basic |
| App Port | 7860 |
| ASGI Entry Point | `src.api:app` |
| Public URL | `https://grinderai-qrguards.hf.space` |

---

## Struktur Project

Struktur backend:

```text
backend/
├── requirements.txt
└── src/
    ├── api.py
    ├── run_pipeline.py
    ├── data/
    │   ├── preprocessor.py
    │   └── feature_extractor.py
    ├── models/
    │   ├── model.py
    │   ├── embedding.py
    │   └── predictor.py
    ├── utils/
    │   ├── config.py
    │   └── logger.py
    └── weights/
        └── best_bilstm_attention_model.pt
```

Struktur repository Hugging Face Space:

```text
Space root/
├── README.md
├── Dockerfile
├── .gitattributes
└── backend/
    ├── requirements.txt
    └── src/
        ├── api.py
        ├── run_pipeline.py
        ├── data/
        ├── models/
        ├── utils/
        └── weights/
            └── best_bilstm_attention_model.pt
```

---

## Dockerfile

File `Dockerfile` berada di root repository.

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY backend/ .

RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 7860

CMD ["uvicorn", "src.api:app", "--host", "0.0.0.0", "--port", "7860"]
```

---

## Model Checkpoint

Model checkpoint disimpan pada path:

```text
backend/src/weights/best_bilstm_attention_model.pt
```

File model disimpan menggunakan **Git LFS** karena ukuran file lebih dari 10 MB.

File `.gitattributes`:

```gitattributes
*.pt filter=lfs diff=lfs merge=lfs -text
```

---

## Requirements

File `requirements.txt` berada di dalam folder `backend/`.

Contoh isi dependencies:

```txt
torch
sentence-transformers
numpy
scikit-learn
tldextract
fastapi
uvicorn
pydantic
python-multipart
```

---

## Local Development

### 1. Masuk ke folder backend

```bash
cd backend
```

### 2. Install dependencies

```bash
pip install -r requirements.txt
```

### 3. Jalankan server lokal

```bash
uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
```

Server lokal berjalan di:

```text
http://localhost:8000
```

Swagger UI lokal:

```text
http://localhost:8000/docs
```

---

## API Documentation

Swagger UI:

```text
https://grinderai-qrguards.hf.space/docs
```

ReDoc:

```text
https://grinderai-qrguards.hf.space/redoc
```

OpenAPI JSON:

```text
https://grinderai-qrguards.hf.space/openapi.json
```

---

## GET `/health`

Health check untuk mengecek status server dan model.

### Request

```http
GET https://grinderai-qrguards.hf.space/health
```

### Response

```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

### Field Description

| Field | Type | Description |
|---|---|---|
| `status` | string | Status API |
| `model_loaded` | boolean | Menunjukkan apakah model berhasil dimuat |
| `device` | string | Device yang digunakan oleh model |

---

## POST `/predict`

Endpoint utama untuk memprediksi apakah URL termasuk phishing atau legitimate.

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
| `url` | string | Yes | URL hasil scan QR Code yang akan diprediksi |

---

## Response

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
| `prediction` | string | Hasil prediksi: `Legitimate` atau `Phishing` |
| `confidence` | float | Probabilitas URL termasuk phishing |

---

## Example Response

### Legitimate URL

```json
{
  "prediction": "Legitimate",
  "confidence": 0.031245
}
```

### Phishing URL

```json
{
  "prediction": "Phishing",
  "confidence": 0.984712
}
```

---

## Error Response

### 400 Bad Request

URL tidak valid atau tidak bisa diproses.

```json
{
  "detail": "URL tidak valid atau tidak bisa diproses. Pastikan URL memiliki format yang benar."
}
```

### 422 Validation Error

Body request tidak sesuai schema.

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

Model belum siap atau gagal dimuat.

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
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
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
| `>= 0.5` | Diprediksi phishing |
| `< 0.5` | Diprediksi legitimate |

Threshold default:

```text
0.5
```

---

## Notes for Frontend

1. Gunakan base URL berikut:

```text
https://grinderai-qrguards.hf.space
```

2. Gunakan endpoint berikut untuk prediksi:

```text
https://grinderai-qrguards.hf.space/predict
```

3. Gunakan endpoint berikut untuk cek status API:

```text
https://grinderai-qrguards.hf.space/health
```

4. `confidence` adalah probabilitas phishing.
5. Jika frontend berbeda domain, pastikan CORS sudah aktif di FastAPI.
6. Pada Hugging Face free CPU, request pertama bisa lebih lambat karena model perlu warm up.
7. Space dapat sleep ketika tidak digunakan.

---

## Important Deployment Notes

Jangan upload file yang tidak dibutuhkan oleh API, seperti:

```text
model_research/
reference_paper/
venv/
__pycache__/
.env
node_modules/
dataset besar
notebook eksperimen
```

File yang wajib untuk deployment:

```text
README.md
Dockerfile
.gitattributes
backend/requirements.txt
backend/src/api.py
backend/src/models/
backend/src/data/
backend/src/utils/
backend/src/weights/best_bilstm_attention_model.pt
```

---

## Current Deployment Status

API QRGuards sudah berhasil berjalan di Hugging Face Spaces.

Status terakhir:

```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu"
}
```

Final API URL:

```text
https://grinderai-qrguards.hf.space
```