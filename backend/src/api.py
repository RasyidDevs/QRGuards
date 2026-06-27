"""
api.py - FastAPI server untuk QRGuards inference.

Menyediakan endpoint REST API untuk deteksi phishing URL.

Endpoint:
    POST /predict - Prediksi apakah URL phishing atau legitimate

Usage:
    uvicorn src.api:app --host 0.0.0.0 --port 8000 --reload
"""

import os
import sys
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Tambahkan parent directory ke path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.config import Config
from src.utils.logger import setup_logger
from src.models.embedding import load_bert_model
from src.models.predictor import load_checkpoint, predict_url

# =========================================================================
# Global state untuk model (di-load sekali saat startup)
# =========================================================================
config = Config()
logger = setup_logger("qrguards.api", config)

_state = {
    "bert_model": None,
    "model_components": None,
}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Load model saat startup, cleanup saat shutdown."""

    logger.info("=" * 60)
    logger.info("QRGuards API - Starting up")
    logger.info("=" * 60)
    logger.info(f"Device: {config.DEVICE}")
    logger.info(f"BERT Model: {config.BERT_MODEL_NAME}")
    logger.info(f"Checkpoint: {config.CHECKPOINT_PATH}")

    # Load BERT model
    logger.info("[Startup 1/2] Loading BERT model...")
    _state["bert_model"] = load_bert_model(
        model_name=config.BERT_MODEL_NAME,
        device=config.DEVICE,
    )
    logger.info("BERT model loaded.")

    # Load checkpoint
    logger.info("[Startup 2/2] Loading model checkpoint...")
    _state["model_components"] = load_checkpoint(
        checkpoint_path=config.CHECKPOINT_PATH,
        device=config.DEVICE,
        bert_dim=config.BERT_DIM,
        manual_dim=config.MANUAL_DIM,
        lstm_hidden=config.LSTM_HIDDEN,
    )
    logger.info("Model checkpoint loaded.")

    logger.info("=" * 60)
    logger.info("QRGuards API - Ready to serve predictions")
    logger.info("=" * 60)

    yield  # Server berjalan

    # Cleanup saat shutdown
    logger.info("QRGuards API - Shutting down")
    _state["bert_model"] = None
    _state["model_components"] = None


# =========================================================================
# FastAPI App
# =========================================================================
app = FastAPI(
    title="QRGuards API",
    description="API untuk deteksi phishing URL dari QR Code menggunakan Hybrid BiLSTM-Attention + BERT.",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS - izinkan frontend mengakses API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================================
# Request / Response Schemas
# =========================================================================
class PredictRequest(BaseModel):
    """Request body untuk endpoint /predict."""
    url: str = Field(
        ...,
        description="URL yang akan diprediksi (hasil scan QR Code).",
        examples=["https://google.com"],
    )

    model_config = {
        "json_schema_extra": {
            "examples": [
                {"url": "https://google.com"},
                {"url": "http://suspicious-login.fake-bank.com/verify"},
            ]
        }
    }


class PredictResponse(BaseModel):
    """Response body dari endpoint /predict."""
    prediction: str = Field(
        ...,
        description="Hasil prediksi: 'Legitimate' atau 'Phishing'.",
        examples=["Legitimate"],
    )
    confidence: float = Field(
        ...,
        description="Confidence score model (0.0 - 1.0). Semakin tinggi, semakin yakin model bahwa URL adalah phishing.",
        examples=[0.0312],
    )


class ErrorResponse(BaseModel):
    """Error response."""
    detail: str


# =========================================================================
# Endpoints
# =========================================================================
@app.post(
    "/predict",
    response_model=PredictResponse,
    summary="Prediksi URL phishing atau legitimate",
    description="Menerima URL dan mengembalikan prediksi apakah URL tersebut phishing atau legitimate beserta confidence score.",
    responses={
        200: {
            "description": "Prediksi berhasil",
            "content": {
                "application/json": {
                    "examples": {
                        "legitimate": {
                            "summary": "URL Legitimate",
                            "value": {
                                "prediction": "Legitimate",
                                "confidence": 0.0312,
                            }
                        },
                        "phishing": {
                            "summary": "URL Phishing",
                            "value": {
                                "prediction": "Phishing",
                                "confidence": 0.9847,
                            }
                        },
                    }
                }
            }
        },
        400: {"description": "URL tidak valid atau tidak bisa diproses"},
        503: {"description": "Model belum siap"},
    },
)
async def predict(request: PredictRequest):
    """
    Endpoint utama untuk prediksi phishing URL.

    Pipeline inference:
    1. Extract 20 manual URL features
    2. Generate BERT embedding (768-dim)
    3. Scale manual features dengan StandardScaler
    4. Forward pass model BiLSTM-Attention
    5. Return prediction + confidence
    """
    logger.info(f"Received prediction request for URL: {request.url}")

    # Cek apakah model sudah loaded
    if _state["bert_model"] is None or _state["model_components"] is None:
        logger.error("Model belum di-load!")
        raise HTTPException(
            status_code=503,
            detail="Model belum siap. Silakan tunggu server selesai loading.",
        )

    # Jalankan inference
    result = predict_url(
        url=request.url,
        model=_state["model_components"]["model"],
        bert_model=_state["bert_model"],
        scaler=_state["model_components"]["scaler"],
        feature_cols=_state["model_components"]["feature_cols"],
        device=config.DEVICE,
        threshold=config.THRESHOLD,
    )

    if result is None:
        logger.error(f"Prediksi gagal untuk URL: {request.url}")
        raise HTTPException(
            status_code=400,
            detail="URL tidak valid atau tidak bisa diproses. Pastikan URL memiliki format yang benar.",
        )

    response = PredictResponse(
        prediction=result["label"],
        confidence=round(result["confidence"], 6),
    )

    logger.info(f"Prediction result: {response.prediction} (confidence={response.confidence})")
    return response


@app.get("/health", summary="Health check", tags=["System"])
async def health_check():
    """Cek apakah server dan model sudah siap."""
    model_ready = _state["bert_model"] is not None and _state["model_components"] is not None
    return {
        "status": "healthy" if model_ready else "loading",
        "model_loaded": model_ready,
        "device": config.DEVICE,
    }
