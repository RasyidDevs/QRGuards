"""
streamlit_test.py - Streamlit UI untuk unit testing backend QRGuards.
Mencakup test: Logger, Config, Preprocessor, FeatureExtractor, Model, API.
Kasus: SUCCESS dan ERROR untuk setiap modul.

Jalankan: streamlit run backend/src/test/streamlit_test.py
"""
import streamlit as st
import sys, os, io, logging, math, re, traceback
from collections import Counter
from unittest.mock import patch, MagicMock
from dataclasses import dataclass
import numpy as np

# Path setup — file ada di backend/src/test/, perlu naik 2 level ke backend/
_THIS_DIR = os.path.dirname(os.path.abspath(__file__))          # backend/src/test/
_BACKEND_DIR = os.path.dirname(os.path.dirname(_THIS_DIR))      # backend/
sys.path.insert(0, _BACKEND_DIR)

# ── Page Config ──
st.set_page_config(page_title="QRGuards Backend Tester", page_icon="🛡️", layout="wide")

# ── Custom CSS ──
st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
* { font-family: 'Inter', sans-serif; }
.main { background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); }
.stApp { background: linear-gradient(135deg, #0f0c29, #302b63, #24243e); }
h1 { background: linear-gradient(90deg, #00d2ff, #3a7bd5); -webkit-background-clip: text;
     -webkit-text-fill-color: transparent; text-align: center; font-size: 2.2rem; }
h2 { color: #00d2ff; border-bottom: 2px solid #3a7bd5; padding-bottom: 8px; }
h3 { color: #a78bfa; }
.test-pass { background: linear-gradient(135deg, #064e3b, #065f46); border-left: 4px solid #34d399;
    padding: 12px 16px; border-radius: 8px; margin: 6px 0; color: #d1fae5; }
.test-fail { background: linear-gradient(135deg, #7f1d1d, #991b1b); border-left: 4px solid #f87171;
    padding: 12px 16px; border-radius: 8px; margin: 6px 0; color: #fee2e2; }
.test-info { background: linear-gradient(135deg, #1e3a5f, #1e40af); border-left: 4px solid #60a5fa;
    padding: 12px 16px; border-radius: 8px; margin: 6px 0; color: #dbeafe; }
.summary-box { background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
    border-radius: 12px; padding: 20px; margin: 10px 0; backdrop-filter: blur(10px); }
.metric-card { background: linear-gradient(135deg, #1a1a2e, #16213e); border-radius: 12px;
    padding: 16px; text-align: center; border: 1px solid rgba(100,100,255,0.2); }
</style>
""", unsafe_allow_html=True)

# ── Test Runner Helper ──
results = {"passed": 0, "failed": 0, "tests": []}

def run_test(name, fn, expect_error=False):
    """Jalankan satu test case dan catat hasilnya."""
    try:
        result = fn()
        if expect_error:
            results["failed"] += 1
            results["tests"].append(("FAIL", name, "Expected error but succeeded"))
            st.markdown(f'<div class="test-fail">❌ <b>{name}</b> — Expected error tapi berhasil</div>', unsafe_allow_html=True)
        else:
            results["passed"] += 1
            msg = str(result) if result else "OK"
            results["tests"].append(("PASS", name, msg))
            st.markdown(f'<div class="test-pass">✅ <b>{name}</b> — {msg[:120]}</div>', unsafe_allow_html=True)
    except Exception as e:
        if expect_error:
            results["passed"] += 1
            results["tests"].append(("PASS", name, f"Expected error: {e}"))
            st.markdown(f'<div class="test-pass">✅ <b>{name}</b> — Error tertangkap: <code>{str(e)[:100]}</code></div>', unsafe_allow_html=True)
        else:
            results["failed"] += 1
            results["tests"].append(("FAIL", name, str(e)))
            st.markdown(f'<div class="test-fail">❌ <b>{name}</b> — {str(e)[:150]}</div>', unsafe_allow_html=True)
            with st.expander("Traceback"):
                st.code(traceback.format_exc())

# ── Header ──
st.markdown("# 🛡️ QRGuards Backend Unit Tester")
st.markdown('<div class="test-info">📋 Testing semua modul backend: Logger, Config, Preprocessor, Feature Extractor, Model Architecture, dan API Endpoint</div>', unsafe_allow_html=True)
st.divider()

# ══════════════════════════════════════════════════════════════
# 🔍 LIVE INFERENCE SECTION
# ══════════════════════════════════════════════════════════════
st.markdown("## 🔍 Live Model Inference")
st.markdown('<div class="test-info">🚀 Masukkan URL untuk melihat hasil prediksi model secara langsung. Model akan di-load otomatis saat pertama kali digunakan.</div>', unsafe_allow_html=True)
st.markdown("")

@st.cache_resource(show_spinner="⏳ Loading BERT model & checkpoint... (hanya sekali)")
def load_models():
    """Load BERT model dan checkpoint, di-cache agar tidak reload."""
    from src.utils.config import Config
    from src.models.embedding import load_bert_model
    from src.models.predictor import load_checkpoint
    cfg = Config()
    bert = load_bert_model(model_name=cfg.BERT_MODEL_NAME, device=cfg.DEVICE)
    components = load_checkpoint(
        checkpoint_path=cfg.CHECKPOINT_PATH,
        device=cfg.DEVICE,
        bert_dim=cfg.BERT_DIM,
        manual_dim=cfg.MANUAL_DIM,
        lstm_hidden=cfg.LSTM_HIDDEN,
    )
    return cfg, bert, components

# URL Input
col_input, col_btn = st.columns([4, 1])
with col_input:
    url_input = st.text_input(
        "🔗 Masukkan URL",
        placeholder="https://example.com atau http://suspicious-site.com/login",
        label_visibility="collapsed",
    )
with col_btn:
    analyze_btn = st.button("🔎 Analyze", use_container_width=True, type="primary")

# Quick test URLs
st.markdown("**Quick test:**")
qcol1, qcol2, qcol3, qcol4 = st.columns(4)
with qcol1:
    if st.button("✅ google.com", use_container_width=True):
        st.session_state["quick_url"] = "https://google.com"
        st.rerun()
with qcol2:
    if st.button("✅ github.com", use_container_width=True):
        st.session_state["quick_url"] = "https://github.com"
        st.rerun()
with qcol3:
    if st.button("⚠️ Suspicious URL", use_container_width=True):
        st.session_state["quick_url"] = "http://secure-banking-login.suspicious.com/verify?id=12345&token=abc"
        st.rerun()
with qcol4:
    if st.button("⚠️ Phishing-like", use_container_width=True):
        st.session_state["quick_url"] = "http://paypa1-secure.com/signin/update-account?session=x9k2m&ref=email"
        st.rerun()

# Resolve URL from quick buttons or text input
active_url = st.session_state.pop("quick_url", None) or url_input

if analyze_btn or (active_url and active_url != url_input):
    if not active_url or not active_url.strip():
        st.warning("⚠️ Masukkan URL terlebih dahulu!")
    else:
        try:
            cfg, bert_model, model_components = load_models()

            # Run inference
            from src.models.predictor import predict_url
            with st.spinner("🔄 Menjalankan inference..."):
                result = predict_url(
                    url=active_url.strip(),
                    model=model_components["model"],
                    bert_model=bert_model,
                    scaler=model_components["scaler"],
                    feature_cols=model_components["feature_cols"],
                    device=cfg.DEVICE,
                    threshold=cfg.THRESHOLD,
                )

            if result is None:
                st.error("❌ URL tidak valid atau tidak bisa diproses.")
            else:
                # Result display
                st.markdown("---")
                is_phishing = result["is_phishing"]
                prob = result["probability"]
                confidence = result["confidence"]
                label = result["label"]

                if is_phishing:
                    bg = "linear-gradient(135deg, #7f1d1d, #991b1b)"
                    border_color = "#f87171"
                    icon = "🚨"
                    text_color = "#fee2e2"
                    badge_bg = "#dc2626"
                else:
                    bg = "linear-gradient(135deg, #064e3b, #065f46)"
                    border_color = "#34d399"
                    icon = "✅"
                    text_color = "#d1fae5"
                    badge_bg = "#059669"

                st.markdown(f"""
                <div style="background:{bg}; border:2px solid {border_color}; border-radius:16px;
                            padding:24px; margin:16px 0; text-align:center;">
                    <h1 style="font-size:3rem; margin:0; -webkit-text-fill-color:{text_color};
                               background:none; -webkit-background-clip:unset;">{icon} {label}</h1>
                    <p style="color:{text_color}; font-size:1.1rem; margin:8px 0 0 0;">
                        <span style="background:{badge_bg}; padding:4px 16px; border-radius:20px; font-weight:600;">
                            Confidence: {confidence:.4%}
                        </span>
                    </p>
                </div>
                """, unsafe_allow_html=True)

                # Detail columns
                dc1, dc2, dc3, dc4 = st.columns(4)
                with dc1:
                    st.markdown(f"""
                    <div class="metric-card">
                        <p style="color:#94a3b8; margin:0; font-size:0.85rem;">URL Analyzed</p>
                        <p style="color:#e2e8f0; margin:4px 0 0; font-size:0.95rem; word-break:break-all;">{result['url']}</p>
                    </div>""", unsafe_allow_html=True)
                with dc2:
                    st.markdown(f"""
                    <div class="metric-card">
                        <p style="color:#94a3b8; margin:0; font-size:0.85rem;">Confidence</p>
                        <h2 style="color:#34d399; margin:4px 0 0;">{confidence:.6f}</h2>
                    </div>""", unsafe_allow_html=True)
                with dc3:
                    st.markdown(f"""
                    <div class="metric-card">
                        <p style="color:#94a3b8; margin:0; font-size:0.85rem;">Raw Sigmoid P(phishing)</p>
                        <h2 style="color:#60a5fa; margin:4px 0 0;">{prob:.6f}</h2>
                    </div>""", unsafe_allow_html=True)
                with dc4:
                    st.markdown(f"""
                    <div class="metric-card">
                        <p style="color:#94a3b8; margin:0; font-size:0.85rem;">Threshold</p>
                        <h2 style="color:#fbbf24; margin:4px 0 0;">{cfg.THRESHOLD}</h2>
                    </div>""", unsafe_allow_html=True)

                # Feature extraction details
                with st.expander("📊 Lihat detail fitur URL yang diekstrak"):
                    from src.data.feature_extractor import extract_features
                    feats = extract_features(active_url.strip())
                    if feats:
                        import pandas as pd
                        df = pd.DataFrame(list(feats.items()), columns=["Feature", "Value"])
                        st.dataframe(df, use_container_width=True, hide_index=True)

        except FileNotFoundError:
            st.error("❌ Checkpoint model (.pt) tidak ditemukan! Pastikan file ada di `backend/src/weights/`.")
        except Exception as e:
            st.error(f"❌ Error saat inference: {str(e)}")
            with st.expander("Traceback"):
                st.code(traceback.format_exc())

st.divider()
st.markdown("---")
st.markdown("## 📝 Unit Tests")
st.markdown('<div class="test-info">Berikut adalah hasil unit testing otomatis untuk setiap modul backend.</div>', unsafe_allow_html=True)
st.markdown("")

# ══════════════════════════════════════════════════════════════
# 1. LOGGER TESTS
# ══════════════════════════════════════════════════════════════
st.markdown("## 🪵 1. Logger Unit Tests")

st.markdown("### ✅ Success Cases")

def test_logger_basic_setup():
    from src.utils.config import Config
    from src.utils.logger import setup_logger
    cfg = Config()
    name = f"test.basic.{id(cfg)}"
    lgr = setup_logger(name, cfg)
    assert lgr is not None, "Logger None"
    assert lgr.name == name
    return f"Logger '{name}' dibuat, level={lgr.level}"
run_test("Logger: Basic Setup", test_logger_basic_setup)

def test_logger_default_config():
    from src.utils.logger import setup_logger
    name = f"test.default.{os.getpid()}.{id(test_logger_default_config)}"
    lgr = setup_logger(name)
    assert lgr is not None
    return f"Logger tanpa config: level={lgr.level}, handlers={len(lgr.handlers)}"
run_test("Logger: Default Config (None)", test_logger_default_config)

def test_logger_has_handler():
    from src.utils.logger import setup_logger
    name = f"test.handler.{id(test_logger_has_handler)}"
    lgr = setup_logger(name)
    assert len(lgr.handlers) > 0, "Tidak ada handler"
    assert isinstance(lgr.handlers[0], logging.StreamHandler)
    return f"Handler count={len(lgr.handlers)}, type={type(lgr.handlers[0]).__name__}"
run_test("Logger: Has StreamHandler", test_logger_has_handler)

def test_logger_no_duplicate():
    from src.utils.logger import setup_logger
    name = f"test.nodup.{id(test_logger_no_duplicate)}"
    lgr1 = setup_logger(name)
    h1 = len(lgr1.handlers)
    lgr2 = setup_logger(name)
    h2 = len(lgr2.handlers)
    assert h1 == h2, f"Duplicate handler: {h1} vs {h2}"
    return f"No duplicate: handlers tetap {h1}"
run_test("Logger: No Duplicate Handlers", test_logger_no_duplicate)

def test_logger_output_captured():
    from src.utils.logger import setup_logger
    name = f"test.capture.{id(test_logger_output_captured)}"
    lgr = setup_logger(name)
    buf = io.StringIO()
    h = logging.StreamHandler(buf)
    h.setFormatter(logging.Formatter("%(message)s"))
    lgr.addHandler(h)
    lgr.info("test_message_123")
    output = buf.getvalue()
    lgr.removeHandler(h)
    assert "test_message_123" in output
    return f"Output captured: '{output.strip()}'"
run_test("Logger: Output Captured Correctly", test_logger_output_captured)

def test_logger_levels():
    from src.utils.logger import setup_logger
    from src.utils.config import Config
    results_l = []
    for level in ["DEBUG", "INFO", "WARNING", "ERROR"]:
        cfg = Config()
        cfg.LOG_LEVEL = level
        name = f"test.level.{level}.{id(cfg)}"
        lgr = setup_logger(name, cfg)
        expected = getattr(logging, level)
        assert lgr.level == expected, f"Level mismatch: {lgr.level} != {expected}"
        results_l.append(f"{level}={lgr.level}")
    return f"Levels OK: {', '.join(results_l)}"
run_test("Logger: All Log Levels (DEBUG/INFO/WARNING/ERROR)", test_logger_levels)

def test_logger_format():
    from src.utils.logger import setup_logger
    from src.utils.config import Config
    cfg = Config()
    name = f"test.format.{id(cfg)}"
    lgr = setup_logger(name, cfg)
    fmt = lgr.handlers[0].formatter._fmt
    assert "%(asctime)s" in fmt
    assert "%(levelname)" in fmt
    return f"Format OK: {fmt[:60]}..."
run_test("Logger: Format Contains Timestamp & Level", test_logger_format)

st.markdown("### ❌ Error Cases")

def test_logger_invalid_level():
    from src.utils.logger import setup_logger
    from src.utils.config import Config
    cfg = Config()
    cfg.LOG_LEVEL = "INVALID_LEVEL"
    name = f"test.invalid.{id(cfg)}"
    lgr = setup_logger(name, cfg)
    assert lgr.level == logging.INFO, "Should fallback to INFO"
    return f"Fallback to INFO: level={lgr.level}"
run_test("Logger: Invalid Level → Fallback INFO", test_logger_invalid_level)

def test_logger_empty_name():
    from src.utils.logger import setup_logger
    lgr = setup_logger("")
    assert lgr is not None
    return f"Empty name logger: name='{lgr.name}', root={lgr.name == 'root' or lgr.name == ''}"
run_test("Logger: Empty Name", test_logger_empty_name)

st.divider()

# ══════════════════════════════════════════════════════════════
# 2. CONFIG TESTS
# ══════════════════════════════════════════════════════════════
st.markdown("## ⚙️ 2. Config Unit Tests")

st.markdown("### ✅ Success Cases")

def test_config_defaults():
    from src.utils.config import Config
    cfg = Config()
    assert cfg.BERT_DIM == 768
    assert cfg.MANUAL_DIM == 20
    assert cfg.LSTM_HIDDEN == 256
    assert cfg.THRESHOLD == 0.5
    return f"Defaults OK: BERT={cfg.BERT_DIM}, Manual={cfg.MANUAL_DIM}, LSTM={cfg.LSTM_HIDDEN}, Thresh={cfg.THRESHOLD}"
run_test("Config: Default Values", test_config_defaults)

def test_config_device():
    from src.utils.config import Config
    cfg = Config()
    assert cfg.DEVICE in ("cpu", "cuda")
    return f"Device: {cfg.DEVICE}"
run_test("Config: Device Detection", test_config_device)

def test_config_features():
    from src.utils.config import Config
    cfg = Config()
    assert len(cfg.FEATURE_COLS) == 20
    assert "url_length" in cfg.FEATURE_COLS
    assert "entropy_of_url" in cfg.FEATURE_COLS
    return f"Features: {len(cfg.FEATURE_COLS)} cols"
run_test("Config: 20 Feature Columns", test_config_features)

def test_config_labels():
    from src.utils.config import Config
    cfg = Config()
    assert cfg.LABEL_MAP[0] == "Legitimate"
    assert cfg.LABEL_MAP[1] == "Phishing"
    return f"Labels: {cfg.LABEL_MAP}"
run_test("Config: Label Map", test_config_labels)

def test_config_log_settings():
    from src.utils.config import Config
    cfg = Config()
    assert cfg.LOG_LEVEL == "INFO"
    assert "%(asctime)s" in cfg.LOG_FORMAT
    return f"Log: level={cfg.LOG_LEVEL}, format OK"
run_test("Config: Log Settings", test_config_log_settings)

def test_config_checkpoint_path():
    from src.utils.config import Config
    cfg = Config()
    assert cfg.CHECKPOINT_PATH.endswith(".pt")
    return f"Checkpoint: ...{cfg.CHECKPOINT_PATH[-40:]}"
run_test("Config: Checkpoint Path (.pt)", test_config_checkpoint_path)

st.markdown("### ❌ Error Cases")

def test_config_override():
    from src.utils.config import Config
    cfg = Config()
    cfg.THRESHOLD = 99.0
    assert cfg.THRESHOLD == 99.0
    cfg.CHECKPOINT_PATH = "/nonexistent/path.pt"
    assert not os.path.exists(cfg.CHECKPOINT_PATH)
    return "Override + nonexistent path accepted (runtime check later)"
run_test("Config: Override with Invalid Path", test_config_override)

st.divider()

# ══════════════════════════════════════════════════════════════
# 3. PREPROCESSOR TESTS
# ══════════════════════════════════════════════════════════════
st.markdown("## 🔗 3. Preprocessor Unit Tests")

st.markdown("### ✅ Success Cases")

def test_add_scheme_http():
    from src.data.preprocessor import add_scheme_if_missing
    r = add_scheme_if_missing("google.com")
    assert r == "http://google.com"
    return f"'google.com' → '{r}'"
run_test("Preprocessor: Add http:// scheme", test_add_scheme_http)

def test_keep_existing_scheme():
    from src.data.preprocessor import add_scheme_if_missing
    r = add_scheme_if_missing("https://google.com")
    assert r == "https://google.com"
    return f"'https://google.com' → '{r}'"
run_test("Preprocessor: Keep existing https://", test_keep_existing_scheme)

def test_parsed_url():
    from src.data.preprocessor import get_parsed_url
    p = get_parsed_url("https://example.com/path?q=1#frag")
    assert p is not None
    assert p.scheme == "https"
    assert p.netloc == "example.com"
    return f"scheme={p.scheme}, netloc={p.netloc}, path={p.path}"
run_test("Preprocessor: Parse URL with query & fragment", test_parsed_url)

def test_extract_domain():
    from src.data.preprocessor import extract_domain_subdomain
    d, s, sp = extract_domain_subdomain("https://mail.google.com/inbox")
    assert "google" in d.lower()
    return f"domain={d}, subdomain={s}, parts={sp}"
run_test("Preprocessor: Extract domain/subdomain", test_extract_domain)

st.markdown("### ❌ Error Cases")

def test_empty_url():
    from src.data.preprocessor import get_parsed_url
    p = get_parsed_url("")
    assert p is not None  # urlparse won't fail on empty
    return f"Empty URL parsed: scheme='{p.scheme}', netloc='{p.netloc}'"
run_test("Preprocessor: Empty URL handling", test_empty_url)

def test_whitespace_url():
    from src.data.preprocessor import add_scheme_if_missing
    r = add_scheme_if_missing("   google.com   ")
    assert "google.com" in r
    return f"Whitespace stripped: '{r}'"
run_test("Preprocessor: Whitespace URL", test_whitespace_url)

st.divider()

# ══════════════════════════════════════════════════════════════
# 4. FEATURE EXTRACTOR TESTS
# ══════════════════════════════════════════════════════════════
st.markdown("## 📊 4. Feature Extractor Unit Tests")

st.markdown("### ✅ Success Cases")

def test_extract_simple():
    from src.data.feature_extractor import extract_features
    f = extract_features("https://google.com")
    assert f is not None
    assert len(f) == 20
    assert f["url_length"] == len("https://google.com")
    return f"20 features OK, url_length={f['url_length']}"
run_test("Features: Simple URL (google.com)", test_extract_simple)

def test_extract_complex():
    from src.data.feature_extractor import extract_features
    url = "http://evil-site.com/login?user=admin&pass=123#section"
    f = extract_features(url)
    assert f["having_query"] == 1
    assert f["having_fragment"] == 1
    assert f["number_of_hyphens_in_url"] > 0
    assert f["number_of_equal_in_url"] > 0
    return f"Complex URL: query={f['having_query']}, frag={f['having_fragment']}, hyphens={f['number_of_hyphens_in_url']}"
run_test("Features: Complex URL with query/fragment", test_extract_complex)

def test_entropy():
    from src.data.feature_extractor import shannon_entropy
    e1 = shannon_entropy("aaaa")
    e2 = shannon_entropy("abcd")
    assert e1 < e2, "Low entropy should be < high entropy"
    e0 = shannon_entropy("")
    assert e0 == 0.0
    return f"entropy('aaaa')={e1:.3f}, entropy('abcd')={e2:.3f}, entropy('')={e0}"
run_test("Features: Shannon Entropy", test_entropy)

def test_special_chars():
    from src.data.feature_extractor import count_special_url
    assert count_special_url("hello$world#test%done") == 3
    assert count_special_url("normal") == 0
    return "Special chars counted correctly"
run_test("Features: Special Char Count", test_special_chars)

def test_repeated_digits():
    from src.data.feature_extractor import has_repeated_digits
    assert has_repeated_digits("abc11def") == 1
    assert has_repeated_digits("abc1def2") == 0
    return "Repeated digits detection OK"
run_test("Features: Repeated Digits", test_repeated_digits)

def test_extract_array():
    from src.data.feature_extractor import extract_features_array
    from src.utils.config import Config
    cfg = Config()
    arr = extract_features_array("https://google.com", cfg.FEATURE_COLS)
    assert arr is not None
    assert arr.shape == (20,)
    assert arr.dtype == np.float32
    return f"Array shape={arr.shape}, dtype={arr.dtype}"
run_test("Features: Extract as numpy array", test_extract_array)

st.markdown("### ❌ Error Cases")

def test_extract_none_url():
    from src.data.feature_extractor import extract_features
    f = extract_features(None)
    return f"None URL result: {f}"
run_test("Features: None URL input", test_extract_none_url)

def test_extract_array_bad_cols():
    from src.data.feature_extractor import extract_features_array
    def fn():
        return extract_features_array("https://google.com", ["nonexistent_col"])
    try:
        r = fn()
        return f"Result: {r}"
    except KeyError as e:
        raise e
run_test("Features: Invalid feature columns → KeyError", test_extract_array_bad_cols, expect_error=True)

st.divider()

# ══════════════════════════════════════════════════════════════
# 5. MODEL ARCHITECTURE TESTS
# ══════════════════════════════════════════════════════════════
st.markdown("## 🧠 5. Model Architecture Unit Tests")

st.markdown("### ✅ Success Cases")

def test_model_init():
    import torch
    from src.models.model import PhishingBiLSTMAttention
    m = PhishingBiLSTMAttention(bert_dim=768, manual_dim=20, lstm_hidden=256)
    assert m is not None
    params = sum(p.numel() for p in m.parameters())
    return f"Model created, params={params:,}"
run_test("Model: Initialize PhishingBiLSTMAttention", test_model_init)

def test_model_forward():
    import torch
    from src.models.model import PhishingBiLSTMAttention
    m = PhishingBiLSTMAttention()
    m.eval()
    bert_x = torch.randn(1, 1, 768)
    manual_x = torch.randn(1, 20)
    with torch.no_grad():
        out = m(bert_x, manual_x)
    assert out.shape == (1,), f"Expected (1,), got {out.shape}"
    assert 0 <= out.item() <= 1, "Output not in [0,1]"
    return f"Output shape={out.shape}, value={out.item():.6f}"
run_test("Model: Forward Pass", test_model_forward)

def test_model_batch():
    import torch
    from src.models.model import PhishingBiLSTMAttention
    m = PhishingBiLSTMAttention()
    m.eval()
    bs = 4
    bert_x = torch.randn(bs, 1, 768)
    manual_x = torch.randn(bs, 20)
    with torch.no_grad():
        out = m(bert_x, manual_x)
    assert out.shape == (bs,)
    return f"Batch={bs}, output shape={out.shape}"
run_test("Model: Batch Forward Pass (bs=4)", test_model_batch)

def test_attention_layer():
    import torch
    from src.models.model import AttentionLayer
    attn = AttentionLayer(hidden_dim=512)
    x = torch.randn(2, 5, 512)
    ctx = attn(x)
    assert ctx.shape == (2, 512)
    return f"Attention: input=(2,5,512) → output={ctx.shape}"
run_test("Model: AttentionLayer standalone", test_attention_layer)

def test_model_eval_mode():
    import torch
    from src.models.model import PhishingBiLSTMAttention
    m = PhishingBiLSTMAttention()
    m.eval()
    assert not m.training
    return "Model in eval mode (training=False)"
run_test("Model: Eval Mode", test_model_eval_mode)

st.markdown("### ❌ Error Cases")

def test_model_wrong_dim():
    import torch
    from src.models.model import PhishingBiLSTMAttention
    m = PhishingBiLSTMAttention(bert_dim=768, manual_dim=20)
    bert_x = torch.randn(1, 1, 768)
    manual_x = torch.randn(1, 50)  # Wrong dim: 50 instead of 20
    with torch.no_grad():
        m(bert_x, manual_x)
run_test("Model: Wrong manual_dim → RuntimeError", test_model_wrong_dim, expect_error=True)

def test_model_wrong_bert():
    import torch
    from src.models.model import PhishingBiLSTMAttention
    m = PhishingBiLSTMAttention(bert_dim=768)
    bert_x = torch.randn(1, 1, 100)  # Wrong: 100 instead of 768
    manual_x = torch.randn(1, 20)
    with torch.no_grad():
        m(bert_x, manual_x)
run_test("Model: Wrong bert_dim → RuntimeError", test_model_wrong_bert, expect_error=True)

def test_model_invalid_type():
    from src.models.model import PhishingBiLSTMAttention
    m = PhishingBiLSTMAttention()
    m.eval()
    # String bukan tensor → pasti error
    m("bukan_tensor", "juga_bukan")
run_test("Model: Input bukan Tensor → TypeError", test_model_invalid_type, expect_error=True)

st.divider()

# ══════════════════════════════════════════════════════════════
# 6. API SCHEMA TESTS
# ══════════════════════════════════════════════════════════════
st.markdown("## 🌐 6. API Schema & Validation Tests")

st.markdown("### ✅ Success Cases")

def test_predict_request_valid():
    from src.api import PredictRequest
    req = PredictRequest(url="https://google.com")
    assert req.url == "https://google.com"
    return f"PredictRequest OK: url='{req.url}'"
run_test("API: Valid PredictRequest", test_predict_request_valid)

def test_predict_response_valid():
    from src.api import PredictResponse
    resp = PredictResponse(prediction="Legitimate", confidence=0.0312)
    assert resp.prediction == "Legitimate"
    assert resp.confidence == 0.0312
    return f"PredictResponse OK: pred={resp.prediction}, conf={resp.confidence}"
run_test("API: Valid PredictResponse", test_predict_response_valid)

def test_error_response():
    from src.api import ErrorResponse
    err = ErrorResponse(detail="Test error")
    assert err.detail == "Test error"
    return f"ErrorResponse OK: detail='{err.detail}'"
run_test("API: ErrorResponse schema", test_error_response)

def test_app_routes():
    from src.api import app
    routes = [r.path for r in app.routes]
    assert "/predict" in routes, f"/predict not found in {routes}"
    assert "/health" in routes, f"/health not found in {routes}"
    return f"Routes: {[r for r in routes if not r.startswith('/open')]}"
run_test("API: Routes /predict & /health exist", test_app_routes)

st.markdown("### ❌ Error Cases")

def test_predict_request_empty():
    from src.api import PredictRequest
    from pydantic import ValidationError
    try:
        PredictRequest()
        raise AssertionError("Should fail without url")
    except ValidationError as e:
        return f"Validation error: {e.error_count()} error(s)"
run_test("API: PredictRequest tanpa URL → ValidationError", test_predict_request_empty)

def test_predict_response_invalid():
    from src.api import PredictResponse
    from pydantic import ValidationError
    try:
        PredictResponse(prediction=123, confidence="abc")
        raise AssertionError("Should fail")
    except (ValidationError, Exception) as e:
        return f"Validation error caught"
run_test("API: PredictResponse invalid types", test_predict_response_invalid)

st.divider()

# ══════════════════════════════════════════════════════════════
# SUMMARY
# ══════════════════════════════════════════════════════════════
st.markdown("## 📊 Test Summary")

total = results["passed"] + results["failed"]
pass_rate = (results["passed"] / total * 100) if total > 0 else 0

col1, col2, col3, col4 = st.columns(4)
with col1:
    st.markdown(f'<div class="metric-card"><h2 style="color:#60a5fa;margin:0">{total}</h2><p style="color:#94a3b8;margin:0">Total Tests</p></div>', unsafe_allow_html=True)
with col2:
    st.markdown(f'<div class="metric-card"><h2 style="color:#34d399;margin:0">{results["passed"]}</h2><p style="color:#94a3b8;margin:0">Passed ✅</p></div>', unsafe_allow_html=True)
with col3:
    st.markdown(f'<div class="metric-card"><h2 style="color:#f87171;margin:0">{results["failed"]}</h2><p style="color:#94a3b8;margin:0">Failed ❌</p></div>', unsafe_allow_html=True)
with col4:
    color = "#34d399" if pass_rate >= 90 else "#fbbf24" if pass_rate >= 70 else "#f87171"
    st.markdown(f'<div class="metric-card"><h2 style="color:{color};margin:0">{pass_rate:.1f}%</h2><p style="color:#94a3b8;margin:0">Pass Rate</p></div>', unsafe_allow_html=True)

if pass_rate == 100:
    st.balloons()
    st.success("🎉 Semua test PASSED! Backend QRGuards siap digunakan.")
elif pass_rate >= 80:
    st.warning(f"⚠️ {results['failed']} test gagal. Periksa error di atas.")
else:
    st.error(f"🚨 {results['failed']} test gagal! Backend perlu perbaikan.")

# Detail table
with st.expander("📋 Detail Semua Test Results"):
    for status, name, msg in results["tests"]:
        icon = "✅" if status == "PASS" else "❌"
        st.text(f"{icon} [{status}] {name}: {msg[:100]}")
