<script>
import { Doughnut } from 'vue-chartjs';

const toolTipsOptionSVG = {
    enabled: false,
    custom: function (tooltipModel) {
        let tooltipEl = document.getElementById('chartjs-tooltip');
        let dataset = this._data.datasets;
        let dataMeta = dataset[0]._meta;

        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<svg></svg>';
            document.body.appendChild(tooltipEl);
        }

    // Hide if no tooltip
        if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = 0;
            return;
        }

        tooltipEl.classList.remove('above', 'below', 'no-transform');
        if (tooltipModel.yAlign) {
            tooltipEl.classList.add(tooltipModel.yAlign);
        } else {
            tooltipEl.classList.add('no-transform');
        }

        function getBody (bodyItem) {
            return bodyItem.lines;
        }

        let selectedDonutBody = tooltipModel.body;
        if (selectedDonutBody) {
            let selectedData = selectedDonutBody[0].lines[0].split(': ');
            let currentColor = dataset[0].backgroundColor[dataset[0].data.indexOf(Number(selectedData[1]))];
            let style = 'font-size:12px;' + 'color:' + currentColor + ';' + 'fill:' + currentColor + ';';
            let titleLines = selectedData[0];
            let bodyLines = selectedData[1];
            let percent = Math.round((Number(bodyLines) / dataMeta[Object.keys(dataMeta)].total) * 100).toFixed(1);
            let innerHtml = '<g style=\'color: black !important\'>' +
          '<text y=\'30\' x=\'8\' style=\'font-size: 12px\'>' +
          '<tspan style=\'font-size: 14px;font-weight: 900;  overflow: hidden;white-space: nowrap;text-overflow: ellipsis\'>' + titleLines + '</tspan>' +
          '<tspan style=' + '\"fill:' + currentColor + '"\ x=\"8\" dy=\"17\"> ● </tspan>' +
          '<tspan dx=\'0\'> Count: </tspan>' +
          '<tspan style=\'font-weight:bold\' dx=\'0\'> ' + ' ' + bodyLines + ' ' + ' </tspan>' +
          '<tspan dx=\'0\'>(' + percent + '%)</tspan>' +
          '</text>' +
          '</g>';

            let textRoot = tooltipEl.querySelector('svg');
            textRoot.style.fontFamily = '"Lucida Grande", "Lucida Sans Unicode", Arial, Helvetica, sans-serif;';
            textRoot.style.background = 'rgba(255, 255, 255, .5)';
            textRoot.style.color = 'black';
            textRoot.style.borderRadius = '5px';
            textRoot.style.fontSize = '12px';
            textRoot.style.border = '0.8px solid ' + currentColor;
            textRoot.style.width = '180px';
            textRoot.style.height = '80px';
            tooltipEl.style.pointerEvents = 'none';
            textRoot.innerHTML = innerHtml;
        }

    // `this` will be the overall tooltip
        var position = this._chart.canvas.getBoundingClientRect();
    // Display, position, and set styles for font
        tooltipEl.style.opacity = 1;
        tooltipEl.style.position = 'absolute';
        tooltipEl.style.minHeight = '100px';
        tooltipEl.style.overflow = 'hidden';
        tooltipEl.style.left = position.left + window.pageXOffset + tooltipModel.caretX + 'px';
        tooltipEl.style.top = position.top + window.pageYOffset + tooltipModel.caretY + 'px';
    }
};
let selectedColor = '';
const tooltipsCallback = {
    callbacks: {
        title: function (tooltipItem, data) {
            return data['labels'][tooltipItem[0]['index']];
        },
        label: function (tooltipItem, data) {
            selectedColor = data['datasets'][0]['backgroundColor'][tooltipItem['index']];
            console.log(selectedColor);
            return ' Count: ' + data['datasets'][0]['data'][tooltipItem['index']];
        },
        afterLabel: function (tooltipItem, data) {
            let dataset = data['datasets'][0];
            let dataMeta = dataset._meta;
            let percent = Math.round((dataset['data'][tooltipItem['index']] / dataMeta[Object.keys(dataMeta)].total) * 100).toFixed(1);
            return ' (' + percent + '%)';
        }
    },
    backgroundColor: '#fafaf5',
    borderColor: selectedColor,
    borderWidth: 1.5,
    titleFontSize: 16,
    titleFontColor: '#0066ff',
    bodyFontColor: '#000',
    bodyFontSize: 14,
    displayColors: true
};

export default {
    components: {
    },
    extends: Doughnut,
    props: {
        chartData: {
            type: Object,
            default: null
        },
        options: {
            type: Object,
            default: null
        }
    },
    data () {
        return {
        };
    },
    mounted () {
        if (this.options.hasOwnProperty('tooltipUseYN')) {
            if (this.options['tooltipUseYN'] === 1) {
                this.options['tooltips'] = toolTipsOptionSVG;
            } else if (this.options['tooltipUseYN'] === 2) {
                this.options['tooltips'] = tooltipsCallback;
            }
        }
        this.renderChart(this.chartData, this.options);
    }

};
</script>
