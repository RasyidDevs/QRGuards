"""
predictor.py - Inference engine untuk QRGuards.

Modul ini bertanggung jawab untuk:
1. Load checkpoint model (weights, scaler, feature_cols)
2. Menjalankan inference pada URL tunggal

Pipeline inference exact sama dengan notebook QRGuards.ipynb:
1. Load checkpoint → model_state_dict, scaler, feature_cols
2. Extract manual features dari URL
3. Scale manual features menggunakan scaler dari checkpoint
4. Generate BERT embedding dari URL
5. Unsqueeze BERT embedding → (1, 1, 768)
6. Forward pass model → probability
7. Threshold ≥ 0.5 → Phishing, else Legitimate
"""

from typing import Dict, Any, Optional

import numpy as np
import torch

from .model import PhishingBiLSTMAttention
from .embedding import load_bert_model, generate_embedding
from ..data.feature_extractor import extract_features_array
from ..utils.logger import setup_logger
from ..utils.config import Config

logger = setup_logger("qrguards.models.predictor")


def load_checkpoint(
    checkpoint_path: str,
    device: str,
    bert_dim: int = 768,
    manual_dim: int = 20,
    lstm_hidden: int = 256,
) -> Dict[str, Any]:
    """
    Load checkpoint model dan kembalikan model, scaler, dan feature_cols.

    Exact sama dengan notebook:
    >>> checkpoint = torch.load(path, map_location=device, weights_only=False)
    >>> scaler = checkpoint["scaler"]
    >>> feature_cols = checkpoint["feature_cols"]
    >>> model.load_state_dict(checkpoint["model_state_dict"])
    >>> model.eval()

    Args:
        checkpoint_path: Path ke file .pt checkpoint.
        device: Device untuk model.
        bert_dim: Dimensi BERT embedding (768).
        manual_dim: Jumlah manual features (20).
        lstm_hidden: Hidden size LSTM (256).

    Returns:
        Dictionary berisi 'model', 'scaler', 'feature_cols'.
    """
    logger.info(f"Loading checkpoint dari: {checkpoint_path}")
    logger.info(f"Model config - bert_dim: {bert_dim}, manual_dim: {manual_dim}, lstm_hidden: {lstm_hidden}")

    # Load checkpoint - exact sama dengan notebook
    checkpoint = torch.load(
        checkpoint_path,
        map_location=device,
        weights_only=False
    )

    logger.info("Checkpoint loaded, extracting components...")

    # Extract scaler dan feature_cols dari checkpoint
    scaler = checkpoint["scaler"]
    feature_cols = checkpoint["feature_cols"]

    logger.info(f"Scaler loaded: {type(scaler).__name__}")
    logger.info(f"Feature columns loaded: {len(feature_cols)} features")

    # Inisialisasi model - exact sama dengan notebook
    model = PhishingBiLSTMAttention(
        bert_dim=bert_dim,
        manual_dim=manual_dim,
        lstm_hidden=lstm_hidden
    ).to(device)

    # Load weights
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()

    logger.info("Model weights loaded dan set ke eval mode")
    logger.info(f"Model architecture:\n{model}")

    return {
        "model": model,
        "scaler": scaler,
        "feature_cols": feature_cols,
    }


def predict_url(
    url: str,
    model: PhishingBiLSTMAttention,
    bert_model,
    scaler,
    feature_cols,
    device: str,
    threshold: float = 0.5,
) -> Optional[Dict[str, Any]]:
    """
    Menjalankan inference pada satu URL.

    Pipeline exact sama dengan notebook:
    1. extract_features(url) → dict → array berdasarkan feature_cols
    2. scaler.transform(features) → scaled features
    3. bert_model.encode([url]) → BERT embedding (768,)
    4. BERT embedding → unsqueeze(0) → (1, 1, 768) [batch=1, seq=1, dim=768]
    5. model(bert_x, manual_x) → probability
    6. probability >= 0.5 → Phishing (1), else Legitimate (0)

    Args:
        url: URL string yang akan diprediksi.
        model: PhishingBiLSTMAttention model.
        bert_model: SentenceTransformer model.
        scaler: StandardScaler dari checkpoint.
        feature_cols: List nama kolom fitur.
        device: Device ('cuda' atau 'cpu').
        threshold: Threshold untuk klasifikasi (default 0.5).

    Returns:
        Dictionary berisi:
        - 'url': URL yang diprediksi
        - 'label': 'Legitimate' atau 'Phishing'
        - 'label_id': 0 atau 1
        - 'probability': probabilitas phishing (0.0 - 1.0)
        - 'is_phishing': boolean

        None jika URL tidak valid.
    """
    logger.info(f"{'='*60}")
    logger.info(f"Memulai prediksi untuk URL: {url}")
    logger.info(f"{'='*60}")

    # =========================================================================
    # Step 1: Extract manual features
    # =========================================================================
    logger.info("[Step 1/5] Extracting manual URL features...")

    manual_features = extract_features_array(url, feature_cols)
    if manual_features is None:
        logger.error(f"Gagal extract features dari URL: {url}")
        return None

    logger.info(f"  → Manual features shape: {manual_features.shape}")

    # =========================================================================
    # Step 2: Scale manual features menggunakan scaler dari checkpoint
    # =========================================================================
    logger.info("[Step 2/5] Scaling manual features menggunakan StandardScaler...")

    # scaler.transform expects 2D array → reshape (1, 20)
    manual_features_2d = manual_features.reshape(1, -1)
    manual_features_scaled = scaler.transform(manual_features_2d).astype("float32")

    logger.info(f"  → Scaled features shape: {manual_features_scaled.shape}")

    # =========================================================================
    # Step 3: Generate BERT embedding
    # =========================================================================
    logger.info("[Step 3/5] Generating BERT embedding...")

    bert_embedding = generate_embedding(bert_model, url, device)

    logger.info(f"  → BERT embedding shape: {bert_embedding.shape}")

    # =========================================================================
    # Step 4: Prepare tensors dan run model forward pass
    # =========================================================================
    logger.info("[Step 4/5] Running model inference...")

    # Exact sama dengan URLDataset.__getitem__ di notebook:
    # bert_x = tensor(embedding).unsqueeze(0) → (1, 768) lalu batch → (1, 1, 768)
    bert_x = torch.tensor(bert_embedding, dtype=torch.float32).unsqueeze(0)  # (1, 768)
    bert_x = bert_x.unsqueeze(0)  # (1, 1, 768) → [batch, seq_len, bert_dim]
    bert_x = bert_x.to(device)

    manual_x = torch.tensor(manual_features_scaled, dtype=torch.float32)  # (1, 20)
    manual_x = manual_x.to(device)

    logger.info(f"  → bert_x tensor shape: {bert_x.shape}")
    logger.info(f"  → manual_x tensor shape: {manual_x.shape}")

    # Forward pass - exact sama dengan notebook
    model.eval()
    with torch.no_grad():
        probability = model(bert_x, manual_x)

    prob_value = probability.item()

    logger.info(f"  → Raw probability: {prob_value:.6f}")

    # =========================================================================
    # Step 5: Apply threshold dan tentukan label
    # =========================================================================
    logger.info("[Step 5/5] Applying threshold dan menentukan label...")

    # Exact sama dengan notebook: (preds >= 0.5).int()
    is_phishing = prob_value >= threshold
    label_id = int(is_phishing)
    label = "Phishing" if is_phishing else "Legitimate"

    logger.info(f"  → Threshold: {threshold}")
    logger.info(f"  → Label: {label} (id={label_id})")
    logger.info(f"  → Is Phishing: {is_phishing}")

    result = {
        "url": url,
        "label": label,
        "label_id": label_id,
        "probability": prob_value,
        "is_phishing": is_phishing,
    }

    logger.info(f"Prediksi selesai: {label} (prob={prob_value:.4f})")
    return result
