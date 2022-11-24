export interface HistoryDataModel {
    more?: boolean;
    results: {
        [groupBy: string]: string | any; // product: 'AmazonCloudFront'
        usd_cost_sum: Array<{
            date: string;
            value: number
        }>;
    }[];
}

export interface XYChartData {
    date: string; // date: '2022-09'
    [resourceName: string]: number | any; // AmazonCloudFront: 12333
}
