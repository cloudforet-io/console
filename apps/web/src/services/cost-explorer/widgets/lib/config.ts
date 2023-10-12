export const defaultWidgetMap = {
    'card-sm-01': {
        widget_id: 'card-sm-01',
        widget_file_name: 'MonthToDateSpend',
        widget_name: 'Month-To-Date Spend',
    },
    'card-sm-02': {
        widget_id: 'card-sm-02',
        widget_file_name: 'LastMonthTotalSpend',
        widget_name: 'Last Month Total Spend',
    },
    'card-sm-03': {
        widget_id: 'card-sm-03',
        widget_file_name: 'BudgetUsage',
        widget_name: 'Budget Usage',
    },
    'card-lg-01': {
        widget_id: 'card-lg-01',
        widget_file_name: 'BudgetUsageSummary',
        widget_name: 'Budget Usage Summary',
    },
    'treemap-lg-01': {
        widget_id: 'treemap-lg-01',
        widget_file_name: 'CostTreeMap',
        widget_name: 'Cost Map',
    },
    'linegraph-lg-01': {
        widget_id: 'linegraph-lg-01',
        widget_file_name: 'CostTrendLine',
        widget_name: 'Cost Trend',
    },
    'linegraph-lg-02': {
        widget_id: 'linegraph-lg-02',
        widget_file_name: 'AWSDataTransferCostTrend',
        widget_name: 'AWS Data-Transfer Cost Trend',
    },
    'stackedcol-lg-01': {
        widget_id: 'stackedcol-lg-01',
        widget_file_name: 'CostTrendStackedColumnA',
        widget_name: 'Cost Trend(Stacked) A',
    },
    'stackedcol-lg-02': {
        widget_id: 'stackedcol-lg-02',
        widget_file_name: 'CostTrendStackedColumnB',
        widget_name: 'Cost Trend(Stacked) B',
    },
    'stackedcol-lg-03': {
        widget_id: 'stackedcol-lg-03',
        widget_file_name: 'AWSCloudFrontCost',
        widget_name: 'AWS CloudFront Cost',
    },
    'donut-md-01': {
        widget_id: 'donut-md-01',
        widget_file_name: 'CostDonut',
        widget_name: 'Cost Donut',
    },
    'map-lg-01': {
        widget_id: 'map-lg-01',
        widget_file_name: 'CostByRegion',
        widget_name: 'Cost By Region',
    },
    'map-lg-02': {
        widget_id: 'map-lg-02',
        widget_file_name: 'AWSDataTransferByRegion',
        widget_name: 'AWS Data-Transfer by Region',
    },
    'waffle-md-01': {
        widget_id: 'waffle-md-01',
        widget_file_name: 'BudgetStatus',
        widget_name: 'Budget Status',
    },
    'table-lg-01': {
        widget_id: 'table-lg-01',
        widget_file_name: 'BudgetUsageWithForecast',
        widget_name: 'Budget Usage With Forecast',
    },
    'pie-lg-01': {
        widget_id: 'pie-lg-01',
        widget_file_name: 'CostPie',
        widget_name: 'Cost Pie',
    },
};

export const DATE_FORMAT = Object.freeze({
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
});

export const RegionMap = {
    africa: {
        continent_code: 'africa',
        continent_label: 'Africa',
        latitude: 11.081385,
        longitude: 21.621094,
    },
    europe: {
        continent_code: 'europe',
        continent_label: 'Europe',
        latitude: 50.896104,
        longitude: 19.160156,
    },
    north_america: {
        continent_code: 'north_america',
        continent_label: 'North America',
        latitude: 39.563353,
        longitude: -99.316406,
    },
    south_america: {
        continent_code: 'south_america',
        continent_label: 'South America',
        latitude: -13.6631791,
        longitude: -69.6417454,
    },
    asia_pacific: {
        continent_code: 'asia_pacific',
        continent_label: 'Asia Pacific',
        longitude: 103.183594,
        latitude: 47.212106,
    },
    middle_east: {
        continent_code: 'middle_east',
        continent_label: 'Middle East',
        longitude: 26.3842897,
        latitude: 26.8448363,
    },
};
