<template>
    <div class="mt-4">
        <div v-for="(color, index) in scheduleHeatMapColor" :key="index">
            <span v-for="(num, index) in 7">
                <span class="circle inline-block" :class="`${color[index]}`" />
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { map } from 'lodash';

interface ScheduleType {
    name: string;
    rule: {
        MON: number[];
        TUE: number[];
        WED: number[];
        THU: number[];
        FRI: number[];
        SAT: number[];
        SUN: number[];
    };
}

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
            case (length === 0):
                color = 'bg-white';
                break;
            case (length < 7):
                color = 'bg-primary2';
                break;
            case (length < 13):
                color = 'bg-primary1';
                break;
            case (length < 19):
                color = 'bg-primary';
                break;
            case (length < 25):
                color = 'bg-primary-dark';
                break;
            default:
                color = 'bg-white';
                break;
            }
            return color;
        };

        let scheduleHeatMapColor: string[][] = [];

        if (props.schedule.length > 0) {
            map(props.schedule, (sd) => {
                const dailyHeatMapColor: string[] = map(sd.rule, (day: number[]) => getHeatMapColor(day.length));
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
        border-radius: 50%;
        margin-left: 0.5rem;
        margin-top: 0.5rem;
    }
</style>
