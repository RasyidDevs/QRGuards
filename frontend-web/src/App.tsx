import { useState, useEffect, useRef, type ChangeEvent } from "react";
import { Html5Qrcode, Html5QrcodeScannerState } from "html5-qrcode";
import {
  Shield,
  GraduationCap,
  Code2,
  Lock,
  Monitor,
  Briefcase,
  ArrowRight,
  ScanLine,
  ShieldCheck,
  ChevronRight,
  Quote,
} from "lucide-react";

import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Container from "./components/layout/Container";
import ScannerCard from "./components/scanner/ScannerCard";
import ResultPanel from "./components/result/ResultPanel";
import { Player } from "@lottiefiles/react-lottie-player";
import Typewriter from "./components/ui/Typewriter";
import qrAnimation from "../../assets/qr-security.json";
import a1 from "./assets/a1.jpg";
import a2 from "./assets/a2.jpg";
import a3 from "./assets/a3.jpg";

interface PredictResponse {
  prediction: "Legitimate" | "Phishing";
  confidence: number;
}

const API_URL = "https://grinderai-qrguards.hf.space";

export default function App() {
  const [scannedQrUrl, setScannedQrUrl] = useState("");
  const [finalUrl, setFinalUrl] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerActive, setScannerActive] = useState(true);
  const [error, setError] = useState("");

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const hasScannedRef = useRef(false);

  const scannerSectionRef = useRef<HTMLDivElement>(null);
  const scrollToScanner = () => {
    scannerSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (result && result.prediction === "Legitimate" && !loading && finalUrl) {
      const timer = setTimeout(() => {
        window.location.href = finalUrl;
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [result, loading, finalUrl]);

  const predictUrl = async (targetUrl: string) => {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch(`${API_URL}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: targetUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || "Sistem AI tidak dapat memproses link ini.",
        );
      }

      setResult(data as PredictResponse);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Gagal terhubung ke server analisis.");
      }
    } finally {
      setLoading(false);
    }
  };

  const resolveFinalUrl = async (url: string) => {
    try {
      const response = await fetch(
        `${API_URL}/resolve-url?url=${encodeURIComponent(url)}`,
      );

      const data = await response.json();

      return data.finalUrl || url;
    } catch (error) {
      console.error("Gagal mengambil final URL:", error);
      return url;
    }
  };

  const handleScannedQr = async (decoded: string) => {
    setError("");
    setScannedQrUrl(decoded);
    setScannerActive(false);
    hasScannedRef.current = false;

    const resolvedUrl = await resolveFinalUrl(decoded);

    setFinalUrl(resolvedUrl);
    await predictUrl(resolvedUrl);
  };

  const handleQrImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("File yang diunggah harus berupa gambar (PNG/JPG).");
      return;
    }

    setLoading(true);
    setError("");

    try {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
      setScannerActive(false);

      const html5QrCode = new Html5Qrcode("qr-file-reader");

      const decoded = await html5QrCode.scanFile(file, true);

      await handleScannedQr(decoded);
    } catch {
      setError(
        "Gambar tidak valid: Sistem tidak dapat menemukan QR Code. Pastikan gambar jelas dan tidak terpotong.",
      );

      setScannerActive(true);
      setLoading(false);
      hasScannedRef.current = false;
    } finally {
      e.target.value = "";
    }
  };

  const handleReset = () => {
    setScannedQrUrl("");
    setFinalUrl("");
    setManualUrl("");
    setResult(null);
    setError("");
    setScannerActive(true);
    hasScannedRef.current = false;
  };

  useEffect(() => {
    if (!scannerActive || result || loading || error) return;

    const scanner = new Html5Qrcode("qr-reader");
    scannerRef.current = scanner;

    let isMounted = true;

    const startScanner = async () => {
      try {
        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: 220,
          },
          async (decodedText) => {
            if (hasScannedRef.current) return;

            hasScannedRef.current = true;

            await scanner.stop();

            handleScannedQr(decodedText);
          },
          () => {},
        );
      } catch (err) {
        console.error(err);
        if (isMounted) {
          setError("Tidak dapat mengakses kamera.");
        }
      }
    };

    startScanner();

    return () => {
      isMounted = false;

      if (scanner.getState() === Html5QrcodeScannerState.SCANNING) {
        scanner.stop().catch(() => {});
      }
    };
  }, []);

  const isShowResult =
    result || loading || (error && (scannedQrUrl || manualUrl));

  const features = [
    { title: "Untuk Individu", icon: Shield },
    { title: "Untuk Pelajar", icon: GraduationCap },
    { title: "Untuk Developer", icon: Code2 },
    { title: "Untuk IT & Security", icon: Lock },
    { title: "Untuk Pekerja Remote", icon: Monitor },
    { title: "Untuk Korporasi", icon: Briefcase },
  ];

  const testimonials = [
    {
      company: "PT. SiberIDN",
      quote:
        "QRGuard membantu tim kami menghindari berbagai upaya phishing yang tersembunyi di balik kode QR.",
      name: "Danang Suhendang",
      role: "Analyst Keamanan",
      avatar: a1,
    },
    {
      company: "Bumi Digital",
      quote:
        "Mudah digunakan dan sangat cepat. Verifikasi QR kini menjadi bagian dari alur kerja harian kami di kantor.",
      name: "Tutik Setyawati",
      role: "Manajer Operasional",
      avatar: a3,
    },
    {
      company: "PT. Kreasi Alam",
      quote:
        "Kemampuan untuk memeriksa tujuan QR sebelum membuka tautan membuat kami merasa aman",
      name: "Michael Andara",
      role: "Lead Developer",
      avatar: a2,
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-primary/20">
      <Header />

      <main className="flex-1">
        <section className="relative w-full min-h-[90vh] flex items-center pt-10 pb-20 overflow-hidden bg-background">
          <Container>
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-22 items-center relative z-10">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 shadow-sm">
                  <ShieldCheck size={16} className="text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    Neural Intelligence Active
                  </span>
                </div>

                <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] tracking-tight mb-8">
                  <Typewriter text="Scan Before You Trust" speed={80} />
                </h1>

                <p className="text-slate-500 text-lg lg:text-xl leading-relaxed mb-10 max-w-xl font-medium">
                  Lindungi data pribadi Anda dari ancaman{" "}
                  <span className="text-primary font-bold">Phishing</span> dan{" "}
                  <span className="text-primary font-bold">Malware</span> dengan
                  sistem verifikasi URL berbasis AI tercanggih.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5 w-full sm:w-auto">
                  <button
                    onClick={scrollToScanner}
                    className="w-full sm:w-auto bg-primary hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-lg font-bold transition-all shadow-xl shadow-primary/30 active:scale-95 group">
                    <ScanLine
                      size={24}
                      className="group-hover:rotate-90 transition-transform duration-500"
                    />
                    Mulai Scanning
                  </button>

                  <button
                    onClick={() =>
                      window.open(
                        "https://github.com/RasyidDevs/QRGuards",
                        "_blank",
                        "noopener,noreferrer",
                      )
                    }
                    className="w-full sm:w-auto group border-2 border-slate-200 hover:bg-slate-50 text-slate-600 px-8 py-4 rounded-2xl text-lg font-bold transition-all active:scale-95 flex items-center justify-center gap-2">
                    Pelajari AI Kami
                    <ChevronRight
                      size={20}
                      className="group-hover:translate-x-1 transition-transform"
                    />
                  </button>
                </div>
              </div>

              <div className="relative flex justify-center items-center">
                <div className="relative w-full max-w-[550px] drop-shadow-2xl">
                  <Player
                    autoplay
                    loop
                    src={qrAnimation}
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </Container>
        </section>

        <section
          ref={scannerSectionRef}
          className="py-20 bg-white border-t border-slate-100">
          <Container>
            {!isShowResult ? (
              <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in zoom-in duration-500">
                <ScannerCard
                  scannerActive={scannerActive}
                  loading={loading}
                  cameraError={error && !scannedQrUrl ? error : ""}
                  onReset={handleReset}
                  onUpload={handleQrImageUpload}
                />
              </div>
            ) : (
              <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-10 duration-700">
                <div className="rounded-[2.5rem] border border-slate-200 bg-white p-8 md:p-12 shadow-2xl">
                  <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end border-b border-slate-100 pb-8">
                    <div>
                      <p className="mb-2 text-[10px] font-black uppercase text-blue-600">
                        Security Analysis Result
                      </p>
                      <h2 className="text-4xl font-black tracking-tight text-slate-900">
                        Diagnosis Report
                      </h2>
                    </div>

                    <button
                      onClick={handleReset}
                      className="flex h-14 items-center gap-2 rounded-full bg-slate-900 px-8 font-bold text-white transition-all hover:bg-blue-600 active:scale-95 shadow-lg shadow-slate-200">
                      Scan Ulang
                    </button>
                  </div>

                  <ResultPanel
                    result={result}
                    loading={loading}
                    scannedUrl={scannedQrUrl}
                    finalUrl={finalUrl || manualUrl}
                    error={error}
                  />
                </div>
              </div>
            )}
          </Container>
        </section>

        <section className="relative w-full bg-slate-50 py-24 overflow-hidden">
          <Container>
            <div className="text-center mb-20 relative z-10">
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
                Satu Scan <span className="text-primary">Tanpa Kejutan.</span>
              </h2>
              <p className="text-slate-500 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
                QRGuard dirancang untuk memberikan lapisan keamanan tambahan
                bagi semua orang. Verifikasi setiap{" "}
                <span className="text-slate-900 font-bold">tujuan QR</span>{" "}
                sebelum Anda mempercayainya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
              {features.map((item, index) => (
                <div
                  key={index}
                  className="group relative overflow-hidden bg-white hover:bg-slate-50 p-8 rounded-[2rem] border border-slate-200 hover:border-primary/30 transition-all duration-500 cursor-pointer shadow-sm hover:shadow-2xl hover:shadow-primary/5">
                  <div className="absolute -top-12 -left-12 w-32 h-32 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                  <div className="relative z-10 flex flex-col gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <item.icon size={28} strokeWidth={1.5} />
                    </div>
                    <div className="flex items-center justify-between">
                      <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                        {item.title}
                      </h3>
                      <div className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-300 group-hover:text-primary group-hover:border-primary transition-all duration-500 group-hover:translate-x-1">
                        <ArrowRight size={16} strokeWidth={3} />
                      </div>
                    </div>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                      Proteksi otomatis untuk aktivitas digital harian Anda.
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        <section className="py-32 bg-background">
          <div className="max-w-7xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                Dipercaya Sebelum{" "}
                <span className="text-primary">Setiap Pemindaian. </span>
              </h2>
              <p className="text-slate-500 max-w-2xl mx-auto text-lg leading-relaxed">
                Tim dan individu mengandalkan QRGuard untuk memverifikasi tujuan
                QR dan menjaga keamanan saat online.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((item, index) => (
                <div
                  key={index}
                  className="group bg-surface rounded-[32px] p-8 border border-slate-200 hover:border-accent transition-all duration-300 hover:-translate-y-2 shadow-sm hover:shadow-xl relative overflow-hidden">
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-primary/5 to-accent/10" />

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-8">
                      <Quote
                        size={24}
                        fill="currentColor"
                        className="opacity-80"
                      />
                    </div>

                    <h4 className="text-accent font-bold tracking-wider uppercase text-xs mb-4">
                      {item.company}
                    </h4>

                    <p className="text-slate-700 text-xl leading-relaxed mb-10">
                      “{item.quote}”
                    </p>

                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20">
                        <img
                          src={item.avatar}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      </div>

                      <div>
                        <h5 className="text-slate-900 font-bold">
                          {item.name}
                        </h5>
                        <p className="text-slate-500 text-sm font-medium">
                          {item.role}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <div id="qr-file-reader" className="hidden" />
    </div>
  );
}
