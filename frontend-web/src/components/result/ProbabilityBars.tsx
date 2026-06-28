type Props = {
  phishingPct: number;
  legitimatePct: number;
};

export default function ProbabilityBars({ phishingPct, legitimatePct }: Props) {
  return (
    <div className="mt-8 space-y-5">
      <div>
        <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-slate-500">Phishing Risk</span>
          <span className="text-red-500">{phishingPct.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-red-500 transition-all duration-1000"
            style={{ width: `${phishingPct}%` }}
          />
        </div>
      </div>

      <div>
        <div className="mb-2 flex justify-between text-xs font-bold uppercase tracking-wider">
          <span className="text-slate-500">Legitimate Confidence</span>
          <span className="text-emerald-500">{legitimatePct.toFixed(1)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full bg-emerald-500 transition-all duration-1000"
            style={{ width: `${legitimatePct}%` }}
          />
        </div>
      </div>
    </div>
  );
}
