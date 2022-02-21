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
    'waffle-md-01': {
        widget_id: 'waffle-md-01',
        widget_file_name: 'BudgetStatus',
        widget_name: 'Budget Status',
    },
    'table-lg-01': {
        widget_id: 'table-lg-01',
        widget_file_name: 'ProjectWiseBudgetUsageSummary',
        widget_name: 'Budget Usage With Forecast',
    },
    'pie-lg-01': {
        widget_id: 'pie-lg-01',
        widget_file_name: 'SpcProjectWiseUsageSummary',
        widget_name: 'Cost Pie',
    },
};

export const DATE_FORMAT = Object.freeze({
    day: 'YYYY-MM-DD',
    month: 'YYYY-MM',
    year: 'YYYY',
});

export const continentData = [{
    continent_code: 'africa',
    title: 'Africa',
    longitude: 21.621094,
    latitude: 11.081385,
    width: 48,
    height: 48,
    pieData: [] as any,
}, {
    continent_code: 'europe',
    title: 'Europe',
    longitude: -6.362217,
    latitude: 50.896104,
    width: 48,
    height: 48,
    pieData: [],
}, {
    continent_code: 'north_america',
    title: 'North America',
    latitude: 39.563353,
    longitude: -99.316406,
    width: 48,
    height: 48,
    pieData: [],
}, {
    continent_code: 'south_america',
    title: 'South America',
    longitude: -69.6417454,
    latitude: -13.6631791,
    width: 48,
    height: 48,
    pieData: [],
}, {
    continent_code: 'asia_pacific',
    title: 'Asia Pacific',
    longitude: 103.183594,
    latitude: 47.212106,
    width: 48,
    height: 48,
    pieData: [],
}, {
    continent_code: 'middle_east',
    title: 'Middle East',
    longitude: 26.3842897,
    latitude: 26.8496363,
    width: 48,
    height: 48,
    pieData: [],
}];
