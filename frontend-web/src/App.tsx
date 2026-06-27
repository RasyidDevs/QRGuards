import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';

type Prediction = 'Legitimate' | 'Phishing';
interface PredictResponse { prediction: Prediction; confidence: number; }
const API_URL = 'http://localhost:8000';

export default function App() {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const hasScannedRef = useRef(false);
  const [scannedQrUrl, setScannedQrUrl] = useState('');
  const [finalUrl, setFinalUrl] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);
  const [error, setError] = useState('');
  const [cameraError, setCameraError] = useState('');
  const [resolveNote, setResolveNote] = useState('');

  const phishingPct = result ? result.confidence * 100 : 0;
  const legitimatePct = result ? (1 - result.confidence) * 100 : 0;
  const isPhishing = result?.prediction === 'Phishing';
  const scoreValue = result ? (isPhishing ? phishingPct : legitimatePct) : 0;

  const isValidHttpUrl = (v: string) => {
    try { const u = new URL(v); return u.protocol === 'http:' || u.protocol === 'https:'; }
    catch { return false; }
  };

  const resolveFinalUrl = async (url: string) => {
    try {
      const r = await fetch(url, { method: 'HEAD', redirect: 'follow' });
      return r.url || url;
    } catch {
      setResolveNote('URL akhir tidak dapat diverifikasi otomatis. Sistem menggunakan URL hasil scan.');
      return url;
    }
  };

  const predictUrl = async (targetUrl: string) => {
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await fetch(`${API_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: targetUrl }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.detail || 'Gagal memproses URL.'); }
      setResult(await r.json());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tidak dapat terhubung ke server analisis.');
    } finally { setLoading(false); }
  };

  const handleScannedQr = async (decoded: string) => {
    setError(''); setCameraError(''); setResolveNote(''); setResult(null);
    setScannedQrUrl(decoded);
    if (!isValidHttpUrl(decoded)) { setError('QR tidak berisi URL valid.'); return; }
    const resolved = await resolveFinalUrl(decoded);
    setFinalUrl(resolved);
    await predictUrl(resolved);
  };

  useEffect(() => {
    if (!scannerActive) return;
    hasScannedRef.current = false;
    const scanner = new Html5QrcodeScanner('qr-reader', { fps: 10, qrbox: { width: 220, height: 220 } }, false);
    scannerRef.current = scanner;
    scanner.render(async (decoded) => {
      if (hasScannedRef.current) return;
      hasScannedRef.current = true;
      setScannerActive(false);
      await scanner.clear().catch(() => {});
      await handleScannedQr(decoded);
    }, (err) => {
      const m = String(err).toLowerCase();
      if (m.includes('notallowed') || m.includes('permission') || m.includes('notfound') || m.includes('camera')) {
        setCameraError('Izinkan akses kamera di browser, atau gunakan Upload QR.');
      }
    });
    return () => { scanner.clear().catch(() => {}); };
  }, [scannerActive]);

  const handleQrImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setError(''); setCameraError(''); setResolveNote(''); setResult(null);
    try {
      setLoading(true);
      if (scannerRef.current) { await scannerRef.current.clear().catch(() => {}); scannerRef.current = null; }
      setScannerActive(false);
      const fs = new Html5Qrcode('qr-file-reader');
      const decoded = await fs.scanFile(file, true);
      await fs.clear().catch(() => {});
      await handleScannedQr(decoded);
    } catch { setError('QR tidak terbaca. Gunakan gambar yang lebih jelas.'); }
    finally { setLoading(false); e.target.value = ''; }
  };

  const handleManualSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); setCameraError(''); setResolveNote(''); setResult(null); setScannedQrUrl('');
    if (!manualUrl.trim()) { setError('Masukkan URL terlebih dahulu.'); return; }
    if (!isValidHttpUrl(manualUrl)) { setError('URL harus diawali http:// atau https://'); return; }
    const resolved = await resolveFinalUrl(manualUrl);
    setFinalUrl(resolved);
    await predictUrl(resolved);
  };

  const handleReset = () => {
    setScannedQrUrl(''); setFinalUrl(''); setManualUrl(''); setResult(null);
    setError(''); setCameraError(''); setResolveNote(''); setScannerActive(true);
  };

  // SVG ring for score
  const R = 52, CIRC = 2 * Math.PI * R;
  const ringOffset = CIRC - (scoreValue / 100) * CIRC;
  const ringColor = result ? (isPhishing ? '#dc2626' : '#16a34a') : '#d1d5db';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,300;0,400;0,500;0,600&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; }
        body { background: #f5f3ef; color: #1c1917; font-family: 'DM Sans', sans-serif; }

        /* ── Layout ── */
        .root {
          min-height: 100vh;
          background: #f5f3ef;
          display: flex;
          flex-direction: column;
        }

        /* ── Top bar ── */
        .topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 14px 32px;
          background: #f5f3ef;
          border-bottom: 1px solid #e2ddd7;
          position: sticky; top: 0; z-index: 10;
        }
        .brand { display: flex; align-items: center; gap: 12px; }
        .brand-mark {
          width: 36px; height: 36px;
          background: #1c1917;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .brand-mark svg { display: block; }
        .brand-name { font-size: 15px; font-weight: 600; color: #1c1917; letter-spacing: -0.3px; }
        .brand-sub { font-size: 11px; color: #a8a29e; margin-top: 1px; }
        .status-chip {
          display: flex; align-items: center; gap: 7px;
          font-size: 11px; color: #78716c;
          background: #ede9e3;
          border: 1px solid #d6d0c8;
          padding: 5px 13px; border-radius: 99px;
        }
        .status-dot { width: 6px; height: 6px; border-radius: 50%; background: #16a34a; }

        /* ── Body grid ── */
        .body {
          flex: 1;
          max-width: 1280px;
          width: 100%;
          margin: 0 auto;
          padding: 28px 32px 40px;
          display: grid;
          grid-template-columns: 340px 1fr;
          gap: 20px;
          align-items: start;
        }
        @media (max-width: 900px) {
          .body { grid-template-columns: 1fr; padding: 20px 16px 32px; }
          .topbar { padding: 12px 16px; }
        }

        /* ── Cards ── */
        .card {
          background: #fff;
          border: 1px solid #e2ddd7;
          border-radius: 16px;
          padding: 22px;
        }
        .card + .card { margin-top: 16px; }

        .card-tag {
          display: inline-block;
          font-size: 10px; font-weight: 600;
          letter-spacing: .1em; text-transform: uppercase;
          color: #78716c;
          background: #f5f3ef;
          border: 1px solid #e2ddd7;
          padding: 3px 9px; border-radius: 6px;
          margin-bottom: 12px;
        }
        .card-title { font-size: 17px; font-weight: 600; color: #1c1917; letter-spacing: -0.3px; margin-bottom: 4px; }
        .card-desc { font-size: 13px; color: #a8a29e; line-height: 1.55; margin-bottom: 18px; }

        /* ── Camera viewport ── */
        .cam-wrap {
          background: #fafaf9;
          border: 1px solid #e2ddd7;
          border-radius: 12px;
          overflow: hidden;
          min-height: 260px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cam-wrap #qr-reader { width: 100%; }
        .cam-success {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; gap: 8px; padding: 32px 20px;
        }
        .cam-success-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: #f0fdf4; border: 1px solid #bbf7d0;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 6px;
        }
        .cam-success-title { font-size: 15px; font-weight: 600; color: #1c1917; }
        .cam-success-sub { font-size: 12px; color: #a8a29e; }

        /* ── Buttons ── */
        .btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 14px; }
        .btn {
          padding: 10px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 500;
          cursor: pointer; border: none; transition: all .15s;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-ghost {
          background: #f5f3ef;
          border: 1px solid #d6d0c8;
          color: #57534e;
        }
        .btn-ghost:hover { background: #ede9e3; }
        .btn-solid {
          background: #1c1917;
          color: #f5f3ef;
        }
        .btn-solid:hover { background: #292524; }
        .btn-solid:disabled { opacity: 0.45; cursor: not-allowed; }
        .btn-upload {
          display: flex; align-items: center; justify-content: center; gap: 7px;
          padding: 10px 16px; border-radius: 10px;
          font-size: 13px; font-weight: 500; cursor: pointer;
          background: #1c1917; color: #f5f3ef;
          border: none; transition: background .15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-upload:hover { background: #292524; }

        /* ── URL input ── */
        .url-input {
          width: 100%;
          background: #fafaf9;
          border: 1px solid #d6d0c8;
          border-radius: 10px;
          padding: 11px 14px;
          font-size: 13px; color: #1c1917;
          font-family: 'DM Mono', monospace;
          outline: none; transition: border-color .15s;
          margin-bottom: 10px;
        }
        .url-input::placeholder { color: #c7c0b8; }
        .url-input:focus { border-color: #1c1917; }
        .btn-analyze {
          width: 100%; padding: 11px; border-radius: 10px;
          background: #1c1917; color: #f5f3ef;
          font-size: 13px; font-weight: 500;
          border: none; cursor: pointer; transition: background .15s;
          font-family: 'DM Sans', sans-serif;
        }
        .btn-analyze:hover { background: #292524; }
        .btn-analyze:disabled { opacity: 0.45; cursor: not-allowed; }

        /* ── Alert ── */
        .alert {
          display: flex; gap: 10px; align-items: flex-start;
          border-radius: 10px; padding: 11px 14px;
          font-size: 12px; line-height: 1.6; margin-bottom: 14px;
        }
        .alert-err { background: #fef2f2; border: 1px solid #fecaca; color: #991b1b; }
        .alert-warn { background: #fffbeb; border: 1px solid #fde68a; color: #92400e; }
        .alert-title { font-weight: 600; margin-bottom: 2px; display: block; }

        /* ── Right panel ── */
        .result-panel {
          background: #fff;
          border: 1px solid #e2ddd7;
          border-radius: 16px;
          padding: 28px;
          min-height: 560px;
          display: flex;
          flex-direction: column;
        }
        .result-header { margin-bottom: 24px; }
        .result-tag {
          display: inline-block;
          font-size: 10px; font-weight: 600;
          letter-spacing: .1em; text-transform: uppercase;
          color: #78716c;
          background: #f5f3ef;
          border: 1px solid #e2ddd7;
          padding: 3px 9px; border-radius: 6px;
          margin-bottom: 10px;
        }
        .result-title { font-size: 24px; font-weight: 600; color: #1c1917; letter-spacing: -0.5px; }

        /* ── Empty state ── */
        .empty-state {
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center; gap: 10px;
          border: 1.5px dashed #d6d0c8;
          border-radius: 12px; padding: 48px 24px;
          color: #a8a29e;
        }
        .empty-icon {
          width: 56px; height: 56px; border-radius: 16px;
          background: #f5f3ef; border: 1px solid #e2ddd7;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 8px;
        }
        .empty-title { font-size: 15px; font-weight: 600; color: #57534e; }
        .empty-desc { font-size: 13px; color: #a8a29e; max-width: 260px; line-height: 1.6; }

        /* ── Loading ── */
        .loading-state {
          flex: 1;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 16px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 32px; height: 32px;
          border: 2px solid #e2ddd7;
          border-top-color: #1c1917;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        .loading-text { font-size: 13px; color: #a8a29e; }

        /* ── Score ring ── */
        .score-ring-wrap {
          display: flex; flex-direction: column; align-items: center;
          padding: 28px 0 20px;
          border-bottom: 1px solid #f5f3ef;
          margin-bottom: 20px;
        }
        .ring-label-above {
          font-size: 11px; font-weight: 500; letter-spacing: .08em; text-transform: uppercase;
          color: #a8a29e; margin-bottom: 16px;
        }
        .ring-container { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .ring-inner {
          position: absolute;
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          text-align: center;
        }
        .ring-pct { font-size: 32px; font-weight: 600; letter-spacing: -1px; line-height: 1; }
        .ring-pct.safe { color: #16a34a; }
        .ring-pct.danger { color: #dc2626; }
        .ring-sublabel { font-size: 10px; color: #a8a29e; margin-top: 3px; }
        .verdict-badge {
          display: inline-flex; align-items: center; gap: 7px;
          margin-top: 16px;
          padding: 7px 18px; border-radius: 99px;
          font-size: 13px; font-weight: 600;
        }
        .verdict-badge.safe { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
        .verdict-badge.danger { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }
        .verdict-dot { width: 7px; height: 7px; border-radius: 50%; }
        .verdict-dot.safe { background: #16a34a; }
        .verdict-dot.danger { background: #dc2626; }

        /* ── Score bars ── */
        .score-section { margin-bottom: 20px; }
        .score-row { margin-bottom: 12px; }
        .score-row:last-child { margin-bottom: 0; }
        .score-head { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .score-lbl { font-size: 12px; color: #78716c; }
        .score-num { font-size: 12px; font-weight: 600; font-family: 'DM Mono', monospace; }
        .score-num.red { color: #dc2626; }
        .score-num.green { color: #16a34a; }
        .track { height: 4px; background: #f5f3ef; border-radius: 99px; overflow: hidden; }
        .fill { height: 100%; border-radius: 99px; transition: width .9s cubic-bezier(.25,.46,.45,.94); }
        .fill.red { background: #dc2626; }
        .fill.green { background: #16a34a; }

        /* ── URL blocks ── */
        .url-block { margin-bottom: 12px; }
        .url-block-label {
          font-size: 10px; font-weight: 600; letter-spacing: .08em; text-transform: uppercase;
          color: #a8a29e; margin-bottom: 5px;
        }
        .url-block-value {
          font-family: 'DM Mono', monospace;
          font-size: 11.5px; color: #57534e;
          background: #fafaf9; border: 1px solid #e2ddd7;
          border-radius: 8px; padding: 9px 12px;
          word-break: break-all; line-height: 1.5;
        }

        /* ── Summary strip ── */
        .summary-strip {
          border-radius: 10px; padding: 11px 14px;
          font-size: 12px; line-height: 1.65; font-weight: 500;
        }
        .summary-strip.safe { background: #f0fdf4; border: 1px solid #bbf7d0; color: #15803d; }
        .summary-strip.danger { background: #fef2f2; border: 1px solid #fecaca; color: #b91c1c; }

        /* ── Divider ── */
        .divider { height: 1px; background: #f5f3ef; margin: 18px 0; }

        #qr-file-reader { position: fixed; left: -9999px; top: 0; height: 1px; width: 1px; overflow: hidden; }
      `}</style>

      <div className="root">
        {/* TOP BAR */}
        <header className="topbar">
          <div className="brand">
            <div className="brand-mark">
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M9 1.5L2.25 5.25V12.75L9 16.5L15.75 12.75V5.25L9 1.5Z" stroke="#f5f3ef" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M9 5.5L5.5 7.5V11.5L9 13.5L12.5 11.5V7.5L9 5.5Z" fill="#f5f3ef" fillOpacity=".3" stroke="#f5f3ef" strokeWidth="1" strokeLinejoin="round"/>
                <circle cx="9" cy="9" r="1.5" fill="#f5f3ef"/>
              </svg>
            </div>
            <div>
              <div className="brand-name">QRGuard</div>
              <div className="brand-sub">QR URL security checker</div>
            </div>
          </div>
          <div className="status-chip">
            <span className="status-dot" />
            Web version
          </div>
        </header>

        {/* BODY */}
        <div className="body">
          {/* LEFT */}
          <div>
            {/* SCANNER CARD */}
            <div className="card">
              <div className="card-tag">Scanner</div>
              <div className="card-title">Scan QR Code</div>
              <p className="card-desc">Arahkan kamera ke QR atau upload gambar untuk analisis URL.</p>

              {cameraError && (
                <div className="alert alert-warn" style={{marginBottom:'14px'}}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0, marginTop:'2px'}}><path d="M7 1L13 12H1L7 1Z" stroke="#92400e" strokeWidth="1.3" strokeLinejoin="round"/><path d="M7 5.5V8" stroke="#92400e" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="10" r=".7" fill="#92400e"/></svg>
                  <div><span className="alert-title">Kamera perlu izin</span>{cameraError}</div>
                </div>
              )}

              <div className="cam-wrap">
                {scannerActive ? (
                  <div id="qr-reader" style={{width:'100%'}} />
                ) : (
                  <div className="cam-success">
                    <div className="cam-success-icon">
                      <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><path d="M4 11L9 16L18 6" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div className="cam-success-title">QR berhasil dibaca</div>
                    <div className="cam-success-sub">Klik reset untuk scan ulang</div>
                  </div>
                )}
              </div>

              <div id="qr-file-reader" />

              <div className="btn-row">
                <button type="button" onClick={handleReset} className="btn btn-ghost">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M1.5 6.5a5 5 0 1 0 1.2-3.2M1.5 2v2.5H4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  Reset
                </button>
                <label className="btn-upload">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1v8M3 4l3.5-3.5L10 4M2 10h9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  {loading ? 'Memproses…' : 'Upload QR'}
                  <input type="file" accept="image/*" onChange={handleQrImageUpload} style={{display:'none'}} />
                </label>
              </div>
            </div>

            {/* MANUAL CARD */}
            <div className="card">
              <div className="card-tag">Manual</div>
              <div className="card-title">Cek URL langsung</div>
              <p className="card-desc">Masukkan URL tanpa perlu scan QR.</p>
              <form onSubmit={handleManualSubmit}>
                <input
                  value={manualUrl}
                  onChange={e => setManualUrl(e.target.value)}
                  placeholder="https://example.com"
                  className="url-input"
                />
                <button type="submit" disabled={loading} className="btn-analyze">
                  {loading ? 'Menganalisis…' : 'Analisis →'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT — RESULT */}
          <div className="result-panel">
            <div className="result-header">
              <div className="result-tag">Result</div>
              <div className="result-title">Security analysis</div>
            </div>

            {error && (
              <div className="alert alert-err">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0, marginTop:'2px'}}><circle cx="7" cy="7" r="6" stroke="#991b1b" strokeWidth="1.3"/><path d="M7 4v3.5" stroke="#991b1b" strokeWidth="1.3" strokeLinecap="round"/><circle cx="7" cy="10" r=".7" fill="#991b1b"/></svg>
                <div>{error}</div>
              </div>
            )}
            {resolveNote && (
              <div className="alert alert-warn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{flexShrink:0, marginTop:'2px'}}><path d="M7 1L13 12H1L7 1Z" stroke="#92400e" strokeWidth="1.3" strokeLinejoin="round"/><circle cx="7" cy="10" r=".7" fill="#92400e"/></svg>
                <div>{resolveNote}</div>
              </div>
            )}

            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <div className="loading-text">Menganalisis URL…</div>
              </div>
            )}

            {!result && !loading && (
              <div className="empty-state">
                <div className="empty-icon">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none"><rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#d6d0c8" strokeWidth="1.4"/><rect x="12" y="3" width="7" height="7" rx="1.5" stroke="#d6d0c8" strokeWidth="1.4"/><rect x="3" y="12" width="7" height="7" rx="1.5" stroke="#d6d0c8" strokeWidth="1.4"/><rect x="14" y="14" width="3" height="3" rx=".5" fill="#d6d0c8"/><path d="M12 16h2M16 12v2" stroke="#d6d0c8" strokeWidth="1.4" strokeLinecap="round"/></svg>
                </div>
                <div className="empty-title">Belum ada hasil</div>
                <p className="empty-desc">Scan QR, upload gambar, atau masukkan URL untuk memulai analisis.</p>
              </div>
            )}

            {result && !loading && (
              <>
                {/* RING SCORE */}
                <div className="score-ring-wrap">
                  <div className="ring-label-above">
                    {isPhishing ? 'Tingkat risiko phishing' : 'Skor keamanan'}
                  </div>
                  <div className="ring-container">
                    <svg width="128" height="128" viewBox="0 0 128 128">
                      <circle cx="64" cy="64" r={R} fill="none" stroke="#f5f3ef" strokeWidth="10"/>
                      <circle
                        cx="64" cy="64" r={R}
                        fill="none"
                        stroke={ringColor}
                        strokeWidth="10"
                        strokeLinecap="round"
                        strokeDasharray={CIRC}
                        strokeDashoffset={ringOffset}
                        transform="rotate(-90 64 64)"
                        style={{transition:'stroke-dashoffset .9s cubic-bezier(.25,.46,.45,.94)'}}
                      />
                    </svg>
                    <div className="ring-inner">
                      <span className={`ring-pct ${isPhishing ? 'danger' : 'safe'}`}>
                        {scoreValue.toFixed(0)}%
                      </span>
                      <span className="ring-sublabel">
                        {isPhishing ? 'phishing' : 'aman'}
                      </span>
                    </div>
                  </div>
                  <div className={`verdict-badge ${isPhishing ? 'danger' : 'safe'}`}>
                    <span className={`verdict-dot ${isPhishing ? 'danger' : 'safe'}`} />
                    {result.prediction}
                  </div>
                </div>

                {/* BARS */}
                <div className="score-section">
                  <div className="score-row">
                    <div className="score-head">
                      <span className="score-lbl">Risiko phishing</span>
                      <span className="score-num red">{phishingPct.toFixed(1)}%</span>
                    </div>
                    <div className="track"><div className="fill red" style={{width:`${phishingPct}%`}} /></div>
                  </div>
                  <div className="score-row">
                    <div className="score-head">
                      <span className="score-lbl">Skor legitimate</span>
                      <span className="score-num green">{legitimatePct.toFixed(1)}%</span>
                    </div>
                    <div className="track"><div className="fill green" style={{width:`${legitimatePct}%`}} /></div>
                  </div>
                </div>

                <div className="divider" />

                {/* URLS */}
                {scannedQrUrl && (
                  <div className="url-block">
                    <div className="url-block-label">URL dari QR</div>
                    <div className="url-block-value">{scannedQrUrl}</div>
                  </div>
                )}
                <div className="url-block">
                  <div className="url-block-label">URL yang dianalisis</div>
                  <div className="url-block-value">{finalUrl}</div>
                </div>

                <div className="divider" />

                {/* SUMMARY */}
                <div className={`summary-strip ${isPhishing ? 'danger' : 'safe'}`}>
                  {isPhishing
                    ? `URL ini terdeteksi phishing dengan tingkat risiko ${phishingPct.toFixed(1)}%. Jangan buka link ini.`
                    : `URL ini terdeteksi aman dengan skor kepercayaan ${legitimatePct.toFixed(1)}%.`}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
