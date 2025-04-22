import type { ExcelDataField } from '@/lib/helper/file-download-helper/type';

export const BUDGET_EXCEL_FIELDS: ExcelDataField[] = [
    { key: 'name', name: 'Name' },
    { key: 'target', name: 'Target (Project | Service Account)' },
    { key: 'cycle', name: 'Cycle' },
    { key: 'period', name: 'Period' },
    { key: 'limit', name: 'Budget' },
    { key: 'actualSpend', name: 'Actual Spend' },
    { key: 'utilization_rate', name: 'Utilization' },
    { key: 'remaining', name: 'Remaining' },
    { key: 'state', name: 'State' },
];
