export default {
  barChartSample: function () {
    const customTooltips = require('@coreui/coreui-plugin-chartjs-custom-tooltips');
    const sampleData = {
      labels: ['2018-01', '2018-02', '2018-03', '2018-04', '2018-05', '2018-06', '2018-07', '2018-08', '2018-09', '2018-10', '2018-11', '2018-12'],
      datasets: [{
        label: 'GitHub Commits',
        backgroundColor: '#f87979',
        data: [40, 20, 12, 39, 10, 40, 39, 80, 40, 20, 12, 11]
      }
      ]
    };
    const sampleChartOption = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false,
        custom: customTooltips,
        intersect: true,
        mode: 'index',
        position: 'nearest',
        callbacks: {
          labelColor: function (tooltipItem, chart) {
            return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].backgroundColor };
          }
        }
      }
    };
    return [sampleData, sampleChartOption];
  },
  lineChartSample: function () {
    const coreUIUtil = require('@coreui/coreui/dist/js/coreui-utilities');
    const customTooltips = require('@coreui/coreui-plugin-chartjs-custom-tooltips');
    const sampleData = {
      labels: ['2017-01', '2017-02', '2017-03', '2017-04', '2017-05', '2017-06', '2017-07', '2017-08', '2017-09'],
      datasets: [{
        label: 'KosDaq',
        backgroundColor: coreUIUtil.hexToRgba('#EE82EE', 50),
        data: [130, 139, 210, 150, 230, 170, 135, 122, 173]
      },
      {
        label: 'Nasdaq',
        backgroundColor: coreUIUtil.hexToRgba('#36a2eb', 50),
        data: [139, 280, 340, 135, 140.22, 20.11, 145.13, 122, 173]
      },
      {
        label: 'Nikkei',
        backgroundColor: coreUIUtil.hexToRgba('#FFA500', 50),
        data: [130.22, 139.44, 110.11, 250.11, 231.56, 301.12, 135.12, 122, 173]
      }
      ]
    };
    const sampleChartOption = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false,
        custom: customTooltips,
        intersect: true,
        mode: 'index',
        position: 'nearest',
        callbacks: {
          labelColor: function (tooltipItem, chart) {
            return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].backgroundColor };
          }
        }
      }
    };
    return [sampleData, sampleChartOption];
  },
  pieChartSample: function () {
    const sampleData = {
      labels: ['VueJs', 'EmberJs', 'ReactJs', 'AngularJs'],
      datasets: [
        {
          backgroundColor: [
            // '#ff000075',
            // '#ff638466',
            // '#2000ff80',
            '#29910d',
            '#36a2eb66',
            '#ffce5666',
            '#4bc0c03d'
          ],
          data: [40, 20, 80, 10]
        }
      ]
    };

    const sampleChartOption = { responsive: true, maintainAspectRatio: false };
    return [sampleData, sampleChartOption];
  },
  donutChartSample: function () {
    const sampleData = {
      labels: ['Seoul', 'Tokyo', 'Boston', 'London', 'Toronto', 'Sidney', 'Bangkok', 'Beijing', 'Singapore', 'Seattle'],
      datasets: [
        {
          backgroundColor: [
            '#ff000080',
            '#FFA50080',
            '#ffff0080',
            '#00FF0080',
            '#0000ff80',
            '#FFC0CB80',
            '#00FFFF80',
            '#4B008280',
            '#00808080',
            '#EE82EE80',
            '#00000080'
          ],
          data: [25, 25, 25, 25, 25, 25, 25, 25, 25, 25, 25]
        }
      ]
    };
    const sampleChartOption = { responsive: true, maintainAspectRatio: false };
    return [sampleData, sampleChartOption];
  },
  polarAreaChartSample: function () {
    const customTooltips = require('@coreui/coreui-plugin-chartjs-custom-tooltips');
    const sampleData = {
      labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
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

    const sampleChartOption = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false,
        custom: customTooltips,
        intersect: true,
        mode: 'index',
        position: 'nearest',
        callbacks: {
          labelColor: function (tooltipItem, chart) {
            return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].backgroundColor };
          }
        }
      }
    };
    return [sampleData, sampleChartOption];
  },
  radarChartSample: function () {
    const customTooltips = require('@coreui/coreui-plugin-chartjs-custom-tooltips');
    const sampleData = {
      labels: ['Eating', 'Drinking', 'Sleeping', 'Designing', 'Coding', 'Cycling', 'Running'],
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

    const sampleChartOption = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips: {
        enabled: false,
        custom: customTooltips,
        intersect: true,
        mode: 'index',
        position: 'nearest',
        callbacks: {
          labelColor: function (tooltipItem, chart) {
            return { backgroundColor: chart.data.datasets[tooltipItem.datasetIndex].borderColor };
          }
        }
      }
    };
    return [sampleData, sampleChartOption];
  }

};
