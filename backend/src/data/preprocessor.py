"""
preprocessor.py - URL preprocessing utilities untuk QRGuards inference.

Modul ini berisi fungsi-fungsi untuk mempersiapkan URL sebelum
feature extraction, termasuk penambahan scheme dan parsing URL.

Semua fungsi di-copy exact dari notebook QRGuards.ipynb.
"""

import re
from urllib.parse import urlparse

import tldextract

from ..utils.logger import setup_logger

logger = setup_logger("qrguards.data.preprocessor")


def add_scheme_if_missing(url: str) -> str:
    """
    Menambahkan scheme 'http://' jika URL tidak memiliki scheme.

    Exact copy dari notebook:
    >>> add_scheme_if_missing("google.com")
    'http://google.com'
    >>> add_scheme_if_missing("https://google.com")
    'https://google.com'
    """
    url = str(url).strip()
    if not re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", url):
        url = "http://" + url
    logger.debug(f"URL setelah add_scheme: {url}")
    return url


def extract_domain_subdomain(url: str):
    """
    Mengekstrak main domain, subdomain, dan subdomain parts dari URL.

    Exact copy dari notebook.

    Returns:
        tuple: (main_domain, subdomain, subdomain_parts)
    """
    ext = tldextract.extract(url)

    if ext.suffix:
        main_domain = ext.domain + "." + ext.suffix
    else:
        main_domain = ext.domain

    subdomain = ext.subdomain

    if subdomain:
        subdomain_parts = subdomain.split(".")
    else:
        subdomain_parts = []

    logger.debug(f"Domain: {main_domain}, Subdomain: {subdomain}")
    return main_domain, subdomain, subdomain_parts


def get_parsed_url(url: str):
    """
    Parse URL setelah menambahkan scheme jika diperlukan.

    Exact copy dari notebook.

    Returns:
        ParseResult atau None jika URL tidak valid.
    """
    try:
        url_with_scheme = add_scheme_if_missing(url)
        parsed = urlparse(url_with_scheme)
        logger.debug(f"URL parsed - scheme: {parsed.scheme}, netloc: {parsed.netloc}, path: {parsed.path}")
        return parsed
    except ValueError:
        logger.warning(f"URL tidak valid dan tidak bisa di-parse: {url}")
        return None
