export default {
  barChartSample: function () {
    const customTooltips = require('@coreui/coreui-plugin-chartjs-custom-tooltips');
    const sampleData = {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      datasets: [
        {
          label: 'GitHub Commits',
          backgroundColor: '#f87979',
          data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
        }
      ]
    };

    const sampleChartOption = {
      responsive: true,
      maintainAspectRatio: true,
      tooltips: {
        enabled: false,
        custom: customTooltips,
        intersect: true,
        mode: 'index',
        position: 'nearest',
        callbacks: {
          labelColor: function (tooltipItem, chart) {
            return {backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].backgroundColor}
          }
        }
      }
    }

    return [sampleData, sampleChartOption]

  },
  lineChartSample: function () {
    const coreUIUtil = require('@coreui/coreui/dist/js/coreui-utilities');
    const customTooltips = require('@coreui/coreui-plugin-chartjs-custom-tooltips');

    const sampleData =  {
      labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
        datasets: [{label: 'Data One',
                    backgroundColor: coreUIUtil.hexToRgba('#E46651', 90),
                    data: [30, 39, 10, 50, 30, 70, 35]
                  },
                  {
                    label: 'Data Two',
                    backgroundColor: coreUIUtil.hexToRgba('#00D8FF', 90),
                    data: [39, 80, 40, 35, 40, 20, 45]
                  }
                  ]
    }
    const sampleChartOption = {
      responsive: true,
      maintainAspectRatio: true,
      tooltips: {
        enabled: false,
        custom: customTooltips,
        intersect: true,
        mode: 'index',
        position: 'nearest',
        callbacks: {
          labelColor: function (tooltipItem, chart) {
            return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].backgroundColor }
          }
        }
      }
    }
    return [sampleData, sampleChartOption]
  },
  pieChartSample: function() {
    const sampleData = { labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
                        datasets: [
                          {
                            backgroundColor: [
                              '#41B883',
                              '#E46651',
                              '#00D8FF',
                              '#DD1B16'
                            ],
                            data: [40, 20, 80, 10]
                          }
                        ]};

    const sampleChartOption =  {responsive: true, maintainAspectRatio: true};
    return [sampleData, sampleChartOption]
   },
  donutChartSample: function(){
    const sampleData = { labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
                         datasets: [
                          {
                            backgroundColor: [
                              '#41B883',
                              '#E46651',
                              '#00D8FF',
                              '#DD1B16'
                            ],
                            data: [40, 20, 80, 10]
                          }
                        ]};
    const sampleChartOption = {responsive: true, maintainAspectRatio: true}
    return [sampleData, sampleChartOption]
  },
  polarAreaChartSample: function() {

    const customTooltips = require('@coreui/coreui-plugin-chartjs-custom-tooltips');
    const sampleData={labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
                      datasets: [
                    {
                      label: 'My First dataset',
                      backgroundColor: 'rgba(179,181,198,0.2)',
                      pointBackgroundColor: 'rgba(179,181,198,1)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgba(179,181,198,1)',
                      data: [65, 59, 90, 81, 56, 55, 40]
                    },
                    {
                      label: 'My Second dataset',
                      backgroundColor: 'rgba(255,99,132,0.2)',
                      pointBackgroundColor: 'rgba(255,99,132,1)',
                      pointBorderColor: '#fff',
                      pointHoverBackgroundColor: '#fff',
                      pointHoverBorderColor: 'rgba(255,99,132,1)',
                      data: [28, 48, 40, 19, 96, 27, 100]
                    }
                  ]
                  };

    const sampleChartOption ={ responsive: true,
                               maintainAspectRatio: false,
                               tooltips: { enabled: false,
                                          custom: customTooltips,
                                          intersect: true,
                                          mode: 'index',
                                          position: 'nearest',
                                          callbacks: { labelColor: function (tooltipItem, chart) { return {backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].backgroundColor }}}
                                        }
                              };
    return [sampleData, sampleChartOption]
  },
  radarChartSample: function(){

    const customTooltips = require('@coreui/coreui-plugin-chartjs-custom-tooltips');
    const sampleData= {labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
                        datasets: [{
                        label: '2017',
                        backgroundColor: 'rgba(179,181,198,0.2)',
                        borderColor: 'rgba(179,181,198,1)',
                        pointBackgroundColor: 'rgba(179,181,198,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(179,181,198,1)',
                        data: [65, 59, 90, 81, 56, 55, 40]
                      },
                      {
                        label: '2018',
                        backgroundColor: 'rgba(255,99,132,0.2)',
                        borderColor: 'rgba(255,99,132,1)',
                        pointBackgroundColor: 'rgba(255,99,132,1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(255,99,132,1)',
                        data: [28, 48, 40, 19, 96, 27, 100]
                      }]
                    };

    const sampleChartOption =  {
      responsive: true,
        maintainAspectRatio: true,
        tooltips: {
        enabled: false,
          custom: customTooltips,
          intersect: true,
          mode: 'index',
          position: 'nearest',
          callbacks: {
          labelColor: function (tooltipItem, chart) {
            return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor }
          }
        }
      }
    }
    return [sampleData, sampleChartOption]
  },

}
