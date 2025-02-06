export interface ProcessingMetrics {
  totalTime: number;
  cacheCheckTime?: number;
  responseGenerationTime?: number;
  audioSynthesisTime?: number;
  error?: boolean;
}

export function createMetricsHandler() {
  const metrics: ProcessingMetrics = {
    totalTime: 0,
  };
  const startTime = performance.now();

  const recordMetric = (key: keyof ProcessingMetrics, value: number) => {
    metrics[key] = value;
  };

  const finalizeMetrics = () => {
    metrics.totalTime = performance.now() - startTime;
    return metrics;
  };

  return {
    recordMetric,
    finalizeMetrics,
  };
}