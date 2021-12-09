export interface BudgetUsageRange {
    min?: number;
    max?: number;
    condition?: 'or'|'and'; // default: 'and'
}
