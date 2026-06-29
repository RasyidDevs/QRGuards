import { type ChangeEvent, useState, useEffect } from "react";
import { RotateCcw, ShieldCheck } from "lucide-react";
import UploadButton from "./UploadButton";

type Props = {
  scannerActive: boolean;
  loading: boolean;
  cameraError: string;
  onReset: () => void;
  onUpload: (e: ChangeEvent<HTMLInputElement>) => void;
};

export default function ScannerCard({
  scannerActive,
  loading,
  cameraError,
  onReset,
  onUpload,
}: Props) {
  const [dots, setDots] = useState("");

  useEffect(() => {
    if (!scannerActive) return;

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [scannerActive]);

  return (
    <div className="group overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-xl shadow-blue-900/5 transition-all hover:shadow-2xl hover:shadow-blue-900/10">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-600 p-8 text-white">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded bg-white/10 blur-2xl"></div>
        <div className="absolute -left-8 -bottom-8 h-32 w-32 bg-indigo-500/20 blur-2xl"></div>
        <div className="relative">
          <h2 className="text-3xl font-black tracking-tight flex items-center">
            QR Scanner
            {scannerActive && (
              <span className="inline-block w-8 ml-0.5 text-left transition-all duration-200">
                {dots}
              </span>
            )}
          </h2>
        </div>
      </div>

      <div className="p-8">
        {cameraError && (
          <div className="mb-6 flex animate-in fade-in slide-in-from-top-2 gap-3 rounded-2xl border border-red-100 bg-red-50 p-4 text-red-700">
            <div className="text-xs font-semibold leading-relaxed text-center w-full">
              {cameraError}
            </div>
          </div>
        )}

        <div className="relative overflow-hidden rounded-[1rem] border-4 border-slate-50 bg-slate-100 shadow-inner">
          {scannerActive ? (
            <div
              id="qr-reader"
              className="min-h-[380px] overflow-hidden rounded-xl"
            />
          ) : (
            <div className="flex min-h-[380px] flex-col items-center justify-center bg-white px-8 animate-in zoom-in-95 duration-500">
              <div className="relative mb-6">
                <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400/20"></div>
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-50 text-emerald-500 shadow-sm ring-1 ring-emerald-100">
                  <ShieldCheck size={48} strokeWidth={1.5} />
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-800 text-center">
                Pemindaian Berhasil
              </h3>

              <p className="mt-2 max-w-[240px] text-center text-sm font-medium leading-relaxed text-slate-400">
                Analisis AI telah selesai. Tekan reset untuk memindai kode baru.
              </p>
            </div>
          )}
        </div>

        <div id="qr-file-reader" className="hidden" />

        <div className="mt-8 grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={onReset}
            className="flex h-14 items-center justify-center gap-2 rounded-full border-2 border-slate-100 bg-white px-4 font-bold text-slate-600 transition-all hover:border-slate-200 hover:bg-slate-50 active:scale-95">
            <RotateCcw size={20} />
            Reset
          </button>

          <UploadButton loading={loading} onUpload={onUpload} />
        </div>
      </div>
    </div>
  );
}
