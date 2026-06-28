type Props = {
  score: number;
  isPhishing: boolean;
};

export default function ScoreRing({ score, isPhishing }: Props) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = isPhishing ? "#ef4444" : "#10b981";

  return (
    <div className="relative flex items-center justify-center">
      <svg className="h-48 w-48 -rotate-90 transform">
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke="#f1f5f9"
          strokeWidth="14"
          fill="transparent"
        />
        <circle
          cx="96"
          cy="96"
          r={radius}
          stroke={color}
          strokeWidth="14"
          fill="transparent"
          strokeDasharray={circumference}
          strokeLinecap="round"
          style={{
            strokeDashoffset: offset,
            transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className="text-5xl font-black tracking-tighter text-slate-900">
          {score.toFixed(0)}%
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
          {isPhishing ? "Risk Level" : "Safety Score"}
        </span>
      </div>
    </div>
  );
}
