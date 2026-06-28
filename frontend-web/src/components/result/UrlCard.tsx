import { Globe, ShieldQuestion } from "lucide-react";

type Props = {
  label: string;
  url: string;
  isAnalyzed?: boolean;
};

export default function UrlCard({ label, url, isAnalyzed }: Props) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-slate-50">
      <div className="mb-2 flex items-center gap-2">
        {isAnalyzed ? (
          <Globe size={14} className="text-blue-500" />
        ) : (
          <ShieldQuestion size={14} className="text-slate-400" />
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
          {label}
        </span>
      </div>
      <p className="break-all font-mono text-xs font-medium leading-relaxed text-slate-600">
        {url}
      </p>
    </div>
  );
}
