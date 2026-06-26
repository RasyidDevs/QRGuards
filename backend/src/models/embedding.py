"""
embedding.py - BERT embedding generation untuk QRGuards inference.

Modul ini bertanggung jawab untuk:
1. Load model SentenceTransformer (distilbert-base-nli-mean-tokens)
2. Generate embedding 768-dim dari URL input

Proses encoding exact sama dengan notebook QRGuards.ipynb:
- bert_model.encode([url], device=device) → numpy array (1, 768)
"""

import numpy as np
from sentence_transformers import SentenceTransformer

from ..utils.logger import setup_logger

logger = setup_logger("qrguards.models.embedding")


def load_bert_model(model_name: str, device: str) -> SentenceTransformer:
    """
    Load model SentenceTransformer untuk BERT embedding.

    Exact sama dengan notebook:
    >>> bert_model = SentenceTransformer("distilbert-base-nli-mean-tokens")
    >>> bert_model = bert_model.to(device)

    Args:
        model_name: Nama model SentenceTransformer.
        device: Device untuk model ('cuda' atau 'cpu').

    Returns:
        SentenceTransformer model yang sudah di-load ke device.
    """
    logger.info(f"Loading BERT model: {model_name}")
    logger.info(f"Device: {device}")

    bert_model = SentenceTransformer(model_name)
    bert_model = bert_model.to(device)

    logger.info(f"BERT model loaded successfully pada device: {device}")
    return bert_model


def generate_embedding(bert_model: SentenceTransformer, url: str, device: str) -> np.ndarray:
    """
    Generate BERT embedding untuk satu URL.

    Exact sama dengan proses di notebook:
    >>> embedding = bert_model.encode([url], device=device)
    >>> # shape: (1, 768)

    Args:
        bert_model: SentenceTransformer model yang sudah di-load.
        url: URL string yang akan di-encode.
        device: Device untuk encoding.

    Returns:
        numpy array (768,) berisi BERT embedding.
    """
    logger.debug(f"Generating BERT embedding untuk URL: {url[:80]}...")

    embedding = bert_model.encode(
        [url],
        batch_size=1,
        show_progress_bar=False,
        device=device
    )

    # embedding shape: (1, 768) → ambil [0] untuk mendapat (768,)
    embedding = embedding[0].astype("float32")

    logger.info(f"BERT embedding generated: shape={embedding.shape}")
    return embedding
