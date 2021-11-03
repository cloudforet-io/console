<template>
    <div class="mt-4">
        <div v-for="(color, index) in scheduleHeatMapColor" :key="index" class="heatmap-line">
            <span v-for="(num, idx) in 7" :key="num">
                <span class="circle inline-block" :class="`${color[idx]}`" />
            </span>
        </div>
    </div>
</template>

<script lang="ts">
import { map } from 'lodash';
import { changeTimezoneToLocal } from '@/services/automation/power-scheduler/lib/util';
import { RULE_TYPE } from '@/services/automation/power-scheduler/type';
import { computed, reactive, toRefs } from '@vue/composition-api';
import { store } from '@/store';

export default {
    name: 'ScheduleHeatmap',
    props: {
        schedule: {
            type: Array,
            default: () => [],
        },
    },
    setup(props) {
        const state = reactive({
            timezone: computed(() => (store.state.user.timezone ? store.state.user.timezone : 'UTC')),
        });
        const getHeatMapColor = (length: number) => {
            let color = '';
            switch (true) {
            case (!length || length === 0):
                color = 'bg-gray-300';
                break;
            case (length < 13):
                color = 'bg-primary1';
                break;
            case (length <= 24):
                color = 'bg-primary-dark';
                break;
            default:
                color = 'bg-gray-300';
                break;
            }
            return color;
        };

        let scheduleHeatMapColor: string[][] = [];

        const weekdays = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
        if (props.schedule.length > 0) {
            map(props.schedule, (sd) => {
                const scheduleRuleWithTimezone = changeTimezoneToLocal(sd.rule, RULE_TYPE.routine, state.timezone);
                const ruleObjForSorting = {};
                scheduleRuleWithTimezone.forEach((r) => {
                    ruleObjForSorting[r.day] = r.times;
                });
                const sortedRule = weekdays.map(w => ruleObjForSorting[w]);
                const dailyHeatMapColor: string[] = map(sortedRule, d => getHeatMapColor(d?.length));
                scheduleHeatMapColor.push(dailyHeatMapColor);
            });
        } else {
            scheduleHeatMapColor = [];
        }

        return {
            ...toRefs(state),
            scheduleHeatMapColor,
        };
    },
};
</script>

<style lang="postcss" scoped>
.heatmap-line {
    line-height: 1.2;
}
.circle {
    @apply rounded-sm;
    width: 0.5rem;
    height: 0.5rem;
    margin-left: 0.5rem;
    margin-top: 0.5rem;
}
</style>
