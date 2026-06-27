"""
run_pipeline.py - Entry point untuk menjalankan seluruh pipeline inference QRGuards.

Script ini mengorkestrasikan seluruh proses inference dari awal hingga akhir:
1. Load konfigurasi
2. Setup logger
3. Load BERT model (SentenceTransformer)
4. Load checkpoint model (weights + scaler + feature_cols)
5. Terima URL input (dari CLI argument atau interactive)
6. Extract manual URL features
7. Generate BERT embedding
8. Scale features dengan StandardScaler
9. Run model forward pass (BiLSTM-Attention)
10. Output hasil prediksi (Legitimate/Phishing + probability)

Usage:
    python -m backend.src.run_pipeline --url "https://example.com"
    python -m backend.src.run_pipeline --url "http://suspicious-login.example.com/verify"
    python -m backend.src.run_pipeline  (interactive mode)
"""

import argparse
import sys
import os
import json

# Tambahkan parent directory ke path agar bisa import sebagai package
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils.config import Config
from src.utils.logger import setup_logger
from src.models.embedding import load_bert_model
from src.models.predictor import load_checkpoint, predict_url


def parse_args():
    """Parse command-line arguments."""
    parser = argparse.ArgumentParser(
        description="QRGuards - Pipeline Inference untuk Deteksi Phishing URL",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Contoh penggunaan:
  python run_pipeline.py --url "https://google.com"
  python run_pipeline.py --url "http://suspicious-login.fake-bank.com/verify"
  python run_pipeline.py  (interactive mode)
        """
    )
    parser.add_argument(
        "--url",
        type=str,
        default=None,
        help="URL yang akan diprediksi. Jika tidak diberikan, masuk interactive mode."
    )
    parser.add_argument(
        "--checkpoint",
        type=str,
        default=None,
        help="Path ke file checkpoint model (.pt). Default: dari config."
    )
    parser.add_argument(
        "--threshold",
        type=float,
        default=None,
        help="Threshold untuk klasifikasi phishing. Default: 0.5"
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output hasil dalam format JSON."
    )

    return parser.parse_args()


def run_inference(url: str, config: Config, logger, bert_model, model_components, use_json: bool = False):
    """
    Menjalankan inference untuk satu URL.

    Args:
        url: URL yang akan diprediksi.
        config: Konfigurasi.
        logger: Logger instance.
        bert_model: SentenceTransformer model.
        model_components: Dict berisi 'model', 'scaler', 'feature_cols'.
        use_json: Jika True, output dalam format JSON.
    """
    logger.info(f"Memulai inference untuk URL: {url}")

    result = predict_url(
        url=url,
        model=model_components["model"],
        bert_model=bert_model,
        scaler=model_components["scaler"],
        feature_cols=model_components["feature_cols"],
        device=config.DEVICE,
        threshold=config.THRESHOLD,
    )

    if result is None:
        logger.error(f"Prediksi gagal untuk URL: {url}")
        print(f"\n❌ Prediksi gagal: URL tidak valid atau tidak bisa diproses.")
        return

    if use_json:
        # Output JSON
        json_result = {
            "url": result["url"],
            "label": result["label"],
            "label_id": result["label_id"],
            "confidence": round(result["confidence"], 6),
            "probability": round(result["probability"], 6),
            "is_phishing": result["is_phishing"],
        }
        print(json.dumps(json_result, indent=2, ensure_ascii=False))
    else:
        # Output yang readable
        print(f"\n{'='*60}")
        print(f"  QRGuards - Hasil Prediksi")
        print(f"{'='*60}")
        print(f"  URL         : {result['url']}")
        print(f"  Label       : {result['label']}")
        print(f"  Confidence  : {result['confidence']:.6f}")
        print(f"  Raw Prob    : {result['probability']:.6f}")
        print(f"  Is Phishing : {'Ya ⚠️' if result['is_phishing'] else 'Tidak ✅'}")
        print(f"{'='*60}")

    logger.info(f"Inference selesai: {result['label']} (confidence={result['confidence']:.4f})")


def main():
    """Main function - menjalankan seluruh pipeline inference."""

    args = parse_args()

    # =========================================================================
    # Step 1: Load konfigurasi
    # =========================================================================
    config = Config()

    # Override dari CLI arguments
    if args.checkpoint:
        config.CHECKPOINT_PATH = args.checkpoint
    if args.threshold is not None:
        config.THRESHOLD = args.threshold

    # =========================================================================
    # Step 2: Setup logger
    # =========================================================================
    logger = setup_logger("qrguards.pipeline", config)

    logger.info("=" * 60)
    logger.info("QRGuards Inference Pipeline - Starting")
    logger.info("=" * 60)
    logger.info(f"Device: {config.DEVICE}")
    logger.info(f"BERT Model: {config.BERT_MODEL_NAME}")
    logger.info(f"Checkpoint: {config.CHECKPOINT_PATH}")
    logger.info(f"Threshold: {config.THRESHOLD}")

    # =========================================================================
    # Step 3: Load BERT model
    # =========================================================================
    logger.info("[Pipeline Step 1/3] Loading BERT model...")

    bert_model = load_bert_model(
        model_name=config.BERT_MODEL_NAME,
        device=config.DEVICE,
    )

    logger.info("BERT model loaded successfully.")

    # =========================================================================
    # Step 4: Load checkpoint (model + scaler + feature_cols)
    # =========================================================================
    logger.info("[Pipeline Step 2/3] Loading model checkpoint...")

    model_components = load_checkpoint(
        checkpoint_path=config.CHECKPOINT_PATH,
        device=config.DEVICE,
        bert_dim=config.BERT_DIM,
        manual_dim=config.MANUAL_DIM,
        lstm_hidden=config.LSTM_HIDDEN,
    )

    logger.info("Model checkpoint loaded successfully.")

    # =========================================================================
    # Step 5: Run inference
    # =========================================================================
    logger.info("[Pipeline Step 3/3] Running inference...")

    if args.url:
        # Single URL mode
        run_inference(args.url, config, logger, bert_model, model_components, args.json)
    else:
        # Interactive mode
        print(f"\n{'='*60}")
        print(f"  QRGuards - Interactive Mode")
        print(f"  Ketik URL untuk prediksi, 'quit' untuk keluar")
        print(f"{'='*60}\n")

        while True:
            try:
                url = input("🔗 Masukkan URL: ").strip()

                if url.lower() in ("quit", "exit", "q"):
                    logger.info("User keluar dari interactive mode.")
                    print("Goodbye! 👋")
                    break

                if not url:
                    print("⚠️  URL tidak boleh kosong. Coba lagi.\n")
                    continue

                run_inference(url, config, logger, bert_model, model_components, args.json)
                print()  # blank line separator

            except KeyboardInterrupt:
                logger.info("User interrupt (Ctrl+C).")
                print("\nGoodbye! 👋")
                break
            except EOFError:
                break

    logger.info("QRGuards Inference Pipeline - Finished")


if __name__ == "__main__":
    main()
