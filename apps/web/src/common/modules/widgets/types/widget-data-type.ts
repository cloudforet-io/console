
interface SubData { date: string; value: number }
export interface AnalyzeResult {
    value_sum: SubData[];
    _total_value_sum: number;
    [dataField: string]: any; // provider: aws or provider: azure
}
