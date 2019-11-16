<script>
import * as d3 from 'd3';
import PChartD3 from '@/components/molecules/charts/Chart';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from '@/components/molecules/charts/Chart.map';
import { DONUT_OPTIONS } from './DonutChart.map';

export default {
    name: 'DonutChart',
    extends: PChartD3,
    props: {
        options: {
            type: Object,
            default: () => ({}),
        },
        minHeight: {
            type: Number,
            default: 200,
        },
        minWidth: {
            type: Number,
            default: 200,
        },
    },
    data() {
        return {
            pathGroup: null,
            arc: null,
            colorset: PRIMARY_COLORSET,
        };
    },
    computed: {
        chartOptions() {
            return this._.merge({}, DEFAULT_OPTIONS, DONUT_OPTIONS, this.options);
        },
        outerRadius() {
            return Math.min(this.minHeight, this.minWidth) / 2;
        },
        innerRadius() {
            return this.outerRadius - this.chartOptions.donut.thickness;
        },
    },
    methods: {
        /**
             * @override
             */
        appendChartElements() {
            const colors = d3.scaleOrdinal().range(PRIMARY_COLORSET);

            const pieData = d3.pie().value(d => d.value).sort(null)(this.data);

            this.arc = d3.arc()
                .innerRadius(this.outerRadius)
                .outerRadius(this.innerRadius > 0 ? this.innerRadius : 0);

            this.svg
                .attr('class', 'donut-g')
                .attr('transform', `translate(${this.minWidth / 2}, ${this.minHeight / 2})`);

            this.pathGroup = this.svg.selectAll('g').data(pieData).enter()
                .append('g')
                .attr('fill', (d, i) => colors(i));

            this.pathGroup.append('path')
                .attr('d', this.arc)
                .on('mouseenter', this.onMouseenter)
                .on('mouseleave', this.onMouseleave);

            this.pathGroup.append('circle')
                .attr('cx', d => Math.round(this.arc.centroid(d)[0]))
                .attr('cy', d => Math.round(this.arc.centroid(d)[1]));
        },
        onMouseenter(data, idx, paths) {
            this.appendTooltips(data.data, idx, paths[idx].parentElement.lastElementChild, {
                color: PRIMARY_COLORSET[idx],
                trigger: 'manual',
            });
            this.tooltipEls[data.data.key].toggle();

            this.pathGroup.style('opacity', (d, i) => (i === idx ? 1.0 : 0.3));
        },
        onMouseleave(data) {
            this.tooltipEls[data.data.key].hide();
            this.pathGroup.style('opacity', () => (1.0));
        },

    },
};
</script>

<style lang="scss">
</style>
