import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';

export interface MetricDataAnalyzeParameters {
    metric_id: string;
    query: AnalyzeQuery;
}
