"""
config.py - Konfigurasi terpusat untuk pipeline inference QRGuards.

Semua parameter model, path file, dan konstanta disimpan di sini
agar mudah diubah tanpa harus modifikasi kode di modul lain.
"""

import os
from dataclasses import dataclass, field
from typing import List


def _get_device() -> str:
    """Deteksi device (cuda/cpu) secara lazy agar import tidak gagal tanpa torch."""
    try:
        import torch
        return "cuda" if torch.cuda.is_available() else "cpu"
    except ImportError:
        return "cpu"


@dataclass
class Config:
    """Konfigurasi utama pipeline inference QRGuards."""

    # =========================================================================
    # Path
    # =========================================================================
    # Base directory (backend/src/)
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    # Path ke model checkpoint (.pt file)
    CHECKPOINT_PATH: str = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        "weights",
        "best_bilstm_attention_model.pt",
    )

    # =========================================================================
    # BERT Embedding
    # =========================================================================
    BERT_MODEL_NAME: str = "distilbert-base-nli-mean-tokens"
    EMBEDDING_DIM: int = 768

    # =========================================================================
    # Model Architecture
    # =========================================================================
    BERT_DIM: int = 768
    MANUAL_DIM: int = 20
    LSTM_HIDDEN: int = 256

    # =========================================================================
    # Inference
    # =========================================================================
    THRESHOLD: float = 0.5
    BATCH_SIZE: int = 16

    # =========================================================================
    # Device (lazy-evaluated)
    # =========================================================================
    DEVICE: str = field(default_factory=_get_device)

    # =========================================================================
    # Feature Columns (exact order dari notebook)
    # =========================================================================
    FEATURE_COLS: List[str] = field(default_factory=lambda: [
        "url_length",
        "number_of_dots_in_url",
        "having_repeated_digits_in_url",
        "number_of_digits_in_url",
        "number_of_special_char_in_url",
        "number_of_hyphens_in_url",
        "number_of_underline_in_url",
        "number_of_slash_in_url",
        "number_of_questionmark_in_url",
        "number_of_equal_in_url",
        "number_of_at_in_url",
        "number_of_dollar_in_url",
        "number_of_exclamation_in_url",
        "number_of_hashtag_in_url",
        "number_of_percent_in_url",
        "path_length",
        "having_query",
        "having_fragment",
        "having_anchor",
        "entropy_of_url",
    ])

    # =========================================================================
    # Label Mapping
    # =========================================================================
    LABEL_MAP: dict = field(default_factory=lambda: {
        0: "Legitimate",
        1: "Phishing",
    })

    # =========================================================================
    # Logging
    # =========================================================================
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "%(asctime)s | %(levelname)-8s | %(name)-25s | %(message)s"
    LOG_DATE_FORMAT: str = "%Y-%m-%d %H:%M:%S"
