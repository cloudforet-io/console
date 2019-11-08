<template>
    <div class="hs-chart-container">
        <p-chart-d3 ref="chart" v-bind="$props"
                    :data="[]"
                    :options="chartOptions"
                    :min-height="yScaleHeight"
                    :max-height="yScaleHeight"
        />
        <div v-for="(d, i) in data" :key="i" class="legend-container">
            <div v-for="(key, idx) in keys" :key="key" class="legend">
                <span class="circle" :style="{
                    backgroundColor: colorset[idx]
                }"
                />
                <span class="key">{{ key }}</span>
                <span class="value">{{ d[key] }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import * as d3 from 'd3';
import PChartD3 from '@/components/molecules/charts/ChartD3';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from '@/components/molecules/charts/ChartD3.map';
import { HORIZONTAL_STACK_OPTIONS } from './HorizontalStackBarChartD3.map';

export default {
    name: 'PHorizontalStackBarChartD3',
    components: { PChartD3 },
    extends: PChartD3,
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        data: {
            type: Array,
            required: true,
            validator(data) {
                return data.every(d => Object.values(d).every(v => typeof v === 'number'));
            },
        },
        minWidth: {
            type: Number,
            default: 200,
        },
    },
    data() {
        return {
            barGroup: null,
            keyGroup: null,
            barRects: null,
            labels: null,
            colorset: PRIMARY_COLORSET,
        };
    },
    computed: {
        chartOptions() {
            return this._.merge({}, DEFAULT_OPTIONS, HORIZONTAL_STACK_OPTIONS, this.options);
        },
        keys() {
            return this.data[0] ? Object.keys(this.data[0]) : [];
        },
        sumList() {
            return this.data.map(d => d3.sum(Object.values(d)));
        },
        max() {
            return d3.max(this.sumList);
        },
        svgContainerRef() {
            return this.$refs.chart.$refs.svgContainer;
        },
        svgRef() {
            return this.$refs.chart.$refs.svg;
        },
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
            this.yScaleHeight = this.data.length * this.chartOptions.bars.thickness;
            this.yScale = d3.scaleLinear()
                .rangeRound([0, this.yScaleHeight])
                .domain([0, this.data.length]);
        },
        /**
         * @override
         */
        appendChartElements() {
            this.appendBarGroup();
            this.appendBars();
            this.appendLabels();
        },
        appendBarGroup() {
            const colors = d3.scaleOrdinal().range(PRIMARY_COLORSET);
            this.barGroup = this.svg.selectAll('.horizontal-stack-bar-g')
                .data(d3.stack().keys(this.keys)(this.data))
                .enter()
                .append('g')
                .attr('class', 'horizontal-stack-bar-g')
                .attr('data-key', (d) => {
                    d.forEach((arr) => { arr.key = d.key; });
                    return d.key;
                })
                .style('fill', (d, i) => colors(i));
        },
        appendBars() {
            this.keyGroup = this.barGroup.selectAll('g').data(d => d).enter();

            this.barRects = this.keyGroup.append('rect')
                .attr('x', d => this.xScale(d[0]))
                .attr('y', (d, i) => this.yScale(i))
                .attr('width', d => this.xScale(d[1] - d[0]))
                .attr('height', this.chartOptions.bars.thickness)
                .attr('class', 'bar');
        },
        appendLabels() {
            this.labels = this.keyGroup.append('text')
                .attr('class', 'percent-label')
                .text((d, i) => `${Math.round(d.data[d.key] / this.sumList[i] * 100)}%`)
                .attr('x', d => this.xScale((d[0] + d[1]) / 2))
                .attr('y', (d, i) => this.yScale(i + 0.5))
                .attr('dominant-baseline', 'middle')
                .attr('text-anchor', 'middle')
                .style('display', (d, i, el) => (el[i].getBBox().width < this.xScale(d[1] - d[0]) ? 'block' : 'none'));
        },
        /**
         * @override
         */
        resizeElements() {
            this.initXScale();
            this.barRects.attr('width', d => this.xScale(d[1] - d[0]))
                .attr('x', d => this.xScale(d[0]));
            this.labels.attr('x', d => this.xScale((d[0] + d[1]) / 2))
                .style('display', (d, i, el) => (el[i].getBBox().width < this.xScale(d[1] - d[0]) ? 'block' : 'none'));
        },
    },
};
</script>

<style lang="scss">
    .horizontal-stack-bar-g {
        .percent-label {
            font-size: 14px;
            fill: $white;
        }
    }
</style>

<style lang="scss" scoped>
    .legend-container {
        display: flex;
        flex-wrap: wrap;
        .legend {
            padding-top: 16px;
            padding-right: 32px;
            vertical-align: middle;
            .circle {
                display: inline-block;
                height: 12px;
                width: 12px;
                border-radius: 50%;
            }
            .key {
                padding-left: 8px;
                font-size: 14px;
            }
            .value {
                padding-left: 8px;
                font-size: 14px;
                font-weight: bold;
            }
        }
    }
</style>
