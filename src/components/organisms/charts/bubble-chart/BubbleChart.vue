<script>
import * as d3 from 'd3';
import temp from './countries.json';
import PChartD3 from '@/components/molecules/charts/ChartD3';
import { DEFAULT_OPTIONS, PRIMARY_COLORSET } from '@/components/molecules/charts/ChartD3.map';
import { BUBBLE_OPTIONS } from './BubbleChart.map';

export default {
    name: 'BubbleChart',
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
            default: 500,
        },
    },
    computed: {
        chartOptions() {
            return this._.merge({}, DEFAULT_OPTIONS, BUBBLE_OPTIONS, this.options);
        },
    },
    methods: {
        /**
         * @override
         */
        appendChartElements() {
            const features = [];
            console.dir(temp);
            // temp.forEach((collection) => {
            //     features.push(collection.features[0]);
            // });
            //
            const obj = temp; // { type: 'Topology', features };

            const xy = d3.geoEquirectangular().fitSize([this.minWidth, this.minHeight], obj);// .scale(50);
            const path = d3.geoPath().projection(xy);

            const states = this.svg.append('svg:g')
            // .attr('transform', 'translate(-225, -150)')
                .attr('id', 'states');

            console.dir(features);
            states.selectAll('path').data(obj.features)
                .enter().append('svg:path')
                .attr('d', path)
                .attr('stroke', 'red');

            // this.$http.get('geojson/countries.json').then((res) => {
            //     console.log(res);
            // });
            // this.svg.data().enter().append('path').attr('d', path);
            // this.svg.selectAll('circle').data()
        },
    },
};
</script>

<style lang="scss" scoped>

</style>
