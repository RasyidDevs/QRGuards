"""
feature_extractor.py - Manual URL feature extraction untuk QRGuards inference.

Modul ini mengekstrak 20 fitur numerik dari URL berdasarkan struktur URL,
termasuk panjang, jumlah karakter khusus, entropy, dll.

Semua fungsi dan logika di-copy exact dari notebook QRGuards.ipynb.
"""

import math
import re
from collections import Counter
from typing import Dict, List, Optional

import numpy as np

from .preprocessor import get_parsed_url, extract_domain_subdomain
from ..utils.logger import setup_logger

logger = setup_logger("qrguards.data.feature_extractor")

# Exact copy dari notebook
SPECIAL_CHARS = set(['"', '#', '$', '%', '&', '~'])


def count_digits(text: str) -> int:
    """Menghitung jumlah digit dalam teks. Exact copy dari notebook."""
    return sum(c.isdigit() for c in str(text))


def has_digits(text: str) -> int:
    """Mengecek apakah teks mengandung digit. Exact copy dari notebook."""
    return int(count_digits(text) > 0)


def has_repeated_digits(text: str) -> int:
    """Mengecek apakah teks mengandung digit berulang. Exact copy dari notebook."""
    text = str(text)
    return int(bool(re.search(r"(\d)\1+", text)))


def count_special_url(text: str) -> int:
    """Menghitung jumlah karakter khusus dalam URL. Exact copy dari notebook."""
    return sum(c in SPECIAL_CHARS for c in str(text))


def count_special_domain(text: str) -> int:
    """Menghitung jumlah karakter khusus dalam domain. Exact copy dari notebook."""
    return sum(c in SPECIAL_CHARS for c in str(text))


def shannon_entropy(text: str) -> float:
    """
    Menghitung Shannon entropy dari teks. Exact copy dari notebook.

    Shannon entropy mengukur tingkat keacakan/kompleksitas dari URL.
    URL phishing cenderung memiliki entropy lebih tinggi.
    """
    text = str(text)
    if len(text) == 0:
        return 0.0

    counter = Counter(text)
    length = len(text)

    entropy = 0.0
    for count in counter.values():
        p = count / length
        entropy -= p * math.log2(p)

    return entropy


def extract_features(url: str) -> Optional[Dict]:
    """
    Mengekstrak 20 fitur manual dari URL. Exact copy dari notebook.

    Args:
        url: URL string yang akan diekstrak fiturnya.

    Returns:
        Dictionary berisi 20 fitur, atau None jika URL tidak valid.

    Features yang diekstrak:
        - url_length, number_of_dots_in_url, having_repeated_digits_in_url
        - number_of_digits_in_url, number_of_special_char_in_url
        - number_of_hyphens_in_url, number_of_underline_in_url
        - number_of_slash_in_url, number_of_questionmark_in_url
        - number_of_equal_in_url, number_of_at_in_url
        - number_of_dollar_in_url, number_of_exclamation_in_url
        - number_of_hashtag_in_url, number_of_percent_in_url
        - path_length, having_query, having_fragment, having_anchor
        - entropy_of_url
    """
    original_url = str(url).strip()
    logger.debug(f"Extracting features untuk URL: {original_url[:80]}...")

    parsed = get_parsed_url(original_url)
    if parsed is None:
        logger.warning(f"URL tidak valid, skip feature extraction: {original_url[:80]}...")
        return None

    path = parsed.path
    query = parsed.query
    fragment = parsed.fragment

    domain, subdomain, subdomain_parts = extract_domain_subdomain(original_url)

    features = {}

    features["url_length"] = len(original_url)
    features["number_of_dots_in_url"] = original_url.count(".")
    features["having_repeated_digits_in_url"] = has_repeated_digits(original_url)
    features["number_of_digits_in_url"] = count_digits(original_url)
    features["number_of_special_char_in_url"] = count_special_url(original_url)
    features["number_of_hyphens_in_url"] = original_url.count("-")
    features["number_of_underline_in_url"] = original_url.count("_")
    features["number_of_slash_in_url"] = original_url.count("/") + original_url.count("\\")
    features["number_of_questionmark_in_url"] = original_url.count("?")
    features["number_of_equal_in_url"] = original_url.count("=")
    features["number_of_at_in_url"] = original_url.count("@")
    features["number_of_dollar_in_url"] = original_url.count("$")
    features["number_of_exclamation_in_url"] = original_url.count("!")
    features["number_of_hashtag_in_url"] = original_url.count("#")
    features["number_of_percent_in_url"] = original_url.count("%")

    features["path_length"] = len(path)
    features["having_query"] = int(len(query) > 0)
    features["having_fragment"] = int(len(fragment) > 0)
    features["having_anchor"] = features["having_fragment"]

    features["entropy_of_url"] = shannon_entropy(original_url)

    logger.debug(f"Features extracted: {len(features)} fitur")
    return features


def extract_features_array(url: str, feature_cols: List[str]) -> Optional[np.ndarray]:
    """
    Mengekstrak fitur manual dari URL dan mengembalikan numpy array.

    Args:
        url: URL string.
        feature_cols: List nama kolom fitur dalam urutan yang benar.

    Returns:
        numpy array (20,) berisi nilai fitur, atau None jika URL tidak valid.
    """
    features = extract_features(url)
    if features is None:
        return None

    feature_values = [features[col] for col in feature_cols]
    result = np.array(feature_values, dtype="float32")

    logger.info(f"Manual features extracted: shape={result.shape}")
    return result
