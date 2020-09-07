<template>
    <div class="flex flex-col">
        <div v-for="(color, index) in scheduleHeatMapColor" :key="index">
            <div>
                <span v-for="(num, index) in 7">
                    <span class="circle inline-block" :class="`${color[index]}`" />
                </span>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { map } from 'lodash';

    interface ScheduleType {
        name: string;
        scheduleRule: {
            rule: {
                MON: number[];
                TUE: number[];
                WED: number[];
                THU: number[];
                FRI: number[];
                SAT: number[];
                SUN: number[];
            };
        };
    }
export default {
    name: 'ScheduleHeatmap',
    props: {

    },
    setup(props, context) {
        const schedule: ScheduleType[] = [
            {
                name: 'schedule1',
                scheduleRule: {
                    rule: {
                        MON: [1, 2, 3, 4],
                        TUE: [1, 2, 3, 4, 6, 7],
                        WED: [1, 2, 3, 4, 13, 14, 15],
                        THU: [1, 2],
                        FRI: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        SAT: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21, 22, 23],
                        SUN: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                    },
                },
            },
            {
                name: 'schedule2',
                scheduleRule: {
                    rule: {
                        MON: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17],
                        TUE: [5, 6, 7],
                        WED: [1, 2, 3, 4, 13, 14, 15],
                        THU: [1],
                        FRI: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
                        SAT: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 20, 21, 22, 23, 24],
                        SUN: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
                    },
                },
            },
        ];


        const getHeatMapColor = (length: number) => {
            let color = '';
            switch (true) {
            case (length < 4):
                color = 'bg-gray-100';
                break;
            case (length < 8):
                color = 'bg-primary2';
                break;
            case (length < 12):
                color = 'bg-primary1';
                break;
            case (length < 16):
                color = 'bg-primary';
                break;
            case (length < 20):
                color = 'bg-primary-dark';
                break;
            case (length < 24):
                color = 'bg-primary-dark';
                break;
            default:
                color = 'bg-white';
                break;
            }
            return color;
        };

        const scheduleHeatMapColor: string[][] = [];
        map(schedule, (sd: ScheduleType) => {
            const dailyHeatMapColor: string[] = map(sd.scheduleRule.rule, (day: number[]) => getHeatMapColor(day.length));
            scheduleHeatMapColor.push(dailyHeatMapColor);
        });

        console.debug(scheduleHeatMapColor)


        return {
            scheduleHeatMapColor,
        };
    },
};
</script>

<style lang="postcss" scoped>
    .circle {
        width: 0.625rem;
        height: 0.625rem;
        border-radius: 50%;
        opacity: 0.5;
        margin-right: 0.63em;
    }
</style>
