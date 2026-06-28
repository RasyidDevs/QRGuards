import { AlertTriangle, ShieldCheck } from "lucide-react";

type Props = {
  isPhishing: boolean;
  prediction: string;
  confidence: number;
};

export default function SummaryCard({
  isPhishing,
  prediction,
  confidence,
}: Props) {
  const pct = (confidence * 100).toFixed(1);

  return (
    <div
      className={`mt-8 flex gap-4 rounded-[2rem] border p-6 ${
        isPhishing
          ? "border-red-100 bg-red-50 text-red-900"
          : "border-emerald-100 bg-emerald-50 text-emerald-900"
      }`}>
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${
          isPhishing ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
        }`}>
        {isPhishing ? <AlertTriangle size={24} /> : <ShieldCheck size={24} />}
      </div>

      <div>
        <h4 className="text-lg font-bold">AI Verdict: {prediction}</h4>
        <p className="mt-1 text-sm font-medium leading-relaxed opacity-80">
          {isPhishing
            ? `URL ini terdeteksi sebagai ancaman phishing dengan probabilitas ${pct}%. Sangat disarankan untuk tidak mengakses link ini.`
            : `Sistem AI kami mengonfirmasi bahwa link ini aman dengan tingkat kepercayaan ${pct}%.`}
        </p>
      </div>
    </div>
  );
}
