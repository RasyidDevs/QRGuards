// File: components/result/ResultPanel.tsx

import ScoreRing from "./ScoreRing";
import ProbabilityBars from "./ProbabilityBars";
import UrlCard from "./UrlCard";
import SummaryCard from "./SummaryCard";

export default function ResultPanel({
  result,
  loading,
  scannedUrl,
  finalUrl,
}: any) {
  if (loading) return <div>Loading...</div>;
  if (!result) return <div>Belum ada hasil</div>;

  const isPhishing = result.prediction === "Phishing";

  const phishingRisk = isPhishing
    ? result.confidence * 100
    : (1 - result.confidence) * 100;
  const safetyScore = isPhishing
    ? (1 - result.confidence) * 100
    : result.confidence * 100;

  const mainScore = isPhishing ? phishingRisk : safetyScore;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
        <ScoreRing score={mainScore} isPhishing={isPhishing} />

        <div className="flex-1 space-y-4">
          {scannedUrl && <UrlCard label="QR Content" url={scannedUrl} />}
          <UrlCard label="Analyzed URL" url={finalUrl} isAnalyzed />
        </div>
      </div>

      <ProbabilityBars phishingPct={phishingRisk} legitimatePct={safetyScore} />

      <SummaryCard
        isPhishing={isPhishing}
        prediction={result.prediction}
        confidence={result.confidence}
      />
    </div>
  );
}
