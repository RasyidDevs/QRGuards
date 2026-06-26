"""
logger.py - Setup logging untuk pipeline inference QRGuards.

Setiap langkah inference didokumentasikan via logger dengan format standar
yang mencakup timestamp, level, nama modul, dan pesan.
"""

import logging
import sys
from .config import Config


def setup_logger(name: str = "qrguards", config: Config = None) -> logging.Logger:
    """
    Membuat dan mengembalikan logger dengan konfigurasi standar.

    Args:
        name: Nama logger (biasanya nama modul).
        config: Instance Config untuk mengambil LOG_LEVEL dan LOG_FORMAT.

    Returns:
        logging.Logger yang sudah dikonfigurasi.
    """
    if config is None:
        config = Config()

    logger = logging.getLogger(name)

    # Hindari duplicate handler jika logger sudah ada
    if logger.handlers:
        return logger

    logger.setLevel(getattr(logging, config.LOG_LEVEL.upper(), logging.INFO))

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, config.LOG_LEVEL.upper(), logging.INFO))

    formatter = logging.Formatter(
        fmt=config.LOG_FORMAT,
        datefmt=config.LOG_DATE_FORMAT,
    )
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)

    return logger
