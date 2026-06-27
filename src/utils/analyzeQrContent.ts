export interface AnalysisResult {
  status: 'SAFE' | 'DANGEROUS';
  prediction: 'Legitimate' | 'Phishing';
  confidence: number;
  phishingPercentage: number;
  legitimatePercentage: number;
  reasons: string[];
}

/**
 * Temporary frontend analysis.
 *
 * Catatan:
 * - confidence = probabilitas URL phishing.
 * - confidence mendekati 1 = semakin phishing.
 * - confidence mendekati 0 = semakin legitimate.
 *
 * Nanti logic ini akan diganti dengan response dari backend /predict.
 */
export function analyzeQrContent(content: string): AnalysisResult {
  const confidence = Math.random();

  const isPhishing = confidence >= 0.5;
  const prediction = isPhishing ? 'Phishing' : 'Legitimate';

  const phishingPercentage = confidence * 100;
  const legitimatePercentage = (1 - confidence) * 100;

  if (isPhishing) {
    return {
      status: 'DANGEROUS',
      prediction,
      confidence,
      phishingPercentage,
      legitimatePercentage,
      reasons: [
        `URL classified as phishing with ${phishingPercentage.toFixed(
          1
        )}% phishing probability.`,
      ],
    };
  }

  return {
    status: 'SAFE',
    prediction,
    confidence,
    phishingPercentage,
    legitimatePercentage,
    reasons: [
      `URL classified as legitimate with ${legitimatePercentage.toFixed(
        1
      )}% legitimate probability.`,
    ],
  };
}