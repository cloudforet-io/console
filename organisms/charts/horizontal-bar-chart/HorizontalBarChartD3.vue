<script>
import * as d3 from 'd3';
import PChartD3 from '@/components/molecules/charts/ChartD3';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from '@/components/molecules/charts/ChartD3.map';
import { HORIZONTAL_OPTIONS } from './HorizontalBarChartD3.map';

export default {
    name: 'PHorizontalBarChart',
    events: ['click'],
    extends: PChartD3,
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
    },
    data() {
        return {
            barGroup: null,
        };
    },
    computed: {
        chartOptions() {
            return this._.merge({}, DEFAULT_OPTIONS, HORIZONTAL_OPTIONS, this.options);
        },
        max() { return d3.max(this.data, d => d.value); },
        textPadTop() { return this.chartOptions.labels.padTop; },
        textPadBottom() { return this.chartOptions.labels.padBottom; },
        textHeight() { return this.chartOptions.labels.textHeight; },
        barWidth() { return this.chartOptions.bars.thickness; },
        barPosY() { return this.textHeight + this.textPadTop + this.textPadBottom; },
        round() { return this.barWidth / 2; },
    },
    methods: {
        /**
         * @override
         */
        initXScale() {
            this.xScale = d3.scaleLinear()
                .range([0, this.xScaleWidth])
                .domain([0, this.max]);
        },
        /**
         * @override
         */
        initYScale() {
            const bandWidth = this.textHeight + this.textPadTop + this.textPadBottom + this.barWidth;
            this.yScaleHeight = this.data.length * bandWidth;
            this.yScale = d3.scaleBand()
                .range([0, this.yScaleHeight])
                .domain(this.data.map(d => d.key));
        },
        /**
         * @override
         */
        appendChartElements() {
            this.appendBarGroup();
            this.appendLabels();
            if (this.chartOptions.bars.backBar.display) this.appendBackBars();
            this.appendBars();
        },

        appendBarGroup() {
            this.barGroup = this.svg.selectAll('.horizontal-bar-g').data(this.data)
                .enter().append('g')
                .attr('class', 'horizontal-bar-g');
        },
        appendLabels() {
            // append key labels
            this.barGroup.append('text')
                .attr('class', 'key-label')
                .attr('dominant-baseline', 'hanging')
                .text(d => d.key)
                .attr('y', d => this.yScale(d.key) + this.textPadTop);

            // append value labels
            this.barGroup.append('text')
                .attr('class', 'value-label')
                .attr('dominant-baseline', 'hanging')
                .attr('text-anchor', 'end')
                .attr('x', () => this.xScale(this.max))
                .text(d => d.value)
                .attr('y', d => this.yScale(d.key) + this.textPadTop)
                .on('click', this.onClickValue);
        },
        appendBackBars() {
            const backBars = this.barGroup.append('rect')
                .attr('class', 'back-bar')
                .attr('rx', this.round)
                .attr('ry', this.round)
                .attr('x', 0)
                .attr('y', d => this.yScale(d.key) + this.barPosY)
                .attr('height', this.barWidth)
                .attr('width', () => this.xScale(this.max));

            // apply styles to background bars
            this._.forIn(this.chartOptions.bars.backBar.styles, (val, key) => {
                backBars.style(key, val);
            });
        },
        appendBars() {
            const bars = this.barGroup.append('rect')
                .attr('class', 'bar')
                .attr('rx', this.round)
                .attr('ry', this.round)
                .attr('y', d => this.yScale(d.key) + this.barPosY)
                .attr('height', this.barWidth)
                .attr('width', d => this.xScale(d.value))
                .on('mouseover', this.onMouseover)
                .on('mouseout', this.onMouseout);

            // apply custom styles to bars
            this._.forIn(this.chartOptions.bars.styles, (val, key) => {
                bars.style(key, val);
            });
        },
        onMouseover(data, idx, bars) {
            d3.select(bars[idx].parentElement).classed('hover', true);
        },
        onMouseout(data, idx, bars) {
            d3.select(bars[idx].parentElement).classed('hover', false);
        },
        onClickValue(data, idx, valueLabels) {
            this.$emit('click', data, idx, valueLabels);
        },
    },
};
</script>

<style lang="scss">
    .horizontal-bar-g {
        .key-label {
            fill: $dark;
            font-size: 12px;
        }
        .value-label {
            fill: $dark;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
        }
        .bar {
            fill: $primary1;
        }
        .back-bar {
            fill: $primary3;
        }
        &.hover {
            .key-label {
                fill: $primary-dark;
            }
            .bar {
                fill: $primary-dark;
            }
        }
    }
</style>
