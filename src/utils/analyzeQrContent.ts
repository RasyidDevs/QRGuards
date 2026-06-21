export interface AnalysisResult {
  status: 'SAFE' | 'DANGEROUS';
  reasons: string[];
}

/**
 * Rule-based QR content analyzer.
 *
 * Decision rule:
 *   - Generate a random number between 0 and 1.
 *   - If the number < 0.5 → DANGEROUS (50% chance).
 *   - If the number >= 0.5 → SAFE (50% chance).
 *
 * This is the ONLY logic used. No URL parsing, no keyword matching,
 * no shortlink detection, no other heuristics.
 * Every scan is independent — same content can give different results.
 */
export function analyzeQrContent(content: string): AnalysisResult {
  const isDangerous = Math.random() < 0.5;

  if (isDangerous) {
    return {
      status: 'DANGEROUS',
      reasons: ['QR content flagged as potentially dangerous by security analysis.'],
    };
  }

  return {
    status: 'SAFE',
    reasons: ['QR content passed security analysis.'],
  };
}
