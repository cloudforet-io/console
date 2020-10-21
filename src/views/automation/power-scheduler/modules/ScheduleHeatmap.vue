<template>
    <div class="mt-4">
        <div v-for="(color, index) in scheduleHeatMapColor" :key="index">
            <span v-for="(num, index) in 7" :key="num">
                <span class="circle inline-block" :class="`${color[index]}`" />
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { map } from 'lodash';

export default {
    name: 'ScheduleHeatmap',
    props: {
        schedule: {
            type: Array,
            default: () => [],
        },
    },
    setup(props, context) {
        const getHeatMapColor = (length: number) => {
            let color = '';
            switch (true) {
            // case (length === 0):
            //     color = 'bg-gray-200';
            //     break;
            // case (length < 7):
            //     color = 'bg-primary2 opacity-50';
            //     break;
            // case (length < 13):
            //     color = 'bg-primary2';
            //     break;
            // case (length < 19):
            //     color = 'bg-primary1';
            //     break;
            // case (length < 24):
            //     color = 'bg-primary';
            //     break;
            // case (length === 24):
            //     color = 'bg-primary-dark';
            //     break;
            case (length === 0):
                color = 'bg-gray-200';
                break;
            case (length < 13):
                color = 'bg-primary2';
                break;
            case (length <= 24):
                color = 'bg-primary-dark';
                break;
            default:
                color = 'bg-gray-200';
                break;
            }
            return color;
        };

        let scheduleHeatMapColor: string[][] = [];

        if (props.schedule.length > 0) {
            map(props.schedule, (sd) => {
                const dailyHeatMapColor: string[] = map(sd.rule, d => getHeatMapColor(d.times.length));
                scheduleHeatMapColor.push(dailyHeatMapColor);
            });
        } else {
            scheduleHeatMapColor = [];
        }

        return {
            scheduleHeatMapColor,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .circle {
        width: 0.5rem;
        height: 0.5rem;
        border-radius: 0.125rem;
        margin-left: 0.5rem;
        margin-top: 0.5rem;
    }
</style>
