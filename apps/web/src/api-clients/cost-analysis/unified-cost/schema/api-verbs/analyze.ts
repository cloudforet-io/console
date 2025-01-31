import type { AnalyzeQuery } from '@cloudforet/core-lib/space-connector/type';

export interface UnifiedCostAnalyzeParameters {
    query: AnalyzeQuery;
    is_confirmed?: boolean;
}
